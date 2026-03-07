import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

/**
 * VocabularySection Component - DEFAULT EXPORT
 */
function VocabularySection({ vocabulary }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleWord = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderVocabItem = ({ item }) => {
    const isExpanded = expandedId === item.id;

    return (
      <TouchableOpacity
        style={styles.vocabCard}
        onPress={() => toggleWord(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.vocabMain}>
          <View style={styles.vocabLeft}>
            <Text style={styles.vocabChinese}>{item.chinese}</Text>
            <Text style={styles.vocabPinyin}>{item.pinyin}</Text>
          </View>
          
          <View style={styles.vocabRight}>
            <Text style={styles.vocabEnglish}>{item.english}</Text>
            {item.part_of_speech && (
              <Text style={styles.vocabPos}>{item.part_of_speech}</Text>
            )}
          </View>
        </View>

        {isExpanded && (
          <View style={styles.vocabDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tones:</Text>
              <Text style={styles.detailValue}>
                {item.tones?.map(t => `Tone ${t}`).join(', ') || 'N/A'}
              </Text>
            </View>
            <TouchableOpacity style={styles.audioButton}>
              <Text style={styles.audioButtonText}>🔊 Play Audio</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📝 Vocabulary</Text>
        <Text style={styles.count}>{vocabulary.length} words</Text>
      </View>
      
      <FlatList
        data={vocabulary}
        renderItem={renderVocabItem}
        keyExtractor={(item) => item.id}
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
  count: { fontSize: 14, fontWeight: '600', color: '#636e72' },
  list: { gap: 10 },
  vocabCard: { backgroundColor: '#16213e', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2d3436' },
  vocabMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vocabLeft: { flex: 1 },
  vocabChinese: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 4 },
  vocabPinyin: { fontSize: 16, color: '#a29bfe', fontStyle: 'italic' },
  vocabRight: { alignItems: 'flex-end' },
  vocabEnglish: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  vocabPos: { fontSize: 12, color: '#636e72', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  vocabDetails: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  detailRow: { flexDirection: 'row', marginBottom: 8 },
  detailLabel: { fontSize: 14, fontWeight: '600', color: '#a29bfe', marginRight: 8 },
  detailValue: { fontSize: 14, color: '#fff' },
  audioButton: { backgroundColor: 'rgba(162, 155, 254, 0.2)', padding: 10, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  audioButtonText: { fontSize: 14, fontWeight: '600', color: '#a29bfe' },
});

// IMPORTANT: Default export
export default VocabularySection;
