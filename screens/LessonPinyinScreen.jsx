import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { speakPinyin } from '../utils/tts';
import { buildPinyinExercises } from '../utils/stageGenerator';
import PinyinExercise from '../components/exercises/PinyinExercise';
import ScreenBackground from '../components/ScreenBackground';
import { DEEP_NAVY, WARM_ORANGE, SLATE_TEAL, WARM_BROWN, CARD_WHITE } from '../constants/colors';

const TONE_NUM = {
  'ā':1,'á':2,'ǎ':3,'à':4,
  'ē':1,'é':2,'ě':3,'è':4,
  'ī':1,'í':2,'ǐ':3,'ì':4,
  'ō':1,'ó':2,'ǒ':3,'ò':4,
  'ū':1,'ú':2,'ǔ':3,'ù':4,
  'ǖ':1,'ǘ':2,'ǚ':3,'ǜ':4,
};

function detectTone(syllable) {
  for (const ch of syllable) { if (TONE_NUM[ch]) return TONE_NUM[ch]; }
  return 0;
}

const TONE_COLORS = ['#FF6B6B', '#FF9F43', '#1DD1A1', '#54A0FF'];
const TONE_NAMES  = ['', '1st Tone ā', '2nd Tone á', '3rd Tone ǎ', '4th Tone à'];

export default function LessonPinyinScreen({ lessonData, onBack, onOpenFoundations }) {
  const pf = lessonData?.pinyin_focus || {};

  const exercises = useMemo(
    () => buildPinyinExercises(lessonData).slice(0, 10),
    [lessonData],
  );

  const [mode,         setMode]         = useState('learn'); // 'learn' | 'practice'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score,        setScore]        = useState(0);
  const [done,         setDone]         = useState(false);

  const resetPractice = () => { setMode('learn'); setCurrentIndex(0); setScore(0); setDone(false); };

  const advance = (wasCorrect) => {
    if (wasCorrect) setScore(s => s + 1);
    const next = currentIndex + 1;
    if (next >= exercises.length) setDone(true);
    else setCurrentIndex(next);
  };

  // ── Done screen ──────────────────────────────────────────────────────────
  if (mode === 'practice' && done) {
    const pct = exercises.length > 0 ? Math.round((score / exercises.length) * 100) : 0;
    return (
      <ScreenBackground levelId="pinyin">
        <SafeAreaView style={styles.safe}>
          <View style={styles.doneContainer}>
            <Text style={styles.doneEmoji}>{pct >= 80 ? '🎵' : '🎶'}</Text>
            <View style={styles.doneCard}>
              <Text style={styles.doneTitle}>Pinyin Practice Done!</Text>
              <Text style={styles.doneScore}>{score}/{exercises.length} correct · {pct}%</Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={resetPractice}>
                <Text style={styles.primaryBtnText}>← Back to Pinyin Lesson</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  // ── Exercise mode ────────────────────────────────────────────────────────
  if (mode === 'practice') {
    const exercise = exercises[currentIndex];
    const progress = exercises.length > 0 ? (currentIndex / exercises.length) * 100 : 0;
    return (
      <ScreenBackground levelId="pinyin">
        <SafeAreaView style={styles.safe}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.exHeader}>
            <TouchableOpacity onPress={resetPractice} style={styles.exitBtn}>
              <Text style={styles.exitText}>✕</Text>
            </TouchableOpacity>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.counter}>{currentIndex + 1}/{exercises.length}</Text>
          </View>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16, flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {exercise && (
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

  // ── Learn mode ───────────────────────────────────────────────────────────
  const tonePractice = pf.tone_practice || [];
  const initials     = pf.initials_focus || pf.initials_review || [];
  const finals       = pf.finals_focus   || pf.finals_review   || [];

  return (
    <ScreenBackground levelId="pinyin">
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pinyin Focus</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Topic card */}
          <View style={styles.topicCard}>
            <Text style={styles.topicEmoji}>🎵</Text>
            <Text style={styles.topicTitle}>{pf.topic || 'Pinyin Practice'}</Text>
            <Text style={styles.topicMeta}>Lesson {lessonData?.lesson} · {lessonData?.topic}</Text>
          </View>

          {/* Foundations link */}
          <TouchableOpacity style={styles.foundationsBanner} onPress={onOpenFoundations} activeOpacity={0.8}>
            <Text style={styles.foundationsBannerEmoji}>🔊</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.foundationsBannerTitle}>Chinese Foundations · Pinyin</Text>
              <Text style={styles.foundationsBannerSub}>Explore tones, initials & finals →</Text>
            </View>
            <Text style={styles.foundationsBannerArrow}>→</Text>
          </TouchableOpacity>

          {/* Tone Practice */}
          {tonePractice.length > 0 && (
            <>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>🎵 Tone Practice</Text>
                <Text style={styles.sectionHint}>Tap to hear</Text>
              </View>
              <View style={styles.tonesGrid}>
                {tonePractice.map((syl, i) => {
                  const toneNum = detectTone(syl);
                  const color   = TONE_COLORS[(toneNum - 1) % 4] || SLATE_TEAL;
                  return (
                    <TouchableOpacity
                      key={i}
                      style={[styles.toneCard, { borderColor: color, backgroundColor: CARD_WHITE }]}
                      onPress={() => speakPinyin(syl)}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.toneCardIcon}>🔊</Text>
                      <Text style={[styles.toneCardSyl, { color }]}>{syl}</Text>
                      {toneNum > 0 && <Text style={[styles.toneCardName, { color }]}>{TONE_NAMES[toneNum]}</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {/* Initials */}
          {initials.length > 0 && (
            <>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>🔤 Initials (声母)</Text>
                <Text style={styles.sectionHint}>Tap to hear</Text>
              </View>
              <View style={styles.chipsRow}>
                {initials.map((init, i) => (
                  <TouchableOpacity key={i} style={styles.chip} onPress={() => speakPinyin(init)} activeOpacity={0.75}>
                    <Text style={styles.chipText}>{init}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Finals */}
          {finals.length > 0 && (
            <>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>🔤 Finals (韵母)</Text>
                <Text style={styles.sectionHint}>Tap to hear</Text>
              </View>
              <View style={styles.chipsRow}>
                {finals.map((fin, i) => (
                  <TouchableOpacity key={i} style={[styles.chip, styles.chipFinal]} onPress={() => speakPinyin(fin)} activeOpacity={0.75}>
                    <Text style={[styles.chipText, styles.chipFinalText]}>{fin}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Practice button */}
          {exercises.length > 0 && (
            <TouchableOpacity style={styles.practiceBtn} onPress={() => setMode('practice')} activeOpacity={0.85}>
              <Text style={styles.practiceBtnText}>🎯 Start Pinyin Practice</Text>
              <Text style={styles.practiceBtnSub}>{exercises.length} exercises</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: CARD_WHITE,
    borderBottomWidth: 1, borderBottomColor: 'rgba(155,104,70,0.15)',
  },
  backBtn:     { paddingVertical: 8, paddingRight: 12 },
  backBtnText: { fontSize: 16, fontWeight: '600', color: WARM_BROWN },
  headerTitle: { fontSize: 16, fontWeight: '700', color: DEEP_NAVY },

  content: { padding: 20 },

  // Topic card
  topicCard: {
    backgroundColor: CARD_WHITE, borderRadius: 20, padding: 24, alignItems: 'center',
    marginBottom: 16, borderWidth: 1, borderColor: 'rgba(155,104,70,0.20)',
  },
  topicEmoji: { fontSize: 40, marginBottom: 8 },
  topicTitle: { fontSize: 20, fontWeight: '800', color: DEEP_NAVY, textAlign: 'center', marginBottom: 4 },
  topicMeta:  { fontSize: 13, color: SLATE_TEAL },

  // Foundations banner
  foundationsBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: CARD_WHITE, borderRadius: 16,
    padding: 16, marginBottom: 28, borderWidth: 1.5, borderColor: 'rgba(155,104,70,0.25)',
  },
  foundationsBannerEmoji: { fontSize: 24 },
  foundationsBannerTitle: { fontSize: 14, fontWeight: '700', color: SLATE_TEAL, marginBottom: 2 },
  foundationsBannerSub:   { fontSize: 12, color: SLATE_TEAL },
  foundationsBannerArrow: { fontSize: 18, color: WARM_BROWN, fontWeight: '700' },

  // Section headers
  sectionRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, backgroundColor: CARD_WHITE, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  sectionTitle:{ fontSize: 16, fontWeight: '800', color: DEEP_NAVY },
  sectionHint: { fontSize: 12, color: SLATE_TEAL },

  // Tone cards
  tonesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  toneCard:  {
    width: '47%', borderRadius: 16, padding: 16, alignItems: 'center',
    borderWidth: 2, gap: 4,
  },
  toneCardIcon: { fontSize: 16 },
  toneCardSyl:  { fontSize: 32, fontWeight: '900', letterSpacing: 2 },
  toneCardName: { fontSize: 11, fontWeight: '700' },

  // Chips
  chipsRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 28 },
  chip:         { backgroundColor: CARD_WHITE, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5, borderColor: 'rgba(155,104,70,0.30)' },
  chipFinal:    { borderColor: 'rgba(55,73,80,0.30)' },
  chipText:     { fontSize: 16, fontWeight: '700', color: WARM_BROWN },
  chipFinalText:{ color: SLATE_TEAL },

  // Practice button
  practiceBtn:    { backgroundColor: SLATE_TEAL, borderRadius: 18, padding: 20, alignItems: 'center', marginTop: 8 },
  practiceBtnText:{ fontSize: 17, fontWeight: '800', color: CARD_WHITE },
  practiceBtnSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },

  // Exercise mode header
  exHeader:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12, backgroundColor: CARD_WHITE, borderBottomWidth: 1, borderBottomColor: 'rgba(155,104,70,0.15)' },
  exitBtn:     { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  exitText:    { fontSize: 18, color: SLATE_TEAL, fontWeight: '700' },
  progressBg:  { flex: 1, height: 8, backgroundColor: 'rgba(55,73,80,0.22)', borderRadius: 4, overflow: 'hidden' },
  progressFill:{ height: '100%', backgroundColor: SLATE_TEAL, borderRadius: 4 },
  counter:     { fontSize: 13, color: SLATE_TEAL, fontWeight: '600', minWidth: 36, textAlign: 'right' },

  // Done screen
  doneContainer:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  doneEmoji:      { fontSize: 64, marginBottom: 16 },
  doneCard: {
    backgroundColor: CARD_WHITE, borderRadius: 24, padding: 28,
    alignItems: 'center', width: '100%', gap: 10,
    borderWidth: 1, borderColor: 'rgba(155,104,70,0.20)',
  },
  doneTitle:      { fontSize: 28, fontWeight: '900', color: DEEP_NAVY },
  doneScore:      { fontSize: 18, color: '#1DD1A1', fontWeight: '700' },
  primaryBtn:     { backgroundColor: SLATE_TEAL, borderRadius: 16, paddingHorizontal: 32, paddingVertical: 16, marginTop: 8, width: '100%', alignItems: 'center' },
  primaryBtnText: { fontSize: 16, fontWeight: '800', color: CARD_WHITE },
});
