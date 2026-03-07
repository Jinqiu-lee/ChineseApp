import { useState, useEffect, useRef, useCallback } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, ScrollView, Dimensions
} from "react-native";

const { width } = Dimensions.get("window");
const PINYIN_LEVELS = ["yct1", "yct2", "hsk1"];
const WORDS_PER_ROUND = 5;
const ROUNDS_PER_STAGE = 5;
const TOTAL_STAGES = 3;

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function splitPinyin(pinyin) {
  return pinyin.trim().split(/\s+/).filter(Boolean);
}

function splitChinese(chinese) {
  return chinese.trim().split("").filter((c) => /[\u4e00-\u9fff]/.test(c));
}

function pickWords(vocab, n) {
  return shuffle([...vocab]).slice(0, Math.min(n, vocab.length));
}

// For a given correct syllable/char, build a choice panel of 5:
// the correct one + 4 distractors from other vocab
function buildChoices(correctText, card, vocab, usePinyin) {
  const correctSet = new Set(
    usePinyin ? splitPinyin(card.pinyin) : splitChinese(card.chinese)
  );
  const pool = [];
  vocab.forEach((v) => {
    if (v.id === card.id) return;
    const parts = usePinyin ? splitPinyin(v.pinyin) : splitChinese(v.chinese);
    parts.forEach((p) => {
      if (!correctSet.has(p) && p !== correctText) pool.push(p);
    });
  });
  const unique = [...new Set(pool)];
  const distractors = shuffle(unique).slice(0, 4);
  return shuffle([correctText, ...distractors]);
}

export default function WordShake({ vocab, levelId, color, onFinish }) {
  const usePinyin = PINYIN_LEVELS.includes(levelId);

  // Stage / round structure
  const [stage, setStage]           = useState(1);
  const [round, setRound]           = useState(1);        // 1–5 within a stage
  const [stageDone, setStageDone]   = useState(false);
  const [gameDone, setGameDone]     = useState(false);
  const [stageTimes, setStageTimes] = useState([]);

  // Words for this round
  const [words, setWords]           = useState([]);
  const [wordIndex, setWordIndex]   = useState(0);

  // Current word state
  // syllableIndex = which syllable we're currently asking about
  const [syllableIndex, setSyllableIndex] = useState(0);
  const [choices, setChoices]       = useState([]);       // 5 options shown
  const [tapped, setTapped]         = useState(null);     // {text, correct}
  const [wordDone, setWordDone]     = useState(false);
  const [wordMistakes, setWordMistakes] = useState(0);

  // Scoring
  const [score, setScore]           = useState(0);
  const [mistakes, setMistakes]     = useState(0);
  const [roundDone, setRoundDone]   = useState(false);

  // Timer (per stage)
  const [elapsed, setElapsed]       = useState(0);
  const [stageElapsed, setStageElapsed] = useState(0);
  const [running, setRunning]       = useState(false);
  const [personalBest, setPersonalBest] = useState(null);
  const timerRef = useRef(null);

  const shakeAnim   = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(1)).current;

  // ── Get syllables for current word ───────────────────────────
  const getSyllables = (card) =>
    usePinyin ? splitPinyin(card.pinyin) : splitChinese(card.chinese);

  // ── Init choices for current syllable ────────────────────────
  const initChoices = useCallback((card, sylIdx) => {
    const syllables = getSyllables(card);
    const correct   = syllables[sylIdx];
    setChoices(buildChoices(correct, card, vocab, usePinyin));
    setTapped(null);
  }, [vocab, usePinyin]);

  // ── Init a word ───────────────────────────────────────────────
  const initWord = useCallback((card) => {
    setSyllableIndex(0);
    setWordDone(false);
    setWordMistakes(0);
    setTapped(null);
    initChoices(card, 0);
  }, [initChoices]);

  // ── Init a round (5 words) ────────────────────────────────────
  const initRound = useCallback((wordList) => {
    setWords(wordList);
    setWordIndex(0);
    setScore(0);
    setMistakes(0);
    setRoundDone(false);
    setElapsed(0);
    setRunning(true);
    initWord(wordList[0]);
  }, [initWord]);

  // ── Start stage ───────────────────────────────────────────────
  const startStage = useCallback((stageNum) => {
    setStage(stageNum);
    setRound(1);
    setStageDone(false);
    setStageElapsed(0);
    initRound(pickWords(vocab, WORDS_PER_ROUND));
  }, [vocab, initRound]);

  useEffect(() => { startStage(1); }, []);

  // ── Timer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
        setStageElapsed((e) => e + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  // ── Tap a choice ──────────────────────────────────────────────
  const handleChoiceTap = (text) => {
    if (tapped || wordDone) return;
    const card      = words[wordIndex];
    const syllables = getSyllables(card);
    const correct   = syllables[syllableIndex];
    const isCorrect = text === correct;

    setTapped({ text, correct: isCorrect });

    if (isCorrect) {
      // Flash green then move on
      Animated.sequence([
        Animated.spring(successAnim, { toValue: 1.04, useNativeDriver: true }),
        Animated.spring(successAnim, { toValue: 1, useNativeDriver: true }),
      ]).start();

      setTimeout(() => {
        const nextSyl = syllableIndex + 1;
        if (nextSyl >= syllables.length) {
          // Word complete!
          setWordDone(true);
          const pts = wordMistakes === 0 ? 2 : 1;
          setScore((s) => s + pts);
          setTimeout(() => {
            const nextWord = wordIndex + 1;
            if (nextWord >= words.length) {
              // Round done
              setRunning(false);
              setRoundDone(true);
            } else {
              setWordIndex(nextWord);
              initWord(words[nextWord]);
            }
          }, 700);
        } else {
          // Next syllable
          setSyllableIndex(nextSyl);
          initChoices(card, nextSyl);
        }
      }, 500);
    } else {
      // Flash red, shake, then reset choices (keep same syllable)
      setWordMistakes((m) => m + 1);
      setMistakes((m) => m + 1);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 14, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -14, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
      ]).start();
      setTimeout(() => {
        // Reshuffle choices, keep same syllable
        initChoices(card, syllableIndex);
      }, 600);
    }
  };

  // ── Round done → auto-advance or stage done ───────────────────
  useEffect(() => {
    if (!roundDone) return;
    const nextRound = round + 1;
    if (nextRound > ROUNDS_PER_STAGE) {
      // Stage complete
      setStageDone(true);
      setStageTimes((prev) => [...prev, stageElapsed]);
      setPersonalBest((pb) => pb === null || stageElapsed < pb ? stageElapsed : pb);
    } else {
      // Auto-advance to next round after 1.2s
      const t = setTimeout(() => {
        setRound(nextRound);
        initRound(pickWords(vocab, WORDS_PER_ROUND));
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [roundDone]);

  if (!words.length || wordIndex >= words.length) return null;
  const card      = words[wordIndex];
  const syllables = getSyllables(card);

  // ── Stage done screen ─────────────────────────────────────────
  if (stageDone) {
    const isLastStage = stage === TOTAL_STAGES;
    return (
      <ScrollView contentContainerStyle={styles.doneContainer}>
        <Text style={styles.doneEmoji}>{mistakes === 0 ? "⭐" : "🎉"}</Text>
        <Text style={styles.doneTitle}>Stage {stage} Complete!</Text>

        {/* Stage progress dots */}
        <View style={styles.stageDotsRow}>
          {Array.from({ length: TOTAL_STAGES }).map((_, i) => (
            <View key={i} style={[styles.stageDot, i < stage && { backgroundColor: color }]}>
              <Text style={[styles.stageDotText, i < stage && { color: "#fff" }]}>{i + 1}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.timeBox, { borderColor: color }]}>
          <Text style={styles.timeLabel}>STAGE TIME</Text>
          <Text style={[styles.timeBig, { color }]}>{formatTime(stageElapsed)}</Text>
          {personalBest !== null && stageElapsed === personalBest && (
            <View style={[styles.bestBadge, { backgroundColor: color }]}>
              <Text style={styles.bestBadgeText}>🏅 Personal Best!</Text>
            </View>
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color }]}>{score}</Text>
            <Text style={styles.statLabel}>Score</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: mistakes > 0 ? "#FF6B6B" : "#1DD1A1" }]}>
              {mistakes}
            </Text>
            <Text style={styles.statLabel}>Mistakes</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{ROUNDS_PER_STAGE}</Text>
            <Text style={styles.statLabel}>Rounds</Text>
          </View>
        </View>

        {!isLastStage ? (
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: color }]}
            onPress={() => startStage(stage + 1)}
          >
            <Text style={styles.doneBtnText}>▶ Continue to Stage {stage + 1}</Text>
          </TouchableOpacity>
        ) : (
          <>
            <Text style={styles.allDoneText}>🏆 All 3 Stages Complete!</Text>
            <View style={styles.stageBreakdown}>
              {stageTimes.map((t, i) => (
                <View key={i} style={styles.stageRow}>
                  <Text style={[styles.stageLabel, { color }]}>Stage {i + 1}</Text>
                  <Text style={styles.stageTime}>{formatTime(t)}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: color }]}
              onPress={() => {
                setStageTimes([]);
                startStage(1);
              }}
            >
              <Text style={styles.doneBtnText}>⚡ Play Again — Beat Your Time!</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.doneBtnOutline} onPress={onFinish}>
          <Text style={styles.doneBtnOutlineText}>← Back to Lesson</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ── Round transition banner (shown briefly) ───────────────────
  if (roundDone && round < ROUNDS_PER_STAGE) {
    return (
      <View style={styles.roundTransition}>
        <Text style={styles.roundTransitionEmoji}>✅</Text>
        <Text style={styles.roundTransitionText}>Round {round} done!</Text>
        <Text style={styles.roundTransitionSub}>Starting round {round + 1}…</Text>
      </View>
    );
  }

  // ── Main game ─────────────────────────────────────────────────
  return (
    <ScrollView contentContainerStyle={styles.wrapper} keyboardShouldPersistTaps="always">

      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.stageBadge}>
          <Text style={styles.stageBadgeText}>Stage {stage}/{TOTAL_STAGES}</Text>
        </View>
        <View style={[styles.timerBox, elapsed > 90 && styles.timerBoxWarn]}>
          <Text style={styles.timerIcon}>⏱</Text>
          <Text style={[styles.timerText, elapsed > 90 && styles.timerTextWarn]}>
            {formatTime(stageElapsed)}
          </Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>⭐ {score}</Text>
        </View>
      </View>

      {/* Round + word progress */}
      <View style={styles.progressRow}>
        <Text style={styles.progressLabel}>Round {round}/{ROUNDS_PER_STAGE}</Text>
        <View style={styles.wordDots}>
          {words.map((_, i) => (
            <View key={i} style={[
              styles.wordDot,
              i < wordIndex && { backgroundColor: color },
              i === wordIndex && { backgroundColor: color, transform: [{ scale: 1.3 }] },
            ]} />
          ))}
        </View>
        <Text style={styles.progressLabel}>{wordIndex + 1}/{words.length}</Text>
      </View>

      {/* Clue card */}
      <Animated.View style={[
        styles.clueCard,
        { borderColor: wordDone ? "#1DD1A1" : color },
        wordDone && styles.clueCardDone,
        { transform: [{ scale: successAnim }] },
      ]}>
        <Text style={styles.clueEnglish}>{card.english}</Text>
        {usePinyin ? (
          <Text style={styles.clueHint}>{card.chinese}</Text>
        ) : (
          <Text style={styles.clueHintSmall}>{card.pinyin}</Text>
        )}

        {/* Syllable progress — show placed syllables */}
        <View style={styles.syllableProgress}>
          {syllables.map((syl, i) => (
            <View key={i} style={[
              styles.sylSlot,
              i < syllableIndex && { backgroundColor: color, borderColor: color },
              i === syllableIndex && !wordDone && { borderColor: color, borderWidth: 2.5 },
              wordDone && { backgroundColor: "#1DD1A1", borderColor: "#1DD1A1" },
            ]}>
              <Text style={[
                styles.sylText,
                (i < syllableIndex || wordDone) && { color: "#fff" },
                i === syllableIndex && !wordDone && { color: color },
              ]}>
                {i < syllableIndex || wordDone ? syl : i === syllableIndex ? "?" : "·"}
              </Text>
            </View>
          ))}
        </View>

        {wordDone && (
          <Text style={styles.wordDoneText}>
            {wordMistakes === 0 ? "✅ Perfect! +2" : "✅ Got it! +1"}
          </Text>
        )}
      </Animated.View>

      {/* Current syllable question */}
      {!wordDone && (
        <View style={styles.questionBox}>
          <Text style={styles.questionLabel}>
            {usePinyin
              ? `Choose syllable ${syllableIndex + 1} of ${syllables.length}:`
              : `Choose character ${syllableIndex + 1} of ${syllables.length}:`}
          </Text>
        </View>
      )}

      {/* Choice buttons */}
      {!wordDone && (
        <Animated.View style={[styles.choicesGrid, { transform: [{ translateX: shakeAnim }] }]}>
          {choices.map((choice, i) => {
            const isTapped   = tapped?.text === choice;
            const isCorrect  = isTapped && tapped?.correct;
            const isWrong    = isTapped && !tapped?.correct;
            return (
              <TouchableOpacity
                key={`${choice}_${i}`}
                style={[
                  styles.choiceBtn,
                  { borderColor: isCorrect ? "#1DD1A1" : isWrong ? "#FF6B6B" : color },
                  isCorrect && { backgroundColor: "#1DD1A1" },
                  isWrong   && { backgroundColor: "#FF6B6B" },
                ]}
                onPress={() => handleChoiceTap(choice)}
                disabled={!!tapped}
                activeOpacity={0.75}
              >
                <Text style={[
                  styles.choiceText,
                  { color: isCorrect || isWrong ? "#fff" : color },
                ]}>
                  {choice}
                </Text>
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      )}

      {wordMistakes > 0 && !wordDone && (
        <Text style={styles.mistakeHint}>❌ {wordMistakes} mistake{wordMistakes > 1 ? "s" : ""}</Text>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: { padding: 16, paddingBottom: 40, backgroundColor: "#f0f4f8", flexGrow: 1 },

  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  stageBadge: { backgroundColor: "#1a1a2e", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  stageBadgeText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  timerBox: {
    flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#fff",
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  timerBoxWarn: { backgroundColor: "#fff3cd" },
  timerIcon: { fontSize: 15 },
  timerText: { fontSize: 20, fontWeight: "800", color: "#2d3436", letterSpacing: 1 },
  timerTextWarn: { color: "#e67e22" },
  scoreBox: { backgroundColor: "#fff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  scoreText: { fontSize: 14, fontWeight: "700", color: "#2d3436" },

  progressRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  progressLabel: { fontSize: 12, fontWeight: "700", color: "#b2bec3" },
  wordDots: { flexDirection: "row", gap: 6, alignItems: "center" },
  wordDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#dfe6e9" },

  clueCard: {
    backgroundColor: "#1a1a2e", borderRadius: 20, padding: 20, alignItems: "center",
    marginBottom: 14, borderWidth: 2.5,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  clueCardDone: { backgroundColor: "#0a2e1e", borderColor: "#1DD1A1" },
  clueEnglish: { fontSize: 22, fontWeight: "800", color: "#fff", textAlign: "center", marginBottom: 6 },
  clueHint: { fontSize: 32, color: "#a29bfe", fontWeight: "700", letterSpacing: 3, marginBottom: 12 },
  clueHintSmall: { fontSize: 16, color: "#a29bfe", letterSpacing: 1, marginBottom: 12 },

  syllableProgress: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center" },
  sylSlot: {
    minWidth: 48, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10,
    borderWidth: 2, borderColor: "#444", alignItems: "center",
  },
  sylText: { fontSize: 16, fontWeight: "800", color: "#636e72" },
  wordDoneText: { marginTop: 10, color: "#1DD1A1", fontWeight: "800", fontSize: 15 },

  questionBox: { marginBottom: 10 },
  questionLabel: { fontSize: 13, fontWeight: "700", color: "#636e72", textAlign: "center" },

  choicesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 12 },
  choiceBtn: {
    minWidth: (width - 56) / 3,
    paddingHorizontal: 14, paddingVertical: 14, borderRadius: 14,
    borderWidth: 2.5, backgroundColor: "#fff", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  choiceText: { fontSize: 18, fontWeight: "800" },
  mistakeHint: { textAlign: "center", fontSize: 13, color: "#FF6B6B", fontWeight: "600" },

  // Round transition
  roundTransition: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f0f4f8" },
  roundTransitionEmoji: { fontSize: 56, marginBottom: 12 },
  roundTransitionText: { fontSize: 24, fontWeight: "800", color: "#2d3436" },
  roundTransitionSub: { fontSize: 16, color: "#636e72", marginTop: 8 },

  // Stage done
  doneContainer: { alignItems: "center", padding: 24, paddingBottom: 50, backgroundColor: "#f0f4f8" },
  doneEmoji: { fontSize: 60, marginBottom: 10 },
  doneTitle: { fontSize: 26, fontWeight: "800", color: "#2d3436", marginBottom: 16 },
  stageDotsRow: { flexDirection: "row", gap: 12, marginBottom: 16, justifyContent: "center" },
  stageDot: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: "#dfe6e9",
    alignItems: "center", justifyContent: "center",
  },
  stageDotText: { fontSize: 15, fontWeight: "800", color: "#b2bec3" },
  timeBox: {
    alignItems: "center", borderWidth: 3, borderRadius: 24,
    paddingHorizontal: 36, paddingVertical: 18, marginBottom: 16, backgroundColor: "#fff", width: "100%",
  },
  timeLabel: { fontSize: 11, color: "#b2bec3", fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  timeBig: { fontSize: 50, fontWeight: "800", letterSpacing: 2, marginTop: 4 },
  bestBadge: { marginTop: 10, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  bestBadgeText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16, width: "100%" },
  statBox: {
    flex: 1, backgroundColor: "#fff", borderRadius: 14, padding: 14, alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  statNum: { fontSize: 26, fontWeight: "800", color: "#2d3436" },
  statLabel: { fontSize: 11, color: "#b2bec3", marginTop: 4, fontWeight: "600", textTransform: "uppercase" },
  allDoneText: { fontSize: 20, fontWeight: "800", color: "#2d3436", marginBottom: 12 },
  stageBreakdown: { width: "100%", backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16 },
  stageRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f1f2f6" },
  stageLabel: { fontSize: 15, fontWeight: "700" },
  stageTime: { fontSize: 15, color: "#2d3436", fontWeight: "600" },
  doneBtn: { width: "100%", padding: 18, borderRadius: 16, alignItems: "center", marginBottom: 12 },
  doneBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  doneBtnOutline: { width: "100%", padding: 18, borderRadius: 16, alignItems: "center", borderWidth: 2, borderColor: "#dfe6e9" },
  doneBtnOutlineText: { color: "#636e72", fontWeight: "700", fontSize: 15 },
});
