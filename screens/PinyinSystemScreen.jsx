import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenBackground from '../components/ScreenBackground';
import AvatarCharacter from '../components/AvatarCharacter';
import AVATARS from '../config/avatarConfig';
const SELECTABLE_AVATARS = AVATARS.filter(a =>
  ['eileen','libai','luxun','dante','camus','jane','elena','liucixin'].includes(a.id)
);
import { DEEP_NAVY, WARM_ORANGE, SLATE_TEAL, WARM_BROWN, CARD_WHITE } from '../constants/colors';

// Pinyin quote pool — keyed by avatarId, 7 quotes each (one per day of week).
// Theme: 🏞️ Avenue — flow, rhythm, pronunciation, the path you walk.
const PINYIN_QUOTES = {
  eileen: [
    "Every tone is a feeling. You're learning to feel before you speak.",
    "Pronunciation is the first place where a language truly touches you.",
    "The sounds of Chinese have a rhythm you'll carry long after you've learned them.",
    "There's a music to Pinyin — and once you hear it, you'll always hear it.",
    "A well-spoken syllable is its own kind of elegance.",
    "Language begins in the mouth. You're laying the foundation of everything.",
    "Tones are not rules. They're the color of meaning.",
  ],
  libai: [
    "The path begins with sound! Walk it boldly! 🏞️",
    "Every initial and final is a step on a beautiful road — keep walking! 🎋",
    "Tones are the music of the journey! Play them well! 🎵",
    "Master the sounds and the whole language opens like a great river! 🌊",
    "Pinyin is your map. Once you know it, nothing can get you lost! 🗺️",
    "The longest avenue begins with your first footstep. Take it!",
    "Sound is the soul of Chinese. Let it fill you as you walk! ✨",
  ],
  luxun: [
    "Tones matter. Get them wrong and you say something else entirely. Learn them.",
    "Pinyin is the foundation. You cannot skip the foundation.",
    "The sounds are not decorative. They are the language. Learn them properly.",
    "Others rush past Pinyin. Don't. Every shortcut here costs double later.",
    "Correct pronunciation is a form of respect — for the language and for your listener.",
    "Pronunciation either improves or it fossilizes. Practice now while it's still soft.",
    "This path has no shortcuts. Walk it correctly from the start.",
  ],
  dante: [
    "Every great journey requires a guide. For Chinese, that guide is Pinyin.",
    "You stand at the beginning of the most fundamental path. Walk it with care.",
    "The sounds you learn today are the foundation of every word you will ever speak.",
    "Tones are like levels of meaning — each one ascends to a different truth.",
    "Before one can speak wisely, one must first speak correctly. Begin here.",
    "The path of Pinyin is the path into the very soul of the language.",
    "Master the sounds, and the whole Chinese world opens before you.",
  ],
  camus: [
    "Walk the path for its own sake. The sounds are worth learning just to know them.",
    "There's something honest about Pinyin — it says exactly what it means.",
    "Don't rush the sounds. The path you walk is the practice itself.",
    "Tones feel arbitrary now. Soon they'll feel obvious. That's the absurd miracle of learning.",
    "One syllable at a time. That's all any walk requires.",
    "The avenue doesn't care where you're going. It only asks that you keep moving.",
    "Flow, rhythm, the path you walk — there is real joy in this, if you let there be.",
  ],
  jane: [
    "One cannot overstate the importance of speaking clearly. Pinyin teaches exactly that.",
    "Correct tones, like correct manners, open every door. This is most worth learning.",
    "A well-pronounced syllable is its own kind of accomplishment. Pursue it!",
    "Pinyin, like any fine system, rewards those who take the time to learn it properly.",
    "How delightful that Chinese has such an elegant system for pronunciation! Let's master it.",
    "One treads this avenue with care and attention — and arrives with excellent diction.",
    "Pronunciation is the first impression one makes with a language. Make it a good one.",
  ],
  elena: [
    "Learning the sounds of a language is learning a new way your mouth can feel.",
    "Pinyin is the beginning of belonging to a language. Start here, honestly.",
    "Every tone you practice is a small act of commitment to this path.",
    "The sounds change you subtly — you won't notice until one day you're simply speaking.",
    "Walking this path is its own kind of intimacy. You and the language, finding each other.",
    "There's something vulnerable about making new sounds. Do it anyway.",
    "The path you walk in Pinyin is the path you'll walk in everything. Take it seriously.",
  ],
  liucixin: [
    "Pinyin is the phonetic encoding of Mandarin. Master the system before the symbols.",
    "21 initials. 38 finals. 4 tones. The architecture is elegant. Learn it completely.",
    "Pronunciation accuracy in early learning reduces error accumulation over time. Do it correctly now.",
    "Tones are frequency modulation. Your brain will learn to detect them — but only if you practice.",
    "Pinyin is an algorithm: given correct inputs, the output is always intelligible speech.",
    "Every syllable in Chinese is precisely defined by Pinyin. This system is your foundation.",
    "The path of sound is the most fundamental path. Walk it with precision.",
  ],
};

const LESSON_COLORS = [
  '#25306B', // 1 Deep Night Blue
  '#1467a3', // 2 Ocean Blue
  '#37CAE5', // 3 Vibrant Sky Blue
  '#84A22F', // 4 Olive Green
  '#F5DB37', // 5 Cadmium Yellow
  '#F9C127', // 6 Golden Ochre
  '#B63E2C', // 7 Earth Red/Sienna
  '#3B2F21', // 8 Dark Earth Brown
  '#de692f', // 9 Burnt Orange
  '#296614', // 10 Deep Forest Green
];

const LESSON_PREVIEWS = [
  { id: 1, title: 'Finals & The Four Tones', subtitle: 'a o e i u ü · b p m f d t n l' },
  { id: 2, title: 'Compound Finals & New Initials', subtitle: 'ai ei ui ao ou iu · g k h j q x' },
  { id: 3, title: 'Finals ie üe er · Retroflex', subtitle: 'ie üe er · zh ch sh r' },
  { id: 4, title: 'Nasal Finals (-n) & z c s', subtitle: 'an en in un ün · z c s' },
  { id: 5, title: 'Nasal Finals (-ng) & y/w', subtitle: 'ang eng ing ong · y w' },
  { id: 6, title: 'Medial Phonics & j/q/x Rules', subtitle: 'ia iao ian iang · ua uo uan' },
  { id: 7, title: 'Whole-Syllable Pinyin', subtitle: 'zhi chi shi ri · zi ci si · yi wu yu' },
  { id: 8, title: 'Tone Sandhi: 一 and 不', subtitle: 'yī changes tone · bù becomes bú' },
  { id: 9, title: 'Neutral Tone & Erhua', subtitle: '轻声 neutral tone · 儿化 er suffix' },
  { id: 10, title: 'Comprehensive Review', subtitle: 'All finals · All initials · All rules' },
];

export default function PinyinSystemScreen({ onBack, onSelectLesson, onFinalQuiz, quizPassedLessons = [], pinyinStageProgress = {} }) {
  const [avatarId, setAvatarId] = useState('eileen');

  useEffect(() => {
    AsyncStorage.getItem('avatarId').then(val => { if (val) setAvatarId(val); }).catch(() => {});
  }, []);

  const handleSelectAvatar = (id) => {
    setAvatarId(id);
    AsyncStorage.setItem('avatarId', id).catch(() => {});
  };

  const todayQuote = (() => {
    const day = new Date().getDay();
    const pool = PINYIN_QUOTES[avatarId] || PINYIN_QUOTES.eileen;
    return pool[day];
  })();

  const selectedAvatarData = AVATARS.find(a => a.id === avatarId) || AVATARS[0];

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
    <ScreenBackground levelId="pinyin">
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />

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

            {/* Original 8 avatars — tap to choose your guide */}
            <Text style={styles.avatarGridLabel}>Choose your guide</Text>
            <View style={styles.avatarGrid}>
              {SELECTABLE_AVATARS.map(av => (
                <TouchableOpacity
                  key={av.id}
                  style={[styles.avatarGridItem, av.id === avatarId && styles.avatarGridItemSelected]}
                  onPress={() => handleSelectAvatar(av.id)}
                  activeOpacity={0.8}
                >
                  <AvatarCharacter avatarId={av.id} expression="idle" size={52} />
                  <Text style={[styles.avatarGridName, av.id === avatarId && styles.avatarGridNameSelected]} numberOfLines={1}>
                    {av.englishName.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Selected avatar quote */}
            <View style={styles.quoteBubble}>
              <Text style={styles.quoteAvatar}>— {selectedAvatarData.englishName}</Text>
              <Text style={styles.quoteText}>"{todayQuote}"</Text>
            </View>

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
            const dotColor  = LESSON_COLORS[lesson.id - 1];

            return (
              <TouchableOpacity
                key={lesson.id}
                style={[styles.lessonCard, { borderLeftColor: dotColor, borderLeftWidth: 4 }, !unlocked && styles.lessonLocked]}
                onPress={() => unlocked && onSelectLesson(lesson.id)}
                activeOpacity={unlocked ? 0.8 : 1}
              >
                <View style={styles.lessonLeft}>
                  {/* Colored solid circle */}
                  <View style={[styles.lessonDot, { backgroundColor: unlocked ? dotColor : 'rgba(55,73,80,0.2)' }]}>
                    {completed && <Text style={styles.lessonDotCheck}>✓</Text>}
                    {!completed && unlocked && (
                      <Text style={styles.lessonDotNum}>{lesson.id}</Text>
                    )}
                    {!unlocked && <Text style={styles.lessonDotLock}>🔒</Text>}
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={[styles.lessonTitle, !unlocked && styles.lockedText]}>
                      {lesson.title}
                    </Text>
                    <Text style={[styles.lessonSubtitle, !unlocked && styles.lockedText]}>
                      {lesson.subtitle}
                    </Text>
                    {unlocked && !completed && stages > 0 && (
                      <Text style={[styles.lessonProgress, { color: dotColor }]}>{stages}/3 stages done</Text>
                    )}
                    {!unlocked && (
                      <Text style={styles.lockHint}>Pass Lesson {lesson.id - 1} quiz to unlock</Text>
                    )}
                  </View>
                </View>
                {unlocked && (
                  <Text style={[styles.lessonArrow, { color: dotColor }]}>{completed ? '✓' : '→'}</Text>
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
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: 'transparent' },

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

  // Hero
  heroCard: {
    backgroundColor: CARD_WHITE, borderRadius: 24, padding: 24, alignItems: 'center',
    marginBottom: 28, borderWidth: 1, borderColor: 'rgba(155,104,70,0.20)',
  },
  heroEmoji: { fontSize: 44, marginBottom: 8 },
  heroTitle: { fontSize: 22, fontWeight: '900', color: DEEP_NAVY, marginBottom: 8, textAlign: 'center' },
  heroDesc:  { fontSize: 14, color: SLATE_TEAL, lineHeight: 20, textAlign: 'center', marginBottom: 16 },

  // Avatar grid
  avatarGridLabel: { fontSize: 11, fontWeight: '700', color: SLATE_TEAL, letterSpacing: 1, marginBottom: 10, alignSelf: 'flex-start' },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16, width: '100%', justifyContent: 'center' },
  avatarGridItem: {
    alignItems: 'center', width: 68,
    backgroundColor: CARD_WHITE, borderRadius: 14, paddingVertical: 8, paddingHorizontal: 4,
    borderWidth: 1.5, borderColor: 'rgba(155,104,70,0.15)',
  },
  avatarGridItemSelected: {
    borderColor: WARM_ORANGE, borderWidth: 2,
    backgroundColor: '#FFF8ED',
  },
  avatarGridName: { fontSize: 10, color: SLATE_TEAL, marginTop: 4, fontWeight: '600', textAlign: 'center' },
  avatarGridNameSelected: { color: WARM_BROWN, fontWeight: '800' },

  // Quote bubble
  quoteBubble: {
    backgroundColor: '#FFF8ED', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: 'rgba(155,104,70,0.18)', width: '100%', marginBottom: 16,
  },
  quoteAvatar: { fontSize: 11, fontWeight: '700', color: WARM_BROWN, marginBottom: 4 },
  quoteText: { fontSize: 13, fontStyle: 'italic', color: DEEP_NAVY, lineHeight: 20 },
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

  // Lesson cards
  lessonCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: CARD_WHITE, borderRadius: 16, padding: 16,
    marginBottom: 10, borderWidth: 1.5, borderColor: 'rgba(155,104,70,0.15)',
    borderLeftWidth: 4, gap: 12, overflow: 'hidden',
  },
  lessonLocked: { borderColor: 'rgba(155,104,70,0.10)', opacity: 0.60 },
  lessonLeft:   { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  lessonDot: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  lessonDotCheck: { fontSize: 16, fontWeight: '900', color: CARD_WHITE },
  lessonDotNum:   { fontSize: 14, fontWeight: '900', color: CARD_WHITE },
  lessonDotLock:  { fontSize: 14 },
  lessonInfo:   { flex: 1, gap: 2 },
  lessonTitle:  { fontSize: 15, fontWeight: '800', color: DEEP_NAVY },
  lessonSubtitle:{ fontSize: 12, color: SLATE_TEAL },
  lessonProgress:{ fontSize: 11, marginTop: 2 },
  lockHint:     { fontSize: 11, color: SLATE_TEAL, marginTop: 2 },
  lockedText:   { color: 'rgba(55,73,80,0.45)' },
  lessonArrow:  { fontSize: 18, fontWeight: '700' },

  // Final quiz
  finalQuizBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: CARD_WHITE, borderRadius: 20, padding: 20,
    marginTop: 16, borderWidth: 2, borderColor: 'rgba(155,104,70,0.35)',
  },
  finalQuizLocked: { borderColor: 'rgba(155,104,70,0.15)', opacity: 0.65 },
  finalQuizEmoji:  { fontSize: 32 },
  finalQuizTitle:  { fontSize: 16, fontWeight: '800', color: WARM_BROWN, marginBottom: 2 },
  finalQuizSub:    { fontSize: 12, color: SLATE_TEAL },
  finalQuizArrow:  { fontSize: 18, color: WARM_BROWN, fontWeight: '700' },
});
