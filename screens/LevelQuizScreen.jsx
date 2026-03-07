import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PASS_SCORE = 60;
const REVIEW_SCORE = 50;

const NEXT_LEVEL = {
  hsk1: { emoji: '🚶', name: 'Level 2 – Explorer' },
  hsk2: { emoji: '🗣',  name: 'Level 3 – Conversation Builder' },
  hsk3: { emoji: '🌟', name: 'Level 4 – Confident Speaker' },
  hsk4: { emoji: '🔥', name: 'Level 5 – Communicator' },
  hsk5: { emoji: '🎓', name: 'Level 6 – Advanced' },
};

// Import quiz data - data folder is in root
import quizData from '../data/hsk1/hsk1_level_quiz.json';

/**
 * LevelQuizScreen - HSK1 Final Quiz
 * 30 questions with pinyin support
 */
export default function LevelQuizScreen({ currentLevelId, onBack, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [score, setScore] = useState(0);

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
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" />
        
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
                        {question.difficulty.toUpperCase()}
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
    );
  }

  // Results Screen
  if (showResults) {
    const passed = getPassed();
    const review = needsReview();
    const correctCount = Object.values(answers).filter(a => a.isCorrect).length;
    const nextLevel = NEXT_LEVEL[currentLevelId];

    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" />
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
              <Text style={[styles.scoreText, { color: passed ? '#1DD1A1' : '#FF6B6B' }]}>
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
    );
  }

  // Quiz Screen
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      
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
            {question.difficulty.toUpperCase()}
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
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  backButton: { paddingVertical: 8, paddingRight: 12 },
  backButtonText: { fontSize: 16, fontWeight: '600', color: '#FF6B6B' },
  headerCenter: { flex: 1, alignItems: 'center' },
  quizTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  
  progressContainer: { paddingHorizontal: 20, paddingVertical: 16 },
  progressBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressBarFill: { height: '100%', backgroundColor: '#1DD1A1', borderRadius: 4 },
  progressText: { fontSize: 13, color: '#636e72', textAlign: 'center' },
  
  scrollView: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 40 },
  
  difficultyBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 16 },
  difficultyEasy: { backgroundColor: 'rgba(29, 209, 161, 0.2)' },
  difficultyMedium: { backgroundColor: 'rgba(255, 159, 67, 0.2)' },
  difficultyHard: { backgroundColor: 'rgba(255, 107, 107, 0.2)' },
  difficultyText: { fontSize: 11, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  
  questionCard: { backgroundColor: '#16213e', borderRadius: 20, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: '#2d3436' },
  questionText: { fontSize: 18, fontWeight: '700', color: '#fff', lineHeight: 28 },
  questionPinyin: { fontSize: 15, color: '#a29bfe', fontStyle: 'italic', marginTop: 8 },
  
  optionsContainer: { gap: 12, marginBottom: 20 },
  optionButton: { backgroundColor: '#16213e', borderRadius: 16, padding: 18, borderWidth: 2, borderColor: '#2d3436' },
  optionButtonSelected: { borderColor: '#1DD1A1', backgroundColor: 'rgba(29, 209, 161, 0.1)' },
  optionContent: { flex: 1 },
  optionText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  optionTextSelected: { color: '#1DD1A1' },
  optionPinyin: { fontSize: 14, color: '#FFD700', fontStyle: 'italic', marginTop: 6, fontWeight: '500', backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
  optionPinyinSelected: { color: '#1DD1A1', backgroundColor: 'rgba(29, 209, 161, 0.2)' },
  
  lessonRef: { fontSize: 12, color: '#636e72', textAlign: 'center', fontStyle: 'italic' },
  
  footer: { paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  nextButton: { backgroundColor: '#1DD1A1', padding: 16, borderRadius: 16, alignItems: 'center' },
  nextButtonDisabled: { backgroundColor: '#636e72', opacity: 0.5 },
  nextButtonText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  
  // Results
  // Unlock celebration card
  unlockCard:       { backgroundColor: 'rgba(29,209,161,0.12)', borderRadius: 24, padding: 28, alignItems: 'center', marginBottom: 16, borderWidth: 2, borderColor: '#1DD1A1' },
  unlockEmoji:      { fontSize: 52, marginBottom: 8 },
  unlockTitle:      { fontSize: 28, fontWeight: '900', color: '#1DD1A1', marginBottom: 12 },
  unlockLevelRow:   { alignItems: 'center', gap: 6 },
  unlockLabel:      { fontSize: 14, color: '#b2bec3', fontWeight: '600' },
  unlockLevelBadge: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, marginTop: 4 },
  unlockLevelText:  { fontSize: 18, fontWeight: '800', color: '#fff' },

  resultsContainer: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  resultsCard: { backgroundColor: '#16213e', borderRadius: 24, padding: 32, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#2d3436' },
  resultsEmoji: { fontSize: 64, marginBottom: 16 },
  resultsTitle: { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 8 },
  resultsSubtitle: { fontSize: 16, color: '#a29bfe', marginBottom: 24 },
  
  scoreCircle: { width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 3, borderColor: 'rgba(255,255,255,0.1)' },
  scoreText: { fontSize: 42, fontWeight: '900' },
  scoreLabel: { fontSize: 13, color: '#636e72', marginTop: 4 },
  
  statsBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 20, width: '100%', marginBottom: 16 },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#636e72' },
  statDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.1)' },
  
  passingText: { fontSize: 13, color: '#636e72', marginBottom: 16 },
  
  passedBox: { backgroundColor: 'rgba(29, 209, 161, 0.2)', padding: 16, borderRadius: 12, width: '100%' },
  passedText: { fontSize: 15, fontWeight: '600', color: '#1DD1A1', textAlign: 'center' },
  
  encouragementBox: { backgroundColor: 'rgba(255, 159, 67, 0.2)', padding: 16, borderRadius: 12, width: '100%' },
  encouragementText: { fontSize: 14, color: '#FF9F43', textAlign: 'center', lineHeight: 20 },
  
  resultsActions: { gap: 12 },
  nextLevelButton: { backgroundColor: '#1DD1A1', padding: 16, borderRadius: 16, alignItems: 'center' },
  nextLevelButtonText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  reviewExerciseButton: { backgroundColor: '#FF9F43', padding: 16, borderRadius: 16, alignItems: 'center' },
  reviewButton: { backgroundColor: '#a29bfe', padding: 16, borderRadius: 16, alignItems: 'center' },
  reviewButtonText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  retryButton: { backgroundColor: '#FF9F43', padding: 16, borderRadius: 16, alignItems: 'center' },
  retryButtonText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  doneButton: { backgroundColor: '#16213e', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#2d3436' },
  doneButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  
  // Review Screen
  reviewHeader: { backgroundColor: '#16213e', borderRadius: 20, padding: 24, marginBottom: 24, alignItems: 'center', borderWidth: 1, borderColor: '#2d3436' },
  reviewTitle: { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 8 },
  reviewSubtitle: { fontSize: 14, color: '#636e72' },
  
  perfectScore: { backgroundColor: '#16213e', borderRadius: 20, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: '#2d3436' },
  perfectScoreEmoji: { fontSize: 64, marginBottom: 16 },
  perfectScoreText: { fontSize: 24, fontWeight: '900', color: '#1DD1A1', marginBottom: 8 },
  perfectScoreSubtext: { fontSize: 14, color: '#636e72' },
  
  reviewQuestionCard: { backgroundColor: '#16213e', borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#2d3436' },
  reviewQuestionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  reviewQuestionNumber: { fontSize: 16, fontWeight: '800', color: '#fff' },
  reviewQuestionText: { marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  
  reviewAnswerSection: { marginBottom: 16 },
  reviewLabel: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 8 },
  
  wrongAnswerBox: { backgroundColor: 'rgba(255, 107, 107, 0.2)', borderRadius: 12, padding: 14, borderWidth: 2, borderColor: '#FF6B6B' },
  wrongAnswerText: { fontSize: 15, fontWeight: '600', color: '#FF6B6B' },
  wrongAnswerPinyin: { fontSize: 13, color: '#FF6B6B', fontStyle: 'italic', marginTop: 4, opacity: 0.8 },
  
  correctAnswerBox: { backgroundColor: 'rgba(29, 209, 161, 0.2)', borderRadius: 12, padding: 14, borderWidth: 2, borderColor: '#1DD1A1' },
  correctAnswerText: { fontSize: 15, fontWeight: '600', color: '#1DD1A1' },
  correctAnswerPinyin: { fontSize: 13, color: '#1DD1A1', fontStyle: 'italic', marginTop: 4, opacity: 0.8 },
});
