import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { speakChinese } from '../../utils/tts';

export default function AudioChoiceExercise({ exercise, onCorrect, onWrong }) {
  const { chinese, pinyin, correct, choices } = exercise;
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [showPinyin, setShowPinyin] = useState(false);

  useEffect(() => {
    speakChinese(chinese);
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
        onPress={() => speakChinese(chinese)}
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

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 8, paddingHorizontal: 8 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  instruction: { fontSize: 17, fontWeight: '700', color: '#fff' },
  pinyinToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#2d3436',
    backgroundColor: '#16213e',
  },
  pinyinToggleOn: { borderColor: '#a29bfe', backgroundColor: 'rgba(162,155,254,0.15)' },
  pinyinToggleText: { fontSize: 13, fontWeight: '600', color: '#636e72' },
  pinyinToggleTextOn: { color: '#a29bfe' },
  audioBtn: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 2,
    borderColor: '#a29bfe',
  },
  audioEmoji: { fontSize: 32, marginBottom: 8 },
  audioChar: { fontSize: 52, fontWeight: '900', color: '#fff', marginBottom: 6 },
  pinyinText: { fontSize: 18, color: '#a29bfe', fontStyle: 'italic' },
  replayHint: { fontSize: 13, color: '#636e72' },
  choices: { gap: 12 },
  choice: { backgroundColor: '#16213e', borderRadius: 14, padding: 18, borderWidth: 2, borderColor: '#2d3436' },
  choiceCorrect: { backgroundColor: 'rgba(29,209,161,0.2)', borderRadius: 14, padding: 18, borderWidth: 2, borderColor: '#1DD1A1' },
  choiceWrong: { backgroundColor: 'rgba(255,107,107,0.2)', borderRadius: 14, padding: 18, borderWidth: 2, borderColor: '#FF6B6B' },
  choiceDimmed: { backgroundColor: '#16213e', borderRadius: 14, padding: 18, borderWidth: 2, borderColor: '#2d3436', opacity: 0.4 },
  choiceText: { fontSize: 16, fontWeight: '600', color: '#fff', textAlign: 'center' },
});
