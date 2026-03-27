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

const VG = {
  bg: '#1C2A44', card: '#F5EDD8', cardDark: '#243454',
  onCard: '#1C2A44', onCardMuted: '#9A8A6A',
  yellow: '#F4C542', gold: '#E0B04B', orange: '#D98C2B',
  cream: '#F7F3E9', creamMuted: '#8A7E6E',
  success: '#5A9E5A', error: '#C4503A',
  shadow: '#A0700A',
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 24, paddingHorizontal: 8 },
  instruction: { fontSize: 16, color: VG.gold, marginBottom: 24, fontWeight: '600' },
  card: {
    width: '100%',
    minHeight: 220,
    backgroundColor: VG.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(217,140,43,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginBottom: 32,
    shadowColor: VG.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2, shadowRadius: 14, elevation: 6,
  },
  cardFlipped: { borderColor: 'rgba(90,158,90,0.5)' },
  face: { alignItems: 'center' },
  chinese: { fontSize: 72, fontWeight: '900', color: VG.onCard, marginBottom: 16 },
  tapHint: { fontSize: 14, color: VG.onCardMuted },
  pinyin: { fontSize: 24, color: VG.orange, fontStyle: 'italic', marginBottom: 12 },
  english: { fontSize: 22, fontWeight: '700', color: VG.onCard, textAlign: 'center' },
  pos: {
    fontSize: 13,
    color: VG.onCardMuted,
    marginTop: 12,
    backgroundColor: 'rgba(28,42,68,0.07)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  buttons: { flexDirection: 'row', gap: 16, width: '100%' },
  dontKnowBtn: {
    flex: 1,
    backgroundColor: VG.cardDark,
    borderWidth: 2,
    borderColor: VG.error,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  knowBtn: {
    flex: 1,
    backgroundColor: VG.cardDark,
    borderWidth: 2,
    borderColor: VG.success,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  btnText: { fontSize: 15, fontWeight: '700', color: VG.cream },
});
