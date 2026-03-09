import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function FlashcardExercise({ exercise, onKnow, onDontKnow }) {
  const { vocabItem } = exercise;
  const [flipped, setFlipped] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>Tap the card to reveal</Text>

      <TouchableOpacity
        style={[styles.card, flipped && styles.cardFlipped]}
        onPress={() => !flipped && setFlipped(true)}
        activeOpacity={0.85}
        disabled={flipped}
      >
        {!flipped ? (
          <View style={styles.face}>
            <Text style={styles.chinese}>{vocabItem.chinese}</Text>
            <Text style={styles.tapHint}>tap to reveal</Text>
          </View>
        ) : (
          <View style={styles.face}>
            <Text style={styles.pinyin}>{vocabItem.pinyin}</Text>
            <Text style={styles.english}>{vocabItem.english}</Text>
            {vocabItem.part_of_speech && (
              <Text style={styles.pos}>{vocabItem.part_of_speech}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>

      {flipped && (
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.dontKnowBtn} onPress={onDontKnow} activeOpacity={0.8}>
            <Text style={styles.btnText}>Still Learning</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.knowBtn} onPress={onKnow} activeOpacity={0.8}>
            <Text style={styles.btnText}>Got It! ✓</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 24, paddingHorizontal: 8 },
  instruction: { fontSize: 16, color: '#a29bfe', marginBottom: 24, fontWeight: '600' },
  card: {
    width: '100%',
    minHeight: 220,
    backgroundColor: '#16213e',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#a29bfe',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginBottom: 32,
  },
  cardFlipped: { borderColor: '#1DD1A1' },
  face: { alignItems: 'center' },
  chinese: { fontSize: 72, fontWeight: '900', color: '#fff', marginBottom: 16 },
  tapHint: { fontSize: 14, color: '#636e72' },
  pinyin: { fontSize: 24, color: '#a29bfe', fontStyle: 'italic', marginBottom: 12 },
  english: { fontSize: 22, fontWeight: '700', color: '#fff', textAlign: 'center' },
  pos: {
    fontSize: 13,
    color: '#636e72',
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  buttons: { flexDirection: 'row', gap: 16, width: '100%' },
  dontKnowBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,107,107,0.15)',
    borderWidth: 2,
    borderColor: '#FF6B6B',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  knowBtn: {
    flex: 1,
    backgroundColor: 'rgba(29,209,161,0.15)',
    borderWidth: 2,
    borderColor: '#1DD1A1',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  btnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
