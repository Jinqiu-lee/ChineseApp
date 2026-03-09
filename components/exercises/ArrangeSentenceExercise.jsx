import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ArrangeSentenceExercise({ exercise, onCorrect, onWrong }) {
  const { correctTokens, shuffledTokens, token_pinyin_map = {}, hint } = exercise;

  const [tiles, setTiles] = useState(() =>
    shuffledTokens.map((word, i) => ({ id: `t${i}`, word, placed: false }))
  );
  const [answer, setAnswer] = useState([]);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showPinyin, setShowPinyin] = useState(false);

  const placeTile = (tile) => {
    if (checked) return;
    setTiles(prev => prev.map(t => t.id === tile.id ? { ...t, placed: true } : t));
    setAnswer(prev => [...prev, tile]);
  };

  const removeTile = (tile) => {
    if (checked) return;
    setTiles(prev => prev.map(t => t.id === tile.id ? { ...t, placed: false } : t));
    setAnswer(prev => prev.filter(t => t.id !== tile.id));
  };

  const checkAnswer = () => {
    const correct = correctTokens.join('') === answer.map(t => t.word).join('');
    setIsCorrect(correct);
    setChecked(true);
    setTimeout(() => {
      correct ? onCorrect() : onWrong();
    }, 1500);
  };

  const allPlaced = answer.length === correctTokens.length;

  const TileButton = ({ tile, inTray }) => {
    const pinyin = token_pinyin_map[tile.word];
    return (
      <TouchableOpacity
        style={[
          styles.tile,
          inTray && styles.tileInTray,
          inTray && checked && (isCorrect ? styles.tileSuccess : styles.tileFail),
          !inTray && tile.placed && styles.tilePlaced,
        ]}
        onPress={() => inTray ? removeTile(tile) : (!tile.placed && placeTile(tile))}
        disabled={(inTray ? checked : tile.placed || checked)}
        activeOpacity={0.75}
      >
        <Text style={[
          styles.tileText,
          !inTray && tile.placed && styles.tileTextFaded,
          inTray && checked && styles.tileTextWhite,
        ]}>
          {tile.word}
        </Text>
        {showPinyin && pinyin && !tile.placed && (
          <Text style={styles.tilePinyin}>{pinyin}</Text>
        )}
        {showPinyin && pinyin && inTray && !checked && (
          <Text style={styles.tilePinyin}>{pinyin}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.instruction}>Arrange the sentence</Text>
        <TouchableOpacity
          style={[styles.pinyinToggle, showPinyin && styles.pinyinToggleOn]}
          onPress={() => setShowPinyin(v => !v)}
        >
          <Text style={[styles.pinyinToggleText, showPinyin && styles.pinyinToggleTextOn]}>
            拼 Pinyin
          </Text>
        </TouchableOpacity>
      </View>
      {hint && <Text style={styles.hint}>"{hint}"</Text>}

      {/* Answer tray */}
      <View style={[styles.tray, checked && (isCorrect ? styles.trayCorrect : styles.trayWrong)]}>
        {answer.length === 0 ? (
          <Text style={styles.placeholder}>Tap words below to build the sentence</Text>
        ) : (
          <View style={styles.tileRow}>
            {answer.map(tile => <TileButton key={tile.id} tile={tile} inTray={true} />)}
          </View>
        )}
        {checked && (
          <Text style={[styles.trayFeedback, isCorrect ? styles.feedbackGreen : styles.feedbackRed]}>
            {isCorrect ? '✅ Correct!' : `❌  ${correctTokens.join('')}`}
          </Text>
        )}
      </View>

      {/* Word bank */}
      <Text style={styles.bankLabel}>WORD BANK</Text>
      <View style={styles.tileRow}>
        {tiles.map(tile => <TileButton key={tile.id} tile={tile} inTray={false} />)}
      </View>

      {!checked && allPlaced && (
        <TouchableOpacity style={styles.checkBtn} onPress={checkAnswer} activeOpacity={0.85}>
          <Text style={styles.checkBtnText}>Check ✓</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 8, paddingHorizontal: 8 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  instruction: { fontSize: 17, fontWeight: '700', color: '#fff' },
  pinyinToggle: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1.5, borderColor: '#2d3436', backgroundColor: '#16213e' },
  pinyinToggleOn: { borderColor: '#a29bfe', backgroundColor: 'rgba(162,155,254,0.15)' },
  pinyinToggleText: { fontSize: 13, fontWeight: '600', color: '#636e72' },
  pinyinToggleTextOn: { color: '#a29bfe' },
  hint: { fontSize: 13, color: '#636e72', fontStyle: 'italic', marginBottom: 16 },
  tray: {
    minHeight: 72, backgroundColor: '#16213e', borderRadius: 16, padding: 14,
    marginBottom: 16, borderWidth: 2, borderColor: '#2d3436', borderStyle: 'dashed',
  },
  trayCorrect: { borderColor: '#1DD1A1' },
  trayWrong: { borderColor: '#FF6B6B' },
  placeholder: { fontSize: 13, color: '#636e72', textAlign: 'center', marginTop: 8 },
  trayFeedback: { fontSize: 14, fontWeight: '700', marginTop: 10, textAlign: 'center' },
  feedbackGreen: { color: '#1DD1A1' },
  feedbackRed: { color: '#FF6B6B' },
  bankLabel: { fontSize: 11, color: '#636e72', fontWeight: '700', letterSpacing: 0.5, marginBottom: 10 },
  tileRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  tile: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1.5, borderColor: '#dfe6e9', alignItems: 'center' },
  tileInTray: { borderWidth: 2, borderColor: '#a29bfe', backgroundColor: 'rgba(162,155,254,0.12)' },
  tilePlaced: { backgroundColor: '#2d3436', borderColor: '#2d3436' },
  tileSuccess: { backgroundColor: '#1DD1A1', borderColor: '#1DD1A1' },
  tileFail: { backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' },
  tileText: { fontSize: 20, fontWeight: '700', color: '#2d3436' },
  tileTextFaded: { color: '#636e72' },
  tileTextWhite: { color: '#fff' },
  tilePinyin: { fontSize: 10, color: '#a29bfe', fontStyle: 'italic', marginTop: 2 },
  checkBtn: { backgroundColor: '#a29bfe', borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 16 },
  checkBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
