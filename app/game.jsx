import { useState, useEffect, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, ActivityIndicator
} from "react-native";
import FlashCard from "../components/Flashcards";
import MatchingGame from "../components/MatchingGame";
import WordShake from "../components/WordShake";
import SentenceBuilder from "../components/SentenceBuilder";
import RewardModal from "../components/RewardModal";
import useProgress from "../hooks/useProgress";

// ── Lesson loader ─────────────────────────────────────────────────
function loadLesson(levelId, lessonNumber) {
  const key = `${levelId}_${lessonNumber}`;
  const lessons = {
    yct1_1:  require("../data/yct1/lesson1.json"),
    yct1_2:  require("../data/yct1/lesson2.json"),
    yct1_3:  require("../data/yct1/lesson3.json"),
    yct1_4:  require("../data/yct1/lesson4.json"),
    yct1_5:  require("../data/yct1/lesson5.json"),
    yct1_6:  require("../data/yct1/lesson6.json"),
    yct1_7:  require("../data/yct1/lesson7.json"),
    yct1_8:  require("../data/yct1/lesson8.json"),
    yct1_9:  require("../data/yct1/lesson9.json"),
    yct1_10: require("../data/yct1/lesson10.json"),
    yct1_11: require("../data/yct1/lesson11.json"),
    yct2_2:  require("../data/yct2/lesson2.json"),
    yct2_6:  require("../data/yct2/lesson6.json"),
    yct2_7:  require("../data/yct2/lesson7.json"),
    yct3_2:  require("../data/yct3/lesson2.json"),
    yct3_8:  require("../data/yct3/lesson8.json"),
    yct4_2:  require("../data/yct4/lesson2.json"),
    yct4_4:  require("../data/yct4/lesson4.json"),
    hsk1_3:  require("../data/hsk1/lesson3.json"),
    hsk1_4:  require("../data/hsk1/lesson4.json"),
    hsk1_5:  require("../data/hsk1/lesson5.json"),
    hsk2_1:  require("../data/hsk2/lesson1.json"),
    hsk2_5:  require("../data/hsk2/lesson5.json"),
    hsk3_1:  require("../data/hsk3/lesson1.json"),
    hsk3_5:  require("../data/hsk3/lesson5.json"),
  };
  return lessons[key] || null;
}

const GAME_MODES = [
  { id: "flashcard", label: "Flashcards",      emoji: "🃏", desc: "Flip & learn" },
  { id: "matching",  label: "Match Cards",      emoji: "🎯", desc: "Beat the clock!" },
  { id: "wordshake", label: "Word Shake",       emoji: "🔤", desc: "Build the word!" },
  { id: "sentence",  label: "Sentence Builder", emoji: "🧩", desc: "Order the words!" },
  { id: "quiz",      label: "Quiz",             emoji: "❓", desc: "Test yourself" },
];

// ── XP amounts per game ───────────────────────────────────────────
function calcXP(mode, scorePercent) {
  const base = { flashcard: 15, matching: 20, wordshake: 20, sentence: 25, quiz: 30 };
  return Math.round((base[mode] || 15) * scorePercent);
}

export default function GameScreen({ navigation, route }) {
  const { levelId, lessonNumber, color } = route.params;
  const [lesson, setLesson]       = useState(null);
  const [mode, setMode]           = useState(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [score, setScore]         = useState(0);
  const [skipped, setSkipped]     = useState([]);
  const [finished, setFinished]   = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selected, setSelected]   = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone]   = useState(false);

  // Reward modal state
  const [rewardVisible, setRewardVisible] = useState(false);
  const rewardDataRef = useRef({ xpEarned: 0, scorePercent: 1 });

  const { progress, awardXP, recordLessonScore } = useProgress();

  useEffect(() => {
    const data = loadLesson(levelId, lessonNumber);
    setLesson(data);
  }, [levelId, lessonNumber]);

  // ── Show reward modal ─────────────────────────────────────────
  const showReward = (scorePercent) => {
    const xp = calcXP(mode, scorePercent);
    rewardDataRef.current = { xpEarned: xp, scorePercent };
    awardXP(xp, levelId, lessonNumber, scorePercent);
    recordLessonScore(levelId, lessonNumber, scorePercent);
    setRewardVisible(true);
  };

  const handleRewardClose = () => {
    setRewardVisible(false);
    navigation.goBack();
  };

  if (!lesson) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={color} />
        <Text style={styles.loadingText}>Loading lesson...</Text>
      </SafeAreaView>
    );
  }

  const vocab = lesson.vocabulary || [];

  // ─── Mode Picker ─────────────────────────────────────────────────
  if (!mode) {
    return (
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <ScrollView contentContainerStyle={styles.modeContainer}>
          <View style={[styles.lessonHeader, { borderColor: color }]}>
            <Text style={[styles.levelTag, { color }]}>{lesson.level} · Lesson {lesson.lesson}</Text>
            <Text style={styles.lessonTitle}>{lesson.topic}</Text>
            <Text style={styles.lessonChinese}>{lesson.topic_chinese}</Text>
          </View>

          {lesson.grammar_point && (
            <View style={styles.grammarBox}>
              <Text style={styles.grammarTitle}>📖 Grammar: {lesson.grammar_point.title}</Text>
              <Text style={styles.grammarText}>{lesson.grammar_point.explanation}</Text>
            </View>
          )}

          <Text style={styles.sectionLabel}>Vocabulary ({vocab.length} words)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vocabScroll}>
            {vocab.map((v) => (
              <View key={v.id} style={[styles.vocabChip, { borderColor: color }]}>
                <Text style={styles.vocabChinese}>{v.chinese}</Text>
                <Text style={styles.vocabPinyin}>{v.pinyin}</Text>
                <Text style={styles.vocabEnglish}>{v.english}</Text>
              </View>
            ))}
          </ScrollView>

          {lesson.key_sentences?.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Key Sentences</Text>
              {lesson.key_sentences.map((s, i) => (
                <View key={i} style={styles.sentenceRow}>
                  <Text style={styles.sentenceChinese}>{s.chinese}</Text>
                  <Text style={styles.sentencePinyin}>{s.pinyin}</Text>
                  <Text style={styles.sentenceEnglish}>{s.english}</Text>
                </View>
              ))}
            </>
          )}

          <Text style={styles.sectionLabel}>Choose a Game</Text>
          <View style={styles.modeRow}>
            {GAME_MODES.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[styles.modeBtn, { borderColor: color }]}
                onPress={() => setMode(m.id)}
              >
                <Text style={styles.modeEmoji}>{m.emoji}</Text>
                <Text style={[styles.modeLabel, { color }]}>{m.label}</Text>
                <Text style={styles.modeDesc}>{m.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Flashcard Mode ───────────────────────────────────────────────
  if (mode === "flashcard") {
    if (finished === true || finished === "reviewDone") {
      const scorePercent = vocab.length > 0 ? score / vocab.length : 1;
      return (
        <SafeAreaView style={styles.safe}>
          <View style={styles.finishContainer}>
            <Text style={styles.finishEmoji}>{skipped.length === 0 ? "🏆" : "🎉"}</Text>
            <Text style={styles.finishTitle}>{finished === "reviewDone" ? "Review Complete!" : "Round Complete!"}</Text>
            <Text style={styles.finishScore}>{score} / {vocab.length} cards familiar</Text>
            {skipped.length > 0 && <Text style={styles.finishSkipped}>😅 {skipped.length} card{skipped.length > 1 ? "s" : ""} marked "Not Familiar"</Text>}
            {skipped.length === 0 && <Text style={styles.finishPerfect}>✨ You knew all the cards!</Text>}
            <View style={styles.finishBtns}>
              {skipped.length > 0 && finished !== "reviewDone" && (
                <TouchableOpacity style={[styles.finishBtn, { backgroundColor: color }]} onPress={() => { setCardIndex(0); setFinished("review"); }}>
                  <Text style={styles.finishBtnText}>📚 Review {skipped.length} Unfamiliar Card{skipped.length > 1 ? "s" : ""}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.finishBtn, { backgroundColor: color }]}
                onPress={() => showReward(scorePercent)}
              >
                <Text style={styles.finishBtnText}>🏆 Collect Reward</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.finishBtnOutline} onPress={() => { setCardIndex(0); setScore(0); setSkipped([]); setFinished(false); }}>
                <Text style={styles.finishBtnOutlineText}>🔄 Play Again</Text>
              </TouchableOpacity>
            </View>
          </View>
          <RewardModal
            visible={rewardVisible}
            onClose={handleRewardClose}
            xpEarned={rewardDataRef.current.xpEarned}
            scorePercent={rewardDataRef.current.scorePercent}
            totalXP={progress.totalXP}
            newBadges={progress._newBadges || []}
            streak={progress.streak}
          />
        </SafeAreaView>
      );
    }

    const playingCards = finished === "review" ? skipped : vocab;
    const currentCard = playingCards[cardIndex];
    const isReviewRound = finished === "review";

    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.gameHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
          <Text style={[styles.gameTitle, { color }]}>{isReviewRound ? "📚 Reviewing" : "🃏 Flashcards"}</Text>
          <Text style={styles.scoreText}>⭐ {score}</Text>
        </View>
        {isReviewRound && (
          <View style={[styles.reviewBanner, { backgroundColor: color + "22", borderColor: color }]}>
            <Text style={[styles.reviewBannerText, { color }]}>Reviewing cards you marked "Not Familiar"</Text>
          </View>
        )}
        <FlashCard
          key={`${isReviewRound ? "review" : "full"}-${cardIndex}`}
          card={currentCard}
          color={color}
          cardIndex={cardIndex}
          totalCards={playingCards.length}
          onCorrect={() => {
            const newScore = score + 1;
            setScore(newScore);
            if (cardIndex + 1 >= playingCards.length) { setFinished(isReviewRound ? "reviewDone" : true); setCardIndex(0); }
            else setCardIndex(cardIndex + 1);
          }}
          onSkip={() => {
            if (!isReviewRound) setSkipped([...skipped, currentCard]);
            if (cardIndex + 1 >= playingCards.length) { setFinished(isReviewRound ? "reviewDone" : true); setCardIndex(0); }
            else setCardIndex(cardIndex + 1);
          }}
        />
      </SafeAreaView>
    );
  }

  // ─── Matching Game Mode ───────────────────────────────────────────
  if (mode === "matching") {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.gameHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
          <Text style={[styles.gameTitle, { color }]}>🎯 Match Cards</Text>
          <View style={{ width: 60 }} />
        </View>
        <MatchingGame
          vocab={vocab} levelId={levelId} color={color}
          onFinish={() => showReward(1)}
        />
        <RewardModal
          visible={rewardVisible} onClose={handleRewardClose}
          xpEarned={rewardDataRef.current.xpEarned} scorePercent={1}
          totalXP={progress.totalXP} newBadges={progress._newBadges || []} streak={progress.streak}
        />
      </SafeAreaView>
    );
  }

  // ─── Sentence Builder Mode ────────────────────────────────────────
  if (mode === "sentence") {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.gameHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
          <Text style={[styles.gameTitle, { color }]}>🧩 Sentence Builder</Text>
          <View style={{ width: 60 }} />
        </View>
        <SentenceBuilder
          vocab={vocab} sentences={lesson.key_sentences || []} levelId={levelId} color={color}
          onFinish={() => showReward(1)}
        />
        <RewardModal
          visible={rewardVisible} onClose={handleRewardClose}
          xpEarned={rewardDataRef.current.xpEarned} scorePercent={1}
          totalXP={progress.totalXP} newBadges={progress._newBadges || []} streak={progress.streak}
        />
      </SafeAreaView>
    );
  }

  // ─── Word Shake Mode ──────────────────────────────────────────────
  if (mode === "wordshake") {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.gameHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
          <Text style={[styles.gameTitle, { color }]}>🔤 Word Shake</Text>
          <View style={{ width: 60 }} />
        </View>
        <WordShake
          vocab={vocab} levelId={levelId} color={color}
          onFinish={() => showReward(1)}
        />
        <RewardModal
          visible={rewardVisible} onClose={handleRewardClose}
          xpEarned={rewardDataRef.current.xpEarned} scorePercent={1}
          totalXP={progress.totalXP} newBadges={progress._newBadges || []} streak={progress.streak}
        />
      </SafeAreaView>
    );
  }

  // ─── Quiz Mode ────────────────────────────────────────────────────
  if (mode === "quiz") {
    const questions = lesson.quiz || [];

    if (questions.length === 0) {
      return (
        <SafeAreaView style={styles.safe}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.center}>
            <Text style={styles.noQuizText}>No quiz available for this lesson yet.</Text>
          </View>
        </SafeAreaView>
      );
    }

    if (quizDone) {
      const pct = quizScore / questions.length;
      return (
        <SafeAreaView style={styles.safe}>
          <View style={styles.finishContainer}>
            <Text style={styles.finishEmoji}>{pct >= 0.8 ? "🏆" : pct >= 0.5 ? "👍" : "📚"}</Text>
            <Text style={styles.finishTitle}>Quiz Done!</Text>
            <Text style={styles.finishScore}>{quizScore} / {questions.length} correct ({Math.round(pct * 100)}%)</Text>
            <Text style={styles.quizFeedback}>
              {pct >= 0.8 ? "Excellent! 太棒了！" : pct >= 0.5 ? "Good effort! 继续加油！" : "Keep practicing! 多练习！"}
            </Text>
            <View style={styles.finishBtns}>
              <TouchableOpacity style={[styles.finishBtn, { backgroundColor: color }]} onPress={() => showReward(pct)}>
                <Text style={styles.finishBtnText}>🏆 Collect Reward</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.finishBtnOutline} onPress={() => { setQuizIndex(0); setQuizScore(0); setSelected(null); setQuizDone(false); }}>
                <Text style={styles.finishBtnOutlineText}>🔄 Retry Quiz</Text>
              </TouchableOpacity>
            </View>
          </View>
          <RewardModal
            visible={rewardVisible} onClose={handleRewardClose}
            xpEarned={rewardDataRef.current.xpEarned} scorePercent={rewardDataRef.current.scorePercent}
            totalXP={progress.totalXP} newBadges={progress._newBadges || []} streak={progress.streak}
          />
        </SafeAreaView>
      );
    }

    const q = questions[quizIndex];
    const isAnswered = selected !== null;
    const isCorrect = selected === q.correct;
    const pinyinMap = {};
    vocab.forEach((v) => { pinyinMap[v.chinese] = v.pinyin; });
    const hasChinese = (str) => /[\u4e00-\u9fff]/.test(str);
    const lookupPinyin = (str) => pinyinMap[str] || null;

    const renderOption = (opt, textStyle) => {
      if (hasChinese(opt)) {
        const pinyin = lookupPinyin(opt);
        const isOptCorrect = isAnswered && opt === q.correct;
        const isOptWrong = isAnswered && opt === selected && opt !== q.correct;
        return (
          <View style={styles.optionInner}>
            <Text style={[textStyle, styles.optionChineseText]}>{opt}</Text>
            {pinyin && <Text style={[styles.optionPinyin, (isOptCorrect || isOptWrong) && styles.optionPinyinWhite]}>{pinyin}</Text>}
          </View>
        );
      }
      return <Text style={textStyle}>{opt}</Text>;
    };

    const correctPinyin = lookupPinyin(q.correct);
    const correctDisplay = hasChinese(q.correct) && correctPinyin ? `${q.correct}  (${correctPinyin})` : q.correct;

    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.gameHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
          <Text style={[styles.gameTitle, { color }]}>❓ Quiz</Text>
          <Text style={styles.scoreText}>⭐ {quizScore}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.quizContainer}>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>{quizIndex + 1} / {questions.length}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${((quizIndex + 1) / questions.length) * 100}%`, backgroundColor: color }]} />
            </View>
          </View>
          <View style={[styles.questionBox, { borderColor: color }]}>
            <Text style={styles.questionText}>{q.question}</Text>
          </View>
          {q.options.map((opt) => {
            let optStyle = styles.optionBtn;
            let textStyle = styles.optionText;
            if (isAnswered) {
              if (opt === q.correct) { optStyle = [styles.optionBtn, styles.optionCorrect]; textStyle = [styles.optionText, styles.optionTextWhite]; }
              else if (opt === selected && opt !== q.correct) { optStyle = [styles.optionBtn, styles.optionWrong]; textStyle = [styles.optionText, styles.optionTextWhite]; }
            }
            return (
              <TouchableOpacity key={opt} style={optStyle} onPress={() => { if (!isAnswered) { setSelected(opt); if (opt === q.correct) setQuizScore(quizScore + 1); } }} disabled={isAnswered}>
                {renderOption(opt, textStyle)}
              </TouchableOpacity>
            );
          })}
          {isAnswered && (
            <View style={[styles.feedbackBox, { backgroundColor: isCorrect ? "#d4edda" : "#fdecea" }]}>
              <Text style={styles.feedbackText}>{isCorrect ? "✅ Correct! 太棒了！" : `❌ The answer is: ${correctDisplay}`}</Text>
            </View>
          )}
          {isAnswered && (
            <TouchableOpacity style={[styles.nextBtn, { backgroundColor: color }]} onPress={() => { setSelected(null); if (quizIndex + 1 >= questions.length) setQuizDone(true); else setQuizIndex(quizIndex + 1); }}>
              <Text style={styles.nextBtnText}>{quizIndex + 1 >= questions.length ? "See Results 🏆" : "Next Question →"}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8f9fa" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: 12, color: "#636e72", fontSize: 15 },
  backBtn: { padding: 16 },
  backText: { color: "#636e72", fontSize: 15, fontWeight: "500" },
  gameHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: "#f1f2f6" },
  gameTitle: { fontSize: 17, fontWeight: "800" },
  scoreText: { fontSize: 16, fontWeight: "700", color: "#2d3436" },
  modeContainer: { padding: 20, paddingBottom: 60 },
  lessonHeader: { backgroundColor: "#1a1a2e", borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 2 },
  levelTag: { fontSize: 12, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },
  lessonTitle: { fontSize: 24, fontWeight: "800", color: "#fff", marginTop: 4 },
  lessonChinese: { fontSize: 16, color: "#a29bfe", marginTop: 4 },
  grammarBox: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  grammarTitle: { fontSize: 14, fontWeight: "700", color: "#2d3436", marginBottom: 6 },
  grammarText: { fontSize: 13, color: "#636e72", lineHeight: 20 },
  sectionLabel: { fontSize: 16, fontWeight: "800", color: "#2d3436", marginBottom: 10, marginTop: 8 },
  vocabScroll: { marginBottom: 16 },
  vocabChip: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginRight: 10, alignItems: "center", borderWidth: 1.5, minWidth: 90 },
  vocabChinese: { fontSize: 22, fontWeight: "700", color: "#1a1a2e" },
  vocabPinyin: { fontSize: 12, color: "#636e72", marginTop: 4 },
  vocabEnglish: { fontSize: 11, color: "#b2bec3", marginTop: 2, textAlign: "center" },
  sentenceRow: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 8 },
  sentenceChinese: { fontSize: 18, fontWeight: "700", color: "#2d3436" },
  sentencePinyin: { fontSize: 13, color: "#636e72", marginTop: 2 },
  sentenceEnglish: { fontSize: 13, color: "#b2bec3", marginTop: 2 },
  modeRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  modeBtn: { width: "47%", backgroundColor: "#fff", borderRadius: 16, padding: 20, alignItems: "center", borderWidth: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  modeEmoji: { fontSize: 30, marginBottom: 6 },
  modeLabel: { fontSize: 16, fontWeight: "800" },
  modeDesc: { fontSize: 12, color: "#b2bec3", marginTop: 2 },
  finishContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 30 },
  finishEmoji: { fontSize: 64, marginBottom: 16 },
  finishTitle: { fontSize: 28, fontWeight: "800", color: "#2d3436" },
  finishScore: { fontSize: 20, color: "#636e72", marginTop: 8 },
  finishSkipped: { fontSize: 14, color: "#FF6B6B", marginTop: 6 },
  finishPerfect: { fontSize: 15, color: "#1DD1A1", marginTop: 6, fontWeight: "600" },
  reviewBanner: { marginHorizontal: 16, marginBottom: 4, padding: 10, borderRadius: 10, borderWidth: 1, alignItems: "center" },
  reviewBannerText: { fontSize: 13, fontWeight: "700" },
  quizFeedback: { fontSize: 18, color: "#636e72", marginTop: 8, textAlign: "center" },
  finishBtns: { marginTop: 30, width: "100%", gap: 12 },
  finishBtn: { padding: 18, borderRadius: 16, alignItems: "center" },
  finishBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  finishBtnOutline: { padding: 18, borderRadius: 16, alignItems: "center", borderWidth: 2, borderColor: "#dfe6e9" },
  finishBtnOutlineText: { color: "#636e72", fontWeight: "700", fontSize: 15 },
  quizContainer: { padding: 20, paddingBottom: 40 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
  progressText: { fontSize: 13, color: "#636e72", fontWeight: "600", minWidth: 40 },
  progressBar: { flex: 1, height: 6, backgroundColor: "#dfe6e9", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  questionBox: { backgroundColor: "#1a1a2e", borderRadius: 20, padding: 24, marginBottom: 20, borderWidth: 2 },
  questionText: { fontSize: 18, fontWeight: "700", color: "#fff", lineHeight: 26 },
  optionBtn: { backgroundColor: "#fff", borderRadius: 14, padding: 18, marginBottom: 10, borderWidth: 1.5, borderColor: "#dfe6e9" },
  optionCorrect: { backgroundColor: "#1DD1A1", borderColor: "#1DD1A1" },
  optionWrong: { backgroundColor: "#FF6B6B", borderColor: "#FF6B6B" },
  optionText: { fontSize: 16, color: "#2d3436", fontWeight: "600" },
  optionTextWhite: { color: "#fff" },
  feedbackBox: { borderRadius: 12, padding: 14, marginBottom: 16 },
  feedbackText: { fontSize: 15, fontWeight: "700", color: "#2d3436" },
  nextBtn: { padding: 18, borderRadius: 16, alignItems: "center" },
  nextBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  noQuizText: { fontSize: 16, color: "#636e72" },
  optionInner: { alignItems: "center" },
  optionChineseText: { fontSize: 22, fontWeight: "700" },
  optionPinyin: { fontSize: 13, color: "#636e72", marginTop: 3 },
  optionPinyinWhite: { color: "rgba(255,255,255,0.85)" },
});
