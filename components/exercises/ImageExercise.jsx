import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Animated } from 'react-native';
import { speakChinese } from '../../utils/tts';
import { DEEP_NAVY, WARM_ORANGE, SLATE_TEAL, WARM_BROWN, CARD_WHITE, SUCCESS, ERROR } from '../../constants/colors';

// ── ImageCard ──────────────────────────────────────────────────────────────
// Renders one image option: real photo if url present, else emoji + color bg
function ImageCard({ image, selected, correct, showResult, onPress, size = 140 }) {
  const borderColor = showResult
    ? correct ? SUCCESS : selected ? ERROR : SLATE_TEAL
    : selected ? WARM_ORANGE : SLATE_TEAL;

  const overlayColor = showResult
    ? correct ? 'rgba(45,122,74,0.18)' : selected ? 'rgba(196,80,58,0.18)' : 'transparent'
    : selected ? 'rgba(232,82,42,0.18)' : 'transparent';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      disabled={showResult}
      style={[styles.imageCard, { width: size, height: size, borderColor }]}
    >
      {image?.url ? (
        <Image
          source={{ uri: image.url }}
          style={styles.cardPhoto}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.cardEmoji, { backgroundColor: image?.color || SLATE_TEAL }]}>
          <Text style={styles.cardEmojiText}>{image?.emoji || '🖼️'}</Text>
        </View>
      )}

      {/* Label overlay */}
      <View style={styles.cardLabelBg}>
        <Text style={styles.cardLabel} numberOfLines={1}>{image?.label || ''}</Text>
      </View>

      {/* Result overlay */}
      {showResult && (
        <View style={[styles.resultOverlay, { backgroundColor: overlayColor }]}>
          {correct && <Text style={styles.resultIcon}>✓</Text>}
          {!correct && selected && <Text style={[styles.resultIcon, { color: ERROR }]}>✗</Text>}
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── ImageExercise ──────────────────────────────────────────────────────────
export default function ImageExercise({ exercise, onCorrect, onWrong }) {
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showContinue, setShowContinue] = useState(false);

  useEffect(() => {
    // For listen_to_picture: auto-play audio on mount
    if (exercise.subtype === 'listen_to_picture' && exercise.chinese) {
      const t = setTimeout(() => speakChinese(exercise.chinese), 400);
      return () => clearTimeout(t);
    }
  }, []);

  const handleSelect = (choice) => {
    if (showResult) return;
    setSelected(choice);
    setShowResult(true);
    const correct = exercise.subtype === 'picture_to_word'
      ? choice.chinese === exercise.correct
      : choice.isCorrect;

    if (correct) {
      setTimeout(() => onCorrect(), 900);
    } else {
      setShowContinue(true);
    }
  };

  // ── picture_to_word ───────────────────────────────────────────────────
  if (exercise.subtype === 'picture_to_word') {
    return (
      <View style={styles.container}>
        <Text style={styles.prompt}>Which word matches this picture?</Text>

        {/* Big image */}
        <View style={styles.bigImageWrap}>
          {exercise.image?.url ? (
            <Image source={{ uri: exercise.image.url }} style={styles.bigPhoto} resizeMode="cover" />
          ) : (
            <View style={[styles.bigEmoji, { backgroundColor: exercise.image?.color || SLATE_TEAL }]}>
              <Text style={styles.bigEmojiText}>{exercise.image?.emoji || '🖼️'}</Text>
              <Text style={styles.bigEmojiLabel}>{exercise.image?.label}</Text>
            </View>
          )}
        </View>

        {/* Word choices (2 × 2) */}
        <View style={styles.wordGrid}>
          {exercise.choices.map((choice, i) => {
            const isSelected = selected?.chinese === choice.chinese;
            const isCorrect  = choice.chinese === exercise.correct;
            const borderColor = showResult
              ? isCorrect ? SUCCESS : isSelected ? ERROR : SLATE_TEAL
              : isSelected ? WARM_ORANGE : SLATE_TEAL;
            const bgColor = showResult
              ? isCorrect ? '#e8f5e9' : isSelected ? '#fde8e8' : CARD_WHITE
              : CARD_WHITE;

            return (
              <TouchableOpacity
                key={i}
                style={[styles.wordChoice, { borderColor, backgroundColor: bgColor }]}
                onPress={() => handleSelect(choice)}
                disabled={showResult}
                activeOpacity={0.8}
              >
                <Text style={styles.wordChinese}>{choice.chinese}</Text>
                <Text style={styles.wordPinyin}>{choice.pinyin}</Text>
                <Text style={styles.wordEnglish}>{choice.english}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {showContinue && (
          <TouchableOpacity style={styles.continueBtn} onPress={onWrong} activeOpacity={0.85}>
            <Text style={styles.continueBtnText}>Continue →</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // ── word_to_picture ───────────────────────────────────────────────────
  if (exercise.subtype === 'word_to_picture') {
    return (
      <View style={styles.container}>
        <Text style={styles.prompt}>Which picture matches?</Text>

        {/* Word display */}
        <View style={styles.wordDisplay}>
          <Text style={styles.wordDisplayChinese}>{exercise.chinese}</Text>
          <Text style={styles.wordDisplayPinyin}>{exercise.pinyin}</Text>
          <Text style={styles.wordDisplayEnglish}>{exercise.english}</Text>
        </View>

        {/* Image grid 2×2 */}
        <View style={styles.imageGrid}>
          {exercise.choices.map((choice, i) => (
            <ImageCard
              key={i}
              image={choice}
              selected={selected?.id === choice.id}
              correct={showResult && choice.isCorrect}
              showResult={showResult}
              onPress={() => handleSelect(choice)}
              size={148}
            />
          ))}
        </View>

        {showContinue && (
          <TouchableOpacity style={styles.continueBtn} onPress={onWrong} activeOpacity={0.85}>
            <Text style={styles.continueBtnText}>Continue →</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // ── sentence_to_picture ───────────────────────────────────────────────
  if (exercise.subtype === 'sentence_to_picture') {
    return (
      <View style={styles.container}>
        <Text style={styles.prompt}>Which picture matches this sentence?</Text>

        {/* Sentence display */}
        <View style={styles.sentenceDisplay}>
          <View style={styles.sentenceRow}>
            <Text style={styles.sentenceChinese}>{exercise.chinese}</Text>
            <TouchableOpacity onPress={() => speakChinese(exercise.chinese)} style={styles.speakBtn}>
              <Text style={styles.speakBtnText}>🔊</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sentencePinyin}>{exercise.pinyin}</Text>
          <Text style={styles.sentenceEnglish}>{exercise.english}</Text>
        </View>

        {/* Image grid 2×2 */}
        <View style={styles.imageGrid}>
          {exercise.choices.map((choice, i) => (
            <ImageCard
              key={i}
              image={choice}
              selected={selected?.id === choice.id}
              correct={showResult && choice.isCorrect}
              showResult={showResult}
              onPress={() => handleSelect(choice)}
              size={148}
            />
          ))}
        </View>

        {showContinue && (
          <TouchableOpacity style={styles.continueBtn} onPress={onWrong} activeOpacity={0.85}>
            <Text style={styles.continueBtnText}>Continue →</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // ── listen_to_picture ─────────────────────────────────────────────────
  if (exercise.subtype === 'listen_to_picture') {
    return (
      <View style={styles.container}>
        <Text style={styles.prompt}>Listen and pick the right picture</Text>

        {/* Audio button */}
        <TouchableOpacity
          style={styles.listenBtn}
          onPress={() => speakChinese(exercise.chinese)}
          activeOpacity={0.8}
        >
          <Text style={styles.listenBtnIcon}>🔊</Text>
          <Text style={styles.listenBtnText}>Play again</Text>
        </TouchableOpacity>

        {/* Image grid 2×2 */}
        <View style={styles.imageGrid}>
          {exercise.choices.map((choice, i) => (
            <ImageCard
              key={i}
              image={choice}
              selected={selected?.id === choice.id}
              correct={showResult && choice.isCorrect}
              showResult={showResult}
              onPress={() => handleSelect(choice)}
              size={148}
            />
          ))}
        </View>

        {showContinue && (
          <TouchableOpacity style={styles.continueBtn} onPress={onWrong} activeOpacity={0.85}>
            <Text style={styles.continueBtnText}>Continue →</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return null;
}

const VG = {
  bg: 'transparent', card: CARD_WHITE, cardDark: CARD_WHITE,
  onCard: DEEP_NAVY, onCardMuted: WARM_BROWN,
  gold: WARM_BROWN, orange: WARM_ORANGE,
  cream: DEEP_NAVY, creamMuted: SLATE_TEAL,
  success: SUCCESS, error: ERROR,
  border: 'rgba(155,104,70,0.22)', shadow: 'rgba(28,42,68,0.18)',
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingVertical: 16, gap: 20 },

  prompt: { fontSize: 16, color: VG.cream, fontWeight: '600', textAlign: 'center', backgroundColor: CARD_WHITE, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'center' },

  // Big image for picture_to_word
  bigImageWrap: {
    width: 220, height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: CARD_WHITE,
    borderWidth: 1.5, borderColor: 'rgba(217,140,43,0.3)',
  },
  bigPhoto: { width: '100%', height: '100%' },
  bigEmoji: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16,
  },
  bigEmojiText:  { fontSize: 72 },
  bigEmojiLabel: { fontSize: 22, fontWeight: '800', color: VG.cream },

  // Word choices 2×2 for picture_to_word
  wordGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 12, justifyContent: 'center',
  },
  wordChoice: {
    width: 148, borderRadius: 16,
    paddingVertical: 14, paddingHorizontal: 12,
    borderWidth: 1.5, alignItems: 'center', gap: 2,
    backgroundColor: VG.cardDark, borderColor: VG.border,
  },
  wordChinese: { fontSize: 26, fontWeight: '800', color: VG.cream },
  wordPinyin:  { fontSize: 13, color: VG.orange, fontStyle: 'italic' },
  wordEnglish: { fontSize: 12, color: VG.creamMuted },

  // Word display for word_to_picture / listen_to_picture
  wordDisplay: {
    backgroundColor: VG.card,
    borderRadius: 18, paddingVertical: 18, paddingHorizontal: 32,
    alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: 'rgba(217,140,43,0.25)',
    shadowColor: VG.shadow, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16, shadowRadius: 10, elevation: 4,
  },
  wordDisplayChinese: { fontSize: 44, fontWeight: '900', color: VG.onCard },
  wordDisplayPinyin:  { fontSize: 18, color: VG.orange, fontStyle: 'italic' },
  wordDisplayEnglish: { fontSize: 14, color: VG.onCardMuted },

  // Sentence display
  sentenceDisplay: {
    backgroundColor: VG.card, borderRadius: 18,
    paddingVertical: 14, paddingHorizontal: 20,
    alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: 'rgba(217,140,43,0.25)', width: '100%',
    shadowColor: VG.shadow, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14, shadowRadius: 8, elevation: 3,
  },
  sentenceRow:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sentenceChinese:{ fontSize: 26, fontWeight: '800', color: VG.onCard },
  sentencePinyin: { fontSize: 14, color: VG.orange, fontStyle: 'italic' },
  sentenceEnglish:{ fontSize: 13, color: VG.onCardMuted },
  speakBtn:  { padding: 4 },
  speakBtnText: { fontSize: 20 },

  // Listen button
  listenBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: VG.cardDark, borderRadius: 18,
    paddingVertical: 20, paddingHorizontal: 40,
    borderWidth: 1.5, borderColor: VG.gold,
  },
  listenBtnIcon: { fontSize: 36 },
  listenBtnText: { fontSize: 18, fontWeight: '700', color: VG.gold },

  // Image grid 2×2
  imageGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 12, justifyContent: 'center',
  },

  // ImageCard
  imageCard: {
    borderRadius: 18, overflow: 'hidden',
    borderWidth: 2, position: 'relative',
  },
  cardPhoto:  { width: '100%', height: '100%' },
  cardEmoji:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 8 },
  cardEmojiText: { fontSize: 48 },

  cardLabelBg: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: 4, paddingHorizontal: 6,
  },
  cardLabel: { fontSize: 12, fontWeight: '700', color: CARD_WHITE, textAlign: 'center' },

  resultOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  resultIcon: { fontSize: 40, fontWeight: '900', color: VG.success },
  continueBtn: {
    marginTop: 8, backgroundColor: DEEP_NAVY, borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 40, alignItems: 'center',
    shadowColor: VG.shadow, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22, shadowRadius: 8, elevation: 4,
  },
  continueBtnText: { fontSize: 16, fontWeight: '800', color: CARD_WHITE },
});
