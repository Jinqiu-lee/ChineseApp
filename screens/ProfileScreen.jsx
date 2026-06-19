import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenBackground from '../components/ScreenBackground';
import LevelChangeModal from '../components/LevelChangeModal';
import AvatarCharacter from '../components/AvatarCharacter';
import useProgress from '../hooks/useProgress';
import { LEVEL_QUOTES } from '../data/emotionalContent';
import { getVanGoghMessage } from '../data/vanGoghMessages';
import { DEEP_NAVY, WARM_ORANGE, SLATE_TEAL, WARM_BROWN, CARD_WHITE, ERROR } from '../constants/colors';

const LEVEL_CONFIG = [
  { id: 'hsk1', number: 1, emoji: '🌻', title: 'Sunflower Fields',  color: '#9B6846' },
  { id: 'hsk2', number: 2, emoji: '☕', title: 'Café Terrace',      color: '#E8522A' },
  { id: 'hsk3', number: 3, emoji: '🌾', title: 'Wheat Fields',      color: '#0c6e16' },
  { id: 'hsk4', number: 4, emoji: '🏡', title: 'Homes & Villages',  color: '#BE7A62' },
  { id: 'hsk5', number: 5, emoji: '🌌', title: 'Starry Night',      color: '#384fa3' },
  { id: 'hsk6', number: 6, emoji: '🌼', title: 'Irises in Bloom',   color: '#f7c80c' },
];

export default function ProfileScreen({
  userData,
  levelState,
  onChangeLevelConfirm,
  onRetakeTest,
  onResetProgress,
  onCharactersPress,
}) {
  const { xp, streak } = useProgress();
  const [showLevelChangeModal, setShowLevelChangeModal] = useState(false);
  const [avatarId, setAvatarId] = useState('eileen');
  const [vanGoghGreeting, setVanGoghGreeting] = useState(null);
  const [vanGoghStreakMsg, setVanGoghStreakMsg] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('avatarId').then(val => { if (val) setAvatarId(val); }).catch(() => {});
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    AsyncStorage.getItem('last_active_date').then(lastDate => {
      let category = 'dailyGreeting';
      if (lastDate && lastDate !== today) {
        const msPerDay = 24 * 60 * 60 * 1000;
        const daysDiff = Math.round((new Date(today) - new Date(lastDate)) / msPerDay);
        if (daysDiff >= 7) category = 'welcomeBackLong';
        else if (daysDiff >= 1) category = 'welcomeBackShort';
      }
      setVanGoghGreeting(getVanGoghMessage(category));
    }).catch(() => {
      setVanGoghGreeting(getVanGoghMessage('dailyGreeting'));
    });
  }, []);

  useEffect(() => {
    if (streak >= 2) setVanGoghStreakMsg(getVanGoghMessage('streakActive', { days: streak }));
    else setVanGoghStreakMsg(null);
  }, [streak]);

  if (!userData?.result) return null;
  const { result } = userData;
  const level = LEVEL_CONFIG.find(l => l.id === result.recommendedLevel) || LEVEL_CONFIG[0];
  const canChangeLevel = levelState?.levelSetBy === 'manual' && !levelState?.levelChangedUsed;

  const todayMessage = (() => {
    const day = new Date().getDay();
    const levelPool = LEVEL_QUOTES[result.recommendedLevel] || LEVEL_QUOTES.hsk1;
    const msgs = levelPool[avatarId] || levelPool.eileen;
    return msgs?.[day] ?? '';
  })();

  const handleChangeLevelConfirm = (newLevelId) => {
    onChangeLevelConfirm(newLevelId);
    setShowLevelChangeModal(false);
  };

  const handleResetPress = () => {
    Alert.alert(
      'Reset Progress',
      'This will erase all your progress and return you to onboarding. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: onResetProgress },
      ]
    );
  };

  return (
    <ScreenBackground levelId={result.recommendedLevel}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Current level card */}
          <View style={[styles.levelCard, { borderColor: level.color }]}>
            <Text style={styles.levelEmoji}>{level.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.levelLabel}>Current Level</Text>
              <Text style={[styles.levelTitle, { color: level.color }]}>
                Level {level.number}: {level.title}
              </Text>
              <Text style={styles.levelSub}>{result.recommendedLevel.toUpperCase()}</Text>
            </View>
          </View>

          {/* Avatar + daily message */}
          <View style={styles.avatarSection}>
            <AvatarCharacter avatarId={avatarId} expression="idle" size={130} />
            <View style={styles.avatarMessageBubble}>
              <Text style={styles.avatarMessageText}>{todayMessage}</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBadge}>
              <Text style={styles.statBadgeIcon}>🔥</Text>
              <Text style={styles.statBadgeValue}>{streak}</Text>
              <Text style={styles.statBadgeLabel}>day streak</Text>
            </View>
            <View style={styles.statBadge}>
              <Text style={styles.statBadgeIcon}>⭐</Text>
              <Text style={styles.statBadgeValue}>{xp}</Text>
              <Text style={styles.statBadgeLabel}>XP</Text>
            </View>
          </View>

          {/* Van Gogh greeting */}
          {(vanGoghStreakMsg || vanGoghGreeting) && (
            <View style={styles.vgCard}>
              <Image
                source={require('../assets/avatar/Van_Gogh_梵高/van_gogh_portrait_2.png')}
                style={styles.vgAvatarImage}
              />
              <View style={styles.vgTextBlock}>
                <Text style={styles.vgMessageText}>
                  {(vanGoghStreakMsg ?? vanGoghGreeting).text}
                </Text>
                <Text style={styles.vgSignature}>— Vincent</Text>
              </View>
            </View>
          )}

          {/* Settings */}
          <Text style={styles.sectionLabel}>SETTINGS</Text>

          {canChangeLevel ? (
            <TouchableOpacity style={styles.row} onPress={() => setShowLevelChangeModal(true)} activeOpacity={0.8}>
              <Text style={styles.rowIcon}>🔄</Text>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Change Level</Text>
                <Text style={styles.rowSub}>One-time adjustment</Text>
              </View>
              <Text style={styles.rowArrow}>→</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.row, styles.rowDisabled]}>
              <Text style={styles.rowIcon}>🔄</Text>
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, styles.rowTitleDisabled]}>Change Level</Text>
                <Text style={styles.rowSub}>Already used — one-time only</Text>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.row} onPress={onRetakeTest} activeOpacity={0.8}>
            <Text style={styles.rowIcon}>📝</Text>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Retake Placement Test</Text>
            </View>
            <Text style={styles.rowArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.row, styles.rowDanger]} onPress={handleResetPress} activeOpacity={0.8}>
            <Text style={styles.rowIcon}>🗑️</Text>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: ERROR }]}>Reset Progress</Text>
              <Text style={styles.rowSub}>Erase all progress — cannot be undone</Text>
            </View>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>

        <LevelChangeModal
          visible={showLevelChangeModal}
          onClose={() => setShowLevelChangeModal(false)}
          onConfirm={handleChangeLevelConfirm}
          currentLevelId={result.recommendedLevel}
          mode="manual"
        />
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },

  header: {
    paddingHorizontal: 20, paddingVertical: 15,
    backgroundColor: CARD_WHITE,
    borderBottomWidth: 1, borderBottomColor: 'rgba(155,104,70,0.15)',
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: DEEP_NAVY, textAlign: 'center' },

  content: { padding: 20, gap: 12 },

  // Level card
  levelCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: CARD_WHITE, borderRadius: 20, padding: 20,
    borderWidth: 2,
  },
  levelEmoji: { fontSize: 44 },
  levelLabel: { fontSize: 11, color: SLATE_TEAL, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  levelTitle: { fontSize: 17, fontWeight: '800' },
  levelSub:   { fontSize: 12, color: SLATE_TEAL, marginTop: 3 },

  // Avatar
  avatarSection: { alignItems: 'center', gap: 10 },
  avatarMessageBubble: {
    backgroundColor: CARD_WHITE, borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(155,104,70,0.28)',
    paddingHorizontal: 16, paddingVertical: 8, maxWidth: 280,
  },
  avatarMessageText: {
    color: SLATE_TEAL, fontSize: 12, fontStyle: 'italic',
    textAlign: 'center', lineHeight: 18,
  },

  // Stats
  statsRow: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  statBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: CARD_WHITE, borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(80,50,0,0.20)',
    paddingHorizontal: 14, paddingVertical: 7,
  },
  statBadgeIcon:  { fontSize: 16 },
  statBadgeValue: { fontSize: 17, fontWeight: '800', color: DEEP_NAVY },
  statBadgeLabel: { fontSize: 11, color: SLATE_TEAL, fontWeight: '600' },

  // Van Gogh card
  vgCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    paddingHorizontal: 18, paddingVertical: 14,
    borderRadius: 12, borderLeftWidth: 3, borderLeftColor: '#E8A838',
    backgroundColor: 'rgba(255,255,255,0.88)',
  },
  vgAvatarImage: { width: 46, height: 46 },
  vgTextBlock: { flex: 1, gap: 4 },
  vgMessageText: { fontSize: 14, fontStyle: 'italic', fontFamily: 'Georgia', color: WARM_BROWN, lineHeight: 21 },
  vgSignature: { fontSize: 11, color: SLATE_TEAL, fontWeight: '500', letterSpacing: 0.3 },

  // Section labels
  sectionLabel: {
    fontSize: 11, color: SLATE_TEAL, fontWeight: '700',
    letterSpacing: 1, marginTop: 8,
  },

  // Rows
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: CARD_WHITE, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(155,104,70,0.15)',
  },
  rowDisabled: { opacity: 0.5 },
  rowDanger:   { borderColor: 'rgba(196,80,58,0.20)' },
  rowIcon:     { fontSize: 22 },
  rowText:     { flex: 1 },
  rowTitle:    { fontSize: 15, fontWeight: '700', color: DEEP_NAVY },
  rowTitleDisabled: { color: SLATE_TEAL },
  rowSub:      { fontSize: 12, color: SLATE_TEAL, marginTop: 2 },
  rowArrow:    { fontSize: 18, color: WARM_BROWN, fontWeight: '700' },
});
