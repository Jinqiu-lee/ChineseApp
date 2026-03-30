import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PinyinLessonExercise from '../components/exercises/PinyinLessonExercise';
import { buildFinalQuiz } from '../utils/pinyinLessonGenerator';
import ScreenBackground from '../components/ScreenBackground';
import { DEEP_NAVY, WARM_ORANGE, SLATE_TEAL, WARM_BROWN, CARD_WHITE } from '../constants/colors';

export default function PinyinFinalQuizScreen({ allLessons, onBack }) {
  const questions = useMemo(() => buildFinalQuiz(allLessons), [allLessons]);
  const [current, setCurrent] = useState(0);
  const [score,   setScore]   = useState(0);
  const [done,    setDone]    = useState(false);

  const advance = (wasCorrect) => {
    if (wasCorrect) setScore(s => s + 1);
    const next = current + 1;
    if (next >= questions.length) setDone(true);
    else setCurrent(next);
  };

  const getGrade = (pct) => {
    if (pct >= 90) return { label: 'Excellent!', emoji: '🌟', color: '#FFD700' };
    if (pct >= 80) return { label: 'Great!',     emoji: '🎉', color: '#1DD1A1' };
    if (pct >= 60) return { label: 'Good',       emoji: '👍', color: SLATE_TEAL };
    if (pct >= 40) return { label: 'Keep going', emoji: '💪', color: WARM_ORANGE };
    return { label: 'Need practice', emoji: '📚', color: '#FF6B6B' };
  };

  if (done) {
    const pct   = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    const grade = getGrade(pct);
    return (
      <ScreenBackground levelId="pinyin">
        <SafeAreaView style={styles.safe}>
          <View style={styles.resultContainer}>
            <Text style={styles.resultEmoji}>{grade.emoji}</Text>
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>Final Quiz Complete!</Text>
              <View style={[styles.scoreBox, { borderColor: grade.color + '66' }]}>
                <Text style={[styles.scoreNum, { color: grade.color }]}>{pct}%</Text>
                <Text style={styles.scoreDetail}>{score} / {questions.length} correct</Text>
              </View>
              <Text style={[styles.gradeLabel, { color: grade.color }]}>{grade.label}</Text>
              <Text style={styles.resultMsg}>
                {pct >= 80
                  ? 'Outstanding pinyin mastery! You\'re ready for Chinese characters!'
                  : pct >= 60
                    ? 'Solid understanding. Review the lessons where you struggled.'
                    : 'Keep practicing! Go back and review specific lessons to improve.'}
              </Text>

              <TouchableOpacity style={[styles.primaryBtn, { borderColor: grade.color }]} onPress={onBack} activeOpacity={0.85}>
                <Text style={styles.primaryBtnText}>← Back to Pinyin System</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => { setCurrent(0); setScore(0); setDone(false); }}
                activeOpacity={0.85}
              >
                <Text style={styles.retryBtnText}>🔁 Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  const progress = questions.length > 0 ? (current / questions.length) * 100 : 0;
  const question = questions[current];

  return (
    <ScreenBackground levelId="pinyin">
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.exitBtn}>
            <Text style={styles.exitText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.counter}>{current + 1}/{questions.length}</Text>
        </View>

        <View style={styles.quizBanner}>
          <Text style={styles.quizBannerText}>🎓 Final Pinyin Quiz — Comprehensive Review</Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {question && (
            <PinyinLessonExercise
              key={current}
              exercise={question}
              onCorrect={() => advance(true)}
              onWrong={() => advance(false)}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
    backgroundColor: CARD_WHITE,
    borderBottomWidth: 1, borderBottomColor: 'rgba(155,104,70,0.15)',
  },
  exitBtn:      { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  exitText:     { fontSize: 18, color: SLATE_TEAL, fontWeight: '700' },
  progressBg:   { flex: 1, height: 8, backgroundColor: 'rgba(55,73,80,0.22)', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: WARM_BROWN, borderRadius: 4 },
  counter:      { fontSize: 13, color: SLATE_TEAL, fontWeight: '600', minWidth: 36, textAlign: 'right' },

  quizBanner: {
    paddingHorizontal: 20, paddingVertical: 8,
    borderBottomWidth: 1, borderColor: 'rgba(155,104,70,0.20)',
    backgroundColor: CARD_WHITE,
  },
  quizBannerText: { fontSize: 13, fontWeight: '700', color: WARM_BROWN },

  resultContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  resultEmoji:     { fontSize: 80, marginBottom: 16 },
  resultCard: {
    backgroundColor: CARD_WHITE, borderRadius: 24, padding: 28,
    alignItems: 'center', width: '100%', gap: 12,
    borderWidth: 1, borderColor: 'rgba(155,104,70,0.20)',
  },
  resultTitle:     { fontSize: 28, fontWeight: '900', color: DEEP_NAVY, textAlign: 'center' },

  scoreBox: {
    backgroundColor: CARD_WHITE, borderRadius: 20, padding: 20, alignItems: 'center',
    borderWidth: 2, width: 160,
  },
  scoreNum:    { fontSize: 52, fontWeight: '900' },
  scoreDetail: { fontSize: 15, color: SLATE_TEAL, marginTop: 4 },
  gradeLabel:  { fontSize: 22, fontWeight: '800' },
  resultMsg:   { fontSize: 14, color: SLATE_TEAL, textAlign: 'center', lineHeight: 22 },

  primaryBtn: {
    backgroundColor: CARD_WHITE, borderRadius: 18, borderWidth: 2,
    paddingHorizontal: 32, paddingVertical: 18, alignItems: 'center', width: '100%',
  },
  primaryBtnText: { fontSize: 16, fontWeight: '800', color: DEEP_NAVY },

  retryBtn: {
    backgroundColor: CARD_WHITE, borderRadius: 18, borderWidth: 1.5, borderColor: 'rgba(155,104,70,0.30)',
    paddingHorizontal: 32, paddingVertical: 16, alignItems: 'center', width: '100%',
  },
  retryBtnText: { fontSize: 16, fontWeight: '700', color: SLATE_TEAL },
});
