import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { speakChinese } from '../../utils/tts';

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
    // Auto-play audio if we have the Chinese character
    if (chinese) speakChinese(chinese);
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
        onPress={() => chinese && speakChinese(chinese)}
        activeOpacity={chinese ? 0.75 : 1}
      >
        {chinese && <Text style={styles.audioIcon}>🔊</Text>}
        <Text style={styles.syllable}>{syllable}</Text>
        {chinese && <Text style={styles.chinese}>{chinese}</Text>}
        {english  && <Text style={styles.english}>{english}</Text>}
        {!chinese && <Text style={styles.noAudioHint}>Look at the tone marks</Text>}
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

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 8, paddingHorizontal: 8 },

  topRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 20,
  },
  instruction: { fontSize: 17, fontWeight: '700', color: '#fff', flex: 1 },
  typeBadge: {
    backgroundColor: 'rgba(84,160,255,0.2)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#54A0FF',
  },
  typeBadgeText: { fontSize: 11, fontWeight: '800', color: '#54A0FF', letterSpacing: 0.5 },

  syllableCard: {
    backgroundColor: '#16213e', borderRadius: 20, padding: 28,
    alignItems: 'center', marginBottom: 28,
    borderWidth: 2, borderColor: '#54A0FF', gap: 6,
  },
  audioIcon:   { fontSize: 20, marginBottom: 4 },
  syllable:    { fontSize: 52, fontWeight: '900', color: '#54A0FF', letterSpacing: 2 },
  chinese:     { fontSize: 28, fontWeight: '900', color: '#fff', marginTop: 4 },
  english:     { fontSize: 15, color: '#636e72', fontStyle: 'italic' },
  noAudioHint: { fontSize: 13, color: '#636e72' },

  choices: { gap: 12 },
  choice:       { backgroundColor: '#16213e', borderRadius: 14, padding: 18, borderWidth: 2, borderColor: '#2d3436' },
  choiceCorrect:{ backgroundColor: 'rgba(29,209,161,0.2)', borderRadius: 14, padding: 18, borderWidth: 2, borderColor: '#1DD1A1' },
  choiceWrong:  { backgroundColor: 'rgba(255,107,107,0.2)', borderRadius: 14, padding: 18, borderWidth: 2, borderColor: '#FF6B6B' },
  choiceDimmed: { backgroundColor: '#16213e', borderRadius: 14, padding: 18, borderWidth: 2, borderColor: '#2d3436', opacity: 0.4 },
  choiceText:   { fontSize: 17, fontWeight: '700', color: '#fff', textAlign: 'center' },
});
