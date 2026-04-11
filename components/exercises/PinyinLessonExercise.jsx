import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { speakPinyin } from '../../utils/tts';
import { DEEP_NAVY, WARM_ORANGE, SLATE_TEAL, WARM_BROWN, CARD_WHITE, SUCCESS, ERROR } from '../../constants/colors';

// Handles all exercise types in the Pinyin Learning System:
//  listen_tone, listen_initial, listen_final, listen_syllable → audio first, pick answer
//  visual_tone, visual_initial, visual_final → see syllable, pick answer
//  sandhi_choice, neutral_choice → see text prompt, pick answer

const TYPE_META = {
  listen_tone:    { instruction: '🔊 Listen, then pick the tone number', showAudio: true, hideLabel: true },
  listen_initial: { instruction: '🔊 Listen, then pick the initial (声母)', showAudio: true, hideLabel: true },
  listen_final:   { instruction: '🔊 Listen, then pick the final (韵母)', showAudio: true, hideLabel: true },
  listen_syllable:{ instruction: '🔊 Listen, then pick the correct syllable', showAudio: true, hideLabel: true },
  visual_tone:    { instruction: '🎵 What tone is this syllable?', showAudio: false, hideLabel: false },
  visual_initial: { instruction: '🔤 What is the initial (声母)?', showAudio: false, hideLabel: false },
  visual_final:   { instruction: '🔤 What is the final (韵母)?', showAudio: false, hideLabel: false },
  sandhi_choice:  { instruction: '🔄 Tone Sandhi — choose the correct tone', showAudio: false, hideLabel: false },
  neutral_choice: { instruction: '💨 Neutral Tone & Erhua — choose the answer', showAudio: false, hideLabel: false },
};

const TONE_COLORS = { '1': ERROR, '2': WARM_ORANGE, '3': SUCCESS, '4': SLATE_TEAL, '0': WARM_BROWN };

export default function PinyinLessonExercise({ exercise, onCorrect, onWrong }) {
  const { type, syllable, audio_key, prompt, correct, choices, hint, pinyin_hint } = exercise;
  const [selected,     setSelected]     = useState(null);
  const [answered,     setAnswered]     = useState(false);
  const [revealed,     setRevealed]     = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const [showPinyin,   setShowPinyin]   = useState(false);

  const meta = TYPE_META[type] ?? TYPE_META.visual_tone;
  const isListen = meta.showAudio;

  // For initials/finals use the audio_key (isolated sound); for tones/syllables prefer audio_key
  // (audio_key may be a compound key like "yi2_ge4" that can't be derived from the display syllable)
  const getPlayTarget = () => {
    if (type === 'listen_initial' || type === 'listen_final') return audio_key;
    return audio_key || syllable;
  };

  useEffect(() => {
    if (isListen) {
      const target = getPlayTarget();
      if (target) speakPinyin(target);
    }
  }, []);

  const handleSelect = (choice) => {
    if (answered) return;
    setSelected(choice);
    setAnswered(true);
    setRevealed(true);
    if (choice === correct) {
      setTimeout(() => onCorrect(), 1400);
    } else {
      setShowContinue(true);
    }
  };

  const getChoiceStyle = (choice) => {
    if (!answered) return styles.choice;
    if (choice === correct)  return styles.choiceCorrect;
    if (choice === selected) return styles.choiceWrong;
    return styles.choiceDimmed;
  };

  const getChoiceTextStyle = (choice) => {
    if (!answered) return styles.choiceText;
    if (choice === correct)  return [styles.choiceText, { color: SUCCESS }];
    if (choice === selected) return [styles.choiceText, { color: ERROR }];
    return [styles.choiceText, { color: 'rgba(28,42,68,0.4)' }];
  };

  // For tone choices, show colored tone indicators
  const isToneChoice = type === 'visual_tone' || type === 'listen_tone';
  const toneOrdinal = { '1': '1st Tone', '2': '2nd Tone', '3': '3rd Tone', '4': '4th Tone', '0': 'Neutral Tone' };

  return (
    <View style={styles.container}>
      {/* Instruction row */}
      <View style={styles.topRow}>
        <Text style={styles.instruction}>{meta.instruction}</Text>
      </View>

      {/* Main card */}
      {isListen ? (
        // Listen exercises: show play button, hide syllable until answered
        <TouchableOpacity
          style={styles.listenCard}
          onPress={() => speakPinyin(getPlayTarget())}
          activeOpacity={0.75}
        >
          <Text style={styles.listenIcon}>🔊</Text>
          <Text style={styles.listenTap}>Tap to play again</Text>
          {revealed && syllable && (
            <View style={styles.revealedBox}>
              <Text style={styles.revealedLabel}>Syllable</Text>
              <Text style={styles.revealedSyllable}>{syllable}</Text>
            </View>
          )}
        </TouchableOpacity>
      ) : prompt ? (
        // Sandhi/neutral: show text prompt
        <View style={styles.promptCard}>
          <Text style={styles.promptText}>{prompt}</Text>
          {answered && hint && <Text style={styles.hintText}>💡 {hint}</Text>}
        </View>
      ) : (
        // Visual exercises: show the syllable
        <View style={styles.syllableCard}>
          {syllable && (
            <Text style={styles.syllableText}>{syllable}</Text>
          )}
        </View>
      )}

      {/* Show Pinyin — only for exercises with Chinese characters (pinyin_hint field) */}
      {pinyin_hint && (
        <View style={styles.showPinyinRow}>
          <TouchableOpacity
            style={[styles.showPinyinBtn, showPinyin && styles.showPinyinBtnActive]}
            onPress={() => setShowPinyin(v => !v)}
            activeOpacity={0.75}
          >
            <Text style={[styles.showPinyinText, showPinyin && styles.showPinyinTextActive]}>
              👁  Show Pinyin
            </Text>
          </TouchableOpacity>
          {showPinyin && (
            <View style={styles.pinyinPill}>
              <Text style={styles.pinyinPillText}>{pinyin_hint}</Text>
            </View>
          )}
        </View>
      )}

      {/* Choices */}
      <View style={styles.choices}>
        {choices.map((choice, i) => (
          <TouchableOpacity
            key={i}
            style={getChoiceStyle(choice)}
            onPress={() => handleSelect(choice)}
            disabled={answered}
            activeOpacity={0.75}
          >
            {isToneChoice && TONE_COLORS[choice] ? (
              <View style={styles.toneChoiceInner}>
                <View style={[styles.toneDot, { backgroundColor: TONE_COLORS[choice] }]} />
                <Text style={getChoiceTextStyle(choice)}>
                  {toneOrdinal[choice] ?? `Tone ${choice}`}
                </Text>
              </View>
            ) : (
              <Text style={getChoiceTextStyle(choice)}>{choice}</Text>
            )}
          </TouchableOpacity>
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

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 8, paddingHorizontal: 8 },

  topRow: { marginBottom: 20, backgroundColor: CARD_WHITE, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  instruction: { fontSize: 16, fontWeight: '700', color: DEEP_NAVY },

  // Listen card
  listenCard: {
    backgroundColor: CARD_WHITE, borderRadius: 20, padding: 32,
    alignItems: 'center', marginBottom: 28,
    borderWidth: 2, borderColor: SLATE_TEAL, gap: 8,
  },
  listenIcon: { fontSize: 48 },
  listenTap:  { fontSize: 13, color: SLATE_TEAL },
  revealedBox:     { marginTop: 12, alignItems: 'center', gap: 4 },
  revealedLabel:   { fontSize: 11, color: SLATE_TEAL, textTransform: 'uppercase', letterSpacing: 1 },
  revealedSyllable:{ fontSize: 36, fontWeight: '900', color: SLATE_TEAL, letterSpacing: 2 },

  // Prompt card (sandhi / neutral)
  promptCard: {
    backgroundColor: CARD_WHITE, borderRadius: 20, padding: 24,
    marginBottom: 28, borderWidth: 1.5, borderColor: 'rgba(155,104,70,0.25)', gap: 10,
  },
  promptText: { fontSize: 18, fontWeight: '700', color: DEEP_NAVY, lineHeight: 26 },
  hintText:   { fontSize: 13, color: WARM_BROWN, lineHeight: 20 },

  // Visual syllable card
  syllableCard: {
    backgroundColor: CARD_WHITE, borderRadius: 20, padding: 28,
    alignItems: 'center', marginBottom: 28,
    borderWidth: 2, borderColor: SLATE_TEAL, gap: 6,
  },
  syllableText: { fontSize: 44, fontWeight: '900', color: WARM_BROWN, letterSpacing: 2 },

  // Choices
  choices:      { gap: 10 },
  choice:       { backgroundColor: CARD_WHITE, borderRadius: 14, padding: 16, borderWidth: 2, borderColor: 'rgba(155,104,70,0.22)', alignItems: 'center' },
  choiceCorrect:{ backgroundColor: '#e8f5e9', borderRadius: 14, padding: 16, borderWidth: 2, borderColor: SUCCESS, alignItems: 'center' },
  choiceWrong:  { backgroundColor: '#fde8e8', borderRadius: 14, padding: 16, borderWidth: 2, borderColor: ERROR, alignItems: 'center' },
  choiceDimmed: { backgroundColor: '#F5F2EE', borderRadius: 14, padding: 16, borderWidth: 2, borderColor: 'rgba(155,104,70,0.10)', alignItems: 'center' },
  choiceText:   { fontSize: 17, fontWeight: '700', color: DEEP_NAVY, textAlign: 'center' },

  toneChoiceInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  toneDot:         { width: 12, height: 12, borderRadius: 6 },

  // Show Pinyin
  showPinyinRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  showPinyinBtn:      { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(155,104,70,0.25)' },
  showPinyinBtnActive:{ borderColor: SLATE_TEAL, backgroundColor: '#eaf2f3' },
  showPinyinText:     { fontSize: 13, fontWeight: '600', color: SLATE_TEAL },
  showPinyinTextActive:{ color: SLATE_TEAL },
  pinyinPill:         { backgroundColor: '#eaf2f3', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(55,73,80,0.30)' },
  pinyinPillText:     { fontSize: 18, fontWeight: '800', color: SLATE_TEAL, letterSpacing: 1 },
  continueBtn: {
    marginTop: 16, backgroundColor: DEEP_NAVY, borderRadius: 14,
    padding: 16, alignItems: 'center',
    shadowColor: 'rgba(28,42,68,0.18)', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22, shadowRadius: 8, elevation: 4,
  },
  continueBtnText: { fontSize: 16, fontWeight: '800', color: CARD_WHITE },
});
