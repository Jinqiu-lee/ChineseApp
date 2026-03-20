import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Alert } from 'react-native';
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
import hsk2lesson1 from '../data/hsk2/hsk2_lesson_1.json';
import hsk2lesson2 from '../data/hsk2/hsk2_lesson_2.json';
import hsk2lesson3 from '../data/hsk2/hsk2_lesson_3.json';
import hsk2lesson4 from '../data/hsk2/hsk2_lesson_4.json';
import hsk2lesson5 from '../data/hsk2/hsk2_lesson_5.json';
import hsk2lesson6 from '../data/hsk2/hsk2_lesson_6.json';
import hsk2lesson7 from '../data/hsk2/hsk2_lesson_7.json';
import hsk2lesson8 from '../data/hsk2/hsk2_lesson_8.json';
import hsk2lesson9 from '../data/hsk2/hsk2_lesson_9.json';
import hsk2lesson10 from '../data/hsk2/hsk2_lesson_10.json';
import hsk2lesson11 from '../data/hsk2/hsk2_lesson_11.json';
import hsk2lesson12 from '../data/hsk2/hsk2_lesson_12.json';
import hsk2lesson13 from '../data/hsk2/hsk2_lesson_13.json';
import hsk2lesson14 from '../data/hsk2/hsk2_lesson_14.json';
import hsk2lesson15 from '../data/hsk2/hsk2_lesson_15.json';
import hsk3lesson1 from '../data/hsk3/hsk3_lesson_1.json';
import hsk3lesson2 from '../data/hsk3/hsk3_lesson_2.json';
import hsk3lesson3 from '../data/hsk3/hsk3_lesson_3.json';
import hsk3lesson4 from '../data/hsk3/hsk3_lesson_4.json';
import hsk3lesson5 from '../data/hsk3/hsk3_lesson_5.json';
import hsk3lesson6 from '../data/hsk3/hsk3_lesson_6.json';
import hsk3lesson7 from '../data/hsk3/hsk3_lesson_7.json';
import hsk3lesson8 from '../data/hsk3/hsk3_lesson_8.json';
import hsk3lesson9 from '../data/hsk3/hsk3_lesson_9.json';
import hsk3lesson10 from '../data/hsk3/hsk3_lesson_10.json';
import hsk3lesson11 from '../data/hsk3/hsk3_lesson_11.json';
import hsk3lesson12 from '../data/hsk3/hsk3_lesson_12.json';
import hsk3lesson13 from '../data/hsk3/hsk3_lesson_13.json';
import hsk3lesson14 from '../data/hsk3/hsk3_lesson_14.json';
import hsk3lesson15 from '../data/hsk3/hsk3_lesson_15.json';
import hsk4lesson1  from '../data/hsk4_level4/hsk4_lesson_1.json';
import hsk4lesson2  from '../data/hsk4_level4/hsk4_lesson_2.json';
import hsk4lesson3  from '../data/hsk4_level4/hsk4_lesson_3.json';
import hsk4lesson4  from '../data/hsk4_level4/hsk4_lesson_4.json';
import hsk4lesson5  from '../data/hsk4_level4/hsk4_lesson_5.json';
import hsk4lesson6  from '../data/hsk4_level4/hsk4_lesson_6.json';
import hsk4lesson7  from '../data/hsk4_level4/hsk4_lesson_7.json';
import hsk4lesson8  from '../data/hsk4_level4/hsk4_lesson_8.json';
import hsk4lesson9  from '../data/hsk4_level4/hsk4_lesson_9.json';
import hsk4lesson10 from '../data/hsk4_level4/hsk4_lesson_10.json';
import hsk4lesson11 from '../data/hsk4_level4/hsk4_lesson_11.json';
import hsk4lesson12 from '../data/hsk4_level4/hsk4_lesson_12.json';
import hsk4lesson13 from '../data/hsk4_level4/hsk4_lesson_13.json';
import hsk4lesson14 from '../data/hsk4_level4/hsk4_lesson_14.json';
import hsk4lesson15 from '../data/hsk4_level4/hsk4_lesson_15.json';
import hsk5lesson1  from '../data/hsk4_level5/hsk5_lesson_1.json';
import hsk5lesson2  from '../data/hsk4_level5/hsk5_lesson_2.json';
import hsk5lesson3  from '../data/hsk4_level5/hsk5_lesson_3.json';
import hsk5lesson4  from '../data/hsk4_level5/hsk5_lesson_4.json';
import hsk5lesson5  from '../data/hsk4_level5/hsk5_lesson_5.json';
import hsk5lesson6  from '../data/hsk4_level5/hsk5_lesson_6.json';
import hsk5lesson7  from '../data/hsk4_level5/hsk5_lesson_7.json';
import hsk5lesson8  from '../data/hsk4_level5/hsk5_lesson_8.json';
import hsk5lesson9  from '../data/hsk4_level5/hsk5_lesson_9.json';
import hsk5lesson10 from '../data/hsk4_level5/hsk5_lesson_10.json';
import hsk5lesson11 from '../data/hsk4_level5/hsk5_lesson_11.json';
import hsk5lesson12 from '../data/hsk4_level5/hsk5_lesson_12.json';
import hsk5lesson13 from '../data/hsk4_level5/hsk5_lesson_13.json';
import hsk5lesson14 from '../data/hsk4_level5/hsk5_lesson_14.json';
import hsk5lesson15 from '../data/hsk4_level5/hsk5_lesson_15.json';

const LESSONS_BY_LEVEL = {
  hsk1: {
    1: lesson1, 2: lesson2, 3: lesson3, 4: lesson4, 5: lesson5,
    6: lesson6, 7: lesson7, 8: lesson8, 9: lesson9, 10: lesson10,
    11: lesson11, 12: lesson12, 13: lesson13, 14: lesson14, 15: lesson15,
  },
  hsk2: {
    1: hsk2lesson1,
    2: hsk2lesson2,
    3: hsk2lesson3,
    4: hsk2lesson4,
    5: hsk2lesson5,
    6: hsk2lesson6,
    7: hsk2lesson7,
    8: hsk2lesson8,
    9: hsk2lesson9,
    10: hsk2lesson10,
    11: hsk2lesson11,
    12: hsk2lesson12,
    13: hsk2lesson13,
    14: hsk2lesson14,
    15: hsk2lesson15,
  },
  hsk3: {
    1: hsk3lesson1, 2: hsk3lesson2, 3: hsk3lesson3, 4: hsk3lesson4, 5: hsk3lesson5,
    6: hsk3lesson6, 7: hsk3lesson7, 8: hsk3lesson8, 9: hsk3lesson9, 10: hsk3lesson10,
    11: hsk3lesson11, 12: hsk3lesson12, 13: hsk3lesson13, 14: hsk3lesson14, 15: hsk3lesson15,
  },
  hsk4: {
    1: hsk4lesson1, 2: hsk4lesson2, 3: hsk4lesson3, 4: hsk4lesson4, 5: hsk4lesson5,
    6: hsk4lesson6, 7: hsk4lesson7, 8: hsk4lesson8, 9: hsk4lesson9, 10: hsk4lesson10,
    11: hsk4lesson11, 12: hsk4lesson12, 13: hsk4lesson13, 14: hsk4lesson14, 15: hsk4lesson15,
  },
  hsk5: {
    1: hsk5lesson1, 2: hsk5lesson2, 3: hsk5lesson3, 4: hsk5lesson4, 5: hsk5lesson5,
    6: hsk5lesson6, 7: hsk5lesson7, 8: hsk5lesson8, 9: hsk5lesson9, 10: hsk5lesson10,
    11: hsk5lesson11, 12: hsk5lesson12, 13: hsk5lesson13, 14: hsk5lesson14, 15: hsk5lesson15,
  },
};

// Fallback for callers that don't pass levelId
const LESSONS = LESSONS_BY_LEVEL.hsk1;

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
  levelId = 'hsk1',
  stageProgress = [],
  currentRound = 1,
  quizUnlocked = false,
  devUnlockAll = false,
  onBack,
  onLessonComplete,
  onTakeQuiz,
  onOpenPinyin,
  onSelectStage,
}) {
  const levelMap = LESSONS_BY_LEVEL[levelId] || LESSONS;
  const lesson = levelMap[lessonId];
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

  const isUnlocked = (i) => devUnlockAll || i === 0 || stageProgress.includes(i - 1);
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

          {levelId === 'hsk1' ? (
            <TouchableOpacity
              style={[styles.learnBtn, styles.learnBtnPinyin]}
              onPress={onOpenPinyin}
              activeOpacity={0.8}
            >
              <Text style={styles.learnBtnEmoji}>🎵</Text>
              <Text style={[styles.learnBtnLabel, styles.learnBtnLabelPinyin]}>
                Pinyin
              </Text>
            </TouchableOpacity>
          ) : levelId === 'hsk4' || levelId === 'hsk5' ? (
            <TouchableOpacity
              style={[styles.learnBtn, styles.learnBtnCulture]}
              onPress={() => toggleSection('culture')}
              activeOpacity={0.8}
            >
              <Text style={styles.learnBtnEmoji}>🏮</Text>
              <Text style={[styles.learnBtnLabel, openSection === 'culture' && styles.learnBtnLabelActive]}>
                Idioms & Culture
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.learnBtn, styles.learnBtnCharacters]}
              onPress={() => Alert.alert('Chinese Characters', 'Chinese Characters learning module coming soon! ✍️')}
              activeOpacity={0.8}
            >
              <Text style={styles.learnBtnEmoji}>✍️</Text>
              <Text style={[styles.learnBtnLabel, styles.learnBtnLabelCharacters]}>
                Characters
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Expanded learning content */}
        {openSection === 'words' && (
          <View style={styles.expandedSection}>
            <VocabularySection vocabulary={lesson.vocabulary} showPinyin={lesson.show_pinyin !== false} />
          </View>
        )}
        {openSection === 'dialogue' && (
          <View style={styles.expandedSection}>
            <DialogueSection dialogues={lesson.dialogues || []} lessonNumber={lesson.lesson} levelId={levelId} />
          </View>
        )}
        {openSection === 'grammar' && (
          <View style={styles.expandedSection}>
            <GrammarSection grammarPoints={lesson.grammar_points} />
          </View>
        )}
        {openSection === 'culture' && (
          <View style={styles.expandedSection}>
            {(lesson.culture_notes || []).map(note => (
              <View key={note.id} style={styles.cultureCard}>
                <Text style={styles.cultureTitleChinese}>{note.title_chinese}</Text>
                <Text style={styles.cultureTitle}>{note.title}</Text>
                <Text style={styles.cultureContent}>{note.content}</Text>
                {note.idioms?.length > 0 && (
                  <View style={styles.idiomsBlock}>
                    <Text style={styles.idiomsHeading}>📜 Key Idioms</Text>
                    {note.idioms.map((idiom, idx) => (
                      <View key={idx} style={styles.idiomRow}>
                        <Text style={styles.idiomChinese}>{idiom.chinese}</Text>
                        <Text style={styles.idiomPinyin}>{idiom.pinyin}</Text>
                        <Text style={styles.idiomEnglish}>{idiom.english}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
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

        {/* Lesson Quiz — unlocked after Round 2 with ≥90% */}
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionDot, { backgroundColor: '#FF6B6B' }]} />
          <Text style={styles.sectionTitle}>Lesson Quiz</Text>
        </View>
        <TouchableOpacity
          style={[styles.quizBanner, quizUnlocked ? styles.quizBannerUnlocked : styles.quizBannerLocked]}
          onPress={quizUnlocked ? onTakeQuiz : undefined}
          activeOpacity={quizUnlocked ? 0.8 : 1}
        >
          <Text style={styles.quizBannerEmoji}>{quizUnlocked ? '📋' : '🔒'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.quizBannerTitle, !quizUnlocked && styles.textMuted]}>
              {quizUnlocked ? 'Lesson Quiz' : 'Lesson Quiz  (Locked)'}
            </Text>
            <Text style={styles.quizBannerSub}>
              {quizUnlocked
                ? 'Mixed exercises · Audio · Pinyin · Speaking'
                : 'Complete Round 2 with 90%+ accuracy to unlock'}
            </Text>
          </View>
          {quizUnlocked && <Text style={styles.quizBannerArrow}>→</Text>}
        </TouchableOpacity>

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
  learnBtnActive:  { borderColor: '#a29bfe', backgroundColor: 'rgba(162,155,254,0.1)' },
  learnBtnPinyin:      { borderColor: '#54A0FF', backgroundColor: 'rgba(84,160,255,0.08)' },
  learnBtnCharacters:  { borderColor: '#1DD1A1', backgroundColor: 'rgba(29,209,161,0.08)' },
  learnBtnCulture:     { borderColor: '#FF9F43', backgroundColor: 'rgba(255,159,67,0.08)' },
  learnBtnEmoji: { fontSize: 24 },
  learnBtnLabel: { fontSize: 14, fontWeight: '700', color: '#636e72', textAlign: 'center' },
  learnBtnLabelActive:  { color: '#a29bfe' },
  learnBtnLabelPinyin:      { color: '#54A0FF' },
  learnBtnLabelCharacters:  { color: '#1DD1A1' },

  // Culture / Idioms section
  cultureCard: {
    backgroundColor: 'rgba(255,159,67,0.06)', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,159,67,0.25)',
    padding: 16, marginBottom: 16,
  },
  cultureTitleChinese: { fontSize: 18, fontWeight: '800', color: '#FF9F43', marginBottom: 2 },
  cultureTitle:   { fontSize: 13, fontWeight: '600', color: '#b2bec3', marginBottom: 10 },
  cultureContent: { fontSize: 14, color: '#dfe6e9', lineHeight: 22 },
  idiomsBlock:    { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,159,67,0.2)' },
  idiomsHeading:  { fontSize: 14, fontWeight: '700', color: '#FF9F43', marginBottom: 10 },
  idiomRow:       { marginBottom: 10 },
  idiomChinese:   { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 2 },
  idiomPinyin:    { fontSize: 12, color: '#FF9F43', fontStyle: 'italic', marginBottom: 2 },
  idiomEnglish:   { fontSize: 13, color: '#b2bec3' },

  // Quiz banner (below stages)
  quizBanner: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 16,
    padding: 16, marginBottom: 20, borderWidth: 1.5, gap: 12,
  },
  quizBannerUnlocked: { borderColor: '#FF6B6B', backgroundColor: 'rgba(255,107,107,0.08)' },
  quizBannerLocked:   { borderColor: '#2d3436', backgroundColor: 'rgba(255,255,255,0.03)', opacity: 0.6 },
  quizBannerEmoji: { fontSize: 28 },
  quizBannerTitle: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 3 },
  quizBannerSub:   { fontSize: 12, color: '#636e72', lineHeight: 17 },
  quizBannerArrow: { fontSize: 18, color: '#FF6B6B', fontWeight: '700' },

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
