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

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 8, paddingHorizontal: 8 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  instruction: { fontSize: 17, fontWeight: '700', color: '#fff' },
  pinyinToggle: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1.5, borderColor: '#2d3436', backgroundColor: '#16213e' },
  pinyinToggleOn: { borderColor: '#a29bfe', backgroundColor: 'rgba(162,155,254,0.15)' },
  pinyinToggleText: { fontSize: 13, fontWeight: '600', color: '#636e72' },
  pinyinToggleTextOn: { color: '#a29bfe' },
  progress: { fontSize: 13, color: '#a29bfe', marginBottom: 20 },
  grid: { flexDirection: 'row' },
  col: { flex: 1, gap: 10 },
  divider: { width: 12 },
  cell: { backgroundColor: '#16213e', borderRadius: 14, padding: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#2d3436', minHeight: 64 },
  cellSelected: { backgroundColor: 'rgba(162,155,254,0.15)', borderRadius: 14, padding: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#a29bfe', minHeight: 64 },
  cellMatched: { backgroundColor: 'rgba(29,209,161,0.15)', borderRadius: 14, padding: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#1DD1A1', minHeight: 64, opacity: 0.5 },
  cellWrong: { backgroundColor: 'rgba(255,107,107,0.15)', borderRadius: 14, padding: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FF6B6B', minHeight: 64 },
  cellChinese: { fontSize: 26, fontWeight: '800', color: '#fff' },
  cellPinyin: { fontSize: 11, color: '#a29bfe', fontStyle: 'italic', marginTop: 3 },
  cellEnglish: { fontSize: 13, fontWeight: '600', color: '#fff', textAlign: 'center', lineHeight: 18 },
});
