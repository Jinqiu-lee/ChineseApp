// Artwork for Characters Foundations 2 (lessons 11-20).
//
// Lesson JSON refers to an image by key — "l12-p1-shui" — rather than by path,
// so a lesson can be written before its artwork exists: an unknown key falls
// back to whatever text is in the field, which is how the emoji placeholders
// still work for anything not yet drawn.
//
// Keys read lesson-part-subject:  l12-p1-shui  = Lesson 12, Part 1, 水
//
// FILES LIVE IN ONE FOLDER PER LESSON — lesson_images/l12/ — but each file
// still carries its lesson in its own name (l12-p1-shui.png, not p1-shui.png).
// That is deliberate: Android's asset packager flattens the path, so two
// lessons both holding a "p1-shui.png" could collide into one resource. The
// folder is for us; the prefix is what keeps the build safe.
//
// Filenames are ASCII, no spaces, no brackets. A space, a bracket or a Chinese
// character anywhere in an asset path breaks Metro's dev-server URL and the
// Android packager — that is what made the avatar images disappear.
//
// HOW TO ADD MORE
//   1. Drop the file in  data/characters/lesson_images/l<lesson>/
//      named  l<lesson>-p<part>-<ascii-subject>.<ext>
//   2. Add one line here.
//   3. Reference the key from the lesson JSON.

const LESSON_IMAGES = {
  // ── Lesson 11 · Part 1 · 独体字, each showing picture → modern character ──
  'l11-p1-ren': require('./lesson_images/l11/l11-p1-ren.png'),
  'l11-p1-kou': require('./lesson_images/l11/l11-p1-kou.png'),
  'l11-p1-nv':  require('./lesson_images/l11/l11-p1-nv.jpeg'),

  // ── Lesson 11 · Part 3 · one per dialogue ────────────────────────────────
  'l11-p3-introduction':       require('./lesson_images/l11/l11-p3-introduction.jpeg'),
  'l11-p3-at-the-table':       require('./lesson_images/l11/l11-p3-at-the-table.jpg'),
  'l11-p3-something-to-drink': require('./lesson_images/l11/l11-p3-something-to-drink.jpeg'),
  'l11-p3-how-are-you':        require('./lesson_images/l11/l11-p3-how-are-you.jpeg'),

  // ── Lesson 11 · Part 5 · 他 / 她 / 它 ─────────────────────────────────────
  'l11-p5-ta': require('./lesson_images/l11/l11-p5-ta.jpeg'),

  // ── Lesson 12 · Part 1 · 独体字 水 火 木 ──────────────────────────────────
  'l12-p1-shui': require('./lesson_images/l12/l12-p1-shui.png'),
  'l12-p1-huo':  require('./lesson_images/l12/l12-p1-huo.png'),
  'l12-p1-mu':   require('./lesson_images/l12/l12-p1-mu.png'),

  // ── Lesson 12 · Part 3 · one per dialogue, except the first ──────────────
  // 这是汗水 / 那是泪水 contrasts two things, so that dialogue carries two
  // pictures and the card shows them side by side under 这 and 那.
  'l12-p3-hanshui':     require('./lesson_images/l12/l12-p3-hanshui.jpg'),
  'l12-p3-leishui':     require('./lesson_images/l12/l12-p3-leishui.png'),
  'l12-p3-zhuozi-yizi': require('./lesson_images/l12/l12-p3-zhuozi-yizi.png'),
  'l12-p3-chaofan':     require('./lesson_images/l12/l12-p3-chaofan.png'),
  'l12-p3-weather':     require('./lesson_images/l12/l12-p3-weather.jpeg'),

  // ── Lesson 12 · Part 5 · 五行 ────────────────────────────────────────────
  'l12-p5-five-elements': require('./lesson_images/l12/l12-p5-five-elements.png'),
  'l12-p5-cycle':         require('./lesson_images/l12/l12-p5-cycle.webp'),
};

/** The asset for a key, or null when there is no artwork for it yet. */
export function getLessonImage(key) {
  return (key && LESSON_IMAGES[key]) || null;
}

export default LESSON_IMAGES;
