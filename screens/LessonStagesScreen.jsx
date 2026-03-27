import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WaveBackground from '../components/WaveBackground';
import ScreenBackground from '../components/ScreenBackground';
import { LEVEL_SCREEN_PALETTES } from '../config/vanGoghTheme';

const STAGE_META = [
  { name: 'First Look',      desc: 'Flashcards · Audio · Matching',  icon: '👁',  color: '#E0B04B' },
  { name: 'Listen & Choose', desc: 'Audio quiz · Fill in the blank',  icon: '🎧', color: '#7BA7D4' },
  { name: 'Build Sentences', desc: 'Arrange words · Fill blanks',     icon: '🧩', color: '#8DBF6E' },
  { name: 'Match & Review',  desc: 'Matching pairs · Audio recall',   icon: '🔄', color: '#D98C2B' },
  { name: 'Final Challenge', desc: 'All types · Full review',         icon: '🏆', color: '#F4C542' },
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

      <View style={[styles.header, { borderBottomColor: T.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={[styles.backText, { color: T.gold }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: T.onBg }]}>Practice Stages</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.lessonInfo}>
        <Text style={[styles.lessonChinese, { color: T.onBg }]}>{lessonData?.topic_chinese}</Text>
        <Text style={[styles.lessonTopic, { color: T.gold }]}>{lessonData?.topic}</Text>
        <Text style={[styles.lessonMeta, { color: T.onBgMuted }]}>5 stages · 10 exercises each</Text>
      </View>

      {/* Overall progress dots */}
      <View style={styles.dotsRow}>
        {STAGE_META.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, isCompleted(i) && { backgroundColor: T.success }, isUnlocked(i) && !isCompleted(i) && { backgroundColor: T.onBgMuted }]}
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
              style={[styles.card, { backgroundColor: T.cardDark, borderColor: T.border }, !unlocked && styles.cardLocked]}
              onPress={() => unlocked && onSelectStage(i)}
              activeOpacity={unlocked ? 0.8 : 1}
            >
              <View style={[
                styles.iconBubble,
                { backgroundColor: unlocked ? `${stage.color}22` : 'rgba(128,128,128,0.08)' },
              ]}>
                <Text style={styles.stageIcon}>{unlocked ? stage.icon : '🔒'}</Text>
              </View>

              <View style={styles.cardInfo}>
                <Text style={[styles.stageName, { color: T.onBg }, !unlocked && { color: T.onBgMuted }]}>
                  Stage {i + 1}: {stage.name}
                </Text>
                <Text style={[styles.stageDesc, { color: T.onBgMuted }]}>
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
  bg: '#1C2A44', card: '#243454',
  cream: '#F7F3E9', creamMid: '#C5B99A', creamMuted: '#8A7E6E',
  gold: '#E0B04B', yellow: '#F4C542',
  success: '#7DC47A',
  border: 'rgba(244,197,66,0.13)', borderMid: 'rgba(244,197,66,0.28)',
};

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: 'transparent' },
  header:      {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: VG.border,
  },
  backBtn:     { paddingVertical: 8, paddingRight: 12 },
  backText:    { fontSize: 16, fontWeight: '600', color: VG.gold },
  headerTitle: { fontSize: 16, fontWeight: '700', color: VG.cream },

  lessonInfo:    { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 20 },
  lessonChinese: { fontSize: 36, fontWeight: '900', color: VG.cream, marginBottom: 4 },
  lessonTopic:   { fontSize: 16, color: VG.gold, marginBottom: 4 },
  lessonMeta:    { fontSize: 13, color: VG.creamMuted },

  dotsRow:    { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
  dot:        { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.1)' },
  dotUnlocked:{ backgroundColor: VG.creamMuted },
  dotDone:    { backgroundColor: VG.success },

  scroll: { paddingHorizontal: 20 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: VG.card, borderRadius: 18,
    padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: VG.border, gap: 14,
  },
  cardLocked:  { opacity: 0.42 },
  iconBubble:  { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  stageIcon:   { fontSize: 26 },
  cardInfo:    { flex: 1 },
  stageName:   { fontSize: 16, fontWeight: '700', color: VG.cream, marginBottom: 3 },
  stageDesc:   { fontSize: 13, color: VG.creamMuted },
  textMuted:   { color: VG.creamMuted },
  statusCol:   { width: 36, alignItems: 'center' },
  checkmark:   { fontSize: 22 },
  startBadge:  { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  startArrow:  { fontSize: 16, fontWeight: '900', color: VG.bg },
});
