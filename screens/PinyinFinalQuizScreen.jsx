import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PinyinLessonExercise from '../components/exercises/PinyinLessonExercise';
import { buildFinalQuiz } from '../utils/pinyinLessonGenerator';

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
    if (pct >= 60) return { label: 'Good',       emoji: '👍', color: '#54A0FF' };
    if (pct >= 40) return { label: 'Keep going', emoji: '💪', color: '#FF9F43' };
    return { label: 'Need practice', emoji: '📚', color: '#FF6B6B' };
  };

  if (done) {
    const pct   = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    const grade = getGrade(pct);
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultEmoji}>{grade.emoji}</Text>
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
      </SafeAreaView>
    );
  }

  const progress = questions.length > 0 ? (current / questions.length) * 100 : 0;
  const question = questions[current];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

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
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a1a2e' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
  },
  exitBtn:      { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  exitText:     { fontSize: 18, color: '#636e72', fontWeight: '700' },
  progressBg:   { flex: 1, height: 8, backgroundColor: '#2d3436', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#FFD700', borderRadius: 4 },
  counter:      { fontSize: 13, color: '#636e72', fontWeight: '600', minWidth: 36, textAlign: 'right' },

  quizBanner: {
    paddingHorizontal: 20, paddingVertical: 8,
    borderBottomWidth: 1, borderTopWidth: 1, borderColor: '#FFD70022',
    backgroundColor: 'rgba(255,215,0,0.05)',
  },
  quizBannerText: { fontSize: 13, fontWeight: '700', color: '#FFD700' },

  resultContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  resultEmoji:     { fontSize: 80, marginBottom: 16 },
  resultTitle:     { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 20, textAlign: 'center' },

  scoreBox: {
    backgroundColor: '#16213e', borderRadius: 20, padding: 20, alignItems: 'center',
    borderWidth: 2, marginBottom: 8, width: 160,
  },
  scoreNum:    { fontSize: 52, fontWeight: '900' },
  scoreDetail: { fontSize: 15, color: '#636e72', marginTop: 4 },
  gradeLabel:  { fontSize: 22, fontWeight: '800', marginBottom: 16 },
  resultMsg:   { fontSize: 14, color: '#b2bec3', textAlign: 'center', lineHeight: 22, marginBottom: 32 },

  primaryBtn: {
    backgroundColor: '#16213e', borderRadius: 18, borderWidth: 2,
    paddingHorizontal: 32, paddingVertical: 18, alignItems: 'center', width: '100%',
    marginBottom: 12,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },

  retryBtn: {
    backgroundColor: 'rgba(84,160,255,0.15)', borderRadius: 18, borderWidth: 1.5, borderColor: '#54A0FF55',
    paddingHorizontal: 32, paddingVertical: 16, alignItems: 'center', width: '100%',
  },
  retryBtnText: { fontSize: 16, fontWeight: '700', color: '#54A0FF' },
});
