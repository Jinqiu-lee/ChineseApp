import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { DEEP_NAVY, WARM_ORANGE, SLATE_TEAL, WARM_BROWN, CARD_WHITE, SUCCESS, ERROR } from '../../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { speakChinese } from '../../utils/tts';
import { startRecording, stopAndTranscribe, calculateAccuracy } from '../../utils/speechRecognition';
import AvatarCharacter from '../AvatarCharacter';

const MAX_ATTEMPTS = 3;

function getFeedback(accuracy) {
  if (accuracy === 100) return { msg: 'Perfect! 完美！', icon: '⭐', color: WARM_ORANGE, pass: true };
  if (accuracy >= 90)  return { msg: 'Excellent! 🎉',   icon: '🏆', color: SUCCESS,     pass: true };
  if (accuracy >= 80)  return { msg: 'Bravo! 🌟',        icon: '🌟', color: SLATE_TEAL,  pass: true };
  if (accuracy >= 50)  return { msg: 'Good! Keep practicing 👍', icon: '👍', color: WARM_BROWN, pass: true };
  return { msg: "Hmm, couldn't quite catch that 🤔", icon: '🎤', color: ERROR, pass: false };
}

export default function SpeakExercise({ exercise, onCorrect, onWrong, avatarId: avatarIdProp }) {
  const [phase, setPhase] = useState('idle');
  const [attempts, setAttempts] = useState(0);
  const [accuracy, setAccuracy] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [avatarId, setAvatarId] = useState(avatarIdProp || 'eileen');
  const recordingRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!avatarIdProp) {
      AsyncStorage.getItem('avatarId').then(val => { if (val) setAvatarId(val); }).catch(() => {});
    }
  }, []);

  const { subtype } = exercise;
  const isRepeat    = subtype === 'repeat';
  const isTranslate = subtype === 'translate';
  const isRespond   = subtype === 'respond';

  // Count Chinese characters only (exclude spaces, punctuation, ASCII).
  function countChineseChars(str) {
    return (str || '').replace(/[^\u4e00-\u9fff\u3400-\u4dbf]/g, '').length;
  }

  // For respond exercises: if answerChinese has fewer than 3 Chinese characters,
  // split fullAnswerChinese on ，。！？ and take the first two segments —
  // long enough to evaluate a recording without being overwhelming.
  // Otherwise use answerChinese / answerPinyin as-is.
  function resolveRespondTarget(ex) {
    const shortChinese = ex.answerChinese || '';
    if (countChineseChars(shortChinese) >= 3) {
      return { chinese: shortChinese, pinyin: ex.answerPinyin || '' };
    }
    const full      = ex.fullAnswerChinese || shortChinese;
    const fullPinyin = ex.fullAnswerPinyin  || ex.answerPinyin || '';
    const segs  = full.split(/[，。！？]/).map(s => s.trim()).filter(Boolean);
    const pySegs = fullPinyin.split(/[,，.。!！?？]/).map(s => s.trim()).filter(Boolean);
    return {
      chinese: segs.slice(0, 2).join(''),
      pinyin:  pySegs.slice(0, 2).join(' '),
    };
  }

  // The Chinese text we compare the recording against
  const { chinese: expectedChinese, pinyin: expectedPinyin } = isRespond
    ? resolveRespondTarget(exercise)
    : { chinese: exercise.chinese, pinyin: exercise.pinyin };

  // For respond exercises: show full answer as reference in result/review
  const fullAnswerChinese = isRespond ? (exercise.fullAnswerChinese || exercise.answerChinese) : exercise.chinese;
  const fullAnswerPinyin  = isRespond ? (exercise.fullAnswerPinyin  || exercise.answerPinyin)  : exercise.pinyin;

  // L1/L2 show pinyin hint; L3-L5 show Chinese characters hint
  const hskLevel = exercise.hskLevel || 1;
  const hintShowPinyin = hskLevel <= 2;

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
      const transcript = await stopAndTranscribe(recordingRef.current, expectedChinese);
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

  const handleNext = () => {
    const fb = accuracy !== null ? getFeedback(accuracy) : null;
    fb?.pass ? onCorrect() : onWrong();
  };

  // ── IDLE ──────────────────────────────────────────────────────────────
  if (phase === 'idle') {
    return (
      <View style={styles.container}>

        <AvatarCharacter avatarId={avatarId} expression="neutral" size={120} />

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
              {exercise.answerEnglish ? (
                <View style={styles.answerEnglishBox}>
                  <Text style={styles.answerEnglishLabel}>Your answer:</Text>
                  <Text style={styles.answerEnglishText}>{exercise.answerEnglish}</Text>
                </View>
              ) : null}
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
                <Text style={styles.hintLabel}>Pinyin:</Text>
                <Text style={styles.hintPinyin}>{expectedPinyin}</Text>
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
        <AvatarCharacter avatarId={avatarId} expression="think" size={120} />
        <Text style={styles.instruction}>🔴 Recording... speak now</Text>

        {/* Reference card — keeps the prompt visible while recording */}
        <View style={styles.recordingRefCard}>
          {isRepeat && (
            <>
              <Text style={styles.recordingRefLabel}>SAY THIS</Text>
              <Text style={styles.recordingRefChinese}>{exercise.chinese}</Text>
              <Text style={styles.recordingRefPinyin}>{exercise.pinyin}</Text>
            </>
          )}
          {isTranslate && (
            <>
              <Text style={styles.recordingRefLabel}>TRANSLATE</Text>
              <Text style={styles.recordingRefEnglish}>{exercise.english}</Text>
              <Text style={styles.recordingRefPinyin}>{exercise.pinyin}</Text>
            </>
          )}
          {isRespond && (
            <>
              <Text style={styles.recordingRefLabel}>YOUR ANSWER</Text>
              <Text style={styles.recordingRefEnglish}>{exercise.answerEnglish}</Text>
              <Text style={styles.recordingRefPinyin}>{expectedPinyin}</Text>
            </>
          )}
        </View>

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
        <AvatarCharacter avatarId={avatarId} expression="think" size={120} />
        <View style={styles.processingCard}>
          <ActivityIndicator size="large" color="#E0B04B" />
          <Text style={styles.processingText}>Analyzing your pronunciation...</Text>
        </View>
      </View>
    );
  }

  // ── RESULT ────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const feedback = getFeedback(accuracy);
    const resultExpression = accuracy >= 60 ? 'happy' : (attempts >= MAX_ATTEMPTS ? 'encourage' : 'sad');
    return (
      <View style={styles.container}>
        <AvatarCharacter avatarId={avatarId} expression={resultExpression} size={120} />
        <View style={styles.resultCard}>
          <Text style={styles.resultIcon}>{feedback.icon}</Text>
          <Text style={[styles.accuracyPct, { color: feedback.color }]}>{accuracy}%</Text>
          <Text style={styles.resultMsg}>{feedback.msg}</Text>

          <View style={styles.resultAnswer}>
            <Text style={styles.resultLabel}>{isRespond ? 'Suggested answer:' : 'Correct:'}</Text>
            <Text style={styles.resultChinese}>{expectedChinese}</Text>
            <Text style={styles.resultPinyin}>{expectedPinyin}</Text>
            {isRespond && fullAnswerChinese !== expectedChinese && (
              <Text style={styles.resultFullAnswer}>{fullAnswerChinese}</Text>
            )}
            {isRespond && (
              <Text style={styles.resultEnglish}>{exercise.answerEnglish}</Text>
            )}
            <TouchableOpacity onPress={() => speakChinese(fullAnswerChinese)} style={styles.replayBtn}>
              <Text style={styles.replayBtnText}>🔊 Hear it</Text>
            </TouchableOpacity>
          </View>
        </View>

        {attempts >= MAX_ATTEMPTS ? (
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
            <Text style={styles.nextBtnText}>Next →</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.resultActions}>
            <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} activeOpacity={0.85}>
              <Text style={styles.retryBtnText}>🎤 Try Again ({MAX_ATTEMPTS - attempts} left)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
              <Text style={styles.nextBtnText}>Next →</Text>
            </TouchableOpacity>
          </View>
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
              <Text style={[styles.chinese, { fontSize: 22 }]}>{exercise.questionChinese}</Text>
              <Text style={styles.pinyin}>{exercise.questionPinyin}</Text>
              <TouchableOpacity style={styles.listenBtn} onPress={() => speakChinese(exercise.questionChinese)}>
                <Text style={styles.listenBtnText}>🔊 Play question</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
              <Text style={styles.questionLabel}>Answer:</Text>
            </>
          )}
          <Text style={styles.chinese}>{isRespond ? fullAnswerChinese : expectedChinese}</Text>
          <Text style={styles.pinyin}>{isRespond ? fullAnswerPinyin : expectedPinyin}</Text>
          {isRespond && <Text style={styles.english}>{exercise.answerEnglish}</Text>}
          {!isRespond && <Text style={styles.english}>{exercise.english}</Text>}
          <TouchableOpacity style={styles.listenBtn} onPress={() => speakChinese(isRespond ? fullAnswerChinese : expectedChinese)}>
            <Text style={styles.listenBtnText}>🔊 Play Audio</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.nextBtnText}>Got it, Next →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── MAX ATTEMPTS ──────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <AvatarCharacter avatarId={avatarId} expression="encourage" size={120} />
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
        <TouchableOpacity style={styles.skipBtn} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.skipBtnText}>Next →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const VG = {
  bg: 'transparent', card: CARD_WHITE, cardDark: CARD_WHITE,
  onCard: DEEP_NAVY, onCardMid: WARM_BROWN, onCardMuted: WARM_BROWN,
  yellow: WARM_ORANGE, gold: WARM_BROWN, orange: WARM_ORANGE,
  cream: DEEP_NAVY, creamMuted: SLATE_TEAL,
  success: SUCCESS, error: ERROR,
  border: 'rgba(155,104,70,0.22)', shadow: 'rgba(28,42,68,0.18)',
};

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, gap: 16,
  },
  instruction: { fontSize: 14, fontWeight: '700', color: VG.gold, textAlign: 'center', backgroundColor: CARD_WHITE, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'center' },

  emojiRefCard: {
    backgroundColor: CARD_WHITE, borderRadius: 20,
    borderWidth: 1, borderColor: VG.border,
    paddingVertical: 16, paddingHorizontal: 24,
    alignItems: 'center', width: '100%', gap: 6,
  },
  emojiRefIcon:  { fontSize: 64 },
  emojiRefLabel: { fontSize: 12, fontWeight: '600', color: VG.gold, letterSpacing: 0.5 },

  promptCard: {
    backgroundColor: VG.card, borderRadius: 20, padding: 24,
    alignItems: 'center', width: '100%',
    borderWidth: 1, borderColor: 'rgba(217,140,43,0.25)', gap: 8,
    shadowColor: VG.shadow, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18, shadowRadius: 12, elevation: 5,
  },
  questionLabel: { fontSize: 11, fontWeight: '700', color: VG.onCardMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  chinese: { fontSize: 26, fontWeight: '900', color: VG.onCard },
  pinyin:  { fontSize: 14, color: VG.orange, fontStyle: 'italic' },
  english: { fontSize: 16, fontWeight: '700', color: VG.onCard, textAlign: 'center' },
  divider: { width: '100%', height: 1, backgroundColor: 'rgba(28,42,68,0.1)', marginVertical: 8 },
  listenBtn: {
    marginTop: 4, backgroundColor: '#FFF8ED',
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(217,140,43,0.50)',
  },
  listenBtnText: { fontSize: 15, fontWeight: '700', color: VG.orange },

  // Hint
  hintToggle: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: VG.border, backgroundColor: VG.cardDark,
  },
  hintToggleOn: { borderColor: VG.yellow, backgroundColor: '#FFF8ED' },
  hintToggleText: { fontSize: 14, fontWeight: '600', color: VG.creamMuted },
  hintToggleTextOn: { color: VG.yellow },
  hintBox: {
    backgroundColor: '#FFF8ED', borderRadius: 14,
    borderWidth: 1, borderColor: VG.border,
    padding: 16, width: '100%', alignItems: 'center', gap: 4,
  },
  hintLabel:   { fontSize: 11, fontWeight: '700', color: VG.gold, textTransform: 'uppercase', letterSpacing: 0.8 },
  hintPinyin:  { fontSize: 18, color: VG.cream, fontStyle: 'italic', textAlign: 'center' },
  hintChinese: { fontSize: 24, fontWeight: '900', color: VG.cream, textAlign: 'center' },
  hintEnglish: { fontSize: 14, color: VG.creamMuted, textAlign: 'center' },
  answerEnglishBox: {
    marginTop: 12, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: 'rgba(28,42,68,0.1)',
    width: '100%', alignItems: 'center', gap: 2,
  },
  answerEnglishLabel: { fontSize: 11, fontWeight: '700', color: VG.onCardMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  answerEnglishText:  { fontSize: 16, fontWeight: '700', color: VG.onCard, textAlign: 'center' },

  attemptsText: { fontSize: 13, color: VG.creamMuted },

  micBtn: {
    backgroundColor: VG.yellow, borderRadius: 60,
    paddingHorizontal: 40, paddingVertical: 20,
    alignItems: 'center', gap: 6, width: 200,
    shadowColor: VG.shadow, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 5,
  },
  micIcon: { fontSize: 28 },
  micBtnText: { fontSize: 15, fontWeight: '800', color: CARD_WHITE },

  recordingRefCard: {
    backgroundColor: CARD_WHITE, borderRadius: 16, paddingHorizontal: 20, paddingVertical: 14,
    width: '100%', alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: 'rgba(217,140,43,0.25)',
    shadowColor: VG.shadow, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 3,
  },
  recordingRefLabel:   { fontSize: 10, fontWeight: '800', color: VG.orange, letterSpacing: 1, marginBottom: 2 },
  recordingRefChinese: { fontSize: 18, fontWeight: '900', color: VG.onCard, textAlign: 'center' },
  recordingRefPinyin:  { fontSize: 12, color: VG.orange, fontStyle: 'italic', textAlign: 'center' },
  recordingRefEnglish: { fontSize: 13, fontWeight: '600', color: VG.onCardMid, textAlign: 'center', lineHeight: 18 },

  recordingCard: {
    backgroundColor: '#fde8e8', borderRadius: 20, padding: 32,
    alignItems: 'center', width: '100%', borderWidth: 1,
    borderColor: 'rgba(196,80,58,0.3)', gap: 12,
  },
  recordingIcon: { fontSize: 40 },
  recordingHint: { fontSize: 14, color: VG.error, fontWeight: '600' },

  stopBtn: {
    backgroundColor: VG.error, borderRadius: 14, paddingHorizontal: 40, paddingVertical: 14,
  },
  stopBtnText: { fontSize: 16, fontWeight: '800', color: VG.cream },

  processingCard: {
    backgroundColor: VG.cardDark, borderRadius: 20, padding: 40,
    alignItems: 'center', width: '100%', borderWidth: 1, borderColor: VG.border, gap: 16,
  },
  processingText: { fontSize: 15, color: VG.creamMuted },

  resultCard: {
    backgroundColor: VG.card, borderRadius: 20, padding: 24,
    alignItems: 'center', width: '100%',
    borderWidth: 1, borderColor: 'rgba(217,140,43,0.25)', gap: 8,
    shadowColor: VG.shadow, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18, shadowRadius: 12, elevation: 5,
  },
  resultIcon:   { fontSize: 32 },
  accuracyPct:  { fontSize: 40, fontWeight: '900' },
  resultMsg:    { fontSize: 15, fontWeight: '700', color: VG.onCard, textAlign: 'center' },
  resultAnswer: {
    marginTop: 12, alignItems: 'center', paddingTop: 16,
    borderTopWidth: 1, borderTopColor: 'rgba(28,42,68,0.1)', width: '100%', gap: 4,
  },
  resultLabel:      { fontSize: 12, color: VG.onCardMuted, marginBottom: 4 },
  resultChinese:    { fontSize: 22, fontWeight: '900', color: VG.onCard },
  resultPinyin:     { fontSize: 13, color: VG.orange, fontStyle: 'italic' },
  resultFullAnswer: { fontSize: 14, color: 'rgba(28,42,68,0.45)', textAlign: 'center', marginTop: 2 },
  resultEnglish:    { fontSize: 13, color: VG.onCardMuted, textAlign: 'center' },
  replayBtn: {
    marginTop: 8, backgroundColor: '#FFF8ED',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(217,140,43,0.50)',
  },
  replayBtnText: { fontSize: 14, fontWeight: '600', color: VG.orange },

  resultActions: { gap: 10, width: '100%', alignItems: 'center' },
  nextBtn: {
    backgroundColor: VG.yellow, borderRadius: 14, paddingHorizontal: 48, paddingVertical: 14,
    shadowColor: VG.shadow, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22, shadowRadius: 8, elevation: 4,
  },
  nextBtnText: { fontSize: 16, fontWeight: '800', color: CARD_WHITE },

  retryBtn: {
    backgroundColor: VG.cardDark, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14,
    borderWidth: 1.5, borderColor: VG.gold,
  },
  retryBtnText: { fontSize: 15, fontWeight: '800', color: VG.gold },

  maxCard: {
    backgroundColor: VG.cardDark, borderRadius: 20, padding: 28,
    alignItems: 'center', width: '100%',
    borderWidth: 1, borderColor: 'rgba(196,80,58,0.3)', gap: 8,
  },
  maxIcon:   { fontSize: 44 },
  maxTitle:  { fontSize: 20, fontWeight: '900', color: VG.error, textAlign: 'center' },
  maxSub:    { fontSize: 14, color: VG.creamMuted, textAlign: 'center' },
  maxAnswer: { marginTop: 12, alignItems: 'center', gap: 4 },

  maxActions: { flexDirection: 'row', gap: 12, width: '100%' },
  reviewBtn: {
    flex: 1, backgroundColor: '#FFF8ED', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: VG.gold,
  },
  reviewBtnText: { fontSize: 15, fontWeight: '700', color: VG.gold },
  skipBtn: {
    flex: 1, backgroundColor: VG.cardDark, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: VG.border,
  },
  skipBtnText: { fontSize: 15, fontWeight: '700', color: VG.creamMuted },
});
