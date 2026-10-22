// Artwork for Characters Foundations 2 (lessons 11-20).
//
// Lesson JSON refers to an image by key — "l11-p1-ren" — rather than by path,
// so a lesson can be written before its artwork exists: an unknown key falls
// back to whatever text is in the field, which is how the emoji placeholders
// still work for anything not yet drawn.
//
// Keys read lesson-part-subject:  l11-p1-ren  = Lesson 11, Part 1, 人
//
// Filenames are ASCII with no spaces, on purpose. A space or a Chinese
// character anywhere in an asset path breaks Metro's dev-server URL and the
// Android asset packager — that is what made the avatar images disappear.
//
// HOW TO ADD MORE
//   1. Drop the file in  data/characters/lesson_images/
//      named  l<lesson>-p<part>-<ascii-subject>.<ext>
//   2. Add one line here.
//   3. Reference the key from the lesson JSON.

const LESSON_IMAGES = {
  // ── Lesson 11 · Part 1 · 独体字, each showing picture → modern character ──
  'l11-p1-ren': require('./lesson_images/l11-p1-ren.png'),
  'l11-p1-kou': require('./lesson_images/l11-p1-kou.png'),
  'l11-p1-nv':  require('./lesson_images/l11-p1-nv.jpeg'),

  // ── Lesson 11 · Part 3 · one per dialogue ────────────────────────────────
  'l11-p3-introduction':       require('./lesson_images/l11-p3-introduction.jpeg'),
  'l11-p3-at-the-table':       require('./lesson_images/l11-p3-at-the-table.jpg'),
  'l11-p3-something-to-drink': require('./lesson_images/l11-p3-something-to-drink.jpeg'),
  'l11-p3-how-are-you':        require('./lesson_images/l11-p3-how-are-you.jpeg'),

  // ── Lesson 11 · Part 5 · 他 / 她 / 它 ─────────────────────────────────────
  'l11-p5-ta': require('./lesson_images/l11-p5-ta.jpeg'),
};

/** The asset for a key, or null when there is no artwork for it yet. */
export function getLessonImage(key) {
  return (key && LESSON_IMAGES[key]) || null;
}

export default LESSON_IMAGES;
