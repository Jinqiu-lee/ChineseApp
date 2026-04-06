import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenBackground from '../components/ScreenBackground';
import {
  DEEP_NAVY, WARM_ORANGE, WARM_BROWN, CARD_WHITE, SUCCESS, ERROR,
} from '../constants/colors';

/**
 * ReviewMistakesScreen
 *
 * Props:
 *   wrongQuestionIds  – string[]   IDs of questions the student got wrong
 *   allQuestions      – object[]   Full question list (un-shuffled original)
 *   answers           – object     { [id]: { selected, correct, isCorrect } }
 *   currentLevelId    – string
 *   onRetry           – fn(retryQuestions: object[])  called with shuffled+variant qs
 *   onBack            – fn()       go back to results
 *   attemptCount      – number     total quiz attempts so far (for variant selection)
 */
export default function ReviewMistakesScreen({
  wrongQuestionIds,
  allQuestions,
  answers,
  currentLevelId,
  onRetry,
  onBack,
  attemptCount = 1,
}) {
  const wrongQuestions = allQuestions.filter(q => wrongQuestionIds.includes(q.id));
  const total = wrongQuestions.length;

  const [cardIndex, setCardIndex] = useState(0);
  const [allViewed, setAllViewed] = useState(total === 0);

  const goNext = () => {
    if (cardIndex + 1 >= total) {
      setAllViewed(true);
    } else {
      setCardIndex(cardIndex + 1);
    }
  };

  const handleRetry = () => {
    const retryQs = buildRetryQuestions(allQuestions, attemptCount);
    onRetry(retryQs);
  };

  if (total === 0) {
    return (
      <ScreenBackground levelId={currentLevelId}>
        <SafeAreaView style={styles.safe}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Review Mistakes</Text>
            <View style={{ width: 60 }} />
          </View>
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={styles.emptyTitle}>No mistakes to review!</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>🔄 Retry Quiz</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  const q = wrongQuestions[cardIndex];
  const answer = answers?.[q.id];

  return (
    <ScreenBackground levelId={currentLevelId}>
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Mistakes</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Progress bar */}
        {!allViewed && (
          <View style={styles.progressRow}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${((cardIndex + 1) / total) * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>{cardIndex + 1} / {total}</Text>
          </View>
        )}

        <ScrollView contentContainerStyle={styles.content}>

          {allViewed ? (
            /* ── Summary / Retry view ──────────────────────────────────── */
            <View style={styles.summaryBlock}>
              <Text style={styles.summaryEmoji}>✅</Text>
              <Text style={styles.summaryTitle}>Review Complete!</Text>
              <Text style={styles.summarySubtitle}>
                You reviewed {total} mistake{total > 1 ? 's' : ''}. Ready to try again?
              </Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry} activeOpacity={0.85}>
                <Text style={styles.retryButtonText}>🔄 Retry Quiz</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.backToResultsBtn} onPress={onBack} activeOpacity={0.85}>
                <Text style={styles.backToResultsBtnText}>← Back to Results</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* ── Review card ───────────────────────────────────────────── */
            <View style={styles.card}>
              {/* Question */}
              <View style={styles.questionBlock}>
                <Text style={styles.cardLabel}>QUESTION {cardIndex + 1} of {total}</Text>
                <Text style={styles.questionText}>{q.question}</Text>
                {q.question_pinyin ? (
                  <Text style={styles.questionPinyin}>{q.question_pinyin}</Text>
                ) : null}
              </View>

              {/* Wrong answer */}
              <View style={styles.answerBlock}>
                <Text style={styles.wrongLabel}>❌ Your Answer</Text>
                <View style={styles.wrongBox}>
                  <Text style={styles.wrongText}>{answer?.selected ?? '—'}</Text>
                </View>
              </View>

              {/* Correct answer */}
              <View style={styles.answerBlock}>
                <Text style={styles.correctLabel}>✅ Correct Answer</Text>
                <View style={styles.correctBox}>
                  <Text style={styles.correctText}>{q.correct}</Text>
                  {q.correct_pinyin ? (
                    <Text style={styles.correctPinyin}>{q.correct_pinyin}</Text>
                  ) : null}
                </View>
              </View>

              {/* Lesson ref */}
              {q.lesson_reference ? (
                <Text style={styles.lessonRef}>Lesson {q.lesson_reference}</Text>
              ) : null}

              {/* Next / Done button */}
              <TouchableOpacity
                style={styles.nextButton}
                onPress={goNext}
                activeOpacity={0.85}
              >
                <Text style={styles.nextButtonText}>
                  {cardIndex + 1 < total ? 'Next →' : 'Done Reviewing →'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function applyVariant(question, attemptIndex) {
  if (!question.variants || question.variants.length === 0) return question;
  const idx = Math.min(attemptIndex, question.variants.length - 1);
  return { ...question, ...question.variants[idx] };
}

function buildRetryQuestions(allQuestions, attemptCount) {
  const attemptIndex = Math.max(0, attemptCount - 1);
  const withVariants = allQuestions.map(q => applyVariant(q, attemptIndex));
  const shuffledQs = shuffleArray(withVariants);
  return shuffledQs.map(q => {
    if (!q.options) return q;
    const pairs = q.options.map((text, i) => ({
      text,
      pinyin: q.option_pinyin?.[i] ?? null,
    }));
    const shuffledPairs = shuffleArray(pairs);
    return {
      ...q,
      options: shuffledPairs.map(p => p.text),
      option_pinyin: shuffledPairs.map(p => p.pinyin),
    };
  });
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { minWidth: 60 },
  backBtnText: { fontSize: 15, color: DEEP_NAVY, fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: DEEP_NAVY },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 10,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.10)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: WARM_ORANGE,
    borderRadius: 3,
  },
  progressText: { fontSize: 13, fontWeight: '700', color: DEEP_NAVY, minWidth: 40, textAlign: 'right' },

  content: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 },

  /* Review card */
  card: {
    backgroundColor: CARD_WHITE,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  questionBlock: { gap: 6 },
  cardLabel: { fontSize: 11, fontWeight: '700', color: WARM_ORANGE, letterSpacing: 1 },
  questionText: { fontSize: 22, fontWeight: '800', color: DEEP_NAVY, lineHeight: 30 },
  questionPinyin: { fontSize: 14, color: WARM_BROWN, fontStyle: 'italic' },

  answerBlock: { gap: 6 },
  wrongLabel: { fontSize: 13, fontWeight: '700', color: ERROR },
  wrongBox: {
    backgroundColor: '#fde8e8',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: ERROR,
    padding: 14,
  },
  wrongText: { fontSize: 18, fontWeight: '700', color: ERROR },

  correctLabel: { fontSize: 13, fontWeight: '700', color: SUCCESS },
  correctBox: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: SUCCESS,
    padding: 14,
    gap: 4,
  },
  correctText: { fontSize: 18, fontWeight: '700', color: SUCCESS },
  correctPinyin: { fontSize: 13, color: '#388e3c', fontStyle: 'italic' },

  lessonRef: { fontSize: 12, color: '#999', fontWeight: '500', textAlign: 'right' },

  nextButton: {
    backgroundColor: DEEP_NAVY,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  nextButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  /* Summary / retry */
  summaryBlock: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    gap: 14,
  },
  summaryEmoji: { fontSize: 56 },
  summaryTitle: { fontSize: 26, fontWeight: '800', color: DEEP_NAVY, textAlign: 'center' },
  summarySubtitle: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22 },

  retryButton: {
    backgroundColor: WARM_ORANGE,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 40,
    marginTop: 8,
    alignItems: 'center',
    width: '100%',
  },
  retryButtonText: { fontSize: 18, fontWeight: '800', color: '#fff' },

  backToResultsBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.15)',
    width: '100%',
  },
  backToResultsBtnText: { fontSize: 15, fontWeight: '600', color: DEEP_NAVY },

  /* Empty state */
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: DEEP_NAVY },
});
