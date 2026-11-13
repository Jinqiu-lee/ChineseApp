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

  // ── Lesson 13 · Part 1 · 独体字 金 土 手 ─────────────────────────────────
  'l13-p1-jin':  require('./lesson_images/l13/l13-p1-jin.jpeg'),
  'l13-p1-tu':   require('./lesson_images/l13/l13-p1-tu.webp'),
  'l13-p1-shou': require('./lesson_images/l13/l13-p1-shou.jpeg'),

  // ── Lesson 13 · Part 3 · one per dialogue ───────────────────────────────
  'l13-p3-how-much': require('./lesson_images/l13/l13-p3-how-much.jpg'),
  'l13-p3-doing':    require('./lesson_images/l13/l13-p3-doing.jpg'),
  'l13-p3-sweeping': require('./lesson_images/l13/l13-p3-sweeping.jpg'),

  'l13-p5-jin':     require('./lesson_images/l13/l13-p5-jin.jpeg'),
  'l13-p5-forms':   require('./lesson_images/l13/l13-p5-forms.jpeg'),
  'l13-p5-coins':   require('./lesson_images/l13/l13-p5-coins.jpeg'),
  'l13-p5-modern':  require('./lesson_images/l13/l13-p5-modern.jpeg'),
  'l13-p5-chaofan': require('./lesson_images/l13/l13-p5-chaofan.jpeg'),

  // ── Lesson 14 · Part 5 · 心里有什么 ──────────────────────────────────────
  // Each 成语 has two pictures: the four characters themselves, and a drawing
  // of what it means. The card shows the drawing; the characters are set in
  // type above it, one cell each.
  // Part 1 · the three 独体字, each picture becoming its character
  'l14-p1-yan': require('./lesson_images/l14/l14-p1-yan.png'),
  'l14-p1-xin': require('./lesson_images/l14/l14-p1-xin.png'),
  'l14-p1-mu':  require('./lesson_images/l14/l14-p1-mu.png'),

  // Part 2 · a chart of each radical at work. The heart chart shows both
  // 忄 and 心, so it belongs on the 心字底 frame — on 竖心旁 it would give
  // away the second shape before the question asks for it.
  'l14-p2-yan': require('./lesson_images/l14/l14-p2-yan.png'),
  'l14-p2-xin': require('./lesson_images/l14/l14-p2-xin.png'),
  'l14-p2-mu':  require('./lesson_images/l14/l14-p2-mu.jpeg'),

  // Part 3 · one per dialogue
  'l14-p3-his-eyes':       require('./lesson_images/l14/l14-p3-his-eyes.png'),
  'l14-p3-moods':          require('./lesson_images/l14/l14-p3-moods.png'),
  'l14-p3-who-is-talking': require('./lesson_images/l14/l14-p3-who-is-talking.png'),

  'l14-p5-xin':                 require('./lesson_images/l14/l14-p5-xin.jpeg'),
  'l14-p5-xinxiangshicheng':    require('./lesson_images/l14/l14-p5-xinxiangshicheng.png'),
  'l14-p5-xinxiangshicheng-art':require('./lesson_images/l14/l14-p5-xinxiangshicheng-art.jpg'),
  'l14-p5-koushixinfei':        require('./lesson_images/l14/l14-p5-koushixinfei.jpeg'),
  'l14-p5-koushixinfei-art':    require('./lesson_images/l14/l14-p5-koushixinfei-art.jpg'),

  // ── Lesson 15 · 日 月 雨 ─────────────────────────────────────────────────
  'l15-p1-ri':  require('./lesson_images/l15/l15-p1-ri.png'),
  'l15-p1-yue': require('./lesson_images/l15/l15-p1-yue.png'),
  'l15-p1-yu':  require('./lesson_images/l15/l15-p1-yu.png'),

  // Part 5 · the two origins of 月, and what each one kept
  'l15-p5-split':       require('./lesson_images/l15/l15-p5-split.jpeg'),
  'l15-p5-two-origins': require('./lesson_images/l15/l15-p5-two-origins.jpeg'),
  'l15-p5-scripts':     require('./lesson_images/l15/l15-p5-scripts.jpeg'),
  'l15-p5-body':        require('./lesson_images/l15/l15-p5-body.jpeg'),
  'l15-p5-phases':      require('./lesson_images/l15/l15-p5-phases.jpeg'),
  'l15-p5-moon':        require('./lesson_images/l15/l15-p5-moon.jpeg'),

  // ── Lesson 16 · 耳 足, and the 阝 that is not an ear ─────────────────────
  'l16-p1-er': require('./lesson_images/l16/l16-p1-er.png'),
  'l16-p1-zu': require('./lesson_images/l16/l16-p1-zu.jpeg'),

  // The 跳舞还是跑步 dialogue asks about two things, so it carries two
  // pictures the way Lesson 12's 这/那 does.
  'l16-p3-on-the-road': require('./lesson_images/l16/l16-p3-on-the-road.webp'),
  'l16-p3-dancing':     require('./lesson_images/l16/l16-p3-dancing.png'),
  'l16-p3-running':     require('./lesson_images/l16/l16-p3-running.webp'),

  'l16-p5-not-an-ear': require('./lesson_images/l16/l16-p5-not-an-ear.png'),
  'l16-p5-fu':         require('./lesson_images/l16/l16-p5-fu.png'),
  'l16-p5-mountains':  require('./lesson_images/l16/l16-p5-mountains.jpeg'),
  'l16-p5-city':       require('./lesson_images/l16/l16-p5-city.jpeg'),
  'l16-p5-guo':        require('./lesson_images/l16/l16-p5-guo.jpeg'),
  'l16-p5-chen':       require('./lesson_images/l16/l16-p5-chen.jpeg'),

  // ── Lesson 17 · 花 草 山, and the green world under 艹 ───────────────────
  // Part 3 · one per dialogue
  'l17-p3-on-the-mountain': require('./lesson_images/l17/l17-p3-on-the-mountain.jpg'),
  'l17-p3-where-are-you':   require('./lesson_images/l17/l17-p3-where-are-you.jpg'),
  'l17-p3-where-going':     require('./lesson_images/l17/l17-p3-where-going.webp'),
  'l17-p3-tea':             require('./lesson_images/l17/l17-p3-tea.jpg'),
  'l17-p3-how-old':         require('./lesson_images/l17/l17-p3-how-old.jpg'),

  'l17-p5-huacha':    require('./lesson_images/l17/l17-p5-huacha.jpeg'),
  'l17-p5-hua':       require('./lesson_images/l17/l17-p5-hua.jpeg'),
  'l17-p5-hua-bloom': require('./lesson_images/l17/l17-p5-hua-bloom.jpeg'),
  'l17-p5-cao':       require('./lesson_images/l17/l17-p5-cao.jpeg'),
  'l17-p5-cha':       require('./lesson_images/l17/l17-p5-cha.jpeg'),
  'l17-p5-cha-plant': require('./lesson_images/l17/l17-p5-cha-plant.jpeg'),
  'l17-p5-cha-art':   require('./lesson_images/l17/l17-p5-cha-art.jpeg'),
  'l17-p5-cai':       require('./lesson_images/l17/l17-p5-cai.jpeg'),
  'l17-p5-shan':      require('./lesson_images/l17/l17-p5-shan.jpeg'),

  // ── Lesson 18 · 走 国 家, and what is inside the last two ────────────────
  'l18-p1-zou': require('./lesson_images/l18/l18-p1-zou.png'),
  'l18-p1-guo': require('./lesson_images/l18/l18-p1-guo.png'),
  'l18-p1-jia': require('./lesson_images/l18/l18-p1-jia.png'),

  'l18-p5-city-gate':      require('./lesson_images/l18/l18-p5-city-gate.jpeg'),
  'l18-p5-city-plan':      require('./lesson_images/l18/l18-p5-city-plan.jpeg'),
  'l18-p5-courtyard':      require('./lesson_images/l18/l18-p5-courtyard.jpeg'),
  'l18-p5-home-with-pigs': require('./lesson_images/l18/l18-p5-home-with-pigs.jpeg'),

  // ── Lesson 19 · 犬 丝 车, and why a colour is made of silk ───────────────
  'l19-p1-quan': require('./lesson_images/l19/l19-p1-quan.png'),
  'l19-p1-si':   require('./lesson_images/l19/l19-p1-si.png'),
  'l19-p1-che':  require('./lesson_images/l19/l19-p1-che.png'),

  // Part 5 · cocoon to cloth
  'l19-p5-cocoons':    require('./lesson_images/l19/l19-p5-cocoons.jpeg'),
  'l19-p5-reeling':    require('./lesson_images/l19/l19-p5-reeling.jpeg'),
  'l19-p5-threads':    require('./lesson_images/l19/l19-p5-threads.jpeg'),
  'l19-p5-spools':     require('./lesson_images/l19/l19-p5-spools.jpeg'),
  'l19-p5-weaving':    require('./lesson_images/l19/l19-p5-weaving.jpeg'),
  'l19-p5-silk-cloth': require('./lesson_images/l19/l19-p5-silk-cloth.jpeg'),
};

/** The asset for a key, or null when there is no artwork for it yet. */
export function getLessonImage(key) {
  return (key && LESSON_IMAGES[key]) || null;
}

export default LESSON_IMAGES;
