import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenBackground from '../components/ScreenBackground';
import { LEVEL_SCREEN_PALETTES } from '../config/vanGoghTheme';
import { DEEP_NAVY, WARM_ORANGE, SLATE_TEAL, WARM_BROWN, SOFT_SALMON, CARD_WHITE, TEXT_LIGHT, MUTED_LIGHT, SUCCESS, ERROR } from '../constants/colors';

const PASS_SCORE = 60;
const REVIEW_SCORE = 50;

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

export default function LevelQuizScreen({ currentLevelId, onBack, onComplete }) {
  const T = LEVEL_SCREEN_PALETTES[currentLevelId] || LEVEL_SCREEN_PALETTES.hsk1;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [score, setScore] = useState(0);

  const quizData = QUIZ_BY_LEVEL[currentLevelId] || hsk1QuizData;
  const question = quizData.questions[currentQuestion];
  const totalQuestions = quizData.total_questions;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleSelectAnswer = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    // Save answer
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

    // Move to next question or show results
    if (currentQuestion + 1 < totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      // Calculate final score
      const correctCount = Object.values(newAnswers).filter(a => a.isCorrect).length;
      const finalScore = Math.round((correctCount / totalQuestions) * 100);
      setScore(finalScore);
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers({});
    setShowResults(false);
    setScore(0);
  };

  const getPassed = () => score >= PASS_SCORE;
  const needsReview = () => score < REVIEW_SCORE;

  const handleShowReviewExercise = () => {
    const incorrectQuestions = quizData.questions.filter(q => answers[q.id] && !answers[q.id].isCorrect);
    const mistakeList = incorrectQuestions
      .slice(0, 5)
      .map(q => `• ${q.question}`)
      .join('\n');
    Alert.alert(
      'Review Exercise',
      `You scored ${score}%. Let's review what you missed:\n\n${mistakeList}\n\nGo over these lessons and then retake the quiz. You need 60% to advance!`,
      [{ text: 'Retake Quiz', onPress: handleRestart }],
    );
  };

  // Review Screen - Show incorrect answers
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
            <Text style={styles.reviewTitle}>
              ❌ Questions to Review
            </Text>
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
            incorrectQuestions.map((question) => {
              const answer = answers[question.id];
              const questionNumber = quizData.questions.findIndex(q => q.id === question.id) + 1;
              
              return (
                <View key={question.id} style={styles.reviewQuestionCard}>
                  <View style={styles.reviewQuestionHeader}>
                    <Text style={styles.reviewQuestionNumber}>
                      Question {questionNumber}
                    </Text>
                    <View style={[
                      styles.difficultyBadge,
                      question.difficulty === 'easy' && styles.difficultyEasy,
                      question.difficulty === 'medium' && styles.difficultyMedium,
                      question.difficulty === 'hard' && styles.difficultyHard,
                    ]}>
                      <Text style={styles.difficultyText}>
                        {(question.difficulty || 'medium').toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.reviewQuestionText}>
                    <Text style={styles.questionText}>{question.question}</Text>
                    {question.question_pinyin && (
                      <Text style={styles.questionPinyin}>{question.question_pinyin}</Text>
                    )}
                  </View>

                  {/* Your Answer - Wrong */}
                  <View style={styles.reviewAnswerSection}>
                    <Text style={styles.reviewLabel}>❌ Your Answer:</Text>
                    <View style={styles.wrongAnswerBox}>
                      <Text style={styles.wrongAnswerText}>{answer.selected}</Text>
                      {question.option_pinyin && (
                        <Text style={styles.wrongAnswerPinyin}>
                          {question.option_pinyin[question.options.indexOf(answer.selected)]}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Correct Answer */}
                  <View style={styles.reviewAnswerSection}>
                    <Text style={styles.reviewLabel}>✅ Correct Answer:</Text>
                    <View style={styles.correctAnswerBox}>
                      <Text style={styles.correctAnswerText}>{question.correct}</Text>
                      {question.correct_pinyin && (
                        <Text style={styles.correctAnswerPinyin}>{question.correct_pinyin}</Text>
                      )}
                    </View>
                  </View>

                  <Text style={styles.lessonRef}>
                    From Lesson {question.lesson_reference}
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
    const nextLevel = NEXT_LEVEL[currentLevelId];

    return (
      <ScreenBackground levelId={currentLevelId}>
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle={T.statusBar} />
        <ScrollView contentContainerStyle={styles.resultsContainer}>

          {/* Unlock celebration (passed only) */}
          {passed && (
            <View style={styles.unlockCard}>
              <Text style={styles.unlockEmoji}>🎉</Text>
              <Text style={styles.unlockTitle}>Congratulations!</Text>
              {nextLevel && (
                <View style={styles.unlockLevelRow}>
                  <Text style={styles.unlockLabel}>You unlocked</Text>
                  <View style={styles.unlockLevelBadge}>
                    <Text style={styles.unlockLevelText}>{nextLevel.emoji} {nextLevel.name}</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          <View style={styles.resultsCard}>
            <Text style={styles.resultsEmoji}>{passed ? '🏆' : '📚'}</Text>
            <Text style={styles.resultsTitle}>
              {passed ? 'Level Passed!' : 'Keep Practicing!'}
            </Text>
            <Text style={styles.resultsSubtitle}>
              {passed ? '恭喜！Gōng xǐ!' : '加油！Jiā yóu!'}
            </Text>

            <View style={styles.scoreCircle}>
              <Text style={[styles.scoreText, { color: passed ? SUCCESS : ERROR }]}>
                {score}%
              </Text>
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

            <Text style={styles.passingText}>
              Pass threshold: {PASS_SCORE}% · You scored: {score}%
            </Text>


            {!passed && review && (
              <View style={styles.encouragementBox}>
                <Text style={styles.encouragementText}>
                  Your score is below 50%. Please review the exercises based on your mistakes, then try again!
                </Text>
              </View>
            )}

            {!passed && !review && (
              <View style={styles.encouragementBox}>
                <Text style={styles.encouragementText}>
                  So close! You need 60% to advance. Review and try again! 💪
                </Text>
              </View>
            )}
          </View>

          <View style={styles.resultsActions}>
            {passed && (
              <TouchableOpacity
                style={styles.nextLevelButton}
                onPress={() => onComplete(score)}
              >
                <Text style={styles.nextLevelButtonText}>Continue →</Text>
              </TouchableOpacity>
            )}

            {!passed && review && (
              <TouchableOpacity
                style={styles.reviewExerciseButton}
                onPress={handleShowReviewExercise}
              >
                <Text style={styles.reviewButtonText}>📋 Review Exercise + Retake</Text>
              </TouchableOpacity>
            )}

            {!passed && !review && (
              <TouchableOpacity style={styles.retryButton} onPress={handleRestart}>
                <Text style={styles.retryButtonText}>🔄 Try Again</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() => setShowReview(true)}
            >
              <Text style={styles.reviewButtonText}>📋 Review Incorrect Answers</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.doneButton} onPress={onBack}>
              <Text style={styles.doneButtonText}>← Back to Home</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
      </ScreenBackground>
    );
  }

  // Quiz Screen
  return (
    <ScreenBackground levelId={currentLevelId}>
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={T.statusBar} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Exit</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.quizTitle}>{quizData.title}</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Question {currentQuestion + 1} of {totalQuestions}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Difficulty Badge */}
        <View style={[
          styles.difficultyBadge,
          question.difficulty === 'easy' && styles.difficultyEasy,
          question.difficulty === 'medium' && styles.difficultyMedium,
          question.difficulty === 'hard' && styles.difficultyHard,
        ]}>
          <Text style={styles.difficultyText}>
            {(question.difficulty || 'medium').toUpperCase()}
          </Text>
        </View>

        {/* Question */}
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{question.question}</Text>
          {question.question_pinyin && (
            <Text style={styles.questionPinyin}>{question.question_pinyin}</Text>
          )}
        </View>

        {/* Options */}
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

        {/* Lesson Reference */}
        <Text style={styles.lessonRef}>
          From Lesson {question.lesson_reference}
        </Text>
      </ScrollView>

      {/* Next Button */}
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

  // Results
  // Unlock celebration card
  unlockCard:       { backgroundColor: '#e8f5e9', borderRadius: 24, padding: 28, alignItems: 'center', marginBottom: 16, borderWidth: 2, borderColor: SUCCESS },
  unlockEmoji:      { fontSize: 52, marginBottom: 8 },
  unlockTitle:      { fontSize: 28, fontWeight: '900', color: SUCCESS, marginBottom: 12 },
  unlockLevelRow:   { alignItems: 'center', gap: 6 },
  unlockLabel:      { fontSize: 14, color: SLATE_TEAL, fontWeight: '600' },
  unlockLevelBadge: { backgroundColor: CARD_WHITE, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, marginTop: 4 },
  unlockLevelText:  { fontSize: 18, fontWeight: '800', color: DEEP_NAVY },

  resultsContainer: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  resultsCard: { backgroundColor: CARD_WHITE, borderRadius: 24, padding: 32, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(155,104,70,0.18)' },
  resultsEmoji: { fontSize: 64, marginBottom: 16 },
  resultsTitle: { fontSize: 28, fontWeight: '900', color: DEEP_NAVY, marginBottom: 8 },
  resultsSubtitle: { fontSize: 16, color: WARM_ORANGE, marginBottom: 24 },

  scoreCircle: { width: 140, height: 140, borderRadius: 70, backgroundColor: CARD_WHITE, alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 3, borderColor: 'rgba(155,104,70,0.22)' },
  scoreText: { fontSize: 42, fontWeight: '900' },
  scoreLabel: { fontSize: 13, color: SLATE_TEAL, marginTop: 4 },

  statsBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD_WHITE, borderRadius: 16, padding: 20, width: '100%', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(155,104,70,0.15)' },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '800', color: DEEP_NAVY, marginBottom: 4 },
  statLabel: { fontSize: 12, color: SLATE_TEAL },
  statDivider: { width: 1, height: 40, backgroundColor: 'rgba(155,104,70,0.20)' },

  passingText: { fontSize: 13, color: SLATE_TEAL, marginBottom: 16 },

  passedBox: { backgroundColor: '#e8f5e9', padding: 16, borderRadius: 12, width: '100%' },
  passedText: { fontSize: 15, fontWeight: '600', color: SUCCESS, textAlign: 'center' },

  encouragementBox: { backgroundColor: '#FFF8ED', padding: 16, borderRadius: 12, width: '100%' },
  encouragementText: { fontSize: 14, color: WARM_ORANGE, textAlign: 'center', lineHeight: 20 },

  resultsActions: { gap: 12 },
  nextLevelButton: { backgroundColor: SUCCESS, padding: 16, borderRadius: 16, alignItems: 'center' },
  nextLevelButtonText: { fontSize: 16, fontWeight: '800', color: CARD_WHITE },
  reviewExerciseButton: { backgroundColor: WARM_ORANGE, padding: 16, borderRadius: 16, alignItems: 'center' },
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
  wrongAnswerPinyin: { fontSize: 13, color: ERROR, fontStyle: 'italic', marginTop: 4, opacity: 0.8 },

  correctAnswerBox: { backgroundColor: 'rgba(45,122,74,0.10)', borderRadius: 12, padding: 14, borderWidth: 2, borderColor: SUCCESS },
  correctAnswerText: { fontSize: 15, fontWeight: '600', color: SUCCESS },
  correctAnswerPinyin: { fontSize: 13, color: SUCCESS, fontStyle: 'italic', marginTop: 4, opacity: 0.8 },
});
