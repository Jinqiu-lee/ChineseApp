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

// ── Main export ──────────────────────────────────────────────────────────
export function generateStages(lessonData) {
  const vocab = lessonData.vocabulary || [];
  const sentences = (lessonData.key_sentences || []).filter(s => s?.chinese);

  // Stage 1 – First Look: 5 flashcards · 3 audio choice · 2 match pairs
  const s1 = [
    ...Array.from({ length: 5 }, (_, i) => makeFlashcard(vocab[i % vocab.length])),
    ...Array.from({ length: 3 }, (_, i) => makeAudioChoice(vocab[(i + 5) % vocab.length], vocab)),
    makeMatchPairs(shuffle([...vocab])),
    makeMatchPairs(shuffle([...vocab])),
  ];

  // Stage 2 – Listen & Choose: 5 audio choice · 3 fill blank · 2 speak_repeat
  const s2 = [
    ...Array.from({ length: 5 }, (_, i) => makeAudioChoice(vocab[i % vocab.length], vocab)),
    ...Array.from({ length: 3 }, (_, i) =>
      fillOrFallback(sentences[i % sentences.length], i + 5, vocab)),
    makeSpeakRepeat(vocab[0 % vocab.length]),
    makeSpeakRepeat(vocab[1 % vocab.length]),
  ];

  // Stage 3 – Build Sentences: 4 arrange · 4 fill blank · 2 speak_translate
  const s3 = [
    ...Array.from({ length: 4 }, (_, i) =>
      arrangeOrFallback(sentences[i % sentences.length], i, vocab)),
    ...Array.from({ length: 4 }, (_, i) =>
      fillOrFallback(sentences[(i + 1) % sentences.length], i + 4, vocab)),
    makeSpeakTranslate(vocab[2 % vocab.length]),
    makeSpeakTranslate(vocab[3 % vocab.length]),
  ];

  // Stage 4 – Match & Review: 4 match pairs · 4 audio choice · 2 speak_repeat
  const s4 = [
    ...Array.from({ length: 4 }, (_, i) => {
      const start = (i * 4) % vocab.length;
      const items = Array.from({ length: 4 }, (_, j) => vocab[(start + j) % vocab.length]);
      return makeMatchPairs(items);
    }),
    ...Array.from({ length: 4 }, (_, i) =>
      makeAudioChoice(vocab[(i + 7) % vocab.length], vocab)),
    makeSpeakRepeat(vocab[4 % vocab.length]),
    makeSpeakRepeat(vocab[5 % vocab.length]),
  ];

  // Stage 5 – Final Challenge: 2 flash · 1 audio · 1 fill · 1 arrange · 1 match · 2 speak_repeat · 2 speak_translate
  const s5 = [
    makeFlashcard(vocab[Math.min(8, vocab.length - 1)]),
    makeFlashcard(vocab[Math.min(9, vocab.length - 1)]),
    makeAudioChoice(vocab[Math.min(10, vocab.length - 1)], vocab),
    fillOrFallback(sentences[Math.min(4, sentences.length - 1)], 4, vocab),
    arrangeOrFallback(sentences[0], 5, vocab),
    makeMatchPairs(shuffle([...vocab])),
    makeSpeakRepeat(vocab[Math.min(6, vocab.length - 1)]),
    makeSpeakRepeat(vocab[Math.min(7, vocab.length - 1)]),
    makeSpeakTranslate(vocab[Math.min(8, vocab.length - 1)]),
    makeSpeakTranslate(vocab[Math.min(9, vocab.length - 1)]),
  ];

  return [s1, s2, s3, s4, s5];
}
