import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { speakPinyin } from '../utils/tts';

// ── Data ──────────────────────────────────────────────────────────────────────

const TONE_COLORS = ['#FF6B6B', '#FF9F43', '#1DD1A1', '#54A0FF'];

const TONES = [
  { num: 1, mark: 'ā', name: 'First Tone',  desc: 'High and level — hold it steady and flat',    color: '#FF6B6B', example: '妈', pinyin: 'mā', meaning: 'mother' },
  { num: 2, mark: 'á', name: 'Second Tone', desc: 'Rising — like asking "really?"',               color: '#FF9F43', example: '麻', pinyin: 'má', meaning: 'hemp/numb' },
  { num: 3, mark: 'ǎ', name: 'Third Tone',  desc: 'Dipping — goes down then back up',            color: '#1DD1A1', example: '马', pinyin: 'mǎ', meaning: 'horse' },
  { num: 4, mark: 'à', name: 'Fourth Tone', desc: 'Falling — sharp and decisive, goes down fast', color: '#54A0FF', example: '骂', pinyin: 'mà', meaning: 'to scold' },
];

// All 6 vowels × 4 tones — pure vowels only, no initial consonant.
// Audio files: a1.mp3 a2.mp3 … o1.mp3 … u1.mp3 … in assets/audio/pinyin/vowel_tones/
// ü uses audioKeys 'nv1'–'nv4' (recorded as nü) to avoid conflict with u1–u4.
const TONE_VOWELS = [
  { vowel: 'a', marks: ['ā','á','ǎ','à'] },
  { vowel: 'o', marks: ['ō','ó','ǒ','ò'] },
  { vowel: 'e', marks: ['ē','é','ě','è'] },
  { vowel: 'i', marks: ['ī','í','ǐ','ì'] },
  { vowel: 'u', marks: ['ū','ú','ǔ','ù'] },
  { vowel: 'ü', marks: ['ǖ','ǘ','ǚ','ǜ'], audioKeys: ['v1','v2','v3','v4'] },
];

const INITIALS = [
  { group: 'Labials',      items: ['b','p','m','f'] },
  { group: 'Dentals',      items: ['d','t','n','l'] },
  { group: 'Velars',       items: ['g','k','h'] },
  { group: 'Palatals',     items: ['j','q','x'] },
  { group: 'Retroflexes',  items: ['zh','ch','sh','r'] },
  { group: 'Sibilants',    items: ['z','c','s'] },
  { group: 'Semi-vowels',  items: ['y','w'] },
];

const FINALS = [
  { group: 'Simple Vowels', items: ['a','o','e','i','u','ü'] },
  { group: 'Compound',      items: ['ai','ei','ui','ao','ou','iu','ie','üe','er'] },
  { group: 'Nasal (n)',     items: ['an','en','in','un','ün'] },
  { group: 'Nasal (ng)',    items: ['ang','eng','ing','ong'] },
  { group: 'Medial i-',     items: ['ia','iao','ian','iang'] },
  { group: 'Medial u-',     items: ['ua','uai','uo','uan','uang'] },
  { group: 'Medial ü-',     items: ['üan','üe','ün'] },
];


// ── Collapsible section header ────────────────────────────────────────────────
function SectionHeader({ emoji, title, sub, open, onToggle, alwaysOpen = false }) {
  return (
    <TouchableOpacity
      style={styles.sectionHeader}
      onPress={alwaysOpen ? undefined : onToggle}
      activeOpacity={alwaysOpen ? 1 : 0.7}
    >
      <View style={styles.sectionHeaderLeft}>
        <Text style={styles.sectionTitle}>{emoji} {title}</Text>
        {sub ? <Text style={styles.sectionSub}>{sub}</Text> : null}
      </View>
      {!alwaysOpen && (
        <Text style={styles.sectionChevron}>{open ? '▲' : '▼'}</Text>
      )}
    </TouchableOpacity>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function FoundationsPinyinScreen({ onBack, lessonContext = null, onOpenPinyinSystem }) {

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pinyin System</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Intro card */}
        <View style={styles.introCard}>
          <Text style={styles.introEmoji}>🔊</Text>
          <Text style={styles.introTitle}>Master Chinese Sounds</Text>
          <Text style={styles.introDesc}>
            Pinyin is the phonetic writing system for Mandarin Chinese. It uses Latin letters with tone marks to represent pronunciation. Master it and you can read any Chinese word!
          </Text>
        </View>

        {/* Pinyin Learning System CTA */}
        {onOpenPinyinSystem && (
          <TouchableOpacity style={styles.systemBtn} onPress={onOpenPinyinSystem} activeOpacity={0.85}>
            <Text style={styles.systemBtnEmoji}>🎓</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.systemBtnTitle}>Pinyin Learning System</Text>
              <Text style={styles.systemBtnSub}>10 structured lessons · Quizzes · Progress tracking</Text>
            </View>
            <Text style={styles.systemBtnArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* Lesson context back-link */}
        {lessonContext && (
          <TouchableOpacity style={styles.contextBanner} onPress={onBack} activeOpacity={0.8}>
            <Text style={styles.contextBannerEmoji}>📖</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.contextBannerTitle}>Back to Lesson {lessonContext.lesson} Pinyin</Text>
              <Text style={styles.contextBannerSub}>{lessonContext.topic}</Text>
            </View>
            <Text style={styles.contextBannerArrow}>←</Text>
          </TouchableOpacity>
        )}

        {/* ══ SECTION 1 · INITIALS (always open) ════════════════════════════ */}
        <SectionHeader emoji="🔤" title="Initials (声母)" alwaysOpen />
        <View style={[styles.sectionBody, { paddingTop: 0 }]}>
          <Text style={styles.bodyNote}>
            Consonants that start a syllable. Not every syllable needs one. Tap to hear.
          </Text>
          {INITIALS.map(({ group, items }) => (
            <View key={group} style={styles.initialGroup}>
              <Text style={styles.groupLabel}>{group}</Text>
              <View style={styles.chipsRow}>
                {items.map((init, i) => (
                  <TouchableOpacity
                    key={i} style={styles.chipInitial}
                    onPress={() => speakPinyin(init)} activeOpacity={0.75}
                  >
                    <Text style={styles.chipInitialText}>{init}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* ══ SECTION 3 · FINALS (always open) ══════════════════════════════ */}
        <SectionHeader emoji="🎶" title="Finals (韵母)" alwaysOpen />
        <View style={[styles.sectionBody, { paddingTop: 0 }]}>
          <Text style={styles.bodyNote}>
            Vowel endings that complete a syllable. Every syllable must have one. Tap to hear.
          </Text>
          {FINALS.map(({ group, items }) => (
            <View key={group} style={styles.finalGroup}>
              <Text style={styles.groupLabel}>{group}</Text>
              <View style={styles.chipsRow}>
                {items.map((fin, i) => (
                  <TouchableOpacity
                    key={i} style={styles.chipFinal}
                    onPress={() => speakPinyin(fin)} activeOpacity={0.75}
                  >
                    <Text style={styles.chipFinalText}>{fin}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* ══ SECTION 3 · TONES (always open) ════════════════════════════════ */}
        <SectionHeader emoji="🎵" title="The Four Tones" alwaysOpen />
        <View style={styles.sectionBody}>

          <Text style={styles.bodyNote}>
            Every syllable in Mandarin has a tone. The same syllable with a different tone means a completely different word!
          </Text>

          {/* 4 tone description cards */}
          {TONES.map((tone) => (
            <TouchableOpacity
              key={tone.num}
              style={[styles.toneCard, { borderColor: tone.color + '88', backgroundColor: tone.color + '12' }]}
              onPress={() => speakPinyin(tone.pinyin)}
              activeOpacity={0.75}
            >
              <View style={[styles.toneBadge, { backgroundColor: tone.color }]}>
                <Text style={styles.toneBadgeNum}>{tone.num}</Text>
              </View>
              <View style={styles.toneCardBody}>
                <View style={styles.toneCardTop}>
                  <Text style={[styles.toneMark, { color: tone.color }]}>{tone.mark}</Text>
                  <Text style={styles.toneName}>{tone.name}</Text>
                </View>
                <Text style={styles.toneDesc}>{tone.desc}</Text>
                <View style={styles.toneExampleRow}>
                  <Text style={styles.toneChar}>{tone.example}</Text>
                  <Text style={styles.tonePinyin}>{tone.pinyin}</Text>
                  <Text style={styles.toneMeaning}>"{tone.meaning}"</Text>
                </View>
              </View>
              <Text style={[styles.audioIcon, { color: tone.color }]}>🔊</Text>
            </TouchableOpacity>
          ))}

          {/* Tone mark grid — all vowels */}
          <Text style={styles.gridLabel}>TONE MARKS ON EACH VOWEL — tap to hear</Text>
          <View style={styles.toneGrid}>
            {/* Column headers */}
            <View style={styles.toneGridRow}>
              <Text style={[styles.toneGridCell, styles.toneGridHeader, styles.toneGridVowelCol]} />
              {TONE_COLORS.map((c, i) => (
                <Text key={i} style={[styles.toneGridCell, styles.toneGridHeader, { color: c }]}>
                  T{i + 1}
                </Text>
              ))}
            </View>
            {/* Rows per vowel */}
            {TONE_VOWELS.map(({ vowel, marks, audioKeys }) => (
              <View key={vowel} style={styles.toneGridRow}>
                <Text style={[styles.toneGridCell, styles.toneGridVowelCol, styles.toneGridVowelLabel]}>
                  {vowel}
                </Text>
                {marks.map((mark, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.toneGridCellBtn}
                    onPress={() => speakPinyin(audioKeys?.[i] ?? mark)}
                    activeOpacity={0.65}
                  >
                    <Text style={[styles.toneGridMark, { color: TONE_COLORS[i] }]}>{mark}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          {/* Tone rules tip */}
          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>💡 Tone Rules</Text>
            <Text style={styles.tipText}>• Tone 3 + Tone 3 → first becomes Tone 2  (e.g. 你好 nǐhǎo → níhǎo)</Text>
            <Text style={styles.tipText}>• 不 bù becomes bú before any Tone 4 word</Text>
            <Text style={styles.tipText}>• 一 yī changes tone based on what follows it</Text>
            <Text style={styles.tipText}>• Neutral tone (no mark) is short and light — e.g. 妈妈 māma</Text>
          </View>
        </View>

        {/* Practice reminder */}
        <View style={styles.practiceReminder}>
          <Text style={styles.practiceReminderTitle}>🎯 Practice in Your Lessons</Text>
          <Text style={styles.practiceReminderText}>
            Each lesson has a Pinyin Focus section with exercises tailored to the sounds you're learning. Go back to your lesson to practice!
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
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

  // Intro card
  introCard: {
    backgroundColor: '#16213e', borderRadius: 20, padding: 24, alignItems: 'center',
    marginBottom: 24, borderWidth: 1, borderColor: '#54A0FF44',
  },
  introEmoji: { fontSize: 40, marginBottom: 8 },
  introTitle: { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 8, textAlign: 'center' },
  introDesc:  { fontSize: 14, color: '#b2bec3', lineHeight: 21, textAlign: 'center' },

  // Context banner
  contextBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(162,155,254,0.1)', borderRadius: 16,
    padding: 14, marginBottom: 24, borderWidth: 1.5, borderColor: '#a29bfe55',
  },
  contextBannerEmoji: { fontSize: 20 },
  contextBannerTitle: { fontSize: 14, fontWeight: '700', color: '#a29bfe', marginBottom: 2 },
  contextBannerSub:   { fontSize: 12, color: '#636e72' },
  contextBannerArrow: { fontSize: 16, color: '#a29bfe', fontWeight: '700' },

  // Section header (collapsible row)
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 16, marginTop: 8,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  sectionHeaderLeft: { flex: 1, gap: 2 },
  sectionTitle:   { fontSize: 17, fontWeight: '800', color: '#fff' },
  sectionSub:     { fontSize: 11, color: '#636e72' },
  sectionChevron: { fontSize: 12, color: '#636e72', marginLeft: 8 },

  // Section body (expanded content)
  sectionBody: { paddingTop: 16, paddingBottom: 8 },
  bodyNote:    { fontSize: 13, color: '#636e72', lineHeight: 19, marginBottom: 16 },

  // ── Tone section ─────────────────────────────────────────────────────────
  toneCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 18,
    padding: 16, marginBottom: 10, borderWidth: 1.5, gap: 12,
  },
  toneBadge:     { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  toneBadgeNum:  { fontSize: 18, fontWeight: '900', color: '#fff' },
  toneCardBody:  { flex: 1 },
  toneCardTop:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  toneMark:      { fontSize: 24, fontWeight: '900' },
  toneName:      { fontSize: 15, fontWeight: '700', color: '#fff' },
  toneDesc:      { fontSize: 12, color: '#b2bec3', marginBottom: 6 },
  toneExampleRow:{ flexDirection: 'row', alignItems: 'center', gap: 8 },
  toneChar:      { fontSize: 20, fontWeight: '900', color: '#fff' },
  tonePinyin:    { fontSize: 13, color: '#636e72' },
  toneMeaning:   { fontSize: 12, color: '#636e72', fontStyle: 'italic' },
  audioIcon:     { fontSize: 22 },

  // Tone mark grid
  gridLabel: {
    fontSize: 10, fontWeight: '800', color: '#636e72',
    letterSpacing: 1.2, marginTop: 20, marginBottom: 10,
  },
  toneGrid:        { backgroundColor: '#16213e', borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  toneGridRow:     { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  toneGridCell:    { flex: 1, paddingVertical: 10, textAlign: 'center', fontSize: 14, fontWeight: '700', color: '#636e72' },
  toneGridCellBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  toneGridHeader:  { fontSize: 11, paddingVertical: 8 },
  toneGridVowelCol:{ flex: 0.7 },
  toneGridVowelLabel:{ fontSize: 15, fontWeight: '900', color: '#b2bec3' },
  toneGridMark:    { fontSize: 20, fontWeight: '900' },

  // Tip box
  tipBox: {
    backgroundColor: 'rgba(162,155,254,0.08)', borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: '#a29bfe33', gap: 6,
  },
  tipTitle: { fontSize: 13, fontWeight: '800', color: '#a29bfe', marginBottom: 4 },
  tipText:  { fontSize: 12, color: '#b2bec3', lineHeight: 19 },

  // ── Initials & Finals ────────────────────────────────────────────────────
  initialGroup: { marginBottom: 14 },
  finalGroup:   { marginBottom: 14 },
  groupLabel: {
    fontSize: 10, fontWeight: '800', color: '#636e72',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
  },
  chipsRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipInitial:     { backgroundColor: '#16213e', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5, borderColor: '#a29bfe55' },
  chipInitialText: { fontSize: 15, fontWeight: '700', color: '#a29bfe' },
  chipFinal:       { backgroundColor: '#16213e', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5, borderColor: '#1DD1A155' },
  chipFinalText:   { fontSize: 15, fontWeight: '700', color: '#1DD1A1' },

  // ── Spelling section ─────────────────────────────────────────────────────
  // ── CTA buttons ──────────────────────────────────────────────────────────
  systemBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,215,0,0.08)', borderRadius: 18,
    padding: 18, marginTop: 28, marginBottom: 16,
    borderWidth: 2, borderColor: '#FFD70066',
  },
  systemBtnEmoji: { fontSize: 32 },
  systemBtnTitle: { fontSize: 15, fontWeight: '800', color: '#FFD700', marginBottom: 2 },
  systemBtnSub:   { fontSize: 12, color: '#636e72' },
  systemBtnArrow: { fontSize: 18, color: '#FFD700', fontWeight: '700' },

  practiceReminder: {
    backgroundColor: 'rgba(84,160,255,0.1)', borderRadius: 16,
    padding: 18, marginTop: 8, borderWidth: 1, borderColor: '#54A0FF44',
  },
  practiceReminderTitle: { fontSize: 14, fontWeight: '800', color: '#54A0FF', marginBottom: 8 },
  practiceReminderText:  { fontSize: 13, color: '#b2bec3', lineHeight: 20 },
});
