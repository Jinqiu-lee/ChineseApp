import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { generateQuizRound } from '../utils/stageGenerator';
import AudioChoiceExercise   from '../components/exercises/AudioChoiceExercise';
import FillBlankExercise     from '../components/exercises/FillBlankExercise';
import ArrangeSentenceExercise from '../components/exercises/ArrangeSentenceExercise';
import MatchPairsExercise    from '../components/exercises/MatchPairsExercise';
import SpeakExercise         from '../components/exercises/SpeakExercise';
import ImageExercise         from '../components/exercises/ImageExercise';

const PASS_SCORE   = 60;
const REVIEW_SCORE = 50;

const TYPE_LABELS = {
  audio_choice:   '🎧 Listen & Choose',
  fill_blank:     '✏️ Fill in the Blank',
  arrange:        '🧩 Build the Sentence',
  match_pairs:    '🔄 Match Pairs',
  speak:          '🎤 Speaking',
  image_exercise: '🖼️ Picture Quiz',
};

export default function LessonQuizScreen({ lessonData, onBack }) {
  // Generate once per mount
  const exercises = useMemo(() => generateQuizRound(lessonData), [lessonData]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score,        setScore]        = useState(0);
  const [showResults,  setShowResults]  = useState(false);

  const total    = exercises.length;
  const exercise = exercises[currentIndex];
  const progress = total > 0 ? (currentIndex / total) * 100 : 0;

  const lessonName = lessonData?.topic
    ? `Lesson ${lessonData.lesson}: ${lessonData.topic}`
    : `Lesson ${lessonData?.lesson ?? ''} Quiz`;

  // ── Advance ────────────────────────────────────────────────────────────────
  const advance = (wasCorrect) => {
    if (wasCorrect) setScore(s => s + 1);
    const next = currentIndex + 1;
    if (next >= total) {
      setShowResults(true);
    } else {
      setCurrentIndex(next);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setShowResults(false);
  };

  const handleExit = () => {
    Alert.alert(
      'Exit Quiz',
      'Your quiz progress will be lost.',
      [
        { text: 'Stay', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: onBack },
      ],
    );
  };

  // ── Results Screen ─────────────────────────────────────────────────────────
  if (showResults) {
    const pct      = Math.round((score / total) * 100);
    const passed   = pct >= PASS_SCORE;
    const needReview = pct < REVIEW_SCORE;

    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.resultsContainer}>

          <View style={styles.resultsCard}>
            <Text style={styles.resultsEmoji}>{passed ? '🏆' : '📚'}</Text>
            <Text style={styles.resultsTitle}>{passed ? 'Quiz Passed!' : 'Keep Practicing!'}</Text>
            <Text style={styles.resultsSubtitle}>
              {passed ? '太棒了！Tài bàng le!' : '加油！Jiā yóu!'}
            </Text>

            <View style={styles.scoreCircle}>
              <Text style={[styles.scoreText, { color: passed ? '#1DD1A1' : '#FF6B6B' }]}>
                {pct}%
              </Text>
              <Text style={styles.scoreLabel}>Score</Text>
            </View>

            <View style={styles.statsBox}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{score}</Text>
                <Text style={styles.statLabel}>Correct</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{total - score}</Text>
                <Text style={styles.statLabel}>Incorrect</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>

            <Text style={styles.passingText}>
              Pass threshold: {PASS_SCORE}% · You scored: {pct}%
            </Text>

            {!passed && needReview && (
              <View style={styles.encouragementBox}>
                <Text style={styles.encouragementText}>
                  Your score is below 50%. Please review the lesson material and practice stages before trying again!
                </Text>
              </View>
            )}
            {!passed && !needReview && (
              <View style={styles.encouragementBox}>
                <Text style={styles.encouragementText}>
                  So close! You need 60% to pass. Try again! 💪
                </Text>
              </View>
            )}
          </View>

          <View style={styles.resultsActions}>
            <TouchableOpacity style={styles.retryButton} onPress={handleRestart}>
              <Text style={styles.actionButtonText}>🔄 Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.doneButton} onPress={onBack}>
              <Text style={styles.doneButtonText}>← Back to Lesson</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Empty guard ────────────────────────────────────────────────────────────
  if (!exercise) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>No quiz exercises available.</Text>
          <TouchableOpacity style={styles.doneButton} onPress={onBack}>
            <Text style={styles.doneButtonText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Quiz Screen ────────────────────────────────────────────────────────────
  const typeLabel = TYPE_LABELS[exercise.type] ?? '📝 Quiz';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit} style={styles.exitBtn}>
          <Text style={styles.exitText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.counter}>{currentIndex + 1}/{total}</Text>
      </View>

      {/* Type label + lesson name */}
      <View style={styles.typeRow}>
        <Text style={styles.typeLabel}>{typeLabel}</Text>
        <Text style={styles.lessonLabel} numberOfLines={1}>{lessonName}</Text>
      </View>

      {/* Exercise */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {exercise.type === 'audio_choice' && (
          <AudioChoiceExercise
            key={currentIndex}
            exercise={exercise}
            onCorrect={() => advance(true)}
            onWrong={() => advance(false)}
          />
        )}
        {exercise.type === 'fill_blank' && (
          <FillBlankExercise
            key={currentIndex}
            exercise={exercise}
            onCorrect={() => advance(true)}
            onWrong={() => advance(false)}
          />
        )}
        {exercise.type === 'arrange' && (
          <ArrangeSentenceExercise
            key={currentIndex}
            exercise={exercise}
            onCorrect={() => advance(true)}
            onWrong={() => advance(false)}
          />
        )}
        {exercise.type === 'match_pairs' && (
          <MatchPairsExercise
            key={currentIndex}
            exercise={exercise}
            onComplete={(allCorrect) => advance(allCorrect)}
          />
        )}
        {exercise.type === 'speak' && (
          <SpeakExercise
            key={currentIndex}
            exercise={exercise}
            onCorrect={() => advance(true)}
            onWrong={() => advance(false)}
          />
        )}
        {exercise.type === 'image_exercise' && (
          <ImageExercise
            key={currentIndex}
            exercise={exercise}
            onCorrect={() => advance(true)}
            onWrong={() => advance(false)}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#1a1a2e' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
  },
  exitBtn:      { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  exitText:     { fontSize: 18, color: '#636e72', fontWeight: '700' },
  progressBg:   { flex: 1, height: 8, backgroundColor: '#2d3436', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#FF6B6B', borderRadius: 4 },
  counter:      { fontSize: 13, color: '#636e72', fontWeight: '600', minWidth: 36, textAlign: 'right' },

  typeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  typeLabel:   { fontSize: 14, fontWeight: '700', color: '#FF6B6B' },
  lessonLabel: { fontSize: 12, color: '#636e72', flex: 1, textAlign: 'right' },

  scroll:        { flex: 1 },
  scrollContent: { padding: 16, flexGrow: 1 },

  emptyText: { fontSize: 16, color: '#636e72', marginBottom: 24, textAlign: 'center' },

  // Results
  resultsContainer: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  resultsCard: {
    backgroundColor: '#16213e', borderRadius: 24, padding: 32, alignItems: 'center',
    marginBottom: 20, borderWidth: 1, borderColor: '#2d3436',
  },
  resultsEmoji:    { fontSize: 64, marginBottom: 16 },
  resultsTitle:    { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 8 },
  resultsSubtitle: { fontSize: 16, color: '#a29bfe', marginBottom: 24 },

  scoreCircle: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center',
    marginBottom: 24, borderWidth: 3, borderColor: 'rgba(255,255,255,0.1)',
  },
  scoreText:  { fontSize: 42, fontWeight: '900' },
  scoreLabel: { fontSize: 13, color: '#636e72', marginTop: 4 },

  statsBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 20,
    width: '100%', marginBottom: 16,
  },
  statItem:   { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 4 },
  statLabel:  { fontSize: 12, color: '#636e72' },
  statDivider:{ width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.1)' },

  passingText:       { fontSize: 13, color: '#636e72', marginBottom: 16 },
  encouragementBox:  { backgroundColor: 'rgba(255,159,67,0.2)', padding: 16, borderRadius: 12, width: '100%' },
  encouragementText: { fontSize: 14, color: '#FF9F43', textAlign: 'center', lineHeight: 20 },

  resultsActions: { gap: 12 },
  retryButton:    { backgroundColor: '#FF9F43', padding: 16, borderRadius: 16, alignItems: 'center' },
  actionButtonText:{ fontSize: 16, fontWeight: '800', color: '#fff' },
  doneButton:     { backgroundColor: '#16213e', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#2d3436' },
  doneButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
