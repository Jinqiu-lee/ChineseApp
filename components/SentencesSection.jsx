import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { speakAsAvatar } from '../utils/tts';
import { DEEP_NAVY, WARM_ORANGE, SLATE_TEAL, WARM_BROWN, CARD_WHITE } from '../constants/colors';

/**
 * SentencesSection Component - DEFAULT EXPORT
 */
function SentencesSection({ sentences, avatarId = 'eileen' }) {
  const renderSentence = ({ item, index }) => (
    <View style={styles.sentenceCard}>
      <View style={styles.sentenceNumber}>
        <Text style={styles.sentenceNumberText}>{index + 1}</Text>
      </View>
      
      <View style={styles.sentenceContent}>
        <Text style={styles.sentenceChinese}>{item.chinese}</Text>
        <Text style={styles.sentencePinyin}>{item.pinyin}</Text>
        <Text style={styles.sentenceEnglish}>"{item.english}"</Text>
      </View>

      <TouchableOpacity
        style={styles.audioIcon}
        onPress={() => speakAsAvatar(item.chinese, avatarId)}
      >
        <Text style={styles.audioIconText}>🔊</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💬 Key Sentences</Text>
        <Text style={styles.count}>{sentences.length}</Text>
      </View>
      
      <FlatList
        data={sentences}
        renderItem={renderSentence}
        keyExtractor={(item, index) => `sentence-${index}`}
        scrollEnabled={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const VG = {
  cardDark: 'rgba(255,255,255,0.92)',
  gold: WARM_BROWN, orange: WARM_ORANGE,
  cream: DEEP_NAVY, creamMuted: SLATE_TEAL,
  border: 'rgba(155,104,70,0.20)',
};

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '800', color: VG.cream },
  count: { fontSize: 14, fontWeight: '600', color: SLATE_TEAL, backgroundColor: 'rgba(55,73,80,0.14)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  list: { gap: 12 },
  sentenceCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: VG.cardDark, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: VG.border, gap: 12 },
  sentenceNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: WARM_BROWN, alignItems: 'center', justifyContent: 'center' },
  sentenceNumberText: { fontSize: 14, fontWeight: '800', color: CARD_WHITE },
  sentenceContent: { flex: 1 },
  sentenceChinese: { fontSize: 20, fontWeight: '700', color: VG.cream, marginBottom: 6, lineHeight: 28 },
  sentencePinyin: { fontSize: 15, color: VG.orange, fontStyle: 'italic', marginBottom: 6, lineHeight: 22 },
  sentenceEnglish: { fontSize: 15, color: VG.creamMuted, lineHeight: 22 },
  audioIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(155,104,70,0.22)', alignItems: 'center', justifyContent: 'center' },
  audioIconText: { fontSize: 18 },
});

// IMPORTANT: Default export
export default SentencesSection;
