// Shared exercise generator — produces mini_exercises in the same format as
// Lesson 1's hand-authored exercises. Used at render time for lessons that
// don't have JSON-level mini_exercises.

function _shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Returns up to n distinct, non-empty values from pool, excluding `correct`.
function _pick(pool, correct, n) {
  const unique = [...new Set(pool.filter(x => x != null && x !== '' && x !== correct))];
  return _shuffle(unique).slice(0, n);
}

// Common grammar particles/words with pinyin for fill-blank distractors.
const PARTICLES = [
  { zh: '是', py: 'shì' },
  { zh: '的', py: 'de' },
  { zh: '有', py: 'yǒu' },
  { zh: '在', py: 'zài' },
  { zh: '不', py: 'bù' },
  { zh: '了', py: 'le' },
  { zh: '也', py: 'yě' },
  { zh: '都', py: 'dōu' },
  { zh: '和', py: 'hé' },
  { zh: '很', py: 'hěn' },
  { zh: '吗', py: 'ma' },
  { zh: '呢', py: 'ne' },
  { zh: '个', py: 'gè' },
  { zh: '们', py: 'men' },
  { zh: '吧', py: 'ba' },
  { zh: '没', py: 'méi' },
  { zh: '什么', py: 'shénme' },
  { zh: '哪', py: 'nǎ' },
  { zh: '啊', py: 'a' },
  { zh: '过', py: 'guò' },
  { zh: '着', py: 'zhe' },
  { zh: '把', py: 'bǎ' },
  { zh: '被', py: 'bèi' },
  { zh: '给', py: 'gěi' },
  { zh: '比', py: 'bǐ' },
  { zh: '从', py: 'cóng' },
  { zh: '到', py: 'dào' },
  { zh: '对', py: 'duì' },
  { zh: '以', py: 'yǐ' },
  { zh: '虽然', py: 'suīrán' },
  { zh: '但是', py: 'dànshì' },
  { zh: '因为', py: 'yīnwèi' },
  { zh: '所以', py: 'suǒyǐ' },
];

function _particlePinyin(zh) {
  return PARTICLES.find(p => p.zh === zh)?.py || '';
}

// Extract the first CJK run (1-4 chars) from a grammar point title.
// e.g. "是 (shì) — to be" → "是", "Negation with 不 (bù)" → "不"
function _extractParticle(title) {
  if (!title) return null;
  const m = title.match(/[一-鿿㐀-䶿]{1,4}/g);
  return m ? m[0] : null;
}

/**
 * Generate mini_exercises for one vocabulary word.
 * Produces up to 3 exercises: meaning (MC), fill-blank, identification (MC).
 *
 * @param {object} word      – vocab entry: { chinese, pinyin, english, part_of_speech, example, translation }
 * @param {Array}  allWords  – all non-phrase vocabulary in the same lesson (for distractors)
 * @returns {Array}  mini_exercises array in Lesson-1 format
 */
export function generateWordMiniExercises(word, allWords) {
  if (!word?.chinese || !word?.english) return [];

  const others = (allWords || []).filter(
    w => w.chinese !== word.chinese && w.part_of_speech !== 'phrase'
  );

  const exercises = [];

  // ── 1. "What does X mean?" — Chinese prompt, English options (NO option_pinyin)
  const engDistractors = _pick(others.map(w => w.english), word.english, 3);
  if (engDistractors.length >= 1) {
    exercises.push({
      type: 'multiple_choice',
      question: `What does ${word.chinese} mean?`,
      correct: word.english,
      options: [word.english, ...engDistractors],
    });
  }

  // ── 2. Fill blank — word in its example sentence, Chinese options WITH option_pinyin
  if (word.example && word.example.includes(word.chinese)) {
    const blankChinese  = word.example.replace(word.chinese, '___');
    const chDistractors = _pick(others.map(w => w.chinese), word.chinese, 3);
    const opts          = [word.chinese, ...chDistractors];
    const optPinyin     = opts.map(o => {
      if (o === word.chinese) return word.pinyin || '';
      return others.find(w => w.chinese === o)?.pinyin || '';
    });
    exercises.push({
      type: 'fill_blank',
      question: `Complete: ${blankChinese}`,
      correct: word.chinese,
      options: opts,
      option_pinyin: optPinyin,
      question_chinese: blankChinese,
      question_pinyin:  '',
      question_english: word.translation || '',
    });
  }

  // ── 3. "Which [pos] means 'X'?" — English prompt, Chinese options WITH option_pinyin
  const chDistractors = _pick(others.map(w => w.chinese), word.chinese, 3);
  if (chDistractors.length >= 1) {
    const opts      = [word.chinese, ...chDistractors];
    const optPinyin = opts.map(o => {
      if (o === word.chinese) return word.pinyin || '';
      return others.find(w => w.chinese === o)?.pinyin || '';
    });
    exercises.push({
      type: 'multiple_choice',
      question: `Which ${word.part_of_speech || 'character'} means "${word.english}"?`,
      correct: word.chinese,
      options: opts,
      option_pinyin: optPinyin,
    });
  }

  return exercises;
}

/**
 * Generate exactly 2 mini_exercises for one grammar point:
 *   1. multiple_choice — translate the first example sentence (English options, no pinyin)
 *   2. fill_blank      — blank the key particle in an example (Chinese options WITH option_pinyin)
 *
 * @param {object} grammarPoint – { title, explanation, examples, exercises }
 * @returns {Array}  mini_exercises array in Lesson-1 format
 */
export function generateGrammarMiniExercises(grammarPoint) {
  if (!grammarPoint) return [];

  const examples = (grammarPoint.examples || []).filter(e => e?.chinese && e?.english);
  const result = [];

  // ── 1. MCQ: "What does [example] mean?" — English options, no option_pinyin
  if (examples.length >= 2) {
    const ex = examples[0];
    const distractors = examples.slice(1, 4).map(e => e.english);
    result.push({
      type: 'multiple_choice',
      question: `What does "${ex.chinese}" mean?`,
      correct: ex.english,
      options: [ex.english, ...distractors],
    });
  }

  // ── 2. Fill blank: blank key particle in example — Chinese options WITH option_pinyin
  const particle = _extractParticle(grammarPoint.title);
  if (particle) {
    const ex = examples.find(e => e.chinese.includes(particle));
    if (ex) {
      const blankChinese = ex.chinese.replace(particle, '___');
      const distractors  = _shuffle(PARTICLES.filter(p => p.zh !== particle)).slice(0, 3);
      const opts         = [particle, ...distractors.map(d => d.zh)];
      const optPinyin    = [_particlePinyin(particle), ...distractors.map(d => d.py)];
      result.push({
        type: 'fill_blank',
        question: 'Fill in the blank:',
        correct: particle,
        options: opts,
        option_pinyin: optPinyin,
        question_chinese: blankChinese,
        question_pinyin:  ex.pinyin || '',
        question_english: ex.english || '',
      });
    }
  }

  // Fallback: if nothing generated yet, use a single-example translation MCQ
  if (result.length === 0 && examples.length >= 1) {
    const ex = examples[0];
    result.push({
      type: 'multiple_choice',
      question: `What does "${ex.chinese}" mean?`,
      correct: ex.english,
      options: [ex.english],
    });
  }

  return result;
}
