import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { speakChinese } from '../utils/tts';
import { buildPinyinExercises } from '../utils/stageGenerator';
import PinyinExercise from '../components/exercises/PinyinExercise';

const TONE_NUM = {
  'ā':1,'á':2,'ǎ':3,'à':4,
  'ē':1,'é':2,'ě':3,'è':4,
  'ī':1,'í':2,'ǐ':3,'ì':4,
  'ō':1,'ó':2,'ǒ':3,'ò':4,
  'ū':1,'ú':2,'ǔ':3,'ù':4,
  'ǖ':1,'ǘ':2,'ǚ':3,'ǜ':4,
};
const TONE_STRIP = {
  'ā':'a','á':'a','ǎ':'a','à':'a',
  'ē':'e','é':'e','ě':'e','è':'e',
  'ī':'i','í':'i','ǐ':'i','ì':'i',
  'ō':'o','ó':'o','ǒ':'o','ò':'o',
  'ū':'u','ú':'u','ǔ':'u','ù':'u',
  'ǖ':'u','ǘ':'u','ǚ':'u','ǜ':'u',
};

function detectTone(syllable) {
  for (const ch of syllable) { if (TONE_NUM[ch]) return TONE_NUM[ch]; }
  return 0;
}
function stripTones(s) {
  return [...s].map(c => TONE_STRIP[c] ?? c).join('');
}

const TONE_COLORS = ['#FF6B6B', '#FF9F43', '#1DD1A1', '#54A0FF'];
const TONE_NAMES  = ['', '1st Tone ā', '2nd Tone á', '3rd Tone ǎ', '4th Tone à'];

export default function LessonPinyinScreen({ lessonData, onBack, onOpenFoundations }) {
  const pf    = lessonData?.pinyin_focus || {};
  const vocab = lessonData?.vocabulary   || [];

  // Build stripped-pinyin → Chinese character lookup
  const pinyinToChar = useMemo(() => {
    const map = {};
    for (const item of vocab) {
      if (item.pinyin && item.chinese) {
        const key = stripTones(item.pinyin.replace(/\s+/g, ''));
        map[key] = item.chinese;
      }
    }
    return map;
  }, [vocab]);

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
      <SafeAreaView style={styles.safe}>
        <View style={styles.doneContainer}>
          <Text style={styles.doneEmoji}>{pct >= 80 ? '🎵' : '🎶'}</Text>
          <Text style={styles.doneTitle}>Pinyin Practice Done!</Text>
          <Text style={styles.doneScore}>{score}/{exercises.length} correct · {pct}%</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={resetPractice}>
            <Text style={styles.primaryBtnText}>← Back to Pinyin Lesson</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Exercise mode ────────────────────────────────────────────────────────
  if (mode === 'practice') {
    const exercise = exercises[currentIndex];
    const progress = exercises.length > 0 ? (currentIndex / exercises.length) * 100 : 0;
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" />
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
    );
  }

  // ── Learn mode ───────────────────────────────────────────────────────────
  const tonePractice = pf.tone_practice || [];
  const initials     = pf.initials_focus || pf.initials_review || [];
  const finals       = pf.finals_focus   || pf.finals_review   || [];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

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
                const toneNum  = detectTone(syl);
                const color    = TONE_COLORS[(toneNum - 1) % 4] || '#54A0FF';
                const stripped = stripTones(syl.replace(/\s+/g, ''));
                const charToPlay = pinyinToChar[stripped] || syl;
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.toneCard, { borderColor: color, backgroundColor: color + '18' }]}
                    onPress={() => speakChinese(charToPlay)}
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
                <TouchableOpacity key={i} style={styles.chip} onPress={() => speakChinese(init)} activeOpacity={0.75}>
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
                <TouchableOpacity key={i} style={[styles.chip, styles.chipFinal]} onPress={() => speakChinese(fin)} activeOpacity={0.75}>
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
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a1a2e' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backBtn:     { paddingVertical: 8, paddingRight: 12 },
  backBtnText: { fontSize: 16, fontWeight: '600', color: '#a29bfe' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },

  content: { padding: 20 },

  // Topic card
  topicCard: {
    backgroundColor: '#16213e', borderRadius: 20, padding: 24, alignItems: 'center',
    marginBottom: 16, borderWidth: 1, borderColor: '#54A0FF55',
  },
  topicEmoji: { fontSize: 40, marginBottom: 8 },
  topicTitle: { fontSize: 20, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 4 },
  topicMeta:  { fontSize: 13, color: '#636e72' },

  // Foundations banner
  foundationsBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(84,160,255,0.1)', borderRadius: 16,
    padding: 16, marginBottom: 28, borderWidth: 1.5, borderColor: '#54A0FF55',
  },
  foundationsBannerEmoji: { fontSize: 24 },
  foundationsBannerTitle: { fontSize: 14, fontWeight: '700', color: '#54A0FF', marginBottom: 2 },
  foundationsBannerSub:   { fontSize: 12, color: '#636e72' },
  foundationsBannerArrow: { fontSize: 18, color: '#54A0FF', fontWeight: '700' },

  // Section headers
  sectionRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle:{ fontSize: 16, fontWeight: '800', color: '#fff' },
  sectionHint: { fontSize: 12, color: '#636e72' },

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
  chip:         { backgroundColor: '#16213e', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5, borderColor: '#a29bfe55' },
  chipFinal:    { borderColor: '#1DD1A155' },
  chipText:     { fontSize: 16, fontWeight: '700', color: '#a29bfe' },
  chipFinalText:{ color: '#1DD1A1' },

  // Practice button
  practiceBtn:    { backgroundColor: '#54A0FF', borderRadius: 18, padding: 20, alignItems: 'center', marginTop: 8 },
  practiceBtnText:{ fontSize: 17, fontWeight: '800', color: '#fff' },
  practiceBtnSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },

  // Exercise mode header
  exHeader:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  exitBtn:     { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  exitText:    { fontSize: 18, color: '#636e72', fontWeight: '700' },
  progressBg:  { flex: 1, height: 8, backgroundColor: '#2d3436', borderRadius: 4, overflow: 'hidden' },
  progressFill:{ height: '100%', backgroundColor: '#54A0FF', borderRadius: 4 },
  counter:     { fontSize: 13, color: '#636e72', fontWeight: '600', minWidth: 36, textAlign: 'right' },

  // Done screen
  doneContainer:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  doneEmoji:      { fontSize: 64, marginBottom: 16 },
  doneTitle:      { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 8 },
  doneScore:      { fontSize: 18, color: '#1DD1A1', fontWeight: '700', marginBottom: 32 },
  primaryBtn:     { backgroundColor: '#54A0FF', borderRadius: 16, paddingHorizontal: 32, paddingVertical: 16 },
  primaryBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
