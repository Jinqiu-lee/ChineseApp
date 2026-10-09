// TEMPORARY test harness for StrokeAnimator.
// Reachable from: Foundations tab -> Characters card.
// Remove this screen (and that card's onCharactersPress wiring in App.js)
// once the real Characters lesson screens exist.
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StrokeAnimator from '../components/characters/StrokeAnimator';
import { getStrokeVisual } from '../data/characters/strokeAssets';
import { DEEP_NAVY, SLATE_TEAL, WARM_ORANGE, CARD_WHITE } from '../constants/colors';

// Lesson 1's four basic strokes, for checking that the uploaded
// stroke assets actually render (animated WebP is the uncertain one).
const LESSON1_STROKES = [
  { stroke: '横', pinyin: 'héng' },
  { stroke: '竖', pinyin: 'shù'  },
  { stroke: '撇', pinyin: 'piě'  },
  { stroke: '捺', pinyin: 'nà'   },
];

const CASES = [
  { char: '一', label: '一 yī', note: 'plain — 1 stroke' },
  { char: '八', label: '八 bā', note: 'highlightStroke = 1 (the 捺)', highlightStroke: 1 },
  { char: '人', label: '人 rén', note: 'plain — 撇 then 捺' },
  { char: '木', label: '木 mù', note: 'hideStroke = 3 (the 捺 is missing)', hideStroke: 3 },
];

export default function StrokeAnimatorTestScreen({ onBack }) {
  // Bumping this remounts every animator, which replays from stroke 1.
  const [runId, setRunId] = useState(0);
  const [done, setDone] = useState([]);

  const replay = () => {
    setDone([]);
    setRunId(n => n + 1);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>StrokeAnimator test</Text>
        <TouchableOpacity style={styles.replayBtn} onPress={replay} activeOpacity={0.85}>
          <Text style={styles.replayText}>↻ Replay</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Uploaded stroke-type assets — Part 1 "Discover" material */}
        <Text style={styles.sectionLabel}>STROKE ASSETS (data/characters/gifs)</Text>
        <View style={styles.strokeRow}>
          {LESSON1_STROKES.map(({ stroke, pinyin }) => {
            const v = getStrokeVisual(stroke);
            return (
              <View key={stroke} style={styles.strokeCell}>
                <View style={styles.strokeBox}>
                  {v.kind === 'gif' && (
                    <Image
                      key={`${stroke}-${runId}`}
                      source={v.asset}
                      style={styles.strokeImg}
                      resizeMode="contain"
                    />
                  )}
                  {v.kind === 'draw' && (
                    <StrokeAnimator key={`${stroke}-${runId}`} char={v.char} size={60} loop />
                  )}
                  {v.kind === 'none' && <Text style={styles.strokeMissing}>no{'\n'}art</Text>}
                </View>
                <Text style={styles.strokeName}>{stroke} {pinyin}</Text>
                <Text style={styles.strokeMeta}>
                  {v.kind === 'gif' ? `${v.format} · animated`
                    : v.kind === 'draw' ? `drawn ${v.char} · loop`
                    : '—'}
                </Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>CHARACTER BUILD (StrokeAnimator)</Text>
        {CASES.map(c => (
          <View key={c.char} style={styles.card}>
            <View style={styles.canvas}>
              <StrokeAnimator
                key={`${c.char}-${runId}`}
                char={c.char}
                size={180}
                highlightStroke={c.highlightStroke ?? null}
                hideStroke={c.hideStroke ?? null}
                onComplete={() => setDone(d => (d.includes(c.char) ? d : [...d, c.char]))}
              />
            </View>
            <Text style={styles.label}>{c.label}</Text>
            <Text style={styles.note}>{c.note}</Text>
            <Text style={[styles.status, done.includes(c.char) && styles.statusDone]}>
              {done.includes(c.char) ? 'onComplete fired ✓' : 'drawing…'}
            </Text>
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F1E7' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: CARD_WHITE,
    borderBottomWidth: 1, borderBottomColor: 'rgba(155,104,70,0.15)',
  },
  headerTitle: { fontSize: 15, fontWeight: '800', color: DEEP_NAVY },
  backBtn:  { paddingVertical: 8, paddingRight: 10 },
  backText: { fontSize: 15, fontWeight: '600', color: SLATE_TEAL },
  replayBtn: {
    backgroundColor: WARM_ORANGE, borderRadius: 18,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  replayText: { color: CARD_WHITE, fontWeight: '800', fontSize: 14 },

  content: { padding: 20, gap: 16 },

  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: SLATE_TEAL,
    letterSpacing: 1, marginTop: 4,
  },
  strokeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  strokeCell: { alignItems: 'center', width: '22%' },
  strokeBox: {
    width: '100%', aspectRatio: 1, backgroundColor: CARD_WHITE,
    borderRadius: 10, borderWidth: 1, borderColor: 'rgba(155,104,70,0.18)',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  strokeImg:     { width: '88%', height: '88%' },
  strokeMissing: { fontSize: 10, color: '#C4503A', textAlign: 'center', fontWeight: '700' },
  strokeName:    { fontSize: 12, fontWeight: '700', color: DEEP_NAVY, marginTop: 4 },
  strokeMeta:    { fontSize: 9, color: SLATE_TEAL },
  card: {
    backgroundColor: CARD_WHITE, borderRadius: 16, padding: 16, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(155,104,70,0.18)',
  },
  canvas: {
    width: 180, height: 180, marginBottom: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  label:  { fontSize: 17, fontWeight: '800', color: DEEP_NAVY },
  note:   { fontSize: 12, color: SLATE_TEAL, marginTop: 2 },
  status: { fontSize: 11, color: SLATE_TEAL, marginTop: 6, fontStyle: 'italic' },
  statusDone: { color: '#2E7D32', fontStyle: 'normal', fontWeight: '700' },
});
