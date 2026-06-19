import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert
} from 'react-native';
import ScreenBackground from '../components/ScreenBackground';

const FoundationsScreen = ({ currentLevelId, onPinyinPress }) => {
  const isLevel1 = currentLevelId === 'hsk1';

  return (
    <ScreenBackground levelId={currentLevelId || 'hsk1'}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <Text style={styles.title}>📖 Chinese Foundations</Text>

          <TouchableOpacity style={styles.card} onPress={onPinyinPress}>
            <Text style={styles.cardIcon}>🔊</Text>
            <Text style={styles.cardTitle}>Pinyin</Text>
            <Text style={styles.cardSub}>Sound System</Text>
            <Text style={styles.cardCaption}>The path you walk</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, !isLevel1 && styles.cardLocked]}
            onPress={() =>
              Alert.alert('Coming Soon', 'Chinese Characters system is coming in a future update! ✍️')
            }
            activeOpacity={0.7}
          >
            <Text style={styles.cardIcon}>✍️</Text>
            <Text style={styles.cardTitle}>
              Characters {!isLevel1 ? '🔒' : ''}
            </Text>
            <Text style={styles.cardSub}>Writing System</Text>
            <Text style={styles.cardCaption}>
              {isLevel1 ? 'The structure you build' : 'Coming soon'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 32,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  cardLocked: {
    opacity: 0.6,
  },
  cardIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  cardCaption: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
  },
});

export default FoundationsScreen;