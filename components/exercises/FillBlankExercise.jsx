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

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 8, paddingHorizontal: 8 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  instruction: { fontSize: 17, fontWeight: '700', color: '#fff' },
  pinyinToggle: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1.5, borderColor: '#2d3436', backgroundColor: '#16213e' },
  pinyinToggleOn: { borderColor: '#a29bfe', backgroundColor: 'rgba(162,155,254,0.15)' },
  pinyinToggleText: { fontSize: 13, fontWeight: '600', color: '#636e72' },
  pinyinToggleTextOn: { color: '#a29bfe' },
  hint: { fontSize: 13, color: '#636e72', fontStyle: 'italic', marginBottom: 16 },
  sentenceBox: {
    backgroundColor: '#16213e', borderRadius: 20, padding: 24,
    alignItems: 'center', marginBottom: 24, borderWidth: 2, borderColor: '#2d3436',
  },
  sentence: { fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center', lineHeight: 38 },
  sentencePinyin: { fontSize: 14, color: '#a29bfe', fontStyle: 'italic', marginTop: 8, textAlign: 'center' },
  feedback: { fontSize: 14, marginTop: 10, fontWeight: '600' },
  feedbackCorrect: { color: '#1DD1A1' },
  feedbackWrong: { color: '#FF6B6B' },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  choice: { backgroundColor: '#16213e', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 16, borderWidth: 2, borderColor: '#2d3436', minWidth: '42%', alignItems: 'center' },
  choiceCorrect: { backgroundColor: 'rgba(29,209,161,0.2)', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 16, borderWidth: 2, borderColor: '#1DD1A1', minWidth: '42%', alignItems: 'center' },
  choiceWrong: { backgroundColor: 'rgba(255,107,107,0.2)', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 16, borderWidth: 2, borderColor: '#FF6B6B', minWidth: '42%', alignItems: 'center' },
  choiceDimmed: { backgroundColor: '#16213e', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 16, borderWidth: 2, borderColor: '#2d3436', minWidth: '42%', alignItems: 'center', opacity: 0.4 },
  choiceText: { fontSize: 22, fontWeight: '800', color: '#fff' },
  choicePinyin: { fontSize: 12, color: '#a29bfe', fontStyle: 'italic', marginTop: 4 },
});
