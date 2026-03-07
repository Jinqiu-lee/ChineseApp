import { useState, useEffect, useRef, useCallback } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Dimensions, ScrollView
} from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 56) / 2;

// Levels that show Chinese + Pinyin on cards
const PINYIN_LEVELS = ["yct1", "yct2", "hsk1"];

// Pick 6 random vocab items for one round
function pickCards(vocab, count = 6) {
  const shuffled = [...vocab].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Fisher-Yates shuffle
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Format seconds → "0:05" / "1:23"
function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MatchingGame({ vocab, levelId, color, onFinish }) {
  const showPinyin = PINYIN_LEVELS.includes(levelId);
  const TOTAL_STAGES     = 3;
  const ROUNDS_PER_STAGE = 5;

  // ── Game state ──────────────────────────────────────────────────
  const [stage, setStage]                    = useState(1);
  const [round, setRound]                    = useState(1);   // 1–5
  const [transitioning, setTransitioning]    = useState(false);
  const [selected, setSelected]              = useState([]);
  const [matched, setMatched]                = useState([]);
  const [wrong, setWrong]                    = useState([]);
  const [roundCards, setRoundCards]          = useState([]);
  const [leftCol, setLeftCol]                = useState([]);
  const [rightCol, setRightCol]              = useState([]);
  const [mistakes, setMistakes]              = useState(0);
  const [stageDone, setStageDone]            = useState(false);
  const [gameDone, setGameDone]              = useState(false);

  // Per-stage times for summary
  const [stageTimes, setStageTimes]  = useState([]);

  // ── Timer state ─────────────────────────────────────────────────
  const [elapsed, setElapsed]        = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [running, setRunning]        = useState(false);
  const [personalBest, setPersonalBest] = useState(null);
  const timerRef = useRef(null);

  // ── Animations ──────────────────────────────────────────────────
  const shakeAnims = useRef({});
  const scaleAnims = useRef({});
  const fadeAnims  = useRef({});

  // ── Init a round (board only, timer keeps running) ──────────────
  const initRound = useCallback((cards, resetTimer = false) => {
    cards.forEach((c) => {
      shakeAnims.current[c.id] = new Animated.Value(0);
      scaleAnims.current[c.id] = new Animated.Value(1);
      fadeAnims.current[c.id]  = new Animated.Value(1);
    });
    setRoundCards(cards);
    setLeftCol(shuffle(cards));
    setRightCol(shuffle(cards));
    setSelected([]);
    setMatched([]);
    setWrong([]);
    setStageDone(false);
    setTransitioning(false);
    if (resetTimer) {
      setElapsed(0);
      setRunning(true);
    }
  }, []);

  useEffect(() => {
    initRound(pickCards(vocab, 6), true);
  }, []);

  // ── Timer tick ──────────────────────────────────────────────────
  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  // ── Match check ─────────────────────────────────────────────────
  useEffect(() => {
    if (selected.length !== 2) return;
    const [a, b] = selected;
    if (a.id === b.id && a.side !== b.side) {
      // ✅ Correct match
      const newMatched = [...matched, a.id];
      setMatched(newMatched);

      // Pop animation
      Animated.sequence([
        Animated.spring(scaleAnims.current[a.id], { toValue: 1.12, useNativeDriver: true }),
        Animated.spring(scaleAnims.current[a.id], { toValue: 1, useNativeDriver: true }),
      ]).start();

      // Fade out after short delay
      setTimeout(() => {
        Animated.timing(fadeAnims.current[a.id], {
          toValue: 0, duration: 300, useNativeDriver: true,
        }).start();
      }, 400);

      setSelected([]);

      // Check if round complete
      if (newMatched.length === roundCards.length) {
        const nextRound = round + 1;
        if (nextRound > ROUNDS_PER_STAGE) {
          // ── Stage complete ──
          setRunning(false);
          setStageDone(true);
          const newTotal = totalElapsed + elapsed;
          setTotalElapsed(newTotal);
          setStageTimes((prev) => [...prev, elapsed]);
          setPersonalBest((pb) => pb === null || newTotal < pb ? newTotal : pb);
        } else {
          // ── Auto-advance to next round ──
          setTransitioning(true);
          setTimeout(() => {
            setRound(nextRound);
            shakeAnims.current = {};
            scaleAnims.current = {};
            fadeAnims.current  = {};
            initRound(pickCards(vocab, 6), false);
          }, 1000);
        }
      }
    } else {
      // ❌ Wrong match — shake both
      setWrong([a.id, b.id]);
      setMistakes((m) => m + 1);

      const ids = [a.id, b.id];
      ids.forEach((id) => {
        if (!shakeAnims.current[id]) return;
        Animated.sequence([
          Animated.timing(shakeAnims.current[id], { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnims.current[id], { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnims.current[id], { toValue: 7, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnims.current[id], { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
      });

      setTimeout(() => {
        setWrong([]);
        setSelected([]);
      }, 700);
    }
  }, [selected]);

  // ── Card press ──────────────────────────────────────────────────
  const handlePress = (card, side) => {
    if (selected.length === 2) return;
    if (wrong.length > 0) return;
    if (matched.includes(card.id)) return;

    // Prevent selecting same side twice
    if (selected.length === 1 && selected[0].side === side) {
      setSelected([{ id: card.id, side }]);
      return;
    }
    // Prevent deselecting same card
    if (selected.length === 1 && selected[0].id === card.id && selected[0].side === side) {
      setSelected([]);
      return;
    }
    setSelected([...selected, { id: card.id, side }]);
  };

  // ── Card state helpers ───────────────────────────────────────────
  const isSelected = (id, side) => selected.some((s) => s.id === id && s.side === side);
  const isMatched  = (id) => matched.includes(id);
  const isWrong    = (id) => wrong.includes(id);

  // ── Render a single card ─────────────────────────────────────────
  const renderCard = (card, side) => {
    const sel     = isSelected(card.id, side);
    const mat     = isMatched(card.id);
    const wrg     = isWrong(card.id);
    const shake   = shakeAnims.current[card.id] || new Animated.Value(0);
    const scale   = scaleAnims.current[card.id] || new Animated.Value(1);
    const fade    = fadeAnims.current[card.id]  || new Animated.Value(1);

    let bgColor = "#fff";
    let borderColor = "#e0e0e0";
    let textColor = "#2d3436";
    if (sel)  { bgColor = color;      borderColor = color;      textColor = "#fff"; }
    if (wrg)  { bgColor = "#FF6B6B";  borderColor = "#FF6B6B";  textColor = "#fff"; }
    if (mat)  { bgColor = "#1DD1A1";  borderColor = "#1DD1A1";  textColor = "#fff"; }

    return (
      <Animated.View
        key={`${side}-${card.id}`}
        style={{
          opacity: fade,
          transform: [{ translateX: shake }, { scale }],
        }}
      >
        <TouchableOpacity
          style={[styles.card, { backgroundColor: bgColor, borderColor, width: CARD_WIDTH }]}
          onPress={() => handlePress(card, side)}
          disabled={mat}
          activeOpacity={0.8}
        >
          {side === "left" ? (
            // Chinese side
            <View style={styles.cardInner}>
              <Text style={[styles.cardChinese, { color: textColor }]}>{card.chinese}</Text>
              {showPinyin && (
                <Text style={[styles.cardPinyin, { color: sel || wrg || mat ? "rgba(255,255,255,0.85)" : "#888" }]}>
                  {card.pinyin}
                </Text>
              )}
            </View>
          ) : (
            // English side
            <View style={styles.cardInner}>
              <Text style={[styles.cardEnglish, { color: textColor }]}>{card.english}</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // ── Game complete screen (all 3 stages done) ────────────────────
  if (gameDone) {
    const isNewBest = personalBest === totalElapsed;
    const accuracy  = Math.max(0, Math.round((roundCards.length * TOTAL_STAGES) /
      ((roundCards.length * TOTAL_STAGES) + mistakes) * 100));
    return (
      <ScrollView contentContainerStyle={styles.doneContainer}>
        <Text style={styles.doneEmoji}>{mistakes === 0 ? "🏆" : "🎉"}</Text>
        <Text style={styles.doneTitle}>All 3 Stages Complete!</Text>

        <View style={[styles.timeBox, { borderColor: color }]}>
          <Text style={styles.timeLabel}>TOTAL TIME</Text>
          <Text style={[styles.timeBig, { color }]}>{formatTime(totalElapsed)}</Text>
          {isNewBest && (
            <View style={[styles.bestBadge, { backgroundColor: color }]}>
              <Text style={styles.bestBadgeText}>🏅 Personal Best!</Text>
            </View>
          )}
          {!isNewBest && personalBest !== null && (
            <Text style={styles.bestText}>Best: {formatTime(personalBest)}</Text>
          )}
        </View>

        {/* Per-stage breakdown */}
        <View style={styles.stageBreakdown}>
          {stageTimes.map((t, i) => (
            <View key={i} style={styles.stageRow}>
              <Text style={[styles.stageLabel, { color }]}>Stage {i + 1}</Text>
              <Text style={styles.stageTime}>{formatTime(t)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{roundCards.length * TOTAL_STAGES}</Text>
            <Text style={styles.statLabel}>Pairs</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: mistakes > 0 ? "#FF6B6B" : "#1DD1A1" }]}>
              {mistakes}
            </Text>
            <Text style={styles.statLabel}>Mistakes</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color }]}>{accuracy}%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.doneBtn, { backgroundColor: color }]}
          onPress={() => {
            setStage(1);
            setRound(1);
            setMistakes(0);
            setStageTimes([]);
            setTotalElapsed(0);
            setGameDone(false);
            shakeAnims.current = {};
            scaleAnims.current = {};
            fadeAnims.current  = {};
            initRound(pickCards(vocab, 6), true);
          }}
        >
          <Text style={styles.doneBtnText}>⚡ Play Again — Beat Your Time!</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.doneBtnOutline}
          onPress={() => onFinish({ time: totalElapsed, mistakes })}
        >
          <Text style={styles.doneBtnOutlineText}>← Back to Lesson</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ── Stage complete screen ────────────────────────────────────────
  if (stageDone) {
    const isLastStage = stage === TOTAL_STAGES;
    const accuracy    = Math.max(0, Math.round(
      roundCards.length / (roundCards.length + mistakes) * 100
    ));
    return (
      <ScrollView contentContainerStyle={styles.doneContainer}>
        <Text style={styles.doneEmoji}>{mistakes === 0 ? "⭐" : "👍"}</Text>
        <Text style={styles.doneTitle}>Stage {stage} Complete!</Text>

        <View style={[styles.timeBox, { borderColor: color }]}>
          <Text style={styles.timeLabel}>STAGE TIME</Text>
          <Text style={[styles.timeBig, { color }]}>{formatTime(elapsed)}</Text>
          <Text style={styles.bestText}>Total so far: {formatTime(totalElapsed)}</Text>
        </View>

        {/* Stage progress indicator */}
        <View style={styles.stageDotsRow}>
          {Array.from({ length: TOTAL_STAGES }).map((_, i) => (
            <View key={i} style={[
              styles.stageDot,
              i < stage && { backgroundColor: color },
            ]}>
              <Text style={[styles.stageDotText, i < stage && { color: "#fff" }]}>
                {i + 1}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{roundCards.length}</Text>
            <Text style={styles.statLabel}>Pairs</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: mistakes > 0 ? "#FF6B6B" : "#1DD1A1" }]}>
              {mistakes}
            </Text>
            <Text style={styles.statLabel}>Mistakes</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color }]}>{accuracy}%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
        </View>

        {!isLastStage ? (
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: color }]}
            onPress={() => {
              setStage((s) => s + 1);
              setRound(1);
              setMistakes(0);
              shakeAnims.current = {};
              scaleAnims.current = {};
              fadeAnims.current  = {};
              initRound(pickCards(vocab, 6), true);
            }}
          >
            <Text style={styles.doneBtnText}>
              ▶ Continue to Stage {stage + 1}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: color }]}
            onPress={() => setGameDone(true)}
          >
            <Text style={styles.doneBtnText}>🏆 See Final Results</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.doneBtnOutline}
          onPress={() => onFinish({ time: totalElapsed, mistakes })}
        >
          <Text style={styles.doneBtnOutlineText}>← Back to Lesson</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ── Round transition flash ───────────────────────────────────────
  if (transitioning) {
    return (
      <View style={styles.transitionScreen}>
        <Text style={styles.transitionEmoji}>✅</Text>
        <Text style={styles.transitionText}>Round {round} done!</Text>
        <Text style={styles.transitionSub}>Stage {stage} · Round {round + 1} of {ROUNDS_PER_STAGE}…</Text>
      </View>
    );
  }

  // ── Main game board ──────────────────────────────────────────────
  return (
    <View style={styles.wrapper}>
      {/* Header row */}
      <View style={styles.header}>
        <View style={styles.roundBadge}>
          <Text style={styles.roundText}>S{stage} · R{round}/{ROUNDS_PER_STAGE}</Text>
        </View>

        {/* Live timer */}
        <View style={[styles.timerBox, elapsed > 60 && styles.timerBoxWarn]}>
          <Text style={styles.timerIcon}>⏱</Text>
          <Text style={[styles.timerText, elapsed > 60 && styles.timerTextWarn]}>
            {formatTime(elapsed)}
          </Text>
        </View>

        <View style={styles.mistakeBox}>
          <Text style={styles.mistakeText}>❌ {mistakes}</Text>
        </View>
      </View>

      {/* Personal best bar */}
      {personalBest !== null && (
        <View style={[styles.bestBar, { borderColor: color + "44" }]}>
          <Text style={[styles.bestBarText, { color }]}>
            🏅 Best: {formatTime(personalBest)}
          </Text>
        </View>
      )}

      {/* Progress dots */}
      <View style={styles.dotsRow}>
        {roundCards.map((c) => (
          <View
            key={c.id}
            style={[
              styles.dot,
              isMatched(c.id) && { backgroundColor: color },
            ]}
          />
        ))}
      </View>

      {/* Column headers */}
      <View style={styles.colHeaders}>
        <Text style={[styles.colHeader, { width: CARD_WIDTH }]}>
          {showPinyin ? "Chinese + Pinyin" : "Chinese"}
        </Text>
        <View style={styles.colDivider} />
        <Text style={[styles.colHeader, { width: CARD_WIDTH }]}>English</Text>
      </View>

      {/* Card grid */}
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        <View style={styles.columns}>
          {/* Left column — Chinese */}
          <View style={styles.col}>
            {leftCol.map((card) => renderCard(card, "left"))}
          </View>
          {/* Right column — English */}
          <View style={styles.col}>
            {rightCol.map((card) => renderCard(card, "right"))}
          </View>
        </View>
      </ScrollView>

      {/* Instruction */}
      <Text style={styles.instruction}>
        Tap a Chinese card, then its English match
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#f0f4f8",
    paddingTop: 8,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  roundBadge: {
    backgroundColor: "#1a1a2e",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roundText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  timerBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  timerBoxWarn: { backgroundColor: "#fff3cd" },
  timerIcon: { fontSize: 16 },
  timerText: { fontSize: 22, fontWeight: "800", color: "#2d3436", letterSpacing: 1 },
  timerTextWarn: { color: "#e67e22" },
  mistakeBox: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  mistakeText: { fontSize: 14, fontWeight: "700", color: "#636e72" },

  // Personal best bar
  bestBar: {
    marginHorizontal: 16,
    marginBottom: 6,
    padding: 6,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  bestBarText: { fontSize: 13, fontWeight: "700" },

  // Progress dots
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#dfe6e9",
  },

  // Column headers
  colHeaders: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 6,
    alignItems: "center",
    justifyContent: "space-between",
  },
  colHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: "#b2bec3",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  colDivider: { width: 8 },

  // Grid
  grid: { paddingHorizontal: 16, paddingBottom: 16 },
  columns: { flexDirection: "row", gap: 8 },
  col: { flex: 1, gap: 8 },

  // Cards
  card: {
    borderRadius: 14,
    borderWidth: 2,
    minHeight: 72,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  cardInner: { alignItems: "center" },
  cardChinese: { fontSize: 22, fontWeight: "800", letterSpacing: 1 },
  cardPinyin:  { fontSize: 12, marginTop: 3, fontWeight: "500" },
  cardEnglish: { fontSize: 14, fontWeight: "600", textAlign: "center", lineHeight: 20 },

  stageBreakdown: {
    width: "100%", backgroundColor: "#fff", borderRadius: 16,
    padding: 16, marginBottom: 16,
  },
  stageRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f1f2f6",
  },
  stageLabel: { fontSize: 15, fontWeight: "700" },
  stageTime: { fontSize: 15, color: "#2d3436", fontWeight: "600" },
  stageDotsRow: {
    flexDirection: "row", gap: 12, marginBottom: 20, justifyContent: "center",
  },
  stageDot: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#dfe6e9", alignItems: "center", justifyContent: "center",
  },
  stageDotText: { fontSize: 15, fontWeight: "800", color: "#b2bec3" },
  transitionScreen: {
    flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f0f4f8",
  },
  transitionEmoji: { fontSize: 56, marginBottom: 12 },
  transitionText: { fontSize: 24, fontWeight: "800", color: "#2d3436" },
  transitionSub: { fontSize: 16, color: "#636e72", marginTop: 8 },
  instruction: {
    textAlign: "center",
    fontSize: 12,
    color: "#b2bec3",
    paddingBottom: 12,
    fontStyle: "italic",
  },

  // Done screen
  doneContainer: {
    alignItems: "center",
    padding: 28,
    paddingBottom: 50,
  },
  doneEmoji: { fontSize: 64, marginBottom: 12 },
  doneTitle: { fontSize: 26, fontWeight: "800", color: "#2d3436", marginBottom: 20 },
  timeBox: {
    alignItems: "center",
    borderWidth: 3,
    borderRadius: 24,
    paddingHorizontal: 40,
    paddingVertical: 20,
    marginBottom: 20,
    backgroundColor: "#fff",
    width: "100%",
  },
  timeLabel: { fontSize: 12, color: "#b2bec3", fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  timeBig: { fontSize: 56, fontWeight: "800", letterSpacing: 2, marginTop: 4 },
  bestBadge: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  bestBadgeText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  bestText: { fontSize: 13, color: "#b2bec3", marginTop: 8 },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
    width: "100%",
  },
  statBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statNum:   { fontSize: 28, fontWeight: "800", color: "#2d3436" },
  statLabel: { fontSize: 11, color: "#b2bec3", marginTop: 4, fontWeight: "600", textTransform: "uppercase" },
  doneBtn: {
    width: "100%",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  doneBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  doneBtnOutline: {
    width: "100%",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#dfe6e9",
  },
  doneBtnOutlineText: { color: "#636e72", fontWeight: "700", fontSize: 15 },
});
