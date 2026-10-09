// Chinese Characters Foundations — lesson registry.
// 20 lessons planned; only the ones listed in CHARACTER_LESSONS have content.
// A preview without a matching entry here renders as "Coming soon" and stays locked.

import characterLesson1 from './character_lesson_1.json';

export const CHARACTER_LESSONS = {
  1: characterLesson1,
};

export const TOTAL_CHARACTER_LESSONS = 20;

// Titles for the lesson list. Lessons 2-20 are placeholders until authored.
export const CHARACTER_LESSON_PREVIEWS = [
  { id: 1, title: 'Characters Are Built From Strokes', subtitle: '横 竖 撇 捺 · 一 二 三 十 八 人 个 大 天 木' },
  ...Array.from({ length: TOTAL_CHARACTER_LESSONS - 1 }, (_, i) => ({
    id: i + 2,
    title: `Lesson ${i + 2}`,
    subtitle: 'Coming soon',
  })),
];

export function getCharacterLesson(id) {
  return CHARACTER_LESSONS[id] || null;
}

export function hasCharacterLesson(id) {
  return Boolean(CHARACTER_LESSONS[id]);
}
