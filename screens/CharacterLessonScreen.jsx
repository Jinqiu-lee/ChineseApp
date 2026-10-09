import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenBackground from '../components/ScreenBackground';
import StrokeAnimator from '../components/characters/StrokeAnimator';
import StrokeVisual, { StrokeCombo } from '../components/characters/StrokeVisual';
import StrokeWriter from '../components/characters/StrokeWriter';
import { getStrokeVisual, getRuleVisual, getStrokePinyin } from '../data/characters/strokeAssets';
import { speakChinese } from '../utils/tts';
import { DEEP_NAVY, WARM_ORANGE, SLATE_TEAL, WARM_BROWN, CARD_WHITE, SUCCESS } from '../constants/colors';

// One prominent size shared by Parts 1-3 so every animation reads the same.
const ART = 180;
const CHOICE_ART = 60;

// Shown under any question once an answer has been picked: says whether it was
// right and, if not, names the correct answer.
function AnswerFeedback({ picked, correct, label }) {
  if (picked == null) return null;
  const right = picked === correct;
  return (
    <View style={[s.feedback, right ? s.feedbackRight : s.feedbackWrong]}>
      <Text style={s.feedbackIcon}>{right ? '✓' : '✕'}</Text>
      <Text style={[s.feedbackText, right ? s.feedbackTextRight : s.feedbackTextWrong]}>
        {right ? 'Correct' : `Not quite — the answer is ${label ? label(correct) : correct}`}
      </Text>
    </View>
  );
}

// Label a stroke or combination by its pinyin, for feedback text.
function strokeLabel(value) {
  return value
    .split('+')
    .map(p => p.trim())
    .map(p => `${p} ${getStrokePinyin(p)}`.trim())
    .join(' + ');
}

// A tappable answer showing the stroke's shape instead of its Chinese name.
// Once answered, the chosen one is marked and the correct one is revealed.
function StrokeChoiceRow({ choices, correct, picked, onPick }) {
  const answered = picked != null;
  return (
    <>
      <View style={s.choiceRow}>
        {choices.map(c => {
          const chosen   = picked === c;
          const right    = c === correct;
          const compound = c.includes('+');
          return (
            <TouchableOpacity
              key={c}
              style={[
                s.strokeChoice,
                compound && s.strokeChoiceWide,
                answered && right && s.choiceRight,
                answered && chosen && !right && s.choiceWrong,
              ]}
              onPress={() => !answered && onPick(c)}
              activeOpacity={answered ? 1 : 0.8}
            >
              <StrokeCombo value={c} size={CHOICE_ART} />
              {answered && right && <Text style={s.choiceMark}>✓</Text>}
              {answered && chosen && !right && <Text style={s.choiceMark}>✕</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
      <AnswerFeedback picked={picked} correct={correct} label={strokeLabel} />
    </>
  );
}

// ── Part 1 · Discover ────────────────────────────────────────────────────────
function StrokeCard({ item }) {
  return (
    <View style={s.card}>
      <View style={s.artStage}>
        <StrokeVisual stroke={item.stroke} size={ART} loop />
      </View>

      <View style={s.titleRow}>
        <Text style={s.bigName}>{item.stroke}</Text>
        <Text style={s.bigPinyin}>{item.pinyin}</Text>
        <TouchableOpacity onPress={() => speakChinese(item.audio_text)} style={s.audioBtn} activeOpacity={0.7}>
          <Text style={s.audioIcon}>🔊</Text>
        </TouchableOpacity>
      </View>
      <Text style={s.sub}>{item.name_en} · {item.direction}</Text>
      <Text style={s.body}>{item.explanation}</Text>

      <View style={s.exampleRow}>
        <StrokeAnimator char={item.example_char} size={92} loop colored />
        <View style={{ flex: 1 }}>
          <Text style={s.exampleChar}>
            {item.example_char} <Text style={s.examplePinyin}>{item.example_pinyin}</Text>
          </Text>
          <Text style={s.exampleMeaning}>{item.example_meaning}</Text>
          <Text style={s.body}>{item.example_note}</Text>
        </View>
        <TouchableOpacity onPress={() => speakChinese(item.example_char)} style={s.audioBtn} activeOpacity={0.7}>
          <Text style={s.audioIcon}>🔊</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// "Which stroke is this?" — shows the shape, answers are the names.
function RecognitionCheck({ item }) {
  const [picked, setPicked] = useState(null);
  return (
    <View style={s.card}>
      {/* No prose: the shape is the question. */}
      <View style={s.artStage}>
        <StrokeVisual stroke={item.show_stroke} size={ART} loop />
      </View>
      <View style={s.choiceRow}>
        {item.choices.map(c => {
          const chosen   = picked === c;
          const right    = c === item.correct;
          const answered = picked != null;
          return (
            <TouchableOpacity
              key={c}
              style={[
                s.textChoice,
                answered && right && s.choiceRight,
                answered && chosen && !right && s.choiceWrong,
              ]}
              onPress={() => !answered && setPicked(c)}
              activeOpacity={answered ? 1 : 0.8}
            >
              <Text style={s.textChoiceLabel}>{c}</Text>
              <Text style={s.textChoicePinyin}>{getStrokePinyin(c)}</Text>
              <TouchableOpacity
                onPress={() => speakChinese(c)}
                activeOpacity={0.6}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={s.textChoiceAudio}>🔊</Text>
              </TouchableOpacity>
              {answered && right && <Text style={s.choiceMarkInline}>✓</Text>}
              {answered && chosen && !right && <Text style={s.choiceMarkInline}>✕</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
      <AnswerFeedback picked={picked} correct={item.correct} label={strokeLabel} />
    </View>
  );
}

// ── Part 2 · Build ───────────────────────────────────────────────────────────
function RuleCard({ item }) {
  // Both slots are blank: the learner lays the strokes down in writing order.
  const order = item.stroke_order || [];
  const [filled, setFilled] = useState([]);
  const done = filled.length >= order.length;
  const solved = done && filled.every((c, i) => c === order[i]);
  const visual = getRuleVisual(item.rule, item.result_char);

  const pick = (c) => { if (!done) setFilled([...filled, c]); };
  const reset = () => setFilled([]);

  return (
    <View style={s.card}>
      <View style={s.titleRow}>
        <Text style={s.bigName}>{item.rule}</Text>
        <TouchableOpacity onPress={() => speakChinese(item.audio_text)} style={s.audioBtn} activeOpacity={0.7}>
          <Text style={s.audioIcon}>🔊</Text>
        </TouchableOpacity>
      </View>
      <Text style={s.sub}>{item.rule_pinyin} — {item.rule_en}</Text>

      <View style={s.artStage}>
        {visual.kind === 'gif'
          ? <Image source={visual.asset} style={{ width: ART, height: ART }} resizeMode="contain" />
          : <StrokeAnimator char={visual.char} size={ART} loop colored />}
      </View>

      {/* Every slot is blank: [1 ?] → [2 ?] = 十 */}
      <View style={s.equationRow}>
        {order.map((_, i) => (
          <React.Fragment key={i}>
            {i > 0 && <Text style={s.eqPlus}>→</Text>}
            <View style={[
              s.eqCell,
              !filled[i] && s.eqCellBlank,
              done && (filled[i] === order[i] ? s.eqCellRight : s.eqCellWrong),
            ]}>
              {filled[i]
                ? <StrokeCombo value={filled[i]} size={34} />
                : <Text style={s.eqQ}>?</Text>}
              <View style={s.eqOrderBadge}><Text style={s.eqOrderText}>{i + 1}</Text></View>
            </View>
          </React.Fragment>
        ))}
        <Text style={s.eqEquals}>=</Text>
        <Text style={s.eqChar}>{item.result_char}</Text>
      </View>

      {/* Tap strokes in the order they should be written. */}
      <View style={s.choiceRow}>
        {item.choices.map(c => (
          <TouchableOpacity
            key={c}
            style={[s.strokeChoice, done && s.strokeChoiceIdle]}
            onPress={() => { speakChinese(c); pick(c); }}
            activeOpacity={done ? 1 : 0.8}
          >
            <StrokeCombo value={c} size={CHOICE_ART} />
          </TouchableOpacity>
        ))}
      </View>

      {done && (
        <View style={[s.feedback, solved ? s.feedbackRight : s.feedbackWrong]}>
          <Text style={s.feedbackIcon}>{solved ? '✓' : '✕'}</Text>
          <Text style={[s.feedbackText, solved ? s.feedbackTextRight : s.feedbackTextWrong]}>
            {solved ? 'Correct' : `Not quite — ${strokeLabel(order.join(' + '))}`}
          </Text>
          {!solved && (
            <TouchableOpacity onPress={reset} activeOpacity={0.7}>
              <Text style={s.replayLink}>↻</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {solved && (
        <View style={s.revealBox}>
          <StrokeAnimator char={item.result_char} size={110} loop colored />
          <View style={{ flex: 1 }}>
            <Text style={s.exampleChar}>
              {item.result_char} <Text style={s.examplePinyin}>{item.result_pinyin}</Text>
            </Text>
            <Text style={s.meaningEn}>{item.result_meaning}</Text>
            <Text style={s.body}>{item.explanation}</Text>
          </View>
          <TouchableOpacity onPress={() => speakChinese(item.result_char)} style={s.audioBtn} activeOpacity={0.7}>
            <Text style={s.audioIcon}>🔊</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ── Part 3 · Read ────────────────────────────────────────────────────────────
function BuildCard({ item }) {
  const total = item.stroke_order.length;
  // How much is already drawn comes from the data, so the picture always
  // matches what the question is asking for.
  const startShown = item.predict ? item.predict.shown : total;
  const [shown, setShown] = useState(startShown);
  const [picked, setPicked] = useState(null);
  const complete = shown >= total;

  const reveal = () => { setShown(total); speakChinese(item.character); };
  const reset  = () => { setShown(startShown); setPicked(null); };

  return (
    <View style={s.card}>
      <View style={s.artStage}>
        {/* Once finished, drop revealUpTo so the whole character draws itself
            on a loop instead of only the last stroke repeating. */}
        <StrokeAnimator
          char={item.character}
          size={ART}
          revealUpTo={complete ? null : shown}
          loop
          colored
        />
      </View>

      {/* The character, pinyin and meaning are always shown — the task is to
          work out the stroke order, not to guess which character it is. */}
      <View style={s.titleRow}>
        <Text style={s.bigName}>{item.character}</Text>
        <Text style={s.bigPinyin}>{item.pinyin}</Text>
        <TouchableOpacity onPress={() => speakChinese(item.character)} style={s.audioBtn} activeOpacity={0.7}>
          <Text style={s.audioIcon}>🔊</Text>
        </TouchableOpacity>
      </View>
      <Text style={s.meaningEn}>{item.meaning}</Text>
      <Text style={s.builtFrom}>{item.built_from}</Text>

      {item.predict && !complete && (
        <>
          {/* Pattern, not prose: 横 + ? = 大 */}
          <View style={s.equationRow}>
            {item.stroke_order.slice(0, shown).map((st, i) => (
              <React.Fragment key={`${st}-${i}`}>
                {i > 0 && <Text style={s.eqPlus}>+</Text>}
                <View style={s.eqCell}><StrokeCombo value={st} size={38} /></View>
              </React.Fragment>
            ))}
            <Text style={s.eqPlus}>+</Text>
            <View style={[s.eqCell, s.eqCellBlank]}><Text style={s.eqQ}>?</Text></View>
            <Text style={s.eqEquals}>=</Text>
            <Text style={s.eqChar}>{item.character}</Text>
          </View>

          <StrokeChoiceRow
            choices={item.predict.choices}
            correct={item.predict.correct}
            picked={picked}
            onPick={setPicked}
          />
        </>
      )}

      {!complete ? (
        <TouchableOpacity style={s.revealBtn} onPress={reveal} activeOpacity={0.85}>
          <Text style={s.revealBtnText}>Tap to reveal & hear</Text>
        </TouchableOpacity>
      ) : (
        <View style={s.doneRow}>
          <Text style={s.body}>{item.note}</Text>
          <TouchableOpacity onPress={reset} activeOpacity={0.7}>
            <Text style={s.replayLink}>↻ again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ── Part 4 · Use ─────────────────────────────────────────────────────────────
// A word drawn at the same scale as the strokes and characters in Parts 1-3.
function WordArt({ word }) {
  const chars = [...word];
  const size = Math.min(ART, Math.round(300 / chars.length));
  return (
    <View style={s.wordArtRow}>
      {chars.map((c, i) => <StrokeAnimator key={`${c}-${i}`} char={c} size={size} loop colored />)}
    </View>
  );
}

// "? + ? = one day" — fill each blank by tapping a character.
function PatternQuiz({ quiz }) {
  const [filled, setFilled] = useState([]);           // chars chosen so far
  const blanks = quiz.template.filter(t => t == null).length;
  const done = filled.length >= blanks;
  const correct = done && filled.every((c, i) => c === quiz.answer[i]);

  const pick = (c) => { if (!done) setFilled([...filled, c]); };
  const reset = () => setFilled([]);

  // Speak the finished word as soon as it is built correctly.
  useEffect(() => {
    if (done && correct) speakChinese(quiz.audio_text);
  }, [done, correct, quiz.audio_text]);

  // Walk the template, substituting chosen characters into the blanks in order.
  let blankIdx = -1;
  const cells = quiz.template.map((t, i) => {
    if (t != null) return { key: i, text: t, kind: 'fixed' };
    blankIdx += 1;
    const v = filled[blankIdx];
    return { key: i, text: v || '?', kind: v ? 'filled' : 'blank', slot: blankIdx };
  });

  return (
    <View style={s.quizCard}>
      <View style={s.equationRow}>
        {cells.map((c, i) => (
          <React.Fragment key={c.key}>
            {i > 0 && <Text style={s.eqPlus}>+</Text>}
            <View style={[
              s.eqCell,
              c.kind === 'blank' && s.eqCellBlank,
              c.kind === 'filled' && (
                done ? (filled[c.slot] === quiz.answer[c.slot] ? s.eqCellRight : s.eqCellWrong) : s.eqCellFilled
              ),
            ]}>
              <Text style={s.eqCellText}>{c.text}</Text>
            </View>
          </React.Fragment>
        ))}
        <Text style={s.eqEquals}>=</Text>
        <Text style={s.eqMeaning}>{quiz.result_meaning}</Text>
      </View>

      <View style={s.choiceRow}>
        {quiz.choices.map(c => (
          <TouchableOpacity
            key={c}
            style={[s.charChoice, done && s.charChoiceIdle]}
            onPress={() => { speakChinese(c); pick(c); }}
            activeOpacity={0.8}
          >
            <Text style={s.charChoiceText}>{c}</Text>
            <Text style={s.charChoiceAudio}>🔊</Text>
          </TouchableOpacity>
        ))}
      </View>

      {done && (
        <>
          <View style={[s.feedback, correct ? s.feedbackRight : s.feedbackWrong]}>
            <Text style={s.feedbackIcon}>{correct ? '✓' : '✕'}</Text>
            <Text style={[s.feedbackText, correct ? s.feedbackTextRight : s.feedbackTextWrong]}>
              {correct
                ? `${quiz.result_word} ${quiz.result_pinyin} — ${quiz.result_meaning}`
                : `Not quite — the answer is ${quiz.result_word} ${quiz.result_pinyin}`}
            </Text>
          </View>
          <View style={s.quizActions}>
            <TouchableOpacity onPress={() => speakChinese(quiz.audio_text)} style={s.smallBtn} activeOpacity={0.85}>
              <Text style={s.smallBtnText}>🔊</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={reset} activeOpacity={0.7}>
              <Text style={s.replayLink}>↻ try again</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

function PatternCard({ item }) {
  return (
    <View style={{ marginBottom: 20 }}>
      {/* The word itself, in its own big frame */}
      <View style={s.card}>
        {item.logic ? <Text style={s.logicTag}>{item.logic.trim()}</Text> : null}
        <Text style={s.buildFormula}>{item.build}</Text>

        <View style={s.wordArtStage}>
          <WordArt word={item.word} />
        </View>

        <View style={s.titleRow}>
          <Text style={s.bigName}>{item.word}</Text>
          <Text style={s.bigPinyin}>{item.pinyin}</Text>
          <TouchableOpacity onPress={() => speakChinese(item.audio_text)} style={s.audioBtn} activeOpacity={0.7}>
            <Text style={s.audioIcon}>🔊</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.meaningEn}>{item.meaning}</Text>
        {item.note ? <Text style={s.body}>{item.note}</Text> : null}
      </View>

      {/* Variations sit outside that frame */}
      {item.variations?.length > 1 && (
        <View style={s.varWrap}>
          {item.variations.map(v => (
            <TouchableOpacity key={v.word} style={s.varPill} onPress={() => speakChinese(v.audio_text)} activeOpacity={0.8}>
              <Text style={s.varCn}>{v.word}</Text>
              <Text style={s.varPy}>{v.pinyin}</Text>
              <Text style={s.varEnText}>{v.meaning}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {item.quiz && <PatternQuiz quiz={item.quiz} />}
    </View>
  );
}

// ── Part 5 · Write ───────────────────────────────────────────────────────────
// One canvas at a time, with a chip row to switch character. Written ones keep
// a tick so progress through the set is visible.
function WritePart({ chars, infoFor }) {
  const [active, setActive] = useState(chars[0]);
  const [written, setWritten] = useState({});
  const info = infoFor(active) || {};

  return (
    <View style={{ gap: 12 }}>
      <View style={s.chipRow}>
        {chars.map(c => (
          <TouchableOpacity
            key={c}
            style={[s.chip, c === active && s.chipActive, written[c] && s.chipDone]}
            onPress={() => setActive(c)}
            activeOpacity={0.8}
          >
            <Text style={[s.chipText, c === active && s.chipTextActive]}>{c}</Text>
            {written[c] && <Text style={s.chipTick}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.card}>
        <View style={s.titleRow}>
          <Text style={s.bigName}>{active}</Text>
          {!!info.pinyin && <Text style={s.bigPinyin}>{info.pinyin}</Text>}
          <TouchableOpacity onPress={() => speakChinese(active)} style={s.audioBtn} activeOpacity={0.7}>
            <Text style={s.audioIcon}>🔊</Text>
          </TouchableOpacity>
        </View>
        {!!info.meaning && <Text style={s.meaningEn}>{info.meaning}</Text>}

        <View style={{ alignSelf: 'center' }}>
          <StrokeWriter
            key={active}
            char={active}
            size={ART + 60}
            onComplete={() => {
              setWritten(w => ({ ...w, [active]: true }));
              speakChinese(active);
            }}
          />
        </View>
      </View>
    </View>
  );
}

// ── Screen ───────────────────────────────────────────────────────────────────
export default function CharacterLessonScreen({
  lessonData,
  learnDone = false,
  recallPassed = false,
  initialTab = 'learn',
  onBack,
  onLearnComplete,
  onStartRecall,
}) {
  const [tab, setTab] = useState(initialTab);
  const [slide, setSlide] = useState(0);
  if (!lessonData) return null;

  const lc = lessonData.learn_content || {};
  const p1 = lc.part1_discover || {};
  const p2 = lc.part2_build    || {};
  const p3 = lc.part3_read     || {};
  const p4 = lc.part4_use      || {};
  const p5 = lc.part5_write    || {};

  // Pinyin/meaning for the Write part come from the characters taught in Part 3.
  const charInfo = Object.fromEntries(
    (p3.characters || []).map(c => [c.character, { pinyin: c.pinyin, meaning: c.meaning }]),
  );

  const SLIDES = [
    {
      part: p1,
      body: (
        <>
          {(p1.strokes || []).map(st => <StrokeCard key={st.stroke} item={st} />)}
          {(p1.recognition_check || []).map((q, i) => <RecognitionCheck key={i} item={q} />)}
        </>
      ),
    },
    { part: p2, body: (p2.rules || []).map(r => <RuleCard key={r.rule} item={r} />) },
    { part: p3, body: (p3.characters || []).map(c => <BuildCard key={c.character} item={c} />) },
    { part: p4, body: (p4.patterns || []).map(pt => <PatternCard key={pt.word} item={pt} />) },
    ...((p5.characters || []).length
      ? [{
          part: p5,
          body: <WritePart chars={p5.characters} infoFor={(c) => charInfo[c]} />,
        }]
      : []),
  ];

  const lastSlide = slide >= SLIDES.length - 1;
  const current = SLIDES[slide];

  const renderLearn = () => (
    <View style={{ flex: 1 }}>
      <View style={s.dotsRow}>
        {SLIDES.map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setSlide(i)}
            activeOpacity={0.7}
            style={[s.dot, i === slide && s.dotActive, i < slide && s.dotDone]}
          />
        ))}
      </View>

      <ScrollView
        key={slide}
        contentContainerStyle={s.tabContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.partHead}>
          <View style={s.partNum}><Text style={s.partNumText}>{slide + 1}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.partTitle}>{current.part.title}</Text>
            <Text style={s.partSub}>{current.part.subtitle}</Text>
          </View>
          <Text style={s.partCount}>{slide + 1}/{SLIDES.length}</Text>
        </View>

        {current.part.intro ? <Text style={s.intro}>{current.part.intro}</Text> : null}
        {current.body}

        {/* Navigation sits at the end of the content, so it is reached by
            scrolling to the bottom rather than floating over the slide. */}
        <View style={s.navBar}>
          <TouchableOpacity
            style={[s.navBtn, slide === 0 && s.navBtnDisabled]}
            onPress={() => slide > 0 && setSlide(slide - 1)}
            disabled={slide === 0}
            activeOpacity={0.8}
          >
            <Text style={[s.navBtnText, slide === 0 && s.navBtnTextDisabled]}>← Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.navPrimary}
            onPress={() => (lastSlide ? onLearnComplete() : setSlide(slide + 1))}
            activeOpacity={0.85}
          >
            <Text style={s.navPrimaryText}>{lastSlide ? '🎯 Start Practice' : 'Next →'}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );

  const renderPractice = () => (
    <ScrollView contentContainerStyle={s.tabContent} showsVerticalScrollIndicator={false}>
      {!learnDone ? (
        <View style={s.lockedBanner}>
          <Text style={s.lockedEmoji}>🔒</Text>
          <Text style={s.lockedTitle}>Complete Learn First</Text>
          <Text style={s.lockedSub}>
            Work through all five parts, then tap "Start Practice" to unlock Recall.
          </Text>
        </View>
      ) : (
        <Text style={s.intro}>
          Recall mixes every question type from this lesson. Score 60% to complete it
          and unlock the next lesson.
        </Text>
      )}

      <TouchableOpacity
        style={[s.recallCard, !learnDone && s.recallLocked]}
        onPress={() => learnDone && onStartRecall()}
        activeOpacity={learnDone ? 0.85 : 1}
      >
        <View style={[s.recallDot, { backgroundColor: learnDone ? '#296614' : 'rgba(55,73,80,0.18)' }]}>
          <Text style={s.recallDotText}>{recallPassed ? '✓' : learnDone ? '🎯' : '🔒'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.recallTitle, !learnDone && s.lockedText]}>Practice · Recall</Text>
          <Text style={s.recallDesc}>
            {recallPassed ? 'Passed! 🎉' : `${(lessonData.recall_pool || []).length} questions · 60% to pass`}
          </Text>
        </View>
        {learnDone && <Text style={s.recallArrow}>→</Text>}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  return (
    <ScreenBackground levelId="hsk1">
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="dark-content" />

        <View style={s.header}>
          <TouchableOpacity onPress={onBack} style={s.backBtn}>
            <Text style={s.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle} numberOfLines={1}>
            {lessonData.emoji} Lesson {lessonData.id}
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={s.banner}>
          <Text style={s.bannerTitle}>{lessonData.title}</Text>
          <Text style={s.bannerSub}>{lessonData.subtitle}</Text>
        </View>

        <View style={s.tabs}>
          {['learn', 'practice'].map(t => (
            <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
              <Text style={[s.tabText, tab === t && s.tabTextActive]}>
                {t === 'learn' ? '📖 Learn' : '🎯 Practice'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'learn' ? renderLearn() : renderPractice()}
      </SafeAreaView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: CARD_WHITE,
    borderBottomWidth: 1, borderBottomColor: 'rgba(155,104,70,0.15)',
  },
  backBtn:     { paddingVertical: 8, paddingRight: 12 },
  backBtnText: { fontSize: 16, fontWeight: '600', color: WARM_BROWN },
  headerTitle: { fontSize: 15, fontWeight: '700', color: DEEP_NAVY, flex: 1, textAlign: 'center' },

  banner: {
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: CARD_WHITE,
    borderBottomWidth: 1, borderBottomColor: 'rgba(155,104,70,0.15)',
  },
  bannerTitle: { fontSize: 18, fontWeight: '900', color: DEEP_NAVY, marginBottom: 2 },
  bannerSub:   { fontSize: 13, color: SLATE_TEAL },

  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(155,104,70,0.15)', backgroundColor: CARD_WHITE },
  tab:           { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive:     { borderBottomWidth: 2, borderBottomColor: WARM_ORANGE },
  tabText:       { fontSize: 14, fontWeight: '700', color: SLATE_TEAL },
  tabTextActive: { color: WARM_ORANGE },

  tabContent: { padding: 20 },

  dotsRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 8,
    paddingVertical: 12, backgroundColor: CARD_WHITE,
    borderBottomWidth: 1, borderBottomColor: 'rgba(155,104,70,0.12)',
  },
  dot:       { width: 32, height: 5, borderRadius: 3, backgroundColor: 'rgba(55,73,80,0.20)' },
  dotActive: { backgroundColor: WARM_ORANGE },
  dotDone:   { backgroundColor: SUCCESS },

  // Part header — two steps larger than before
  partHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4, marginBottom: 12 },
  partNum: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: WARM_BROWN,
    alignItems: 'center', justifyContent: 'center',
  },
  partNumText: { color: CARD_WHITE, fontWeight: '900', fontSize: 18 },
  partTitle:   { fontSize: 24, fontWeight: '900', color: DEEP_NAVY },
  partSub:     { fontSize: 17, color: SLATE_TEAL, marginTop: 2 },
  partCount:   { fontSize: 14, fontWeight: '700', color: SLATE_TEAL },

  intro: {
    fontSize: 15, color: SLATE_TEAL, lineHeight: 22, marginBottom: 14,
    backgroundColor: CARD_WHITE, borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: 'rgba(155,104,70,0.15)',
  },

  card: {
    backgroundColor: CARD_WHITE, borderRadius: 14, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(155,104,70,0.18)', gap: 10,
  },

  // Shared big art stage — Parts 1, 2 and 3 all use this
  artStage: {
    alignSelf: 'center', width: ART, height: ART,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFF8ED', borderRadius: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(155,104,70,0.15)',
  },

  titleRow:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bigName:   { fontSize: 30, fontWeight: '900', color: DEEP_NAVY },
  bigPinyin: { fontSize: 20, fontWeight: '700', color: WARM_BROWN, flex: 1 },
  sub:       { fontSize: 15, color: SLATE_TEAL },
  body:      { flex: 1, fontSize: 15, color: SLATE_TEAL, lineHeight: 21 },
  audioBtn:  { padding: 6 },
  audioIcon: { fontSize: 24 },

  exampleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFF8ED', borderRadius: 12, padding: 12,
  },
  exampleChar:    { fontSize: 24, fontWeight: '900', color: DEEP_NAVY },
  examplePinyin:  { fontSize: 17, fontWeight: '600', color: WARM_BROWN },
  exampleMeaning: { fontSize: 15, color: SLATE_TEAL, marginBottom: 2 },

  // Choices
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  strokeChoice: {
    width: CHOICE_ART + 20, height: CHOICE_ART + 20, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    borderWidth: 1.5, borderColor: 'rgba(155,104,70,0.30)', backgroundColor: CARD_WHITE,
  },
  strokeChoiceWide: { width: CHOICE_ART * 2 + 36 },
  strokeChoiceIdle: { opacity: 0.5 },
  textChoice: {
    minWidth: 76, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1.5, borderColor: 'rgba(155,104,70,0.30)', backgroundColor: CARD_WHITE,
    alignItems: 'center',
  },
  textChoiceLabel:  { fontSize: 22, fontWeight: '800', color: DEEP_NAVY },
  textChoicePinyin: { fontSize: 13, color: WARM_BROWN, marginTop: 1 },
  textChoiceAudio:  { fontSize: 18, marginTop: 3 },
  choiceRight:  { backgroundColor: 'rgba(46,125,50,0.18)', borderColor: SUCCESS, borderWidth: 2.5 },
  choiceWrong:  { backgroundColor: 'rgba(196,80,58,0.15)', borderColor: '#C4503A', borderWidth: 2.5 },
  choiceMark:       { position: 'absolute', top: 2, right: 5, fontSize: 15, fontWeight: '900', color: DEEP_NAVY },
  choiceMarkInline: { fontSize: 14, fontWeight: '900', color: DEEP_NAVY, marginTop: 1 },

  // English meaning — distinct colour, a step larger than body text
  meaningEn: { fontSize: 17, fontWeight: '700', color: WARM_ORANGE },

  // Answer feedback
  feedback: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginTop: 4,
  },
  feedbackRight:     { backgroundColor: 'rgba(46,125,50,0.12)' },
  feedbackWrong:     { backgroundColor: 'rgba(196,80,58,0.10)' },
  feedbackIcon:      { fontSize: 16, fontWeight: '900' },
  feedbackText:      { flex: 1, fontSize: 15, fontWeight: '700' },
  feedbackTextRight: { color: '#2E7D32' },
  feedbackTextWrong: { color: '#C4503A' },

  revealBox: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#F1F7EE', borderRadius: 12, padding: 12,
  },

  builtFrom:  { fontSize: 14, color: SLATE_TEAL, fontStyle: 'italic' },

  // Smaller action button, shared by every reveal / check affordance
  revealBtn:  { backgroundColor: SLATE_TEAL, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  revealBtnText: { color: CARD_WHITE, fontWeight: '800', fontSize: 14 },
  smallBtn: {
    backgroundColor: SLATE_TEAL, borderRadius: 10,
    paddingVertical: 11, paddingHorizontal: 16, alignItems: 'center',
  },
  smallBtnText: { color: CARD_WHITE, fontWeight: '800', fontSize: 14 },
  doneRow:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  replayLink: { fontSize: 15, color: WARM_ORANGE, fontWeight: '700' },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  chip: {
    minWidth: 48, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    backgroundColor: CARD_WHITE, borderWidth: 1.5, borderColor: 'rgba(155,104,70,0.25)',
    alignItems: 'center',
  },
  chipActive:     { borderColor: WARM_ORANGE, borderWidth: 2.5 },
  chipDone:       { backgroundColor: 'rgba(46,125,50,0.12)' },
  chipText:       { fontSize: 22, fontWeight: '800', color: DEEP_NAVY },
  chipTextActive: { color: WARM_ORANGE },
  chipTick:       { fontSize: 11, fontWeight: '900', color: SUCCESS },

  logicTag: {
    alignSelf: 'flex-start', fontSize: 13, fontWeight: '700', color: WARM_BROWN,
    backgroundColor: '#FFF3E0', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
    overflow: 'hidden',
  },
  buildFormula: { fontSize: 18, fontWeight: '800', color: WARM_BROWN },

  wordArtStage: {
    alignSelf: 'stretch', minHeight: ART,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFF8ED', borderRadius: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(155,104,70,0.15)',
  },
  wordArtRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },

  // Variations live outside the word's frame
  varWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  varPill: {
    backgroundColor: CARD_WHITE, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(155,104,70,0.25)', alignItems: 'center',
  },
  varCn:     { fontSize: 20, fontWeight: '800', color: DEEP_NAVY },
  varPy:     { fontSize: 13, color: WARM_BROWN },
  varEnText: { fontSize: 14, fontWeight: '700', color: WARM_ORANGE },

  // Pattern completion question
  quizCard: {
    backgroundColor: CARD_WHITE, borderRadius: 14, padding: 16, marginTop: 10,
    borderWidth: 1.5, borderColor: 'rgba(155,104,70,0.25)', gap: 12,
  },
  equationRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    flexWrap: 'wrap', gap: 6,
  },
  eqCell: {
    minWidth: 52, height: 52, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFF8ED', borderWidth: 1.5, borderColor: 'rgba(155,104,70,0.25)',
  },
  eqCellBlank:  { borderStyle: 'dashed', backgroundColor: CARD_WHITE },
  eqQ:          { fontSize: 24, fontWeight: '900', color: SLATE_TEAL },
  eqChar:       { fontSize: 42, fontWeight: '900', color: DEEP_NAVY },
  eqOrderBadge: {
    position: 'absolute', top: -6, left: -6,
    width: 18, height: 18, borderRadius: 9, backgroundColor: WARM_BROWN,
    alignItems: 'center', justifyContent: 'center',
  },
  eqOrderText:  { fontSize: 10, fontWeight: '900', color: CARD_WHITE },
  eqCellFilled: { borderColor: WARM_ORANGE },
  eqCellRight:  { backgroundColor: 'rgba(46,125,50,0.18)', borderColor: SUCCESS },
  eqCellWrong:  { backgroundColor: 'rgba(196,80,58,0.15)', borderColor: '#C4503A' },
  eqCellText:   { fontSize: 26, fontWeight: '900', color: DEEP_NAVY },
  eqPlus:       { fontSize: 18, fontWeight: '800', color: SLATE_TEAL },
  eqEquals:     { fontSize: 18, fontWeight: '800', color: SLATE_TEAL, marginHorizontal: 2 },
  eqMeaning:    { fontSize: 16, fontWeight: '700', color: WARM_ORANGE },

  charChoice: {
    minWidth: 64, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1.5, borderColor: 'rgba(155,104,70,0.30)', backgroundColor: CARD_WHITE,
    alignItems: 'center',
  },
  charChoiceIdle:  { opacity: 0.5 },
  charChoiceText:  { fontSize: 26, fontWeight: '900', color: DEEP_NAVY },
  charChoiceAudio: { fontSize: 13, marginTop: 2 },
  quizActions: { flexDirection: 'row', alignItems: 'center', gap: 14 },

  // Slide navigation (inside the scroll content)
  navBar: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20,
  },
  navBtn: {
    paddingHorizontal: 20, paddingVertical: 15, borderRadius: 14,
    borderWidth: 1.5, borderColor: 'rgba(155,104,70,0.30)', backgroundColor: CARD_WHITE,
  },
  navBtnDisabled:     { opacity: 0.35 },
  navBtnText:         { fontSize: 16, fontWeight: '700', color: WARM_BROWN },
  navBtnTextDisabled: { color: SLATE_TEAL },
  navPrimary: {
    flex: 1, backgroundColor: SLATE_TEAL, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  navPrimaryText: { fontSize: 17, fontWeight: '800', color: CARD_WHITE },

  // Practice tab
  lockedBanner: {
    alignItems: 'center', backgroundColor: CARD_WHITE, borderRadius: 12, padding: 24,
    marginBottom: 16, borderWidth: 1, borderColor: 'rgba(155,104,70,0.18)', gap: 8,
  },
  lockedEmoji: { fontSize: 36 },
  lockedTitle: { fontSize: 18, fontWeight: '800', color: DEEP_NAVY },
  lockedSub:   { fontSize: 15, color: SLATE_TEAL, textAlign: 'center', lineHeight: 21 },
  lockedText:  { color: 'rgba(55,73,80,0.45)' },

  recallCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: CARD_WHITE, borderRadius: 14, padding: 18,
    borderWidth: 1.5, borderColor: 'rgba(155,104,70,0.20)',
  },
  recallLocked:  { opacity: 0.55 },
  recallDot:     { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  recallDotText: { fontSize: 17, fontWeight: '900', color: CARD_WHITE },
  recallTitle:   { fontSize: 17, fontWeight: '800', color: DEEP_NAVY, marginBottom: 2 },
  recallDesc:    { fontSize: 14, color: SLATE_TEAL },
  recallArrow:   { fontSize: 20, color: WARM_BROWN, fontWeight: '700' },
});
