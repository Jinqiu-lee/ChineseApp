import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { speakPinyin } from '../../utils/tts';
import { DEEP_NAVY, WARM_ORANGE, SLATE_TEAL, WARM_BROWN, CARD_WHITE, SUCCESS, ERROR } from '../../constants/colors';

const SUBTYPE_META = {
  tone_id:    { instruction: '🎵 What tone is this syllable?',       label: 'TONE' },
  initial_id: { instruction: '🔤 What is the initial (声母)?',       label: 'INITIAL' },
  final_id:   { instruction: '🔤 What is the final (韵母)?',         label: 'FINAL' },
};

export default function PinyinExercise({ exercise, onCorrect, onWrong }) {
  const { subtype, syllable, audio_syllable, chinese, english, correct, choices } = exercise;
  const audioTarget = audio_syllable ?? syllable;
  const [selected, setSelected]     = useState(null);
  const [answered, setAnswered]     = useState(false);
  const [showContinue, setShowContinue] = useState(false);

  useEffect(() => {
    speakPinyin(audioTarget);
  }, []);

  const handleSelect = (choice) => {
    if (answered) return;
    setSelected(choice);
    setAnswered(true);
    if (choice === correct) {
      setTimeout(() => onCorrect(), 1200);
    } else {
      setShowContinue(true);
    }
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
        onPress={() => speakPinyin(audioTarget)}
        activeOpacity={0.75}
      >
        <Text style={styles.audioIcon}>🔊</Text>
        {chinese && <Text style={styles.chinese}>{chinese}</Text>}
        <Text style={styles.syllable}>{syllable}</Text>
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

      {showContinue && (
        <TouchableOpacity style={styles.continueBtn} onPress={onWrong} activeOpacity={0.85}>
          <Text style={styles.continueBtnText}>Continue →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const VG = {
  bg: 'transparent', card: CARD_WHITE, cardDark: CARD_WHITE,
  onCard: DEEP_NAVY, onCardMuted: WARM_BROWN,
  gold: WARM_BROWN, orange: WARM_ORANGE,
  cream: DEEP_NAVY, creamMuted: SLATE_TEAL,
  success: SUCCESS, error: ERROR,
  border: 'rgba(155,104,70,0.22)', shadow: 'rgba(28,42,68,0.18)',
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 8, paddingHorizontal: 8 },

  topRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 16,
    backgroundColor: CARD_WHITE, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  instruction: { fontSize: 17, fontWeight: '700', color: VG.cream, flex: 1 },
  typeBadge: {
    backgroundColor: '#FFF8ED', borderRadius: 8,
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
  syllable:    { fontSize: 36, fontWeight: '800', color: VG.orange, letterSpacing: 2 },
  chinese:     { fontSize: 52, fontWeight: '900', color: VG.onCard, marginTop: 2 },
  english:     { fontSize: 15, color: VG.onCardMuted, fontStyle: 'italic' },
  noAudioHint: { fontSize: 13, color: VG.onCardMuted },

  choices: { gap: 12 },
  choice:       { backgroundColor: VG.cardDark, borderRadius: 14, padding: 18, borderWidth: 1.5, borderColor: VG.border },
  choiceCorrect:{ backgroundColor: '#e8f5e9', borderRadius: 14, padding: 18, borderWidth: 2, borderColor: VG.success },
  choiceWrong:  { backgroundColor: '#fde8e8', borderRadius: 14, padding: 18, borderWidth: 2, borderColor: VG.error },
  choiceDimmed: { backgroundColor: '#F5F2EE', borderRadius: 14, padding: 18, borderWidth: 1.5, borderColor: 'rgba(155,104,70,0.10)' },
  choiceText:   { fontSize: 17, fontWeight: '700', color: VG.cream, textAlign: 'center' },
  continueBtn: {
    marginTop: 16, backgroundColor: DEEP_NAVY, borderRadius: 14,
    padding: 16, alignItems: 'center',
    shadowColor: VG.shadow, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22, shadowRadius: 8, elevation: 4,
  },
  continueBtnText: { fontSize: 16, fontWeight: '800', color: CARD_WHITE },
});
