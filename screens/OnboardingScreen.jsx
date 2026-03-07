import { useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, Animated, Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BASIC_QUESTIONS_ADULT,
  ADVANCED_QUESTIONS, getPlacementResult,
} from "../data/placementQuestions";

const LEVELS_MANUAL = [
  { id: "hsk1", label: "Level 1 – Beginner",             badge: "🌱", color: "#00D2D3", desc: "Complete beginner, starting from scratch" },
  { id: "hsk2", label: "Level 2 – Explorer",             badge: "🚶", color: "#54A0FF", desc: "Know basics, ready to build vocabulary" },
  { id: "hsk3", label: "Level 3 – Conversation Builder", badge: "🗣",  color: "#1DD1A1", desc: "Can hold simple conversations" },
  { id: "hsk4", label: "Level 4 – Confident Speaker",    badge: "🌟", color: "#FF9F43", desc: "Comfortable with everyday Chinese" },
  { id: "hsk5", label: "Level 5 – Communicator",         badge: "🔥", color: "#a29bfe", desc: "Advanced, near-fluent communication" },
];

const MANUAL_RANK_MAP = {
  hsk1: { level: "Beginner",             levelChinese: "初级", badge: "🌱", color: "#00D2D3", recommendedLevel: "hsk1", recommendedLabel: "Level 1 – Beginner",             message: "Great! We'll start you at Level 1 – Beginner." },
  hsk2: { level: "Explorer",             levelChinese: "基础", badge: "🚶", color: "#54A0FF", recommendedLevel: "hsk2", recommendedLabel: "Level 2 – Explorer",             message: "Great! We'll start you at Level 2 – Explorer." },
  hsk3: { level: "Conversation Builder", levelChinese: "中级", badge: "🗣",  color: "#1DD1A1", recommendedLevel: "hsk3", recommendedLabel: "Level 3 – Conversation Builder", message: "Great! We'll start you at Level 3 – Conversation Builder." },
  hsk4: { level: "Confident Speaker",    levelChinese: "高级", badge: "🌟", color: "#FF9F43", recommendedLevel: "hsk4", recommendedLabel: "Level 4 – Confident Speaker",    message: "Great! We'll start you at Level 4 – Confident Speaker." },
  hsk5: { level: "Communicator",         levelChinese: "精通", badge: "🔥", color: "#a29bfe", recommendedLevel: "hsk5", recommendedLabel: "Level 5 – Communicator",         message: "Great! We'll start you at Level 5 – Communicator." },
};

// ── CEFR level details (for results screen & levels panel) ───────
const LEVEL_DETAILS = [
  { id: "hsk1", number: 1, cefrLabel: "Beginner",           cefr: "A1",  emoji: "🌱", color: "#00D2D3",
    willLearn: ["Introduce yourself in Chinese", "Use basic greetings and farewells", "Count numbers and tell the time", "Understand ~150 Chinese words"] },
  { id: "hsk2", number: 2, cefrLabel: "Elementary",         cefr: "A2",  emoji: "🚶", color: "#54A0FF",
    willLearn: ["Talk about daily routines", "Discuss weather and seasons", "Navigate simple transactions", "Understand ~300 Chinese words"] },
  { id: "hsk3", number: 3, cefrLabel: "Lower Intermediate", cefr: "A2+", emoji: "🗣",  color: "#1DD1A1",
    willLearn: ["Talk about daily life", "Understand common conversations", "Share opinions and experiences", "Use 500~600 Chinese words"] },
  { id: "hsk4", number: 4, cefrLabel: "Intermediate",       cefr: "B1",  emoji: "🌟", color: "#FF9F43",
    willLearn: ["Hold fluent everyday conversations", "Discuss news and current events", "Express complex ideas in Chinese", "Use 1,000~1,200 Chinese words"] },
  { id: "hsk5", number: 5, cefrLabel: "Upper Intermediate", cefr: "B2",  emoji: "🔥", color: "#a29bfe",
    willLearn: ["Read Chinese newspapers and novels", "Watch Chinese films without subtitles", "Communicate fluently with native speakers", "Use 2,500+ Chinese words"] },
  { id: "hsk6", number: 6, cefrLabel: "Advanced",           cefr: "C1",  emoji: "🎓", color: "#fd79a8",
    willLearn: ["Express yourself effortlessly in Chinese", "Understand any style of written/spoken Chinese", "Near-native level proficiency", "Master 5,000+ Chinese words"] },
];
const LEVEL_DETAILS_MAP = Object.fromEntries(LEVEL_DETAILS.map(l => [l.id, l]));

const STEP_AGE    = "age";
const STEP_PATH   = "path";
const STEP_MANUAL = "manual";
const STEP_TEST   = "test";
const STEP_RESULTS= "results";

// ── Type badge labels ─────────────────────────────────────────────
const TYPE_LABELS = {
  mc:     { label: "💬 Multiple Choice", bg: "rgba(84,160,255,0.2)" },
  match:  { label: "🔤 Character Match",  bg: "rgba(29,209,161,0.2)" },
  pinyin: { label: "🔈 Pinyin",           bg: "rgba(162,155,254,0.2)" },
};

export default function OnboardingScreen({ onComplete, initialAge, onCancel }) {
  const [step, setStep]             = useState(initialAge ? STEP_PATH : STEP_AGE);
  const [age, setAge]               = useState(initialAge ? String(initialAge) : "");
  const [ageError, setAgeError]     = useState("");
  const [phase, setPhase]           = useState(1);
  const [questions, setQuestions]   = useState([]);
  const [qIndex, setQIndex]         = useState(0);
  const [selected, setSelected]     = useState(null);
  const [basicScore, setBasicScore] = useState(0);
  const [advScore, setAdvScore]     = useState(null);
  const [answered, setAnswered]     = useState(false);
  const [result, setResult]         = useState(null);
  const [showLevelsPanel, setShowLevelsPanel] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const fade = (cb) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 160, useNativeDriver: true }).start(() => {
      cb();
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  const handleAgeSubmit = () => {
    const n = parseInt(age, 10);
    if (!n || n < 12 || n > 99) { setAgeError("Please enter a valid age (12–99)"); return; }
    setAgeError("");
    fade(() => setStep(STEP_PATH));
  };

  const startTest = () => {
    const n = parseInt(age, 10);
    const qs = BASIC_QUESTIONS_ADULT;
    setQuestions(qs); setQIndex(0); setSelected(null);
    setAnswered(false); setBasicScore(0); setAdvScore(null); setPhase(1);
    fade(() => setStep(STEP_TEST));
  };

  // FIX 1: back button in test → go back to path picker
  const handleTestBack = () => {
    fade(() => {
      setStep(STEP_PATH);
      setQIndex(0); setSelected(null); setAnswered(false);
      setBasicScore(0); setAdvScore(null); setPhase(1);
    });
  };

  const handleAnswer = (opt) => { if (answered) return; setSelected(opt); setAnswered(true); };

  const handleNext = () => {
    const isCorrect = selected === questions[qIndex].correct;
    const newBasic = phase === 1 ? basicScore + (isCorrect ? 1 : 0) : basicScore;
    const newAdv   = phase === 2 ? (advScore ?? 0) + (isCorrect ? 1 : 0) : advScore;
    if (phase === 1) setBasicScore(newBasic);
    else setAdvScore(newAdv);

    const isLast = qIndex + 1 >= questions.length;
    if (isLast) {
      if (phase === 1) {
        const pct = newBasic / questions.length;
        if (pct >= 0.9) {
          fade(() => { setPhase(2); setQuestions(ADVANCED_QUESTIONS); setQIndex(0); setSelected(null); setAnswered(false); setAdvScore(0); });
        } else {
          const r = getPlacementResult(newBasic, questions.length, null, 15, parseInt(age, 10));
          setResult({ ...r, source: "test" }); fade(() => setStep(STEP_RESULTS));
        }
      } else {
        const r = getPlacementResult(basicScore, 15, newAdv, questions.length, parseInt(age, 10));
        setResult({ ...r, source: "test" }); fade(() => setStep(STEP_RESULTS));
      }
    } else {
      fade(() => { setQIndex(qIndex + 1); setSelected(null); setAnswered(false); });
    }
  };

  const handleManualPick = (lvl) => {
    const rank = MANUAL_RANK_MAP[lvl.id];
    setResult({ ...rank, description: `You selected ${lvl.label}`, startFrom: "beginning", source: "manual" });
    fade(() => setStep(STEP_RESULTS));
  };

  const handleDone = () => onComplete({ age: parseInt(age, 10), result });

  const q = step === STEP_TEST && questions.length > 0 ? questions[qIndex] : null;
  const totalQ = questions.length;

  return (
    <SafeAreaView style={s.safe}>
      <Animated.View style={[s.container, { opacity: fadeAnim }]}>

        {/* ── AGE ── */}
        {step === STEP_AGE && (
          <ScrollView contentContainerStyle={s.centered}>
            <Text style={s.bigEmoji}>👋</Text>
            <Text style={s.title}>欢迎！Welcome!</Text>
            <Text style={s.subtitle}>Let's personalize your learning journey</Text>
            <Text style={s.label}>How old are you?</Text>
            <TextInput
              style={s.input} keyboardType="number-pad" value={age}
              onChangeText={(t) => { setAge(t); setAgeError(""); }}
              placeholder="Enter your age" placeholderTextColor="#636e72" maxLength={3}
            />
            {ageError ? <Text style={s.errorText}>{ageError}</Text> : null}
            <TouchableOpacity style={s.primaryBtn} onPress={handleAgeSubmit}>
              <Text style={s.primaryBtnText}>Continue →</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* ── PATH ── */}
        {step === STEP_PATH && (
          <ScrollView contentContainerStyle={s.centered}>
            <TouchableOpacity
              style={s.pathBackBtn}
              onPress={() => {
                if (initialAge) {
                  onCancel?.();
                } else {
                  fade(() => setStep(STEP_AGE));
                }
              }}
            >
              <Text style={s.backBtn}>← Back</Text>
            </TouchableOpacity>
            <Text style={s.bigEmoji}>📚</Text>
            <Text style={s.title}>How well do you know Chinese?</Text>
            <Text style={s.subtitle}>Age: {age}</Text>
            <TouchableOpacity style={s.pathCard} onPress={startTest}>
              <Text style={s.pathEmoji}>🎯</Text>
              <View style={s.pathInfo}>
                <Text style={s.pathTitle}>Take a Placement Test</Text>
                <Text style={s.pathDesc}>15–30 questions · ~5 min{"\n"}We'll find your exact level</Text>
              </View>
              <Text style={s.pathArrow}>→</Text>
            </TouchableOpacity>
            <Text style={s.orDivider}>— or —</Text>
            <TouchableOpacity style={[s.pathCard, s.pathCardAlt]} onPress={() => fade(() => setStep(STEP_MANUAL))}>
              <Text style={s.pathEmoji}>📋</Text>
              <View style={s.pathInfo}>
                <Text style={s.pathTitle}>I Know My Level</Text>
                <Text style={s.pathDesc}>Pick your level manually</Text>
              </View>
              <Text style={s.pathArrow}>→</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* ── MANUAL ── */}
        {step === STEP_MANUAL && (
          <ScrollView contentContainerStyle={s.scrollPad}>
            <TouchableOpacity onPress={() => fade(() => setStep(STEP_PATH))}>
              <Text style={s.backBtn}>← Back</Text>
            </TouchableOpacity>
            <Text style={s.title}>Choose Your Level</Text>
            <Text style={s.subtitle}>Pick the level that best matches you</Text>
            {LEVELS_MANUAL.map((lvl) => (
              <TouchableOpacity key={lvl.id} style={[s.levelCard, { borderColor: lvl.color }]} onPress={() => handleManualPick(lvl)} activeOpacity={0.8}>
                <Text style={s.levelEmoji}>{lvl.badge}</Text>
                <View style={s.levelInfo}>
                  <Text style={[s.levelLabel, { color: lvl.color }]}>{lvl.label}</Text>
                  <Text style={s.levelDesc}>{lvl.desc}</Text>
                </View>
                <Text style={[s.levelArrow, { color: lvl.color }]}>→</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ── TEST ── */}
        {step === STEP_TEST && q && (
          <View style={s.testContainer}>
            {/* FIX 1: Back button in header */}
            <View style={s.testHeader}>
              <TouchableOpacity onPress={handleTestBack} style={s.testBackBtn}>
                <Text style={s.testBackText}>← Back</Text>
              </TouchableOpacity>
              <Text style={s.testPhase}>
                {phase === 1 ? "Basic" : "Advanced"} · {qIndex + 1}/{totalQ}
              </Text>
              <View style={{ width: 60 }} />
            </View>
            <View style={s.testProgressBg}>
              <View style={[s.testProgressFill, { width: `${((qIndex + 1) / totalQ) * 100}%` }]} />
            </View>

            <ScrollView contentContainerStyle={s.testBody}>
              {/* Question type badge */}
              <View style={[s.typeBadge, { backgroundColor: TYPE_LABELS[q.type]?.bg }]}>
                <Text style={s.typeBadgeText}>{TYPE_LABELS[q.type]?.label}</Text>
              </View>

              {/* Question box */}
              <View style={s.questionBox}>
                <Text style={s.questionText}>{q.question}</Text>
                {/* FIX 2: show pinyin below question if it has Chinese */}
                {q.questionPinyin && (
                  <Text style={s.questionPinyin}>{q.questionPinyin}</Text>
                )}
                {/* FIX 3: pinyin questions show big character */}
                {q.type === "pinyin" && (
                  <Text style={s.pinyinCharDisplay}>{q.chineseWord}</Text>
                )}
                {/* match hint */}
                {q.hint && q.type === "match" && (
                  <Text style={s.questionHint}>Pinyin: {q.hint}</Text>
                )}
              </View>

              {/* ── MC options ── */}
              {q.type === "mc" && (
                <View style={s.mcList}>
                  {q.options.map((opt) => {
                    const isCorrectAns = opt === q.correct;
                    const isSelected = selected === opt;
                    let btnStyle = s.mcBtn;
                    let textStyle = s.mcBtnText;
                    if (answered) {
                      if (isCorrectAns) { btnStyle = [s.mcBtn, s.btnCorrect]; textStyle = [s.mcBtnText, s.btnTextWhite]; }
                      else if (isSelected) { btnStyle = [s.mcBtn, s.btnWrong]; textStyle = [s.mcBtnText, s.btnTextWhite]; }
                    } else if (isSelected) { btnStyle = [s.mcBtn, s.btnSelected]; }
                    const pin = q.optionPinyin?.[opt];
                    return (
                      <TouchableOpacity key={opt} style={btnStyle} onPress={() => handleAnswer(opt)} disabled={answered} activeOpacity={0.75}>
                        <Text style={textStyle}>{opt}</Text>
                        {/* FIX 2: show pinyin under Chinese options */}
                        {pin && <Text style={[s.optionPinyinText, answered && (isCorrectAns || isSelected) && s.optionPinyinWhite]}>{pin}</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* ── Match grid ── */}
              {q.type === "match" && (
                <View style={s.matchGrid}>
                  {q.options.map((opt) => {
                    const isCorrectAns = opt === q.correct;
                    const isSelected = selected === opt;
                    let btnStyle = s.matchBtn;
                    let textStyle = s.matchBtnText;
                    if (answered) {
                      if (isCorrectAns) { btnStyle = [s.matchBtn, s.btnCorrect]; textStyle = [s.matchBtnText, s.btnTextWhite]; }
                      else if (isSelected) { btnStyle = [s.matchBtn, s.btnWrong]; textStyle = [s.matchBtnText, s.btnTextWhite]; }
                    } else if (isSelected) { btnStyle = [s.matchBtn, s.btnSelected]; }
                    return (
                      <TouchableOpacity key={opt} style={btnStyle} onPress={() => handleAnswer(opt)} disabled={answered} activeOpacity={0.75}>
                        <Text style={textStyle}>{opt}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* FIX 3: Pinyin choice options */}
              {q.type === "pinyin" && (
                <View style={s.mcList}>
                  {q.options.map((opt) => {
                    const isCorrectAns = opt === q.correct;
                    const isSelected = selected === opt;
                    let btnStyle = s.mcBtn;
                    let textStyle = [s.mcBtnText, { fontStyle: "italic", letterSpacing: 0.5 }];
                    if (answered) {
                      if (isCorrectAns) { btnStyle = [s.mcBtn, s.btnCorrect]; textStyle = [...textStyle, s.btnTextWhite]; }
                      else if (isSelected) { btnStyle = [s.mcBtn, s.btnWrong]; textStyle = [...textStyle, s.btnTextWhite]; }
                    } else if (isSelected) { btnStyle = [s.mcBtn, s.btnSelected]; }
                    return (
                      <TouchableOpacity key={opt} style={btnStyle} onPress={() => handleAnswer(opt)} disabled={answered} activeOpacity={0.75}>
                        <Text style={textStyle}>{opt}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Feedback */}
              {answered && (
                <View style={[s.feedbackBox, { backgroundColor: selected === q.correct ? "#d4edda" : "#fdecea" }]}>
                  <Text style={s.feedbackText}>
                    {selected === q.correct ? "✅ Correct! 太棒了！" : `❌ Answer: ${q.correct}`}
                  </Text>
                </View>
              )}

              {answered && (
                <TouchableOpacity style={s.nextBtn} onPress={handleNext}>
                  <Text style={s.nextBtnText}>
                    {qIndex + 1 >= totalQ
                      ? (phase === 1 && (basicScore + (selected === q.correct ? 1 : 0)) / totalQ >= 0.9
                          ? "Next Level Questions →"
                          : "See My Results 🏆")
                      : "Next →"}
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        )}

        {/* ── RESULTS ── */}
        {step === STEP_RESULTS && result && (() => {
          const detail = LEVEL_DETAILS_MAP[result.recommendedLevel] || LEVEL_DETAILS_MAP.hsk1;
          return (
            <ScrollView contentContainerStyle={s.centered}>
              <Text style={s.testCompleteTitle}>
                {result.source === "test" ? "🎉 Test Complete!" : "🎉 Great Choice!"}
              </Text>

              {/* Main result card */}
              <View style={[s.resultCard2, { borderColor: detail.color }]}>
                <View style={s.resultCard2Top}>
                  <View>
                    <Text style={[s.resultCard2LevelNum, { color: detail.color }]}>
                      Level {detail.number}
                    </Text>
                    <Text style={s.resultCard2Cefr}>CEFR: {detail.cefr} · {detail.cefrLabel}</Text>
                  </View>
                  <Text style={s.resultCard2Emoji}>{detail.emoji}</Text>
                </View>
                <Text style={[s.resultCard2Name, { color: detail.color }]}>{result.level}</Text>
              </View>

              {/* You will learn */}
              <View style={s.willLearnBox}>
                <Text style={s.willLearnTitle}>You will learn:</Text>
                {detail.willLearn.map((item, i) => (
                  <View key={i} style={s.willLearnRow}>
                    <Text style={[s.willLearnCheck, { color: detail.color }]}>✔</Text>
                    <Text style={s.willLearnText}>{item}</Text>
                  </View>
                ))}
              </View>

              {/* Score breakdown (test only) */}
              {advScore !== null && (
                <View style={s.scoreBreakdown}>
                  <Text style={s.scoreBreakdownTitle}>Your Scores</Text>
                  <Text style={s.scoreBreakdownLine}>Basic: {basicScore}/15 ({Math.round(basicScore / 15 * 100)}%)</Text>
                  <Text style={s.scoreBreakdownLine}>Advanced: {advScore}/{ADVANCED_QUESTIONS.length} ({Math.round(advScore / ADVANCED_QUESTIONS.length * 100)}%)</Text>
                </View>
              )}

              <TouchableOpacity style={s.showLevelsBtn} onPress={() => setShowLevelsPanel(true)}>
                <Text style={s.showLevelsBtnText}>Show Language Levels</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[s.primaryBtn, { backgroundColor: detail.color }]} onPress={handleDone}>
                <Text style={s.primaryBtnText}>👉 Start Learning</Text>
              </TouchableOpacity>
            </ScrollView>
          );
        })()}

      </Animated.View>

      {/* ── Language Levels Panel Modal ── */}
      <Modal
        visible={showLevelsPanel}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLevelsPanel(false)}
      >
        <View style={s.levelsOverlay}>
          <View style={s.levelsSheet}>
            <View style={s.levelsSheetHeader}>
              <Text style={s.levelsSheetTitle}>Language Levels</Text>
              <TouchableOpacity onPress={() => setShowLevelsPanel(false)}>
                <Text style={s.levelsSheetClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {LEVEL_DETAILS.map((lvl) => {
                const isCurrent = result && lvl.id === result.recommendedLevel;
                const isAdvanced = lvl.number === 6;
                return (
                  <TouchableOpacity
                    key={lvl.id}
                    style={[
                      s.levelsItem,
                      isCurrent && { backgroundColor: lvl.color + "18", borderColor: lvl.color },
                    ]}
                    onPress={() => isAdvanced && alert("🎓 Advanced level is coming soon!\n\nKeep working through the earlier levels. 加油！")}
                    activeOpacity={isAdvanced ? 0.7 : 1}
                  >
                    <Text style={[s.levelsItemEmoji, !isCurrent && !isAdvanced && { opacity: 0.7 }]}>{lvl.emoji}</Text>
                    <View style={s.levelsItemInfo}>
                      <View style={s.levelsItemRow}>
                        <Text style={[s.levelsItemNum, { color: isCurrent ? lvl.color : "#636e72" }]}>
                          Level {lvl.number}
                        </Text>
                        <Text style={s.levelsItemCefr}>{lvl.cefr}</Text>
                        {isCurrent && (
                          <View style={[s.levelsCurrentBadge, { backgroundColor: lvl.color }]}>
                            <Text style={s.levelsCurrentBadgeText}>YOUR LEVEL</Text>
                          </View>
                        )}
                        {isAdvanced && (
                          <View style={s.levelsSoonBadge}>
                            <Text style={s.levelsSoonText}>COMING SOON</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[s.levelsItemName, isCurrent && { color: lvl.color, fontWeight: "800" }]}>
                        {lvl.cefrLabel}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
              <View style={{ height: 24 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: "#1a1a2e" },
  container:    { flex: 1 },
  centered:     { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  scrollPad:    { padding: 24, paddingBottom: 48 },
  bigEmoji:     { fontSize: 64, marginBottom: 16 },
  title:        { fontSize: 26, fontWeight: "800", color: "#fff", textAlign: "center", marginBottom: 8 },
  subtitle:     { fontSize: 14, color: "#636e72", textAlign: "center", marginBottom: 28 },
  label:        { fontSize: 16, fontWeight: "600", color: "#a29bfe", marginBottom: 10 },
  input:        { backgroundColor: "#16213e", color: "#fff", fontSize: 22, fontWeight: "700", textAlign: "center", padding: 16, borderRadius: 16, width: "60%", marginBottom: 8, borderWidth: 2, borderColor: "#2d3436" },
  errorText:    { color: "#FF6B6B", fontSize: 13, marginBottom: 8 },
  primaryBtn:   { backgroundColor: "#FF6B6B", paddingVertical: 16, paddingHorizontal: 40, borderRadius: 16, marginTop: 12 },
  primaryBtnText:{ fontSize: 16, fontWeight: "800", color: "#fff" },

  pathCard:     { flexDirection: "row", alignItems: "center", backgroundColor: "#16213e", borderRadius: 20, padding: 20, width: "100%", marginBottom: 12, borderWidth: 2, borderColor: "#FF6B6B" },
  pathCardAlt:  { borderColor: "#54A0FF" },
  pathEmoji:    { fontSize: 32, marginRight: 14 },
  pathInfo:     { flex: 1 },
  pathTitle:    { fontSize: 17, fontWeight: "800", color: "#fff", marginBottom: 4 },
  pathDesc:     { fontSize: 12, color: "#636e72", lineHeight: 18 },
  pathArrow:    { fontSize: 20, color: "#636e72" },
  orDivider:    { color: "#636e72", fontSize: 13, marginVertical: 8 },

  pathBackBtn:  { alignSelf: "flex-start", marginBottom: 8 },
  backBtn:      { color: "#636e72", fontSize: 15, fontWeight: "500", marginBottom: 16 },
  levelCard:    { flexDirection: "row", alignItems: "center", backgroundColor: "#16213e", borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 2 },
  levelEmoji:   { fontSize: 28, marginRight: 14, width: 40, textAlign: "center" },
  levelInfo:    { flex: 1 },
  levelLabel:   { fontSize: 18, fontWeight: "800" },
  levelDesc:    { fontSize: 12, color: "#636e72", marginTop: 2 },
  levelArrow:   { fontSize: 18, fontWeight: "700" },

  // Test header — FIX 1
  testContainer:  { flex: 1 },
  testHeader:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 },
  testBackBtn:    { paddingVertical: 6, paddingRight: 12 },
  testBackText:   { color: "#636e72", fontSize: 15, fontWeight: "600" },
  testPhase:      { fontSize: 13, color: "#636e72", fontWeight: "600" },
  testProgressBg: { height: 5, backgroundColor: "rgba(255,255,255,0.08)", marginHorizontal: 16, borderRadius: 3, overflow: "hidden", marginBottom: 4 },
  testProgressFill:{ height: "100%", backgroundColor: "#FF6B6B", borderRadius: 3 },
  testBody:       { padding: 16, paddingBottom: 48 },

  typeBadge:      { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, marginBottom: 12 },
  typeBadgeText:  { fontSize: 12, fontWeight: "700", color: "#fff" },

  questionBox:    { backgroundColor: "#16213e", borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 2, borderColor: "#2d3436" },
  questionText:   { fontSize: 18, fontWeight: "700", color: "#fff", lineHeight: 26 },
  // FIX 2: pinyin below question
  questionPinyin: { fontSize: 14, color: "#a29bfe", marginTop: 8, fontStyle: "italic" },
  questionHint:   { fontSize: 13, color: "#a29bfe", marginTop: 8 },
  // FIX 3: big character for pinyin questions
  pinyinCharDisplay: { fontSize: 64, color: "#fff", fontWeight: "800", textAlign: "center", marginTop: 12 },

  mcList:         { gap: 10, marginBottom: 12 },
  mcBtn:          { backgroundColor: "#16213e", borderRadius: 14, padding: 16, borderWidth: 1.5, borderColor: "#2d3436" },
  mcBtnText:      { fontSize: 15, color: "#fff", fontWeight: "600" },
  // FIX 2: pinyin under options
  optionPinyinText:  { fontSize: 12, color: "#a29bfe", marginTop: 3, fontStyle: "italic" },
  optionPinyinWhite: { color: "rgba(255,255,255,0.75)" },

  matchGrid:      { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  matchBtn:       { width: "47%", backgroundColor: "#16213e", borderRadius: 14, padding: 20, borderWidth: 1.5, borderColor: "#2d3436", alignItems: "center" },
  matchBtnText:   { fontSize: 26, fontWeight: "800", color: "#fff" },

  btnSelected:    { borderColor: "#a29bfe", backgroundColor: "rgba(162,155,254,0.15)" },
  btnCorrect:     { backgroundColor: "#1DD1A1", borderColor: "#1DD1A1" },
  btnWrong:       { backgroundColor: "#FF6B6B", borderColor: "#FF6B6B" },
  btnTextWhite:   { color: "#fff" },

  feedbackBox:    { borderRadius: 12, padding: 14, marginBottom: 12 },
  feedbackText:   { fontSize: 14, fontWeight: "700", color: "#2d3436" },
  nextBtn:        { backgroundColor: "#FF6B6B", padding: 16, borderRadius: 14, alignItems: "center" },
  nextBtnText:    { color: "#fff", fontWeight: "800", fontSize: 15 },

  // Enhanced result card
  testCompleteTitle: { fontSize: 26, fontWeight: "900", color: "#fff", textAlign: "center", marginBottom: 20 },
  resultCard2:       { backgroundColor: "#16213e", borderRadius: 24, padding: 24, marginBottom: 16, borderWidth: 2, width: "100%" },
  resultCard2Top:    { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  resultCard2LevelNum: { fontSize: 22, fontWeight: "900" },
  resultCard2Cefr:   { fontSize: 13, color: "#636e72", marginTop: 4 },
  resultCard2Emoji:  { fontSize: 52 },
  resultCard2Name:   { fontSize: 20, fontWeight: "800" },

  // You will learn
  willLearnBox:   { backgroundColor: "#16213e", borderRadius: 20, padding: 20, marginBottom: 16, width: "100%" },
  willLearnTitle: { fontSize: 15, fontWeight: "800", color: "#fff", marginBottom: 12 },
  willLearnRow:   { flexDirection: "row", alignItems: "flex-start", marginBottom: 8, gap: 8 },
  willLearnCheck: { fontSize: 14, fontWeight: "800", marginTop: 1 },
  willLearnText:  { fontSize: 14, color: "#b2bec3", flex: 1, lineHeight: 20 },

  scoreBreakdown: { backgroundColor: "#16213e", borderRadius: 16, padding: 16, marginBottom: 16, width: "100%" },
  scoreBreakdownTitle: { fontSize: 13, fontWeight: "700", color: "#a29bfe", marginBottom: 8 },
  scoreBreakdownLine: { fontSize: 14, color: "#636e72", marginBottom: 4 },

  showLevelsBtn:     { borderWidth: 1.5, borderColor: "#a29bfe", borderRadius: 14, paddingVertical: 13, paddingHorizontal: 24, marginBottom: 12, width: "100%", alignItems: "center" },
  showLevelsBtnText: { fontSize: 15, fontWeight: "700", color: "#a29bfe" },

  // Language Levels Modal
  levelsOverlay:      { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
  levelsSheet:        { backgroundColor: "#16213e", borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 16, maxHeight: "80%" },
  levelsSheetHeader:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  levelsSheetTitle:   { fontSize: 20, fontWeight: "800", color: "#fff" },
  levelsSheetClose:   { fontSize: 22, color: "#636e72", paddingHorizontal: 4 },
  levelsItem:         { flexDirection: "row", alignItems: "center", borderRadius: 16, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.07)", gap: 12 },
  levelsItemEmoji:    { fontSize: 26, width: 32, textAlign: "center" },
  levelsItemInfo:     { flex: 1 },
  levelsItemRow:      { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 },
  levelsItemNum:      { fontSize: 13, fontWeight: "800" },
  levelsItemCefr:     { fontSize: 12, color: "#636e72", fontWeight: "600" },
  levelsCurrentBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  levelsCurrentBadgeText: { fontSize: 9, fontWeight: "900", color: "#fff", letterSpacing: 0.5 },
  levelsSoonBadge:    { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.08)" },
  levelsSoonText:     { fontSize: 9, fontWeight: "700", color: "#636e72", letterSpacing: 0.5 },
  levelsItemName:     { fontSize: 15, color: "#dfe6e9", fontWeight: "600" },
});
