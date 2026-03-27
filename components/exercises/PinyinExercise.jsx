import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { speakPinyin } from '../../utils/tts';

const SUBTYPE_META = {
  tone_id:    { instruction: '🎵 What tone is this syllable?',       label: 'TONE' },
  initial_id: { instruction: '🔤 What is the initial (声母)?',       label: 'INITIAL' },
  final_id:   { instruction: '🔤 What is the final (韵母)?',         label: 'FINAL' },
};

export default function PinyinExercise({ exercise, onCorrect, onWrong }) {
  const { subtype, syllable, chinese, english, correct, choices } = exercise;
  const [selected, setSelected]   = useState(null);
  const [answered, setAnswered]   = useState(false);

  useEffect(() => {
    speakPinyin(syllable);
  }, []);

  const handleSelect = (choice) => {
    if (answered) return;
    setSelected(choice);
    setAnswered(true);
    setTimeout(() => {
      choice === correct ? onCorrect() : onWrong();
    }, 1200);
  };

  const getStyle = (choice) => {
    if (!answered)           return styles.choice;
    if (choice === correct)  return styles.choiceCorrect;
    if (choice === selected) return styles.choiceWrong;
    return styles.choiceDimmed;
  };

  const meta = SUBTYPE_META[subtype] ?? SUBTYPE_META.tone_id;

  return (
    <View style={styles.container}>
      {/* Instruction + type badge */}
      <View style={styles.topRow}>
        <Text style={styles.instruction}>{meta.instruction}</Text>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{meta.label}</Text>
        </View>
      </View>

      {/* Syllable card */}
      <TouchableOpacity
        style={styles.syllableCard}
        onPress={() => speakPinyin(syllable)}
        activeOpacity={0.75}
      >
        <Text style={styles.audioIcon}>🔊</Text>
        <Text style={styles.syllable}>{syllable}</Text>
        {chinese && <Text style={styles.chinese}>{chinese}</Text>}
        {english  && <Text style={styles.english}>{english}</Text>}
      </TouchableOpacity>

      {/* Choices */}
      <View style={styles.choices}>
        {choices.map((choice, i) => (
          <TouchableOpacity
            key={i}
            style={getStyle(choice)}
            onPress={() => handleSelect(choice)}
            disabled={answered}
            activeOpacity={0.75}
          >
            <Text style={styles.choiceText}>{choice}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const VG = {
  bg: '#1C2A44', card: '#F5EDD8', cardDark: '#243454',
  onCard: '#1C2A44', onCardMuted: '#9A8A6A',
  gold: '#E0B04B', orange: '#D98C2B',
  cream: '#F7F3E9', creamMuted: '#8A7E6E',
  success: '#5A9E5A', error: '#C4503A',
  border: 'rgba(244,197,66,0.2)', shadow: '#A0700A',
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 8, paddingHorizontal: 8 },

  topRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 20,
  },
  instruction: { fontSize: 17, fontWeight: '700', color: VG.cream, flex: 1 },
  typeBadge: {
    backgroundColor: 'rgba(224,176,75,0.15)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: VG.gold,
  },
  typeBadgeText: { fontSize: 11, fontWeight: '800', color: VG.gold, letterSpacing: 0.5 },

  syllableCard: {
    backgroundColor: VG.card, borderRadius: 20, padding: 28,
    alignItems: 'center', marginBottom: 28,
    borderWidth: 1, borderColor: 'rgba(217,140,43,0.3)', gap: 6,
    shadowColor: VG.shadow, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18, shadowRadius: 12, elevation: 5,
  },
  audioIcon:   { fontSize: 20, marginBottom: 4 },
  syllable:    { fontSize: 52, fontWeight: '900', color: VG.orange, letterSpacing: 2 },
  chinese:     { fontSize: 28, fontWeight: '900', color: VG.onCard, marginTop: 4 },
  english:     { fontSize: 15, color: VG.onCardMuted, fontStyle: 'italic' },
  noAudioHint: { fontSize: 13, color: VG.onCardMuted },

  choices: { gap: 12 },
  choice:       { backgroundColor: VG.cardDark, borderRadius: 14, padding: 18, borderWidth: 1.5, borderColor: VG.border },
  choiceCorrect:{ backgroundColor: 'rgba(90,158,90,0.2)', borderRadius: 14, padding: 18, borderWidth: 2, borderColor: VG.success },
  choiceWrong:  { backgroundColor: 'rgba(196,80,58,0.2)', borderRadius: 14, padding: 18, borderWidth: 2, borderColor: VG.error },
  choiceDimmed: { backgroundColor: VG.cardDark, borderRadius: 14, padding: 18, borderWidth: 1.5, borderColor: VG.border, opacity: 0.4 },
  choiceText:   { fontSize: 17, fontWeight: '700', color: VG.cream, textAlign: 'center' },
});
