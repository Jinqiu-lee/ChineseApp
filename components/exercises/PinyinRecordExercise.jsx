import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { speakPinyin } from '../../utils/tts';
import { startRecording, stopAndTranscribe, calculateAccuracy } from '../../utils/speechRecognition';
import { DEEP_NAVY, WARM_ORANGE, SLATE_TEAL, WARM_BROWN, CARD_WHITE, SUCCESS, ERROR } from '../../constants/colors';

// Handles two Stage-4 exercise types:
//  listen_record  — audio plays automatically, user records repeating it
//  speak_record   — user sees syllable/character and records without auto-play

const PASS_ACCURACY = 70;

export default function PinyinRecordExercise({ exercise, onCorrect, onWrong }) {
  const { type, syllable, audio_key, chinese, meaning } = exercise;

  const [recording,    setRecording]    = useState(null);
  const [isRecording,  setIsRecording]  = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result,       setResult]       = useState(null); // { accuracy, transcribed, passed }
  const [answered,     setAnswered]     = useState(false);

  // Auto-play audio for listen_record exercises
  useEffect(() => {
    if (type === 'listen_record') {
      const key = audio_key || syllable;
      if (key) speakPinyin(key);
    }
  }, []);

  const playAudio = () => speakPinyin(audio_key || syllable);

  const handleRecord = async () => {
    if (isRecording) {
      // Stop and transcribe
      setIsRecording(false);
      setIsProcessing(true);
      try {
        const hint     = chinese || syllable || '';
        const transcribed = await stopAndTranscribe(recording, hint);
        const accuracy    = calculateAccuracy(transcribed, hint);
        const passed      = accuracy >= PASS_ACCURACY;
        setResult({ accuracy, transcribed, passed });
        setAnswered(true);
        setIsProcessing(false);
        if (passed) {
          setTimeout(() => onCorrect(), 1800);
        }
      } catch (e) {
        setIsProcessing(false);
        setResult({ accuracy: 0, transcribed: '', passed: false });
        setAnswered(true);
      }
    } else {
      // Start recording
      try {
        const rec = await startRecording();
        setRecording(rec);
        setIsRecording(true);
      } catch (e) {
        console.warn('Microphone error:', e);
      }
    }
  };

  const instruction = type === 'listen_record'
    ? '🎙️ Listen, then record yourself saying it'
    : '🎙️ Look at the syllable and record yourself saying it';

  return (
    <View style={styles.container}>
      {/* Instruction */}
      <View style={styles.topRow}>
        <Text style={styles.instruction}>{instruction}</Text>
      </View>

      {/* Main card */}
      <View style={styles.mainCard}>
        {/* Play button — always shown so user can replay */}
        <TouchableOpacity style={styles.playBtn} onPress={playAudio} activeOpacity={0.75}>
          <Text style={styles.playBtnIcon}>🔊</Text>
          <Text style={styles.playBtnLabel}>Play Audio</Text>
        </TouchableOpacity>

        {chinese ? <Text style={styles.chineseText}>{chinese}</Text> : null}
        <Text style={styles.syllableText}>{syllable}</Text>
        {meaning ? <Text style={styles.meaningText}>{meaning}</Text> : null}
      </View>

      {/* Record / stop button */}
      {!answered && (
        <TouchableOpacity
          style={[styles.recordBtn, isRecording && styles.recordBtnActive]}
          onPress={handleRecord}
          disabled={isProcessing}
          activeOpacity={0.85}
        >
          {isProcessing ? (
            <ActivityIndicator color={CARD_WHITE} size="small" />
          ) : (
            <>
              <Text style={styles.recordBtnIcon}>{isRecording ? '⏹' : '🎙️'}</Text>
              <Text style={styles.recordBtnText}>
                {isRecording ? 'Stop & Check' : 'Record'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Result panel */}
      {answered && result && (
        <View style={[styles.resultCard, result.passed ? styles.resultPass : styles.resultFail]}>
          <View style={styles.resultTop}>
            <Text style={[styles.resultIcon, { color: result.passed ? SUCCESS : ERROR }]}>
              {result.passed ? '✓' : '✗'}
            </Text>
            <Text style={[styles.resultAccuracy, { color: result.passed ? SUCCESS : ERROR }]}>
              {result.accuracy}%
            </Text>
          </View>
          <Text style={styles.resultMsg}>
            {result.passed
              ? 'Great pronunciation!'
              : `Aim for ${PASS_ACCURACY}%+ — try again next time`}
          </Text>
          {result.transcribed ? (
            <Text style={styles.resultTranscribed}>Heard: {result.transcribed}</Text>
          ) : null}
          {!result.passed && (
            <TouchableOpacity style={styles.continueBtn} onPress={onWrong} activeOpacity={0.85}>
              <Text style={styles.continueBtnText}>Continue →</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 8, paddingHorizontal: 8 },

  topRow: {
    marginBottom: 20, backgroundColor: CARD_WHITE,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
  },
  instruction: { fontSize: 16, fontWeight: '700', color: DEEP_NAVY },

  mainCard: {
    backgroundColor: CARD_WHITE, borderRadius: 20, padding: 28,
    alignItems: 'center', marginBottom: 24,
    borderWidth: 2, borderColor: '#03396c', gap: 10,
  },
  playBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(84,160,255,0.10)', borderRadius: 14,
    paddingHorizontal: 20, paddingVertical: 10,
    borderWidth: 1.5, borderColor: '#03396c',
  },
  playBtnIcon:  { fontSize: 20 },
  playBtnLabel: { fontSize: 14, fontWeight: '700', color: '#03396c' },

  chineseText:  { fontSize: 52, fontWeight: '900', color: DEEP_NAVY },
  syllableText: { fontSize: 30, fontWeight: '800', color: '#03396c', letterSpacing: 2 },
  meaningText:  { fontSize: 14, color: SLATE_TEAL, fontStyle: 'italic' },

  recordBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#03396c', borderRadius: 18,
    paddingVertical: 18, marginBottom: 16,
  },
  recordBtnActive: { backgroundColor: ERROR },
  recordBtnIcon:   { fontSize: 22 },
  recordBtnText:   { fontSize: 17, fontWeight: '800', color: CARD_WHITE },

  resultCard: {
    borderRadius: 18, padding: 20, gap: 8,
    borderWidth: 2,
  },
  resultPass: { backgroundColor: '#e8f5e9', borderColor: SUCCESS },
  resultFail: { backgroundColor: '#fde8e8', borderColor: ERROR },

  resultTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  resultIcon: { fontSize: 28, fontWeight: '900' },
  resultAccuracy: { fontSize: 28, fontWeight: '900' },
  resultMsg:  { fontSize: 14, color: DEEP_NAVY, lineHeight: 20 },
  resultTranscribed: { fontSize: 13, color: SLATE_TEAL, fontStyle: 'italic' },

  continueBtn: {
    marginTop: 8, backgroundColor: DEEP_NAVY, borderRadius: 14,
    padding: 14, alignItems: 'center',
  },
  continueBtnText: { fontSize: 15, fontWeight: '800', color: CARD_WHITE },
});
