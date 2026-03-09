import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { speakChinese } from '../../utils/tts';
import { startRecording, stopAndTranscribe, calculateAccuracy } from '../../utils/speechRecognition';

const MAX_ATTEMPTS = 5;

function getFeedback(accuracy) {
  if (accuracy === 100) return { msg: 'Perfect! 完美！', icon: '⭐', color: '#FFD700', pass: true };
  if (accuracy >= 90)  return { msg: 'Excellent! 🎉',   icon: '🏆', color: '#1DD1A1', pass: true };
  if (accuracy >= 80)  return { msg: 'Bravo! 🌟',        icon: '🌟', color: '#54A0FF', pass: true };
  if (accuracy >= 60)  return { msg: 'Good! Keep practicing 👍', icon: '👍', color: '#FF9F43', pass: true };
  return { msg: "Hmm, couldn't quite catch that 🤔", icon: '🎤', color: '#FF6B6B', pass: false };
}

export default function SpeakExercise({ exercise, onCorrect, onWrong }) {
  const [phase, setPhase] = useState('idle');
  const [attempts, setAttempts] = useState(0);
  const [accuracy, setAccuracy] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const recordingRef = useRef(null);
  const timerRef = useRef(null);

  const { subtype } = exercise;
  const isRepeat    = subtype === 'repeat';
  const isTranslate = subtype === 'translate';
  const isRespond   = subtype === 'respond';

  // The Chinese text we compare the recording against
  const expectedChinese = isRespond ? exercise.answerChinese : exercise.chinese;
  const expectedPinyin  = isRespond ? exercise.answerPinyin  : exercise.pinyin;

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (recordingRef.current) recordingRef.current.stopAndUnloadAsync().catch(() => {});
    };
  }, []);

  const handleStartRecording = async () => {
    try {
      setPhase('recording');
      recordingRef.current = await startRecording();
    } catch (err) {
      console.error('startRecording error:', err);
      setPhase('idle');
    }
  };

  const handleStopRecording = async () => {
    clearInterval(timerRef.current);
    if (!recordingRef.current) return;
    setPhase('processing');
    try {
      const transcript = await stopAndTranscribe(recordingRef.current);
      recordingRef.current = null;
      setAccuracy(calculateAccuracy(transcript, expectedChinese));
      setAttempts(prev => prev + 1);
      setPhase('result');
    } catch (err) {
      console.error('transcription error:', err);
      setAccuracy(0);
      setAttempts(prev => prev + 1);
      setPhase('result');
    }
  };

  const handleRetry = () => {
    setShowHint(false);
    setPhase(attempts >= MAX_ATTEMPTS ? 'max_attempts' : 'idle');
  };

  const handleNext = (passed) => (passed ? onCorrect() : onWrong());

  // ── IDLE ──────────────────────────────────────────────────────────────
  if (phase === 'idle') {
    return (
      <View style={styles.container}>

        {/* Instruction */}
        <Text style={styles.instruction}>
          {isRepeat   ? '🎤 Listen, then repeat in Chinese' :
           isTranslate ? '🎤 Say this in Chinese' :
                        '🎧 Listen to the question, then answer'}
        </Text>

        {/* Prompt card */}
        <View style={styles.promptCard}>
          {isRepeat && (
            <>
              <Text style={styles.chinese}>{exercise.chinese}</Text>
              <Text style={styles.pinyin}>{exercise.pinyin}</Text>
              <TouchableOpacity style={styles.listenBtn} onPress={() => speakChinese(exercise.chinese)}>
                <Text style={styles.listenBtnText}>🔊 Listen</Text>
              </TouchableOpacity>
            </>
          )}

          {isTranslate && (
            <Text style={styles.english}>{exercise.english}</Text>
          )}

          {isRespond && (
            <>
              <Text style={styles.questionLabel}>Question:</Text>
              <Text style={styles.chinese}>{exercise.questionChinese}</Text>
              <Text style={styles.pinyin}>{exercise.questionPinyin}</Text>
              <TouchableOpacity style={styles.listenBtn} onPress={() => speakChinese(exercise.questionChinese)}>
                <Text style={styles.listenBtnText}>🔊 Play question</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Hint — for translate and respond */}
        {(isTranslate || isRespond) && (
          <TouchableOpacity
            style={[styles.hintToggle, showHint && styles.hintToggleOn]}
            onPress={() => setShowHint(v => !v)}
            activeOpacity={0.75}
          >
            <Text style={[styles.hintToggleText, showHint && styles.hintToggleTextOn]}>
              {showHint ? '🙈 Hide hint' : '💡 Show hint'}
            </Text>
          </TouchableOpacity>
        )}

        {showHint && (
          <View style={styles.hintBox}>
            {isTranslate && (
              <>
                <Text style={styles.hintLabel}>Pinyin:</Text>
                <Text style={styles.hintPinyin}>{exercise.pinyin}</Text>
              </>
            )}
            {isRespond && (
              <>
                <Text style={styles.hintLabel}>Suggested answer:</Text>
                <Text style={styles.hintPinyin}>{exercise.answerPinyin}</Text>
                <Text style={styles.hintEnglish}>{exercise.answerEnglish}</Text>
              </>
            )}
          </View>
        )}

        {attempts > 0 && (
          <Text style={styles.attemptsText}>Attempt {attempts + 1} of {MAX_ATTEMPTS}</Text>
        )}

        <TouchableOpacity style={styles.micBtn} onPress={handleStartRecording} activeOpacity={0.8}>
          <Text style={styles.micIcon}>🎤</Text>
          <Text style={styles.micBtnText}>Start Recording</Text>
        </TouchableOpacity>

      </View>
    );
  }

  // ── RECORDING ─────────────────────────────────────────────────────────
  if (phase === 'recording') {
    return (
      <View style={styles.container}>
        <Text style={styles.instruction}>🔴 Recording... speak now</Text>
        <View style={styles.recordingCard}>
          <Text style={styles.recordingIcon}>🎙</Text>
          <Text style={styles.recordingHint}>Tap Stop when you're done</Text>
        </View>
        <TouchableOpacity style={styles.stopBtn} onPress={handleStopRecording} activeOpacity={0.8}>
          <Text style={styles.stopBtnText}>⏹ Stop</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── PROCESSING ────────────────────────────────────────────────────────
  if (phase === 'processing') {
    return (
      <View style={styles.container}>
        <View style={styles.processingCard}>
          <ActivityIndicator size="large" color="#a29bfe" />
          <Text style={styles.processingText}>Analyzing your pronunciation...</Text>
        </View>
      </View>
    );
  }

  // ── RESULT ────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const feedback = getFeedback(accuracy);
    return (
      <View style={styles.container}>
        <View style={styles.resultCard}>
          <Text style={styles.resultIcon}>{feedback.icon}</Text>
          <Text style={[styles.accuracyPct, { color: feedback.color }]}>{accuracy}%</Text>
          <Text style={styles.resultMsg}>{feedback.msg}</Text>

          <View style={styles.resultAnswer}>
            <Text style={styles.resultLabel}>{isRespond ? 'Suggested answer:' : 'Correct:'}</Text>
            <Text style={styles.resultChinese}>{expectedChinese}</Text>
            <Text style={styles.resultPinyin}>{expectedPinyin}</Text>
            {isRespond && (
              <Text style={styles.resultEnglish}>{exercise.answerEnglish}</Text>
            )}
            <TouchableOpacity onPress={() => speakChinese(expectedChinese)} style={styles.replayBtn}>
              <Text style={styles.replayBtnText}>🔊 Hear it</Text>
            </TouchableOpacity>
          </View>
        </View>

        {feedback.pass ? (
          <TouchableOpacity style={styles.nextBtn} onPress={() => handleNext(true)} activeOpacity={0.85}>
            <Text style={styles.nextBtnText}>Next →</Text>
          </TouchableOpacity>
        ) : attempts >= MAX_ATTEMPTS ? (
          <TouchableOpacity style={styles.stopBtn} onPress={() => setPhase('max_attempts')} activeOpacity={0.85}>
            <Text style={styles.stopBtnText}>See options</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} activeOpacity={0.85}>
            <Text style={styles.retryBtnText}>🎤 Try Again ({MAX_ATTEMPTS - attempts} left)</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // ── REVIEW ────────────────────────────────────────────────────────────
  if (phase === 'review') {
    return (
      <View style={styles.container}>
        <Text style={styles.instruction}>📖 Review the pronunciation</Text>
        <View style={styles.promptCard}>
          {isRespond && (
            <>
              <Text style={styles.questionLabel}>Question:</Text>
              <Text style={[styles.chinese, { fontSize: 28 }]}>{exercise.questionChinese}</Text>
              <Text style={styles.pinyin}>{exercise.questionPinyin}</Text>
              <TouchableOpacity style={styles.listenBtn} onPress={() => speakChinese(exercise.questionChinese)}>
                <Text style={styles.listenBtnText}>🔊 Play question</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
              <Text style={styles.questionLabel}>Answer:</Text>
            </>
          )}
          <Text style={styles.chinese}>{expectedChinese}</Text>
          <Text style={styles.pinyin}>{expectedPinyin}</Text>
          {isRespond && <Text style={styles.english}>{exercise.answerEnglish}</Text>}
          {!isRespond && <Text style={styles.english}>{exercise.english}</Text>}
          <TouchableOpacity style={styles.listenBtn} onPress={() => speakChinese(expectedChinese)}>
            <Text style={styles.listenBtnText}>🔊 Play Audio</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.nextBtn} onPress={() => handleNext(false)} activeOpacity={0.85}>
          <Text style={styles.nextBtnText}>Got it, Next →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── MAX ATTEMPTS ──────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <View style={styles.maxCard}>
        <Text style={styles.maxIcon}>😅</Text>
        <Text style={styles.maxTitle}>Maximum Attempts Reached</Text>
        <Text style={styles.maxSub}>That's okay — pronunciation takes practice!</Text>
        <View style={styles.maxAnswer}>
          <Text style={styles.resultChinese}>{expectedChinese}</Text>
          <Text style={styles.resultPinyin}>{expectedPinyin}</Text>
          <TouchableOpacity onPress={() => speakChinese(expectedChinese)} style={styles.replayBtn}>
            <Text style={styles.replayBtnText}>🔊 Hear it</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.maxActions}>
        <TouchableOpacity style={styles.reviewBtn} onPress={() => setPhase('review')} activeOpacity={0.85}>
          <Text style={styles.reviewBtnText}>📖 Review</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipBtn} onPress={() => handleNext(false)} activeOpacity={0.85}>
          <Text style={styles.skipBtnText}>Skip →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, gap: 16,
  },
  instruction: { fontSize: 18, fontWeight: '700', color: '#a29bfe', textAlign: 'center' },

  promptCard: {
    backgroundColor: '#16213e', borderRadius: 20, padding: 24,
    alignItems: 'center', width: '100%', borderWidth: 1, borderColor: '#2d3436', gap: 8,
  },
  questionLabel: { fontSize: 12, fontWeight: '700', color: '#636e72', textTransform: 'uppercase', letterSpacing: 0.8 },
  chinese: { fontSize: 44, fontWeight: '900', color: '#fff' },
  pinyin:  { fontSize: 17, color: '#a29bfe', fontStyle: 'italic' },
  english: { fontSize: 20, fontWeight: '700', color: '#fff', textAlign: 'center' },
  divider: { width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 8 },
  listenBtn: {
    marginTop: 4, backgroundColor: 'rgba(162,155,254,0.15)',
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(162,155,254,0.3)',
  },
  listenBtnText: { fontSize: 15, fontWeight: '700', color: '#a29bfe' },

  // Hint
  hintToggle: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#2d3436', backgroundColor: 'rgba(255,255,255,0.04)',
  },
  hintToggleOn: { borderColor: '#FFD700', backgroundColor: 'rgba(255,215,0,0.08)' },
  hintToggleText: { fontSize: 14, fontWeight: '600', color: '#636e72' },
  hintToggleTextOn: { color: '#FFD700' },
  hintBox: {
    backgroundColor: 'rgba(255,215,0,0.06)', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.25)',
    padding: 16, width: '100%', alignItems: 'center', gap: 4,
  },
  hintLabel:  { fontSize: 11, fontWeight: '700', color: '#FFD700', textTransform: 'uppercase', letterSpacing: 0.8 },
  hintPinyin: { fontSize: 18, color: '#fff', fontStyle: 'italic', textAlign: 'center' },
  hintEnglish:{ fontSize: 14, color: '#636e72', textAlign: 'center' },

  attemptsText: { fontSize: 13, color: '#636e72' },

  micBtn: {
    backgroundColor: '#a29bfe', borderRadius: 60,
    paddingHorizontal: 40, paddingVertical: 20,
    alignItems: 'center', gap: 6, width: 200,
  },
  micIcon: { fontSize: 36 },
  micBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },

  recordingCard: {
    backgroundColor: 'rgba(255,107,107,0.1)', borderRadius: 20, padding: 32,
    alignItems: 'center', width: '100%', borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)', gap: 12,
  },
  recordingIcon: { fontSize: 52 },
  recordingHint: { fontSize: 14, color: '#FF6B6B', fontWeight: '600' },

  stopBtn: {
    backgroundColor: '#FF6B6B', borderRadius: 14, paddingHorizontal: 40, paddingVertical: 14,
  },
  stopBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },

  processingCard: {
    backgroundColor: '#16213e', borderRadius: 20, padding: 40,
    alignItems: 'center', width: '100%', borderWidth: 1, borderColor: '#2d3436', gap: 16,
  },
  processingText: { fontSize: 15, color: '#636e72' },

  resultCard: {
    backgroundColor: '#16213e', borderRadius: 20, padding: 24,
    alignItems: 'center', width: '100%', borderWidth: 1, borderColor: '#2d3436', gap: 8,
  },
  resultIcon:   { fontSize: 40 },
  accuracyPct:  { fontSize: 52, fontWeight: '900' },
  resultMsg:    { fontSize: 17, fontWeight: '700', color: '#fff', textAlign: 'center' },
  resultAnswer: {
    marginTop: 12, alignItems: 'center', paddingTop: 16,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', width: '100%', gap: 4,
  },
  resultLabel:   { fontSize: 12, color: '#636e72', marginBottom: 4 },
  resultChinese: { fontSize: 32, fontWeight: '900', color: '#fff' },
  resultPinyin:  { fontSize: 15, color: '#a29bfe', fontStyle: 'italic' },
  resultEnglish: { fontSize: 13, color: '#636e72', textAlign: 'center' },
  replayBtn: {
    marginTop: 8, backgroundColor: 'rgba(162,155,254,0.15)',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10,
  },
  replayBtnText: { fontSize: 14, fontWeight: '600', color: '#a29bfe' },

  nextBtn: {
    backgroundColor: '#1DD1A1', borderRadius: 14, paddingHorizontal: 48, paddingVertical: 14,
  },
  nextBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },

  retryBtn: {
    backgroundColor: '#a29bfe', borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14,
  },
  retryBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },

  maxCard: {
    backgroundColor: '#16213e', borderRadius: 20, padding: 28,
    alignItems: 'center', width: '100%',
    borderWidth: 1, borderColor: 'rgba(255,107,107,0.3)', gap: 8,
  },
  maxIcon:   { fontSize: 44 },
  maxTitle:  { fontSize: 20, fontWeight: '900', color: '#FF6B6B', textAlign: 'center' },
  maxSub:    { fontSize: 14, color: '#636e72', textAlign: 'center' },
  maxAnswer: { marginTop: 12, alignItems: 'center', gap: 4 },

  maxActions: { flexDirection: 'row', gap: 12, width: '100%' },
  reviewBtn: {
    flex: 1, backgroundColor: 'rgba(162,155,254,0.15)', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(162,155,254,0.3)',
  },
  reviewBtnText: { fontSize: 15, fontWeight: '700', color: '#a29bfe' },
  skipBtn: {
    flex: 1, backgroundColor: '#2d3436', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
  },
  skipBtnText: { fontSize: 15, fontWeight: '700', color: '#636e72' },
});
