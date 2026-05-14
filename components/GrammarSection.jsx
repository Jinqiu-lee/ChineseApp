import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DEEP_NAVY, WARM_ORANGE, SLATE_TEAL, WARM_BROWN, CARD_WHITE } from '../constants/colors';

// Parses a grammar point into { usage, usageParts, structure } for display.
// Extracts "Formula: ..." / "Structure: ..." lines into structure field.
// Strips inline "E.g." / "Example:" lines (we use the structured examples[] array instead).
// For pattern-format points (HSK6) the pattern field itself is the structure.
function parseGrammarForDisplay(point) {
  const text = point.explanation || '';

  if (point.pattern) {
    const parts = text.split(/\. |。/).map(s => s.replace(/\.$/, '').trim()).filter(Boolean);
    return { usage: text, usageParts: parts, structure: point.pattern };
  }

  const EG = '\x01';
  const parts = text
    .replace(/E\.g\. /g, EG + ' ')
    .split(/\. |。/)
    .map(s => s.replace(new RegExp(EG + ' ', 'g'), 'E.g. ').replace(/\.$/, '').trim())
    .filter(Boolean);

  const usageParts = [];
  const structureParts = [];

  for (const part of parts) {
    if (/^(formula|structure):/i.test(part)) {
      structureParts.push(part.replace(/^(formula|structure):\s*/i, ''));
    } else if (/^(e\.g\.|example:|another example:|note:)/i.test(part)) {
      // skip — use structured examples[] instead
    } else {
      usageParts.push(part);
    }
  }

  return {
    usage: usageParts.join('. '),
    usageParts,
    structure: structureParts.join(' | '),
  };
}

function isChineseStart(s) {
  const c = (s || '').charCodeAt(0);
  return (c >= 0x4e00 && c <= 0x9fff) || (c >= 0x3400 && c <= 0x4dbf);
}

// Groups usageParts into intro + max 3 numbered points.
// Consecutive same-type (CJK-start vs Latin-start) sentences are merged into one group.
function buildDisplayPoints(usageParts) {
  if (usageParts.length <= 1) return { intro: usageParts[0] || '', points: [] };
  const intro = usageParts[0];
  const tail = usageParts.slice(1);
  const groups = [];
  let cur = [tail[0]];
  let curType = isChineseStart(tail[0]);
  for (let i = 1; i < tail.length; i++) {
    const t = isChineseStart(tail[i]);
    if (groups.length >= 3) {
      cur.push(tail[i]);
    } else if (t === curType) {
      cur.push(tail[i]);
    } else {
      groups.push(cur);
      cur = [tail[i]];
      curType = t;
    }
  }
  groups.push(cur);
  return { intro, points: groups };
}


export default function GrammarSection({ grammarPoints }) {
  const [expandedPoints, setExpandedPoints] = useState([]);

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
          key={point.id ?? point.number ?? index}
          point={point}
          isExpanded={expandedPoints.includes(index)}
          onToggle={() => togglePoint(index)}
        />
      ))}
    </View>
  );
}

function GrammarPointCard({ point, isExpanded, onToggle }) {
  const { usage, usageParts, structure } = parseGrammarForDisplay(point);
  const examples = (point.examples || []).map(ex =>
    typeof ex === 'string' ? { chinese: ex, english: '' } : ex
  );

  const { intro, points } = buildDisplayPoints(usageParts);

  const headerLabel = point.pattern
    ? `${point.pattern}  —  ${point.meaning}`
    : `${point.number}. ${point.title}`;

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Text style={styles.cardHeaderText}>{headerLabel}</Text>
        <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.cardContent}>

          {/* 1 — Meaning / Usage: intro + numbered points or plain paragraph */}
          {points.length === 0 ? (
            !!intro && <Text style={styles.usageText}>{intro}</Text>
          ) : (
            <View>
              {!!intro && <Text style={[styles.usageText, { marginBottom: 4 }]}>{intro}</Text>}
              {points.map((group, i) => {
                const isCJK = isChineseStart(group[0]);
                return (
                  <View key={i} style={styles.pointRow}>
                    <Text style={styles.usageItemNum}>{i + 1}.  </Text>
                    {group.length === 1 ? (
                      <Text style={styles.pointText}>{group[0]}</Text>
                    ) : isCJK ? (
                      <View style={styles.bulletBlock}>
                        {group.map((s, j) => (
                          <Text key={j} style={styles.bulletItem}>
                            <Text style={styles.bullet}>•  </Text>{s}
                          </Text>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.pointText}>{group.join('. ')}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* 2 — Structure line */}
          {!!structure && (
            <Text style={styles.structureLine}>
              <Text style={styles.fieldLabel}>Structure: </Text>
              {structure}
            </Text>
          )}

          {/* 3 — Examples */}
          {examples.length > 0 && (
            <View style={styles.examplesBlock}>
              <Text style={styles.fieldLabel}>Examples:</Text>
              {examples.map((ex, i) => (
                <View key={i} style={styles.exampleEntry}>
                  <Text style={styles.exampleChinese}>{ex.chinese}</Text>
                  {!!ex.pinyin && (
                    <Text style={styles.examplePinyin}>{ex.pinyin}</Text>
                  )}
                  {!!ex.english && (
                    <Text style={styles.exampleEnglish}>{ex.english}</Text>
                  )}
                </View>
              ))}
            </View>
          )}

        </View>
      )}
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
    backgroundColor: 'rgba(155,104,70,0.10)',
  },
  cardHeaderText: { fontSize: 15, fontWeight: '700', color: VG.cream, flex: 1, paddingRight: 8 },
  expandIcon: { fontSize: 14, color: VG.gold },

  cardContent: { padding: 16, gap: 10 },

  // 1 — Usage: intro paragraph
  usageText: {
    fontSize: 14,
    lineHeight: 22,
    color: VG.cream,
  },
  // 1 — Numbered point row
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  usageItemNum: {
    fontWeight: '700',
    color: VG.gold,
    fontSize: 14,
    lineHeight: 22,
  },
  pointText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: VG.cream,
  },
  // Bullet sub-items for CJK multi-sentence groups
  bulletBlock: {
    flex: 1,
  },
  bulletItem: {
    fontSize: 14,
    lineHeight: 22,
    color: VG.cream,
    marginBottom: 2,
  },
  bullet: {
    color: VG.gold,
    fontWeight: '700',
  },

  // 2 — Structure line
  structureLine: {
    fontSize: 14,
    lineHeight: 21,
    color: VG.cream,
    backgroundColor: 'rgba(247,240,232,0.95)',
    borderLeftWidth: 3,
    borderLeftColor: VG.gold,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },

  // 3 — Examples block
  examplesBlock: {
    backgroundColor: 'rgba(247,240,232,0.95)',
    borderLeftWidth: 3,
    borderLeftColor: WARM_ORANGE,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 5,
  },
  exampleEntry: {
    marginBottom: 2,
  },

  // Shared label style (bold, warm brown)
  fieldLabel: { fontWeight: '800', color: VG.gold },

  exampleChinese: { fontSize: 14, fontWeight: '700', color: VG.cream, lineHeight: 21 },
  examplePinyin:  { fontSize: 12, color: VG.gold, lineHeight: 18 },
  exampleEnglish: { fontSize: 13, color: VG.creamMuted, fontStyle: 'italic', lineHeight: 19 },
});
