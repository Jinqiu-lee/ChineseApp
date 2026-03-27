import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { generateRounds } from '../utils/stageGenerator';
import FlashcardExercise from '../components/exercises/FlashcardExercise';
import AudioChoiceExercise from '../components/exercises/AudioChoiceExercise';
import FillBlankExercise from '../components/exercises/FillBlankExercise';
import ArrangeSentenceExercise from '../components/exercises/ArrangeSentenceExercise';
import MatchPairsExercise from '../components/exercises/MatchPairsExercise';
import SpeakExercise from '../components/exercises/SpeakExercise';
import ImageExercise from '../components/exercises/ImageExercise';
import PinyinExercise from '../components/exercises/PinyinExercise';
import { getAvatarForLesson } from '../config/lessonAvatarMap';
import { applyAvatarNames } from '../utils/applyAvatarNames';

const STAGE_NAMES = [
  'First Look', 'Listen & Choose', 'Build Sentences', 'Match & Review', 'Final Challenge',
];

export default function StageExercisesScreen({ lessonData, stageIndex, roundIndex = 0, onComplete, onBack }) {
  const avatarId = getAvatarForLesson(lessonData?.topic, lessonData?.topic_chinese);
  const [exercises, setExercises] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const processedData = applyAvatarNames(lessonData, avatarId);
    const rounds = generateRounds(processedData);
    const round = rounds[roundIndex] || rounds[0];
    setExercises(round[stageIndex] || []);
  }, []);

  const advance = (wasCorrect) => {
    if (wasCorrect) setScore(s => s + 1);
    const next = currentIndex + 1;
    if (next >= exercises.length) {
      setDone(true);
    } else {
      setCurrentIndex(next);
    }
  };

  const handleExit = () => {
    Alert.alert(
      'Exit Stage',
      'Your progress in this stage will be lost.',
      [
        { text: 'Stay', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: onBack },
      ]
    );
  };

  if (exercises.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading exercises...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Completion screen ──────────────────────────────────────────────────
  if (done) {
    const total = exercises.length;
    const stars = score >= total - 1 ? 3 : score >= Math.floor(total * 0.6) ? 2 : 1;
    const messages = ['加油！Keep practicing!', '很好！Great job!', '完美！Perfect!'];
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.completion}>
          <Text style={styles.starsText}>{'⭐'.repeat(stars)}</Text>
          <Text style={styles.doneTitle}>Stage Complete!</Text>
          <Text style={styles.doneStageName}>{STAGE_NAMES[stageIndex]}</Text>
          <Text style={styles.doneScore}>{score} / {total} correct</Text>
          <Text style={styles.doneMessage}>{messages[stars - 1]}</Text>
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => onComplete(stageIndex, score, exercises.length)}
            activeOpacity={0.85}
          >
            <Text style={styles.continueBtnText}>Continue →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Exercise screen ────────────────────────────────────────────────────
  const exercise = exercises[currentIndex];
  const progressPct = (currentIndex / exercises.length) * 100;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Progress header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
        </View>
        <Text style={styles.counter}>{currentIndex + 1}/{exercises.length}</Text>
      </View>

      {/* Exercise content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {exercise.type === 'flashcard' && (
          <FlashcardExercise
            key={currentIndex}
            exercise={exercise}
            onKnow={() => advance(true)}
            onDontKnow={() => advance(false)}
          />
        )}
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
  );
}

const VG = {
  bg: '#1C2A44', card: '#F5EDD8', cardDark: '#243454',
  onCard: '#1C2A44', onCardMid: '#5C4A2A', onCardMuted: '#9A8A6A',
  yellow: '#F4C542', gold: '#E0B04B', orange: '#D98C2B',
  cream: '#F7F3E9', creamMuted: '#8A7E6E',
  success: '#7DC47A',
  border: 'rgba(244,197,66,0.15)', shadow: '#A0700A',
};

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: VG.bg },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: VG.creamMuted, fontSize: 16 },

  // ── Progress header ───────────────────────────────────────────────────────
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
    borderBottomWidth: 1, borderBottomColor: VG.border,
  },
  closeBtn:    { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  closeText:   { fontSize: 18, color: VG.creamMuted, fontWeight: '700' },
  progressBg:  { flex: 1, height: 7, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' },
  progressFill:{ height: '100%', backgroundColor: VG.yellow, borderRadius: 4 },
  counter:     { fontSize: 13, color: VG.creamMuted, fontWeight: '600', minWidth: 36, textAlign: 'right' },

  // ── Exercise area ──────────────────────────────────────────────────────────
  scroll:        { flex: 1 },
  scrollContent: { padding: 16, flexGrow: 1 },

  // ── Completion screen ──────────────────────────────────────────────────────
  completion: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8 },
  starsText:  { fontSize: 52, marginBottom: 12 },
  doneTitle:  { fontSize: 32, fontWeight: '900', color: VG.cream,    marginBottom: 4 },
  doneStageName: { fontSize: 16, color: VG.gold, marginBottom: 12 },
  doneScore:  { fontSize: 22, fontWeight: '700', color: VG.success, marginBottom: 6 },
  doneMessage:{ fontSize: 16, color: VG.creamMuted, marginBottom: 40, textAlign: 'center', lineHeight: 24 },
  continueBtn: {
    backgroundColor: VG.yellow,
    borderRadius: 18,
    paddingHorizontal: 56, paddingVertical: 16,
    shadowColor: VG.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28, shadowRadius: 12, elevation: 6,
  },
  continueBtnText: { fontSize: 18, fontWeight: '800', color: VG.bg },
});
