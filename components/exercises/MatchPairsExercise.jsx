import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MatchPairsExercise({ exercise, onComplete }) {
  const { pairs } = exercise;
  const [leftItems] = useState(() => shuffle([...pairs]));
  const [rightItems] = useState(() => shuffle([...pairs]));
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matched, setMatched] = useState([]);
  const [wrongPair, setWrongPair] = useState({ left: null, right: null });
  const [showPinyin, setShowPinyin] = useState(false);

  const tryMatch = (leftId, rightId) => {
    if (leftId === rightId) {
      const newMatched = [...matched, leftId];
      setMatched(newMatched);
      setSelectedLeft(null);
      setSelectedRight(null);
      if (newMatched.length === pairs.length) {
        setTimeout(() => onComplete(true), 800);
      }
    } else {
      setWrongPair({ left: leftId, right: rightId });
      setTimeout(() => {
        setWrongPair({ left: null, right: null });
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 700);
    }
  };

  const handleLeft = (id) => {
    if (matched.includes(id)) return;
    setSelectedLeft(id);
    if (selectedRight !== null) tryMatch(id, selectedRight);
  };

  const handleRight = (id) => {
    if (matched.includes(id)) return;
    setSelectedRight(id);
    if (selectedLeft !== null) tryMatch(selectedLeft, id);
  };

  const getLeftStyle = (id) => {
    if (matched.includes(id)) return styles.cellMatched;
    if (wrongPair.left === id) return styles.cellWrong;
    if (selectedLeft === id) return styles.cellSelected;
    return styles.cell;
  };

  const getRightStyle = (id) => {
    if (matched.includes(id)) return styles.cellMatched;
    if (wrongPair.right === id) return styles.cellWrong;
    if (selectedRight === id) return styles.cellSelected;
    return styles.cell;
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.instruction}>Match the pairs</Text>
        <TouchableOpacity
          style={[styles.pinyinToggle, showPinyin && styles.pinyinToggleOn]}
          onPress={() => setShowPinyin(v => !v)}
        >
          <Text style={[styles.pinyinToggleText, showPinyin && styles.pinyinToggleTextOn]}>
            拼 Pinyin
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.progress}>{matched.length} / {pairs.length} matched</Text>

      <View style={styles.grid}>
        <View style={styles.col}>
          {leftItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={getLeftStyle(item.id)}
              onPress={() => handleLeft(item.id)}
              disabled={matched.includes(item.id)}
              activeOpacity={0.75}
            >
              <Text style={styles.cellChinese}>{item.chinese}</Text>
              {showPinyin && item.pinyin ? (
                <Text style={styles.cellPinyin}>{item.pinyin}</Text>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.col}>
          {rightItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={getRightStyle(item.id)}
              onPress={() => handleRight(item.id)}
              disabled={matched.includes(item.id)}
              activeOpacity={0.75}
            >
              <Text style={styles.cellEnglish}>{item.english}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const VG = {
  bg: '#1C2A44', cardDark: '#243454',
  gold: '#E0B04B', orange: '#D98C2B',
  cream: '#F7F3E9', creamMuted: '#8A7E6E',
  success: '#5A9E5A', error: '#C4503A',
  border: 'rgba(244,197,66,0.2)',
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 8, paddingHorizontal: 8 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  instruction: { fontSize: 17, fontWeight: '700', color: VG.cream },
  pinyinToggle: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1.5, borderColor: VG.border, backgroundColor: VG.cardDark },
  pinyinToggleOn: { borderColor: VG.gold, backgroundColor: 'rgba(224,176,75,0.15)' },
  pinyinToggleText: { fontSize: 13, fontWeight: '600', color: VG.creamMuted },
  pinyinToggleTextOn: { color: VG.gold },
  progress: { fontSize: 13, color: VG.gold, marginBottom: 20 },
  grid: { flexDirection: 'row' },
  col: { flex: 1, gap: 10 },
  divider: { width: 12 },
  cell:         { backgroundColor: VG.cardDark, borderRadius: 14, padding: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: VG.border, minHeight: 64 },
  cellSelected: { backgroundColor: 'rgba(224,176,75,0.15)', borderRadius: 14, padding: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: VG.gold, minHeight: 64 },
  cellMatched:  { backgroundColor: 'rgba(90,158,90,0.15)', borderRadius: 14, padding: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: VG.success, minHeight: 64, opacity: 0.6 },
  cellWrong:    { backgroundColor: 'rgba(196,80,58,0.15)', borderRadius: 14, padding: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: VG.error, minHeight: 64 },
  cellChinese: { fontSize: 26, fontWeight: '800', color: VG.cream },
  cellPinyin:  { fontSize: 11, color: VG.orange, fontStyle: 'italic', marginTop: 3 },
  cellEnglish: { fontSize: 13, fontWeight: '600', color: VG.cream, textAlign: 'center', lineHeight: 18 },
});
