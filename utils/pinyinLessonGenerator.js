// ──────────────────────────────────────────────────────────────────────────────
// Pinyin Lesson Stage Generator
// Generates exercise arrays for Stage 1, 2, 3 and the Lesson Quiz
// from a pinyin lesson JSON data object.
// ──────────────────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickN(arr, n) {
  return shuffle(arr).slice(0, n);
}

// ── Stage 1: Listen exercises ──────────────────────────────────────────────
// Items with listen_* type are audio-first exercises
export function buildStage1(lessonData, count = 12) {
  const pool = (lessonData.stage1_pool || []).filter(item =>
    item.type && item.type.startsWith('listen'),
  );
  if (pool.length === 0) return [];
  return pickN(pool, Math.min(count, pool.length));
}

// ── Stage 2: Read & Listen cards ──────────────────────────────────────────
// Items from stage2_pool — shown as "repeat after audio" cards
export function buildStage2(lessonData, count = 10) {
  const pool = lessonData.stage2_pool || [];
  if (pool.length === 0) return [];
  return pickN(pool, Math.min(count, pool.length)).map(item => ({
    ...item,
    type: 'speak_card', // mark as speak type for the stage runner
  }));
}

// ── Stage 3: Visual / Spelling exercises ──────────────────────────────────
// Items with visual_* or sandhi_choice or neutral_choice type
export function buildStage3(lessonData, count = 12) {
  const pool = (lessonData.stage3_pool || []).filter(item =>
    item.type && (
      item.type.startsWith('visual') ||
      item.type === 'sandhi_choice' ||
      item.type === 'neutral_choice'
    ),
  );
  if (pool.length === 0) return [];
  return pickN(pool, Math.min(count, pool.length));
}

// ── Stage 4: Listen & Speak (recording exercises) ─────────────────────────
// Items with listen_record or speak_record type — audio + microphone
export function buildStage4(lessonData, count = 12) {
  const pool = (lessonData.stage4_pool || []).filter(item =>
    item.type === 'listen_record' || item.type === 'speak_record',
  );
  if (pool.length === 0) return [];
  return pickN(pool, Math.min(count, pool.length));
}

// ── Lesson Quiz ────────────────────────────────────────────────────────────
// Mix of quiz_pool (standard) + stage4_pool (recording) questions
export function buildLessonQuiz(lessonData, count = 10) {
  const mainPool   = lessonData.quiz_pool   || [];
  const stage4Pool = lessonData.stage4_pool || [];
  // Pull up to 7 standard + up to 3 recording questions
  const fromMain   = pickN(mainPool,   Math.min(7, mainPool.length));
  const fromStage4 = pickN(stage4Pool, Math.min(3, stage4Pool.length));
  return shuffle([...fromMain, ...fromStage4]).slice(0, count);
}

// ── Final Review Quiz ──────────────────────────────────────────────────────
// Takes all 10 lessons, picks from all quiz_pools, 20 questions
export function buildFinalQuiz(allLessons, count = 20) {
  const all = allLessons.flatMap(lesson => lesson.quiz_pool || []);
  return pickN(all, Math.min(count, all.length));
}
