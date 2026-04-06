import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Key format ────────────────────────────────────────────────────────────────
// "quizProgress_HSK1_Level_Quiz"
export function quizProgressKey(quizId) {
  return `quizProgress_${quizId}`;
}

// ── Default structure ─────────────────────────────────────────────────────────
//
// {
//   "quizId": "HSK1_Level_Quiz",
//   "passed": false,
//   "attempts": 2,
//   "lastAttemptDate": "2026-04-06",
//   "bestScore": 43,
//   "lastScore": 38,
//   "wrongQuestionIds": ["q3", "q7", "q12", "q15"],
//   "unlockedNext": false
// }
//
function defaultProgress(quizId) {
  return {
    quizId,
    passed: false,
    attempts: 0,
    lastAttemptDate: null,
    bestScore: 0,
    lastScore: 0,
    wrongQuestionIds: [],
    unlockedNext: false,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function isToday(dateStr) {
  return dateStr === getTodayString();
}

// ── Load ──────────────────────────────────────────────────────────────────────
export async function loadQuizProgress(quizId) {
  try {
    const raw = await AsyncStorage.getItem(quizProgressKey(quizId));
    if (!raw) return defaultProgress(quizId);
    return { ...defaultProgress(quizId), ...JSON.parse(raw) };
  } catch {
    return defaultProgress(quizId);
  }
}

// ── Save ──────────────────────────────────────────────────────────────────────
export async function saveQuizProgress(quizId, updates) {
  try {
    const existing = await loadQuizProgress(quizId);
    const merged = { ...existing, ...updates };
    await AsyncStorage.setItem(quizProgressKey(quizId), JSON.stringify(merged));
    return merged;
  } catch {
    return null;
  }
}

// ── Update after a quiz attempt ───────────────────────────────────────────────
// Returns the fully updated progress object (also persists it).
export async function recordQuizAttempt(quizId, { score, wrongQuestionIds, passScore = 60 }) {
  const existing = await loadQuizProgress(quizId);
  const today    = getTodayString();
  const passed   = score >= passScore;

  const updated = {
    quizId,
    passed,
    attempts:         existing.attempts + 1,
    lastAttemptDate:  today,
    lastScore:        score,
    bestScore:        Math.max(existing.bestScore, score),
    wrongQuestionIds: passed ? [] : wrongQuestionIds,
    unlockedNext:     passed || existing.unlockedNext,
  };

  await AsyncStorage.setItem(quizProgressKey(quizId), JSON.stringify(updated));
  return updated;
}

// ── "Come back tomorrow" logic ────────────────────────────────────────────────
// True when: not yet passed, 2+ attempts made, all on today's date.
export function shouldShowComeBackTomorrow(progress) {
  if (!progress) return false;
  return (
    !progress.passed &&
    progress.attempts >= 2 &&
    isToday(progress.lastAttemptDate)
  );
}
