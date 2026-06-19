import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import ScreenBackground from '../components/ScreenBackground';
import useProgress, { ALL_BADGES, getRank, getXPToNextRank } from '../hooks/useProgress';
import { DEEP_NAVY, WARM_ORANGE, WARM_BROWN, CARD_WHITE } from '../constants/colors';

export default function BadgesScreen({ onBack, currentLevelId}) {
  const { xp, streak, progress } = useProgress();
  const earned = new Set(progress.earnedBadges || []);
  const rank = getRank(xp);
  const { nextRank, xpNeeded, progress: rankProgress } = getXPToNextRank(xp);

  return (
    <ScreenBackground levelId={currentLevelId || 'hsk1'}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Achievements</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* XP & Rank card */}
        <View style={[styles.rankCard, { borderColor: 'rgba(122,79,30,0.5)'}]}>
          <View style={styles.rankRow}>
            <View>
              <Text style={styles.rankLabel}>Current Rank</Text>
              <Text style={[styles.rankName, { color: '#8E4200'}]}>{rank.rank}</Text>
              <Text style={styles.rankChinese}>{rank.rankChinese}</Text>
            </View>
            <View style={styles.xpBlock}>
              <Text style={[styles.xpTotal, { color: '#8E4200'}]}>{xp}</Text>
              <Text style={styles.xpUnit}>XP</Text>
            </View>
          </View>

          {/* XP bar */}
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${Math.round(rankProgress * 100)}%`, backgroundColor: '#8E4200'}]} />
          </View>
          {nextRank
            ? <Text style={styles.barLabel}>{xpNeeded} XP to {nextRank.rank} ({nextRank.rankChinese})</Text>
            : <Text style={styles.barLabel}>Max rank reached! 🎉</Text>
          }
        </View>

        {/* Streak card */}
        <View style={styles.streakCard}>
          <Text style={styles.streakFire}>🔥</Text>
          <View>
            <Text style={styles.streakCount}>{streak} day streak</Text>
            <Text style={styles.streakSub}>Keep studying every day!</Text>
          </View>
        </View>

        {/* Badges grid */}
        <Text style={styles.sectionTitle}>Badges  勋章</Text>
        <View style={styles.badgesGrid}>
          {ALL_BADGES.map((badge) => {
            const isEarned = earned.has(badge.id);
            return (
              <View key={badge.id} style={[styles.badgeCard, isEarned ? styles.badgeCardEarned : styles.badgeCardLocked]}>
                <Text style={[styles.badgeEmoji, !isEarned && styles.badgeEmojiLocked]}>
                  {isEarned ? badge.emoji : '🔒'}
                </Text>
                <Text style={[styles.badgeName, !isEarned && styles.badgeTextLocked]}>{badge.name}</Text>
                <Text style={[styles.badgeNameChinese, !isEarned && styles.badgeTextLocked]}>{badge.nameChinese}</Text>
                <Text style={[styles.badgeDesc, !isEarned && styles.badgeTextLocked]} numberOfLines={2}>{badge.desc}</Text>
              </View>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 24, color: CARD_WHITE, fontWeight: '700' },
  title: { fontSize: 20, fontWeight: '800', color: CARD_WHITE },

  scroll: { paddingHorizontal: 16, paddingTop: 8 },

  rankCard: {
    backgroundColor: 'rgba(255,248,220,0.88)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  rankRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  rankLabel: { fontSize: 12, color: 'rgba(100,70,20,0.8)', fontWeight: '600', marginBottom: 2 },
  rankName: { fontSize: 22, fontWeight: '900', color: '#3d1a78' },
  rankChinese: { fontSize: 15, color: 'rgba(100,70,20,0.7)', marginTop: 2 },
  xpBlock: { alignItems: 'center' },
  xpTotal: { fontSize: 26, fontWeight: '900', lineHeight: 44 },
  xpUnit: { fontSize: 10, color: 'rgba(100,70,20,0.7)', fontWeight: '700' },

  barBg: { height: 8, backgroundColor: 'rgba(100,70,20,0.15)', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  barFill: { height: '100%', borderRadius: 4 },
  barLabel: { fontSize: 12, color: 'rgba(100,70,20,0.7)', textAlign: 'right' },

  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255,243,200,0.85)',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(180,120,30,0.5)',
    marginBottom: 20,
  },
  streakFire: { fontSize: 26 },
  streakCount: { fontSize: 16, fontWeight: '800', color: '#5c3a10' },
  streakSub: { fontSize:10, color: 'rgba(100,70,20,0.7)', marginTop: 2 },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#3a2000', marginBottom: 14 },

  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: '47%',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    gap: 2,
    borderWidth: 1.5,
  },
  badgeCardEarned: {
    backgroundColor: 'rgba(255,248,220,0.88)',
    borderColor: 'rgba(180,120,30,0.5)',
  },
  badgeCardLocked: {
    backgroundColor: 'rgba(255,248,220,0.45)',
    borderColor: 'rgba(180,120,30,0.25)',
  },
  badgeEmoji: { fontSize: 28, marginBottom: 4 },
  badgeEmojiLocked: { opacity: 0.5 },
  badgeName: { fontSize: 14, fontWeight: '800', color: '#3a2000', textAlign: 'center' },
  badgeNameChinese: { fontSize: 14, color: 'rgba(80,50,10,0.8)', textAlign: 'center' },
  badgeDesc: { fontSize: 12, color: 'rgba(100,70,20,0.7)', textAlign: 'center', lineHeight: 15, marginTop: 2 },
  badgeTextLocked: { color: 'rgba(100,70,20,0.35)' },
});
