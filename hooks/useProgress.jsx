import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "chineseapp_progress_v1";

export const RANK_THRESHOLDS = [
  { minXP: 0,    rank: "Beginner",  rankChinese: "初学者", color: "#636e72" },
  { minXP: 100,  rank: "Explorer",  rankChinese: "探索者", color: "#54A0FF" },
  { minXP: 300,  rank: "Scholar",   rankChinese: "学者",   color: "#FF9F43" },
  { minXP: 600,  rank: "Master",    rankChinese: "大师",   color: "#FF6B6B" },
  { minXP: 1000, rank: "Legend",    rankChinese: "传奇",   color: "#a29bfe" },
];

export const ALL_BADGES = [
  { id: "first_step",    emoji: "🌱", name: "First Step",    nameChinese: "第一步",   desc: "Complete your first lesson" },
  { id: "on_fire",       emoji: "🔥", name: "On Fire",       nameChinese: "热情似火", desc: "Reach a 3-day streak" },
  { id: "week_streak",   emoji: "📅", name: "Week Warrior",  nameChinese: "坚持一周", desc: "Reach a 7-day streak" },
  { id: "star_student",  emoji: "⭐", name: "Star Student",  nameChinese: "优秀学生", desc: "Earn 100 XP" },
  { id: "century",       emoji: "💯", name: "Century",       nameChinese: "百分达人", desc: "Earn 200 XP" },
  { id: "champion",      emoji: "🏆", name: "Champion",      nameChinese: "冠军",     desc: "Complete all lessons in a level" },
  { id: "night_owl",     emoji: "🌙", name: "Night Owl",     nameChinese: "夜猫子",   desc: "Study after 9pm" },
  { id: "early_bird",    emoji: "☀️", name: "Early Bird",    nameChinese: "早起鸟",   desc: "Study before 8am" },
  { id: "perfectionist", emoji: "💎", name: "Perfectionist", nameChinese: "完美主义", desc: "Score 100% on a quiz" },
];

const DEFAULT_PROGRESS = {
  totalXP: 0,
  streak: 0,
  lastPlayedDate: null,
  earnedBadges: [],
  levelProgress: {},   // { yct1: { lessonsCompleted: [], xp: 0, lessonScores: {} } }
  gamesPlayed: 0,
  hasCompletedOnboarding: false,
  userAge: null,
  placementResult: null,
  currentRecommendedLevel: null,  // updated when user changes level
};

export function getRank(totalXP) {
  let rank = RANK_THRESHOLDS[0];
  for (const r of RANK_THRESHOLDS) { if (totalXP >= r.minXP) rank = r; }
  return rank;
}

export function getXPToNextRank(totalXP) {
  for (let i = 0; i < RANK_THRESHOLDS.length - 1; i++) {
    if (totalXP < RANK_THRESHOLDS[i + 1].minXP) {
      const cur = RANK_THRESHOLDS[i], nxt = RANK_THRESHOLDS[i + 1];
      return { nextRank: nxt, xpNeeded: nxt.minXP - totalXP, progress: (totalXP - cur.minXP) / (nxt.minXP - cur.minXP) };
    }
  }
  return { nextRank: null, xpNeeded: 0, progress: 1 };
}

// Returns average score across all played lessons in a level (0–1), or null if none played
export function getLevelAverageScore(levelProgress, levelId) {
  const lp = levelProgress?.[levelId];
  if (!lp?.lessonScores) return null;
  const scores = Object.values(lp.lessonScores);
  if (scores.length === 0) return null;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

function todayString() { return new Date().toISOString().split("T")[0]; }
function yesterdayString() { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split("T")[0]; }

export default function useProgress() {
  const [progress, setProgress] = useState(DEFAULT_PROGRESS);
  const [loaded, setLoaded] = useState(false);
  // Transient: set when a lesson finishes with poor score — triggers suggest modal
  const [poorLessonAlert, setPoorLessonAlert] = useState(null); // { levelId, avgScore }

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          const p = { ...DEFAULT_PROGRESS, ...saved };
          const today = todayString(), yesterday = yesterdayString();
          const updated = (!p.lastPlayedDate || p.lastPlayedDate === today || p.lastPlayedDate === yesterday)
            ? p : { ...p, streak: 0 };
          setProgress(updated);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
      } catch (e) { console.warn("load error:", e); }
      finally { setLoaded(true); }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress)).catch(console.warn);
  }, [progress, loaded]);

  const completeOnboarding = useCallback(({ age, result }) => {
    setProgress((prev) => ({
      ...prev,
      hasCompletedOnboarding: true,
      userAge: age,
      placementResult: result,
      currentRecommendedLevel: result?.recommendedLevel ?? null,
    }));
  }, []);

  const redoOnboarding = useCallback(() => {
    setProgress((prev) => ({ ...prev, hasCompletedOnboarding: false, placementResult: null }));
  }, []);

  // ── Change recommended level manually ─────────────────────────
  const changeLevel = useCallback((newLevelId) => {
    setProgress((prev) => ({ ...prev, currentRecommendedLevel: newLevelId }));
    setPoorLessonAlert(null);
  }, []);

  // ── Dismiss the poor-lesson alert ─────────────────────────────
  const dismissPoorAlert = useCallback(() => setPoorLessonAlert(null), []);

  // ── Record a lesson score + check for poor performance ────────
  // Call this at the end of every game with the lesson's score (0–1)
  const recordLessonScore = useCallback((levelId, lessonNumber, scorePercent) => {
    setProgress((prev) => {
      const lp = prev.levelProgress[levelId] || { lessonsCompleted: [], xp: 0, lessonScores: {} };
      const lessonScores = { ...(lp.lessonScores || {}), [lessonNumber]: scorePercent };
      const newLevelProgress = {
        ...prev.levelProgress,
        [levelId]: { ...lp, lessonScores },
      };

      // Check if average for this level is now below 50%
      const scores = Object.values(lessonScores);
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg < 0.5 && scores.length >= 1) {
        // Trigger alert outside of setState (use setTimeout to avoid batching issues)
        setTimeout(() => setPoorLessonAlert({ levelId, avgScore: avg }), 300);
      }

      return { ...prev, levelProgress: newLevelProgress };
    });
  }, []);

  // ── Award XP + badges ─────────────────────────────────────────
  const awardXP = useCallback((xpAmount, levelId, lessonNumber, scorePercent = 1) => {
    setProgress((prev) => {
      const today = todayString();
      const hour = new Date().getHours();
      let newStreak = prev.streak;
      if (prev.lastPlayedDate !== today)
        newStreak = prev.lastPlayedDate === yesterdayString() ? prev.streak + 1 : 1;
      const newTotalXP = prev.totalXP + xpAmount;
      const newGamesPlayed = prev.gamesPlayed + 1;
      const lp = prev.levelProgress[levelId] || { lessonsCompleted: [], xp: 0, lessonScores: {} };
      const lessonsCompleted = lp.lessonsCompleted.includes(lessonNumber)
        ? lp.lessonsCompleted : [...lp.lessonsCompleted, lessonNumber];
      const newLevelProgress = {
        ...prev.levelProgress,
        [levelId]: { ...lp, lessonsCompleted, xp: lp.xp + xpAmount },
      };
      const earned = new Set(prev.earnedBadges);
      const newBadges = [];
      const add = (id) => { if (!earned.has(id)) { earned.add(id); newBadges.push(id); } };
      if (newGamesPlayed >= 1) add("first_step");
      if (newStreak >= 3)      add("on_fire");
      if (newStreak >= 7)      add("week_streak");
      if (newTotalXP >= 100)   add("star_student");
      if (newTotalXP >= 200)   add("century");
      if (hour >= 21)          add("night_owl");
      if (hour < 8)            add("early_bird");
      if (scorePercent >= 1.0) add("perfectionist");
      const LC = { yct1:11, yct2:3, yct3:2, yct4:2, hsk1:3, hsk2:2, hsk3:2 };
      if ((LC[levelId]||0) > 0 && lessonsCompleted.length >= LC[levelId]) add("champion");
      return {
        ...prev, totalXP: newTotalXP, streak: newStreak, lastPlayedDate: today,
        earnedBadges: Array.from(earned), levelProgress: newLevelProgress,
        gamesPlayed: newGamesPlayed, _newBadges: newBadges, _xpEarned: xpAmount,
      };
    });
  }, []);

  // ── Simple XP + streak update (no lesson/level tracking) ──────
  // Updates streak: yesterday → increment, today → no change, older → reset to 1
  const addXP = useCallback((amount) => {
    setProgress((prev) => {
      const today = todayString();
      let newStreak = prev.streak;
      if (prev.lastPlayedDate !== today) {
        newStreak = prev.lastPlayedDate === yesterdayString() ? prev.streak + 1 : 1;
      }
      return {
        ...prev,
        totalXP: prev.totalXP + amount,
        streak: newStreak,
        lastPlayedDate: today,
      };
    });
  }, []);

  // ── Complete a lesson: awards 10 XP and updates streak ────────
  const completeLesson = useCallback(() => {
    addXP(10);
  }, [addXP]);

  const resetProgress = useCallback(async () => {
    setProgress(DEFAULT_PROGRESS);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    progress, loaded,
    // existing API
    awardXP, recordLessonScore,
    completeOnboarding, redoOnboarding,
    changeLevel, poorLessonAlert, dismissPoorAlert,
    resetProgress, getRank, getXPToNextRank,
    // Session 1: simple XP & streak API
    addXP,
    completeLesson,
    xp: progress.totalXP,
    streak: progress.streak,
    lastActiveDate: progress.lastPlayedDate,
  };
}