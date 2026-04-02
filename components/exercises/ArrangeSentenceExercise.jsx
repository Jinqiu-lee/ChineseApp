import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, PanResponder, Modal, StyleSheet as RNStyleSheet,
} from 'react-native';
import { DEEP_NAVY, WARM_ORANGE, SLATE_TEAL, WARM_BROWN, CARD_WHITE, SUCCESS, ERROR } from '../../constants/colors';

const TRAY_PADDING = 14; // matches styles.tray padding

// ── Tile (pure display, no hooks) ─────────────────────────────────────────────
function TileView({ tile, inTray, showPinyin, pinyin, checked, isCorrect, isDragging, panHandlers, onLayout }) {
  const isComma = tile.word === '，';
  return (
    <View
      {...panHandlers}
      onLayout={onLayout}
      style={[
        styles.tile,
        isComma && styles.tileComma,
        inTray && styles.tileInTray,
        inTray && checked && (isCorrect ? styles.tileSuccess : styles.tileFail),
        !inTray && tile.placed && styles.tilePlaced,
        isDragging && styles.tileDragging,
      ]}
    >
      <Text style={[
        styles.tileText,
        !inTray && tile.placed && styles.tileTextFaded,
        inTray && checked && styles.tileTextWhite,
        isDragging && styles.tileTextFaded,
      ]}>
        {tile.word}
      </Text>
      {showPinyin && pinyin && !isDragging && (
        <Text style={styles.tilePinyin}>{pinyin}</Text>
      )}
    </View>
  );
}

// ── Main exercise ─────────────────────────────────────────────────────────────
export default function ArrangeSentenceExercise({ exercise, onCorrect, onWrong }) {
  const { correctTokens, shuffledTokens, token_pinyin_map = {}, hint } = exercise;

  const [tiles, setTiles]         = useState(() =>
    shuffledTokens.map((word, i) => ({ id: `t${i}`, word, placed: false }))
  );
  const [answer, setAnswer]       = useState([]);
  const [checked, setChecked]     = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showPinyin, setShowPinyin] = useState(false);

  // Drag UI state
  const [ghost, setGhost]             = useState(null); // { tileId, word, pinyin, screenX, screenY, w, h }
  const [insertIndex, setInsertIndex] = useState(null);

  // Refs for fresh state in PanResponder callbacks (avoid stale closures)
  const answerRef  = useRef(answer);
  const tilesRef   = useRef(tiles);
  const checkedRef = useRef(false);
  useEffect(() => { answerRef.current  = answer;  }, [answer]);
  useEffect(() => { tilesRef.current   = tiles;   }, [tiles]);
  useEffect(() => { checkedRef.current = checked; }, [checked]);

  // Measurement refs
  const trayRef        = useRef(null);
  const trayPagePos    = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const tileDimensions = useRef({});   // id → { w, h }  (from onLayout)
  const trayTileLayouts = useRef({});  // id → { x, y, w, h } relative to tileRow inside tray

  // Pan responder cache — one per tile id, reused across renders
  const panRespondersRef = useRef({});

  // ── Measure tray ──────────────────────────────────────────────────────
  const refreshTrayPos = () => {
    trayRef.current?.measureInWindow((x, y, w, h) => {
      trayPagePos.current = { x, y, w, h };
    });
  };

  // ── Compute insert index from absolute screen x/y ─────────────────────
  const computeInsertIndex = (pageX, pageY) => {
    const t = trayPagePos.current;
    if (!t.w) return null;
    // Generous hit area — a bit outside tray is still considered "in tray"
    if (pageX < t.x - 20 || pageX > t.x + t.w + 20 ||
        pageY < t.y - 30 || pageY > t.y + t.h + 60) return null;

    const currentAnswer = answerRef.current;
    const relX = pageX - t.x - TRAY_PADDING;

    for (let i = 0; i < currentAnswer.length; i++) {
      const l = trayTileLayouts.current[currentAnswer[i].id];
      if (!l) continue;
      if (relX < l.x + l.w / 2) return i;
    }
    return currentAnswer.length;
  };

  // ── Tap helpers ────────────────────────────────────────────────────────
  const placeTileAtEnd = (tile) => {
    setTiles(prev => prev.map(t => t.id === tile.id ? { ...t, placed: true } : t));
    setAnswer(prev => [...prev, tile]);
  };

  const removeTileFromTray = (tile) => {
    setTiles(prev => prev.map(t => t.id === tile.id ? { ...t, placed: false } : t));
    setAnswer(prev => prev.filter(t => t.id !== tile.id));
  };

  // ── PanResponder factory — created once per tile id ───────────────────
  const getOrCreatePan = (tileId) => {
    if (panRespondersRef.current[tileId]) return panRespondersRef.current[tileId];

    let didDrag = false;

    const pr = PanResponder.create({
      // Capture phase — grab the touch BEFORE the parent ScrollView sees it
      onStartShouldSetPanResponderCapture: () => !checkedRef.current,
      onMoveShouldSetPanResponderCapture:  () => !checkedRef.current,

      onPanResponderGrant: (evt) => {
        didDrag = false;
        refreshTrayPos(); // refresh tray position at each drag start

        const tileObj = tilesRef.current.find(t => t.id === tileId)
                     ?? answerRef.current.find(t => t.id === tileId);
        if (!tileObj) return;

        const { pageX, pageY } = evt.nativeEvent;
        const dim = tileDimensions.current[tileId] ?? { w: 60, h: 44 };

        setGhost({
          tileId,
          word:   tileObj.word,
          pinyin: token_pinyin_map[tileObj.word],
          screenX: pageX,
          screenY: pageY,
          w: dim.w,
          h: dim.h,
        });
        setInsertIndex(computeInsertIndex(pageX, pageY));
      },

      onPanResponderMove: (evt, gestureState) => {
        if (Math.abs(gestureState.dx) > 4 || Math.abs(gestureState.dy) > 4) {
          didDrag = true;
        }
        const { pageX, pageY } = evt.nativeEvent;
        setGhost(prev => prev ? { ...prev, screenX: pageX, screenY: pageY } : prev);
        setInsertIndex(computeInsertIndex(pageX, pageY));
      },

      onPanResponderRelease: (evt) => {
        setGhost(null);

        if (!didDrag) {
          // Pure tap
          setInsertIndex(null);
          const inTray = answerRef.current.some(t => t.id === tileId);
          const tile   = answerRef.current.find(t => t.id === tileId)
                      ?? tilesRef.current.find(t => t.id === tileId);
          if (!tile) return;
          if (inTray) removeTileFromTray(tile);
          else if (!tile.placed) placeTileAtEnd(tile);
          return;
        }

        const { pageX, pageY } = evt.nativeEvent;
        const idx = computeInsertIndex(pageX, pageY);
        setInsertIndex(null);

        const inTray    = answerRef.current.some(t => t.id === tileId);
        const fromIndex = answerRef.current.findIndex(t => t.id === tileId);
        const tile      = answerRef.current.find(t => t.id === tileId)
                       ?? tilesRef.current.find(t => t.id === tileId);
        if (!tile) return;

        if (idx !== null) {
          if (inTray) {
            // Reorder within tray
            setAnswer(prev => {
              const without  = prev.filter(t => t.id !== tileId);
              const adjusted = fromIndex >= 0 && idx > fromIndex ? idx - 1 : idx;
              const next = [...without];
              next.splice(Math.min(adjusted, without.length), 0, tile);
              return next;
            });
          } else {
            // Insert from word bank into specific position
            setTiles(prev => prev.map(t => t.id === tileId ? { ...t, placed: true } : t));
            setAnswer(prev => {
              const next = [...prev];
              next.splice(Math.min(idx, prev.length), 0, tile);
              return next;
            });
          }
        } else if (inTray) {
          // Dropped outside tray → return to bank
          removeTileFromTray(tile);
        }
      },

      onPanResponderTerminate: () => {
        setGhost(null);
        setInsertIndex(null);
      },
    });

    panRespondersRef.current[tileId] = pr;
    return pr;
  };

  // ── Check / Next ──────────────────────────────────────────────────────
  const checkAnswer = () => {
    const correct = correctTokens.join('') === answer.map(t => t.word).join('');
    setIsCorrect(correct);
    setChecked(true);
  };

  const handleNext = () => (isCorrect ? onCorrect() : onWrong());
  const allPlaced  = answer.length === correctTokens.length;

  // ── Tray content with insert indicator ────────────────────────────────
  const renderTrayContent = () => {
    if (answer.length === 0) {
      return <Text style={styles.placeholder}>Tap or drag words to build the sentence</Text>;
    }
    const items = [];
    for (let i = 0; i <= answer.length; i++) {
      if (ghost && insertIndex === i) {
        items.push(<View key={`ins-${i}`} style={styles.insertIndicator} />);
      }
      if (i < answer.length) {
        const tile = answer[i];
        const pan  = getOrCreatePan(tile.id);
        items.push(
          <TileView
            key={tile.id}
            tile={tile}
            inTray={true}
            showPinyin={showPinyin}
            pinyin={token_pinyin_map[tile.word]}
            checked={checked}
            isCorrect={isCorrect}
            isDragging={ghost?.tileId === tile.id}
            panHandlers={pan.panHandlers}
            onLayout={e => {
              const { x, y, width, height } = e.nativeEvent.layout;
              trayTileLayouts.current[tile.id] = { x, y, w: width, h: height };
              tileDimensions.current[tile.id]  = { w: width, h: height };
            }}
          />
        );
      }
    }
    return <View style={styles.tileRow}>{items}</View>;
  };

  // ── Render ────────────────────────────────────────────────────────────
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
      <View
        ref={trayRef}
        style={[styles.tray, checked && (isCorrect ? styles.trayCorrect : styles.trayWrong)]}
        onLayout={refreshTrayPos}
      >
        {renderTrayContent()}
        {checked && (
          <Text style={[styles.trayFeedback, isCorrect ? styles.feedbackGreen : styles.feedbackRed]}>
            {isCorrect ? '✅ Correct!' : '❌ Wrong'}
          </Text>
        )}
      </View>

      {/* Correct answer revealed on wrong */}
      {checked && !isCorrect && (
        <View style={styles.correctAnswerBox}>
          <Text style={styles.correctAnswerLabel}>CORRECT ANSWER</Text>
          <View style={styles.tileRow}>
            {correctTokens.map((word, i) => (
              <View
                key={i}
                style={[styles.tile, word === '，' && styles.tileComma, styles.tileCorrectReveal]}
              >
                <Text style={[styles.tileText, styles.tileTextCorrectReveal]}>{word}</Text>
                {token_pinyin_map[word] && (
                  <Text style={styles.tilePinyinReveal}>{token_pinyin_map[word]}</Text>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Word bank */}
      {!checked && (
        <>
          <Text style={styles.bankLabel}>WORD BANK</Text>
          <View style={styles.tileRow}>
            {tiles.map(tile => {
              const pan = getOrCreatePan(tile.id);
              return (
                <TileView
                  key={tile.id}
                  tile={tile}
                  inTray={false}
                  showPinyin={showPinyin && !tile.placed}
                  pinyin={token_pinyin_map[tile.word]}
                  checked={checked}
                  isCorrect={isCorrect}
                  isDragging={ghost?.tileId === tile.id}
                  panHandlers={pan.panHandlers}
                  onLayout={e => {
                    const { width, height } = e.nativeEvent.layout;
                    // Only record dimensions if not yet measured from tray
                    tileDimensions.current[tile.id] = { w: width, h: height };
                  }}
                />
              );
            })}
          </View>
        </>
      )}

      {!checked && allPlaced && (
        <TouchableOpacity style={styles.checkBtn} onPress={checkAnswer} activeOpacity={0.85}>
          <Text style={styles.checkBtnText}>Check ✓</Text>
        </TouchableOpacity>
      )}

      {checked && (
        <TouchableOpacity
          style={[styles.nextBtn, isCorrect ? styles.nextBtnCorrect : styles.nextBtnWrong]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>Next →</Text>
        </TouchableOpacity>
      )}

      {/* Ghost tile — rendered via Modal to float above the ScrollView */}
      <Modal visible={!!ghost} transparent animationType="none" statusBarTranslucent>
        <View pointerEvents="none" style={RNStyleSheet.absoluteFillObject}>
          {ghost && (
            <View style={[
              styles.ghost,
              {
                top:  ghost.screenY - ghost.h / 2,
                left: ghost.screenX - ghost.w / 2,
              },
            ]}>
              <Text style={styles.ghostText}>{ghost.word}</Text>
              {showPinyin && ghost.pinyin && (
                <Text style={styles.ghostPinyin}>{ghost.pinyin}</Text>
              )}
            </View>
          )}
        </View>
      </Modal>

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
  hint: { fontSize: 13, color: DEEP_NAVY, fontStyle: 'italic', fontWeight: '600', marginBottom: 16, backgroundColor: CARD_WHITE, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'flex-start' },

  tray: {
    minHeight: 72, backgroundColor: VG.cardDark, borderRadius: 16,
    padding: TRAY_PADDING,
    marginBottom: 16, borderWidth: 1.5, borderColor: VG.border, borderStyle: 'dashed',
  },
  trayCorrect: { borderColor: VG.success, borderStyle: 'solid' },
  trayWrong:   { borderColor: VG.error,   borderStyle: 'solid' },
  placeholder: { fontSize: 13, color: VG.creamMuted, textAlign: 'center', marginTop: 8 },
  trayFeedback: { fontSize: 14, fontWeight: '700', marginTop: 10, textAlign: 'center' },
  feedbackGreen: { color: VG.success },
  feedbackRed:   { color: VG.error },

  correctAnswerBox: {
    backgroundColor: 'rgba(39,174,96,0.12)', borderRadius: 14, padding: 14,
    marginBottom: 14, borderWidth: 2, borderColor: '#27ae60',
  },
  correctAnswerLabel: {
    fontSize: 10, fontWeight: '800', color: '#1a5c2f', letterSpacing: 0.8, marginBottom: 10,
  },
  tileCorrectReveal: { backgroundColor: '#c8f0d8', borderColor: '#27ae60', borderWidth: 2 },
  tileTextCorrectReveal: { color: '#0f3d22', fontWeight: '800' },
  tilePinyinReveal: { fontSize: 10, color: '#1a5c2f', fontStyle: 'italic', marginTop: 2 },

  bankLabel: { fontSize: 11, color: VG.gold, fontWeight: '700', letterSpacing: 0.5, marginBottom: 10 },
  tileRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },

  tile: {
    backgroundColor: VG.card, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1.5, borderColor: 'rgba(217,140,43,0.3)', alignItems: 'center',
    shadowColor: VG.shadow, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 3,
  },
  tileComma:    { paddingHorizontal: 8, minWidth: 32 },
  tileInTray:   { borderWidth: 2, borderColor: VG.gold, backgroundColor: '#FFF8ED' },
  tilePlaced:   { backgroundColor: VG.cardDark, borderColor: VG.border },
  tileSuccess:  { backgroundColor: VG.success, borderColor: VG.success },
  tileFail:     { backgroundColor: VG.error,   borderColor: VG.error },
  tileDragging: { opacity: 0.3 },

  tileText:      { fontSize: 20, fontWeight: '700', color: VG.onCard },
  tileTextFaded: { color: VG.onCardMuted },
  tileTextWhite: { color: '#ffffff' },
  tilePinyin:    { fontSize: 10, color: VG.orange, fontStyle: 'italic', marginTop: 2 },

  insertIndicator: {
    width: 3, height: 40, backgroundColor: VG.orange,
    borderRadius: 2, marginHorizontal: 1, alignSelf: 'center',
  },

  ghost: {
    position: 'absolute',
    backgroundColor: '#FFF8ED',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 2.5,
    borderColor: VG.orange,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
    elevation: 16,
  },
  ghostText:   { fontSize: 20, fontWeight: '700', color: VG.onCard },
  ghostPinyin: { fontSize: 10, color: VG.orange, fontStyle: 'italic', marginTop: 2 },

  checkBtn: {
    backgroundColor: VG.yellow, borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 16,
    shadowColor: VG.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.22, shadowRadius: 8, elevation: 4,
  },
  checkBtnText: { fontSize: 16, fontWeight: '800', color: CARD_WHITE },

  nextBtn: {
    borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 8,
    shadowColor: VG.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.22, shadowRadius: 8, elevation: 4,
  },
  nextBtnCorrect: { backgroundColor: VG.success },
  nextBtnWrong:   { backgroundColor: VG.error },
  nextBtnText: { fontSize: 16, fontWeight: '800', color: CARD_WHITE },
});
