import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WaveBackground from '../components/WaveBackground';
import ScreenBackground from '../components/ScreenBackground';
import { LEVEL_SCREEN_PALETTES } from '../config/vanGoghTheme';

import { generateQuizRound } from '../utils/stageGenerator';
import AudioChoiceExercise   from '../components/exercises/AudioChoiceExercise';
import FillBlankExercise     from '../components/exercises/FillBlankExercise';
import ArrangeSentenceExercise from '../components/exercises/ArrangeSentenceExercise';
import MatchPairsExercise    from '../components/exercises/MatchPairsExercise';
import SpeakExercise         from '../components/exercises/SpeakExercise';
import ImageExercise         from '../components/exercises/ImageExercise';
import PinyinExercise        from '../components/exercises/PinyinExercise';
import { getAvatarForLesson } from '../config/lessonAvatarMap';
import { applyAvatarNames } from '../utils/applyAvatarNames';

const PASS_SCORE   = 60;
const REVIEW_SCORE = 50;

const TYPE_LABELS = {
  audio_choice:    '🎧 Listen & Choose',
  fill_blank:      '✏️ Fill in the Blank',
  arrange:         '🧩 Build the Sentence',
  match_pairs:     '🔄 Match Pairs',
  speak:           '🎤 Speaking',
  image_exercise:  '🖼️ Picture Quiz',
  pinyin_exercise: '🎵 Pinyin Focus',
};

export default function LessonQuizScreen({ lessonData, levelId = 'hsk1', onBack }) {
  const T = LEVEL_SCREEN_PALETTES[levelId] || LEVEL_SCREEN_PALETTES.hsk1;
  const avatarId = getAvatarForLesson(lessonData?.topic, lessonData?.topic_chinese);
  // Generate once per mount, with character names swapped to match the lesson avatar
  const exercises = useMemo(
    () => generateQuizRound(applyAvatarNames(lessonData, avatarId)),
    [lessonData],
  );

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
      <ScreenBackground>
        <SafeAreaView style={styles.safe}>
        <StatusBar barStyle={T.statusBar} />
        {T.waveEnabled && <WaveBackground colors={T.waveColors} />}
        <ScrollView contentContainerStyle={styles.resultsContainer}>

          <View style={[styles.resultsCard, { backgroundColor: T.card, shadowColor: T.shadow }]}>
            <Text style={styles.resultsEmoji}>{passed ? '🏆' : '📚'}</Text>
            <Text style={[styles.resultsTitle, { color: T.onCard }]}>{passed ? 'Quiz Passed!' : 'Keep Practicing!'}</Text>
            <Text style={[styles.resultsSubtitle, { color: T.altAccent ?? T.gold }]}>
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
            <TouchableOpacity style={[styles.retryButton, { backgroundColor: T.accent, shadowColor: T.shadow }]} onPress={handleRestart}>
              <Text style={[styles.actionButtonText, { color: T.accentText }]}>🔄 Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.doneButton, { borderColor: T.gold }]} onPress={onBack}>
              <Text style={[styles.doneButtonText, { color: T.gold }]}>← Back to Lesson</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  // ── Empty guard ────────────────────────────────────────────────────────────
  if (!exercise) {
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.safe}>
          <View style={styles.center}>
            <Text style={[styles.emptyText, { color: T.onBgMuted }]}>No quiz exercises available.</Text>
            <TouchableOpacity style={[styles.doneButton, { borderColor: T.gold }]} onPress={onBack}>
              <Text style={[styles.doneButtonText, { color: T.gold }]}>← Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  // ── Safety net: skip unrenderable types (e.g. flashcard fallbacks) ──────────
  const RENDERABLE_TYPES = new Set([
    'audio_choice', 'fill_blank', 'arrange', 'match_pairs', 'speak', 'image_exercise', 'pinyin_exercise',
  ]);
  if (!RENDERABLE_TYPES.has(exercise.type)) {
    // Auto-advance past this exercise on next tick
    setTimeout(() => advance(false), 0);
    return null;
  }

  // ── Quiz Screen ────────────────────────────────────────────────────────────
  const typeLabel = TYPE_LABELS[exercise.type] ?? '📝 Quiz';

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={T.statusBar} />
      {T.waveEnabled && <WaveBackground colors={T.waveColors} />}

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: T.border }]}>
        <TouchableOpacity onPress={handleExit} style={styles.exitBtn}>
          <Text style={[styles.exitText, { color: T.onBgMuted }]}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: T.progressFill }]} />
        </View>
        <Text style={[styles.counter, { color: T.onBgMuted }]}>{currentIndex + 1}/{total}</Text>
      </View>

      {/* Type label + lesson name */}
      <View style={[styles.typeRow, { borderBottomColor: T.border }]}>
        <Text style={[styles.typeLabel, { color: T.gold }]}>{typeLabel}</Text>
        <Text style={[styles.lessonLabel, { color: T.onBgMuted }]} numberOfLines={1}>{lessonName}</Text>
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
            avatarId={avatarId}
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
            avatarId={avatarId}
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
        {exercise.type === 'pinyin_exercise' && (
          <PinyinExercise
            key={currentIndex}
            exercise={exercise}
            onCorrect={() => advance(true)}
            onWrong={() => advance(false)}
          />
        )}
      </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const VG = {
  bg: '#1C2A44', card: '#F5EDD8', cardDark: '#243454',
  onCard: '#1C2A44', onCardMid: '#5C4A2A', onCardMuted: '#9A8A6A',
  yellow: '#F4C542', gold: '#E0B04B', orange: '#D98C2B',
  cream: '#F7F3E9', creamMid: '#C5B99A', creamMuted: '#8A7E6E',
  success: '#5A9E5A', error: '#C4503A',
  border: 'rgba(244,197,66,0.15)', shadow: '#A0700A',
};

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: VG.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
    borderBottomWidth: 1, borderBottomColor: VG.border,
  },
  exitBtn:      { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  exitText:     { fontSize: 18, color: VG.creamMuted, fontWeight: '700' },
  progressBg:   { flex: 1, height: 7, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: VG.yellow, borderRadius: 4 },
  counter:      { fontSize: 13, color: VG.creamMuted, fontWeight: '600', minWidth: 36, textAlign: 'right' },

  typeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: VG.border,
  },
  typeLabel:   { fontSize: 14, fontWeight: '700', color: VG.gold },
  lessonLabel: { fontSize: 12, color: VG.creamMuted, flex: 1, textAlign: 'right' },

  scroll:        { flex: 1 },
  scrollContent: { padding: 16, flexGrow: 1 },

  emptyText: { fontSize: 16, color: VG.creamMuted, marginBottom: 24, textAlign: 'center' },

  // ── Results ───────────────────────────────────────────────────────────────
  resultsContainer: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  resultsCard: {
    backgroundColor: VG.card,
    borderRadius: 24, padding: 32, alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(217,140,43,0.2)',
    shadowColor: VG.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 7,
  },
  resultsEmoji:    { fontSize: 64, marginBottom: 16 },
  resultsTitle:    { fontSize: 28, fontWeight: '900', color: VG.onCard,  marginBottom: 8 },
  resultsSubtitle: { fontSize: 16,                    color: VG.orange,  marginBottom: 24 },

  scoreCircle: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(28,42,68,0.07)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 3, borderColor: 'rgba(217,140,43,0.3)',
  },
  scoreText:  { fontSize: 42, fontWeight: '900' },
  scoreLabel: { fontSize: 13, color: VG.onCardMuted, marginTop: 4 },

  statsBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(28,42,68,0.06)', borderRadius: 16, padding: 20,
    width: '100%', marginBottom: 16,
  },
  statItem:   { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '800', color: VG.onCard, marginBottom: 4 },
  statLabel:  { fontSize: 12, color: VG.onCardMuted },
  statDivider:{ width: 1, height: 40, backgroundColor: 'rgba(28,42,68,0.1)' },

  passingText:       { fontSize: 13, color: VG.onCardMuted, marginBottom: 16 },
  encouragementBox:  { backgroundColor: 'rgba(217,140,43,0.15)', padding: 16, borderRadius: 12, width: '100%' },
  encouragementText: { fontSize: 14, color: VG.orange, textAlign: 'center', lineHeight: 20 },

  resultsActions:   { gap: 12 },
  retryButton:      {
    backgroundColor: VG.yellow,
    padding: 16, borderRadius: 16, alignItems: 'center',
    shadowColor: VG.shadow, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 5,
  },
  actionButtonText: { fontSize: 16, fontWeight: '800', color: VG.bg },
  doneButton:       {
    backgroundColor: 'transparent',
    padding: 16, borderRadius: 16, alignItems: 'center',
    borderWidth: 1.5, borderColor: VG.gold,
  },
  doneButtonText:   { fontSize: 16, fontWeight: '600', color: VG.gold },
});
