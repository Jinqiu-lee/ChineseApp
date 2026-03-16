import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LESSON_PREVIEWS = [
  { id: 1, title: 'Finals & The Four Tones', subtitle: 'a o e i u ü · b p m f d t n l', emoji: '🎵' },
  { id: 2, title: 'Compound Finals & New Initials', subtitle: 'ai ei ui ao ou iu · g k h j q x', emoji: '🔤' },
  { id: 3, title: 'Finals ie üe er · Retroflex', subtitle: 'ie üe er · zh ch sh r', emoji: '🌀' },
  { id: 4, title: 'Nasal Finals (-n) & z c s', subtitle: 'an en in un ün · z c s', emoji: '👃' },
  { id: 5, title: 'Nasal Finals (-ng) & y/w', subtitle: 'ang eng ing ong · y w', emoji: '🔔' },
  { id: 6, title: 'Medial Phonics & j/q/x Rules', subtitle: 'ia iao ian iang · ua uo uan', emoji: '🔗' },
  { id: 7, title: 'Whole-Syllable Pinyin', subtitle: 'zhi chi shi ri · zi ci si · yi wu yu', emoji: '🎯' },
  { id: 8, title: 'Tone Sandhi: 一 and 不', subtitle: 'yī changes tone · bù becomes bú', emoji: '🔄' },
  { id: 9, title: 'Neutral Tone & Erhua', subtitle: '轻声 neutral tone · 儿化 er suffix', emoji: '💨' },
  { id: 10, title: 'Comprehensive Review', subtitle: 'All finals · All initials · All rules', emoji: '🏆' },
];

export default function PinyinSystemScreen({ onBack, onSelectLesson, onFinalQuiz, quizPassedLessons = [], pinyinStageProgress = {} }) {
  const isLessonUnlocked = (id) => {
    if (id === 1) return true;
    return quizPassedLessons.includes(id - 1);
  };

  const isLessonCompleted = (id) => quizPassedLessons.includes(id);

  const allLessonsCompleted = LESSON_PREVIEWS.every(l => isLessonCompleted(l.id));

  const getStagesCompleted = (lessonId) => {
    const key = `pinyin_${lessonId}`;
    return (pinyinStageProgress[key] || []).length;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pinyin Learning System</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Hero card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>🔊</Text>
          <Text style={styles.heroTitle}>Master Chinese Pinyin</Text>
          <Text style={styles.heroDesc}>
            10 structured lessons covering all initials, finals, tones, and special rules. Pass each lesson quiz to unlock the next.
          </Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>{quizPassedLessons.length}/10</Text>
              <Text style={styles.heroStatLabel}>Completed</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>3</Text>
              <Text style={styles.heroStatLabel}>Stages / Lesson</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>60%</Text>
              <Text style={styles.heroStatLabel}>Pass to unlock</Text>
            </View>
          </View>
        </View>

        {/* Lesson list */}
        <Text style={styles.sectionLabel}>LESSONS</Text>
        {LESSON_PREVIEWS.map(lesson => {
          const unlocked  = isLessonUnlocked(lesson.id);
          const completed = isLessonCompleted(lesson.id);
          const stages    = getStagesCompleted(lesson.id);

          return (
            <TouchableOpacity
              key={lesson.id}
              style={[styles.lessonCard, !unlocked && styles.lessonLocked]}
              onPress={() => unlocked && onSelectLesson(lesson.id)}
              activeOpacity={unlocked ? 0.8 : 1}
            >
              <View style={styles.lessonLeft}>
                <Text style={styles.lessonEmoji}>
                  {completed ? '✅' : unlocked ? lesson.emoji : '🔒'}
                </Text>
                <View style={styles.lessonInfo}>
                  <Text style={[styles.lessonTitle, !unlocked && styles.lockedText]}>
                    {lesson.id}. {lesson.title}
                  </Text>
                  <Text style={[styles.lessonSubtitle, !unlocked && styles.lockedText]}>
                    {lesson.subtitle}
                  </Text>
                  {unlocked && !completed && stages > 0 && (
                    <Text style={styles.lessonProgress}>{stages}/3 stages done</Text>
                  )}
                  {!unlocked && (
                    <Text style={styles.lockHint}>Pass Lesson {lesson.id - 1} quiz to unlock</Text>
                  )}
                </View>
              </View>
              {unlocked && (
                <Text style={styles.lessonArrow}>{completed ? '✓' : '→'}</Text>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Final Quiz */}
        <TouchableOpacity
          style={[styles.finalQuizBtn, !allLessonsCompleted && styles.finalQuizLocked]}
          onPress={() => allLessonsCompleted && onFinalQuiz()}
          activeOpacity={allLessonsCompleted ? 0.85 : 1}
        >
          <Text style={styles.finalQuizEmoji}>{allLessonsCompleted ? '🎓' : '🔒'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.finalQuizTitle, !allLessonsCompleted && styles.lockedText]}>
              Final Pinyin Quiz
            </Text>
            <Text style={[styles.finalQuizSub, !allLessonsCompleted && styles.lockedText]}>
              {allLessonsCompleted
                ? '20 questions — comprehensive review'
                : 'Complete all 10 lessons to unlock'}
            </Text>
          </View>
          {allLessonsCompleted && <Text style={styles.finalQuizArrow}>→</Text>}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#1a1a2e' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backBtn:     { paddingVertical: 8, paddingRight: 12 },
  backBtnText: { fontSize: 16, fontWeight: '600', color: '#a29bfe' },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },

  content: { padding: 20 },

  // Hero
  heroCard: {
    backgroundColor: '#16213e', borderRadius: 24, padding: 24, alignItems: 'center',
    marginBottom: 28, borderWidth: 1, borderColor: '#54A0FF44',
  },
  heroEmoji: { fontSize: 44, marginBottom: 8 },
  heroTitle: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 8, textAlign: 'center' },
  heroDesc:  { fontSize: 14, color: '#b2bec3', lineHeight: 20, textAlign: 'center', marginBottom: 16 },
  heroStats: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  heroStat:  { alignItems: 'center' },
  heroStatNum:   { fontSize: 20, fontWeight: '900', color: '#54A0FF' },
  heroStatLabel: { fontSize: 11, color: '#636e72', marginTop: 2 },
  heroStatDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.1)' },

  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: '#636e72',
    letterSpacing: 1.5, marginBottom: 12,
  },

  // Lesson cards
  lessonCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#16213e', borderRadius: 16, padding: 16,
    marginBottom: 10, borderWidth: 1.5, borderColor: '#a29bfe22', gap: 12,
  },
  lessonLocked: { borderColor: '#2d3436', opacity: 0.6 },
  lessonLeft:   { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  lessonEmoji:  { fontSize: 28 },
  lessonInfo:   { flex: 1, gap: 2 },
  lessonTitle:  { fontSize: 15, fontWeight: '800', color: '#fff' },
  lessonSubtitle:{ fontSize: 12, color: '#636e72' },
  lessonProgress:{ fontSize: 11, color: '#54A0FF', marginTop: 2 },
  lockHint:     { fontSize: 11, color: '#636e72', marginTop: 2 },
  lockedText:   { color: '#4a4a6a' },
  lessonArrow:  { fontSize: 18, color: '#a29bfe', fontWeight: '700' },

  // Final quiz
  finalQuizBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#16213e', borderRadius: 20, padding: 20,
    marginTop: 16, borderWidth: 2, borderColor: '#FFD70055',
  },
  finalQuizLocked: { borderColor: '#2d3436', opacity: 0.6 },
  finalQuizEmoji:  { fontSize: 32 },
  finalQuizTitle:  { fontSize: 16, fontWeight: '800', color: '#FFD700', marginBottom: 2 },
  finalQuizSub:    { fontSize: 12, color: '#636e72' },
  finalQuizArrow:  { fontSize: 18, color: '#FFD700', fontWeight: '700' },
});
