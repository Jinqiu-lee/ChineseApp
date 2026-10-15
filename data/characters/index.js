// Chinese Characters Foundations — lesson registry.
// 20 lessons planned; only the ones listed in CHARACTER_LESSONS have content.
// A preview without a matching entry here renders as "Coming soon" and stays locked.

import characterLesson1 from './character_lesson_1.json';
import characterLesson2 from './character_lesson_2.json';
import characterLesson3 from './character_lesson_3.json';
import characterLesson4 from './character_lesson_4.json';
import characterLesson5 from './character_lesson_5.json';

export const CHARACTER_LESSONS = {
  1: characterLesson1,
  2: characterLesson2,
  3: characterLesson3,
  4: characterLesson4,
  5: characterLesson5,
};

export const TOTAL_CHARACTER_LESSONS = 20;

// Titles for the lesson list. Authored lessons take their name and subtitle
// from their own JSON, so the two can never drift apart.
const AUTHORED = Object.values(CHARACTER_LESSONS)
  .map(l => ({ id: l.id, title: l.title, subtitle: l.subtitle }));

export const CHARACTER_LESSON_PREVIEWS = [
  ...AUTHORED,
  ...Array.from({ length: TOTAL_CHARACTER_LESSONS - AUTHORED.length }, (_, i) => ({
    id: AUTHORED.length + i + 1,
    title: `Lesson ${AUTHORED.length + i + 1}`,
    subtitle: 'Coming soon',
  })),
];

export function getCharacterLesson(id) {
  return CHARACTER_LESSONS[id] || null;
}

export function hasCharacterLesson(id) {
  return Boolean(CHARACTER_LESSONS[id]);
}
