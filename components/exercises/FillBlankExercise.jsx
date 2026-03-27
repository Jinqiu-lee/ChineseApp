import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function FillBlankExercise({ exercise, onCorrect, onWrong }) {
  const { displayText, sentence_pinyin, correct, choices, choices_pinyin, hint } = exercise;
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [showPinyin, setShowPinyin] = useState(false);

  const handleSelect = (choice) => {
    if (answered) return;
    setSelected(choice);
    setAnswered(true);
    setTimeout(() => {
      choice === correct ? onCorrect() : onWrong();
    }, 1200);
  };

  const displayFilled = answered ? displayText.replace('____', selected) : displayText;

  const getStyle = (choice) => {
    if (!answered) return styles.choice;
    if (choice === correct) return styles.choiceCorrect;
    if (choice === selected) return styles.choiceWrong;
    return styles.choiceDimmed;
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.instruction}>Fill in the blank</Text>
        <TouchableOpacity
          style={[styles.pinyinToggle, showPinyin && styles.pinyinToggleOn]}
          onPress={() => setShowPinyin(v => !v)}
        >
          <Text style={[styles.pinyinToggleText, showPinyin && styles.pinyinToggleTextOn]}>
            拼 Pinyin
          </Text>
        </TouchableOpacity>
      </View>

      {hint && <Text style={styles.hint}>"{hint}"</Text>}

      <View style={styles.sentenceBox}>
        <Text style={styles.sentence}>{displayFilled}</Text>
        {showPinyin && sentence_pinyin ? (
          <Text style={styles.sentencePinyin}>{sentence_pinyin}</Text>
        ) : null}
        {answered && (
          <Text style={[styles.feedback, selected === correct ? styles.feedbackCorrect : styles.feedbackWrong]}>
            {selected === correct ? '✅ Correct!' : `❌  Answer: ${correct}`}
          </Text>
        )}
      </View>

      <View style={styles.choices}>
        {(choices || []).map((choice, i) => (
          <TouchableOpacity
            key={i}
            style={getStyle(choice)}
            onPress={() => handleSelect(choice)}
            disabled={answered}
            activeOpacity={0.75}
          >
            <Text style={styles.choiceText}>{choice}</Text>
            {showPinyin && choices_pinyin?.[i] ? (
              <Text style={styles.choicePinyin}>{choices_pinyin[i]}</Text>
            ) : null}
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
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  instruction: { fontSize: 17, fontWeight: '700', color: VG.cream },
  pinyinToggle: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1.5, borderColor: VG.border, backgroundColor: VG.cardDark },
  pinyinToggleOn: { borderColor: VG.gold, backgroundColor: 'rgba(224,176,75,0.15)' },
  pinyinToggleText: { fontSize: 13, fontWeight: '600', color: VG.creamMuted },
  pinyinToggleTextOn: { color: VG.gold },
  hint: { fontSize: 13, color: VG.creamMuted, fontStyle: 'italic', marginBottom: 16 },
  sentenceBox: {
    backgroundColor: VG.card, borderRadius: 20, padding: 24,
    alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: 'rgba(217,140,43,0.25)',
    shadowColor: VG.shadow, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18, shadowRadius: 12, elevation: 5,
  },
  sentence: { fontSize: 28, fontWeight: '800', color: VG.onCard, textAlign: 'center', lineHeight: 38 },
  sentencePinyin: { fontSize: 14, color: VG.orange, fontStyle: 'italic', marginTop: 8, textAlign: 'center' },
  feedback: { fontSize: 14, marginTop: 10, fontWeight: '600' },
  feedbackCorrect: { color: VG.success },
  feedbackWrong:   { color: VG.error },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  choice:       { backgroundColor: VG.cardDark, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 16, borderWidth: 1.5, borderColor: VG.border, minWidth: '42%', alignItems: 'center' },
  choiceCorrect:{ backgroundColor: 'rgba(90,158,90,0.2)', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 16, borderWidth: 2, borderColor: VG.success, minWidth: '42%', alignItems: 'center' },
  choiceWrong:  { backgroundColor: 'rgba(196,80,58,0.2)', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 16, borderWidth: 2, borderColor: VG.error, minWidth: '42%', alignItems: 'center' },
  choiceDimmed: { backgroundColor: VG.cardDark, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 16, borderWidth: 1.5, borderColor: VG.border, minWidth: '42%', alignItems: 'center', opacity: 0.4 },
  choiceText: { fontSize: 22, fontWeight: '800', color: VG.cream },
  choicePinyin: { fontSize: 12, color: VG.gold, fontStyle: 'italic', marginTop: 4 },
});
