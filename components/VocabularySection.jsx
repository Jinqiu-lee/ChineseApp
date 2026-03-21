import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { speakChinese } from '../utils/tts';

export default function VocabularySection({ vocabulary, showPinyin = true }) {
  const words   = (vocabulary || []).filter(v => v.part_of_speech !== 'phrase');
  const phrases = (vocabulary || []).filter(v => v.part_of_speech === 'phrase');

  return (
    <View style={styles.container}>
      {words.length > 0 && (
        <ItemGroup items={words} label="📝 New Words" count={`${words.length} words`} isPhrase={false} showPinyin={showPinyin} />
      )}
      {phrases.length > 0 && (
        <ItemGroup items={phrases} label="✨ Key Phrases" count={`${phrases.length} phrases`} isPhrase={true} showPinyin={showPinyin} />
      )}
    </View>
  );
}

function ItemGroup({ items, label, count, isPhrase, showPinyin }) {
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
          showPinyin={showPinyin}
        />
      ))}
    </View>
  );
}

function VocabCard({ item, isPhrase, isExpanded, onToggle, showPinyin }) {
  return (
    <TouchableOpacity
      style={[styles.card, isPhrase && styles.cardPhrase]}
      onPress={onToggle}
      activeOpacity={0.75}
    >
      <View style={styles.cardMain}>
        {/* Left: Chinese + pinyin stacked, capped width so English has room */}
        <View style={styles.cardLeft}>
          <Text
            style={[styles.chinese, isPhrase && styles.chinesePhrase]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
          >
            {item.chinese}
          </Text>
          {showPinyin && item.pinyin && (
            <Text style={styles.pinyin} numberOfLines={1}>
              {item.pinyin}
            </Text>
          )}
        </View>

        {/* Right: English + part-of-speech */}
        <View style={styles.cardRight}>
          <Text style={styles.english} numberOfLines={2}>
            {item.english}
          </Text>
          {item.part_of_speech && (
            <Text style={[styles.pos, item.part_of_speech === 'phrase' && styles.posPhrase]}>
              {item.part_of_speech}
            </Text>
          )}
        </View>
      </View>

      {isExpanded && (
        <View style={styles.details}>
          {!showPinyin && item.pinyin && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Pinyin:</Text>
              <Text style={[styles.detailValue, { color: '#a29bfe', fontStyle: 'italic' }]}>
                {item.pinyin}
              </Text>
            </View>
          )}
          {item.example && (
            <View style={styles.exampleBox}>
              <Text style={styles.exampleChinese}>{item.example}</Text>
              {item.translation && (
                <Text style={styles.exampleTranslation}>{item.translation}</Text>
              )}
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
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2d3436',
  },
  cardPhrase: {
    borderColor: 'rgba(255,215,0,0.25)',
    backgroundColor: 'rgba(255,215,0,0.04)',
  },

  /* Row: Chinese on left, English on right */
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  /* Chinese side — fixed proportion, won't overflow */
  cardLeft: {
    width: '42%',
    paddingRight: 8,
  },
  chinese: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
  },
  chinesePhrase: {
    fontSize: 20,
  },
  pinyin: {
    fontSize: 13,
    color: '#a29bfe',
    fontStyle: 'italic',
  },

  /* English side */
  cardRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  english: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'right',
  },
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
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  detailRow: { flexDirection: 'row', marginBottom: 8 },
  detailLabel: { fontSize: 13, fontWeight: '600', color: '#a29bfe', marginRight: 8 },
  detailValue: { fontSize: 13, color: '#fff', flex: 1 },
  exampleBox: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderLeftWidth: 3,
    borderLeftColor: '#a29bfe',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  exampleChinese: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  exampleTranslation: {
    fontSize: 13,
    color: '#b2bec3',
    fontStyle: 'italic',
  },
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
