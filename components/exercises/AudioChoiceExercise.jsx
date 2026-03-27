import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { speakAsAvatar } from '../../utils/tts';

export default function AudioChoiceExercise({ exercise, onCorrect, onWrong, avatarId }) {
  const { chinese, pinyin, correct, choices } = exercise;
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [showPinyin, setShowPinyin] = useState(false);

  useEffect(() => {
    speakAsAvatar(chinese, avatarId);
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
    if (!answered) return styles.choice;
    if (choice === correct) return styles.choiceCorrect;
    if (choice === selected) return styles.choiceWrong;
    return styles.choiceDimmed;
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.instruction}>What does this mean?</Text>
        <TouchableOpacity
          style={[styles.pinyinToggle, showPinyin && styles.pinyinToggleOn]}
          onPress={() => setShowPinyin(v => !v)}
        >
          <Text style={[styles.pinyinToggleText, showPinyin && styles.pinyinToggleTextOn]}>
            拼 Pinyin
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.audioBtn}
        onPress={() => speakAsAvatar(chinese, avatarId)}
        activeOpacity={0.8}
      >
        <Text style={styles.audioEmoji}>🔊</Text>
        <Text style={styles.audioChar}>{chinese}</Text>
        {showPinyin && pinyin ? (
          <Text style={styles.pinyinText}>{pinyin}</Text>
        ) : (
          <Text style={styles.replayHint}>tap to replay</Text>
        )}
      </TouchableOpacity>

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
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  instruction: { fontSize: 17, fontWeight: '700', color: VG.cream },
  pinyinToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(244,197,66,0.2)',
    backgroundColor: VG.cardDark,
  },
  pinyinToggleOn: { borderColor: VG.gold, backgroundColor: 'rgba(224,176,75,0.15)' },
  pinyinToggleText: { fontSize: 13, fontWeight: '600', color: VG.creamMuted },
  pinyinToggleTextOn: { color: VG.gold },
  audioBtn: {
    backgroundColor: VG.card,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(217,140,43,0.3)',
    shadowColor: VG.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18, shadowRadius: 12, elevation: 5,
  },
  audioEmoji: { fontSize: 32, marginBottom: 8 },
  audioChar: { fontSize: 52, fontWeight: '900', color: VG.onCard, marginBottom: 6 },
  pinyinText: { fontSize: 18, color: VG.orange, fontStyle: 'italic' },
  replayHint: { fontSize: 13, color: VG.onCardMuted },
  choices: { gap: 12 },
  choice:       { backgroundColor: VG.cardDark, borderRadius: 14, padding: 18, borderWidth: 1.5, borderColor: VG.border },
  choiceCorrect:{ backgroundColor: 'rgba(90,158,90,0.2)', borderRadius: 14, padding: 18, borderWidth: 2, borderColor: VG.success },
  choiceWrong:  { backgroundColor: 'rgba(196,80,58,0.2)', borderRadius: 14, padding: 18, borderWidth: 2, borderColor: VG.error },
  choiceDimmed: { backgroundColor: VG.cardDark, borderRadius: 14, padding: 18, borderWidth: 1.5, borderColor: VG.border, opacity: 0.4 },
  choiceText: { fontSize: 16, fontWeight: '600', color: VG.cream, textAlign: 'center' },
});
