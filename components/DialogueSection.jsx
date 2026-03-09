import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { speakChinese } from '../utils/tts';

export default function DialogueSection({ dialogues = [] }) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>💬 Dialogues ({dialogues.length})</Text>
      {dialogues.map(dialogue => (
        <DialogueCard key={dialogue.id} dialogue={dialogue} />
      ))}
    </View>
  );
}

function DialogueCard({ dialogue }) {
  const [showPinyin, setShowPinyin] = useState(false);

  return (
    <View style={styles.card}>
      {/* Card header */}
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitleChinese}>{dialogue.title_chinese}</Text>
          <Text style={styles.cardTitleEnglish}>{dialogue.title}</Text>
        </View>
        <TouchableOpacity
          style={[styles.pinyinToggle, showPinyin && styles.pinyinToggleOn]}
          onPress={() => setShowPinyin(v => !v)}
        >
          <Text style={[styles.pinyinToggleText, showPinyin && styles.pinyinToggleTextOn]}>
            拼
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dialogue lines */}
      <View style={styles.lines}>
        {dialogue.lines.map((line, i) => {
          const isA = line.speaker === 'A';
          return (
            <View key={i} style={[styles.lineRow, isA ? styles.lineRowA : styles.lineRowB]}>
              {/* Speaker label */}
              <View style={[styles.speakerBadge, isA ? styles.speakerBadgeA : styles.speakerBadgeB]}>
                <Text style={styles.speakerText}>{line.speaker}</Text>
              </View>

              {/* Bubble */}
              <View style={[styles.bubble, isA ? styles.bubbleA : styles.bubbleB]}>
                <View style={styles.bubbleTop}>
                  <Text style={[styles.bubbleChinese, isA ? styles.bubbleChineseA : styles.bubbleChineseB]}>
                    {line.chinese}
                  </Text>
                  <TouchableOpacity
                    onPress={() => speakChinese(line.chinese)}
                    style={styles.speakBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.speakBtnText}>🔊</Text>
                  </TouchableOpacity>
                </View>
                {showPinyin && (
                  <Text style={[styles.bubblePinyin, isA ? styles.bubblePinyinA : styles.bubblePinyinB]}>
                    {line.pinyin}
                  </Text>
                )}
                <Text style={styles.bubbleEnglish}>{line.english}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 14 },

  card: {
    backgroundColor: '#16213e',
    borderRadius: 18,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2d3436',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(162,155,254,0.08)',
    borderBottomWidth: 1,
    borderBottomColor: '#2d3436',
  },
  cardTitleChinese: { fontSize: 16, fontWeight: '800', color: '#fff' },
  cardTitleEnglish: { fontSize: 12, color: '#636e72', marginTop: 2 },
  pinyinToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#2d3436',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  pinyinToggleOn: { borderColor: '#a29bfe', backgroundColor: 'rgba(162,155,254,0.15)' },
  pinyinToggleText: { fontSize: 14, fontWeight: '700', color: '#636e72' },
  pinyinToggleTextOn: { color: '#a29bfe' },

  lines: { padding: 14, gap: 12 },
  lineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  lineRowA: { flexDirection: 'row' },
  lineRowB: { flexDirection: 'row-reverse' },

  speakerBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    flexShrink: 0,
  },
  speakerBadgeA: { backgroundColor: 'rgba(162,155,254,0.25)' },
  speakerBadgeB: { backgroundColor: 'rgba(29,209,161,0.25)' },
  speakerText: { fontSize: 13, fontWeight: '800', color: '#fff' },

  bubble: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    maxWidth: '88%',
  },
  bubbleA: { backgroundColor: 'rgba(162,155,254,0.12)', borderWidth: 1, borderColor: 'rgba(162,155,254,0.25)' },
  bubbleB: { backgroundColor: 'rgba(29,209,161,0.1)', borderWidth: 1, borderColor: 'rgba(29,209,161,0.25)' },

  bubbleTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  bubbleChinese: { fontSize: 18, fontWeight: '700', flex: 1, lineHeight: 26 },
  bubbleChineseA: { color: '#fff' },
  bubbleChineseB: { color: '#fff' },
  speakBtn: { paddingLeft: 8, paddingTop: 2 },
  speakBtnText: { fontSize: 16 },

  bubblePinyin: { fontSize: 13, fontStyle: 'italic', marginTop: 4, marginBottom: 2 },
  bubblePinyinA: { color: '#a29bfe' },
  bubblePinyinB: { color: '#1DD1A1' },
  bubbleEnglish: { fontSize: 13, color: '#636e72', marginTop: 4, lineHeight: 18 },
});
