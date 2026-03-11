import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { speakChinese, speakPinyin } from '../utils/tts';

const TONES = [
  { num: 1, mark: 'ā', name: 'First Tone',  desc: 'High and level — hold it steady and flat',   color: '#FF6B6B', example: '妈', pinyin: 'mā', meaning: 'mother' },
  { num: 2, mark: 'á', name: 'Second Tone', desc: 'Rising — like asking "really?"',              color: '#FF9F43', example: '麻', pinyin: 'má', meaning: 'hemp/numb' },
  { num: 3, mark: 'ǎ', name: 'Third Tone',  desc: 'Dipping — goes down then back up',           color: '#1DD1A1', example: '马', pinyin: 'mǎ', meaning: 'horse' },
  { num: 4, mark: 'à', name: 'Fourth Tone', desc: 'Falling — sharp and decisive, goes down fast',color: '#54A0FF', example: '骂', pinyin: 'mà', meaning: 'to scold' },
];

const INITIALS = [
  'b','p','m','f',
  'd','t','n','l',
  'g','k','h',
  'j','q','x',
  'zh','ch','sh','r',
  'z','c','s',
  'y','w',
];

const FINALS = [
  { group: 'Simple Vowels',  items: ['a','o','e','i','u','ü'] },
  { group: 'Compound',       items: ['ai','ei','ui','ao','ou','iu','ie','üe','er'] },
  { group: 'Nasal (n)',      items: ['an','en','in','un','ün'] },
  { group: 'Nasal (ng)',     items: ['ang','eng','ing','ong'] },
];


export default function FoundationsPinyinScreen({ onBack, lessonContext = null }) {
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

        {/* Lesson context link (shown when arrived from a lesson) */}
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

        {/* ── Four Tones ────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🎵 The Four Tones</Text>
          <Text style={styles.sectionSub}>Tap to hear</Text>
        </View>
        <View style={styles.tonesIntro}>
          <Text style={styles.tonesIntroText}>
            Every syllable in Mandarin has a tone. The same syllable with a different tone means a completely different word!
          </Text>
        </View>

        {TONES.map((tone) => (
          <TouchableOpacity
            key={tone.num}
            style={[styles.toneCard, { borderColor: tone.color + '88', backgroundColor: tone.color + '12' }]}
            onPress={() => speakChinese(tone.example)}
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
              <View style={styles.toneExample}>
                <Text style={styles.toneChar}>{tone.example}</Text>
                <Text style={styles.tonePinyin}>{tone.pinyin}</Text>
                <Text style={styles.toneMeaning}>"{tone.meaning}"</Text>
              </View>
            </View>
            <Text style={[styles.audioIcon, { color: tone.color }]}>🔊</Text>
          </TouchableOpacity>
        ))}

        {/* Tone tips */}
        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>💡 Tone Rules</Text>
          <Text style={styles.tipText}>• Tone 3 + Tone 3 → first becomes Tone 2  (e.g. 你好 nǐhǎo → níhǎo)</Text>
          <Text style={styles.tipText}>• 不 bù becomes bú before any Tone 4 word</Text>
          <Text style={styles.tipText}>• 一 yī changes tone based on what follows it</Text>
          <Text style={styles.tipText}>• Neutral tone (no mark) is short and light</Text>
        </View>

        {/* ── Initials ─────────────────────────────────────────── */}
        <View style={[styles.sectionHeader, { marginTop: 28 }]}>
          <Text style={styles.sectionTitle}>🔤 Initials (声母)</Text>
          <Text style={styles.sectionSub}>Tap to hear</Text>
        </View>
        <Text style={styles.tableNote}>Consonants that start a syllable. Not every syllable has one.</Text>
        <View style={styles.chipsWrap}>
          {INITIALS.map((init, i) => (
            <TouchableOpacity
              key={i}
              style={styles.chipInitial}
              onPress={() => speakPinyin(init)}
              activeOpacity={0.75}
            >
              <Text style={styles.chipInitialText}>{init}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Finals ───────────────────────────────────────────── */}
        <View style={[styles.sectionHeader, { marginTop: 28 }]}>
          <Text style={styles.sectionTitle}>🔤 Finals (韵母)</Text>
          <Text style={styles.sectionSub}>Tap to hear</Text>
        </View>
        <Text style={styles.tableNote}>Vowel endings that complete a syllable. Every syllable must have one.</Text>

        {FINALS.map((group) => (
          <View key={group.group} style={styles.finalGroup}>
            <Text style={styles.finalGroupLabel}>{group.group}</Text>
            <View style={styles.chipsWrap}>
              {group.items.map((fin, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.chipFinal}
                  onPress={() => speakPinyin(fin)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.chipFinalText}>{fin}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

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

  // Intro
  introCard: {
    backgroundColor: '#16213e', borderRadius: 20, padding: 24, alignItems: 'center',
    marginBottom: 24, borderWidth: 1, borderColor: '#54A0FF44',
  },
  introEmoji: { fontSize: 40, marginBottom: 8 },
  introTitle: { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 8, textAlign: 'center' },
  introDesc:  { fontSize: 14, color: '#b2bec3', lineHeight: 21, textAlign: 'center' },

  // Context banner (lesson back-link)
  contextBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(162,155,254,0.1)', borderRadius: 16,
    padding: 14, marginBottom: 24, borderWidth: 1.5, borderColor: '#a29bfe55',
  },
  contextBannerEmoji: { fontSize: 20 },
  contextBannerTitle: { fontSize: 14, fontWeight: '700', color: '#a29bfe', marginBottom: 2 },
  contextBannerSub:   { fontSize: 12, color: '#636e72' },
  contextBannerArrow: { fontSize: 16, color: '#a29bfe', fontWeight: '700' },

  // Section headers
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle:  { fontSize: 17, fontWeight: '800', color: '#fff' },
  sectionSub:    { fontSize: 12, color: '#636e72' },
  tableNote:     { fontSize: 13, color: '#636e72', marginBottom: 12, lineHeight: 18 },

  // Tones intro text
  tonesIntro:     { marginBottom: 16 },
  tonesIntroText: { fontSize: 14, color: '#b2bec3', lineHeight: 20 },

  // Tone cards
  toneCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 18,
    padding: 16, marginBottom: 12, borderWidth: 1.5, gap: 12,
  },
  toneBadge:    { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  toneBadgeNum: { fontSize: 18, fontWeight: '900', color: '#fff' },
  toneCardBody: { flex: 1 },
  toneCardTop:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  toneMark:     { fontSize: 24, fontWeight: '900' },
  toneName:     { fontSize: 15, fontWeight: '700', color: '#fff' },
  toneDesc:     { fontSize: 12, color: '#b2bec3', marginBottom: 6 },
  toneExample:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toneChar:     { fontSize: 20, fontWeight: '900', color: '#fff' },
  tonePinyin:   { fontSize: 13, color: '#636e72' },
  toneMeaning:  { fontSize: 12, color: '#636e72', fontStyle: 'italic' },
  audioIcon:    { fontSize: 22 },

  // Tip box
  tipBox: {
    backgroundColor: 'rgba(162,155,254,0.1)', borderRadius: 16,
    padding: 18, marginTop: 16, borderWidth: 1, borderColor: '#a29bfe44',
  },
  tipTitle:{ fontSize: 14, fontWeight: '800', color: '#a29bfe', marginBottom: 10 },
  tipText: { fontSize: 13, color: '#b2bec3', lineHeight: 20, marginBottom: 4 },

  // Initials chips
  chipsWrap:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipInitial:     { backgroundColor: '#16213e', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5, borderColor: '#a29bfe55' },
  chipInitialText: { fontSize: 15, fontWeight: '700', color: '#a29bfe' },

  // Finals groups
  finalGroup:      { marginBottom: 16 },
  finalGroupLabel: { fontSize: 12, fontWeight: '700', color: '#636e72', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  chipFinal:       { backgroundColor: '#16213e', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5, borderColor: '#1DD1A155' },
  chipFinalText:   { fontSize: 15, fontWeight: '700', color: '#1DD1A1' },

  // Practice reminder
  practiceReminder: {
    backgroundColor: 'rgba(84,160,255,0.1)', borderRadius: 16,
    padding: 18, marginTop: 28, borderWidth: 1, borderColor: '#54A0FF44',
  },
  practiceReminderTitle:{ fontSize: 14, fontWeight: '800', color: '#54A0FF', marginBottom: 8 },
  practiceReminderText: { fontSize: 13, color: '#b2bec3', lineHeight: 20 },
});
