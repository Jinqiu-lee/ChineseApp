import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STAGE_META = [
  { name: 'First Look',      desc: 'Flashcards · Audio · Matching',  icon: '👁',  color: '#a29bfe' },
  { name: 'Listen & Choose', desc: 'Audio quiz · Fill in the blank',  icon: '🎧', color: '#54A0FF' },
  { name: 'Build Sentences', desc: 'Arrange words · Fill blanks',     icon: '🧩', color: '#1DD1A1' },
  { name: 'Match & Review',  desc: 'Matching pairs · Audio recall',   icon: '🔄', color: '#FF9F43' },
  { name: 'Final Challenge', desc: 'All types · Full review',         icon: '🏆', color: '#FF6B6B' },
];

export default function LessonStagesScreen({ lessonData, stageProgress = [], devUnlockAll = false, onSelectStage, onBack }) {
  const isUnlocked = (i) => devUnlockAll || i === 0 || stageProgress.includes(i - 1);
  const isCompleted = (i) => stageProgress.includes(i);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

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
            style={[styles.dot, isCompleted(i) && styles.dotDone, isUnlocked(i) && !isCompleted(i) && styles.dotUnlocked]}
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
              style={[styles.card, !unlocked && styles.cardLocked]}
              onPress={() => unlocked && onSelectStage(i)}
              activeOpacity={unlocked ? 0.8 : 1}
            >
              <View style={[
                styles.iconBubble,
                { backgroundColor: unlocked ? `${stage.color}22` : 'rgba(255,255,255,0.04)' },
              ]}>
                <Text style={styles.stageIcon}>{unlocked ? stage.icon : '🔒'}</Text>
              </View>

              <View style={styles.cardInfo}>
                <Text style={[styles.stageName, !unlocked && styles.textMuted]}>
                  Stage {i + 1}: {stage.name}
                </Text>
                <Text style={[styles.stageDesc, !unlocked && styles.textMuted]}>
                  {stage.desc}
                </Text>
              </View>

              <View style={styles.statusCol}>
                {completed ? (
                  <Text style={styles.checkmark}>✅</Text>
                ) : unlocked ? (
                  <View style={[styles.startBadge, { backgroundColor: stage.color }]}>
                    <Text style={styles.startArrow}>→</Text>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a1a2e' },
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
  backText: { fontSize: 16, fontWeight: '600', color: '#a29bfe' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  lessonInfo: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 20 },
  lessonChinese: { fontSize: 36, fontWeight: '900', color: '#fff', marginBottom: 4 },
  lessonTopic: { fontSize: 16, color: '#a29bfe', marginBottom: 4 },
  lessonMeta: { fontSize: 13, color: '#636e72' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2d3436' },
  dotUnlocked: { backgroundColor: '#636e72' },
  dotDone: { backgroundColor: '#1DD1A1' },
  scroll: { paddingHorizontal: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2d3436',
    gap: 14,
  },
  cardLocked: { opacity: 0.45 },
  iconBubble: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  stageIcon: { fontSize: 26 },
  cardInfo: { flex: 1 },
  stageName: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 3 },
  stageDesc: { fontSize: 13, color: '#636e72' },
  textMuted: { color: '#636e72' },
  statusCol: { width: 36, alignItems: 'center' },
  checkmark: { fontSize: 22 },
  startBadge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  startArrow: { fontSize: 16, fontWeight: '900', color: '#fff' },
});
