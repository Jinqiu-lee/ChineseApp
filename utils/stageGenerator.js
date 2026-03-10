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

// ── Tokenizer (same logic as SentenceBuilder) ───────────────────────────
function tokenizeSentence(chineseSentence, vocab) {
  if (!chineseSentence) return [];
  const knownWords = vocab
    .map(v => v.chinese)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

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

  return [
    buildLearnRound(vocab, sentences, pool, L),
    buildPracticeRound(vocab, sentences, pool, respondOrFallback, L),
    buildMasteryRound(vocab, sentences, pool, respondOrFallback, L),
  ];
}

// Backward-compat alias
export function generateStages(lessonData) {
  return generateRounds(lessonData)[0];
}
