import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Image, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenBackground from '../components/ScreenBackground';
import AvatarPicker from '../components/AvatarPicker';
import AVATARS from '../config/avatarConfig';
import { LEVEL_QUOTES } from '../data/emotionalContent';
import { DEEP_NAVY, SLATE_TEAL, WARM_BROWN, CARD_WHITE } from '../constants/colors';

const FoundationsScreen = ({ currentLevelId, onPinyinPress }) => {
  const isLevel1 = currentLevelId === 'hsk1';
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
    const levelPool = LEVEL_QUOTES[currentLevelId] || LEVEL_QUOTES.hsk1;
    const msgs = levelPool[avatarId] || levelPool.eileen;
    return msgs?.[day] ?? '';
  })();

  const selectedAvatarData = AVATARS.find(a => a.id === avatarId) || AVATARS[0];

  return (
    <ScreenBackground levelId={currentLevelId || 'hsk1'}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          <Text style={styles.title}>📖 Chinese Foundations</Text>

          {/* Pinyin card */}
          <TouchableOpacity style={styles.card} onPress={onPinyinPress} activeOpacity={0.85}>
            <Text style={styles.cardIcon}>🔊</Text>
            <Text style={styles.cardTitle}>Pinyin</Text>
            <Text style={styles.cardSub}>Sound System</Text>
            <Text style={styles.cardCaption}>The path you walk</Text>
          </TouchableOpacity>

          {/* Characters card */}
          <TouchableOpacity
            style={[styles.card, !isLevel1 && styles.cardLocked]}
            onPress={() => Alert.alert('Coming Soon', 'Chinese Characters system is coming in a future update! ✍️')}
            activeOpacity={0.7}
          >
            <Text style={styles.cardIcon}>✍️</Text>
            <Text style={styles.cardTitle}>Characters {!isLevel1 ? '🔒' : ''}</Text>
            <Text style={styles.cardSub}>Writing System</Text>
            <Text style={styles.cardCaption}>{isLevel1 ? 'The structure you build' : 'Coming soon'}</Text>
          </TouchableOpacity>

          {/* Guide picker */}
          <Text style={styles.sectionLabel}>CHOOSE YOUR GUIDE</Text>
          <View style={styles.pickerCard}>
            <AvatarPicker selectedId={avatarId} onSelect={handleSelectAvatar} />
          </View>

          {/* Selected guide + quote */}
          <View style={styles.guideCard}>
            <Image source={selectedAvatarData.images.neutral} style={styles.guideImg} resizeMode="cover" />
            <View style={styles.guideInfo}>
              <Text style={styles.guideLabel}>Your Guide</Text>
              <Text style={styles.guideName}>{selectedAvatarData.englishName}</Text>
              <Text style={styles.guideQuote}>"{todayQuote}"</Text>
            </View>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 32, paddingBottom: 20 },

  title: {
    fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 24, textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },

  // Two foundation cards (unchanged layout)
  card: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 16, padding: 24, marginBottom: 16, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
  },
  cardLocked:  { opacity: 0.6 },
  cardIcon:    { fontSize: 36, marginBottom: 8 },
  cardTitle:   { fontSize: 20, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  cardSub:     { fontSize: 14, color: '#555', marginBottom: 4 },
  cardCaption: { fontSize: 13, color: '#888', fontStyle: 'italic' },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: SLATE_TEAL,
    letterSpacing: 1, marginBottom: 10, marginTop: 8,
  },
  pickerCard: {
    backgroundColor: CARD_WHITE, borderRadius: 16, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(155,104,70,0.18)', overflow: 'hidden',
  },

  // Guide card
  guideCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    backgroundColor: CARD_WHITE, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(155,104,70,0.25)',
  },
  guideImg:   { width: 56, height: 56, borderRadius: 28 },
  guideInfo:  { flex: 1 },
  guideLabel: { fontSize: 10, fontWeight: '700', color: SLATE_TEAL, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  guideName:  { fontSize: 15, fontWeight: '800', color: WARM_BROWN, marginBottom: 6 },
  guideQuote: { fontSize: 12, fontStyle: 'italic', color: DEEP_NAVY, lineHeight: 18 },
});

export default FoundationsScreen;
