import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { speakAsAvatar } from '../../utils/tts';
import { DEEP_NAVY, WARM_ORANGE, SLATE_TEAL, WARM_BROWN, CARD_WHITE, SUCCESS, ERROR } from '../../constants/colors';

export default function AudioChoiceExercise({ exercise, onCorrect, onWrong, avatarId }) {
  const { chinese, pinyin, correct, choices } = exercise;
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const [showPinyin, setShowPinyin] = useState(false);

  useEffect(() => {
    speakAsAvatar(chinese, avatarId);
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
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, backgroundColor: CARD_WHITE, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  instruction: { fontSize: 17, fontWeight: '700', color: VG.cream },
  pinyinToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(244,197,66,0.2)',
    backgroundColor: VG.cardDark,
  },
  pinyinToggleOn: { borderColor: VG.gold, backgroundColor: '#FFF8ED' },
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
  choiceCorrect:{ backgroundColor: '#e8f5e9', borderRadius: 14, padding: 18, borderWidth: 2, borderColor: VG.success },
  choiceWrong:  { backgroundColor: '#fde8e8', borderRadius: 14, padding: 18, borderWidth: 2, borderColor: VG.error },
  choiceDimmed: { backgroundColor: '#F5F2EE', borderRadius: 14, padding: 18, borderWidth: 1.5, borderColor: 'rgba(155,104,70,0.10)' },
  choiceText: { fontSize: 16, fontWeight: '600', color: VG.cream, textAlign: 'center' },
  continueBtn: {
    marginTop: 16, backgroundColor: DEEP_NAVY, borderRadius: 14,
    padding: 16, alignItems: 'center',
    shadowColor: VG.shadow, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22, shadowRadius: 8, elevation: 4,
  },
  continueBtnText: { fontSize: 16, fontWeight: '800', color: CARD_WHITE },
});
