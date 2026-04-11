import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DEEP_NAVY, WARM_ORANGE, SLATE_TEAL, WARM_BROWN, CARD_WHITE, SUCCESS, ERROR } from '../../constants/colors';

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
  bg: 'transparent', card: CARD_WHITE, cardDark: CARD_WHITE,
  gold: WARM_BROWN, orange: WARM_ORANGE,
  cream: DEEP_NAVY, creamMuted: SLATE_TEAL,
  success: SUCCESS, error: ERROR,
  border: 'rgba(155,104,70,0.22)',
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 8, paddingHorizontal: 8 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, backgroundColor: CARD_WHITE, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  instruction: { fontSize: 17, fontWeight: '700', color: VG.cream },
  pinyinToggle: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1.5, borderColor: VG.border, backgroundColor: VG.cardDark },
  pinyinToggleOn: { borderColor: VG.gold, backgroundColor: '#FFF8ED' },
  pinyinToggleText: { fontSize: 13, fontWeight: '600', color: VG.creamMuted },
  pinyinToggleTextOn: { color: VG.gold },
  progress: { fontSize: 13, color: DEEP_NAVY, fontWeight: '700', marginBottom: 20, backgroundColor: CARD_WHITE, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start' },
  grid: { flexDirection: 'row' },
  col: { flex: 1, gap: 10 },
  divider: { width: 12 },
  cell:         { backgroundColor: VG.cardDark, borderRadius: 14, padding: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: VG.border, minHeight: 64 },
  cellSelected: { backgroundColor: '#FFF8ED', borderRadius: 14, padding: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: VG.gold, minHeight: 64 },
  cellMatched:  { backgroundColor: '#e8f5e9', borderRadius: 14, padding: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: VG.success, minHeight: 64 },
  cellWrong:    { backgroundColor: '#fde8e8', borderRadius: 14, padding: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: VG.error, minHeight: 64 },
  cellChinese: { fontSize: 22, fontWeight: '800', color: VG.cream },
  cellPinyin:  { fontSize: 9, color: VG.orange, fontStyle: 'italic', marginTop: 3 },
  cellEnglish: { fontSize: 13, fontWeight: '800', color: VG.cream, textAlign: 'center', lineHeight: 18 },
});
