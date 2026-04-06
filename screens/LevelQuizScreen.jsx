import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Image, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenBackground from '../components/ScreenBackground';
import { LEVEL_SCREEN_PALETTES } from '../config/vanGoghTheme';
import { getAvatar } from '../config/avatarConfig';
import { DEEP_NAVY, WARM_ORANGE, SLATE_TEAL, WARM_BROWN, SOFT_SALMON, CARD_WHITE, TEXT_LIGHT, MUTED_LIGHT, SUCCESS, ERROR } from '../constants/colors';
import { getVanGoghMessage } from '../data/vanGoghMessages';
import { recordQuizAttempt, loadQuizProgress, shouldShowComeBackTomorrow } from '../utils/quizProgressStorage';
import ReviewMistakesScreen from './ReviewMistakesScreen';
import VanGoghMessageModal from '../components/VanGoghMessageModal';

const PASS_SCORE = 60;
const REVIEW_SCORE = 50;

// Chinese-only levels (hsk5 & hsk6) — avatar messages show no English
const CHINESE_ONLY_LEVELS = new Set(['hsk5', 'hsk6']);

const NEXT_LEVEL = {
  hsk1: { emoji: '🚶', name: 'Level 2 – Explorer' },
  hsk2: { emoji: '🗣',  name: 'Level 3 – Conversation Builder' },
  hsk3: { emoji: '🌟', name: 'Level 4 – Confident Speaker' },
  hsk4: { emoji: '🔥', name: 'Level 5 – Communicator' },
  hsk5: { emoji: '🎓', name: 'Level 6 – Advanced' },
};

// Import quiz data for each level
import hsk1QuizData from '../data/hsk1/hsk1_level_quiz.json';
import hsk2QuizData from '../data/hsk2/hsk2_level_quiz.json';
import hsk3QuizData from '../data/hsk3/hsk3_level_quiz.json';
import hsk4QuizData from '../data/hsk4_level4/hsk4_level_quiz.json';
import hsk5QuizData from '../data/hsk4_level5/hsk5_level_quiz.json';
import hsk6QuizData from '../data/hsk6/hsk6_level_quiz.json';

const QUIZ_BY_LEVEL = {
  hsk1: hsk1QuizData,
  hsk2: hsk2QuizData,
  hsk3: hsk3QuizData,
  hsk4: hsk4QuizData,
  hsk5: hsk5QuizData,
  hsk6: hsk6QuizData,
};

// ── Shuffle helper ──────────────────────────────────────────────────────────
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Avatar congratulations messages ────────────────────────────────────────
// Tiers: 'pass'=60-74%, 'mid'=75-89%, 'high'=90-99%, 100=100%
// Each message has { zh, en }. English is omitted for hsk5/hsk6.
const AVATAR_CONGRATS = {
  eileen: {
    100:  { zh: '完美无缺。你的中文已如诗如画，字字珠玑。我为你感到欣慰。', en: 'Flawless. Your Chinese has the precision of the finest prose. I am proud of you.' },
    high: { zh: '你的努力让语言有了灵魂。继续保持这份执着与敏感。', en: 'Your effort has given language a soul. Keep this dedication and sensitivity.' },
    mid:  { zh: '有些东西需要慢慢沉淀，就像好的文字一样。再深入一层吧。', en: 'Some things take time to settle — like good writing. Go one layer deeper.' },
    pass: { zh: '已经过关了。但语言的深处，还有更多等待你去发现。', en: "You've passed. But the depths of language still have more waiting for you." },
  },
  libai: {
    100:  { zh: '满分！今日你如诗仙，举杯共邀明月，何其快哉！干杯！', en: 'A perfect score! Today you are like the Poetry Immortal — raise a cup to the moon. What joy!' },
    high: { zh: '好！好！学问如美酒，越品越有味。你已快达巅峰！', en: 'Excellent! Knowledge is like fine wine — the more you taste, the richer it gets. You are near the peak!' },
    mid:  { zh: '不必灰心！千里之行始于足下，再饮一杯，再战！', en: "Don't be discouraged! Every great journey begins underfoot. Have a drink and try again!" },
    pass: { zh: '过了！过了！今日小胜，明日再图大志，继续加油！', en: 'Passed! A small victory today — aim for greater ambitions tomorrow. Keep going!' },
  },
  luxun: {
    100:  { zh: '满分。这才是真正的掌握。中文之路，你已走到尽头的起点。', en: 'A perfect score. This is true mastery. The end of one road is the beginning of another.' },
    high: { zh: '做得不错。但不要因为高分而停止反思——语言的力量在于精准。', en: 'Well done. But do not stop reflecting because of a high score — the power of language lies in precision.' },
    mid:  { zh: '成绩尚可，但要记住：学语言不是应付考试，而是理解思想。继续钻研。', en: 'Acceptable results. But remember: learning a language is not about passing tests — it is about understanding thought.' },
    pass: { zh: '勉强通过。不要满足于此，真正的学习才刚刚开始。', en: 'Barely passed. Do not be satisfied — real learning has only just begun.' },
  },
  dante: {
    100:  { zh: '完美！你已从黑暗走向光明。你的中文旅程已成一部壮丽的史诗。', en: 'Perfect! You have crossed from shadow into light. Your journey is now a magnificent epic.' },
    high: { zh: '出色！你站在天堂的边缘。再走几步，山顶便是你的。', en: 'Excellent! You stand at the very edge of paradise. A few more steps and the summit is yours.' },
    mid:  { zh: '你已穿越了门槛。但攀登还在继续——坚持，天堂等待着你。', en: 'You have crossed the threshold. The ascent continues — persevere, and paradise awaits.' },
    pass: { zh: '你已跨越了门槛。现在，真正的攀登才刚刚开始——回顾，反思，继续向上。', en: 'You have crossed the threshold. Now the real climb begins — review, reflect, rise higher.' },
  },
  camus: {
    100:  { zh: '一百分。面对这一切的荒诞，你坚持下来了——而这坚持，就是一切。', en: 'One hundred percent. Despite the absurdity of it all, you persisted — and that persistence is everything.' },
    high: { zh: '出色。斗争本身就已足够。但到达山顶？那更好。', en: 'Excellent. The struggle itself is enough. But reaching the summit? That is even better.' },
    mid:  { zh: '你通过了。面对语言的无限复杂，坚持本身就是一种反抗。继续前行。', en: 'You passed. Against the infinite complexity of language, persisting is itself an act of rebellion. Keep going.' },
    pass: { zh: '你撑过来了。我们必须想象西西弗斯是幸福的。你今天也应该如此。', en: 'You made it through. We must imagine Sisyphus happy. And today, so should you be.' },
  },
  jane: {
    100:  { zh: '满分！何其出色。你的中文，就像你的举止一样优雅——成就斐然。', en: 'A perfect score! How delightfully accomplished. Your Chinese is as elegant as the finest manners.' },
    high: { zh: '精彩！你颇有学者风范。再多加练习，你将令人无可挑剔地印象深刻。', en: 'Splendid! You are quite the scholar. A little more practice and you shall be insufferably impressive.' },
    mid:  { zh: '表现可嘉！不过我要指出，还有改进的空间——尤其是在语法和细节方面。', en: 'Commendable! Though I must note, there is always room for improvement — especially in grammar and particulars.' },
    pass: { zh: '干得好——刚好通过，但终究通过了。坚韧，是我极为欣赏的美德。', en: 'Well done — just barely, but done nonetheless. Perseverance is a virtue I greatly admire.' },
  },
  elena: {
    100:  { zh: '一百分。你为这份知识而战，而且这看得出来。这样赢得的语言，永远属于你。', en: 'One hundred percent. You fought for this knowledge, and it shows. Language earned this way belongs to you forever.' },
    high: { zh: '美极了。你投入的努力——我感受得到。不要停下来。', en: 'Beautiful. The effort you have put in — I can feel it. Do not stop now.' },
    mid:  { zh: '你通过了。但我知道你能做得更好。回去，重温错误，不要畏惧困难。', en: 'You passed. But I know you can do better. Go back, revisit what you missed — do not fear the difficulty.' },
    pass: { zh: '你挺过来了。学习是混乱而艰难的。生活也是。继续前行吧。', en: 'You got through. Learning is messy and hard. So is life. Keep going anyway.' },
  },
  liucixin: {
    100:  { zh: '一百分。从统计学角度来看，相当卓越。你的语言神经网络已完全优化。', en: '100% efficiency. Statistically remarkable. Your linguistic neural pathways have been fully optimized.' },
    high: { zh: '分数令人印象深刻。按照这个轨迹，流利度遵循指数曲线。终点线近在咫尺。', en: 'Impressive score. At this trajectory, fluency follows an exponential curve. The finish line is within reach.' },
    mid:  { zh: '表现尚可。宇宙浩瀚——中文亦然。重新校准，再次出发。', en: 'Acceptable performance. The universe is vast — so is Chinese. Recalibrate and re-engage.' },
    pass: { zh: '通过了。将此视为漫长旅途中的一个检查点。星星遥远——真正的流利亦然。但你在前进。', en: 'Passed. Consider this a checkpoint in a long journey. The stars are far — so is true fluency. But you are moving forward.' },
  },
};

const AVATAR_ORDER = ['eileen', 'libai', 'luxun', 'dante', 'camus', 'jane', 'elena', 'liucixin'];

function getScoreTier(score) {
  if (score === 100) return 100;
  if (score >= 90) return 'high';
  if (score >= 75) return 'mid';
  return 'pass';
}

const TIER_HEADERS = {
  100:  { emoji: '🏆', title: '满分！Perfect Score!',   subtitle: '你已达到顶峰 · You have reached the peak', color: '#d4a017' },
  high: { emoji: '🌟', title: 'Outstanding!',            subtitle: '出色的表现！Your Chinese is truly advanced.', color: SUCCESS },
  mid:  { emoji: '🎓', title: 'Well Done!',              subtitle: '干得好！A solid pass — keep pushing higher.', color: WARM_ORANGE },
  pass: { emoji: '✅', title: 'Level Passed!',           subtitle: '恭喜通过！Keep going!', color: SLATE_TEAL },
};

// ── Avatar Final Screen (used for ALL levels on pass) ───────────────────────
function AvatarFinalScreen({ score, correctCount, totalQuestions, levelId, onStudyAgain, onContinue, onReview }) {
  const tier      = getScoreTier(score);
  const header    = TIER_HEADERS[tier];
  const nextLevel = NEXT_LEVEL[levelId];
  const chineseOnly = CHINESE_ONLY_LEVELS.has(levelId);
  const isLastLevel = levelId === 'hsk6';

  const [vanGoghMsg, setVanGoghMsg] = useState(null);
  const vgOpacity = useRef(new Animated.Value(0)).current;
  const [vanGoghLevelMsg, setVanGoghLevelMsg] = useState(null);
  const vgLevelOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setVanGoghMsg(getVanGoghMessage('quizPassed'));
    const timer = setTimeout(() => {
      Animated.timing(vgOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const msg = getVanGoghMessage('levelUp', { level: levelId });
    setVanGoghLevelMsg(msg);
    const timer = setTimeout(() => {
      Animated.timing(vgLevelOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }).start();
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.resultsContainer}>

      {/* Unlock celebration (hsk1-hsk5 only) */}
      {nextLevel && (
        <View style={styles.unlockCard}>
          <Text style={styles.unlockEmoji}>🎉</Text>
          <Text style={styles.unlockTitle}>Congratulations!</Text>
          <View style={styles.unlockLevelRow}>
            <Text style={styles.unlockLabel}>You unlocked</Text>
            <View style={styles.unlockLevelBadge}>
              <Text style={styles.unlockLevelText}>{nextLevel.emoji} {nextLevel.name}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Score header */}
      <View style={[styles.hsk6HeroCard, { borderColor: header.color }]}>
        <Text style={styles.hsk6HeroEmoji}>{header.emoji}</Text>
        <Text style={[styles.hsk6HeroTitle, { color: header.color }]}>{header.title}</Text>
        <Text style={styles.hsk6HeroSubtitle}>{header.subtitle}</Text>

        <View style={[styles.scoreCircle, { borderColor: header.color }]}>
          <Text style={[styles.scoreText, { color: header.color }]}>{score}%</Text>
          <Text style={styles.scoreLabel}>Score</Text>
        </View>

        <View style={styles.statsBox}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{correctCount}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalQuestions - correctCount}</Text>
            <Text style={styles.statLabel}>Incorrect</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalQuestions}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </View>

      {/* Avatar congratulations */}
      <Text style={styles.avatarSectionTitle}>Your Teachers Speak</Text>
      <View style={styles.avatarGrid}>
        {AVATAR_ORDER.map(id => {
          const av  = getAvatar(id);
          const msg = AVATAR_CONGRATS[id]?.[tier] ?? AVATAR_CONGRATS[id]?.pass;
          const img = (tier === 'pass' || tier === 'mid')
            ? av.images.encourage
            : (av.images.neutral ?? av.images.encourage);
          return (
            <View key={id} style={styles.avatarCard}>
              <Image source={img} style={styles.avatarImg} resizeMode="cover" />
              <Text style={styles.avatarName}>{av.englishName}</Text>
              <Text style={styles.avatarMsgZh}>{msg?.zh}</Text>
              {!chineseOnly && msg?.en && (
                <Text style={styles.avatarMsgEn}>{msg.en}</Text>
              )}
            </View>
          );
        })}
      </View>

      {/* Van Gogh level-up message */}
      {vanGoghLevelMsg && (
        <Animated.View style={[styles.vgLevelBlock, { opacity: vgLevelOpacity }]}>
          <Image
            source={require('../assets/avatar/Van_Gogh_梵高/Van_Gogh_portrait_in_fields.png')}
            style={styles.vgLevelAvatar}
          />
          <Text style={styles.vgLevelText}>{vanGoghLevelMsg.text}</Text>
          <Text style={styles.vgLevelSignature}>— Vincent, on {vanGoghLevelMsg.painting}</Text>
        </Animated.View>
      )}

      {/* Actions */}
      <View style={styles.resultsActions}>
        {!isLastLevel && (
          <TouchableOpacity style={styles.nextLevelButton} onPress={onContinue} activeOpacity={0.85}>
            <Text style={styles.nextLevelButtonText}>Continue →</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.studyAgainButton} onPress={onStudyAgain} activeOpacity={0.85}>
          <Text style={styles.studyAgainButtonText}>📚 Study Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reviewButton} onPress={onReview} activeOpacity={0.85}>
          <Text style={styles.reviewButtonText}>📋 Review Incorrect Answers</Text>
        </TouchableOpacity>
      </View>

      {/* Van Gogh quiz passed message */}
      {vanGoghMsg && (
        <Animated.View style={[styles.vgPassBlock, { opacity: vgOpacity }]}>
          <Image
            source={require('../assets/avatar/Van_Gogh_梵高/Van_Gogh_portrait_in_fields.png')}
            style={styles.vgPassAvatar}
          />
          <View style={styles.vgPassTextBlock}>
            <Text style={styles.vgPassText}>{vanGoghMsg.text}</Text>
            <Text style={styles.vgPassSignature}>— Vincent</Text>
          </View>
        </Animated.View>
      )}

    </ScrollView>
  );
}

export default function LevelQuizScreen({ currentLevelId, onBack, onComplete }) {
  const T = LEVEL_SCREEN_PALETTES[currentLevelId] || LEVEL_SCREEN_PALETTES.hsk1;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showReviewMistakes, setShowReviewMistakes] = useState(false);
  const [isRetry, setIsRetry] = useState(false);
  const [retryQuestions, setRetryQuestions] = useState(null);
  const [lastWrongIds, setLastWrongIds] = useState([]);
  const [score, setScore] = useState(0);
  const [quizProgress, setQuizProgress] = useState(null);
  const [vgModal, setVgModal] = useState({ visible: false, message: null, onContinue: null, buttonLabel: undefined });
  const [vanGoghFailedMsg, setVanGoghFailedMsg] = useState(null);
  const vgFailedOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showResults && score < PASS_SCORE) {
      setVanGoghFailedMsg(getVanGoghMessage('quizFailed'));
      const timer = setTimeout(() => {
        Animated.timing(vgFailedOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [showResults, score]);

  const quizData = QUIZ_BY_LEVEL[currentLevelId] || hsk1QuizData;
  const quizId = `${quizData.level || currentLevelId.toUpperCase()}_Level_Quiz`;

  // Load existing progress on mount
  useEffect(() => {
    loadQuizProgress(quizId).then(setQuizProgress).catch(() => {});
  }, [quizId]);

  // Shuffle options once on mount — keep each option paired with its pinyin
  const shuffledQuestions = useMemo(() =>
    quizData.questions.map(q => {
      const pairs = q.options.map((text, i) => ({
        text,
        pinyin: q.option_pinyin?.[i] ?? null,
      }));
      const shuffled = shuffleArray(pairs);
      return {
        ...q,
        options: shuffled.map(p => p.text),
        option_pinyin: shuffled.map(p => p.pinyin),
      };
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Use retryQuestions if set (after Review → Retry), otherwise the normal shuffled set
  const activeQuestions = retryQuestions ?? shuffledQuestions;
  const totalQuestions = activeQuestions.length;
  const question = activeQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleSelectAnswer = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    const isCorrect = selectedAnswer === question.correct;
    const newAnswers = {
      ...answers,
      [question.id]: {
        selected: selectedAnswer,
        correct: question.correct,
        isCorrect
      }
    };
    setAnswers(newAnswers);

    if (currentQuestion + 1 < totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      const correctCount = Object.values(newAnswers).filter(a => a.isCorrect).length;
      const finalScore = Math.round((correctCount / totalQuestions) * 100);
      const wrongIds = Object.entries(newAnswers)
        .filter(([, a]) => !a.isCorrect)
        .map(([id]) => id);
      setLastWrongIds(wrongIds);
      setScore(finalScore);
      recordQuizAttempt(quizId, {
        score: finalScore,
        wrongQuestionIds: wrongIds,
        passScore: PASS_SCORE,
      }).then(saved => {
        if (saved) setQuizProgress(saved);
        // After a retry attempt that fails: go back to ReviewMistakesScreen
        if (isRetry && finalScore < PASS_SCORE) {
          setShowResults(false);
          setShowReviewMistakes(true);
        } else {
          setShowResults(true);
        }
      }).catch(() => {
        setShowResults(true);
      });
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers({});
    setShowResults(false);
    setShowReviewMistakes(false);
    setRetryQuestions(null);
    setIsRetry(false);
    setScore(0);
    setLastWrongIds([]);
    loadQuizProgress(quizId).then(setQuizProgress).catch(() => {});
  };

  // Called by ReviewMistakesScreen when student taps "Retry Quiz"
  const handleRetryFromReview = (newQuestions) => {
    setRetryQuestions(newQuestions);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers({});
    setScore(0);
    setShowReviewMistakes(false);
    setShowResults(false);
    setIsRetry(true);
  };

  const getPassed = () => score >= PASS_SCORE;
  const needsReview = () => score < REVIEW_SCORE;

  const showVgThen = (category, buttonLabel, afterFn) => {
    const msg = getVanGoghMessage(category);
    setVgModal({ visible: true, message: msg, buttonLabel, onContinue: afterFn });
  };
  const dismissVgModal = () => setVgModal(v => ({ ...v, visible: false }));

  // ReviewMistakesScreen — shown after failure, one card at a time, then Retry
  if (showReviewMistakes) {
    const wrongIds = lastWrongIds.length > 0
      ? lastWrongIds
      : (quizProgress?.wrongQuestionIds ?? []);
    return (
      <ReviewMistakesScreen
        wrongQuestionIds={wrongIds}
        allQuestions={quizData.questions}
        answers={answers}
        currentLevelId={currentLevelId}
        attemptCount={quizProgress?.attempts ?? 1}
        onRetry={handleRetryFromReview}
        onBack={() => setShowReviewMistakes(false)}
      />
    );
  }

  // Review Screen (pass-side "Review Incorrect Answers")
  if (showReview) {
    const incorrectQuestions = quizData.questions.filter(q => {
      const answer = answers[q.id];
      return answer && !answer.isCorrect;
    });

    return (
      <ScreenBackground levelId={currentLevelId}>
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle={T.statusBar} />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowReview(false)} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back to Results</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.quizTitle}>Review Incorrect</Text>
          </View>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewTitle}>❌ Questions to Review</Text>
            <Text style={styles.reviewSubtitle}>
              {incorrectQuestions.length} incorrect {incorrectQuestions.length === 1 ? 'answer' : 'answers'}
            </Text>
          </View>

          {incorrectQuestions.length === 0 ? (
            <View style={styles.perfectScore}>
              <Text style={styles.perfectScoreEmoji}>🎉</Text>
              <Text style={styles.perfectScoreText}>Perfect Score!</Text>
              <Text style={styles.perfectScoreSubtext}>You got all questions correct!</Text>
            </View>
          ) : (
            incorrectQuestions.map((q) => {
              const answer = answers[q.id];
              const questionNumber = quizData.questions.findIndex(item => item.id === q.id) + 1;

              return (
                <View key={q.id} style={styles.reviewQuestionCard}>
                  <View style={styles.reviewQuestionHeader}>
                    <Text style={styles.reviewQuestionNumber}>Question {questionNumber}</Text>
                    <View style={[
                      styles.difficultyBadge,
                      q.difficulty === 'easy'   && styles.difficultyEasy,
                      q.difficulty === 'medium' && styles.difficultyMedium,
                      q.difficulty === 'hard'   && styles.difficultyHard,
                    ]}>
                      <Text style={styles.difficultyText}>
                        {(q.difficulty || 'medium').toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.reviewQuestionText}>
                    <Text style={styles.questionText}>{q.question}</Text>
                    {q.question_pinyin && (
                      <Text style={styles.questionPinyin}>{q.question_pinyin}</Text>
                    )}
                  </View>

                  <View style={styles.reviewAnswerSection}>
                    <Text style={styles.reviewLabel}>❌ Your Answer:</Text>
                    <View style={styles.wrongAnswerBox}>
                      <Text style={styles.wrongAnswerText}>{answer.selected}</Text>
                    </View>
                  </View>

                  <View style={styles.reviewAnswerSection}>
                    <Text style={styles.reviewLabel}>✅ Correct Answer:</Text>
                    <View style={styles.correctAnswerBox}>
                      <Text style={styles.correctAnswerText}>{q.correct}</Text>
                    </View>
                  </View>

                  <Text style={styles.lessonRef}>
                    From Lesson {q.lesson_reference}
                  </Text>
                </View>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
      </ScreenBackground>
    );
  }

  // Results Screen
  if (showResults) {
    const passed = getPassed();
    const review = needsReview();
    const correctCount = Object.values(answers).filter(a => a.isCorrect).length;

    // Passed → avatar final screen for ALL levels
    if (passed) {
      return (
        <ScreenBackground levelId={currentLevelId}>
        <SafeAreaView style={styles.safe}>
          <StatusBar barStyle={T.statusBar} />
          <AvatarFinalScreen
            score={score}
            correctCount={correctCount}
            totalQuestions={totalQuestions}
            levelId={currentLevelId}
            onStudyAgain={onBack}
            onContinue={() => onComplete(score)}
            onReview={() => setShowReview(true)}
          />
        </SafeAreaView>
        </ScreenBackground>
      );
    }

    // Failed → keep-practicing screen with progress history
    const bestScore   = quizProgress?.bestScore  ?? score;
    const attempts    = quizProgress?.attempts    ?? 1;
    const showTomorrow = shouldShowComeBackTomorrow(quizProgress);

    return (
      <ScreenBackground levelId={currentLevelId}>
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle={T.statusBar} />
        <ScrollView contentContainerStyle={styles.resultsContainer}>

          {/* Score card */}
          <View style={styles.resultsCard}>
            <Text style={styles.resultsEmoji}>📚</Text>
            <Text style={styles.resultsTitle}>Keep Practicing!</Text>
            <Text style={styles.resultsSubtitle}>加油！Jiā yóu!</Text>

            {/* Two score circles side by side */}
            <View style={styles.scorePairRow}>
              <View style={styles.scorePairItem}>
                <View style={[styles.scoreCircle, { borderColor: ERROR }]}>
                  <Text style={[styles.scoreText, { color: ERROR }]}>{score}%</Text>
                  <Text style={styles.scoreLabel}>This Try</Text>
                </View>
              </View>
              <View style={styles.scorePairItem}>
                <View style={[styles.scoreCircle, { borderColor: WARM_ORANGE }]}>
                  <Text style={[styles.scoreText, { color: WARM_ORANGE }]}>{bestScore}%</Text>
                  <Text style={styles.scoreLabel}>Best</Text>
                </View>
              </View>
            </View>

            <View style={styles.statsBox}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{correctCount}</Text>
                <Text style={styles.statLabel}>Correct</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{totalQuestions - correctCount}</Text>
                <Text style={styles.statLabel}>Incorrect</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{attempts}</Text>
                <Text style={styles.statLabel}>Attempts</Text>
              </View>
            </View>

            <Text style={styles.passingText}>
              Pass threshold: {PASS_SCORE}% · You need {PASS_SCORE - score} more points
            </Text>

            <View style={styles.encouragementBox}>
              <Text style={styles.encouragementText}>
                You need {PASS_SCORE}% to advance. Review your mistakes and try again! 💪
              </Text>
            </View>

            {/* Come back tomorrow message */}
            {showTomorrow && (
              <TouchableOpacity
                style={styles.tomorrowBox}
                onPress={() => showVgThen('comeBackTomorrow', 'I\'ll rest and return 🌙', dismissVgModal)}
                activeOpacity={0.8}
              >
                <Text style={styles.tomorrowEmoji}>🌙</Text>
                <Text style={styles.tomorrowText}>
                  You've tried {attempts} times today. Your brain needs rest — come back tomorrow! Tap to hear from Vincent.
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.resultsActions}>
            <TouchableOpacity
              style={styles.reviewMistakesButton}
              onPress={() => showVgThen('reviewMistakes', 'Let\'s review →', () => {
                dismissVgModal();
                setShowReviewMistakes(true);
              })}
            >
              <Text style={styles.reviewMistakesButtonText}>📋 Review Mistakes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.retryButton} onPress={handleRestart}>
              <Text style={styles.retryButtonText}>🔄 Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.doneButton} onPress={onBack}>
              <Text style={styles.doneButtonText}>← Back to Home</Text>
            </TouchableOpacity>
          </View>

          {vanGoghFailedMsg && (
            <Animated.View style={[styles.vgFailedBlock, { opacity: vgFailedOpacity }]}>
              <Image
                source={require('../assets/avatar/Van_Gogh_梵高/Van_Gogh_Potrait_1.png')}
                style={styles.vgFailedAvatar}
              />
              <View style={styles.vgFailedTextBlock}>
                <Text style={styles.vgFailedText}>{vanGoghFailedMsg.text}</Text>
                <Text style={styles.vgFailedSignature}>— Vincent</Text>
              </View>
            </Animated.View>
          )}
        </ScrollView>
        <VanGoghMessageModal
          visible={vgModal.visible}
          message={vgModal.message}
          buttonLabel={vgModal.buttonLabel}
          onContinue={() => vgModal.onContinue?.()}
          onDismiss={dismissVgModal}
        />
      </SafeAreaView>
      </ScreenBackground>
    );
  }

  // Quiz Screen
  return (
    <ScreenBackground levelId={currentLevelId}>
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={T.statusBar} />

      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Exit</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.quizTitle}>{quizData.title}</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Question {currentQuestion + 1} of {totalQuestions}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={[
          styles.difficultyBadge,
          question.difficulty === 'easy'   && styles.difficultyEasy,
          question.difficulty === 'medium' && styles.difficultyMedium,
          question.difficulty === 'hard'   && styles.difficultyHard,
        ]}>
          <Text style={styles.difficultyText}>
            {(question.difficulty || 'medium').toUpperCase()}
          </Text>
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{question.question}</Text>
          {question.question_pinyin && (
            <Text style={styles.questionPinyin}>{question.question_pinyin}</Text>
          )}
        </View>

        <View style={styles.optionsContainer}>
          {question.options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const optionPinyin = question.option_pinyin?.[idx];

            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.optionButton,
                  isSelected && styles.optionButtonSelected
                ]}
                onPress={() => handleSelectAnswer(option)}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <Text style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected
                  ]}>
                    {option}
                  </Text>
                  {optionPinyin && (
                    <Text style={[
                      styles.optionPinyin,
                      isSelected && styles.optionPinyinSelected
                    ]}>
                      {optionPinyin}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.lessonRef}>
          From Lesson {question.lesson_reference}
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !selectedAnswer && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!selectedAnswer}
        >
          <Text style={styles.nextButtonText}>
            {currentQuestion + 1 === totalQuestions ? 'Finish Quiz 🏁' : 'Next Question →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: CARD_WHITE, borderBottomWidth: 1, borderBottomColor: 'rgba(155,104,70,0.20)' },
  backButton: { paddingVertical: 8, paddingRight: 12 },
  backButtonText: { fontSize: 16, fontWeight: '600', color: WARM_ORANGE },
  headerCenter: { flex: 1, alignItems: 'center' },
  quizTitle: { fontSize: 16, fontWeight: '700', color: DEEP_NAVY },

  progressContainer: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: CARD_WHITE, borderBottomWidth: 1, borderBottomColor: 'rgba(155,104,70,0.12)' },
  progressBarBg: { height: 8, backgroundColor: 'rgba(55,73,80,0.22)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressBarFill: { height: '100%', backgroundColor: SUCCESS, borderRadius: 4 },
  progressText: { fontSize: 13, color: SLATE_TEAL, textAlign: 'center' },

  scrollView: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 40 },

  difficultyBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 16 },
  difficultyEasy: { backgroundColor: '#e8f5e9' },
  difficultyMedium: { backgroundColor: '#fff3ee' },
  difficultyHard: { backgroundColor: '#fde8e8' },
  difficultyText: { fontSize: 11, fontWeight: '800', color: DEEP_NAVY, letterSpacing: 0.5 },

  questionCard: { backgroundColor: CARD_WHITE, borderRadius: 20, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(155,104,70,0.18)' },
  questionText: { fontSize: 18, fontWeight: '700', color: DEEP_NAVY, lineHeight: 28 },
  questionPinyin: { fontSize: 15, color: WARM_ORANGE, fontStyle: 'italic', marginTop: 8 },

  optionsContainer: { gap: 12, marginBottom: 20 },
  optionButton: { backgroundColor: CARD_WHITE, borderRadius: 16, padding: 18, borderWidth: 2, borderColor: 'rgba(155,104,70,0.22)' },
  optionButtonSelected: { borderColor: SUCCESS, backgroundColor: '#e8f5e9' },
  optionContent: { flex: 1 },
  optionText: { fontSize: 16, fontWeight: '600', color: DEEP_NAVY },
  optionTextSelected: { color: SUCCESS },
  optionPinyin: { fontSize: 14, color: WARM_BROWN, fontStyle: 'italic', marginTop: 6, fontWeight: '500', backgroundColor: '#FFF8ED', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
  optionPinyinSelected: { color: SUCCESS, backgroundColor: '#e8f5e9' },

  lessonRef: { fontSize: 12, color: SLATE_TEAL, textAlign: 'center', fontStyle: 'italic' },

  footer: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: CARD_WHITE, borderTopWidth: 1, borderTopColor: 'rgba(155,104,70,0.18)' },
  nextButton: { backgroundColor: SUCCESS, padding: 16, borderRadius: 16, alignItems: 'center' },
  nextButtonDisabled: { backgroundColor: SLATE_TEAL, opacity: 0.5 },
  nextButtonText: { fontSize: 16, fontWeight: '800', color: CARD_WHITE },

  // Unlock card
  unlockCard:       { backgroundColor: '#e8f5e9', borderRadius: 24, padding: 28, alignItems: 'center', marginBottom: 16, borderWidth: 2, borderColor: SUCCESS },
  unlockEmoji:      { fontSize: 52, marginBottom: 8 },
  unlockTitle:      { fontSize: 28, fontWeight: '900', color: SUCCESS, marginBottom: 12 },
  unlockLevelRow:   { alignItems: 'center', gap: 6 },
  unlockLabel:      { fontSize: 14, color: SLATE_TEAL, fontWeight: '600' },
  unlockLevelBadge: { backgroundColor: CARD_WHITE, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, marginTop: 4 },
  unlockLevelText:  { fontSize: 18, fontWeight: '800', color: DEEP_NAVY },

  // Results container
  resultsContainer: { flexGrow: 1, padding: 20, paddingBottom: 40 },
  resultsCard: { backgroundColor: CARD_WHITE, borderRadius: 24, padding: 32, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(155,104,70,0.18)' },
  resultsEmoji: { fontSize: 64, marginBottom: 16 },
  resultsTitle: { fontSize: 28, fontWeight: '900', color: DEEP_NAVY, marginBottom: 8 },
  resultsSubtitle: { fontSize: 16, color: WARM_ORANGE, marginBottom: 24 },

  scoreCircle: { width: 140, height: 140, borderRadius: 70, backgroundColor: CARD_WHITE, alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 3, borderColor: 'rgba(155,104,70,0.22)' },
  scoreText: { fontSize: 42, fontWeight: '900' },
  scoreLabel: { fontSize: 13, color: SLATE_TEAL, marginTop: 4 },

  statsBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f6f2', borderRadius: 16, padding: 20, width: '100%', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(155,104,70,0.15)' },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '800', color: DEEP_NAVY, marginBottom: 4 },
  statLabel: { fontSize: 12, color: SLATE_TEAL },
  statDivider: { width: 1, height: 40, backgroundColor: 'rgba(155,104,70,0.20)' },

  passingText: { fontSize: 13, color: SLATE_TEAL, marginBottom: 16 },

  encouragementBox: { backgroundColor: '#FFF8ED', padding: 16, borderRadius: 12, width: '100%' },
  encouragementText: { fontSize: 14, color: WARM_ORANGE, textAlign: 'center', lineHeight: 20 },

  scorePairRow: { flexDirection: 'row', gap: 20, marginBottom: 24 },
  scorePairItem: { flex: 1, alignItems: 'center' },

  tomorrowBox: {
    marginTop: 12, backgroundColor: '#eef2ff', borderRadius: 12, padding: 16,
    width: '100%', borderWidth: 1, borderColor: 'rgba(100,116,255,0.3)',
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
  },
  tomorrowEmoji: { fontSize: 24 },
  tomorrowText: { flex: 1, fontSize: 13, color: '#4a5568', lineHeight: 20 },

  resultsActions: { gap: 12 },
  nextLevelButton: { backgroundColor: SUCCESS, padding: 16, borderRadius: 16, alignItems: 'center' },
  nextLevelButtonText: { fontSize: 16, fontWeight: '800', color: CARD_WHITE },
  reviewMistakesButton: { backgroundColor: DEEP_NAVY, padding: 16, borderRadius: 16, alignItems: 'center' },
  reviewMistakesButtonText: { fontSize: 16, fontWeight: '800', color: CARD_WHITE },
  reviewButton: { backgroundColor: SLATE_TEAL, padding: 16, borderRadius: 16, alignItems: 'center' },
  reviewButtonText: { fontSize: 16, fontWeight: '800', color: CARD_WHITE },
  retryButton: { backgroundColor: WARM_ORANGE, padding: 16, borderRadius: 16, alignItems: 'center' },
  retryButtonText: { fontSize: 16, fontWeight: '800', color: CARD_WHITE },
  doneButton: { backgroundColor: CARD_WHITE, padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(155,104,70,0.22)' },
  doneButtonText: { fontSize: 16, fontWeight: '600', color: DEEP_NAVY },

  // Review Screen
  reviewHeader: { backgroundColor: CARD_WHITE, borderRadius: 20, padding: 24, marginBottom: 24, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(155,104,70,0.18)' },
  reviewTitle: { fontSize: 24, fontWeight: '900', color: DEEP_NAVY, marginBottom: 8 },
  reviewSubtitle: { fontSize: 14, color: SLATE_TEAL },

  perfectScore: { backgroundColor: CARD_WHITE, borderRadius: 20, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(155,104,70,0.18)' },
  perfectScoreEmoji: { fontSize: 64, marginBottom: 16 },
  perfectScoreText: { fontSize: 24, fontWeight: '900', color: SUCCESS, marginBottom: 8 },
  perfectScoreSubtext: { fontSize: 14, color: SLATE_TEAL },

  reviewQuestionCard: { backgroundColor: CARD_WHITE, borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(155,104,70,0.18)' },
  reviewQuestionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  reviewQuestionNumber: { fontSize: 16, fontWeight: '800', color: DEEP_NAVY },
  reviewQuestionText: { marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(155,104,70,0.15)' },

  reviewAnswerSection: { marginBottom: 16 },
  reviewLabel: { fontSize: 14, fontWeight: '700', color: DEEP_NAVY, marginBottom: 8 },

  wrongAnswerBox: { backgroundColor: 'rgba(196,80,58,0.10)', borderRadius: 12, padding: 14, borderWidth: 2, borderColor: ERROR },
  wrongAnswerText: { fontSize: 15, fontWeight: '600', color: ERROR },

  correctAnswerBox: { backgroundColor: 'rgba(45,122,74,0.10)', borderRadius: 12, padding: 14, borderWidth: 2, borderColor: SUCCESS },
  correctAnswerText: { fontSize: 15, fontWeight: '600', color: SUCCESS },

  // Avatar Final Screen
  hsk6HeroCard: {
    backgroundColor: CARD_WHITE, borderRadius: 24, padding: 28, alignItems: 'center',
    marginBottom: 24, borderWidth: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 12, elevation: 6,
  },
  hsk6HeroEmoji:    { fontSize: 60, marginBottom: 10 },
  hsk6HeroTitle:    { fontSize: 28, fontWeight: '900', marginBottom: 6, textAlign: 'center' },
  hsk6HeroSubtitle: { fontSize: 14, color: SLATE_TEAL, textAlign: 'center', marginBottom: 24, lineHeight: 20 },

  avatarSectionTitle: {
    fontSize: 15, fontWeight: '800', color: DEEP_NAVY,
    textAlign: 'center', marginBottom: 14, letterSpacing: 0.5,
  },
  avatarGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  avatarCard: {
    width: '47%', backgroundColor: CARD_WHITE, borderRadius: 18, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(155,104,70,0.18)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  avatarImg:    { width: 72, height: 72, borderRadius: 36, marginBottom: 8, backgroundColor: '#f0ebe3' },
  avatarName:   { fontSize: 11, fontWeight: '800', color: DEEP_NAVY, textAlign: 'center', marginBottom: 5 },
  avatarMsgZh:  { fontSize: 11, color: DEEP_NAVY, textAlign: 'center', lineHeight: 16, marginBottom: 4 },
  avatarMsgEn:  { fontSize: 10, color: SLATE_TEAL, textAlign: 'center', lineHeight: 14, fontStyle: 'italic' },

  studyAgainButton: {
    backgroundColor: WARM_ORANGE, padding: 16, borderRadius: 16, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  studyAgainButtonText: { fontSize: 16, fontWeight: '900', color: CARD_WHITE },

  // ── Van Gogh level-up message ─────────────────────────────────────────────
  vgLevelBlock: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
    marginHorizontal: 16,
    paddingHorizontal: 28,
    paddingVertical: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  vgLevelAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 12,
  },
  vgLevelText: {
    fontSize: 16,
    fontStyle: 'italic',
    fontFamily: 'Georgia',
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    lineHeight: 24,
  },
  vgLevelSignature: {
    fontSize: 12,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.50)',
    textAlign: 'center',
    marginTop: 6,
  },

  // ── Van Gogh quiz passed message ──────────────────────────────────────────
  vgPassBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 12,
  },
  vgPassAvatar: {
    width: 40,
    height: 40,
  },
  vgPassTextBlock: {
    flex: 1,
    gap: 6,
  },
  vgPassText: {
    fontSize: 14,
    fontStyle: 'italic',
    fontFamily: 'Georgia',
    color: WARM_BROWN,
    lineHeight: 22,
  },
  vgPassSignature: {
    fontSize: 12,
    color: SLATE_TEAL,
    textAlign: 'right',
  },

  // ── Van Gogh quiz failed message ──────────────────────────────────────────
  vgFailedBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 12,
  },
  vgFailedAvatar: {
    width: 40,
    height: 40,
  },
  vgFailedTextBlock: {
    flex: 1,
    gap: 6,
  },
  vgFailedText: {
    fontSize: 14,
    fontStyle: 'italic',
    fontFamily: 'Georgia',
    color: WARM_BROWN,
    lineHeight: 22,
  },
  vgFailedSignature: {
    fontSize: 12,
    color: SLATE_TEAL,
    textAlign: 'right',
  },
});
