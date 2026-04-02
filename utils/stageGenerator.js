// ── Image data — single consolidated file per level ──────────────────────
const HSK1_IMAGES = require('../data/hsk1/hsk1_images/hsk1_images.json');

const _imageCache = {};
function getImageData(lessonNumber) {
  const key = lessonNumber || 5;
  if (!_imageCache[key]) {
    try {
      _imageCache[key] = HSK1_IMAGES.lessons?.[String(key)]?.vocab_images || {};
    } catch {
      _imageCache[key] = {};
    }
  }
  return _imageCache[key];
}

// ── Image exercise factories ──────────────────────────────────────────────
// Returns one "image" entry for a vocab word (picks by imageIndex for variety)
function pickImage(chinese, lessonNumber, imageIndex = 0) {
  const imgData = getImageData(lessonNumber);
  const entry = imgData[chinese];
  if (!entry || !entry.images || entry.images.length === 0) return null;
  const img = entry.images[imageIndex % entry.images.length];
  return { ...img, color: entry.color };
}

function pickRandomImage(chinese, lessonNumber) {
  const imgData = getImageData(lessonNumber);
  const entry = imgData[chinese];
  if (!entry || !entry.images || entry.images.length === 0) return null;
  const img = entry.images[Math.floor(Math.random() * entry.images.length)];
  return { ...img, color: entry.color };
}

function makeImageToWord(vocabItem, allVocab, lessonNumber, imageIndex = 0) {
  const image = pickImage(vocabItem.chinese, lessonNumber, imageIndex);
  if (!image) return makeFlashcard(vocabItem); // fallback
  const distractors = pickDistractors(vocabItem.id, allVocab, 3);
  return {
    type: 'image_exercise',
    subtype: 'picture_to_word',
    image,
    correct: vocabItem.chinese,
    choices: shuffle([
      { chinese: vocabItem.chinese, pinyin: vocabItem.pinyin || '', english: vocabItem.english },
      ...distractors.map(d => ({ chinese: d.chinese, pinyin: d.pinyin || '', english: d.english })),
    ]),
  };
}

function makeWordToImage(vocabItem, allVocab, lessonNumber, imageIndex = 0) {
  const correctImg = pickImage(vocabItem.chinese, lessonNumber, imageIndex);
  if (!correctImg) return makeFlashcard(vocabItem); // fallback
  const distractors = pickDistractors(vocabItem.id, allVocab, 3);
  const distractorImgs = distractors
    .map(d => { const img = pickRandomImage(d.chinese, lessonNumber); return img ? { ...img, isCorrect: false } : null; })
    .filter(Boolean);
  if (distractorImgs.length < 3) return makeFlashcard(vocabItem);
  return {
    type: 'image_exercise',
    subtype: 'word_to_picture',
    chinese: vocabItem.chinese,
    pinyin: vocabItem.pinyin || '',
    english: vocabItem.english,
    choices: shuffle([
      { ...correctImg, isCorrect: true },
      ...distractorImgs,
    ]),
  };
}

function makeSentenceToImage(sentence, keyVocabItem, allVocab, lessonNumber) {
  const correctImg = pickRandomImage(keyVocabItem.chinese, lessonNumber);
  if (!correctImg) return makeFillBlank(sentence, allVocab) || makeFlashcard(keyVocabItem);
  const distractors = pickDistractors(keyVocabItem.id, allVocab, 3);
  const distractorImgs = distractors
    .map(d => { const img = pickRandomImage(d.chinese, lessonNumber); return img ? { ...img, isCorrect: false } : null; })
    .filter(Boolean);
  if (distractorImgs.length < 3) return makeFillBlank(sentence, allVocab) || makeFlashcard(keyVocabItem);
  return {
    type: 'image_exercise',
    subtype: 'sentence_to_picture',
    chinese: sentence.chinese,
    pinyin: sentence.pinyin || '',
    english: sentence.english || '',
    choices: shuffle([{ ...correctImg, isCorrect: true }, ...distractorImgs]),
  };
}

function makeListenToImage(vocabItem, allVocab, lessonNumber, imageIndex = 0) {
  const base = makeWordToImage(vocabItem, allVocab, lessonNumber, imageIndex);
  if (base.type !== 'image_exercise') return base;
  return { ...base, subtype: 'listen_to_picture' };
}

// ── Supplemental word list ────────────────────────────────────────────────
// Words that must always be kept as a unit during tokenization even when they
// are not in the lesson's own vocabulary.  Sorted longest-first so that
// three-character entries (来不及, 来得及 …) are tried before two-character
// sub-strings (来, 不 …).
const SUPPLEMENT_WORDS = [
  // 4-char / multi-char compounds
  '来不及','来得及','相比之下','总的来说','说得对了','不得了','了不起',
  '差不多','没关系','没问题','不一定','不知道','不应该','不可以','不需要',
  '城市化','什么时候','这个时候','那个时候',
  // 3-char compounds
  '不得不','不仅仅','不仅是','越来越','找不到','拿不到','看不到','听不到',
  '做不到','走不了','每个人','体育馆','博物馆','图书馆','大使馆','公交车',
  '出租车','运动员','售货员','奖学金','免疫力','幸福感','意志力','矿泉水',
  '登机牌','基本上','说得对',
  // Conjunctions & connectives
  '不仅','不但','而且','虽然','但是','因为','所以','如果','因此',
  '即使','尽管','随着','由于','通过','既然','否则','然而','不过',
  '况且','何况','甚至','反而','其实','事实','总之','总的','毕竟',
  '除非','只要','只有','无论','不管','相反','然后','最后','最终',
  '什么','怎么','怎么样','高兴','细节','进程','加快','关掉','忘记',
  '哪些','这里','那里','那么','这么','为什么','哪儿','还有','还是',
  '东西','顺便','拿走','带走','带来','拿来','放在','记得','放好',
  // Common adverbs / modal verbs
  '已经','刚才','马上','立刻','突然','仍然','依然','竟然','居然',
  '果然','当然','确实','真正','真的','几乎','大约','大概','可能','也许',
  '应该','需要','可以','能够','必须','愿意','打算','计划','希望',
  '一定','一直','一共','一起','一边','一方面','明白','是否','认真',
  '困难','激烈','着急','方便','不错','不同','不再','不够','好多',
  '很多','值得','周末','好听','好看','好吃','他们','她们','我们','你们',
  '宝贵','往往','忽然','确实',
  // Common verbs
  '觉得','认为','知道','发现','相信','担心','害怕','决定','选择',
  '继续','开始','结束','完成','实现','达到','满足','超过','减少',
  '增加','提高','改变','发展','解决','处理','分析','研究','管理',
  '控制','保持','保证','负责','注意','了解','关心','支持','帮助',
  '参加','提供','建议','检查','安排','准备','推迟','取消','举办',
  '进行','影响','联系','表示','表达','翻译','解释','说明','描述',
  '喜欢','谢谢','遇到','进入','加入','争取','取得','记得','记住',
  '变化','变成','申请','相比','接受','坚持','放弃','成功',
  '失败','努力','获得','保护','利用','培养','提出','形成','造成',
  '关上','关门','关灯','打开','走进','走出','搬进','搬出','走错',
  '吸引','告诉','听说','欣赏','认识','讨论','训练','记录','评论',
  '道歉','邀请','重视','违法','迷路','散步','起床','睡觉','读书',
  '说话','走路','看见','感动','感谢','合作','结婚','毕业','招聘',
  '拥挤','发生','发音','减肥','克服','判断','到处','勇敢','包容',
  // Common nouns
  '老师','城市','每天','才能','产品','文化','道理','心情','印象',
  '小时','外面','家里','方面','地方','学期','书包','钥匙','钱包',
  '护照','证件','报告','资料','建筑','药店','环保','收入','以来',
  '去年','今年','明年','每年','这次','那次','之后','之前','这样',
  '那样','这些','那些','这个','那个','哪里','哪个','每个','每次',
  '成绩','进步','成长','成就','声音','复习','历史','数学','科目',
  '时候','时间','明天','昨天','星期','早上','晚上','中午','上午','下午',
  '朋友','同事','同学','家人','哥哥','姐姐','弟弟','妹妹','妈妈','爸爸',
  '老板','医生','医院','护士','律师','教授','教练','导游','记者',
  '学校','学生','教育','课程','语言','语法','词语','词汇','汉语','汉字',
  '电影','电脑','电视','手机','软件','网络','视频','音乐','艺术',
  '节日','节奏','节约','比赛','运动','赛场','冠军','奖金',
  '旅游','签证','航班','飞机','机场','地铁','交通','超市',
  '餐厅','饭馆','饮料','食材','水果','苹果','米饭','面条','牛奶','咖啡',
  '衣服','颜色','漂亮','礼物','礼貌','杯子','桌子','椅子','窗户','空调',
  '天气','气候','温度','阳光','海洋','森林','植物','环境',
  '健康','身体','生病','医疗','治疗','手术','药物','症状','皮肤','咳嗽',
  '压力','情况','感觉','感情','爱情','爱好','幸福','快乐','开心',
  '理想','理解','梦想','意思','道理','价值','精神','文明','传统',
  '社会','经济','政治','法律','法院','权利','责任','义务','规则',
  '竞争','挑战','机会','成功','失败','奋斗','努力','坚强',
  '经验','知识','技术','能力','专业','材料','数据','信息','品牌',
  '市场','企业','公司','利润','投资','合同','合格','合适',
  '语言','文化','民族','传统','习俗','艺术','音乐','京剧','雕塑',
  '展览','创作','作品','表演','演出','演员','节目',
  '词语','母语','外语','方言','口音','口味','发音',
  '科学','科技','人生','阶段','童年','青春','成熟',
  '目的','理想','矛盾','代沟','和睦','误会','矛盾',
  '诚实','尊重','包容','善良','友好','友谊','信任','信心',
  '积极','认真','耐心','细心','自信','自豪','骄傲','勇敢','乐观',
  '谦虚','幽默','活泼','聪明','厉害','优点','缺点','特色','风格',
  '便宜','价格','折扣','打折','免费','付款','销售','顾客','品牌',
  '旁边','左边','右边','附近','这儿','那儿','哪儿',
  '策略','规划','计划','总结','详细','分钟','星期','第一',
  // Common compound nouns (2-char from vocab)
  '项目','员工','合理','赚钱','打针','工作','学习','上学',
  '生活','锻炼','休息','旅行','购物','做饭','打扫','洗衣',
  '上班','下班','上课','下课','回家','出门','出发','到达','离开',
  '方法','方式','效果','条件','要求','标准','质量','内容','关系',
  '态度','习惯','能力','机会','目标','未来','过去',
  '现在','以前','以后','刚刚','总是','经常','偶尔','从来','永远',
  '完全','基本','一般','特别','非常','十分','相当','比较','有点',
  '一些','有些','各种','所有','全部','部分','许多','大量','少量',
  '更加','另外','此外','其中','其他',
  '以及','并且','或者','还是','就是','不是','正是','都是',
  '互相','彼此','自己','自然','当时','同时','经过','通过','关于',
  '对于','根据','按照','除了','包括','比如','例如','尤其','特别',
  '主要','重要','必要','实际','真实','直接','间接',
  '北京','中国','国际','社区','超市','医院','机场','公司',
  '人生','功夫','平时','幸福','热情','回忆','奋斗','珍惜','分手',
  '回去','出去','进来','出来','回来','起来','过来','下载',
  '堵车','坚强','散步','活动','活泼','流利','浪漫','浪费','污染',
  '绿化','环保','节约','节食','营养','菜肴','烹饪','调味','食谱',
  '符合','笔记','聊天','阅读','杂志','邻居','闲事','随手','随便',
  '降低','降落','更新','最近','期间','材料','积累',
  // Animals, body parts, common concrete nouns
  '动物','昆虫','鸟类','鱼类','兽类','爬虫','哺乳','家禽','野生',
  '头发','眼睛','耳朵','嘴巴','鼻子','手腕','手指','脚趾','脖子','肚子',
  // People / groups
  '人们','人民','人类','大人','小孩','儿童','青年','老人','妇女','男人','女人',
  '大家','各位','他人','本人','本身','自身','对方','双方','一方','另一方',
  // Location / directional compounds
  '深处','远处','近处','高处','低处','上面','下面','前面','后面','里面','外面',
  '中间','之间','当中','其中','附近','周围','四周','各地','各处','到处',
  // People names (recurring characters in lessons)
  '大明','小红','小刚','小明','王明','李华',
  // Nature, environment & weather
  '蓝天','白云','大地','天空','气温','大气','土地','山川','河流',
  '草原','草地','沙漠','冰雪','彩虹','暴雨','洪水','台风','地震',
  '海拔','湖泊','峡谷','平原','丘陵','岛屿','湿地','冻土',
  // Adjectives — state / quality
  '适宜','充足','充分','严重','干净','整洁','干燥','潮湿','凉爽','炎热',
  '寒冷','明亮','清晰','清楚','宽阔','遥远','美丽','优美','茂盛',
  '丰富','复杂','简单','新颖','独特','典型','先进','落后','严格',
  '模糊','完整','整齐','新鲜','正确','错误','合法','违法','公平',
  '安全','危险','轻松','紧张','愉快','悲伤','难过','生气','担心',
  // Verbs — environment / society / process
  '改善','增强','减弱','维持','维护','破坏','恢复','重建','保障',
  '逐渐','逐步','不断','渐渐','慢慢','迅速','快速','缓慢',
  '促进','推动','实施','执行','完善','开展','加强','加深','扩大',
  '缩小','消除','避免','预防','减轻','加重','克服','应对',
  '升高','升温','降温','高温','低温','变黄','变绿','变红','变白','变暗',
  '变大','变小','变多','变少','变强','变弱','变好','变坏','变快','变慢',
  '意识','认识','了解','掌握','运用','发挥','体现','反映','表现',
  '参与','承担','履行','遵守','违反','执行','监督','管理',
  // Nouns — society / concepts
  '意义','作用','结果','原因','现象','规律','程度','步骤','过程',
  '方向','方案','目标','任务','计划','策略','措施','方针','政策',
  '季节','冬天','夏天','春天','秋天','冬季','夏季','春季','秋季',
  '公民','居民','市民','村民','百姓','工人','农民','士兵',
  '水分','植被','资源','能源','矿产','粮食','物资','产量',
  '进展','状态','局面','形势','趋势','变化','差异','联系',
  '因素','影响','条件','基础','规模','范围','比例','数量',
  '种类','类型','方式','手段','途径','渠道','模式','体系','制度',
  // Common VO phrases
  '看电影','看电视','看书','看报','看病','看新闻','看比赛',
  '吃早饭','吃午饭','吃晚饭','吃早餐','吃午餐','吃晚餐','吃药','吃饺子',
  '喝水','喝茶','喝酒','喝咖啡','喝饮料','喝果汁',
  '打篮球','打排球','打网球','打乒乓球','打太极','打球',
  '踢足球','踢球',
  '骑车','骑自行车',
  '买东西','买菜','买票','买水果',
  '发邮件','发消息','发短信',
  '做作业','做运动','做游戏',
  '去公园','去超市','去医院','去图书馆','去机场','去车站','去餐厅',
  // 3-char noun / adj compounds
  '咖啡店','咖啡馆','便利店',
  '年轻人','老年人','中年人',
  '好习惯','坏习惯','好主意',
  '有活力','有意思','有意义','有经验',
  '保护环境',
  '新年好','生日快乐',
].sort((a, b) => b.length - a.length);

// Characters that must remain as single-character tokens even when unmatched.
// Only pronouns, sentence-final particles, structural particles, and single-char
// prepositions qualify. Everything else should be merged with adjacent singles.
const ALWAYS_SINGLE = new Set([
  // Pronouns
  '我','你','他','她','它','您','咱',
  // Sentence-final / modal particles
  '了','吗','呢','啊','吧','嘛','哦','哈','嗯',
  // Structural particles
  '的','地','得','着','过',
  // Single-char prepositions / coverbs
  '在','给','从','跟','把','被','对','向','往','用','比','以','于','替','和',
]);

// ── Tokenizer (same logic as SentenceBuilder) ───────────────────────────
function tokenizeSentence(chineseSentence, vocab) {
  if (!chineseSentence) return [];
  const knownWords = [
    ...SUPPLEMENT_WORDS,
    ...vocab.map(v => v.chinese).filter(Boolean),
  ].sort((a, b) => b.length - a.length);

  // Pass 1: greedy longest-match
  const raw = [];
  let i = 0;
  while (i < chineseSentence.length) {
    const ch = chineseSentence[i];
    if (ch === ' ' || ch === '　') { i++; continue; }
    if (ch === '，') { raw.push('，'); i++; continue; } // keep comma as its own tile
    if (/[\u3000-\u303f\uff00-\uffef，。！？、；：""''（）【】《》…—~·]/.test(ch)) {
      i++; continue;
    }
    let matched = false;
    for (const word of knownWords) {
      if (word.length > 1 && chineseSentence.startsWith(word, i)) {
        raw.push(word);
        i += word.length;
        matched = true;
        break;
      }
    }
    if (!matched) { raw.push(ch); i++; }
  }

  // Pass 2: merge consecutive non-functional single characters into words.
  // Any single char NOT in ALWAYS_SINGLE should not stand alone — group with
  // adjacent unknown singles to reconstruct the original multi-char word.
  const tokens = [];
  let buf = '';
  for (const t of raw) {
    if (t === '，') {
      if (buf) { tokens.push(buf); buf = ''; }
      tokens.push(t);
    } else if (t.length === 1 && !ALWAYS_SINGLE.has(t)) {
      buf += t;
    } else {
      if (buf) { tokens.push(buf); buf = ''; }
      tokens.push(t);
    }
  }
  if (buf) tokens.push(buf);

  return tokens;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickDistractors(correctId, allVocab, count = 3) {
  return shuffle(allVocab.filter(v => v.id !== correctId)).slice(0, count);
}

// Build a pinyin lookup map from vocab: { chineseWord: pinyin }
function buildPinyinMap(vocab) {
  const map = {};
  vocab.forEach(v => { if (v.chinese) map[v.chinese] = v.pinyin || ''; });
  return map;
}

// ── Pinyin exercise helpers ──────────────────────────────────────────────

const TONE_NUM = {
  'ā':1,'á':2,'ǎ':3,'à':4,
  'ē':1,'é':2,'ě':3,'è':4,
  'ī':1,'í':2,'ǐ':3,'ì':4,
  'ō':1,'ó':2,'ǒ':3,'ò':4,
  'ū':1,'ú':2,'ǔ':3,'ù':4,
  'ǖ':1,'ǘ':2,'ǚ':3,'ǜ':4,
};
const TONE_STRIP = {
  'ā':'a','á':'a','ǎ':'a','à':'a',
  'ē':'e','é':'e','ě':'e','è':'e',
  'ī':'i','í':'i','ǐ':'i','ì':'i',
  'ō':'o','ó':'o','ǒ':'o','ò':'o',
  'ū':'u','ú':'u','ǔ':'u','ù':'u',
  'ǖ':'u','ǘ':'u','ǚ':'u','ǜ':'u',
};
const TONE_LABELS = ['1st tone (ā)', '2nd tone (á)', '3rd tone (ǎ)', '4th tone (à)'];
const INITIALS_ORDERED = ['zh','ch','sh','b','p','m','f','d','t','n','l','g','k','h','j','q','x','r','z','c','s','y','w'];

function detectTone(syllable) {
  for (const ch of syllable) { if (TONE_NUM[ch]) return TONE_NUM[ch]; }
  return 0;
}

function stripTones(s) {
  return [...s].map(c => TONE_STRIP[c] ?? c).join('');
}

function extractInitial(syllable) {
  const base = stripTones(syllable.toLowerCase().split(' ')[0]);
  for (const init of INITIALS_ORDERED) {
    if (base.startsWith(init)) return init;
  }
  return null;
}

function extractFinal(syllable) {
  const base = stripTones(syllable.toLowerCase().split(' ')[0]);
  const init = extractInitial(syllable);
  if (!init) return base;
  return base.slice(init.length) || null;
}

// ── Pinyin exercise factories ─────────────────────────────────────────────

function makePinyinToneId(syllable, vocabItem = null) {
  const toneNum = detectTone(syllable);
  if (!toneNum) return null; // skip neutral / undetected
  return {
    type: 'pinyin_exercise',
    subtype: 'tone_id',
    syllable,
    chinese: vocabItem?.chinese ?? null,
    english: vocabItem?.english ?? null,
    correct: TONE_LABELS[toneNum - 1],
    choices: TONE_LABELS.slice(),
  };
}

function makePinyinInitialId(syllable, initialsPool, vocabItem = null) {
  const firstSyl = syllable.split(' ')[0];
  const correct = extractInitial(firstSyl);
  if (!correct || !initialsPool.includes(correct)) return null;
  const others = shuffle(initialsPool.filter(i => i !== correct)).slice(0, 3);
  if (others.length < 2) return null;
  return {
    type: 'pinyin_exercise',
    subtype: 'initial_id',
    syllable: firstSyl,
    chinese: vocabItem?.chinese ?? null,
    english: vocabItem?.english ?? null,
    correct,
    choices: shuffle([correct, ...others]),
  };
}

function makePinyinFinalId(syllable, finalsPool, vocabItem = null) {
  const firstSyl = syllable.split(' ')[0];
  const correct = extractFinal(firstSyl);
  if (!correct || !finalsPool.includes(correct)) return null;
  const others = shuffle(finalsPool.filter(f => f !== correct)).slice(0, 3);
  if (others.length < 2) return null;
  return {
    type: 'pinyin_exercise',
    subtype: 'final_id',
    syllable: firstSyl,
    chinese: vocabItem?.chinese ?? null,
    english: vocabItem?.english ?? null,
    correct,
    choices: shuffle([correct, ...others]),
  };
}

// Build all pinyin exercises for a lesson from its pinyin_focus data
export function buildPinyinExercises(lessonData) {
  const pf = lessonData?.pinyin_focus;
  if (!pf) return [];

  const tonePractice = pf.tone_practice || [];
  const initials     = pf.initials_focus  || pf.initials_review  || [];
  const finals       = pf.finals_focus    || pf.finals_review    || [];

  // Build vocab lookup: exact full-pinyin key first (preserves tone disambiguation),
  // then stripped-pinyin as fallback for syllables that differ only by tone.
  const vocabByExact   = {};
  const vocabByStripped = {};
  (lessonData.vocabulary || []).forEach(v => {
    if (!v.pinyin) return;
    const exact   = v.pinyin.toLowerCase().trim();
    const stripped = stripTones(exact);
    vocabByExact[exact] = v;
    if (!vocabByStripped[stripped]) vocabByStripped[stripped] = v; // first-wins for stripped
  });

  const exercises = [];
  for (const syllable of tonePractice) {
    const exact      = syllable.toLowerCase().trim();
    const stripped   = stripTones(exact);
    const firstExact = syllable.split(' ')[0].toLowerCase();
    const vocabItem  = vocabByExact[exact]
                    || vocabByExact[firstExact]
                    || vocabByStripped[stripped]
                    || vocabByStripped[stripTones(firstExact)]
                    || null;

    const toneEx   = makePinyinToneId(syllable, vocabItem);
    if (toneEx) exercises.push(toneEx);

    if (initials.length >= 3) {
      const initEx = makePinyinInitialId(syllable, initials, vocabItem);
      if (initEx) exercises.push(initEx);
    }
    if (finals.length >= 3) {
      const finalEx = makePinyinFinalId(syllable, finals, vocabItem);
      if (finalEx) exercises.push(finalEx);
    }
  }
  return exercises.filter(Boolean);
}

// ── Exercise factories ───────────────────────────────────────────────────
function makeFlashcard(vocabItem) {
  return { type: 'flashcard', vocabItem };
}

function makeAudioChoice(vocabItem, allVocab) {
  const distractors = pickDistractors(vocabItem.id, allVocab, 3);
  return {
    type: 'audio_choice',
    chinese: vocabItem.chinese,
    pinyin: vocabItem.pinyin || '',
    correct: vocabItem.english,
    choices: shuffle([vocabItem.english, ...distractors.map(d => d.english)]),
  };
}

function makeFillBlank(sentence, allVocab) {
  const tokens = tokenizeSentence(sentence.chinese, allVocab);
  const vocabSet = new Set(allVocab.map(v => v.chinese));
  const blankable = tokens.reduce((acc, t, i) => {
    if (vocabSet.has(t)) acc.push(i);
    return acc;
  }, []);
  if (blankable.length === 0) return null;

  const blankIdx = blankable[Math.floor(Math.random() * blankable.length)];
  const correctWord = tokens[blankIdx];
  const correctVocab = allVocab.find(v => v.chinese === correctWord);
  if (!correctVocab) return null;

  const distractors = pickDistractors(correctVocab.id, allVocab, 3);
  const pinyinMap = buildPinyinMap(allVocab);

  // Shuffle choices as pairs so pinyin stays aligned
  const pairs = shuffle([
    { word: correctWord, pinyin: pinyinMap[correctWord] || '' },
    ...distractors.map(d => ({ word: d.chinese, pinyin: pinyinMap[d.chinese] || '' })),
  ]);

  return {
    type: 'fill_blank',
    displayText: tokens.map((t, i) => i === blankIdx ? '____' : t).join(''),
    sentence_pinyin: sentence.pinyin || '',
    correct: correctWord,
    choices: pairs.map(p => p.word),
    choices_pinyin: pairs.map(p => p.pinyin),
    hint: sentence.english,
  };
}

function makeArrange(sentence, allVocab) {
  const tokens = tokenizeSentence(sentence.chinese, allVocab);
  if (tokens.length < 2) return null;
  // Reject if more than 30% of tiles are single characters — too many fragments
  // Exclude punctuation tiles (，) from the fragment count
  const wordTokens = tokens.filter(t => t !== '，');
  const singleCount = wordTokens.filter(t => t.length === 1).length;
  if (wordTokens.length > 3 && singleCount / wordTokens.length > 0.3) return null;
  const pinyinMap = buildPinyinMap(allVocab);
  return {
    type: 'arrange',
    correctTokens: tokens,
    shuffledTokens: shuffle([...tokens]),
    token_pinyin_map: pinyinMap,
    hint: sentence.english,
  };
}

function makeMatchPairs(vocabItems) {
  const items = vocabItems.slice(0, 4);
  return {
    type: 'match_pairs',
    pairs: items.map(v => ({ id: v.id, chinese: v.chinese, pinyin: v.pinyin || '', english: v.english })),
  };
}

function makeSpeakRepeat(vocabItem) {
  return {
    type: 'speak',
    subtype: 'repeat',
    chinese: vocabItem.chinese,
    pinyin: vocabItem.pinyin || '',
    english: vocabItem.english,
  };
}

function makeSpeakTranslate(vocabItem) {
  return {
    type: 'speak',
    subtype: 'translate',
    chinese: vocabItem.chinese,
    pinyin: vocabItem.pinyin || '',
    english: vocabItem.english,
  };
}

// Return a contextual emoji for a respond exercise based on the ANSWER text
function getRespondEmoji(answerChinese) {
  if (!answerChinese) return '💬';
  const a = answerChinese;
  // Travel by plane / airport / trip / departing urgently
  if (/飞机|机场|旅游|旅行|出国|登机牌|护照|行李|托运|降落|我这就出发|希望还来得及/.test(a)) return '✈️';
  // Transport / vehicle
  if (/坐火车|坐地铁|坐公共汽车|坐公交|骑车|骑自行车|开车|打车|打的/.test(a)) return '🚗';
  // Health / hospital / medical / surgery recovery
  if (/医院|看病|生病|感冒|发烧|头疼|肚子疼|身体|不舒服|节食|减肥|吃药|药|治疗|检查|免疫力|康复|皮肤|禁食|手术|均衡营养.*恢复|医生说.*营养|还有什么需要注意/.test(a)) return '🏥';
  // Date: month+day pattern
  if (/[一二三四五六七八九十百\d]+月[一二三四五六七八九十百\d]+[号日]/.test(a)) return '📅';
  // Weekday
  if (/星期[一二三四五六天日]/.test(a)) return '📅';
  // Clock / time of day
  if (/[两一二三四五六七八九十零\d]+点/.test(a)) return '🕐';
  // Weather / climate / season dressing
  if (/下雨|下雪|刮风|晴天|阴天|天气|温度|冷|热|气候|保暖|穿.*衣服|加.*外套|着凉/.test(a)) return '⛅';
  // Age / birthday
  if (/[一二三四五六七八九十百\d]+岁|生日|年龄/.test(a)) return '🎂';
  // Shopping / supermarket / buying
  if (/超市|商店|购物|买东西|买.*东西|逛街|打折|多少钱|网购|顾客评价|售货员|网店/.test(a)) return '🛍️';
  // Clothes / quality / fabric / product shopping
  if (/外套|质量|材料|款式|耐穿|符合标准|试穿|退货|价格.*值得|这件/.test(a)) return '🛍️';
  // Money / saving / finance / payment / invoice
  if (/存钱|买房|消费习惯|手机支付|零钱|工资|节省|浪费|违约金|罚款|开发票|付款.*发票/.test(a)) return '💰';
  // Cooking / food preparation / cuisine / diet
  if (/食材|调料|菜肴|做菜|烹饪|食谱|火候|味道|营养均衡|饮食习惯|美食之道|特色.*美食|清淡.*食物|肠胃/.test(a)) return '👨‍🍳';
  // Food / eating / drinks
  if (/吃饭|点菜|餐厅|饭馆|水果|苹果|饺子|面条|米饭|喝.*咖啡|喝.*茶|喝.*牛奶|喝.*水|喝.*饮料/.test(a)) return '🍽️';
  // Drinks without eating context
  if (/喝|咖啡|茶|牛奶|果汁|饮料/.test(a)) return '🍽️';
  // Romance / love / relationship / dating
  if (/感情|爱情|浪漫|约会|坠入爱河|爱河|幸福.*感|体贴|珍惜.*感情|爱意|真爱/.test(a)) return '💕';
  // Nature / environment / ecology
  if (/森林|植物|自然|环境|污染|蓝天|白云|绿水|保护地球|生态|气温.*升|自然美景/.test(a)) return '🌿';
  // City / urban development / smart city
  if (/城市.*规划|城市.*发展|公共交通|绿化|宜居|城镇化|智慧城市|智能.*城市|城市.*科技|人口.*城市/.test(a)) return '🏙️';
  // Culture / art / history / museum / exhibition
  if (/文化|艺术|雕塑|遗产|博物馆|展览|历史|民间.*艺术|传统.*文化|书法|名著|小说.*文化/.test(a)) return '🏛️';
  // Martial arts / performance / entertainment show
  if (/功夫|武术|表演.*精彩|演员|演出.*精彩|魅力|出神入化/.test(a)) return '🎭';
  // Technology / internet / AI / social media
  if (/AI|人工智能|网络平台|直播|视频.*字幕|软件|科技.*进步|互联网|数字化|大数据/.test(a)) return '💻';
  // Law / rights / contracts / legal
  if (/法律|合同|维权|律师|法院|案件|诉讼|证据|受理|违约|权利.*受到|法律援助|拖延.*损失|对方.*拖延/.test(a)) return '⚖️';
  // Business / market / sales / marketing / data analytics
  if (/市场|销售|品牌|营销|商家|投资|利润|产品.*推广|销售策略|知名度|经济形势|数据.*分析|分析.*数据.*管理者|这批产品|产品.*合格|流程.*执行|标准.*不能|社交媒体.*商业/.test(a)) return '📊';
  // Perseverance / goals / motivation / success / character / self-improvement
  if (/坚持|奋斗|梦想|目标|努力.*成功|激励|克服|突破.*记录|拼搏|榜样|信心|不放弃|阳光总在风雨后|天道酬勤|坚持就是胜利|意志力|乐观.*心态|谦虚|自信|勇敢|勇气|加油|不后悔|尽力|宝贵.*经验|失败是成功之母|自豪|感到.*自豪|改变自己.*幽默|优点.*多表示|成熟|每个人生阶段|总结.*经验.*做得更好/.test(a)) return '💪';
  // Job / career / application / work performance
  if (/面试|加入.*团队|负责任.*人|欢迎.*团队|应聘|实习|职位|管理经验|毕业.*工作|基础研究.*成长|细心.*耐心.*问题|细心和耐心|困难问题/.test(a)) return '💼';
  // Sports / exercise / training / healthy habits
  if (/打篮球|踢足球|游泳|跑步|锻炼|运动|打球|骑车|健身|体育馆|训练|散步|体能|好习惯|积累.*习惯|改变.*生活方式|天天来.*活动|太累.*活动|往往来得很早|天天来/.test(a)) return '🏃';
  // Sports match / competition
  if (/比赛|赢|输了|冠军|足球队|篮球队|赛场|竞技/.test(a)) return '⚽';
  // Movies / TV / entertainment
  if (/看电影|看电视|看剧|节目|演出|电影院/.test(a)) return '🎬';
  // Study / school / exam / growth / books
  if (/在学校|去学校|上课|学习|复习|考试|做作业|图书馆|成绩|作业|记笔记|打好基础|学期|这本书|带.*书|阅读|读.*书|书.*吸引|是哪本书|想看.*书/.test(a)) return '📚';
  // Language learning / communication skills
  if (/说汉语|说中文|普通话|学中文|学汉语|母语|口音|多听多说|词汇|语感|语言.*学习|多积累|犯错误/.test(a)) return '🗣️';
  // Communication / etiquette / social skills / explaining vocabulary
  if (/礼貌|批评.*方式|说话.*方式|交流.*重要|沟通|批评.*意思|批评表示|解释.*一下|两个词.*对话|直接.*对话/.test(a)) return '🗣️';
  // Friendship / bonds / keeping in touch / mutual encouragement / apology
  if (/友谊|真正的朋友|共同进步|保持联系|互相支持|彼此理解|信任.*朋友|互相鼓励|信任你|有点抱歉|应该先听.*解释|商品值得/.test(a)) return '🤝';
  // Work / occupation / career
  if (/是老师|是医生|是护士|是工程师|是司机|是厨师|是律师|上班|公司|同事|工作|项目/.test(a)) return '💼';
  // Pets / animals
  if (/猫|狗|鸟|宠物|鱼|兔子|养了/.test(a)) return '🐾';
  // Family members / parenting / family care
  if (/爸爸|妈妈|哥哥|姐姐|弟弟|妹妹|爷爷|奶奶|家人|家里人|口人|父母|外婆|外公|打电话.*妈|每周.*打.*电话|家庭关系|家和万事兴|担心你.*电话|确认.*没事|妈，我知道|太累了.*时间/.test(a)) return '👨‍👩‍👧‍👦';
  // Social responsibility / values
  if (/社会责任|集体主义|个人主义|价值观|孝顺|家庭责任/.test(a)) return '🤲';
  // Plans / intention / future / life direction
  if (/打算|准备|计划|规划.*未来|找到.*方向|迷茫/.test(a)) return '🗓️';
  // Home / house / moving / life habits
  if (/在家|回家|家里|新家|搬家|房子|出门|养生|减少熬夜|减少压力/.test(a)) return '🏠';
  // Location / place
  if (/在.*里|在.*旁边|在.*附近|在.*前面|在.*后面|在北京|在上海|在中国/.test(a)) return '📍';
  // Travel destination / abroad
  if (/去北京|去上海|去中国|去外国|出国|去旅游|去旅行|暑假.*外婆|童年/.test(a)) return '🌏';
  // Gifts / celebration / festival
  if (/礼物|送给|新年|节日|庆祝|生日快乐/.test(a)) return '🎁';
  // Identity / nationality / origin
  if (/是中国人|是美国人|是英国人|是日本人|来自|哪国人/.test(a)) return '🌏';
  // Name / introduction
  if (/我叫|我的名字|我姓/.test(a)) return '👋';
  // Positive feelings / happiness / life satisfaction / life wisdom
  if (/很高兴|很开心|很难过|很生气|很紧张|很激动|很累|很满意|不高兴|不开心|幸福|知足常乐|满足|人生.*意义|珍惜.*阶段|轻松愉快|心满意足|感动|感动了|这让我.*感动|随着时间.*成熟|时间.*推移.*影响/.test(a)) return '😊';
  // Hobby / likes / passion
  if (/喜欢|爱好|兴趣/.test(a)) return '❤️';
  // Words / meaning / vocabulary
  if (/意思|词语|句子|发音|怎么说/.test(a)) return '📖';
  // Homework / exam result
  if (/做完了|做对了|考了|考得|作业做/.test(a)) return '📝';
  // Neighbours / community
  if (/邻居|社区/.test(a)) return '🏘️';
  // Helping / request outcome
  if (/帮了|帮我|谢谢你帮/.test(a)) return '🤝';
  // Default conversational
  return '💬';
}

// Derive HSK level (1-5) from lessonData vocabulary IDs
function getHskLevel(lessonData) {
  const id = lessonData?.vocabulary?.[0]?.id || '';
  const match = id.match(/^hsk(\d)/);
  return match ? parseInt(match[1], 10) : 1;
}

// Shorten a Chinese answer to the first clause (up to first punctuation mark)
function shortenChinese(text, maxChars = 20) {
  if (!text) return text;
  const first = text.split(/[，。！？；…]|——/)[0];
  const result = first.length > 0 ? first : text;
  // Hard cap for long answers with no internal punctuation
  if ([...result].length > maxChars) {
    return [...result].slice(0, maxChars).join('');
  }
  return result;
}

// Shorten pinyin to match the character count of the shortened Chinese
function shortenPinyin(pinyin, chineseLen) {
  if (!pinyin) return pinyin;
  const first = pinyin.split(/[,，.。!！?？;；]|——/)[0].trim();
  const syllables = first.split(/\s+/);
  if (syllables.length <= chineseLen) return first;
  return syllables.slice(0, chineseLen).join(' ');
}

function makeSpeakRespond(qaPair, hskLevel) {
  const shortChinese = shortenChinese(qaPair.answerChinese);
  const shortPinyin  = shortenPinyin(qaPair.answerPinyin, [...shortChinese].length);
  return {
    type: 'speak',
    subtype: 'respond',
    hskLevel,
    emoji:              getRespondEmoji(qaPair.answerChinese),
    questionChinese:    qaPair.questionChinese,
    questionPinyin:     qaPair.questionPinyin,
    answerChinese:      shortChinese,
    answerPinyin:       shortPinyin,
    answerEnglish:      qaPair.answerEnglish,
    fullAnswerChinese:  qaPair.answerChinese,
    fullAnswerPinyin:   qaPair.answerPinyin,
  };
}

// Extract consecutive A→B and B→A line pairs from dialogues as Q&A exercises
function extractQAPairs(lessonData) {
  const pairs = [];
  for (const dialogue of (lessonData.dialogues || [])) {
    const lines = dialogue.lines || [];
    for (let i = 0; i < lines.length - 1; i++) {
      const q = lines[i];
      const a = lines[i + 1];
      if (q.speaker !== a.speaker && q.chinese && a.chinese) {
        pairs.push({
          questionChinese: q.chinese,
          questionPinyin:  q.pinyin  || '',
          answerChinese:   a.chinese,
          answerPinyin:    a.pinyin  || '',
          answerEnglish:   a.english || '',
        });
      }
    }
  }
  return pairs;
}

// ── Stage builder helpers ────────────────────────────────────────────────
function fallbackAudio(i, vocab) {
  return makeAudioChoice(vocab[i % vocab.length], vocab);
}

function fillOrFallback(sentence, i, vocab) {
  return makeFillBlank(sentence, vocab) || fallbackAudio(i, vocab);
}

function arrangeOrFallback(sentence, i, vocab) {
  return makeArrange(sentence, vocab) || makeFillBlank(sentence, vocab) || fallbackAudio(i, vocab);
}

// ── Shared setup ─────────────────────────────────────────────────────────
function buildSpeakPool(vocab, sentences) {
  const multiChar = vocab.filter(v => v.chinese && [...v.chinese].length >= 2);
  const sentItems = sentences.map(s => ({ chinese: s.chinese, pinyin: s.pinyin || '', english: s.english || '' }));
  const pool = shuffle([...multiChar, ...sentItems]);
  return pool.length > 0 ? pool : vocab;
}

// Helpers that wrap index with modulo so we never go out of bounds
function v(vocab, i) { return vocab[i % vocab.length]; }
function s(sentences, i) { return sentences[i % sentences.length]; }
function p(pool, i) { return pool[i % pool.length]; }

// ── Round 1 – Learn: recognition & introduction ──────────────────────────
function buildLearnRound(vocab, sentences, pool, L) {
  const s1 = [
    makeFlashcard(v(vocab, 0)),
    makeFlashcard(v(vocab, 1)),
    makeFlashcard(v(vocab, 2)),
    makeImageToWord(v(vocab, 0), vocab, L, 0),   // 🖼️ picture → word
    makeImageToWord(v(vocab, 1), vocab, L, 0),
    makeImageToWord(v(vocab, 2), vocab, L, 0),
    makeAudioChoice(v(vocab, 5), vocab),
    makeAudioChoice(v(vocab, 6), vocab),
    makeMatchPairs(shuffle([...vocab])),
    makeMatchPairs(shuffle([...vocab])),
  ];
  const s2 = [
    ...Array.from({ length: 3 }, (_, i) => makeAudioChoice(v(vocab, i), vocab)),
    makeListenToImage(v(vocab, 3), vocab, L, 0),  // 🔊 listen → picture
    makeListenToImage(v(vocab, 4), vocab, L, 0),
    makeListenToImage(v(vocab, 5), vocab, L, 0),
    ...Array.from({ length: 2 }, (_, i) => fillOrFallback(s(sentences, i), i + 5, vocab)),
    makeSpeakRepeat(p(pool, 0)),
    makeSpeakRepeat(p(pool, 1)),
  ];
  const s3 = [
    makeImageToWord(v(vocab, 3), vocab, L, 1),   // different image variant
    makeImageToWord(v(vocab, 4), vocab, L, 1),
    ...Array.from({ length: 3 }, (_, i) => arrangeOrFallback(s(sentences, i), i, vocab)),
    ...Array.from({ length: 3 }, (_, i) => fillOrFallback(s(sentences, i + 1), i + 4, vocab)),
    makeSpeakTranslate(p(pool, 2)),
    makeSpeakTranslate(p(pool, 3)),
  ];
  const s4 = [
    ...Array.from({ length: 4 }, (_, i) =>
      makeMatchPairs(Array.from({ length: 4 }, (_, j) => v(vocab, i * 4 + j)))),
    makeListenToImage(v(vocab, 6), vocab, L, 0),  // 🔊 listen → picture
    makeListenToImage(v(vocab, 7), vocab, L, 0),
    ...Array.from({ length: 2 }, (_, i) => makeAudioChoice(v(vocab, i + 7), vocab)),
    makeSpeakRepeat(p(pool, 4)),
    makeSpeakRepeat(p(pool, 5)),
  ];
  const s5 = [
    makeImageToWord(v(vocab, 5), vocab, L, 2),
    makeImageToWord(v(vocab, 6), vocab, L, 2),
    makeAudioChoice(v(vocab, 10), vocab),
    fillOrFallback(s(sentences, 4), 4, vocab),
    arrangeOrFallback(s(sentences, 0), 5, vocab),
    makeMatchPairs(shuffle([...vocab])),
    makeSpeakRepeat(p(pool, 6)),
    makeSpeakRepeat(p(pool, 7)),
    makeSpeakTranslate(p(pool, 8)),
    makeSpeakTranslate(p(pool, 9)),
  ];
  return [s1, s2, s3, s4, s5];
}

// ── Round 2 – Practice: sentence production, offset vocab ────────────────
function buildPracticeRound(vocab, sentences, pool, respondOrFallback, L) {
  const O = 3;
  const s1 = [
    ...Array.from({ length: 2 }, (_, i) => makeFlashcard(v(vocab, i + O))),
    makeWordToImage(v(vocab, O), vocab, L, 0),    // 🖼️ word → picture
    makeWordToImage(v(vocab, O + 1), vocab, L, 0),
    makeWordToImage(v(vocab, O + 2), vocab, L, 0),
    ...Array.from({ length: 2 }, (_, i) => makeAudioChoice(v(vocab, i + O + 3), vocab)),
    ...Array.from({ length: 2 }, (_, i) => fillOrFallback(s(sentences, i + O), i, vocab)),
    makeMatchPairs(shuffle([...vocab])),
    makeMatchPairs(shuffle([...vocab])),
  ];
  const s2 = [
    ...Array.from({ length: 4 }, (_, i) => fillOrFallback(s(sentences, i + O + 1), i, vocab)),
    ...Array.from({ length: 3 }, (_, i) => arrangeOrFallback(s(sentences, i + O), i + 4, vocab)),
    makeSpeakRepeat(p(pool, O)),
    makeSpeakTranslate(p(pool, O + 1)),
    respondOrFallback(0),                     // 🎧 Q&A exercise
  ];
  const s3 = [
    ...Array.from({ length: 5 }, (_, i) => arrangeOrFallback(s(sentences, i + O + 1), i, vocab)),
    ...Array.from({ length: 3 }, (_, i) => fillOrFallback(s(sentences, i + O + 2), i + 5, vocab)),
    makeSpeakTranslate(p(pool, O + 2)),
    makeSpeakTranslate(p(pool, O + 3)),
  ];
  const s4 = [
    ...Array.from({ length: 4 }, (_, i) =>
      makeMatchPairs(Array.from({ length: 4 }, (_, j) => v(vocab, (i + 2) * 3 + j)))),
    ...Array.from({ length: 2 }, (_, i) => makeAudioChoice(v(vocab, i + O + 4), vocab)),
    makeSpeakRepeat(p(pool, O + 4)),
    makeSpeakTranslate(p(pool, O + 5)),
    respondOrFallback(1),                     // 🎧 Q&A exercise
    respondOrFallback(2),                     // 🎧 Q&A exercise
  ];
  const s5 = [
    makeAudioChoice(v(vocab, O + 5), vocab),
    makeAudioChoice(v(vocab, O + 6), vocab),
    fillOrFallback(s(sentences, O + 3), 0, vocab),
    fillOrFallback(s(sentences, O + 4), 1, vocab),
    arrangeOrFallback(s(sentences, O + 2), 2, vocab),
    arrangeOrFallback(s(sentences, O + 3), 3, vocab),
    makeMatchPairs(shuffle([...vocab])),
    makeSpeakRepeat(p(pool, O + 7)),
    makeSpeakTranslate(p(pool, O + 8)),
    respondOrFallback(3),
  ];
  return [s1, s2, s3, s4, s5];
}

// ── Round 3 – Master: heavy speaking & full production ────────────────────
function buildMasteryRound(vocab, sentences, pool, respondOrFallback, L) {
  const O = 7;
  const s1 = [
    ...Array.from({ length: 3 }, (_, i) => arrangeOrFallback(s(sentences, i + O), i, vocab)),
    ...Array.from({ length: 3 }, (_, i) => fillOrFallback(s(sentences, i + O + 1), i + 3, vocab)),
    makeSpeakRepeat(p(pool, O)),
    makeSpeakRepeat(p(pool, O + 1)),
    makeMatchPairs(shuffle([...vocab])),
    makeMatchPairs(shuffle([...vocab])),
  ];
  const s2 = [
    ...Array.from({ length: 4 }, (_, i) => makeSpeakRepeat(p(pool, O + 2 + i))),
    ...Array.from({ length: 3 }, (_, i) => fillOrFallback(s(sentences, i + O + 2), i, vocab)),
    ...Array.from({ length: 3 }, (_, i) =>
      makeMatchPairs(Array.from({ length: 4 }, (_, j) => v(vocab, i * 5 + j)))),
  ];
  const s3 = [
    ...Array.from({ length: 3 }, (_, i) => makeSpeakTranslate(p(pool, O + 6 + i))),
    makeSentenceToImage(s(sentences, 0), v(vocab, 2), vocab, L),   // 🖼️ sentence → picture
    makeSentenceToImage(s(sentences, 1), v(vocab, 5), vocab, L),
    ...Array.from({ length: 2 }, (_, i) => arrangeOrFallback(s(sentences, i + O + 1), i, vocab)),
    ...Array.from({ length: 2 }, (_, i) => fillOrFallback(s(sentences, i + O + 3), i + 3, vocab)),
  ];
  const s4 = [
    ...Array.from({ length: 3 }, (_, i) => makeSpeakRepeat(p(pool, O + 11 + i))),
    ...Array.from({ length: 3 }, (_, i) => makeSpeakTranslate(p(pool, O + 14 + i))),
    respondOrFallback(4),
    respondOrFallback(5),
    makeMatchPairs(shuffle([...vocab])),
    makeAudioChoice(v(vocab, O + 4), vocab),
  ];
  const s5 = [
    makeSentenceToImage(s(sentences, 2), v(vocab, 0), vocab, L),   // 🖼️ sentence → picture
    makeSentenceToImage(s(sentences, 3), v(vocab, 1), vocab, L),
    arrangeOrFallback(s(sentences, O + 2), 2, vocab),
    arrangeOrFallback(s(sentences, O + 3), 3, vocab),
    makeMatchPairs(shuffle([...vocab])),
    makeSpeakRepeat(p(pool, O + 17)),
    makeSpeakTranslate(p(pool, O + 18)),
    respondOrFallback(6),
    respondOrFallback(7),
    respondOrFallback(8),
  ];
  return [s1, s2, s3, s4, s5];
}

// ── Quiz Round – mixed types including pinyin, no flashcards ─────────────
export function generateQuizRound(lessonData) {
  const vocab     = lessonData.vocabulary || [];
  const sentences = (lessonData.key_sentences || []).filter(s => s?.chinese);
  const pool      = buildSpeakPool(vocab, sentences);
  const qaPairs   = extractQAPairs(lessonData);
  const L         = lessonData.lesson || 5;
  const hskLevel  = getHskLevel(lessonData);

  const respondOrFallback = (i) =>
    qaPairs.length > 0
      ? makeSpeakRespond(qaPairs[i % qaPairs.length], hskLevel)
      : makeSpeakRepeat(p(pool, i));

  // Pick up to 3 pinyin exercises from the lesson
  const pinyinPool = shuffle(buildPinyinExercises(lessonData));
  const pinyinPick = pinyinPool.slice(0, 3);

  const raw = [
    // Audio listen-and-choose (3)
    makeAudioChoice(v(vocab, 0), vocab),
    makeAudioChoice(v(vocab, 4), vocab),
    makeAudioChoice(v(vocab, 8), vocab),
    // Fill in the blank (3)
    fillOrFallback(s(sentences, 0), 0, vocab),
    fillOrFallback(s(sentences, 2), 2, vocab),
    fillOrFallback(s(sentences, 4), 4, vocab),
    // Arrange / build sentence (3)
    arrangeOrFallback(s(sentences, 1), 1, vocab),
    arrangeOrFallback(s(sentences, 3), 3, vocab),
    arrangeOrFallback(s(sentences, 5), 5, vocab),
    // Match pairs (2)
    makeMatchPairs(shuffle([...vocab]).slice(0, 4)),
    makeMatchPairs(shuffle([...vocab]).slice(0, 4)),
    // Image exercises (2) — fall back to audio_choice if no images available
    (function() { const r = makeImageToWord(v(vocab, 2), vocab, L, 0); return r.type === 'flashcard' ? makeAudioChoice(v(vocab, 2), vocab) : r; })(),
    (function() { const r = makeWordToImage(v(vocab, 5), vocab, L, 1); return r.type === 'flashcard' ? makeAudioChoice(v(vocab, 5), vocab) : r; })(),
    // Speaking – repeat, translate, Q&A respond (3)
    makeSpeakRepeat(p(pool, 1)),
    makeSpeakTranslate(p(pool, 3)),
    respondOrFallback(0),
    // Pinyin focus (up to 3)
    ...pinyinPick,
  ].filter(Boolean);

  return shuffle(raw);
}

// ── Exports ───────────────────────────────────────────────────────────────
export function generateRounds(lessonData) {
  const vocab = lessonData.vocabulary || [];
  const sentences = (lessonData.key_sentences || []).filter(s => s?.chinese);
  const pool = buildSpeakPool(vocab, sentences);
  const qaPairs = extractQAPairs(lessonData);
  const L = lessonData.lesson || 5; // lesson number for image lookup
  const hskLevel = getHskLevel(lessonData);

  // Helper: pick a Q&A respond exercise, fall back to speak_repeat if none available
  const respondOrFallback = (i) =>
    qaPairs.length > 0
      ? makeSpeakRespond(qaPairs[i % qaPairs.length], hskLevel)
      : makeSpeakRepeat(p(pool, i));

  const rounds = [
    buildLearnRound(vocab, sentences, pool, L),
    buildPracticeRound(vocab, sentences, pool, respondOrFallback, L),
    buildMasteryRound(vocab, sentences, pool, respondOrFallback, L),
  ];

  // Inject pinyin exercises: 1 into stage 2 (Listen & Choose) + 1 into stage 5 (Final Challenge)
  // of each round, cycling through the pinyin pool
  const pinyinPool = shuffle(buildPinyinExercises(lessonData));
  if (pinyinPool.length > 0) {
    let pIdx = 0;
    for (const round of rounds) {
      if (pIdx < pinyinPool.length) round[1].push(pinyinPool[pIdx++]); // stage 2
      if (pIdx < pinyinPool.length) round[4].push(pinyinPool[pIdx++]); // stage 5
    }
  }

  return rounds;
}

// Backward-compat alias
export function generateStages(lessonData) {
  return generateRounds(lessonData)[0];
}
