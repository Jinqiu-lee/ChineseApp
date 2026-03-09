import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { speakChinese } from '../utils/tts';

export default function VocabularySection({ vocabulary }) {
  const words   = (vocabulary || []).filter(v => v.part_of_speech !== 'phrase');
  const phrases = (vocabulary || []).filter(v => v.part_of_speech === 'phrase');

  return (
    <View style={styles.container}>
      {words.length > 0 && (
        <ItemGroup items={words} label="📝 New Words" count={`${words.length} words`} isPhrase={false} />
      )}
      {phrases.length > 0 && (
        <ItemGroup items={phrases} label="✨ Key Phrases" count={`${phrases.length} phrases`} isPhrase={true} />
      )}
    </View>
  );
}

function ItemGroup({ items, label, count, isPhrase }) {
  const [expandedId, setExpandedId] = useState(null);
  const toggle = (id) => setExpandedId(prev => prev === id ? null : id);

  return (
    <View style={styles.group}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupTitle}>{label}</Text>
        <Text style={styles.groupCount}>{count}</Text>
      </View>

      {items.map(item => (
        <VocabCard
          key={item.id}
          item={item}
          isPhrase={isPhrase}
          isExpanded={expandedId === item.id}
          onToggle={() => toggle(item.id)}
        />
      ))}
    </View>
  );
}

function VocabCard({ item, isPhrase, isExpanded, onToggle }) {
  return (
    <TouchableOpacity
      style={[styles.card, isPhrase && styles.cardPhrase]}
      onPress={onToggle}
      activeOpacity={0.75}
    >
      <View style={styles.cardMain}>
        <View style={styles.cardLeft}>
          <Text style={[styles.chinese, isPhrase && styles.chinesePhrase]}>
            {item.chinese}
          </Text>
          <Text style={styles.pinyin}>{item.pinyin}</Text>
        </View>

        <View style={styles.cardRight}>
          <Text style={styles.english}>{item.english}</Text>
          {item.part_of_speech && (
            <Text style={[
              styles.pos,
              item.part_of_speech === 'phrase' && styles.posPhrase,
            ]}>
              {item.part_of_speech}
            </Text>
          )}
        </View>
      </View>

      {isExpanded && (
        <View style={styles.details}>
          {item.tones?.length > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tones:</Text>
              <Text style={styles.detailValue}>
                {item.tones.map(t => `Tone ${t}`).join('  ·  ')}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.audioBtn, isPhrase && styles.audioBtnPhrase]}
            onPress={() => speakChinese(item.chinese)}
          >
            <Text style={styles.audioBtnText}>🔊 Play Audio</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  group: { marginBottom: 20 },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  groupTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  groupCount: { fontSize: 13, fontWeight: '600', color: '#636e72' },

  card: {
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2d3436',
  },
  cardPhrase: {
    borderColor: 'rgba(255,215,0,0.25)',
    backgroundColor: 'rgba(255,215,0,0.04)',
  },
  cardMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLeft: { flex: 1 },
  chinese: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 3 },
  chinesePhrase: { fontSize: 22 },
  pinyin: { fontSize: 14, color: '#a29bfe', fontStyle: 'italic' },
  cardRight: { alignItems: 'flex-end' },
  english: { fontSize: 15, fontWeight: '600', color: '#fff', marginBottom: 4, textAlign: 'right' },
  pos: {
    fontSize: 11,
    color: '#636e72',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  posPhrase: {
    color: '#FFD700',
    backgroundColor: 'rgba(255,215,0,0.1)',
  },

  details: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  detailRow: { flexDirection: 'row', marginBottom: 8 },
  detailLabel: { fontSize: 13, fontWeight: '600', color: '#a29bfe', marginRight: 8 },
  detailValue: { fontSize: 13, color: '#fff' },
  audioBtn: {
    backgroundColor: 'rgba(162,155,254,0.15)',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(162,155,254,0.3)',
  },
  audioBtnPhrase: {
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderColor: 'rgba(255,215,0,0.3)',
  },
  audioBtnText: { fontSize: 14, fontWeight: '600', color: '#a29bfe' },
});
