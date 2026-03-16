import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PinyinLessonExercise from '../components/exercises/PinyinLessonExercise';
import { buildLessonQuiz } from '../utils/pinyinLessonGenerator';

const PASS_THRESHOLD = 0.6;

export default function PinyinLessonQuizScreen({ lessonData, onPass, onFail, onBack }) {
  const questions = useMemo(() => buildLessonQuiz(lessonData), [lessonData]);
  const [current, setCurrent] = useState(0);
  const [score,   setScore]   = useState(0);
  const [done,    setDone]    = useState(false);

  const advance = (wasCorrect) => {
    if (wasCorrect) setScore(s => s + 1);
    const next = current + 1;
    if (next >= questions.length) setDone(true);
    else setCurrent(next);
  };

  if (done) {
    const pct     = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    const passed  = pct >= PASS_THRESHOLD * 100;
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultEmoji}>{passed ? '🎉' : '😤'}</Text>
          <Text style={styles.resultTitle}>
            {passed ? 'Quiz Passed!' : 'Not quite...'}
          </Text>
          <Text style={styles.resultScore}>{score}/{questions.length} correct · {pct}%</Text>
          <Text style={styles.resultMsg}>
            {passed
              ? `You need 60% to pass — you got ${pct}%! Next lesson unlocked.`
              : `You need 60% to pass. You got ${pct}%. Keep practicing and try again!`}
          </Text>

          {passed ? (
            <TouchableOpacity style={styles.primaryBtn} onPress={onPass} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>🎊 Unlock Next Lesson →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.retryBtn} onPress={onBack} activeOpacity={0.85}>
              <Text style={styles.retryBtnText}>← Back to Practice</Text>
            </TouchableOpacity>
          )}

          {!passed && (
            <TouchableOpacity
              style={[styles.primaryBtn, { marginTop: 12, backgroundColor: '#FF9F43' }]}
              onPress={() => { setCurrent(0); setScore(0); setDone(false); }}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>🔁 Try Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const progress  = questions.length > 0 ? (current / questions.length) * 100 : 0;
  const question  = questions[current];

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
        <Text style={styles.quizBannerText}>
          🎯 Lesson {lessonData?.id} Quiz · Need 60% to pass
        </Text>
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
  progressFill: { height: '100%', backgroundColor: '#54A0FF', borderRadius: 4 },
  counter:      { fontSize: 13, color: '#636e72', fontWeight: '600', minWidth: 36, textAlign: 'right' },

  quizBanner: {
    paddingHorizontal: 20, paddingVertical: 8,
    borderBottomWidth: 1, borderTopWidth: 1, borderColor: '#54A0FF22',
    backgroundColor: 'rgba(84,160,255,0.05)',
  },
  quizBannerText: { fontSize: 13, fontWeight: '700', color: '#54A0FF' },

  resultContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  resultEmoji:     { fontSize: 72, marginBottom: 16 },
  resultTitle:     { fontSize: 32, fontWeight: '900', color: '#fff', marginBottom: 8 },
  resultScore:     { fontSize: 22, color: '#1DD1A1', fontWeight: '700', marginBottom: 12 },
  resultMsg:       { fontSize: 15, color: '#b2bec3', textAlign: 'center', lineHeight: 22, marginBottom: 32 },

  primaryBtn: {
    backgroundColor: '#54A0FF', borderRadius: 18,
    paddingHorizontal: 32, paddingVertical: 18, alignItems: 'center', width: '100%',
  },
  primaryBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },

  retryBtn: {
    backgroundColor: '#16213e', borderRadius: 18, borderWidth: 1.5, borderColor: '#a29bfe55',
    paddingHorizontal: 32, paddingVertical: 18, alignItems: 'center', width: '100%',
  },
  retryBtnText: { fontSize: 17, fontWeight: '700', color: '#a29bfe' },
});
