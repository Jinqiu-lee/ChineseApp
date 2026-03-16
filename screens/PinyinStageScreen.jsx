import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { speakPinyin } from '../utils/tts';
import PinyinLessonExercise from '../components/exercises/PinyinLessonExercise';
import { buildStage1, buildStage2, buildStage3 } from '../utils/pinyinLessonGenerator';

const STAGE_META = [
  { title: 'Stage 1 · Listen & Identify', icon: '🔊', color: '#FF9F43' },
  { title: 'Stage 2 · Read & Repeat',     icon: '🗣️',  color: '#1DD1A1' },
  { title: 'Stage 3 · Visual Spelling',   icon: '✏️',  color: '#a29bfe' },
];

export default function PinyinStageScreen({ lessonData, stageIndex, onComplete, onBack }) {
  const exercises = useMemo(() => {
    if (!lessonData) return [];
    if (stageIndex === 0) return buildStage1(lessonData);
    if (stageIndex === 1) return buildStage2(lessonData);
    return buildStage3(lessonData);
  }, [lessonData, stageIndex]);

  const [current, setCurrent] = useState(0);
  const [score,   setScore]   = useState(0);
  const [done,    setDone]    = useState(false);

  const meta = STAGE_META[stageIndex] ?? STAGE_META[0];
  const exercise = exercises[current];

  // Auto-play audio when Stage 2 card changes
  useEffect(() => {
    if (stageIndex === 1 && exercise) {
      speakPinyin(exercise.audio_key || exercise.syllable);
    }
  }, [current, stageIndex]);

  const advance = (wasCorrect) => {
    if (wasCorrect) setScore(s => s + 1);
    const next = current + 1;
    if (next >= exercises.length) setDone(true);
    else setCurrent(next);
  };

  // Stage 2 speak cards — simple display with "Got it" button
  const renderSpeakCard = () => {
    const item = exercises[current];
    if (!item) return null;
    return (
      <View style={styles.speakCard}>
        <Text style={styles.speakCardInstr}>🗣️ Listen and repeat aloud</Text>
        {item.chinese ? (
          <Text style={styles.speakCardChinese}>{item.chinese}</Text>
        ) : null}
        <Text style={styles.speakCardSyllable}>{item.syllable}</Text>
        <Text style={styles.speakCardMeaning}>{item.meaning}</Text>
        <TouchableOpacity
          style={styles.playBtn}
          onPress={() => speakPinyin(item.audio_key || item.syllable)}
          activeOpacity={0.75}
        >
          <Text style={styles.playBtnText}>🔊  Play Audio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gotItBtn} onPress={() => advance(true)} activeOpacity={0.85}>
          <Text style={styles.gotItText}>✓  Got it — Next</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Done screen
  if (done) {
    const pct = exercises.length > 0 ? Math.round((score / exercises.length) * 100) : 100;
    const isSpeakStage = stageIndex === 1;
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.doneContainer}>
          <Text style={styles.doneEmoji}>{pct >= 70 ? '🎉' : '💪'}</Text>
          <Text style={styles.doneTitle}>{meta.title}</Text>
          <Text style={styles.doneTitle}>Complete!</Text>
          {!isSpeakStage && (
            <Text style={styles.doneScore}>{score}/{exercises.length} correct · {pct}%</Text>
          )}
          <TouchableOpacity style={styles.doneBtn} onPress={() => onComplete(score, exercises.length)} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>← Back to Lesson</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const progress = exercises.length > 0 ? (current / exercises.length) * 100 : 0;
  const isSpeakStage = stageIndex === 1;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.exitBtn}>
          <Text style={styles.exitText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: meta.color }]} />
        </View>
        <Text style={styles.counter}>{current + 1}/{exercises.length}</Text>
      </View>

      {/* Stage label */}
      <View style={[styles.stageBanner, { borderColor: meta.color + '44' }]}>
        <Text style={[styles.stageBannerText, { color: meta.color }]}>{meta.icon} {meta.title}</Text>
      </View>

      {/* Exercise */}
      {isSpeakStage ? (
        <View style={styles.speakWrapper}>
          {renderSpeakCard()}
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {exercise && (
            <PinyinLessonExercise
              key={current}
              exercise={exercise}
              onCorrect={() => advance(true)}
              onWrong={() => advance(false)}
            />
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a1a2e' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
  },
  exitBtn:      { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  exitText:     { fontSize: 18, color: '#636e72', fontWeight: '700' },
  progressBg:   { flex: 1, height: 8, backgroundColor: '#2d3436', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  counter:      { fontSize: 13, color: '#636e72', fontWeight: '600', minWidth: 36, textAlign: 'right' },

  stageBanner: {
    paddingHorizontal: 20, paddingVertical: 8,
    borderBottomWidth: 1, borderTopWidth: 1,
    borderColor: '#a29bfe22',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  stageBannerText: { fontSize: 13, fontWeight: '700' },

  // Speak card
  speakWrapper: { flex: 1, justifyContent: 'center', padding: 20 },
  speakCard: {
    backgroundColor: '#16213e', borderRadius: 24, padding: 28, alignItems: 'center', gap: 12,
    borderWidth: 1.5, borderColor: '#1DD1A155',
  },
  speakCardInstr:   { fontSize: 14, color: '#636e72' },
  speakCardChinese: { fontSize: 48, fontWeight: '900', color: '#fff' },
  speakCardSyllable:{ fontSize: 32, fontWeight: '800', color: '#1DD1A1', letterSpacing: 2 },
  speakCardMeaning: { fontSize: 15, color: '#b2bec3', fontStyle: 'italic' },
  playBtn: {
    marginTop: 8, backgroundColor: 'rgba(29,209,161,0.15)', borderRadius: 14,
    paddingHorizontal: 24, paddingVertical: 14, borderWidth: 1.5, borderColor: '#1DD1A1',
  },
  playBtnText: { fontSize: 16, fontWeight: '700', color: '#1DD1A1' },
  gotItBtn: {
    width: '100%', backgroundColor: '#1DD1A1', borderRadius: 16,
    paddingVertical: 16, alignItems: 'center', marginTop: 4,
  },
  gotItText: { fontSize: 16, fontWeight: '800', color: '#fff' },

  // Done
  doneContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  doneEmoji:     { fontSize: 64, marginBottom: 12 },
  doneTitle:     { fontSize: 26, fontWeight: '900', color: '#fff', textAlign: 'center' },
  doneScore:     { fontSize: 18, color: '#1DD1A1', fontWeight: '700', marginTop: 8, marginBottom: 32 },
  doneBtn: {
    backgroundColor: '#54A0FF', borderRadius: 16,
    paddingHorizontal: 32, paddingVertical: 16, marginTop: 24,
  },
  doneBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
