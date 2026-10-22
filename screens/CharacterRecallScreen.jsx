import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar,
  useWindowDimensions, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenBackground from '../components/ScreenBackground';
import StrokeAnimator, { strokeCount } from '../components/characters/StrokeAnimator';
import { StrokeCombo } from '../components/characters/StrokeVisual';
import StrokeWriter from '../components/characters/StrokeWriter';
import { ReadAloud } from '../components/characters/LessonTwoParts';
import MatchPairsExercise from '../components/exercises/MatchPairsExercise';
import { stagesFor, questionsForStage, buildLessonQuiz } from '../data/characters/practiceStages';
import { getStrokePinyin } from '../data/characters/strokeAssets';
import { getCharacterReading, getCharacterStrokeOrder } from '../data/characters';
import { speakChinese } from '../utils/tts';
import { DEEP_NAVY, WARM_ORANGE, SLATE_TEAL, WARM_BROWN, CARD_WHITE, SUCCESS } from '../constants/colors';

const PASS_SCORE = 60;

// Height of the question body for the two types that must match each other:
// a Chinese character (glyph 74 + gap 8 + its 🔊 button 28) and a listen
// question, whose circle is sized to the same number.
const PROMPT_BODY = 110;

// The question frame is a fixed size. Rather than letting a long prompt wrap
// and push it taller, the text scales down until it fits on one line — so
// every question of a given type occupies exactly the same box, whether it is
// one character or a whole sentence.
//   1-4 characters keep the full size; a 7-character sentence shrinks to fit.
// `em` is how wide one character runs at a given point size: a CJK glyph is
// square, Latin averages a little over half that.
const PROMPT_PADDING = 76;   // screen padding 20×2 + frame padding 18×2

function fitFontSize(text, available, max, min, em) {
  const count = [...(text || '')].length || 1;
  const fit = Math.floor(available / (count * em));
  return Math.max(min, Math.min(max, fit));
}

const TYPE_LABELS = {
  char_to_meaning:   '🀄 Character → Meaning',
  meaning_to_char:   '💡 Meaning → Character',
  audio_to_char:     '🎧 Listen → Character',
  char_to_pinyin:    '🔤 Character → Pinyin',
  pinyin_to_char:    '✏️ Pinyin → Character',
  missing_stroke:    '🖌 Missing Stroke',
  missing_component: '🧩 Missing Component',
  char_to_radical:   '🧩 Character → Radical',
  read_aloud:        '🎤 Read Aloud',
  matching:          '🔗 Match the Pairs',
  sentence_build:    '🧱 Build the Sentence',
  word_build:        '➕ Complete the Word',
};

// Some questions show a Chinese character and want something other than a
// reading back. Without a line saying so, "你 🔊" with 亻口女日 underneath
// looks identical to a question asking what 你 means.
const PROMPT_LINES = {
  sentence_build:  'Tap the words in the right order.',
  word_build:      'Which character completes it?',
  char_to_radical: 'Which radical does this character carry?',
  char_to_meaning: 'What does this mean?',
  char_to_pinyin:  'How is this read?',
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

// Answers are English prose, which reads larger than pinyin at the same point
// size and so gets a size of its own. Pinyin answers (char_to_pinyin) stay on
// the base size — they are short Latin tokens, not sentences.
const EN_ANSWER_TYPES = new Set(['char_to_meaning']);

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
  // Sentences carry readings for words the lesson uses but does not teach —
  // 是 appears in every Lesson 10 sentence without being a taught character.
  (lc.part4_use?.sentences || []).forEach(st => {
    m[st.sentence] = st.pinyin;
    if (st.reply) m[st.reply.sentence] = st.reply.pinyin;
    (st.breakdown || []).forEach(b => { m[b.part] = b.pinyin; });
  });
  return m;
}

// Tap the words in order to build the sentence.
function SentenceBuildQuestion({ q, onDone }) {
  const [tiles, setTiles] = useState([]);
  // The data lists the tiles in the order they belong, so they have to be
  // shuffled before they are shown — otherwise the answer is just "left to
  // right". Shuffled once per question, not on every render.
  const [offered] = useState(() => shuffle(q.tiles));
  const done = tiles.length >= q.answer.length;
  const right = done && tiles.join('') === q.answer.join('');

  useEffect(() => { if (done) onDone(right); }, [done]);

  return (
    <View style={{ gap: 14, width: '100%' }}>
      <View style={s.slotRow}>
        {q.answer.map((_, i) => (
          <View
            key={i}
            style={[
              s.slot,
              tiles[i] && s.slotFilled,
              done && (tiles[i] === q.answer[i] ? s.slotRight : s.slotWrong),
            ]}
          >
            <Text style={[s.slotText, done && tiles[i] && s.slotTextLit]}>
              {tiles[i] || '?'}
            </Text>
          </View>
        ))}
      </View>
      <View style={s.tileRow}>
        {offered.map(t => (
          <TouchableOpacity
            key={t}
            style={[s.tile, tiles.includes(t) && s.tileUsed]}
            onPress={() => {
              if (tiles.includes(t) || done) return;
              speakChinese(t);
              setTiles([...tiles, t]);
            }}
            activeOpacity={0.8}
          >
            <Text style={s.tileText}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {done && (
        <View style={[s.feedback, right ? s.feedbackRight : s.feedbackWrong]}>
          <Text style={s.feedbackIcon}>{right ? '✓' : '✕'}</Text>
          <Text style={[s.feedbackText, right ? s.feedbackTextRight : s.feedbackTextWrong]}>
            {right ? `${q.result}  ${q.pinyin}` : `Not quite — ${q.result}`}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function CharacterRecallScreen({
  lessonData,
  stageIndex = 0,
  mode = 'practice',          // 'practice' | 'quiz'
  onBack,
  onComplete,
}) {
  const quiz = mode === 'quiz';
  // Each half of the course has its own stage list.
  const allStages = stagesFor(lessonData?.id || 1);
  const stage = allStages[stageIndex] || allStages[0];
  const questions = useMemo(
    () => (quiz ? buildLessonQuiz(lessonData) : questionsForStage(lessonData, stageIndex)),
    [lessonData, stageIndex, quiz],
  );
  const pinyinMap = useMemo(() => buildPinyinMap(lessonData), [lessonData]);
  const pinyinFor = (t) => pinyinMap[t] || getCharacterReading(t) || getStrokePinyin(t) || '';

  const [index, setIndex]     = useState(0);
  const [picked, setPicked]   = useState(null);
  const [score, setScore]     = useState(0);
  const [showResult, setShow] = useState(false);
  const [hints, setHints]     = useState({}); // which answers have had pinyin revealed

  const total = questions.length;
  const q = questions[index];
  const isWrite = q?.type === 'write';
  const isRead  = q?.type === 'read_aloud';
  // Answered in one gesture each, so they score themselves rather than
  // going through pick().
  const isSelfScored = q?.type === 'matching' || q?.type === 'sentence_build';

  const { width: winW, height: winH } = useWindowDimensions();
  const promptWidth = winW - PROMPT_PADDING;
  const canvas = Math.round(Math.min(winW - 76, winH * 0.33, 276));

  // Listening questions always speak themselves; in a quiz everything that has
  // a voice does, since the quiz is meant to exercise listening throughout.
  useEffect(() => {
    if (!q) return;
    if (q.type === 'write') { speakChinese(q.char, 'female', pinyinFor(q.char)); return; }
    const sayable = q.audio_text || (hasHan(q.prompt_char) ? q.prompt_char : null);
    if (!sayable) return;
    if (quiz || AUTOPLAY_TYPES.has(q.type)) speakChinese(sayable, 'female', pinyinFor(sayable));
  }, [index, q, quiz]);

  if (!q && !showResult) return null;

  const pick = (choice) => {
    if (picked != null) return;
    setPicked(choice);
    if (choice === q.correct) setScore(s => s + 1);
    if (q.audio_text) speakChinese(q.audio_text, 'female', pinyinFor(q.audio_text));
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
          <TouchableOpacity style={s.audioBig} onPress={() => speakChinese(q.audio_text, 'female', pinyinFor(q.audio_text))} activeOpacity={0.8}>
            <Text style={s.audioBigIcon}>🔊</Text>
          </TouchableOpacity>
        );

      case 'pinyin_to_char': {
        const size = fitFontSize(q.prompt_pinyin, promptWidth, 46, 22, 0.55);
        return (
          <Text style={[s.promptPinyin, { fontSize: size, lineHeight: Math.round(size * 1.25) }]}>
            {q.prompt_pinyin}
          </Text>
        );
      }

      case 'meaning_to_char': {
        const text = q.prompt_en || q.question;
        const size = fitFontSize(text, promptWidth, 34, 18, 0.55);
        return (
          <Text style={[s.promptEn, { fontSize: size, lineHeight: Math.round(size * 1.3) }]}>
            {text}
          </Text>
        );
      }

      case 'missing_stroke': {
        // The blank can sit anywhere, so every OTHER stroke is drawn — before
        // it and after it. The question data only stores the strokes up to the
        // blank, so the rest comes from the course-wide stroke-order lookup.
        const blank = (q.shown_strokes || []).length;
        const order = getCharacterStrokeOrder(q.prompt_char);
        // hideStroke draws the finished character minus the quizzed stroke,
        // and leaves out its grey silhouette too so the shape isn't given away.
        return (
          <View style={s.promptInner}>
            <StrokeAnimator char={q.prompt_char} size={104} hideStroke={blank} colored />
            <View style={s.equationRow}>
              {order
                ? order.map((st, i) => (
                    <React.Fragment key={`${st}-${i}`}>
                      {i > 0 && <Text style={s.eqSign}>+</Text>}
                      {i === blank
                        ? <View style={[s.eqCell, s.eqCellBlank]}><Text style={s.eqQ}>?</Text></View>
                        : <View style={s.eqCell}><StrokeCombo value={st} size={28} /></View>}
                    </React.Fragment>
                  ))
                : (
                  // No order on record: fall back to the strokes we do have,
                  // with the remainder as muted placeholders so the equation
                  // still adds up to the real stroke count.
                  <>
                    {(q.shown_strokes || []).map((st, i) => (
                      <React.Fragment key={`${st}-${i}`}>
                        {i > 0 && <Text style={s.eqSign}>+</Text>}
                        <View style={s.eqCell}><StrokeCombo value={st} size={28} /></View>
                      </React.Fragment>
                    ))}
                    {blank > 0 && <Text style={s.eqSign}>+</Text>}
                    <View style={[s.eqCell, s.eqCellBlank]}><Text style={s.eqQ}>?</Text></View>
                    {Array.from({ length: Math.max(0, strokeCount(q.prompt_char) - blank - 1) }).map((_, i) => (
                      <React.Fragment key={`rest-${i}`}>
                        <Text style={s.eqSign}>+</Text>
                        <View style={[s.eqCell, s.eqCellRest]}><Text style={s.eqRestDot}>·</Text></View>
                      </React.Fragment>
                    ))}
                  </>
                )}
              <Text style={s.eqSign}>=</Text>
              <Text style={s.eqResult}>{q.prompt_char}</Text>
            </View>
          </View>
        );
      }

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

      // These carry their whole question in the answer area.
      case 'matching':
        return null;

      case 'word_build':
        return (
          <View style={s.promptInner}>
            <View style={s.equationRow}>
              {q.template.map((t, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <Text style={s.eqSign}>+</Text>}
                  {t == null
                    ? <View style={[s.eqCell, s.eqCellBlank]}><Text style={s.eqQ}>?</Text></View>
                    : <View style={s.eqCell}><Text style={s.eqCellText}>{t}</Text></View>}
                </React.Fragment>
              ))}
              <Text style={s.eqSign}>=</Text>
            </View>
            <Text style={s.wordBuildMeaning}>{q.result_meaning}</Text>
          </View>
        );

      case 'sentence_build':
        return (
          <View style={s.promptInner}>
            <Text style={s.promptEn}>{q.prompt_en}</Text>
          </View>
        );

      default: {
        if (!q.prompt_char) return null;
        // A single glyph gets the full 60; a sentence shrinks to the same box.
        const size = fitFontSize(q.prompt_char, promptWidth, 60, 26, 1);
        return (
          <View style={s.promptInner}>
            <Text style={[s.promptChar, { fontSize: size, lineHeight: Math.round(size * 1.24) }]}>
              {q.prompt_char}
            </Text>
            {hasHan(q.prompt_char) && (
              <TouchableOpacity
                style={s.promptAudioBtn}
                onPress={() => speakChinese(q.audio_text || q.prompt_char, 'female', pinyinFor(q.audio_text || q.prompt_char))}
                activeOpacity={0.8}
              >
                <Text style={s.promptAudioText}>🔊</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      }
    }
  };

  // ── A write question ──────────────────────────────────────────────────────
  // Saying a word aloud, scored the same way writing one is: completing it
  // counts. Same component as Part 3, so the two behave identically.
  if (isRead) {
    const rProgress = total > 0 ? (index / total) * 100 : 0;
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
            <View style={[s.progressFill, { width: `${rProgress}%` }]} />
          </View>

          <ScrollView key={index} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
            <Text style={s.typeLabel}>{quiz ? '📝 Lesson Quiz' : `${stage.icon} ${stage.name}`}</Text>
            <ReadAloud
              key={index}
              item={{
                text: q.prompt_char,
                pinyin: q.pinyin || pinyinFor(q.prompt_char),
                meaning: q.meaning,
                audio_text: q.audio_text || q.prompt_char,
                intro: 'Listen, then read it aloud.',
              }}
            />
            <TouchableOpacity style={s.primaryBtn} onPress={() => { setScore(x => x + 1); next(); }} activeOpacity={0.85}>
              <Text style={s.primaryBtnText}>
                {index + 1 >= total ? 'See Results' : 'Next →'}
              </Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

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
              <TouchableOpacity onPress={() => speakChinese(q.char, 'female', pinyinFor(q.char))} activeOpacity={0.7}>
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

  // Matching and sentence-building report their own result when complete.
  const selfScore = (right) => {
    if (picked != null) return;
    setPicked(right ? '__right__' : '__wrong__');
    if (right) setScore(x => x + 1);
  };

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

        {/* Keyed on the question so each one opens at the top. */}
        <ScrollView key={index} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <Text style={s.typeLabel}>{quiz ? '📝 Lesson Quiz' : `${stage.icon} ${stage.name}`}</Text>

          {/* Question frame — warm cream, deliberately a different colour from
              the white answer buttons so the prompt never blends into the art. */}
          <View style={[s.questionFrame, STROKE_ANSWER_TYPES.has(q.type) && s.questionFrameCompact]}>
            {PROMPT_LINES[q.type] ? (
              <Text style={s.promptLine}>{PROMPT_LINES[q.type]}</Text>
            ) : null}
            {renderPrompt()}
          </View>

          {isSelfScored ? (
            <View style={s.choices}>
              {q.type === 'matching'
                ? (
                  <MatchPairsExercise
                    key={index}
                    exercise={{ pairs: q.pairs }}
                    onComplete={() => selfScore(true)}
                  />
                )
                : <SentenceBuildQuestion key={index} q={q} onDone={selfScore} />}
            </View>
          ) : (
          <>
          {/* Once answered, the distractors have done their job and only get in
              the way of reading the result: keep the correct answer, plus the
              wrong one if that is what was picked. A correct pick leaves one
              button, a wrong pick two. */}
          <View style={s.choices}>
            {(picked == null
              ? q.choices
              : q.choices.filter(c => c === picked || c === q.correct)
            ).map(c => {
              const isPicked  = picked === c;
              const isCorrect = c === q.correct;
              const reveal    = picked != null;
              const asStroke  = STROKE_ANSWER_TYPES.has(q.type);
              const py        = showAnswerHints ? pinyinFor(c) : '';
              const canSpeak  = (showAnswerHints || asStroke) && hasHan(c);
              const hintable  = HINTABLE_TYPES.has(q.type) && hasHan(c) && !!pinyinFor(c);
              const hinted    = hints[c];
              // Filled green or red: the text on top has to switch to white.
              const lit       = reveal && (isCorrect || isPicked);
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
                        <Text style={[
                          s.choiceText, s.choiceTextCn, s.choiceHintable,
                          lit && s.choiceTextLit, lit && s.choiceHintableLit,
                        ]}>{c}</Text>
                        {hinted && <Text style={[s.choicePinyin, lit && s.choicePinyinLit]}>{pinyinFor(c)}</Text>}
                      </TouchableOpacity>
                    ) : (
                      <>
                        {/* One style cannot serve all three: a Chinese glyph, an
                            English phrase and a pinyin token read at very
                            different sizes for the same point size. */}
                        <Text style={[
                          s.choiceText,
                          hasHan(c) ? s.choiceTextCn : EN_ANSWER_TYPES.has(q.type) && s.choiceTextEn,
                          lit && s.choiceTextLit,
                        ]}>{c}</Text>
                        {!!py && <Text style={[s.choicePinyin, lit && s.choicePinyinLit]}>{py}</Text>}
                      </>
                    )}
                    {asStroke && !!getStrokePinyin(c) && (
                      <Text style={[s.choicePinyin, lit && s.choicePinyinLit]}>{getStrokePinyin(c)}</Text>
                    )}
                  </View>
                  {canSpeak && (
                    <TouchableOpacity
                      onPress={() => speakChinese(c, 'female', pinyinFor(c))}
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
          </>
          )}

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
  // The frame itself has no fixed height — it grows with whatever is inside,
  // so an English question sits in a short frame and a long one in a taller.
  // The exception is the pair below: a Chinese-character question and a listen
  // question are given the same body height (PROMPT_BODY) so the page does not
  // jump as you move between them.
  promptInner: { alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: PROMPT_BODY },

  // sentence building
  slotRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 6 },
  slot: {
    minWidth: 58, height: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(155,104,70,0.35)',
    backgroundColor: CARD_WHITE,
  },
  slotFilled: { borderStyle: 'solid', borderColor: WARM_ORANGE },
  // Same strength as the answer buttons, so a filled slot reads as a verdict
  // rather than a tint — which means the glyph on top has to go white.
  slotRight:  { backgroundColor: 'rgba(46,125,50,0.7)', borderColor: SUCCESS },
  slotWrong:  { backgroundColor: 'rgba(196,80,58,0.7)', borderColor: '#C4503A' },
  slotText:    { fontSize: 22, fontWeight: '900', color: DEEP_NAVY },
  slotTextLit: { color: CARD_WHITE },
  tileRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  tile: {
    minWidth: 58, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
    backgroundColor: CARD_WHITE, borderWidth: 1.5, borderColor: 'rgba(155,104,70,0.3)',
    alignItems: 'center',
  },
  tileUsed:  { opacity: 0.35 },
  tileText:  { fontSize: 22, fontWeight: '900', color: DEEP_NAVY },
  feedback:  { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, padding: 10 },
  feedbackRight:     { backgroundColor: 'rgba(46,125,50,0.12)' },
  feedbackWrong:     { backgroundColor: 'rgba(196,80,58,0.10)' },
  feedbackIcon:      { fontSize: 16, fontWeight: '900' },
  feedbackText:      { flex: 1, fontSize: 15, fontWeight: '700' },
  feedbackTextRight: { color: '#2E7D32' },
  feedbackTextWrong: { color: '#C4503A' },

  eqCellText:        { fontSize: 24, fontWeight: '900', color: DEEP_NAVY },
  wordBuildMeaning:  { fontSize: 18, fontWeight: '800', color: WARM_ORANGE, textAlign: 'center' },

  // Says what the question wants, for the types where the prompt alone
  // does not make that obvious.
  promptLine: {
    fontSize: 15, fontWeight: '700', color: SLATE_TEAL,
    textAlign: 'center', marginBottom: -4,
  },
  promptChar:   { fontSize: 60, lineHeight: 74, fontWeight: '900', color: DEEP_NAVY, textAlign: 'center' },
  promptPinyin: { fontSize: 46, fontWeight: '900', color: WARM_BROWN, textAlign: 'center' },
  promptEn:     { fontSize: 34, fontWeight: '900', color: WARM_ORANGE, textAlign: 'center' },
  promptAudioBtn: {
    backgroundColor: SLATE_TEAL, borderRadius: 10,
    paddingVertical: 6, paddingHorizontal: 14,
  },
  promptAudioText: { color: CARD_WHITE, fontWeight: '800', fontSize: 12 },

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
  // A stroke that comes after the blank: present, but not the thing being asked.
  eqCellRest:  { backgroundColor: 'rgba(55,73,80,0.06)', borderColor: 'rgba(155,104,70,0.15)' },
  eqRestDot:   { fontSize: 15, fontWeight: '900', color: 'rgba(55,73,80,0.35)' },
  eqQ:         { fontSize: 19, fontWeight: '900', color: SLATE_TEAL },
  eqSign:      { fontSize: 17, fontWeight: '800', color: SLATE_TEAL, marginHorizontal: 2 },
  eqResult:    { fontSize: 34, fontWeight: '900', color: DEEP_NAVY },

  audioBig: {
    width: PROMPT_BODY, height: PROMPT_BODY, borderRadius: PROMPT_BODY / 2, backgroundColor: CARD_WHITE,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(155,104,70,0.25)',
  },
  audioBigIcon: { fontSize: 40 },

  choices: { width: '100%', gap: 10, marginTop: 22 },
  choice: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: CARD_WHITE, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18,
    borderWidth: 1.5, borderColor: 'rgba(155,104,70,0.22)',
  },
  choiceCompact: { paddingVertical: 10, paddingHorizontal: 14 },
  choiceMain:   { flex: 1, alignItems: 'center' },
  // Once the distractors are filtered away the result is the only thing on
  // screen, so it reads as a solid verdict rather than a faint tint. At this
  // strength the navy text no longer has the contrast to sit on top, so
  // anything inside a filled button switches to white — see `lit` above.
  choiceRight:  { backgroundColor: 'rgba(46,125,50,0.7)', borderColor: SUCCESS, borderWidth: 2.5 },
  choiceWrong:  { backgroundColor: 'rgba(196,80,58,0.7)', borderColor: '#C4503A', borderWidth: 2.5 },
  choiceTextLit:     { color: CARD_WHITE },
  choicePinyinLit:   { color: 'rgba(255,255,255,0.92)' },
  choiceHintableLit: { borderBottomColor: 'rgba(255,255,255,0.75)' },
  // Answer text comes in three sizes and only three: Chinese 28, pinyin 26,
  // English 24. Every question type picks one of them, so a bare character is
  // the same size whichever question is asking for it.
  choiceText:   { fontSize: 26, lineHeight: 34, fontWeight: '800', color: DEEP_NAVY, textAlign: 'center' },
  choiceTextCn: { fontSize: 28, lineHeight: 36 },
  choiceTextEn: { fontSize: 22, lineHeight: 29 },
  // Dashed underline signals "tap me for the reading", Duolingo-style.
  choiceHintable: {
    borderBottomWidth: 1.5, borderBottomColor: SLATE_TEAL, borderStyle: 'dashed',
    paddingBottom: 2,
  },
  choicePinyin: { fontSize: 14, color: WARM_BROWN, marginTop: 4, textAlign: 'center' },
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
