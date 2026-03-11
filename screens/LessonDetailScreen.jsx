import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import VocabularySection from '../components/VocabularySection';
import DialogueSection from '../components/DialogueSection';
import GrammarSection from '../components/GrammarSection';

import lesson1 from '../data/hsk1/hsk1_lesson_1.json';
import lesson2 from '../data/hsk1/hsk1_lesson_2.json';
import lesson3 from '../data/hsk1/hsk1_lesson_3.json';
import lesson4 from '../data/hsk1/hsk1_lesson_4.json';
import lesson5 from '../data/hsk1/hsk1_lesson_5.json';
import lesson6 from '../data/hsk1/hsk1_lesson_6.json';
import lesson7 from '../data/hsk1/hsk1_lesson_7.json';
import lesson8 from '../data/hsk1/hsk1_lesson_8.json';
import lesson9 from '../data/hsk1/hsk1_lesson_9.json';
import lesson10 from '../data/hsk1/hsk1_lesson_10.json';
import lesson11 from '../data/hsk1/hsk1_lesson_11.json';
import lesson12 from '../data/hsk1/hsk1_lesson_12.json';
import lesson13 from '../data/hsk1/hsk1_lesson_13.json';
import lesson14 from '../data/hsk1/hsk1_lesson_14.json';
import lesson15 from '../data/hsk1/hsk1_lesson_15.json';

const LESSONS = {
  1: lesson1, 2: lesson2, 3: lesson3, 4: lesson4, 5: lesson5,
  6: lesson6, 7: lesson7, 8: lesson8, 9: lesson9, 10: lesson10,
  11: lesson11, 12: lesson12, 13: lesson13, 14: lesson14, 15: lesson15,
};

const STAGE_META = [
  { name: 'First Look',      desc: 'Flashcards · Audio · Match',    icon: '👁',  color: '#a29bfe' },
  { name: 'Listen & Choose', desc: 'Audio quiz · Fill in the blank', icon: '🎧', color: '#54A0FF' },
  { name: 'Build Sentences', desc: 'Arrange words · Fill blanks',    icon: '🧩', color: '#1DD1A1' },
  { name: 'Match & Review',  desc: 'Matching pairs · Audio recall',  icon: '🔄', color: '#FF9F43' },
  { name: 'Final Challenge', desc: 'All types · Full review',        icon: '🏆', color: '#FF6B6B' },
];

const ROUND_INFO = {
  1: { label: 'Round 1', sub: 'Learn', color: '#a29bfe' },
  2: { label: 'Round 2', sub: 'Practice', color: '#54A0FF' },
  3: { label: 'Round 3', sub: 'Master', color: '#1DD1A1' },
};

export default function LessonDetailScreen({
  lessonId,
  stageProgress = [],
  currentRound = 1,
  quizUnlocked = false,
  onBack,
  onLessonComplete,
  onTakeQuiz,
  onSelectStage,
}) {
  const lesson = LESSONS[lessonId];
  const [openSection, setOpenSection] = useState(null); // 'words' | 'sentences' | 'grammar' | null

  const toggleSection = (key) => setOpenSection(prev => prev === key ? null : key);

  if (!lesson) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ Lesson {lessonId} not found</Text>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backButtonText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isUnlocked = (i) => i === 0 || stageProgress.includes(i - 1);
  const isCompleted = (i) => stageProgress.includes(i);
  const completedCount = stageProgress.length;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lesson {lesson.lesson}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Title card */}
        <View style={styles.titleCard}>
          <Text style={styles.topicChinese}>{lesson.topic_chinese}</Text>
          <Text style={styles.topicEnglish}>{lesson.topic}</Text>
          <Text style={styles.topicMeta}>{lesson.vocabulary?.length || 0} words · {lesson.dialogues?.length || 0} dialogues</Text>
        </View>

        {/* ─────────────────────────────────────────── */}
        {/* SECTION 1: LEARNING                        */}
        {/* ─────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionDot} />
          <Text style={styles.sectionTitle}>Learning</Text>
        </View>

        <View style={styles.learnGrid}>
          <TouchableOpacity
            style={[styles.learnBtn, openSection === 'words' && styles.learnBtnActive]}
            onPress={() => toggleSection('words')}
            activeOpacity={0.8}
          >
            <Text style={styles.learnBtnEmoji}>📝</Text>
            <Text style={[styles.learnBtnLabel, openSection === 'words' && styles.learnBtnLabelActive]}>
              New Words
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.learnBtn, openSection === 'dialogue' && styles.learnBtnActive]}
            onPress={() => toggleSection('dialogue')}
            activeOpacity={0.8}
          >
            <Text style={styles.learnBtnEmoji}>💬</Text>
            <Text style={[styles.learnBtnLabel, openSection === 'dialogue' && styles.learnBtnLabelActive]}>
              Dialogue
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.learnBtn, openSection === 'grammar' && styles.learnBtnActive]}
            onPress={() => toggleSection('grammar')}
            activeOpacity={0.8}
          >
            <Text style={styles.learnBtnEmoji}>📚</Text>
            <Text style={[styles.learnBtnLabel, openSection === 'grammar' && styles.learnBtnLabelActive]}>
              Grammar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.learnBtn, quizUnlocked ? styles.learnBtnQuiz : styles.learnBtnLocked]}
            onPress={quizUnlocked ? onTakeQuiz : undefined}
            activeOpacity={quizUnlocked ? 0.8 : 1}
          >
            <Text style={styles.learnBtnEmoji}>{quizUnlocked ? '📋' : '🔒'}</Text>
            <Text style={[styles.learnBtnLabel, quizUnlocked ? styles.learnBtnLabelQuiz : styles.learnBtnLabelLocked]}>
              Lesson Quiz
            </Text>
            {!quizUnlocked && (
              <Text style={styles.learnBtnLockHint}>Finish Round 2 (90%+)</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Expanded learning content */}
        {openSection === 'words' && (
          <View style={styles.expandedSection}>
            <VocabularySection vocabulary={lesson.vocabulary} />
          </View>
        )}
        {openSection === 'dialogue' && (
          <View style={styles.expandedSection}>
            <DialogueSection dialogues={lesson.dialogues || []} lessonNumber={lesson.lesson} />
          </View>
        )}
        {openSection === 'grammar' && (
          <View style={styles.expandedSection}>
            <GrammarSection grammarPoints={lesson.grammar_points} />
          </View>
        )}

        {/* ─────────────────────────────────────────── */}
        {/* SECTION 2: PRACTICE STAGES                 */}
        {/* ─────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionDot, { backgroundColor: '#1DD1A1' }]} />
          <Text style={styles.sectionTitle}>Practice Stages</Text>
          <Text style={styles.stageCount}>{completedCount}/5 done</Text>
        </View>

        {/* Round badge */}
        {(() => {
          const r = ROUND_INFO[currentRound] || ROUND_INFO[1];
          return (
            <View style={[styles.roundBadge, { borderColor: `${r.color}55`, backgroundColor: `${r.color}18` }]}>
              <View style={[styles.roundDot, { backgroundColor: r.color }]} />
              <Text style={[styles.roundBadgeText, { color: r.color }]}>{r.label} · {r.sub}</Text>
              <View style={styles.roundDots}>
                {[1, 2, 3].map(n => (
                  <View key={n} style={[styles.roundPip, { backgroundColor: n <= currentRound ? r.color : '#2d3436' }]} />
                ))}
              </View>
            </View>
          );
        })()}

        {STAGE_META.map((stage, i) => {
          const unlocked = isUnlocked(i);
          const completed = isCompleted(i);

          return (
            <TouchableOpacity
              key={i}
              style={[styles.stageCard, !unlocked && styles.stageCardLocked]}
              onPress={() => unlocked && onSelectStage(i)}
              activeOpacity={unlocked ? 0.8 : 1}
            >
              {/* Left: icon bubble */}
              <View style={[
                styles.stageIconBubble,
                { backgroundColor: unlocked ? `${stage.color}22` : 'rgba(255,255,255,0.04)' },
              ]}>
                <Text style={styles.stageIcon}>{unlocked ? stage.icon : '🔒'}</Text>
              </View>

              {/* Middle: name + desc */}
              <View style={styles.stageInfo}>
                <Text style={[styles.stageName, !unlocked && styles.textMuted]}>
                  Stage {i + 1}: {stage.name}
                </Text>
                <Text style={[styles.stageDesc, !unlocked && styles.textMuted]}>
                  {stage.desc}
                </Text>
              </View>

              {/* Right: status */}
              <View style={styles.stageStatus}>
                {completed ? (
                  <Text style={styles.stageDone}>✅</Text>
                ) : unlocked ? (
                  <View style={[styles.stageArrow, { backgroundColor: stage.color }]}>
                    <Text style={styles.stageArrowText}>→</Text>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Complete lesson */}
        <TouchableOpacity
          style={styles.completeBtn}
          onPress={() => onLessonComplete(lessonId)}
          activeOpacity={0.85}
        >
          <Text style={styles.completeBtnText}>✓ Complete Lesson</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a1a2e' },
  scroll: { flex: 1 },
  content: { padding: 20 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: { paddingVertical: 8, paddingRight: 12 },
  backBtnText: { fontSize: 16, fontWeight: '600', color: '#a29bfe' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },

  // Title card
  titleCard: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2d3436',
  },
  topicChinese: { fontSize: 36, fontWeight: '900', color: '#fff', marginBottom: 6 },
  topicEnglish: { fontSize: 18, fontWeight: '600', color: '#a29bfe', marginBottom: 4 },
  topicMeta: { fontSize: 13, color: '#636e72' },

  // Section headers
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 8 },
  sectionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#a29bfe' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', flex: 1 },
  stageCount: { fontSize: 13, color: '#636e72', fontWeight: '600' },

  // Learning 2×2 grid
  learnGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  learnBtn: {
    width: '48%',
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#2d3436',
    gap: 6,
  },
  learnBtnActive: { borderColor: '#a29bfe', backgroundColor: 'rgba(162,155,254,0.1)' },
  learnBtnQuiz:   { borderColor: '#FF6B6B', backgroundColor: 'rgba(255,107,107,0.08)' },
  learnBtnLocked: { borderColor: '#2d3436', backgroundColor: 'rgba(255,255,255,0.03)', opacity: 0.55 },
  learnBtnEmoji: { fontSize: 24 },
  learnBtnLabel: { fontSize: 14, fontWeight: '700', color: '#636e72', textAlign: 'center' },
  learnBtnLabelActive:  { color: '#a29bfe' },
  learnBtnLabelQuiz:    { color: '#FF6B6B' },
  learnBtnLabelLocked:  { color: '#636e72' },
  learnBtnLockHint:     { fontSize: 10, color: '#636e72', textAlign: 'center', marginTop: 2 },

  // Expanded section
  expandedSection: { marginBottom: 24, marginTop: 4 },

  // Round badge
  roundBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  roundDot: { width: 8, height: 8, borderRadius: 4 },
  roundBadgeText: { fontSize: 14, fontWeight: '800', flex: 1 },
  roundDots: { flexDirection: 'row', gap: 4 },
  roundPip: { width: 8, height: 8, borderRadius: 4 },

  // Stage cards
  stageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2d3436',
    gap: 12,
  },
  stageCardLocked: { opacity: 0.4 },
  stageIconBubble: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  stageIcon: { fontSize: 22 },
  stageInfo: { flex: 1 },
  stageName: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 2 },
  stageDesc: { fontSize: 12, color: '#636e72' },
  textMuted: { color: '#636e72' },
  stageStatus: { width: 32, alignItems: 'center' },
  stageDone: { fontSize: 20 },
  stageArrow: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stageArrowText: { fontSize: 14, fontWeight: '900', color: '#fff' },

  // Complete button
  completeBtn: {
    backgroundColor: '#1DD1A1',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  completeBtnText: { fontSize: 16, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },

  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  errorText: { fontSize: 20, fontWeight: '700', color: '#FF6B6B', marginBottom: 16 },
  backButtonText: { fontSize: 16, fontWeight: '600', color: '#a29bfe' },
});
