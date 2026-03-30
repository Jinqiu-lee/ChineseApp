import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WaveBackground from '../components/WaveBackground';
import ScreenBackground from '../components/ScreenBackground';
import { LEVEL_SCREEN_PALETTES } from '../config/vanGoghTheme';
import { DEEP_NAVY, WARM_ORANGE, SLATE_TEAL, WARM_BROWN, CARD_WHITE, SUCCESS } from '../constants/colors';

const STAGE_META = [
  { name: 'First Look',      desc: 'Flashcards · Audio · Matching',  icon: '👁',  color: '#5E789F' },
  { name: 'Listen & Choose', desc: 'Audio quiz · Fill in the blank',  icon: '🎧', color: '#38529D' },
  { name: 'Build Sentences', desc: 'Arrange words · Fill blanks',     icon: '🧩', color: '#25523D' },
  { name: 'Match & Review',  desc: 'Matching pairs · Audio recall',   icon: '🔄', color: '#b87243' },
  { name: 'Final Challenge', desc: 'All types · Full review',         icon: '🏆', color: WARM_ORANGE },
];

export default function LessonStagesScreen({ lessonData, stageProgress = [], devUnlockAll = false, onSelectStage, onBack, levelId = 'hsk1' }) {
  const T = LEVEL_SCREEN_PALETTES[levelId] || LEVEL_SCREEN_PALETTES.hsk1;
  const isUnlocked = (i) => devUnlockAll || i === 0 || stageProgress.includes(i - 1);
  const isCompleted = (i) => stageProgress.includes(i);

  return (
    <ScreenBackground levelId={levelId}>
      <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={T.statusBar} />
      {T.waveEnabled && <WaveBackground colors={T.waveColors} />}

      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Practice Stages</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.lessonInfo}>
        <Text style={styles.lessonChinese}>{lessonData?.topic_chinese}</Text>
        <Text style={styles.lessonTopic}>{lessonData?.topic}</Text>
        <Text style={styles.lessonMeta}>5 stages · 10 exercises each</Text>
      </View>

      {/* Overall progress dots */}
      <View style={styles.dotsRow}>
        {STAGE_META.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, isCompleted(i) && { backgroundColor: T.success }, isUnlocked(i) && !isCompleted(i) && { backgroundColor: SLATE_TEAL }]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {STAGE_META.map((stage, i) => {
          const unlocked = isUnlocked(i);
          const completed = isCompleted(i);

          return (
            <TouchableOpacity
              key={i}
              style={[styles.card, { backgroundColor: T.card, borderColor: T.cardBorder }, !unlocked && styles.cardLocked]}
              onPress={() => unlocked && onSelectStage(i)}
              activeOpacity={unlocked ? 0.8 : 1}
            >
              <View style={[
                styles.iconBubble,
                { backgroundColor: unlocked ? stage.color : 'rgba(55,73,80,0.18)' },
              ]}>
                <Text style={styles.stageIcon}>{unlocked ? stage.icon : '🔒'}</Text>
              </View>

              <View style={styles.cardInfo}>
                <Text style={[styles.stageName, !unlocked && styles.stageNameLocked]}>
                  Stage {i + 1}: {stage.name}
                </Text>
                <Text style={styles.stageDesc}>
                  {stage.desc}
                </Text>
              </View>

              <View style={styles.statusCol}>
                {completed ? (
                  <Text style={styles.checkmark}>✅</Text>
                ) : unlocked ? (
                  <View style={[styles.startBadge, { backgroundColor: T.accent }]}>
                    <Text style={[styles.startArrow, { color: T.accentText }]}>→</Text>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 32 }} />
      </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const VG = {
  bg: 'transparent', card: CARD_WHITE,
  cream: DEEP_NAVY, creamMid: SLATE_TEAL, creamMuted: SLATE_TEAL,
  gold: WARM_BROWN, yellow: WARM_ORANGE,
  success: SUCCESS,
  border: 'rgba(155,104,70,0.18)', borderMid: 'rgba(155,104,70,0.32)',
};

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: 'transparent' },
  header:      {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 13,
    backgroundColor: CARD_WHITE,
    borderBottomWidth: 1, borderBottomColor: 'rgba(155,104,70,0.15)',
  },
  backBtn:     { paddingVertical: 8, paddingRight: 12 },
  backText:    { fontSize: 16, fontWeight: '600', color: WARM_BROWN },
  headerTitle: { fontSize: 16, fontWeight: '700', color: DEEP_NAVY },

  lessonInfo:    { alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, backgroundColor: CARD_WHITE },
  lessonChinese: { fontSize: 36, fontWeight: '900', color: DEEP_NAVY, marginBottom: 4 },
  lessonTopic:   { fontSize: 16, color: WARM_BROWN, marginBottom: 4 },
  lessonMeta:    { fontSize: 13, color: SLATE_TEAL },

  dotsRow:    { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 0, paddingVertical: 10, paddingBottom: 16, backgroundColor: CARD_WHITE, borderBottomWidth: 1, borderBottomColor: 'rgba(155,104,70,0.15)' },
  dot:        { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(55,73,80,0.28)' },
  dotUnlocked:{ backgroundColor: VG.creamMuted },
  dotDone:    { backgroundColor: VG.success },

  scroll: { paddingHorizontal: 20 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: VG.card, borderRadius: 18,
    padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: VG.border, gap: 14,
  },
  cardLocked:  { opacity: 0.65 },
  iconBubble:  { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  stageIcon:   { fontSize: 26 },
  cardInfo:    { flex: 1 },
  stageName:        { fontSize: 16, fontWeight: '700', color: DEEP_NAVY, marginBottom: 3 },
  stageNameLocked:  { color: SLATE_TEAL },
  stageDesc:        { fontSize: 13, color: SLATE_TEAL },
  textMuted:        { color: SLATE_TEAL },
  statusCol:   { width: 36, alignItems: 'center' },
  checkmark:   { fontSize: 22 },
  startBadge:  { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  startArrow:  { fontSize: 16, fontWeight: '900', color: VG.bg },
});
