import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function GrammarSection({ grammarPoints }) {
  const [expandedPoints, setExpandedPoints] = useState([0]);

  const togglePoint = (index) => {
    setExpandedPoints(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📚 Grammar Points ({grammarPoints.length})</Text>

      {grammarPoints.map((point, index) => (
        <GrammarPointCard
          key={point.number}
          point={point}
          isExpanded={expandedPoints.includes(index)}
          onToggle={() => togglePoint(index)}
        />
      ))}
    </View>
  );
}

function GrammarPointCard({ point, isExpanded, onToggle }) {
  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Text style={styles.cardHeaderText}>
          {point.number}. {point.title}
        </Text>
        <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.cardContent}>
          <View style={styles.explanationBox}>
            <Text style={styles.explanationText}>{point.explanation}</Text>
          </View>

          <Text style={styles.sectionLabel}>Examples:</Text>
          {point.examples.map((example, idx) => (
            <View key={idx} style={styles.exampleItem}>
              <Text style={styles.exampleChinese}>{example.chinese}</Text>
              <Text style={styles.examplePinyin}>{example.pinyin}</Text>
              <Text style={styles.exampleEnglish}>"{example.english}"</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const VG = {
  cardDark: '#243454',
  gold: '#E0B04B', orange: '#D98C2B', yellow: '#F4C542',
  cream: '#F7F3E9', creamMuted: '#8A7E6E',
  border: 'rgba(244,197,66,0.18)',
};

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  title: { fontSize: 20, fontWeight: '800', color: VG.cream, marginBottom: 12 },

  card: {
    backgroundColor: VG.cardDark,
    borderRadius: 16,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: VG.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(224,176,75,0.07)',
  },
  cardHeaderText: { fontSize: 15, fontWeight: '700', color: VG.cream, flex: 1, paddingRight: 8 },
  expandIcon: { fontSize: 14, color: VG.gold },

  cardContent: { padding: 16 },
  explanationBox: {
    backgroundColor: 'rgba(224,176,75,0.08)',
    borderLeftWidth: 3,
    borderLeftColor: VG.gold,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  explanationText: { fontSize: 14, lineHeight: 22, color: VG.cream },

  sectionLabel: { fontSize: 13, fontWeight: '700', color: VG.gold, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  exampleItem: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: VG.yellow,
  },
  exampleChinese: { fontSize: 18, fontWeight: '700', color: VG.cream, marginBottom: 3 },
  examplePinyin: { fontSize: 14, color: VG.orange, fontStyle: 'italic', marginBottom: 3 },
  exampleEnglish: { fontSize: 13, color: VG.creamMuted },
});
