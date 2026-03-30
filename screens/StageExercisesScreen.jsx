import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WaveBackground from '../components/WaveBackground';
import ScreenBackground from '../components/ScreenBackground';
import { LEVEL_SCREEN_PALETTES } from '../config/vanGoghTheme';
import { DEEP_NAVY, WARM_ORANGE, SLATE_TEAL, WARM_BROWN, CARD_WHITE, SUCCESS, ERROR } from '../constants/colors';
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

export default function StageExercisesScreen({ lessonData, levelId = 'hsk1', stageIndex, roundIndex = 0, onComplete, onBack }) {
  const T = LEVEL_SCREEN_PALETTES[levelId] || LEVEL_SCREEN_PALETTES.hsk1;
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
      <ScreenBackground levelId={levelId}>
        <SafeAreaView style={styles.safe}>
          <StatusBar barStyle={T.statusBar} />
          <View style={styles.center}>
            <Text style={styles.loadingText}>Loading exercises...</Text>
          </View>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  // ── Completion screen ──────────────────────────────────────────────────
  if (done) {
    const total = exercises.length;
    const stars = score >= total - 1 ? 3 : score >= Math.floor(total * 0.6) ? 2 : 1;
    const messages = ['加油！Keep practicing!', '很好！Great job!', '完美！Perfect!'];
    return (
      <ScreenBackground levelId={levelId}>
        <SafeAreaView style={styles.safe}>
          <StatusBar barStyle={T.statusBar} />
          {T.waveEnabled && <WaveBackground colors={T.waveColors} />}
          <View style={styles.completion}>
            <View style={styles.completionCard}>
              <Text style={styles.starsText}>{'⭐'.repeat(stars)}</Text>
              <Text style={styles.doneTitle}>Stage Complete!</Text>
              <Text style={styles.doneStageName}>{STAGE_NAMES[stageIndex]}</Text>
              <Text style={styles.doneScore}>{score} / {total} correct</Text>
              <Text style={styles.doneMessage}>{messages[stars - 1]}</Text>
            </View>
            <TouchableOpacity
              style={[styles.continueBtn, { backgroundColor: T.accent, shadowColor: T.shadow }]}
              onPress={() => onComplete(stageIndex, score, exercises.length)}
              activeOpacity={0.85}
            >
              <Text style={[styles.continueBtnText, { color: T.accentText }]}>Continue →</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  // ── Exercise screen ────────────────────────────────────────────────────
  const exercise = exercises[currentIndex];
  const progressPct = (currentIndex / exercises.length) * 100;

  return (
    <ScreenBackground levelId={levelId}>
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle={T.statusBar} />
        {T.waveEnabled && <WaveBackground colors={T.waveColors} />}
        {/* Progress header */}
        <View style={[styles.header, { borderBottomColor: T.border }]}>
          <TouchableOpacity onPress={handleExit} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: T.progressFill }]} />
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
    </ScreenBackground>
  );
}

const VG = {
  bg: 'transparent', card: CARD_WHITE, cardDark: CARD_WHITE,
  onCard: DEEP_NAVY, onCardMid: WARM_BROWN, onCardMuted: WARM_BROWN,
  yellow: WARM_ORANGE, gold: WARM_BROWN, orange: WARM_ORANGE,
  cream: DEEP_NAVY, creamMuted: SLATE_TEAL,
  success: SUCCESS,
  border: 'rgba(155,104,70,0.18)', shadow: 'rgba(28,42,68,0.18)',
};

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: 'transparent' },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: SLATE_TEAL, fontSize: 16, backgroundColor: CARD_WHITE, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },

  // ── Progress header ───────────────────────────────────────────────────────
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
    backgroundColor: CARD_WHITE,
    borderBottomWidth: 1, borderBottomColor: VG.border,
  },
  closeBtn:    { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  closeText:   { fontSize: 18, color: WARM_BROWN, fontWeight: '700' },
  progressBg:  { flex: 1, height: 7, backgroundColor: 'rgba(55,73,80,0.22)', borderRadius: 4, overflow: 'hidden' },
  progressFill:{ height: '100%', backgroundColor: VG.yellow, borderRadius: 4 },
  counter:     { fontSize: 13, color: WARM_BROWN, fontWeight: '600', minWidth: 36, textAlign: 'right' },

  // ── Exercise area ──────────────────────────────────────────────────────────
  scroll:        { flex: 1 },
  scrollContent: { padding: 16, flexGrow: 1 },

  // ── Completion screen ──────────────────────────────────────────────────────
  completion: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 20 },
  completionCard: {
    backgroundColor: CARD_WHITE, borderRadius: 24, padding: 32,
    alignItems: 'center', gap: 8, width: '100%',
    shadowColor: VG.shadow, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18, shadowRadius: 16, elevation: 6,
    borderWidth: 1, borderColor: VG.border,
  },
  starsText:  { fontSize: 52, marginBottom: 8 },
  doneTitle:  { fontSize: 32, fontWeight: '900', color: DEEP_NAVY, marginBottom: 4 },
  doneStageName: { fontSize: 16, color: WARM_BROWN, marginBottom: 8 },
  doneScore:  { fontSize: 22, fontWeight: '700', color: SUCCESS, marginBottom: 4 },
  doneMessage:{ fontSize: 16, color: SLATE_TEAL, textAlign: 'center', lineHeight: 24 },
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
