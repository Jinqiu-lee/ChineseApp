import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DEEP_NAVY, WARM_ORANGE, SLATE_TEAL, WARM_BROWN, CARD_WHITE, SUCCESS, ERROR } from '../../constants/colors';

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

const VG = {
  bg: 'transparent', card: CARD_WHITE, cardDark: CARD_WHITE,
  onCard: DEEP_NAVY, onCardMuted: WARM_BROWN,
  yellow: WARM_ORANGE, gold: WARM_BROWN, orange: WARM_ORANGE,
  cream: DEEP_NAVY, creamMuted: SLATE_TEAL,
  success: SUCCESS, error: ERROR,
  border: 'rgba(155,104,70,0.22)', shadow: 'rgba(28,42,68,0.18)',
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 8, paddingHorizontal: 8 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, backgroundColor: CARD_WHITE, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  instruction: { fontSize: 17, fontWeight: '700', color: VG.cream },
  pinyinToggle: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1.5, borderColor: VG.border, backgroundColor: VG.cardDark },
  pinyinToggleOn: { borderColor: VG.gold, backgroundColor: '#FFF8ED' },
  pinyinToggleText: { fontSize: 13, fontWeight: '600', color: VG.creamMuted },
  pinyinToggleTextOn: { color: VG.gold },
  hint: { fontSize: 13, color: VG.creamMuted, fontStyle: 'italic', marginBottom: 16 },
  tray: {
    minHeight: 72, backgroundColor: VG.cardDark, borderRadius: 16, padding: 14,
    marginBottom: 16, borderWidth: 1.5, borderColor: VG.border, borderStyle: 'dashed',
  },
  trayCorrect: { borderColor: VG.success, borderStyle: 'solid' },
  trayWrong:   { borderColor: VG.error,   borderStyle: 'solid' },
  placeholder: { fontSize: 13, color: VG.creamMuted, textAlign: 'center', marginTop: 8 },
  trayFeedback: { fontSize: 14, fontWeight: '700', marginTop: 10, textAlign: 'center' },
  feedbackGreen: { color: VG.success },
  feedbackRed:   { color: VG.error },
  bankLabel: { fontSize: 11, color: VG.gold, fontWeight: '700', letterSpacing: 0.5, marginBottom: 10 },
  tileRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  tile: { backgroundColor: VG.card, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1.5, borderColor: 'rgba(217,140,43,0.3)', alignItems: 'center',
    shadowColor: VG.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 3,
  },
  tileInTray:  { borderWidth: 2, borderColor: VG.gold, backgroundColor: '#FFF8ED' },
  tilePlaced:  { backgroundColor: VG.cardDark, borderColor: VG.border },
  tileSuccess: { backgroundColor: VG.success, borderColor: VG.success },
  tileFail:    { backgroundColor: VG.error,   borderColor: VG.error },
  tileText:       { fontSize: 20, fontWeight: '700', color: VG.onCard },
  tileTextFaded:  { color: VG.onCardMuted },
  tileTextWhite:  { color: VG.cream },
  tilePinyin: { fontSize: 10, color: VG.orange, fontStyle: 'italic', marginTop: 2 },
  checkBtn: {
    backgroundColor: VG.yellow, borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 16,
    shadowColor: VG.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.22, shadowRadius: 8, elevation: 4,
  },
  checkBtnText: { fontSize: 16, fontWeight: '800', color: VG.bg },
});
