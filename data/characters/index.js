// Chinese Characters Foundations — lesson registry.
// 20 lessons planned; only the ones listed in CHARACTER_LESSONS have content.
// A preview without a matching entry here renders as "Coming soon" and stays locked.

import characterLesson1 from './character_lesson_1.json';
import characterLesson2 from './character_lesson_2.json';
import characterLesson3 from './character_lesson_3.json';
import characterLesson4 from './character_lesson_4.json';
import characterLesson5 from './character_lesson_5.json';
import characterLesson6 from './character_lesson_6.json';
import characterLesson7 from './character_lesson_7.json';
import characterLesson8 from './character_lesson_8.json';
import characterLesson9 from './character_lesson_9.json';
import characterLesson10 from './character_lesson_10.json';

export const CHARACTER_LESSONS = {
  1: characterLesson1,
  2: characterLesson2,
  3: characterLesson3,
  4: characterLesson4,
  5: characterLesson5,
  6: characterLesson6,
  7: characterLesson7,
  8: characterLesson8,
  9: characterLesson9,
  10: characterLesson10,
};

export const TOTAL_CHARACTER_LESSONS = 20;

// The course is split in two, each half its own card and its own lesson list.
// Part 2 opens only once the last lesson of Part 1 is passed, so `unlockedBy`
// is the lesson that gates it — null means always open.
export const CHARACTER_PARTS = [
  {
    id: 1,
    title: 'Characters Foundations 1',
    short: 'Characters 1',
    subtitle: 'Strokes and Writing Rules',
    caption: 'The strokes you draw',
    icon: '✍️',
    range: [1, 10],
    unlockedBy: null,
  },
  {
    id: 2,
    title: 'Characters Foundations 2',
    short: 'Characters 2',
    subtitle: 'Radicals and Structures',
    caption: 'The parts you combine',
    icon: '🧩',
    range: [11, 20],
    unlockedBy: 10,
  },
];

export function getCharacterPart(id) {
  return CHARACTER_PARTS.find(p => p.id === Number(id)) || CHARACTER_PARTS[0];
}

/** Which half a lesson belongs to. */
export function partForLesson(lessonId) {
  const p = CHARACTER_PARTS.find(x => lessonId >= x.range[0] && lessonId <= x.range[1]);
  return p ? p.id : 1;
}

/** Is this half open yet? Part 1 always; Part 2 once its gate lesson is passed. */
export function isCharacterPartUnlocked(partId, quizPassedLessons = []) {
  const part = getCharacterPart(partId);
  return part.unlockedBy == null || quizPassedLessons.includes(part.unlockedBy);
}

// Titles for the lesson list. Authored lessons take their name and subtitle
// from their own JSON, so the two can never drift apart.
const AUTHORED = Object.values(CHARACTER_LESSONS)
  .map(l => ({ id: l.id, title: l.title, subtitle: l.subtitle }));

export const CHARACTER_LESSON_PREVIEWS = AUTHORED;

/**
 * The rows to show for one half of the course.
 * A half with nothing authored yet gets a single placeholder rather than ten
 * identical "Coming soon" rows, which say nothing ten times over.
 */
export function previewsForPart(partId) {
  const [from, to] = getCharacterPart(partId).range;
  return AUTHORED.filter(l => l.id >= from && l.id <= to);
}

export function authoredCountForPart(partId) {
  return previewsForPart(partId).length;
}

export function lessonCountForPart(partId) {
  const [from, to] = getCharacterPart(partId).range;
  return to - from + 1;
}

// Every character reading the course knows, from whichever lesson teaches it.
// A lesson often uses a character it did not introduce — Lesson 4's 儿子 needs
// 子, which is taught in Lesson 6 — and polyphonic characters like 子 (zǐ alone,
// neutral in 儿子) cannot be read correctly without it.
const COURSE_READINGS = (() => {
  const m = {};
  for (const lesson of Object.values(CHARACTER_LESSONS)) {
    const lc = lesson.learn_content || {};
    (lc.part1_discover?.strokes || []).forEach(x => { m[x.example_char] = x.example_pinyin; });
    (lc.part2_build?.rules || []).forEach(r => { m[r.result_char] = r.result_pinyin; });
    (lc.part3_read?.characters || []).forEach(c => { m[c.character] = c.pinyin; });
  }
  return m;
})();

export function getCharacterReading(char) {
  return COURSE_READINGS[char];
}

// Stroke ORDER by name, from whichever lesson teaches the character.
// strokeData.js holds the shapes but not the names, and a missing-stroke
// question stores only the strokes before its blank — so showing the strokes
// that come after it needs this lookup.
const COURSE_STROKE_ORDERS = (() => {
  const m = {};
  for (const lesson of Object.values(CHARACTER_LESSONS)) {
    const lc = lesson.learn_content || {};
    (lc.part1_discover?.strokes || []).forEach(x => { m[x.example_char] = x.example_stroke_order; });
    (lc.part2_build?.rules || []).forEach(r => { m[r.result_char] = r.stroke_order; });
    (lc.part3_read?.characters || []).forEach(c => { m[c.character] = c.stroke_order; });
  }
  return m;
})();

export function getCharacterStrokeOrder(char) {
  return COURSE_STROKE_ORDERS[char] || null;
}

export function getCharacterLesson(id) {
  return CHARACTER_LESSONS[id] || null;
}

export function hasCharacterLesson(id) {
  return Boolean(CHARACTER_LESSONS[id]);
}
