import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenBackground from '../components/ScreenBackground';
import StrokeAnimator from '../components/characters/StrokeAnimator';
import { StrokeCombo } from '../components/characters/StrokeVisual';
import StrokeWriter from '../components/characters/StrokeWriter';
import { PRACTICE_STAGES, questionsForStage, buildLessonQuiz } from '../data/characters/practiceStages';
import { getStrokePinyin } from '../data/characters/strokeAssets';
import { speakChinese } from '../utils/tts';
import { DEEP_NAVY, WARM_ORANGE, SLATE_TEAL, WARM_BROWN, CARD_WHITE, SUCCESS } from '../constants/colors';

const PASS_SCORE = 60;

const TYPE_LABELS = {
  char_to_meaning:   '🀄 Character → Meaning',
  meaning_to_char:   '💡 Meaning → Character',
  audio_to_char:     '🎧 Listen → Character',
  char_to_pinyin:    '🔤 Character → Pinyin',
  pinyin_to_char:    '✏️ Pinyin → Character',
  missing_stroke:    '🖌 Missing Stroke',
  missing_component: '🧩 Missing Component',
};

// Showing pinyin outright would hand over the answer in these: one asks you to
// match a sound, the other a reading. Pinyin is still reachable on demand via
// the dashed underline, the way a Duolingo hint works.
const NO_ANSWER_HINTS = new Set(['audio_to_char', 'pinyin_to_char', 'char_to_pinyin']);

// Hidden-but-tappable pinyin (dashed underline) applies where the answers are
// Chinese but their reading is the thing being tested.
const HINTABLE_TYPES = new Set(['audio_to_char', 'pinyin_to_char']);

// Answers are strokes, so they are shown as shapes rather than their names.
const STROKE_ANSWER_TYPES = new Set(['missing_stroke', 'missing_component']);

// The task here is listening, so the prompt plays by itself.
const AUTOPLAY_TYPES = new Set(['audio_to_char']);

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const hasHan = (t) => /[一-鿿]/.test(t || '');

// Pinyin for anything this lesson teaches, assembled from the lesson itself so
// it stays correct as content changes.
function buildPinyinMap(lessonData) {
  const m = {};
  const lc = lessonData?.learn_content || {};
  (lc.part1_discover?.strokes || []).forEach(s => { m[s.stroke] = s.pinyin; });
  (lc.part3_read?.characters || []).forEach(c => { m[c.character] = c.pinyin; });
  (lc.part4_use?.patterns || []).forEach(p => {
    m[p.word] = p.pinyin;
    (p.variations || []).forEach(v => { m[v.word] = v.pinyin; });
    if (p.quiz) m[p.quiz.result_word] = p.quiz.result_pinyin;
  });
  (lc.part2_build?.rules || []).forEach(r => { m[r.result_char] = r.result_pinyin; });
  return m;
}

export default function CharacterRecallScreen({
  lessonData,
  stageIndex = 0,
  mode = 'practice',          // 'practice' | 'quiz'
  onBack,
  onComplete,
}) {
  const quiz = mode === 'quiz';
  const stage = PRACTICE_STAGES[stageIndex] || PRACTICE_STAGES[0];
  const questions = useMemo(
    () => (quiz ? buildLessonQuiz(lessonData) : questionsForStage(lessonData, stageIndex)),
    [lessonData, stageIndex, quiz],
  );
  const pinyinMap = useMemo(() => buildPinyinMap(lessonData), [lessonData]);
  const pinyinFor = (t) => pinyinMap[t] || getStrokePinyin(t) || '';

  const [index, setIndex]     = useState(0);
  const [picked, setPicked]   = useState(null);
  const [score, setScore]     = useState(0);
  const [showResult, setShow] = useState(false);
  const [hints, setHints]     = useState({}); // which answers have had pinyin revealed

  const total = questions.length;
  const q = questions[index];
  const isWrite = q?.type === 'write';

  const { width: winW, height: winH } = useWindowDimensions();
  const canvas = Math.round(Math.min(winW - 76, winH * 0.33, 276));

  // Listening questions always speak themselves; in a quiz everything that has
  // a voice does, since the quiz is meant to exercise listening throughout.
  useEffect(() => {
    if (!q) return;
    if (q.type === 'write') { speakChinese(q.char); return; }
    const sayable = q.audio_text || (hasHan(q.prompt_char) ? q.prompt_char : null);
    if (!sayable) return;
    if (quiz || AUTOPLAY_TYPES.has(q.type)) speakChinese(sayable);
  }, [index, q, quiz]);

  if (!q && !showResult) return null;

  const pick = (choice) => {
    if (picked != null) return;
    setPicked(choice);
    if (choice === q.correct) setScore(s => s + 1);
    if (q.audio_text) speakChinese(q.audio_text);
  };

  // Writing a character counts as getting it right — the value is in doing it.
  const writeDone = () => {
    setScore(s => s + 1);
    setTimeout(() => {
      if (index + 1 >= total) setShow(true);
      else setIndex(i => i + 1);
    }, 800);
  };

  const next = () => {
    if (index + 1 >= total) { setShow(true); return; }
    setIndex(i => i + 1);
    setPicked(null);
    setHints({});
  };

  // ── Result ────────────────────────────────────────────────────────────────
  if (showResult) {
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    const passed = pct >= PASS_SCORE;
    return (
      <ScreenBackground levelId="hsk1">
        <SafeAreaView style={s.safe}>
          <StatusBar barStyle="dark-content" />
          <View style={s.resultWrap}>
            <View style={s.resultCard}>
              <Text style={s.resultEmoji}>{passed ? '🎉' : '📖'}</Text>
              <Text style={s.resultTitle}>
                {passed ? (quiz ? 'Quiz Passed!' : 'Stage Complete!') : 'Almost there'}
              </Text>
              <Text style={s.resultScore}>{score} / {total}</Text>
              <Text style={s.resultPct}>{pct}%</Text>
              <Text style={s.resultNote}>
                {passed
                  ? (quiz ? 'The next lesson is unlocked.' : 'The next stage is unlocked.')
                  : `You need ${PASS_SCORE}% to pass. Try again.`}
              </Text>
              <TouchableOpacity style={s.primaryBtn} onPress={() => onComplete(pct, passed)} activeOpacity={0.85}>
                <Text style={s.primaryBtnText}>{passed ? 'Continue' : 'Back to Lesson'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  // ── Prompt body ───────────────────────────────────────────────────────────
  // No explanatory sentence anywhere: the chip above names the question type,
  // so the prompt only ever shows the thing being asked about.
  const renderPrompt = () => {
    switch (q.type) {
      case 'audio_to_char':
        return (
          <TouchableOpacity style={s.audioBig} onPress={() => speakChinese(q.audio_text)} activeOpacity={0.8}>
            <Text style={s.audioBigIcon}>🔊</Text>
          </TouchableOpacity>
        );

      case 'pinyin_to_char':
        return <Text style={s.promptPinyin}>{q.prompt_pinyin}</Text>;

      case 'meaning_to_char':
        return <Text style={s.promptEn}>{q.prompt_en || q.question}</Text>;

      case 'missing_stroke':
        return (
          <View style={s.promptInner}>
            <StrokeAnimator char={q.prompt_char} size={104} revealUpTo={(q.shown_strokes || []).length} colored />
            <View style={s.equationRow}>
              {(q.shown_strokes || []).map((st, i) => (
                <React.Fragment key={`${st}-${i}`}>
                  {i > 0 && <Text style={s.eqSign}>+</Text>}
                  <View style={s.eqCell}><StrokeCombo value={st} size={28} /></View>
                </React.Fragment>
              ))}
              <Text style={s.eqSign}>+</Text>
              <View style={[s.eqCell, s.eqCellBlank]}><Text style={s.eqQ}>?</Text></View>
              <Text style={s.eqSign}>=</Text>
              <Text style={s.eqResult}>{q.prompt_char}</Text>
            </View>
          </View>
        );

      case 'missing_component':
        return (
          <View style={s.equationRow}>
            <Text style={s.eqResult}>{q.shown_component}</Text>
            <Text style={s.eqSign}>+</Text>
            <View style={[s.eqCell, s.eqCellBlank]}><Text style={s.eqQ}>?</Text></View>
            <Text style={s.eqSign}>=</Text>
            <Text style={s.eqResult}>{q.prompt_char}</Text>
          </View>
        );

      default:
        if (!q.prompt_char) return null;
        return (
          <View style={s.promptInner}>
            <Text style={s.promptChar}>{q.prompt_char}</Text>
            {hasHan(q.prompt_char) && (
              <TouchableOpacity
                style={s.promptAudioBtn}
                onPress={() => speakChinese(q.audio_text || q.prompt_char)}
                activeOpacity={0.8}
              >
                <Text style={s.promptAudioText}>🔊</Text>
              </TouchableOpacity>
            )}
          </View>
        );
    }
  };

  // ── A write question ──────────────────────────────────────────────────────
  if (isWrite) {
    const wProgress = total > 0 ? (index / total) * 100 : 0;
    return (
      <ScreenBackground levelId="hsk1">
        <SafeAreaView style={s.safe}>
          <StatusBar barStyle="dark-content" />
          <View style={s.header}>
            <TouchableOpacity onPress={onBack} style={s.backBtn}>
              <Text style={s.backBtnText}>← Exit</Text>
            </TouchableOpacity>
            <Text style={s.headerTitle}>{index + 1} / {total}</Text>
            <Text style={s.headerScore}>{score} ✓</Text>
          </View>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${wProgress}%` }]} />
          </View>

          <View style={s.writeStage}>
            <Text style={s.typeLabel}>{quiz ? '📝 Lesson Quiz' : `${stage.icon} ${stage.name}`}</Text>
            <View style={s.writeHead}>
              <Text style={s.writeChar}>{q.char}</Text>
              <Text style={s.writePinyin}>{pinyinFor(q.char)}</Text>
              <TouchableOpacity onPress={() => speakChinese(q.char)} activeOpacity={0.7}>
                <Text style={s.writeAudio}>🔊</Text>
              </TouchableOpacity>
            </View>
            {/* No reference animation here — this stage is from memory. */}
            <StrokeWriter
              key={`${index}-${q.char}`}
              char={q.char}
              size={canvas}
              onComplete={writeDone}
            />
          </View>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  // In a quiz, Meaning → Character withholds pinyin too: it is a test, not practice.
  const showAnswerHints = !NO_ANSWER_HINTS.has(q.type)
    && !(quiz && q.type === 'meaning_to_char');
  const progress = total > 0 ? (index / total) * 100 : 0;

  return (
    <ScreenBackground levelId="hsk1">
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="dark-content" />

        <View style={s.header}>
          <TouchableOpacity onPress={onBack} style={s.backBtn}>
            <Text style={s.backBtnText}>← Exit</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>{index + 1} / {total}</Text>
          <Text style={s.headerScore}>{score} ✓</Text>
        </View>

        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${progress}%` }]} />
        </View>

        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <Text style={s.typeLabel}>{quiz ? '📝 Lesson Quiz' : `${stage.icon} ${stage.name}`}</Text>

          {/* Question frame — warm cream, deliberately a different colour from
              the white answer buttons so the prompt never blends into the art. */}
          <View style={[s.questionFrame, STROKE_ANSWER_TYPES.has(q.type) && s.questionFrameCompact]}>
            {renderPrompt()}
          </View>

          <View style={s.choices}>
            {q.choices.map(c => {
              const isPicked  = picked === c;
              const isCorrect = c === q.correct;
              const reveal    = picked != null;
              const asStroke  = STROKE_ANSWER_TYPES.has(q.type);
              const py        = showAnswerHints ? pinyinFor(c) : '';
              const canSpeak  = (showAnswerHints || asStroke) && hasHan(c);
              const hintable  = HINTABLE_TYPES.has(q.type) && hasHan(c) && !!pinyinFor(c);
              const hinted    = hints[c];
              return (
                <TouchableOpacity
                  key={c}
                  style={[
                    s.choice,
                    asStroke && s.choiceCompact,
                    reveal && isCorrect && s.choiceRight,
                    reveal && isPicked && !isCorrect && s.choiceWrong,
                  ]}
                  onPress={() => pick(c)}
                  activeOpacity={reveal ? 1 : 0.8}
                >
                  <View style={s.choiceMain}>
                    {asStroke ? (
                      <StrokeCombo value={c} size={38} />
                    ) : hintable ? (
                      // Duolingo-style hint: dashed underline, tap to reveal the
                      // reading without it being given away up front.
                      <TouchableOpacity
                        onPress={() => setHints(h => ({ ...h, [c]: !h[c] }))}
                        activeOpacity={0.6}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={[s.choiceText, s.choiceTextBig, s.choiceHintable]}>{c}</Text>
                        {hinted && <Text style={s.choicePinyin}>{pinyinFor(c)}</Text>}
                      </TouchableOpacity>
                    ) : (
                      <>
                        <Text style={s.choiceText}>{c}</Text>
                        {!!py && <Text style={s.choicePinyin}>{py}</Text>}
                      </>
                    )}
                    {asStroke && !!getStrokePinyin(c) && (
                      <Text style={s.choicePinyin}>{getStrokePinyin(c)}</Text>
                    )}
                  </View>
                  {canSpeak && (
                    <TouchableOpacity
                      onPress={() => speakChinese(c)}
                      style={s.choiceAudioBtn}
                      activeOpacity={0.6}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={s.choiceAudioIcon}>🔊</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {picked != null && (
            <TouchableOpacity style={s.primaryBtn} onPress={next} activeOpacity={0.85}>
              <Text style={s.primaryBtnText}>
                {index + 1 >= total ? 'See Results' : 'Next →'}
              </Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: CARD_WHITE,
  },
  backBtn:     { paddingVertical: 8, paddingRight: 12 },
  backBtnText: { fontSize: 15, fontWeight: '600', color: WARM_BROWN },
  headerTitle: { fontSize: 15, fontWeight: '800', color: DEEP_NAVY },
  headerScore: { fontSize: 14, fontWeight: '700', color: SUCCESS, width: 60, textAlign: 'right' },

  progressTrack: { height: 4, backgroundColor: 'rgba(155,104,70,0.15)' },
  progressFill:  { height: 4, backgroundColor: WARM_ORANGE },

  content: { padding: 20, alignItems: 'center' },

  writeStage: { flex: 1, alignItems: 'center', paddingTop: 16, paddingHorizontal: 20, gap: 14 },
  // Framed like every other question prompt, so it reads against the artwork.
  writeHead: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    backgroundColor: '#FFF3E0', borderRadius: 16,
    paddingHorizontal: 22, paddingVertical: 12,
    borderWidth: 1.5, borderColor: 'rgba(155,104,70,0.35)',
  },
  writeChar:  { fontSize: 44, fontWeight: '900', color: DEEP_NAVY },
  writePinyin:{ fontSize: 20, fontWeight: '700', color: WARM_BROWN },
  writeAudio: { fontSize: 26 },

  typeLabel: {
    fontSize: 11, fontWeight: '800', color: SLATE_TEAL, letterSpacing: 1,
    backgroundColor: CARD_WHITE, paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 8, marginBottom: 14, overflow: 'hidden',
  },

  // Question frame (cream) vs answer buttons (white)
  questionFrame: {
    width: '100%', alignItems: 'center', gap: 12,
    backgroundColor: '#FFF3E0', borderRadius: 16, padding: 18,
    borderWidth: 1.5, borderColor: 'rgba(155,104,70,0.35)',
  },
  questionFrameCompact: { padding: 12, gap: 8 },
  promptInner: { alignItems: 'center', gap: 8 },

  promptChar:   { fontSize: 76, fontWeight: '900', color: DEEP_NAVY, textAlign: 'center' },
  promptPinyin: { fontSize: 46, fontWeight: '900', color: WARM_BROWN, textAlign: 'center' },
  promptEn:     { fontSize: 34, fontWeight: '900', color: WARM_ORANGE, textAlign: 'center' },
  promptAudioBtn: {
    backgroundColor: SLATE_TEAL, borderRadius: 10,
    paddingVertical: 8, paddingHorizontal: 18,
  },
  promptAudioText: { color: CARD_WHITE, fontWeight: '800', fontSize: 16 },

  // 大 + ? = 天
  equationRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    flexWrap: 'wrap', gap: 6,
  },
  eqCell: {
    minWidth: 40, height: 40, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: CARD_WHITE, borderWidth: 1.5, borderColor: 'rgba(155,104,70,0.25)',
  },
  eqCellBlank: { borderStyle: 'dashed' },
  eqQ:         { fontSize: 19, fontWeight: '900', color: SLATE_TEAL },
  eqSign:      { fontSize: 17, fontWeight: '800', color: SLATE_TEAL, marginHorizontal: 2 },
  eqResult:    { fontSize: 34, fontWeight: '900', color: DEEP_NAVY },

  audioBig: {
    width: 130, height: 130, borderRadius: 65, backgroundColor: CARD_WHITE,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(155,104,70,0.25)',
  },
  audioBigIcon: { fontSize: 52 },

  choices: { width: '100%', gap: 10, marginTop: 22 },
  choice: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: CARD_WHITE, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18,
    borderWidth: 1.5, borderColor: 'rgba(155,104,70,0.22)',
  },
  choiceCompact: { paddingVertical: 8, paddingHorizontal: 14 },
  choiceMain:   { flex: 1, alignItems: 'center' },
  choiceRight:  { backgroundColor: 'rgba(46,125,50,0.18)', borderColor: SUCCESS, borderWidth: 2.5 },
  choiceWrong:  { backgroundColor: 'rgba(196,80,58,0.15)', borderColor: '#C4503A', borderWidth: 2.5 },
  choiceText:   { fontSize: 20, fontWeight: '800', color: DEEP_NAVY, textAlign: 'center' },
  // Listen→Character and Pinyin→Character: the glyph is the whole answer.
  choiceTextBig: { fontSize: 28, lineHeight: 36 },
  // Dashed underline signals "tap me for the reading", Duolingo-style.
  choiceHintable: {
    borderBottomWidth: 1.5, borderBottomColor: SLATE_TEAL, borderStyle: 'dashed',
    paddingBottom: 2,
  },
  choicePinyin: { fontSize: 14, color: WARM_BROWN, marginTop: 3, textAlign: 'center' },
  choiceAudioBtn:  { paddingLeft: 10 },
  choiceAudioIcon: { fontSize: 22 },

  primaryBtn: {
    width: '100%', backgroundColor: SLATE_TEAL, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center', marginTop: 20,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '800', color: CARD_WHITE },

  resultWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  resultCard: {
    width: '100%', alignItems: 'center', backgroundColor: CARD_WHITE,
    borderRadius: 20, padding: 28,
    borderWidth: 1.5, borderColor: 'rgba(155,104,70,0.25)',
  },
  resultEmoji: { fontSize: 64, marginBottom: 8 },
  resultTitle: { fontSize: 24, fontWeight: '900', color: DEEP_NAVY, marginBottom: 12 },
  resultScore: { fontSize: 40, fontWeight: '900', color: WARM_BROWN },
  resultPct:   { fontSize: 18, fontWeight: '700', color: SLATE_TEAL, marginBottom: 12 },
  resultNote:  { fontSize: 15, color: SLATE_TEAL, textAlign: 'center', lineHeight: 21 },
});
