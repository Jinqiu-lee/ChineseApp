import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { speakChinese } from '../utils/tts';

/**
 * SentencesSection Component - DEFAULT EXPORT
 */
function SentencesSection({ sentences }) {
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
        onPress={() => speakChinese(item.chinese)}
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

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '800', color: '#fff' },
  count: { fontSize: 14, fontWeight: '600', color: '#636e72', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  list: { gap: 12 },
  sentenceCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#16213e', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2d3436', gap: 12 },
  sentenceNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(162, 155, 254, 0.2)', alignItems: 'center', justifyContent: 'center' },
  sentenceNumberText: { fontSize: 14, fontWeight: '800', color: '#a29bfe' },
  sentenceContent: { flex: 1 },
  sentenceChinese: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 6, lineHeight: 28 },
  sentencePinyin: { fontSize: 15, color: '#a29bfe', fontStyle: 'italic', marginBottom: 6, lineHeight: 22 },
  sentenceEnglish: { fontSize: 15, color: '#dfe6e9', lineHeight: 22 },
  audioIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(162, 155, 254, 0.15)', alignItems: 'center', justifyContent: 'center' },
  audioIconText: { fontSize: 18 },
});

// IMPORTANT: Default export
export default SentencesSection;
