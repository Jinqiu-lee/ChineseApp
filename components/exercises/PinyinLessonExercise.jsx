import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { speakPinyin } from '../../utils/tts';

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

const TONE_COLORS = { '1': '#FF6B6B', '2': '#FF9F43', '3': '#1DD1A1', '4': '#54A0FF', '0': '#a29bfe' };

export default function PinyinLessonExercise({ exercise, onCorrect, onWrong }) {
  const { type, syllable, audio_key, prompt, correct, choices, hint } = exercise;
  const [selected,  setSelected]  = useState(null);
  const [answered,  setAnswered]  = useState(false);
  const [revealed,  setRevealed]  = useState(false);

  const meta = TYPE_META[type] ?? TYPE_META.visual_tone;
  const isListen = meta.showAudio;

  // For initials/finals use the audio_key (isolated sound); for tones/syllables use the syllable itself
  const getPlayTarget = () => {
    if (type === 'listen_initial' || type === 'listen_final') return audio_key;
    return syllable || audio_key;
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
    setTimeout(() => {
      choice === correct ? onCorrect() : onWrong();
    }, 1400);
  };

  const getChoiceStyle = (choice) => {
    if (!answered) return styles.choice;
    if (choice === correct)  return styles.choiceCorrect;
    if (choice === selected) return styles.choiceWrong;
    return styles.choiceDimmed;
  };

  const getChoiceTextStyle = (choice) => {
    if (!answered) return styles.choiceText;
    if (choice === correct)  return [styles.choiceText, { color: '#1DD1A1' }];
    if (choice === selected) return [styles.choiceText, { color: '#FF6B6B' }];
    return [styles.choiceText, { opacity: 0.5 }];
  };

  // For tone choices, show colored tone indicators
  const isToneChoice = type === 'visual_tone' || type === 'listen_tone';
  const toneMarkMap = { '1': 'ā / ā', '2': 'á / á', '3': 'ǎ / ǎ', '4': 'à / à', '0': '· neutral' };

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
                  {choice === '0' ? '0 · neutral' : `${choice}${toneMarkMap[choice] ? ' · ' + ['','ā','á','ǎ','à'][+choice] : ''}`}
                </Text>
              </View>
            ) : (
              <Text style={getChoiceTextStyle(choice)}>{choice}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 8, paddingHorizontal: 8 },

  topRow: { marginBottom: 20 },
  instruction: { fontSize: 16, fontWeight: '700', color: '#fff' },

  // Listen card
  listenCard: {
    backgroundColor: '#16213e', borderRadius: 20, padding: 32,
    alignItems: 'center', marginBottom: 28,
    borderWidth: 2, borderColor: '#54A0FF', gap: 8,
  },
  listenIcon: { fontSize: 48 },
  listenTap:  { fontSize: 13, color: '#636e72' },
  revealedBox:     { marginTop: 12, alignItems: 'center', gap: 4 },
  revealedLabel:   { fontSize: 11, color: '#636e72', textTransform: 'uppercase', letterSpacing: 1 },
  revealedSyllable:{ fontSize: 36, fontWeight: '900', color: '#54A0FF', letterSpacing: 2 },

  // Prompt card (sandhi / neutral)
  promptCard: {
    backgroundColor: '#16213e', borderRadius: 20, padding: 24,
    marginBottom: 28, borderWidth: 1.5, borderColor: '#a29bfe55', gap: 10,
  },
  promptText: { fontSize: 18, fontWeight: '700', color: '#fff', lineHeight: 26 },
  hintText:   { fontSize: 13, color: '#a29bfe', lineHeight: 20 },

  // Visual syllable card
  syllableCard: {
    backgroundColor: '#16213e', borderRadius: 20, padding: 28,
    alignItems: 'center', marginBottom: 28,
    borderWidth: 2, borderColor: '#54A0FF', gap: 6,
  },
  syllableText: { fontSize: 52, fontWeight: '900', color: '#54A0FF', letterSpacing: 2 },

  // Choices
  choices:      { gap: 10 },
  choice:       { backgroundColor: '#16213e', borderRadius: 14, padding: 16, borderWidth: 2, borderColor: '#2d3436', alignItems: 'center' },
  choiceCorrect:{ backgroundColor: 'rgba(29,209,161,0.15)', borderRadius: 14, padding: 16, borderWidth: 2, borderColor: '#1DD1A1', alignItems: 'center' },
  choiceWrong:  { backgroundColor: 'rgba(255,107,107,0.15)', borderRadius: 14, padding: 16, borderWidth: 2, borderColor: '#FF6B6B', alignItems: 'center' },
  choiceDimmed: { backgroundColor: '#16213e', borderRadius: 14, padding: 16, borderWidth: 2, borderColor: '#2d3436', alignItems: 'center', opacity: 0.4 },
  choiceText:   { fontSize: 17, fontWeight: '700', color: '#fff', textAlign: 'center' },

  toneChoiceInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  toneDot:         { width: 12, height: 12, borderRadius: 6 },
});
