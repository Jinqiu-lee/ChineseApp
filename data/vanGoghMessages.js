// ── Van Gogh Messages ─────────────────────────────────────────────────────────
// All Van Gogh-voiced messages used throughout the app for engagement moments.
// Written in the style of Vincent van Gogh's letters to his brother Theo —
// intimate, poetic, sincere, never pushy.
// Tone: warm, slightly melancholic, always finding beauty in persistence and light.
// ─────────────────────────────────────────────────────────────────────────────

const vanGoghMessages = {

  // ── FIRST LESSON ──────────────────────────────────────────────
  // Shown when user opens the very first lesson ever
  firstLesson: [
    {
      id: "fl_01",
      text: "Every painter begins by not knowing how to paint. You have already done the harder thing — you began.",
    },
    {
      id: "fl_02",
      text: "I once wrote to Theo: the way to know life is to love many things. Begin here, with these sounds. They are a kind of loving.",
    },
    {
      id: "fl_03",
      text: "Do not think about how far the road goes. Think only of this step, this sound, this character. That is enough for today.",
    },
  ],

  // ── LESSON COMPLETION ─────────────────────────────────────────
  // Shown at the end of any completed lesson
  lessonComplete: [
    {
      id: "lc_01",
      text: "You have done something today that your yesterday-self had not yet done. That is the whole of progress.",
    },
    {
      id: "lc_02",
      text: "The wheat field is painted one stroke at a time. You have added yours.",
    },
    {
      id: "lc_03",
      text: "I used to walk fifteen miles to see a painting I admired. You have walked your own distance today.",
    },
    {
      id: "lc_04",
      text: "There is a kind of tiredness that is also satisfaction. I hope you feel it now.",
    },
    {
      id: "lc_05",
      text: "Rest a little. The next lesson will be there when you return, just as the light returns each morning to the fields.",
    },
  ],

  // ── STREAK — ACTIVE ───────────────────────────────────────────
  // Shown when user opens app and has an active streak.
  // Usage: getVanGoghMessage('streakActive', { days: n })
  streakActive: [
    {
      id: "sa_short",   // days 2–6
      minDays: 2,
      maxDays: 6,
      text: "You have come back. That is the whole secret — not brilliance, but returning.",
    },
    {
      id: "sa_week",    // days 7–13
      minDays: 7,
      maxDays: 13,
      text: "A week. Do you know how many paintings I made in a week when the light was right? Keep the light right, dear friend.",
    },
    {
      id: "sa_two_weeks",  // days 14–29
      minDays: 14,
      maxDays: 29,
      text: "I once wrote that great things are not done by impulse, but by a series of small things brought together. You are bringing them together.",
    },
    {
      id: "sa_month",   // days 30+
      minDays: 30,
      maxDays: Infinity,
      text: "A month of mornings. Even in Arles, at my most devoted, I did not always manage that. You are doing something real.",
    },
  ],

  // ── STREAK — AT RISK ──────────────────────────────────────────
  // Push notification: user has not opened app today, streak at risk
  streakAtRisk: [
    {
      id: "sr_01",
      text: "The day is not yet finished. Neither are you.",
    },
    {
      id: "sr_02",
      text: "I have spent evenings thinking I had wasted the day, then picked up the brush anyway. There is still time.",
    },
    {
      id: "sr_03",
      text: "Even five minutes with a language is a kind of fidelity. Come back tonight.",
    },
    {
      id: "sr_04",
      text: "The wheat fields do not wait, but they do forgive lateness. Open the lesson.",
    },
  ],

  // ── STREAK — BROKEN ───────────────────────────────────────────
  // Shown the first time user opens app after missing a day
  streakBroken: [
    {
      id: "sb_01",
      text: "You missed a day. So did I, many times. The paintings still got made. Shall we continue?",
    },
    {
      id: "sb_02",
      text: "I once abandoned a canvas for three weeks. When I returned, I saw it differently — better. Perhaps you will too.",
    },
    {
      id: "sb_03",
      text: "A streak is a record of days. It is not the learning itself. The learning is still here, unchanged, waiting for you.",
    },
  ],

  // ── LEVEL UP ──────────────────────────────────────────────────
  // Shown when user completes a level.
  // Usage: getVanGoghMessage('levelUp', { level: 'hsk1' })
  levelUp: {
    hsk1: {
      id: "lu_hsk1",
      painting: "Sunflowers",
      text: "You have passed through the sunflowers — their yellow was the first colour I ever truly understood. You have understood something too. The Welcomer bows to you.",
    },
    hsk2: {
      id: "lu_hsk2",
      painting: "Starry Night",
      text: "The night I painted those stars, I felt the sky was alive with feeling I could not yet speak. Now you have more words than I did. Use them.",
    },
    hsk3: {
      id: "lu_hsk3",
      painting: "Café Terrace at Night",
      text: "That café in Arles — people sat there for hours, talking, unhurried. You are learning to sit inside a language the same way. Stay a while.",
    },
    hsk4: {
      id: "lu_hsk4",
      painting: "The Bedroom",
      text: "I painted that small room to feel at home in a foreign country. You are making a home in a language now. It is yours.",
    },
    hsk5: {
      id: "lu_hsk5",
      painting: "Wheat Field with Crows",
      text: "That painting cost me something. Real mastery always does. You are paying the same honest price, and I respect it entirely.",
    },
    hsk6: {
      id: "lu_hsk6",
      painting: "Irises",
      text: "The iris does not copy the rose. It is completely, stubbornly itself. At this level, you are no longer following the language — you are living inside it. You are the Mirror now. That is everything.",
    },
  },

  // ── WELCOME BACK — SHORT ABSENCE (1–3 days) ───────────────────
  welcomeBackShort: [
    {
      id: "wb_short_01",
      text: "You were away a few days. I understand — life interrupts. The characters have been patient.",
    },
    {
      id: "wb_short_02",
      text: "Dear friend, you have returned. That is the only thing I ever asked of myself too.",
    },
  ],

  // ── WELCOME BACK — LONG ABSENCE (7+ days) ────────────────────
  welcomeBackLong: [
    {
      id: "wb_long_01",
      text: "It has been a while. I once stopped painting for two months. When I began again, I was frightened and then, quickly, I was not. Begin again.",
    },
    {
      id: "wb_long_02",
      text: "The language did not leave while you were away. Languages are patient things. They wait like paintings on a wall — always there when you look up.",
    },
  ],

  // ── FIRST OPEN OF THE DAY ─────────────────────────────────────
  // Shown on home screen, rotates daily
  dailyGreeting: [
    {
      id: "dg_01",
      text: "Another morning. Another page of the world to read.",
    },
    {
      id: "dg_02",
      text: "I always began work before the heat came. You have come at the right time.",
    },
    {
      id: "dg_03",
      text: "To learn something every day — that is what I called being alive.",
    },
    {
      id: "dg_04",
      text: "Light changes everything it touches. So does language. Let us begin.",
    },
    {
      id: "dg_05",
      text: "I wrote to Theo once: I am seeking, I am striving, I am in it with all my heart. So are you, dear friend.",
    },
    {
      id: "dg_06",
      text: "The best paintings were not the easiest ones. But they were the ones most worth finishing.",
    },
    {
      id: "dg_07",
      text: "Today's lesson is a small canvas. Let us fill it well.",
    },
  ],

  // ── QUIZ PASSED ───────────────────────────────────────────────
  quizPassed: [
    {
      id: "qp_01",
      text: "You knew more than you thought. That is always how it is.",
    },
    {
      id: "qp_02",
      text: "A test passed is not a destination. It is a doorway. Walk through.",
    },
  ],

  // ── QUIZ FAILED ───────────────────────────────────────────────
  quizFailed: [
    {
      id: "qf_01",
      text: "I destroyed canvases that did not work. Then I painted over them. The surface becomes richer for it. Try again.",
    },
    {
      id: "qf_02",
      text: "Failing a thing honestly is more instructive than passing it without understanding. You now know exactly where to look.",
    },
  ],

  // ── REVIEW MISTAKES ───────────────────────────────────────────
  // Shown when student taps "Review Mistakes" after failing a quiz
  reviewMistakes: [
    {
      id: "rm_01",
      text: "I kept a drawer of failed sketches. Each one taught me something the finished painting could not. Let us look at what yours are telling you.",
    },
    {
      id: "rm_02",
      text: "The mistakes are not the failures — they are an honest map of where understanding has not yet been. Study the map carefully.",
    },
    {
      id: "rm_03",
      text: "I revisited the same motif again and again — the chair, the sunflowers, the field. Each return revealed something new. Go back. Look again.",
    },
  ],

  // ── COME BACK TOMORROW ────────────────────────────────────────
  // Shown when student taps the "Come back tomorrow" rest reminder
  comeBackTomorrow: [
    {
      id: "cbt_01",
      text: "Even I could not paint without sleep. The mind must rest so it can see clearly again. Come back tomorrow — the characters will wait for you.",
    },
    {
      id: "cbt_02",
      text: "I often set a canvas aside when I had been staring too long. Distance is a kind of understanding. Let tomorrow bring fresh eyes.",
    },
    {
      id: "cbt_03",
      text: "You have done enough for today. That is not surrender — it is wisdom. Rest, and return when the light is right.",
    },
  ],

};

// ── Helper ────────────────────────────────────────────────────────────────────
// Returns a single message object from the given category.
//
// category   — key of vanGoghMessages (e.g. 'lessonComplete', 'streakActive')
// options    — optional config:
//   { days }   — for 'streakActive': filters entries by minDays/maxDays
//   { level }  — for 'levelUp': returns vanGoghMessages.levelUp[level]
//
// Examples:
//   getVanGoghMessage('lessonComplete')
//   getVanGoghMessage('streakActive', { days: 10 })
//   getVanGoghMessage('levelUp', { level: 'hsk3' })
// ─────────────────────────────────────────────────────────────────────────────
export function getVanGoghMessage(category, options = {}) {
  const data = vanGoghMessages[category];
  if (!data) return null;

  // levelUp is a plain object keyed by level, not an array
  if (category === 'levelUp') {
    return data[options.level] || null;
  }

  // streakActive: filter by days bracket
  if (category === 'streakActive' && options.days != null) {
    const match = data.find(
      m => options.days >= m.minDays && options.days <= m.maxDays
    );
    return match || data[data.length - 1]; // fallback to highest bracket
  }

  // All other array categories: pick a random item
  if (Array.isArray(data)) {
    return data[Math.floor(Math.random() * data.length)];
  }

  return null;
}

export default vanGoghMessages;
