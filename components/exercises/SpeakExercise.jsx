import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { speakChinese } from '../../utils/tts';
import { startRecording, stopAndTranscribe, calculateAccuracy } from '../../utils/speechRecognition';

const MAX_ATTEMPTS = 5;

// Accuracy feedback tiers
function getFeedback(accuracy) {
  if (accuracy === 100) return { msg: 'Perfect! 完美！', icon: '⭐', color: '#FFD700', pass: true };
  if (accuracy >= 90)  return { msg: 'Excellent! 🎉',    icon: '🏆', color: '#1DD1A1', pass: true };
  if (accuracy >= 80)  return { msg: 'Bravo! 🌟',         icon: '🌟', color: '#54A0FF', pass: true };
  if (accuracy >= 60)  return { msg: 'Good! Keep practicing 👍', icon: '👍', color: '#FF9F43', pass: true };
  return { msg: "Hmm, couldn't quite catch that 🤔", icon: '🎤', color: '#FF6B6B', pass: false };
}

export default function SpeakExercise({ exercise, onCorrect, onWrong }) {
  // States: 'idle' | 'recording' | 'processing' | 'result' | 'review' | 'max_attempts'
  const [phase, setPhase] = useState('idle');
  const [attempts, setAttempts] = useState(0);
  const [accuracy, setAccuracy] = useState(null);
  const [timer, setTimer] = useState(0);
  const recordingRef = useRef(null);
  const timerRef = useRef(null);

  const isRepeat = exercise.subtype === 'repeat';

  // Auto-play audio on mount for "repeat" exercises
  useEffect(() => {
    if (isRepeat) {
      const t = setTimeout(() => speakChinese(exercise.chinese), 400);
      return () => clearTimeout(t);
    }
  }, []);

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  const handleStartRecording = async () => {
    try {
      setPhase('recording');
      setTimer(0);
      const recording = await startRecording();
      recordingRef.current = recording;

      // Timer tick
      timerRef.current = setInterval(() => {
        setTimer(t => {
          if (t >= 7) {
            handleStopRecording();
            return t;
          }
          return t + 1;
        });
      }, 1000);
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
      const acc = calculateAccuracy(transcript, exercise.chinese);
      setAccuracy(acc);
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
    if (attempts >= MAX_ATTEMPTS) {
      setPhase('max_attempts');
    } else {
      setPhase('idle');
    }
  };

  const handleNext = (passed) => {
    if (passed) onCorrect();
    else onWrong();
  };

  // ── Render phases ──────────────────────────────────────────────────────
  if (phase === 'idle') {
    return (
      <View style={styles.container}>
        <Text style={styles.instruction}>
          {isRepeat ? '🎤 Listen, then repeat in Chinese' : '🎤 Say this in Chinese'}
        </Text>

        <View style={styles.promptCard}>
          {isRepeat ? (
            <>
              <Text style={styles.chinese}>{exercise.chinese}</Text>
              <Text style={styles.pinyin}>{exercise.pinyin}</Text>
              <TouchableOpacity style={styles.listenBtn} onPress={() => speakChinese(exercise.chinese)}>
                <Text style={styles.listenBtnText}>🔊 Listen again</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.english}>{exercise.english}</Text>
          )}
        </View>

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

  if (phase === 'recording') {
    return (
      <View style={styles.container}>
        <Text style={styles.instruction}>🔴 Recording... speak now</Text>

        <View style={styles.recordingCard}>
          <Text style={styles.recordingIcon}>🎙</Text>
          <Text style={styles.timerText}>{timer}s / 8s</Text>
          <View style={styles.timerBar}>
            <View style={[styles.timerFill, { width: `${(timer / 8) * 100}%` }]} />
          </View>
        </View>

        <TouchableOpacity style={styles.stopBtn} onPress={handleStopRecording} activeOpacity={0.8}>
          <Text style={styles.stopBtnText}>⏹ Stop</Text>
        </TouchableOpacity>
      </View>
    );
  }

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

  if (phase === 'result') {
    const feedback = getFeedback(accuracy);
    return (
      <View style={styles.container}>
        <View style={styles.resultCard}>
          <Text style={styles.resultIcon}>{feedback.icon}</Text>
          <Text style={[styles.accuracyPct, { color: feedback.color }]}>{accuracy}%</Text>
          <Text style={styles.resultMsg}>{feedback.msg}</Text>

          <View style={styles.resultAnswer}>
            <Text style={styles.resultLabel}>Correct:</Text>
            <Text style={styles.resultChinese}>{exercise.chinese}</Text>
            <Text style={styles.resultPinyin}>{exercise.pinyin}</Text>
            <TouchableOpacity onPress={() => speakChinese(exercise.chinese)} style={styles.replayBtn}>
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

  if (phase === 'review') {
    return (
      <View style={styles.container}>
        <Text style={styles.instruction}>📖 Review the pronunciation</Text>
        <View style={styles.promptCard}>
          <Text style={styles.chinese}>{exercise.chinese}</Text>
          <Text style={styles.pinyin}>{exercise.pinyin}</Text>
          <Text style={styles.english}>{exercise.english}</Text>
          <TouchableOpacity style={styles.listenBtn} onPress={() => speakChinese(exercise.chinese)}>
            <Text style={styles.listenBtnText}>🔊 Play Audio</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.nextBtn} onPress={() => handleNext(false)} activeOpacity={0.85}>
          <Text style={styles.nextBtnText}>Got it, Next →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // max_attempts
  return (
    <View style={styles.container}>
      <View style={styles.maxCard}>
        <Text style={styles.maxIcon}>😅</Text>
        <Text style={styles.maxTitle}>Maximum Attempts Reached</Text>
        <Text style={styles.maxSub}>That's okay — pronunciation takes practice!</Text>

        <View style={styles.maxAnswer}>
          <Text style={styles.resultChinese}>{exercise.chinese}</Text>
          <Text style={styles.resultPinyin}>{exercise.pinyin}</Text>
          <TouchableOpacity onPress={() => speakChinese(exercise.chinese)} style={styles.replayBtn}>
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 20,
  },
  instruction: {
    fontSize: 18,
    fontWeight: '700',
    color: '#a29bfe',
    textAlign: 'center',
  },

  // Prompt card (idle)
  promptCard: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#2d3436',
    gap: 8,
  },
  chinese: { fontSize: 48, fontWeight: '900', color: '#fff' },
  pinyin:  { fontSize: 18, color: '#a29bfe', fontStyle: 'italic' },
  english: { fontSize: 22, fontWeight: '700', color: '#fff', textAlign: 'center' },
  listenBtn: {
    marginTop: 8,
    backgroundColor: 'rgba(162,155,254,0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(162,155,254,0.3)',
  },
  listenBtnText: { fontSize: 15, fontWeight: '700', color: '#a29bfe' },

  attemptsText: { fontSize: 13, color: '#636e72' },

  // Mic button
  micBtn: {
    backgroundColor: '#a29bfe',
    borderRadius: 60,
    paddingHorizontal: 40,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 6,
    width: 200,
  },
  micIcon: { fontSize: 36 },
  micBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },

  // Recording card
  recordingCard: {
    backgroundColor: 'rgba(255,107,107,0.1)',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
    gap: 12,
  },
  recordingIcon: { fontSize: 52 },
  timerText: { fontSize: 16, color: '#FF6B6B', fontWeight: '700' },
  timerBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,107,107,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  timerFill: { height: '100%', backgroundColor: '#FF6B6B', borderRadius: 3 },

  stopBtn: {
    backgroundColor: '#FF6B6B',
    borderRadius: 14,
    paddingHorizontal: 40,
    paddingVertical: 14,
  },
  stopBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },

  // Processing
  processingCard: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#2d3436',
    gap: 16,
  },
  processingText: { fontSize: 15, color: '#636e72' },

  // Result card
  resultCard: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#2d3436',
    gap: 8,
  },
  resultIcon: { fontSize: 40 },
  accuracyPct: { fontSize: 52, fontWeight: '900' },
  resultMsg: { fontSize: 17, fontWeight: '700', color: '#fff', textAlign: 'center' },
  resultAnswer: {
    marginTop: 12,
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    width: '100%',
    gap: 4,
  },
  resultLabel: { fontSize: 12, color: '#636e72', marginBottom: 4 },
  resultChinese: { fontSize: 32, fontWeight: '900', color: '#fff' },
  resultPinyin: { fontSize: 15, color: '#a29bfe', fontStyle: 'italic' },
  replayBtn: {
    marginTop: 8,
    backgroundColor: 'rgba(162,155,254,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  replayBtnText: { fontSize: 14, fontWeight: '600', color: '#a29bfe' },

  nextBtn: {
    backgroundColor: '#1DD1A1',
    borderRadius: 14,
    paddingHorizontal: 48,
    paddingVertical: 14,
  },
  nextBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },

  retryBtn: {
    backgroundColor: '#a29bfe',
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  retryBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },

  // Max attempts
  maxCard: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
    gap: 8,
  },
  maxIcon:  { fontSize: 44 },
  maxTitle: { fontSize: 20, fontWeight: '900', color: '#FF6B6B', textAlign: 'center' },
  maxSub:   { fontSize: 14, color: '#636e72', textAlign: 'center' },
  maxAnswer: { marginTop: 12, alignItems: 'center', gap: 4 },

  maxActions: { flexDirection: 'row', gap: 12, width: '100%' },
  reviewBtn: {
    flex: 1,
    backgroundColor: 'rgba(162,155,254,0.15)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(162,155,254,0.3)',
  },
  reviewBtnText: { fontSize: 15, fontWeight: '700', color: '#a29bfe' },
  skipBtn: {
    flex: 1,
    backgroundColor: '#2d3436',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  skipBtnText: { fontSize: 15, fontWeight: '700', color: '#636e72' },
});
