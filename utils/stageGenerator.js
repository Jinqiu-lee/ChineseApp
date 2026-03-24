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
  // 3-char compounds
  '来不及','来得及','不得不','不得了','了不起','差不多','没关系',
  '没问题','不一定','不知道','不应该','不可以','不需要',
  // Conjunctions & connectives
  '不仅仅','不仅是',
  // 2-char conjunctions / adverbs
  '不仅','不但','而且','虽然','但是','因为','所以','如果','因此',
  '即使','尽管','随着','由于','通过','既然','否则','然而','不过',
  '况且','何况','甚至','反而','其实','事实','总之','总的','毕竟',
  '除非','只要','只有','无论','不管','尽管','相反',
  // Common adverbs / auxiliary verbs
  '已经','刚才','马上','立刻','突然','仍然','依然','竟然','居然',
  '果然','当然','确实','真正','真的','几乎','大约','可能','也许',
  '应该','需要','可以','能够','必须','愿意','打算','计划','希望',
  '觉得','认为','知道','发现','相信','担心','害怕','决定','选择',
  '继续','开始','结束','完成','实现','达到','满足','超过','减少',
  '增加','提高','改变','发展','解决','处理','分析','研究','管理',
  '控制','保持','保证','负责','注意','了解','关心','支持','帮助',
  '参加','提供','建议','检查','安排','准备','推迟','取消','举办',
  '进行','影响','联系','表示','表达','翻译','解释','说明','描述',
  // Common 2-char nouns & verb-object compounds
  '项目','员工','合理','安排','赚钱','打针','已经','工作','学习',
  '生活','运动','锻炼','休息','旅行','购物','做饭','打扫','洗衣',
  '上班','下班','上课','下课','回家','出门','出发','到达','离开',
  '经济','社会','政府','环境','问题','情况','原因','结果','方法',
  '方式','效果','影响','条件','要求','标准','质量','内容','关系',
  '态度','习惯','能力','机会','责任','目标','计划','未来','过去',
  '现在','以前','以后','刚刚','总是','经常','偶尔','从来','永远',
  '完全','基本','一般','特别','非常','十分','相当','比较','有点',
  '一些','有些','各种','所有','全部','部分','许多','大量','少量',
  '更加','越来','不再','再次','又一','另外','此外','其中','其他',
  '以及','并且','而且','或者','还是','就是','不是','正是','都是',
  '互相','彼此','自己','自然','当时','同时','经过','通过','关于',
  '对于','根据','按照','除了','包括','比如','例如','尤其','特别',
  '主要','重要','必要','可能','实际','真实','直接','间接',
].sort((a, b) => b.length - a.length);

// ── Tokenizer (same logic as SentenceBuilder) ───────────────────────────
function tokenizeSentence(chineseSentence, vocab) {
  if (!chineseSentence) return [];
  const knownWords = [
    ...SUPPLEMENT_WORDS,
    ...vocab.map(v => v.chinese).filter(Boolean),
  ].sort((a, b) => b.length - a.length);

  const tokens = [];
  let i = 0;
  while (i < chineseSentence.length) {
    const ch = chineseSentence[i];
    if (ch === ' ' || ch === '　') { i++; continue; }

    let matched = false;
    for (const word of knownWords) {
      if (word.length > 1 && chineseSentence.startsWith(word, i)) {
        tokens.push(word);
        i += word.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      if (/[\u3000-\u303f\uff00-\uffef，。！？、；：""''（）【】《》…—~·]/.test(ch)) {
        i++;
      } else {
        tokens.push(ch);
        i++;
      }
    }
  }
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

  // Build vocab lookup: stripped-pinyin → vocabItem
  const vocabByPinyin = {};
  (lessonData.vocabulary || []).forEach(v => {
    if (v.pinyin) vocabByPinyin[stripTones(v.pinyin.toLowerCase().trim())] = v;
  });

  const exercises = [];
  for (const syllable of tonePractice) {
    const key = stripTones(syllable.toLowerCase().trim());
    const vocabItem = vocabByPinyin[key] || vocabByPinyin[stripTones(syllable.split(' ')[0].toLowerCase())] || null;

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

function makeSpeakRespond(qaPair) {
  return {
    type: 'speak',
    subtype: 'respond',
    questionChinese: qaPair.questionChinese,
    questionPinyin:  qaPair.questionPinyin,
    answerChinese:   qaPair.answerChinese,
    answerPinyin:    qaPair.answerPinyin,
    answerEnglish:   qaPair.answerEnglish,
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

  const respondOrFallback = (i) =>
    qaPairs.length > 0
      ? makeSpeakRespond(qaPairs[i % qaPairs.length])
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

  // Helper: pick a Q&A respond exercise, fall back to speak_repeat if none available
  const respondOrFallback = (i) =>
    qaPairs.length > 0
      ? makeSpeakRespond(qaPairs[i % qaPairs.length])
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
