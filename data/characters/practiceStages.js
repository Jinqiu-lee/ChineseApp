// Practice is four stages, mirroring how the Pinyin course splits its practice.
// Each stage draws from the lesson's recall_pool by question type, except the
// Write stage which traces characters instead of answering questions.

import { CHARACTER_LESSONS } from './index';

export const QUESTIONS_PER_STAGE = 12;

export const PRACTICE_STAGES = [
  {
    index: 0,
    name: 'Stroke Recognition',
    desc: 'Spot the missing stroke or component',
    icon: '🖌',
    color: '#296614',
    types: ['missing_stroke', 'missing_component'],
  },
  {
    index: 1,
    name: 'Read & Use',
    desc: 'Characters, pinyin, meaning and sound',
    icon: '📖',
    color: '#1467A3',
    types: ['char_to_pinyin', 'char_to_meaning', 'meaning_to_char', 'pinyin_to_char', 'audio_to_char'],
  },
  {
    index: 2,
    name: 'Write',
    desc: 'Write each character from memory',
    icon: '✍️',
    color: '#B63E2C',
    kind: 'write',
  },
  {
    index: 3,
    name: 'Comprehensive',
    desc: 'Everything from this lesson, mixed',
    icon: '🏆',
    color: '#DE692F',
    types: 'all',
  },
  {
    index: 4,
    name: 'Recall',
    desc: 'This lesson plus everything before it',
    icon: '🔁',
    color: '#6B4FA0',
    kind: 'recall',
  },
];

// Recall only exists once there is something earlier to revisit, so Lesson 1
// has four stages and every lesson after it has five.
export function stagesForLesson(lessonId) {
  return PRACTICE_STAGES.filter(st => st.kind !== 'recall' || lessonId > 1);
}

export function practiceStageCount(lessonId) {
  return stagesForLesson(lessonId).length;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Writing a character is just another question type, so a quiz can mix it in
// with the rest rather than needing a separate mode.
const asWriteQuestions = (chars) => chars.map(c => ({ type: 'write', char: c }));

/** Questions for one practice stage. */
export function questionsForStage(lessonData, stageIndex) {
  const stage = PRACTICE_STAGES[stageIndex];
  if (!stage) return [];

  if (stage.kind === 'write') return asWriteQuestions(writeCharsForStage(lessonData));
  if (stage.kind === 'recall') return buildRecallMix(lessonData);

  const pool = lessonData?.recall_pool || [];
  const matching = stage.types === 'all'
    ? pool
    : pool.filter(q => stage.types.includes(q.type));

  return shuffle(matching)
    .slice(0, QUESTIONS_PER_STAGE)
    .map(q => ({ ...q, choices: shuffle(q.choices || []) }));
}

export function writeCharsForStage(lessonData) {
  return lessonData?.learn_content?.part5_write?.characters || [];
}

export function isWriteStage(stageIndex) {
  return PRACTICE_STAGES[stageIndex]?.kind === 'write';
}

// ── Recall stage ────────────────────────────────────────────────────────────
export const RECALL_LENGTH = 15;
const RECALL_FROM_CURRENT = 8;   // roughly half; the rest comes from earlier lessons

/**
 * Half this lesson, half everything before it, shuffled together — so earlier
 * characters keep resurfacing instead of being learned once and dropped.
 */
export function buildRecallMix(lessonData, length = RECALL_LENGTH) {
  const lessonId = lessonData?.id || 1;

  const current = shuffle(lessonData?.recall_pool || []).slice(0, RECALL_FROM_CURRENT);

  const earlier = [];
  for (let i = 1; i < lessonId; i++) {
    const prev = CHARACTER_LESSONS[i];
    if (prev?.recall_pool) earlier.push(...prev.recall_pool);
  }
  const revisited = shuffle(earlier).slice(0, length - current.length);

  // If there is not enough history yet, top up from this lesson.
  const short = length - current.length - revisited.length;
  const filler = short > 0
    ? shuffle((lessonData?.recall_pool || []).filter(q => !current.includes(q))).slice(0, short)
    : [];

  return shuffle([...current, ...revisited, ...filler])
    .map(q => ({ ...q, choices: shuffle(q.choices || []) }));
}


// ── Lesson quiz ─────────────────────────────────────────────────────────────
export const QUIZ_LENGTH = 20;
export const QUIZ_PASS_SCORE = 60;
const QUIZ_WRITE_COUNT = 4;

/**
 * The end-of-lesson quiz: everything the lesson taught, mixed together,
 * including a few characters to write from memory.
 */
export function buildLessonQuiz(lessonData, length = QUIZ_LENGTH) {
  const writes = shuffle(writeCharsForStage(lessonData)).slice(0, QUIZ_WRITE_COUNT);
  const asked = shuffle(lessonData?.recall_pool || [])
    .slice(0, Math.max(0, length - writes.length))
    .map(q => ({ ...q, choices: shuffle(q.choices || []) }));

  return shuffle([...asked, ...asWriteQuestions(writes)]);
}
