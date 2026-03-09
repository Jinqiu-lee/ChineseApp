import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ROUND_LABELS = { 1: 'Round 1 · Learn', 2: 'Round 2 · Practice', 3: 'Round 3 · Master' };
const ROUND_EMOJIS = { 1: '🎉', 2: '🌟', 3: '🏆' };

export default function RoundCompleteScreen({
  currentRound,
  roundScore = { score: 0, total: 0 },
  combinedAccuracy = 0,
  onContinue,
  onTakeQuiz,
}) {
  const accuracy = roundScore.total > 0
    ? Math.round((roundScore.score / roundScore.total) * 100)
    : 0;
  const stars = accuracy >= 90 ? 3 : accuracy >= 60 ? 2 : 1;
  const highAccuracy = currentRound === 2 && combinedAccuracy >= 90;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Header */}
        <Text style={styles.emoji}>{ROUND_EMOJIS[currentRound]}</Text>
        <Text style={styles.title}>{ROUND_LABELS[currentRound]} Complete!</Text>
        <Text style={styles.stars}>{'⭐'.repeat(stars)}</Text>

        {/* Score card */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Round {currentRound} Score</Text>
          <Text style={styles.scorePct}>{accuracy}%</Text>
          <Text style={styles.scoreDetail}>{roundScore.score} / {roundScore.total} correct</Text>
        </View>

        {/* Combined accuracy row — only shown after round 2 */}
        {currentRound === 2 && (
          <View style={styles.combinedRow}>
            <Text style={styles.combinedLabel}>Rounds 1 + 2 combined:</Text>
            <Text style={[styles.combinedPct, { color: highAccuracy ? '#1DD1A1' : '#FF9F43' }]}>
              {combinedAccuracy}%
            </Text>
          </View>
        )}

        {/* Message */}
        {currentRound === 3 && (
          <Text style={styles.message}>Outstanding! You've mastered all 3 rounds! 💪</Text>
        )}
        {currentRound === 2 && highAccuracy && (
          <Text style={styles.message}>Excellent work! You can take the quiz now or keep practicing.</Text>
        )}
        {currentRound === 2 && !highAccuracy && (
          <Text style={styles.message}>Great effort! One more round to solidify your skills.</Text>
        )}

        {/* Action buttons */}
        <View style={styles.actions}>
          {currentRound === 3 ? (
            <TouchableOpacity style={styles.quizBtn} onPress={onTakeQuiz} activeOpacity={0.85}>
              <Text style={styles.quizBtnText}>🏆 Take Lesson Quiz</Text>
            </TouchableOpacity>
          ) : currentRound === 2 && highAccuracy ? (
            <>
              <TouchableOpacity style={styles.quizBtn} onPress={onTakeQuiz} activeOpacity={0.85}>
                <Text style={styles.quizBtnText}>📝 Take Lesson Quiz</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.continueBtn} onPress={onContinue} activeOpacity={0.85}>
                <Text style={styles.continueBtnText}>Continue to Round 3 →</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.continueBtn} onPress={onContinue} activeOpacity={0.85}>
              <Text style={styles.continueBtnText}>
                {currentRound === 1 ? 'Start Round 2 →' : 'Start Round 3 →'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a1a2e' },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },

  emoji:  { fontSize: 56, marginBottom: 4 },
  title:  { fontSize: 26, fontWeight: '900', color: '#fff', textAlign: 'center' },
  stars:  { fontSize: 36, marginBottom: 4 },

  scoreCard: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#2d3436',
    gap: 4,
  },
  scoreLabel:  { fontSize: 13, color: '#636e72', fontWeight: '600' },
  scorePct:    { fontSize: 52, fontWeight: '900', color: '#1DD1A1' },
  scoreDetail: { fontSize: 15, color: '#fff', fontWeight: '600' },

  combinedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: '100%',
    justifyContent: 'space-between',
  },
  combinedLabel: { fontSize: 14, color: '#636e72', fontWeight: '600' },
  combinedPct:   { fontSize: 18, fontWeight: '900' },

  message: {
    fontSize: 15,
    color: '#a29bfe',
    textAlign: 'center',
    lineHeight: 22,
  },

  actions: { width: '100%', gap: 12, marginTop: 8 },

  quizBtn: {
    backgroundColor: '#FF6B6B',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  quizBtnText: { fontSize: 17, fontWeight: '900', color: '#fff' },

  continueBtn: {
    backgroundColor: '#a29bfe',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueBtnText: { fontSize: 17, fontWeight: '900', color: '#fff' },
});
