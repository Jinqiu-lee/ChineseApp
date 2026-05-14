import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import VocabularySection from '../components/VocabularySection';
import DialogueSection from '../components/DialogueSection';
import GrammarSection from '../components/GrammarSection';
import AvatarCharacter from '../components/AvatarCharacter';
import { getAvatarForLesson } from '../config/lessonAvatarMap';
import WaveBackground from '../components/WaveBackground';
import ScreenBackground from '../components/ScreenBackground';
import { LEVEL_SCREEN_PALETTES } from '../config/vanGoghTheme';
import { DEEP_NAVY, WARM_ORANGE, SLATE_TEAL, WARM_BROWN, SOFT_SALMON, CARD_WHITE, TEXT_LIGHT, MUTED_LIGHT, SUCCESS, ERROR } from '../constants/colors';
import { stopAudio } from '../utils/tts';
import SentencesSection from '../components/SentencesSection';

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

import hsk6lesson1  from '../data/hsk6/hsk6_lesson_1.json';
import hsk6lesson2  from '../data/hsk6/hsk6_lesson_2.json';
import hsk6lesson3  from '../data/hsk6/hsk6_lesson_3.json';
import hsk6lesson4  from '../data/hsk6/hsk6_lesson_4.json';
import hsk6lesson5  from '../data/hsk6/hsk6_lesson_5.json';
import hsk6lesson6  from '../data/hsk6/hsk6_lesson_6.json';
import hsk6lesson7  from '../data/hsk6/hsk6_lesson_7.json';
import hsk6lesson8  from '../data/hsk6/hsk6_lesson_8.json';
import hsk6lesson9  from '../data/hsk6/hsk6_lesson_9.json';
import hsk6lesson10 from '../data/hsk6/hsk6_lesson_10.json';
import hsk6lesson11 from '../data/hsk6/hsk6_lesson_11.json';
import hsk6lesson12 from '../data/hsk6/hsk6_lesson_12.json';
import hsk6lesson13 from '../data/hsk6/hsk6_lesson_13.json';
import hsk6lesson14 from '../data/hsk6/hsk6_lesson_14.json';

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
  hsk6: {
    1: hsk6lesson1, 2: hsk6lesson2, 3: hsk6lesson3, 4: hsk6lesson4, 5: hsk6lesson5,
    6: hsk6lesson6, 7: hsk6lesson7, 8: hsk6lesson8, 9: hsk6lesson9, 10: hsk6lesson10,
    11: hsk6lesson11, 12: hsk6lesson12, 13: hsk6lesson13, 14: hsk6lesson14,
  },
};

// Fallback for callers that don't pass levelId
const LESSONS = LESSONS_BY_LEVEL.hsk1;

const STAGE_META = [
  { name: 'First Look',      desc: 'Flashcards · Audio · Match',    icon: '👁',  color: '#5E789F' },
  { name: 'Listen & Choose', desc: 'Audio quiz · Fill in the blank', icon: '🎧', color: '#38529D' },
  { name: 'Build Sentences', desc: 'Arrange words · Fill blanks',    icon: '🧩', color: '#25523D' },
  { name: 'Match & Review',  desc: 'Matching pairs · Audio recall',  icon: '🔄', color: '#b87243' },
  { name: 'Final Challenge', desc: 'All types · Full review',        icon: '🏆', color: WARM_ORANGE },
];

const ROUND_INFO = {
  1: { label: 'Round 1', sub: 'Learn',    color: WARM_BROWN },
  2: { label: 'Round 2', sub: 'Practice', color: WARM_ORANGE },
  3: { label: 'Round 3', sub: 'Master',   color: WARM_ORANGE },
};

export default function LessonDetailScreen({
  lessonId,
  levelId = 'hsk1',
  stageProgress = [],
  currentRound = 1,
  quizUnlocked = false,
  devUnlockAll = false,
  r2Done = false,
  lessonQuizPassed = false,
  lessonCompleted = false,
  round1Done = false,
  sectionDone = {},
  initialTab = 'learning',
  initialOpenSection = null,
  onSectionComplete,
  onBack,
  onLessonComplete,
  onTakeQuiz,
  onOpenPinyin,
  onSelectStage,
}) {
  const T = LEVEL_SCREEN_PALETTES[levelId] || LEVEL_SCREEN_PALETTES.hsk1;
  const levelMap = LESSONS_BY_LEVEL[levelId] || LESSONS;
  const lesson = levelMap[lessonId];
  const avatarId = lesson ? getAvatarForLesson(levelId, lesson.lesson, lesson.topic, lesson.topic_chinese) : 'eileen';
  const [openSection, setOpenSection] = useState(initialOpenSection || null); // 'words' | 'sentences' | 'grammar' | 'dialogue' | null
  const [activeTab, setActiveTab] = useState(initialTab);
  const [toast, setToast] = useState(null);
  const [highlightPhase2, setHighlightPhase2] = useState(false);

  // Refs: scroll target + one-shot nav guards (initialized to skip if already satisfied)
  const scrollRef      = useRef(null);
  const dialogueCardY  = useRef(0);
  const phase1NavDone  = useRef(!!(sectionDone?.newwords && sectionDone?.sentences && sectionDone?.grammar));
  const stage12NavDone = useRef(stageProgress.includes(0) && stageProgress.includes(1));

  // Stop any playing audio when this screen unmounts
  useEffect(() => { return () => { stopAudio(); }; }, []);

  // Auto-navigate to Practice when all Phase 1 sections (New Words, Grammar, Sentences) are visited
  useEffect(() => {
    if (phase1NavDone.current) return;
    if (!(sectionDone?.newwords && sectionDone?.sentences && sectionDone?.grammar)) return;
    if (sectionDone?.dialogue || sectionDone?.culture) return; // already reached Phase 2
    phase1NavDone.current = true;
    const t1 = setTimeout(() => {
      setToast("Great job! Time to practice what you've learned 🎯");
      switchTab('practice');
    }, 800);
    const t2 = setTimeout(() => setToast(null), 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [sectionDone?.newwords, sectionDone?.sentences, sectionDone?.grammar]);

  // Auto-navigate back to Learning (Phase 2) after completing Round 1 Stages 1 & 2
  useEffect(() => {
    if (stage12NavDone.current) return;
    if (currentRound !== 1) return;
    if (!stageProgress.includes(0) || !stageProgress.includes(1)) return;
    if (sectionDone?.dialogue || sectionDone?.culture) return; // Phase 2 already visited
    stage12NavDone.current = true;
    const t1 = setTimeout(() => {
      setToast("Now explore Dialogue and Idioms & Culture 📖");
      switchTab('learning');
      setHighlightPhase2(true);
      setTimeout(() => {
        if (scrollRef.current && dialogueCardY.current > 0) {
          scrollRef.current.scrollTo({ y: dialogueCardY.current - 20, animated: true });
        }
      }, 300);
    }, 800);
    const t2 = setTimeout(() => setToast(null), 3800);
    const t3 = setTimeout(() => setHighlightPhase2(false), 4300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [stageProgress, currentRound]);

  const toggleSection = (key) => { stopAudio(); setOpenSection(prev => prev === key ? null : key); };
  const handleToggleSection = (sectionId) => {
    toggleSection(sectionId);
  };
  const handleSectionDone = (sectionKey) => {
    if (onSectionComplete) onSectionComplete(sectionKey);
    setOpenSection(null);
  };
  const switchTab = (tab) => { stopAudio(); setOpenSection(null); setActiveTab(tab); };
  const handleBack = () => {
    stopAudio();
    if (openSection !== null) {
      setOpenSection(null);
    } else {
      onBack();
    }
  };

  if (!lesson) {
    return (
      <ScreenBackground levelId={levelId}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>❌ Lesson {lessonId} not found</Text>
            <TouchableOpacity onPress={handleBack}>
              <Text style={styles.backButtonText}>← Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  const isUnlocked = (i) => {
    if (devUnlockAll) return true;
    if (currentRound === 1) {
      if (i === 0 || i === 1) return !!sectionDone?.newwords;
      return !!(sectionDone?.sentences && sectionDone?.grammar);
    }
    return i === 0 || stageProgress.includes(i - 1);
  };
  const isCompleted = (i) => stageProgress.includes(i);

  const handleStartPractice = () => {
    for (let i = 0; i < 5; i++) {
      if (isUnlocked(i) && !isCompleted(i)) {
        stopAudio();
        onSelectStage(i);
        return;
      }
    }
    switchTab('practice');
  };
  const completedCount = stageProgress.length;

  return (
    <ScreenBackground levelId={levelId}>
      <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={T.statusBar} />
      {T.waveEnabled && <WaveBackground colors={T.waveColors} />}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lesson {lesson.lesson}</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'learning' && styles.tabBtnActive]}
          onPress={() => switchTab('learning')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabBtnText, activeTab === 'learning' && styles.tabBtnTextActive]}>Learning</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'practice' && styles.tabBtnActive]}
          onPress={() => switchTab('practice')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabBtnText, activeTab === 'practice' && styles.tabBtnTextActive]}>Practice</Text>
        </TouchableOpacity>
      </View>

      {/* Toast banner */}
      {toast && (
        <View style={styles.toastBanner}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Title card */}
        <View style={[styles.titleCard, { backgroundColor: T.card, shadowColor: T.shadow }]}>
          <AvatarCharacter avatarId={avatarId} expression="idle" size={88} />
          <Text style={[styles.topicChinese, { color: T.onCard }]}>{lesson.topic_chinese}</Text>
          <Text style={[styles.topicEnglish, { color: T.onCard }]}>{lesson.topic}</Text>
          <Text style={[styles.topicMeta, { color: T.onCardMuted }]}>{lesson.vocabulary?.length || 0} words · {lesson.dialogues?.length || 0} dialogues</Text>
        </View>

        {activeTab === 'learning' && (<>

        {/* 1. New Words */}
        <TouchableOpacity
          style={[styles.stageCard, openSection === 'words' && styles.learnCardActive]}
          onPress={() => handleToggleSection('words')}
          activeOpacity={0.8}
        >
          <View style={[styles.stageIconBubble, { backgroundColor: '#5E789F' }]}>
            <Text style={styles.stageIcon}>📝</Text>
          </View>
          <View style={styles.stageInfo}>
            <Text style={styles.stageName}>New Words</Text>
            <Text style={styles.stageDesc}>Vocabulary · Audio · Pinyin</Text>
          </View>
          <View style={styles.stageStatus}>
            {sectionDone?.newwords ? (
              <Text style={styles.stageDone}>✅</Text>
            ) : (
              <View style={[styles.stageArrow, { backgroundColor: '#5E789F' }]}>
                <Text style={styles.stageArrowText}>{openSection === 'words' ? '↓' : '→'}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        {openSection === 'words' && (
          <View style={styles.expandedSection}>
            <VocabularySection vocabulary={(lesson.vocabulary || []).filter(v => v.part_of_speech !== 'phrase')} showPinyin={lesson.show_pinyin !== false} avatarId={avatarId} />
            {!sectionDone?.newwords && (
              <TouchableOpacity style={styles.sectionDoneBtn} onPress={() => handleSectionDone('newwords')} activeOpacity={0.85}>
                <Text style={styles.sectionDoneBtnText}>✓  I've reviewed New Words</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* 2. Grammar */}
        <TouchableOpacity
          style={[styles.stageCard, openSection === 'grammar' && styles.learnCardActive]}
          onPress={() => handleToggleSection('grammar')}
          activeOpacity={0.8}
        >
          <View style={[styles.stageIconBubble, { backgroundColor: '#38529D' }]}>
            <Text style={styles.stageIcon}>📚</Text>
          </View>
          <View style={styles.stageInfo}>
            <Text style={styles.stageName}>Grammar</Text>
            <Text style={styles.stageDesc}>Patterns · Usage · Examples</Text>
          </View>
          <View style={styles.stageStatus}>
            {sectionDone?.grammar ? (
              <Text style={styles.stageDone}>✅</Text>
            ) : (
              <View style={[styles.stageArrow, { backgroundColor: '#38529D' }]}>
                <Text style={styles.stageArrowText}>{openSection === 'grammar' ? '↓' : '→'}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        {openSection === 'grammar' && (
          <View style={styles.expandedSection}>
            <GrammarSection grammarPoints={lesson.grammar_points} />
            {!sectionDone?.grammar && (
              <TouchableOpacity style={styles.sectionDoneBtn} onPress={() => handleSectionDone('grammar')} activeOpacity={0.85}>
                <Text style={styles.sectionDoneBtnText}>✓  I've reviewed Grammar</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* 3. Sentences */}
        <TouchableOpacity
          style={[styles.stageCard, openSection === 'phrases' && styles.learnCardActive]}
          onPress={() => handleToggleSection('phrases')}
          activeOpacity={0.8}
        >
          <View style={[styles.stageIconBubble, { backgroundColor: '#25523D' }]}>
            <Text style={styles.stageIcon}>✨</Text>
          </View>
          <View style={styles.stageInfo}>
            <Text style={styles.stageName}>Sentences</Text>
            <Text style={styles.stageDesc}>Key phrases · Key sentences</Text>
          </View>
          <View style={styles.stageStatus}>
            {sectionDone?.sentences ? (
              <Text style={styles.stageDone}>✅</Text>
            ) : (
              <View style={[styles.stageArrow, { backgroundColor: '#25523D' }]}>
                <Text style={styles.stageArrowText}>{openSection === 'phrases' ? '↓' : '→'}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        {openSection === 'phrases' && (
          <View style={styles.expandedSection}>
            {lesson.vocabulary?.some(v => v.part_of_speech === 'phrase') && (
              <VocabularySection
                vocabulary={(lesson.vocabulary || []).filter(v => v.part_of_speech === 'phrase')}
                showPinyin={lesson.show_pinyin !== false}
                avatarId={avatarId}
              />
            )}
            {lesson.key_sentences?.length > 0 && (
              <SentencesSection sentences={lesson.key_sentences} avatarId={avatarId} />
            )}
            {!sectionDone?.sentences && (
              <TouchableOpacity style={styles.sectionDoneBtn} onPress={() => handleSectionDone('sentences')} activeOpacity={0.85}>
                <Text style={styles.sectionDoneBtnText}>✓  I've reviewed Sentences</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* 4. Dialogue — Phase 2: locked until Round 1 done */}
        <TouchableOpacity
          onLayout={(e) => { dialogueCardY.current = e.nativeEvent.layout.y; }}
          style={[styles.stageCard, openSection === 'dialogue' && styles.learnCardActive, !round1Done && styles.learnCardLocked, highlightPhase2 && round1Done && styles.learnCardHighlight]}
          onPress={() => {
            if (!round1Done) {
              Alert.alert('Locked', 'Complete Round 1 practice to unlock Dialogue.');
              return;
            }
            handleToggleSection('dialogue');
          }}
          activeOpacity={0.8}
        >
          <View style={[styles.stageIconBubble, { backgroundColor: round1Done ? '#b87243' : 'rgba(55,73,80,0.18)' }]}>
            <Text style={styles.stageIcon}>{round1Done ? '💬' : '🔒'}</Text>
          </View>
          <View style={styles.stageInfo}>
            <Text style={[styles.stageName, !round1Done && styles.textMuted]}>Dialogue</Text>
            <Text style={[styles.stageDesc, !round1Done && styles.textMuted]}>
              {round1Done ? 'Conversations · Roleplay' : 'Complete Round 1 to unlock'}
            </Text>
          </View>
          <View style={styles.stageStatus}>
            {round1Done && (
              <View style={[styles.stageArrow, { backgroundColor: '#b87243' }]}>
                <Text style={styles.stageArrowText}>{openSection === 'dialogue' ? '↓' : '→'}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        {openSection === 'dialogue' && round1Done && (
          <View style={styles.expandedSection}>
            <DialogueSection dialogues={lesson.dialogues || []} lessonNumber={lesson.lesson} levelId={levelId} avatarId={avatarId} />
            {!sectionDone?.dialogue && (
              <TouchableOpacity style={styles.sectionDoneBtn} onPress={() => handleSectionDone('dialogue')} activeOpacity={0.85}>
                <Text style={styles.sectionDoneBtnText}>✓  I've reviewed Dialogue</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* 5. Idioms & Culture / Characters / Pinyin */}
        {levelId === 'hsk1' ? (
          <TouchableOpacity
            style={styles.stageCard}
            onPress={() => { stopAudio(); onOpenPinyin(); }}
            activeOpacity={0.8}
          >
            <View style={[styles.stageIconBubble, { backgroundColor: SLATE_TEAL }]}>
              <Text style={styles.stageIcon}>🎵</Text>
            </View>
            <View style={styles.stageInfo}>
              <Text style={styles.stageName}>Pinyin</Text>
              <Text style={styles.stageDesc}>Tones · Pronunciation · Practice</Text>
            </View>
            <View style={styles.stageStatus}>
              <View style={[styles.stageArrow, { backgroundColor: SLATE_TEAL }]}>
                <Text style={styles.stageArrowText}>→</Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : levelId === 'hsk4' || levelId === 'hsk5' || levelId === 'hsk6' ? (
          <>
            {/* 5. Idioms & Culture — Phase 2: locked until Round 1 done */}
            <TouchableOpacity
              style={[styles.stageCard, openSection === 'culture' && styles.learnCardActive, !round1Done && styles.learnCardLocked, highlightPhase2 && round1Done && styles.learnCardHighlight]}
              onPress={() => {
                if (!round1Done) {
                  Alert.alert('Locked', 'Complete Round 1 practice to unlock Idioms & Culture.');
                  return;
                }
                handleToggleSection('culture');
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.stageIconBubble, { backgroundColor: round1Done ? WARM_ORANGE : 'rgba(55,73,80,0.18)' }]}>
                <Text style={styles.stageIcon}>{round1Done ? '🏮' : '🔒'}</Text>
              </View>
              <View style={styles.stageInfo}>
                <Text style={[styles.stageName, !round1Done && styles.textMuted]}>Idioms & Culture</Text>
                <Text style={[styles.stageDesc, !round1Done && styles.textMuted]}>
                  {round1Done ? 'Idioms · Cultural notes' : 'Complete Round 1 to unlock'}
                </Text>
              </View>
              <View style={styles.stageStatus}>
                {round1Done && (
                  <View style={[styles.stageArrow, { backgroundColor: WARM_ORANGE }]}>
                    <Text style={styles.stageArrowText}>{openSection === 'culture' ? '↓' : '→'}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
            {openSection === 'culture' && round1Done && (
              <View style={styles.expandedSection}>
                {(lesson.culture_notes || []).map((note, noteIdx) => (
                  <View key={note.id ?? noteIdx} style={styles.cultureCard}>
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
                {!sectionDone?.culture && (
                  <TouchableOpacity style={styles.sectionDoneBtn} onPress={() => handleSectionDone('culture')} activeOpacity={0.85}>
                    <Text style={styles.sectionDoneBtnText}>✓  I've reviewed Idioms & Culture</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        ) : (
          <TouchableOpacity
            style={styles.stageCard}
            onPress={() => Alert.alert('Chinese Characters', 'Chinese Characters learning module coming soon! ✍️')}
            activeOpacity={0.8}
          >
            <View style={[styles.stageIconBubble, { backgroundColor: WARM_BROWN }]}>
              <Text style={styles.stageIcon}>✍️</Text>
            </View>
            <View style={styles.stageInfo}>
              <Text style={styles.stageName}>Characters</Text>
              <Text style={styles.stageDesc}>Stroke order · Writing · Recognition</Text>
            </View>
            <View style={styles.stageStatus}>
              <View style={[styles.stageArrow, { backgroundColor: WARM_BROWN }]}>
                <Text style={styles.stageArrowText}>→</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Start Practice button — jumps to first unlocked incomplete stage */}
        <TouchableOpacity
          style={styles.startPracticeBtn}
          onPress={handleStartPractice}
          activeOpacity={0.85}
        >
          <Text style={styles.startPracticeBtnText}>🎯 Start Practice</Text>
          <Text style={styles.startPracticeBtnSub}>Jump to Practice Stages →</Text>
        </TouchableOpacity>
        </>)}

        {activeTab === 'practice' && (<>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionDot, { backgroundColor: T.success }]} />
          <Text style={[styles.sectionTitle, { color: T.onBg }]}>Practice Stages</Text>
          <Text style={[styles.stageCount, { color: T.onBgMuted }]}>{completedCount}/5 done</Text>
        </View>

        {/* Round badge */}
        {(() => {
          const r = ROUND_INFO[currentRound] || ROUND_INFO[1];
          return (
            <View style={[styles.roundBadge, { borderColor: r.color, backgroundColor: CARD_WHITE }]}>
              <View style={[styles.roundDot, { backgroundColor: r.color }]} />
              <Text style={[styles.roundBadgeText, { color: r.color }]}>{r.label} · {r.sub}</Text>
              <View style={styles.roundDots}>
                {[1, 2, 3].map(n => (
                  <View key={n} style={[styles.roundPip, { backgroundColor: n <= currentRound ? r.color : SLATE_TEAL }]} />
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
              onPress={() => unlocked && (stopAudio(), onSelectStage(i))}
              activeOpacity={unlocked ? 0.8 : 1}
            >
              {/* Left: icon bubble */}
              <View style={[
                styles.stageIconBubble,
                { backgroundColor: unlocked ? stage.color : 'rgba(55,73,80,0.18)' },
              ]}>
                <Text style={styles.stageIcon}>{unlocked ? stage.icon : '🔒'}</Text>
              </View>

              {/* Middle: name + desc */}
              <View style={styles.stageInfo}>
                <Text style={[styles.stageName, !unlocked && styles.textMuted]}>
                  Stage {i + 1}: {stage.name}
                </Text>
                <Text style={[styles.stageDesc, !unlocked && styles.textMuted]}>
                  {!unlocked && currentRound === 1
                    ? (i < 2 ? 'Complete New Words to unlock' : 'Complete Grammar & Sentences to unlock')
                    : stage.desc}
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
          <View style={[styles.sectionDot, { backgroundColor: T.error }]} />
          <Text style={[styles.sectionTitle, { color: T.onBg }]}>Lesson Quiz</Text>
        </View>
        <TouchableOpacity
          style={[styles.quizBanner, quizUnlocked ? styles.quizBannerUnlocked : styles.quizBannerLocked]}
          onPress={quizUnlocked ? () => { stopAudio(); onTakeQuiz(); } : undefined}
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
        {lessonCompleted ? (
          <View style={[styles.completeBtn, styles.completeBtnDone]}>
            <Text style={styles.completeBtnDoneText}>✓ Lesson Completed</Text>
          </View>
        ) : (r2Done && lessonQuizPassed) ? (
          <TouchableOpacity
            style={[styles.completeBtn, { backgroundColor: T.accent }]}
            onPress={() => { stopAudio(); onLessonComplete(lessonId); }}
            activeOpacity={0.85}
          >
            <Text style={[styles.completeBtnText, { color: T.accentText }]}>✓ Complete Lesson</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.completeBtn, styles.completeBtnLocked]}>
            <Text style={styles.completeBtnLockedText}>✓ Complete Lesson</Text>
            <Text style={styles.completeBtnLockedHint}>
              {!r2Done ? 'Finish both exercise rounds first' : 'Pass the Lesson Quiz to unlock'}
            </Text>
          </View>
        )}

        </>)}
        <View style={{ height: 40 }} />
      </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

// ── Canvas palette — warm painting backgrounds, white cards, dark text ──────────
const VG = {
  bg:          'transparent',
  card:        CARD_WHITE,
  cardHover:   CARD_WHITE,
  cardDark:    'rgba(255,255,255,0.92)',
  onCard:      DEEP_NAVY,
  onCardMid:   WARM_BROWN,
  onCardMuted: WARM_BROWN,
  yellow:      WARM_ORANGE,
  gold:        WARM_BROWN,
  orange:      WARM_ORANGE,
  cream:       DEEP_NAVY,
  creamMid:    SLATE_TEAL,
  creamMuted:  SLATE_TEAL,
  success:     SUCCESS,
  border:      'rgba(155,104,70,0.18)',
  borderMid:   'rgba(155,104,70,0.32)',
  shadow:      'rgba(28,42,68,0.18)',
};

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: 'transparent' },
  scroll:  { flex: 1 },
  content: { padding: 20 },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 13,
    backgroundColor: VG.card,
    borderBottomWidth: 1, borderBottomColor: 'rgba(155,104,70,0.15)',
  },
  backBtn:     { paddingVertical: 8, paddingRight: 12 },
  backBtnText: { fontSize: 16, fontWeight: '600', color: VG.onCardMuted },
  headerTitle: { fontSize: 16, fontWeight: '700', color: VG.onCard },

  // ── Title card — cream warm glow ──────────────────────────────────────────
  titleCard: {
    backgroundColor: VG.card,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(217,140,43,0.2)',
    shadowColor: VG.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
  },
  topicChinese: { fontSize: 36, fontWeight: '900', color: VG.onCard,    marginBottom: 6 },
  topicEnglish: { fontSize: 18, fontWeight: '600', color: VG.orange,    marginBottom: 4 },
  topicMeta:    { fontSize: 13,                    color: VG.onCardMuted },

  // ── Section headers ───────────────────────────────────────────────────────
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 8 },
  sectionDot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: VG.gold },
  sectionTitle:  { fontSize: 18, fontWeight: '800', color: VG.cream, flex: 1 },
  stageCount:    { fontSize: 13, color: VG.creamMuted, fontWeight: '600' },

  // ── Tab bar ───────────────────────────────────────────────────────────────
  tabBar: {
    flexDirection: 'row',
    backgroundColor: VG.card,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(155,104,70,0.15)',
    paddingHorizontal: 20,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: WARM_ORANGE,
  },
  tabBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: VG.onCardMuted,
  },
  tabBtnTextActive: {
    color: WARM_ORANGE,
  },

  // ── Learning 2×2 grid ─────────────────────────────────────────────────────
  learnGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  learnBtn: {
    width: '48%',
    backgroundColor: VG.card,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(217,140,43,0.2)',
    gap: 6,
    shadowColor: VG.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  learnBtnActive:     { borderColor: VG.gold,   backgroundColor: VG.cardHover },
  learnBtnPinyin:     { borderColor: SLATE_TEAL, backgroundColor: 'rgba(55,73,80,0.14)' },
  learnBtnCharacters: { borderColor: VG.gold,   backgroundColor: VG.card },
  learnBtnCulture:    { borderColor: VG.orange, backgroundColor: VG.card },
  learnBtnPhrase:     { width: '48%', borderColor: SLATE_TEAL, backgroundColor: VG.card },
  learnBtnVideo:      { borderColor: '#7B5EA7', backgroundColor: VG.card },
  learnBtnLabelVideo: { color: '#7B5EA7' },
  learnBtnEmoji:      { fontSize: 24 },
  learnBtnLabel:      { fontSize: 14, fontWeight: '700', color: VG.onCardMid,   textAlign: 'center' },
  learnBtnLabelActive:     { color: VG.orange },
  learnBtnLabelPinyin:     { color: SLATE_TEAL },
  learnBtnLabelCharacters: { color: VG.orange },

  // ── Learn card active / locked / highlight states ────────────────────────
  learnCardActive:    { borderColor: VG.orange, borderWidth: 1.5 },
  learnCardLocked:    { opacity: 0.55 },
  learnCardHighlight: {
    borderColor: '#1DD1A1', borderWidth: 2,
    shadowColor: '#1DD1A1', shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },

  // ── Toast banner ──────────────────────────────────────────────────────────
  toastBanner: {
    marginHorizontal: 16, marginTop: 10, marginBottom: -4,
    backgroundColor: WARM_ORANGE, borderRadius: 14,
    paddingHorizontal: 18, paddingVertical: 13,
    alignItems: 'center',
    shadowColor: WARM_ORANGE, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32, shadowRadius: 10, elevation: 6,
  },
  toastText: { fontSize: 14, fontWeight: '700', color: CARD_WHITE, textAlign: 'center', lineHeight: 20 },

  // ── Culture / Idioms ──────────────────────────────────────────────────────
  cultureCard: {
    backgroundColor: VG.card, borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(217,140,43,0.25)',
    padding: 16, marginBottom: 16,
    shadowColor: VG.shadow, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 3,
  },
  cultureTitleChinese: { fontSize: 18, fontWeight: '800', color: VG.orange,     marginBottom: 2 },
  cultureTitle:        { fontSize: 13, fontWeight: '600', color: VG.onCardMid,  marginBottom: 10 },
  cultureContent:      { fontSize: 14,                    color: VG.onCard,      lineHeight: 22 },
  idiomsBlock:    { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(217,140,43,0.2)' },
  idiomsHeading:  { fontSize: 14, fontWeight: '700', color: VG.orange,    marginBottom: 10 },
  idiomRow:       { marginBottom: 10 },
  idiomChinese:   { fontSize: 16, fontWeight: '800', color: VG.onCard,    marginBottom: 2 },
  idiomPinyin:    { fontSize: 12, color: VG.orange, fontStyle: 'italic',  marginBottom: 2 },
  idiomEnglish:   { fontSize: 13,                    color: VG.onCardMid },

  // ── Quiz banner ───────────────────────────────────────────────────────────
  quizBanner: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 16,
    padding: 16, marginBottom: 20, borderWidth: 1.5, gap: 12,
  },
  quizBannerUnlocked: {
    borderColor: VG.orange, backgroundColor: VG.card,
    shadowColor: VG.shadow, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15, shadowRadius: 10, elevation: 4,
  },
  quizBannerLocked:   { borderColor: VG.border, backgroundColor: CARD_WHITE, opacity: 0.65 },
  quizBannerEmoji:    { fontSize: 28 },
  quizBannerTitle:    { fontSize: 15, fontWeight: '700', color: VG.onCard,    marginBottom: 3 },
  quizBannerSub:      { fontSize: 12,                    color: VG.onCardMuted, lineHeight: 17 },
  quizBannerArrow:    { fontSize: 18, fontWeight: '700', color: VG.orange },

  // ── Expanded section ──────────────────────────────────────────────────────
  expandedSection: { marginBottom: 24, marginTop: 4 },
  sectionDoneBtn: {
    marginTop: 16, borderRadius: 14,
    backgroundColor: SLATE_TEAL,
    paddingVertical: 14, alignItems: 'center',
    shadowColor: SLATE_TEAL, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22, shadowRadius: 8, elevation: 4,
  },
  sectionDoneBtnText: { fontSize: 15, fontWeight: '800', color: CARD_WHITE },

  // ── Round badge ───────────────────────────────────────────────────────────
  roundBadge: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 12, gap: 8,
  },
  roundDot:      { width: 8, height: 8, borderRadius: 4 },
  roundBadgeText:{ fontSize: 14, fontWeight: '800', flex: 1 },
  roundDots:     { flexDirection: 'row', gap: 4 },
  roundPip:      { width: 8, height: 8, borderRadius: 4 },

  // ── Stage cards ───────────────────────────────────────────────────────────
  stageCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: VG.card,
    borderRadius: 16, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(217,140,43,0.2)',
    gap: 12,
    shadowColor: VG.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  stageCardLocked: { opacity: 0.65 },
  stageIconBubble: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  stageIcon:       { fontSize: 22 },
  stageInfo:       { flex: 1 },
  stageName:       { fontSize: 15, fontWeight: '700', color: VG.onCard,    marginBottom: 2 },
  stageDesc:       { fontSize: 12,                    color: VG.onCardMuted },
  textMuted:       { color: VG.onCardMuted },
  stageStatus:     { width: 32, alignItems: 'center' },
  stageDone:       { fontSize: 20 },
  stageArrow:      { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stageArrowText:  { fontSize: 14, fontWeight: '900', color: CARD_WHITE },

  // ── Complete button — warm glowing yellow ─────────────────────────────────
  completeBtn: {
    backgroundColor: VG.yellow,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 20, marginBottom: 12,
    shadowColor: VG.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  completeBtnText: { fontSize: 16, fontWeight: '900', color: VG.bg, letterSpacing: 0.5 },

  completeBtnDone: {
    backgroundColor: SUCCESS,
    shadowOpacity: 0.18,
  },
  completeBtnDoneText: { fontSize: 16, fontWeight: '900', color: CARD_WHITE, letterSpacing: 0.5 },

  completeBtnLocked: {
    backgroundColor: 'rgba(155,104,70,0.18)',
    shadowOpacity: 0,
    elevation: 0,
  },
  completeBtnLockedText: { fontSize: 16, fontWeight: '900', color: 'rgba(55,73,80,0.45)', letterSpacing: 0.5 },
  completeBtnLockedHint: { fontSize: 12, color: 'rgba(55,73,80,0.45)', marginTop: 4 },

  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  errorText:      { fontSize: 20, fontWeight: '700', color: ERROR, marginBottom: 16 },
  backButtonText: { fontSize: 16, fontWeight: '600', color: VG.gold },

  startPracticeBtn: {
    backgroundColor: SLATE_TEAL, borderRadius: 18, padding: 20,
    alignItems: 'center', marginTop: 20,
    shadowColor: SLATE_TEAL, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 5,
  },
  startPracticeBtnText: { fontSize: 17, fontWeight: '800', color: CARD_WHITE },
  startPracticeBtnSub:  { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
});
