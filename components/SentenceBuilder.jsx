import { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView
} from "react-native";

// ── Tokenizer: vocab-aware, longest-match-first ───────────────────
// Given a Chinese sentence string and a vocab list, split into tokens
// that preserve multi-character words (e.g. 地方, 北京, 老师).
// Strategy: greedily match the longest known vocab word at each position,
// fall back to single character.
// Words that must always stay together even when absent from lesson vocab.
// Sorted longest-first so 3-char entries beat their 2-char sub-strings.
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
  '目的','理想','矛盾','代沟','和睦','误会',
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

function tokenizeSentence(chineseSentence, vocab) {
  if (!chineseSentence) return [];

  const knownWords = [
    ...SUPPLEMENT_WORDS,
    ...vocab.map((v) => v.chinese).filter(Boolean),
  ].sort((a, b) => b.length - a.length);

  // Pass 1: greedy longest-match
  const raw = [];
  let i = 0;
  while (i < chineseSentence.length) {
    const ch = chineseSentence[i];
    if (ch === " " || ch === "　") { i++; continue; }
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
  let buf = "";
  for (const t of raw) {
    if (t === '，') {
      if (buf) { tokens.push(buf); buf = ""; }
      tokens.push(t);
    } else if (t.length === 1 && !ALWAYS_SINGLE.has(t)) {
      buf += t;
    } else {
      if (buf) { tokens.push(buf); buf = ""; }
      tokens.push(t);
    }
  }
  if (buf) tokens.push(buf);

  return tokens;
}

// Fisher-Yates shuffle
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SentenceBuilder({ vocab, sentences, color, onFinish }) {
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [tiles, setTiles]           = useState([]);   // { id, word, placed: bool }
  const [answer, setAnswer]         = useState([]);   // ids in order
  const [checked, setChecked]       = useState(false);
  const [isCorrect, setIsCorrect]   = useState(false);
  const [score, setScore]           = useState(0);

  const validSentences = (sentences || []).filter((s) => s?.chinese);

  useEffect(() => {
    if (validSentences.length > 0) loadSentence(0);
  }, []);

  const loadSentence = (idx) => {
    const s = validSentences[idx];
    if (!s) return;

    const tokens = tokenizeSentence(s.chinese, vocab);
    const shuffled = shuffle(tokens.map((word, i) => ({ id: `${idx}-${i}`, word })));
    setTiles(shuffled);
    setAnswer([]);
    setChecked(false);
    setIsCorrect(false);
  };

  const placeTile = (tile) => {
    if (checked) return;
    if (answer.find((t) => t.id === tile.id)) return;
    setAnswer((prev) => [...prev, tile]);
    setTiles((prev) => prev.map((t) => t.id === tile.id ? { ...t, placed: true } : t));
  };

  const removeTile = (tile) => {
    if (checked) return;
    setAnswer((prev) => prev.filter((t) => t.id !== tile.id));
    setTiles((prev) => prev.map((t) => t.id === tile.id ? { ...t, placed: false } : t));
  };

  const checkAnswer = () => {
    const s = validSentences[sentenceIndex];
    const correctTokens = tokenizeSentence(s.chinese, vocab);
    const userTokens = answer.map((t) => t.word);
    const correct = correctTokens.join("") === userTokens.join("");
    setIsCorrect(correct);
    setChecked(true);
    if (correct) setScore((prev) => prev + 1);
  };

  const next = () => {
    const nextIdx = sentenceIndex + 1;
    if (nextIdx >= validSentences.length) {
      onFinish && onFinish(score / validSentences.length);
    } else {
      setSentenceIndex(nextIdx);
      loadSentence(nextIdx);
    }
  };

  if (validSentences.length === 0) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyText}>No sentences available for this lesson.</Text>
      </View>
    );
  }

  const sentence = validSentences[sentenceIndex];
  const isLast = sentenceIndex + 1 >= validSentences.length;

  return (
    <ScrollView contentContainerStyle={s.container}>
      {/* Progress */}
      <View style={s.progressRow}>
        <Text style={s.progressText}>{sentenceIndex + 1} / {validSentences.length}</Text>
        <View style={s.progressBg}>
          <View style={[s.progressFill, { width: `${((sentenceIndex + 1) / validSentences.length) * 100}%`, backgroundColor: color }]} />
        </View>
        <Text style={s.scoreText}>⭐ {score}</Text>
      </View>

      {/* Instruction */}
      <View style={[s.instructionBox, { borderColor: color }]}>
        <Text style={s.instructionLabel}>🧩 Build this sentence:</Text>
        <Text style={s.englishSentence}>{sentence.english}</Text>
        {sentence.pinyin && <Text style={s.pinyinSentence}>{sentence.pinyin}</Text>}
      </View>

      {/* Answer tray */}
      <View style={s.answerTray}>
        {answer.length === 0 && (
          <Text style={s.answerPlaceholder}>Tap words below to build the sentence</Text>
        )}
        <View style={s.tileRow}>
          {answer.map((tile) => (
            <TouchableOpacity
              key={tile.id}
              style={[s.tile, s.tileAnswer, { borderColor: color },
                checked && (isCorrect ? s.tileCorrect : s.tileWrong)]}
              onPress={() => removeTile(tile)}
              disabled={checked}
              activeOpacity={0.75}
            >
              <Text style={[s.tileText, checked && s.tileTextWhite]}>{tile.word}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Word bank */}
      <View style={s.bankLabel}>
        <Text style={s.bankLabelText}>Word Bank</Text>
      </View>
      <View style={s.tileRow}>
        {tiles.map((tile) => (
          <TouchableOpacity
            key={tile.id}
            style={[s.tile, tile.placed && s.tilePlaced]}
            onPress={() => !tile.placed && placeTile(tile)}
            disabled={tile.placed || checked}
            activeOpacity={0.75}
          >
            <Text style={[s.tileText, tile.placed && s.tileTextFaded]}>{tile.word}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Check / feedback */}
      {!checked && answer.length > 0 && (
        <TouchableOpacity style={[s.checkBtn, { backgroundColor: color }]} onPress={checkAnswer}>
          <Text style={s.checkBtnText}>Check Answer ✓</Text>
        </TouchableOpacity>
      )}

      {checked && (
        <>
          <View style={[s.feedbackBox, { backgroundColor: isCorrect ? "#d4edda" : "#fdecea" }]}>
            <Text style={s.feedbackText}>
              {isCorrect ? "✅ Correct! 太棒了！" : `❌ Correct answer: ${sentence.chinese}`}
            </Text>
          </View>
          <TouchableOpacity style={[s.nextBtn, { backgroundColor: color }]} onPress={next}>
            <Text style={s.nextBtnText}>{isLast ? "Finish 🏆" : "Next Sentence →"}</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:          { padding: 16, paddingBottom: 48 },
  empty:              { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyText:          { fontSize: 15, color: "#636e72", textAlign: "center" },

  progressRow:        { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  progressText:       { fontSize: 12, color: "#636e72", fontWeight: "600", minWidth: 36 },
  progressBg:         { flex: 1, height: 6, backgroundColor: "#dfe6e9", borderRadius: 3, overflow: "hidden" },
  progressFill:       { height: "100%", borderRadius: 3 },
  scoreText:          { fontSize: 14, fontWeight: "700", color: "#2d3436" },

  instructionBox:     { backgroundColor: "#1a1a2e", borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 2 },
  instructionLabel:   { fontSize: 12, fontWeight: "700", color: "#a29bfe", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  englishSentence:    { fontSize: 17, fontWeight: "700", color: "#fff", lineHeight: 24 },
  pinyinSentence:     { fontSize: 13, color: "#a29bfe", marginTop: 6, fontStyle: "italic" },

  answerTray:         { minHeight: 72, backgroundColor: "#f8f9fa", borderRadius: 14, padding: 12, marginBottom: 12, borderWidth: 2, borderColor: "#dfe6e9", borderStyle: "dashed" },
  answerPlaceholder:  { fontSize: 13, color: "#b2bec3", textAlign: "center", marginTop: 8 },

  bankLabel:          { marginBottom: 8 },
  bankLabelText:      { fontSize: 12, color: "#636e72", fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },

  tileRow:            { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  tile:               { backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1.5, borderColor: "#dfe6e9", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
  tileAnswer:         { borderWidth: 2 },
  tilePlaced:         { backgroundColor: "#f1f2f6", borderColor: "#dfe6e9" },
  tileCorrect:        { backgroundColor: "#1DD1A1", borderColor: "#1DD1A1" },
  tileWrong:          { backgroundColor: "#FF6B6B", borderColor: "#FF6B6B" },
  tileText:           { fontSize: 18, fontWeight: "700", color: "#2d3436" },
  tileTextFaded:      { color: "#b2bec3" },
  tileTextWhite:      { color: "#fff" },

  checkBtn:           { padding: 16, borderRadius: 14, alignItems: "center", marginTop: 12 },
  checkBtnText:       { fontSize: 15, fontWeight: "800", color: "#fff" },

  feedbackBox:        { borderRadius: 12, padding: 14, marginTop: 12, marginBottom: 8 },
  feedbackText:       { fontSize: 14, fontWeight: "700", color: "#2d3436" },
  nextBtn:            { padding: 16, borderRadius: 14, alignItems: "center" },
  nextBtnText:        { fontSize: 15, fontWeight: "800", color: "#fff" },
});
