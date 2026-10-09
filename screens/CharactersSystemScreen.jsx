import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenBackground from '../components/ScreenBackground';
import { CHARACTER_LESSON_PREVIEWS, TOTAL_CHARACTER_LESSONS, hasCharacterLesson } from '../data/characters';
import { DEEP_NAVY, WARM_ORANGE, SLATE_TEAL, WARM_BROWN, CARD_WHITE } from '../constants/colors';

const LESSON_COLORS = [
  '#25306B', '#1467a3', '#37CAE5', '#84A22F', '#F5DB37',
  '#F9C127', '#B63E2C', '#3B2F21', '#de692f', '#296614',
];

export default function CharactersSystemScreen({
  onBack,
  onSelectLesson,
  quizPassedLessons = [],   // [1, 2, ...] completed lesson ids
  learnDone = {},           // { "char_1": true }
}) {
  // Same rule as Pinyin: lesson 1 is open, every later lesson needs the one before it.
  const isLessonUnlocked = (id) => (id === 1 ? true : quizPassedLessons.includes(id - 1));
  const isLessonCompleted = (id) => quizPassedLessons.includes(id);

  return (
    <ScreenBackground levelId="hsk1">
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chinese Characters</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <Text style={styles.heroEmoji}>✍️</Text>
            <Text style={styles.heroTitle}>Build Characters From Strokes</Text>
            <Text style={styles.heroDesc}>
              {TOTAL_CHARACTER_LESSONS} lessons. Each one teaches strokes, writing rules,
              character construction and real words — then checks what stuck.
            </Text>
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNum}>{quizPassedLessons.length}/{TOTAL_CHARACTER_LESSONS}</Text>
                <Text style={styles.heroStatLabel}>Completed</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNum}>5</Text>
                <Text style={styles.heroStatLabel}>Parts / Lesson</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNum}>60%</Text>
                <Text style={styles.heroStatLabel}>Pass to unlock</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionLabel}>LESSONS</Text>

          {CHARACTER_LESSON_PREVIEWS.map(lesson => {
            const authored  = hasCharacterLesson(lesson.id);
            const unlocked  = authored && isLessonUnlocked(lesson.id);
            const completed = isLessonCompleted(lesson.id);
            const started   = Boolean(learnDone[`char_${lesson.id}`]);
            const dotColor  = LESSON_COLORS[(lesson.id - 1) % LESSON_COLORS.length];

            return (
              <TouchableOpacity
                key={lesson.id}
                style={[
                  styles.lessonCard,
                  { borderLeftColor: dotColor, borderLeftWidth: 4 },
                  !unlocked && styles.lessonLocked,
                ]}
                onPress={() => unlocked && onSelectLesson(lesson.id)}
                activeOpacity={unlocked ? 0.8 : 1}
              >
                <View style={styles.lessonLeft}>
                  <View style={[styles.lessonDot, { backgroundColor: unlocked ? dotColor : 'rgba(55,73,80,0.2)' }]}>
                    {completed ? <Text style={styles.lessonDotCheck}>✓</Text>
                      : unlocked ? <Text style={styles.lessonDotNum}>{lesson.id}</Text>
                      : <Text style={styles.lessonDotLock}>🔒</Text>}
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={[styles.lessonTitle, !unlocked && styles.lockedText]}>{lesson.title}</Text>
                    <Text style={[styles.lessonSubtitle, !unlocked && styles.lockedText]}>{lesson.subtitle}</Text>
                    {!authored && (
                      <Text style={styles.lockHint}>Content not available yet</Text>
                    )}
                    {authored && !unlocked && (
                      <Text style={styles.lockHint}>Finish Lesson {lesson.id - 1} to unlock</Text>
                    )}
                    {unlocked && !completed && started && (
                      <Text style={[styles.lessonProgress, { color: dotColor }]}>Learn done — Recall left</Text>
                    )}
                  </View>
                </View>
                {unlocked && (
                  <Text style={[styles.lessonArrow, { color: dotColor }]}>{completed ? '✓' : '→'}</Text>
                )}
              </TouchableOpacity>
            );
          })}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: CARD_WHITE,
    borderBottomWidth: 1, borderBottomColor: 'rgba(155,104,70,0.15)',
  },
  backBtn:     { paddingVertical: 8, paddingRight: 12 },
  backBtnText: { fontSize: 16, fontWeight: '600', color: WARM_BROWN },
  headerTitle: { fontSize: 15, fontWeight: '700', color: DEEP_NAVY },

  content: { padding: 20 },

  heroCard: {
    backgroundColor: CARD_WHITE, borderRadius: 8, padding: 24, alignItems: 'center',
    marginBottom: 28, borderWidth: 1, borderColor: 'rgba(155,104,70,0.20)',
  },
  heroEmoji: { fontSize: 44, marginBottom: 8 },
  heroTitle: { fontSize: 22, fontWeight: '900', color: DEEP_NAVY, marginBottom: 8, textAlign: 'center' },
  heroDesc:  { fontSize: 14, color: SLATE_TEAL, lineHeight: 20, textAlign: 'center', marginBottom: 16 },
  heroStats: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  heroStat:  { alignItems: 'center' },
  heroStatNum:   { fontSize: 20, fontWeight: '900', color: SLATE_TEAL },
  heroStatLabel: { fontSize: 11, color: SLATE_TEAL, marginTop: 2 },
  heroStatDivider: { width: 1, height: 32, backgroundColor: 'rgba(155,104,70,0.20)' },

  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: SLATE_TEAL,
    letterSpacing: 1.5, marginBottom: 12,
    backgroundColor: CARD_WHITE, paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 8, alignSelf: 'flex-start',
  },

  lessonCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: CARD_WHITE, borderRadius: 8, padding: 16,
    marginBottom: 10, borderWidth: 1.5, borderColor: 'rgba(155,104,70,0.15)',
    borderLeftWidth: 4, gap: 12, overflow: 'hidden',
  },
  lessonLocked: { borderColor: 'rgba(155,104,70,0.10)', opacity: 0.6 },
  lessonLeft:   { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  lessonDot: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  lessonDotCheck: { fontSize: 16, fontWeight: '900', color: CARD_WHITE },
  lessonDotNum:   { fontSize: 14, fontWeight: '900', color: CARD_WHITE },
  lessonDotLock:  { fontSize: 14 },
  lessonInfo:     { flex: 1, gap: 2 },
  lessonTitle:    { fontSize: 15, fontWeight: '800', color: DEEP_NAVY },
  lessonSubtitle: { fontSize: 12, color: SLATE_TEAL },
  lessonProgress: { fontSize: 11, marginTop: 2 },
  lockHint:       { fontSize: 11, color: SLATE_TEAL, marginTop: 2 },
  lockedText:     { color: 'rgba(55,73,80,0.45)' },
  lessonArrow:    { fontSize: 18, fontWeight: '700' },
});
