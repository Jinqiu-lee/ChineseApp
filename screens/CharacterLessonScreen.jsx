import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Image,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenBackground from '../components/ScreenBackground';
import StrokeAnimator from '../components/characters/StrokeAnimator';
import StrokeVisual, { StrokeCombo } from '../components/characters/StrokeVisual';
import StrokeWriter from '../components/characters/StrokeWriter';
import {
  BlockCard, MatchCard, ComponentCard, CharacterIntroCard, WordCard,
  DialogueCard, CultureCard, ReadAloud,
} from '../components/characters/LessonTwoParts';
import { Gloss } from '../components/characters/Gloss';
import { getStrokeVisual, getRuleVisual, getStrokePinyin } from '../data/characters/strokeAssets';
import { stagesForLesson, practiceStageCount, QUIZ_LENGTH } from '../data/characters/practiceStages';
import { getCharacterReading } from '../data/characters';
import { speakChinese } from '../utils/tts';
import { DEEP_NAVY, WARM_ORANGE, SLATE_TEAL, WARM_BROWN, CARD_WHITE, SUCCESS } from '../constants/colors';

// One prominent size shared by Parts 1-3 so every animation reads the same.
const ART = 160;
const MAX_REWRITES = 3;   // after this, Practice is the only way forward
const CHOICE_ART = 54;

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
        <View style={s.titleStack}>
          <Text style={s.bigName}>{item.stroke}</Text>
          <Text style={s.bigPinyin}>{item.pinyin}</Text>
        </View>
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
        <TouchableOpacity onPress={() => speakChinese(item.example_char, 'female', item.example_pinyin)} style={s.audioBtn} activeOpacity={0.7}>
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
              onPress={() => { speakChinese(c); if (!answered) setPicked(c); }}
              activeOpacity={0.8}
            >
              <Text style={s.textChoiceLabel}>{c}</Text>
              <Text style={s.textChoicePinyin}>{getStrokePinyin(c)}</Text>
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

// The round-up at the end of Characters 2's Part 2: one character out of four
// carries a different radical from the rest.
function GroupCheck({ item }) {
  const [picked, setPicked] = useState(null);
  return (
    <View style={[s.card, s.structureCard]}>
      <Text style={s.structureQ}>{item.question}</Text>
      <View style={s.choiceRow}>
        {item.choices.map(c => {
          const reveal = picked != null;
          return (
            <TouchableOpacity
              key={c}
              style={[
                s.charChoice,
                reveal && c === item.correct && s.choiceRight,
                reveal && picked === c && c !== item.correct && s.choiceWrong,
              ]}
              onPress={() => { speakChinese(c); if (picked == null) setPicked(c); }}
              activeOpacity={0.8}
            >
              <Text style={s.charChoiceText}>{c}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <AnswerFeedback picked={picked} correct={item.correct} />
      {picked != null && item.explain ? <Text style={s.body}>{item.explain}</Text> : null}
    </View>
  );
}

// ── Part 2 · Build ───────────────────────────────────────────────────────────
// Optional block shown ABOVE the writing rules, from part2_build.structure.
// It names how a character is put together (左右结构 and friends) before the
// learner is told what order to write the pieces in — the order only makes
// sense once you can see the pieces. Lessons without a `structure` key skip it.
function StructureCard({ item }) {
  const [picked, setPicked] = useState(null);
  const check = item.check;

  return (
    <View style={[s.card, s.structureCard]}>
      <View style={s.titleRow}>
        <View style={s.titleStack}>
          <Text style={s.bigName}>{item.name}</Text>
          <Text style={s.bigPinyin}>{item.pinyin}</Text>
        </View>
        {item.audio_text ? (
          <TouchableOpacity onPress={() => speakChinese(item.audio_text, 'female', item.pinyin)} style={s.audioBtn} activeOpacity={0.7}>
            <Text style={s.audioIcon}>🔊</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <Text style={s.meaningEn}>{item.name_en}</Text>

      {/* A character writing itself says what the structure is far quicker
          than a paragraph: the narrow left part goes down first, complete,
          then the right. */}
      {item.demo_char ? (
        <View style={s.artStage}>
          <StrokeAnimator char={item.demo_char} size={ART} loop colored />
        </View>
      ) : null}

      {item.intro ? <Text style={s.body}>{item.intro}</Text> : null}
      {item.explanation ? <Text style={s.body}>{item.explanation}</Text> : null}

      {item.rule ? (
        <View style={s.structureRule}>
          <Text style={s.structureRuleCn}>{item.rule}</Text>
          <Text style={s.structureRuleEn}>{item.rule_en}</Text>
        </View>
      ) : null}

      {/* Each example is shown split into its two parts, then whole. A
          left-right character names them left/right; a wrapping one names
          them outer/inner, and the separator says which it is — "|" for two
          parts side by side, "⊃" for one holding the other. */}
      {(item.examples || []).map(ex => {
        const wrapped = ex.outer != null;
        const first   = wrapped ? ex.outer : ex.left;
        const second  = wrapped ? ex.inner : ex.right;
        const firstNote  = wrapped ? ex.outer_note : ex.left_note;
        const secondNote = wrapped ? ex.inner_note : ex.right_note;
        return (
        <TouchableOpacity
          key={ex.character}
          style={s.splitRow}
          onPress={() => speakChinese(ex.character, 'female', ex.pinyin)}
          activeOpacity={0.8}
        >
          <View style={s.splitBox}>
            <View style={s.splitHalf}><Text style={s.splitPart}>{first}</Text></View>
            {wrapped
              ? <View style={s.splitWrapMark}><Text style={s.splitWrapText}>⊃</Text></View>
              : <View style={s.splitDivider} />}
            <View style={s.splitHalf}><Text style={s.splitPart}>{second}</Text></View>
          </View>
          <Text style={s.splitEquals}>=</Text>
          <View style={s.splitWhole}>
            <Text style={s.splitWholeChar}>{ex.character}</Text>
            <Text style={s.splitWholePy}>{ex.pinyin}</Text>
          </View>
          <View style={s.splitNotes}>
            <Text style={s.splitNote}>{ex.meaning}</Text>
            <Text style={s.splitNoteDim}>{first} — {firstNote}</Text>
            <Text style={s.splitNoteDim}>{second} — {secondNote}</Text>
          </View>
        </TouchableOpacity>
      );})}

      {/* The exception comes after the examples: see the rule work once
          before being told where it does not. 辶 reverses 先外后里 for every
          character built on it, not just 这. */}
      {item.exception ? (
        <View style={s.exceptionBox}>
          <View style={s.exceptionHead}>
            <Text style={s.exceptionRadical}>{item.exception.radical}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.exceptionName}>{item.exception.name}</Text>
              {item.exception.pinyin ? (
                <Text style={s.exceptionPinyin}>{item.exception.pinyin}</Text>
              ) : null}
              <Text style={s.exceptionNameEn}>{item.exception.name_en}</Text>
            </View>
            {item.exception.audio_text ? (
              <TouchableOpacity
                onPress={() => speakChinese(item.exception.audio_text, 'female', item.exception.pinyin)}
                style={s.audioBtn}
                activeOpacity={0.7}
              >
                <Text style={s.audioIcon}>🔊</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <Text style={s.exceptionRuleCn}>{item.exception.rule}</Text>
          <Text style={s.exceptionRuleEn}>{item.exception.rule_en}</Text>
          {item.exception.note ? <Text style={s.body}>{item.exception.note}</Text> : null}

          {/* Shown as plain glyphs: most of these are not taught in this
              lesson and have no stroke data to animate. */}
          <View style={s.exceptionRow}>
            {(item.exception.characters || []).map(ch => (
              <TouchableOpacity
                key={ch.character}
                style={s.exceptionChip}
                onPress={() => speakChinese(ch.audio_text || ch.character, 'female', ch.pinyin)}
                activeOpacity={0.8}
              >
                <Text style={s.exceptionChipCn}>{ch.character}</Text>
                <Text style={s.exceptionChipPy}>{ch.pinyin}</Text>
                <Text style={s.exceptionChipEn}>{ch.meaning}</Text>
                {ch.inner ? <Text style={s.exceptionChipInner}>{ch.inner} first</Text> : null}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : null}

      {item.contrast ? (
        <View style={s.contrastBox}>
          <Text style={s.contrastChars}>{(item.contrast.characters || []).join('  ')}</Text>
          <Text style={s.body}>{item.contrast.note}</Text>
        </View>
      ) : null}

      {/* Answers here are always short — a single character, or a stroke shown
          as its shape. They share the compact buttons the rest of the lesson
          uses, which only works because nothing longer goes in them: a
          sentence at this size fills the screen. Any explaining belongs in
          `explain`, shown after the answer. */}
      {check ? (
        <View style={{ gap: 10 }}>
          <Text style={s.structureQ}>{check.question}</Text>
          {check.answer_kind === 'stroke' ? (
            <StrokeChoiceRow
              choices={check.choices}
              correct={check.correct}
              picked={picked}
              onPick={setPicked}
            />
          ) : (
            <>
              <View style={s.choiceRow}>
                {check.choices.map(c => {
                  const chosen = picked === c;
                  const reveal = picked != null;
                  return (
                    <TouchableOpacity
                      key={c}
                      style={[
                        s.charChoice,
                        reveal && c === check.correct && s.choiceRight,
                        reveal && chosen && c !== check.correct && s.choiceWrong,
                      ]}
                      onPress={() => { speakChinese(c); if (picked == null) setPicked(c); }}
                      activeOpacity={0.8}
                    >
                      <Text style={s.charChoiceText}>{c}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <AnswerFeedback picked={picked} correct={check.correct} />
            </>
          )}
          {picked != null && check.explain ? (
            <Text style={s.body}>{check.explain}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

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
          <TouchableOpacity onPress={() => speakChinese(item.result_char, 'female', item.result_pinyin)} style={s.audioBtn} activeOpacity={0.7}>
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

  const reveal = () => { setShown(total); speakChinese(item.character, 'female', item.pinyin); };
  const reset  = () => { setShown(startShown); setPicked(null); };

  return (
    <View style={s.card}>
      <View style={s.artStage}>
        {/* Dropping revealUpTo lets the whole character draw itself on a loop
            instead of only the last stroke repeating. Two cases want that:
            once the card is finished, and when the question asks for the very
            first stroke — there is nothing before it to show, so revealUpTo={0}
            would leave an empty box. */}
        <StrokeAnimator
          char={item.character}
          size={ART}
          revealUpTo={complete || shown === 0 ? null : shown}
          loop
          colored
        />
      </View>

      {/* The character, pinyin and meaning are always shown — the task is to
          work out the stroke order, not to guess which character it is. */}
      <View style={s.titleRow}>
        <View style={s.titleStack}>
          <Text style={s.bigName}>{item.character}</Text>
          <Text style={s.bigPinyin}>{item.pinyin}</Text>
        </View>
        <TouchableOpacity onPress={() => speakChinese(item.character, 'female', item.pinyin)} style={s.audioBtn} activeOpacity={0.7}>
          <Text style={s.audioIcon}>🔊</Text>
        </TouchableOpacity>
      </View>
      <Text style={s.meaningEn}>{item.meaning}</Text>
      <Text style={s.builtFrom}>{item.built_from}</Text>

      {item.predict && !complete && (
        <>
          {/* Pattern, not prose: 横 + ? = 大
              Every stroke is drawn except the one being asked about, wherever
              it sits — first, middle or last. The blank is the only hidden
              cell, so the row always shows the character's true stroke count
              and the question reads the same at any position. */}
          <View style={s.equationRow}>
            {item.stroke_order.map((st, i) => (
              <React.Fragment key={`${st}-${i}`}>
                {i > 0 && <Text style={s.eqPlus}>+</Text>}
                {i === shown
                  ? <View style={[s.eqCell, s.eqCellBlank]}><Text style={s.eqQ}>?</Text></View>
                  : <View style={s.eqCell}><StrokeCombo value={st} size={34} /></View>}
              </React.Fragment>
            ))}
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
function PatternQuiz({ quiz, pinyinFor }) {
  const [filled, setFilled] = useState([]);           // chars chosen so far
  const blanks = quiz.template.filter(t => t == null).length;
  const done = filled.length >= blanks;
  const correct = done && filled.every((c, i) => c === quiz.answer[i]);

  const pick = (c) => { if (!done) setFilled([...filled, c]); };
  const reset = () => setFilled([]);

  // Speak the finished word as soon as it is built correctly.
  useEffect(() => {
    if (done && correct) speakChinese(quiz.audio_text, 'female', quiz.result_pinyin);
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
            onPress={() => { speakChinese(c, 'female', pinyinFor?.(c)); pick(c); }}
            activeOpacity={0.8}
          >
            <Text style={[s.charChoiceText, s.charChoiceTextAudio]}>{c}</Text>
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
            <TouchableOpacity onPress={() => speakChinese(quiz.audio_text, 'female', quiz.result_pinyin)} style={s.smallBtn} activeOpacity={0.85}>
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

function PatternCard({ item, pinyinFor }) {
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
          <View style={s.titleStack}>
            <Text style={s.bigName}>{item.word}</Text>
            <Text style={s.bigPinyin}>{item.pinyin}</Text>
          </View>
          <TouchableOpacity onPress={() => speakChinese(item.audio_text, 'female', item.pinyin)} style={s.audioBtn} activeOpacity={0.7}>
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
            <TouchableOpacity key={v.word} style={s.varPill} onPress={() => speakChinese(v.audio_text, 'female', v.pinyin)} activeOpacity={0.8}>
              <Text style={s.varCn}>{v.word}</Text>
              <Text style={s.varPy}>{v.pinyin}</Text>
              <Text style={s.varEnText}>{v.meaning}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {item.quiz && <PatternQuiz quiz={item.quiz} pinyinFor={pinyinFor} />}
    </View>
  );
}

// Optional block shown BELOW the word patterns, from part4_use.sentences.
// The first point in the course where words are strung into a whole sentence,
// so it shows the sentence, then takes it apart piece by piece.
function SentenceCard({ item, pinyinFor }) {
  const [picked, setPicked] = useState([]);
  const quiz = item.quiz;
  const blanks = quiz ? quiz.template.filter(t => t == null).length : 0;
  const done = quiz ? picked.length >= blanks : false;
  const correct = done && picked.every((c, i) => c === quiz.answer[i]);

  useEffect(() => {
    if (done && correct) speakChinese(quiz.audio_text, 'female', quiz.result_pinyin);
  }, [done, correct, quiz?.audio_text]);

  let blankIdx = -1;
  const cells = (quiz?.template || []).map((t, i) => {
    if (t != null) return { key: i, text: t, kind: 'fixed' };
    blankIdx += 1;
    const v = picked[blankIdx];
    return { key: i, text: v || '?', kind: v ? 'filled' : 'blank', slot: blankIdx };
  });

  return (
    <View style={{ marginBottom: 20 }}>
      <View style={s.card}>
        {item.intro ? <Text style={s.logicTag}>{item.intro}</Text> : null}

        <View style={s.sentenceStage}>
          <Text style={s.sentenceCn}>{item.sentence}</Text>
          <Text style={s.sentencePy}>{item.pinyin}</Text>
          <TouchableOpacity
            onPress={() => speakChinese(item.audio_text, 'female', item.pinyin)}
            style={s.sentenceAudioBtn}
            activeOpacity={0.85}
          >
            <Text style={s.sentenceAudioText}>🔊  Listen</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.meaningEn}>{item.meaning}</Text>

        {/* A picture of the answer, shown before the words for it — you can
            work out 这是太阳 from a sun without reading any Chinese. */}
        {item.answer_image ? (
          <View style={s.answerImageStage}>
            <Text style={s.answerImageGlyph}>{item.answer_image}</Text>
          </View>
        ) : null}

        {/* A question needs its answer next to it, or the pattern is only half
            shown. Rendered as a reply so the pair reads as one exchange. */}
        {item.reply ? (
          <View style={s.replyStage}>
            <Text style={s.replyArrow}>↳</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.replyCn}>{item.reply.sentence}</Text>
              <Text style={s.replyPy}>{item.reply.pinyin}</Text>
              <Text style={s.replyEn}>{item.reply.meaning}</Text>
            </View>
            <TouchableOpacity
              onPress={() => speakChinese(item.reply.audio_text || item.reply.sentence, 'female', item.reply.pinyin)}
              style={s.audioBtn}
              activeOpacity={0.7}
            >
              <Text style={s.audioIcon}>🔊</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* The sentence taken apart, in reading order. Optional: a sentence
            carried by a picture does not need naming piece by piece. */}
        {item.breakdown?.length ? (
        <View style={s.breakdownRow}>
          {item.breakdown.map((b, i) => (
            <React.Fragment key={`${b.part}-${i}`}>
              {i > 0 && <Text style={s.breakdownArrow}>›</Text>}
              <TouchableOpacity
                style={s.breakdownChip}
                onPress={() => speakChinese(b.audio_text || b.part, 'female', b.pinyin)}
                activeOpacity={0.8}
              >
                <Text style={s.breakdownRole}>{b.role}</Text>
                <Text style={s.breakdownCn}>{b.part}</Text>
                <Text style={s.breakdownPy}>{b.pinyin}</Text>
                <Text style={s.breakdownEn}>{b.meaning}</Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>
        ) : null}

        {item.note ? <Text style={s.body}>{item.note}</Text> : null}
      </View>

      {quiz && (
        <View style={s.quizCard}>
          <View style={s.equationRow}>
            {cells.map(c => (
              <View
                key={c.key}
                style={[
                  s.eqCell, s.eqCellWide,
                  c.kind === 'blank' && s.eqCellBlank,
                  c.kind === 'filled' && (
                    done ? (picked[c.slot] === quiz.answer[c.slot] ? s.eqCellRight : s.eqCellWrong) : s.eqCellFilled
                  ),
                ]}
              >
                <Text style={s.eqCellText}>{c.text}</Text>
              </View>
            ))}
          </View>

          <View style={s.choiceRow}>
            {quiz.choices.map(c => (
              <TouchableOpacity
                key={c}
                style={[s.charChoice, done && s.charChoiceIdle]}
                onPress={() => { speakChinese(c, 'female', pinyinFor?.(c)); if (!done) setPicked([...picked, c]); }}
                activeOpacity={0.8}
              >
                <Text style={[s.charChoiceText, s.charChoiceTextAudio]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {done && (
            <>
              <View style={[s.feedback, correct ? s.feedbackRight : s.feedbackWrong]}>
                <Text style={s.feedbackIcon}>{correct ? '✓' : '✕'}</Text>
                <Text style={[s.feedbackText, correct ? s.feedbackTextRight : s.feedbackTextWrong]}>
                  {correct
                    ? `${quiz.result_word} — ${quiz.result_meaning}`
                    : `Not quite — the answer is ${quiz.answer.join(' ')}`}
                </Text>
              </View>
              <View style={s.quizActions}>
                <TouchableOpacity onPress={() => speakChinese(quiz.audio_text, 'female', quiz.result_pinyin)} style={s.smallBtn} activeOpacity={0.85}>
                  <Text style={s.smallBtnText}>🔊</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setPicked([])} activeOpacity={0.7}>
                  <Text style={s.replayLink}>↻ try again</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
}

// ── Part 5 · Write ───────────────────────────────────────────────────────────
// One character at a time on a fixed, non-scrolling screen. A small animated
// reference shows the stroke order; finishing a character advances to the next,
// and finishing the last one hands off to Practice.
function MiniGrid({ char, size = 76 }) {
  return (
    <View style={[s.miniGrid, { width: size, height: size }]}>
      <View style={s.miniCrossV} />
      <View style={s.miniCrossH} />
      <StrokeAnimator char={char} size={size - 10} loop colored />
    </View>
  );
}

function WritePart({
  chars, infoFor, onDrawingChange, onAllDone, onBack, canvasSize,
  completesLearn = true,   // finishing here ticks the last outstanding part
  hasNextPart = false,     // a part follows Write (Characters 2's culture part)
  nextLabel = '',          // names that part, so the button says where it goes
  showPinyin = true,
}) {
  const [idx, setIdx] = useState(0);
  const advancing = useRef(false);

  const char = chars[idx];

  const info = infoFor(char) || {};
  const last = idx >= chars.length - 1;

  // Say each character as it comes up, so the sound is attached to the writing.
  useEffect(() => { if (char) speakChinese(char, 'female', info.pinyin); }, [char, info.pinyin]);

  const [finished, setFinished] = useState(false);
  const [rewrites, setRewrites] = useState(0);
  const handleComplete = () => {
    if (advancing.current) return;
    advancing.current = true;
    speakChinese(char, 'female', info.pinyin);
    // Let the finished character register before moving on.
    setTimeout(() => {
      advancing.current = false;
      if (last) setFinished(true);
      else setIdx(i => i + 1);
    }, 900);
  };

  const again = () => { setRewrites(n => n + 1); setIdx(0); setFinished(false); };

  if (finished) {
    return (
      <View style={s.writeDoneWrap}>
        <Text style={s.writeDoneEmoji}>✍️</Text>
        <Text style={s.writeDoneTitle}>All {chars.length} written</Text>

        {/* Says what it will actually do: hand off to Practice when this was
            the last part outstanding, otherwise carry on to the next one. */}
        <TouchableOpacity style={s.writeDoneBtn} onPress={onAllDone} activeOpacity={0.85}>
          <Text style={s.writeDoneBtnText}>
            {hasNextPart
              ? (nextLabel || 'Continue →')
              : completesLearn ? '🎯 Go to Practice' : '← Back to parts'}
          </Text>
        </TouchableOpacity>

        {/* Rewriting is offered a limited number of times, then the only way
            on is forward. */}
        {rewrites < MAX_REWRITES && (
          <TouchableOpacity style={s.writeAgainBtn} onPress={again} activeOpacity={0.85}>
            <Text style={s.writeAgainText}>
              ↻ Write one more time{rewrites > 0 ? `  (${MAX_REWRITES - rewrites} left)` : ''}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
          <Text style={s.writeDoneBack}>← Back to parts</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.writeWrap}>
      <View style={s.writeTop}>
        <TouchableOpacity onPress={onBack} style={s.writeBack} activeOpacity={0.7}>
          <Text style={s.writeBackText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.writeCount}>{idx + 1} / {chars.length}</Text>
      </View>

      <View style={s.writeRef}>
        <MiniGrid char={char} />
        <View style={{ flex: 1 }}>
          <View style={s.titleRow}>
            <View style={s.titleStack}>
              {/* Underlined: tap to hear it and to see what it means. The
                  meaning stays hidden until asked for — writing 妈 from a
                  prompt that already says "mum" is copying, not remembering. */}
              <Gloss
                text={char}
                meaning={info.meaning}
                style={s.bigName}
                align="left"
                onPress={() => speakChinese(char, 'female', info.pinyin)}
              />
              {showPinyin && !!info.pinyin && <Text style={s.bigPinyin}>{info.pinyin}</Text>}
            </View>
          </View>
        </View>
      </View>

      <View style={{ alignSelf: 'center' }}>
        <StrokeWriter
          key={char}
          char={char}
          size={canvasSize}
          onDrawingChange={onDrawingChange}
          onComplete={handleComplete}
        />
      </View>
    </View>
  );
}

// ── Screen ───────────────────────────────────────────────────────────────────
export default function CharacterLessonScreen({
  lessonData,
  learnDone = false,
  partsDone = [],
  stagesPassed = [],
  quizPassed = false,
  initialTab = 'learn',
  onBack,
  onLearnComplete,
  onPartDone,
  onStartStage,
  onStartQuiz,
}) {
  const [tab, setTab] = useState(initialTab);
  const [openPart, setOpenPart] = useState(null); // null = the stage list
  const { width: winW, height: winH } = useWindowDimensions();
  const writeCanvas = Math.round(Math.min(winW - 76, winH * 0.33, 276));
  if (!lessonData) return null;

  const lc = lessonData.learn_content || {};
  const p1 = lc.part1_discover || {};
  const p2 = lc.part2_build    || {};
  const p3 = lc.part3_read     || {};
  const p4 = lc.part4_use      || {};
  const p5 = lc.part5_write    || {};

  // Pinyin/meaning for the Write part come from the characters taught in Part 3.
  // Part 5 writes characters that Part 3 may never have read, so gather
  // readings from every part that introduces one.
  const charInfo = {
    ...Object.fromEntries((p1.strokes || []).map(x =>
      [x.example_char, { pinyin: x.example_pinyin, meaning: x.example_meaning }])),
    ...Object.fromEntries((p2.rules || []).map(r =>
      [r.result_char, { pinyin: r.result_pinyin, meaning: r.result_meaning }])),
    ...Object.fromEntries((p3.characters || []).map(c =>
      [c.character, { pinyin: c.pinyin, meaning: c.meaning }])),
    // Characters 2 keeps the same facts under different keys. Without these
    // its Write part would show a bare character with no reading at all.
    ...Object.fromEntries((lc.part1_blocks?.blocks || []).map(x =>
      [x.character, { pinyin: x.pinyin, meaning: x.meaning }])),
    ...Object.fromEntries((lc.part2_components?.components || []).flatMap(c =>
      [[c.from.character, { pinyin: c.from.pinyin, meaning: c.from.meaning }],
       ...c.characters.map(x => [x.character, { pinyin: x.pinyin, meaning: x.meaning }])])),
    ...Object.fromEntries((lc.part3_dialogue?.characters || []).map(x =>
      [x.character, { pinyin: x.pinyin, meaning: x.meaning }])),
  };

  // Every reading this lesson knows, so audio never has to guess at a
  // polyphonic character like 子 (zǐ alone, neutral in 儿子) or 了.
  const pinyinMap = {
    ...Object.fromEntries((p1.strokes || []).map(x => [x.example_char, x.example_pinyin])),
    ...Object.fromEntries((p2.rules || []).map(r => [r.result_char, r.result_pinyin])),
    ...Object.fromEntries((p3.characters || []).map(c => [c.character, c.pinyin])),
    ...Object.fromEntries((p4.patterns || []).map(x => [x.word, x.pinyin])),
    ...Object.fromEntries((p4.patterns || []).flatMap(x => (x.variations || []).map(v => [v.word, v.pinyin]))),
    // Multi-character pieces of a sentence (没有, 说话) need their own reading —
    // speaking them character by character gets the tones wrong.
    ...Object.fromEntries((p4.sentences || []).flatMap(st => (st.breakdown || []).map(b => [b.part, b.pinyin]))),
    ...Object.fromEntries((p4.sentences || []).filter(st => st.reply).map(st => [st.reply.sentence, st.reply.pinyin])),
    ...Object.fromEntries(
      (p2.structures || (p2.structure ? [p2.structure] : []))
        .flatMap(st => st.examples || [])
        .map(ex => [ex.character, ex.pinyin]),
    ),
    // Characters 2 keeps its readings in different places.
    ...Object.fromEntries((lc.part1_blocks?.blocks || []).map(x => [x.character, x.pinyin])),
    ...Object.fromEntries((lc.part2_components?.components || []).flatMap(c =>
      [[c.from.character, c.from.pinyin], ...c.characters.map(x => [x.character, x.pinyin])])),
    ...Object.fromEntries((lc.part3_dialogue?.words || []).map(w => [w.word, w.pinyin])),
    ...Object.fromEntries((lc.part3_dialogue?.dialogues || [])
      .flatMap(d => d.lines.map(l => [l.text, l.pinyin]))),
  };
  // Fall back to the course-wide lookup: a lesson often uses a character
  // taught elsewhere (Lesson 4's 儿子 needs 子 from Lesson 6).
  const pinyinFor = (t) => pinyinMap[t] || getCharacterReading(t);


  // Characters Foundations 2 teaches components and usage rather than strokes,
  // so its lessons carry a different set of parts. Part 4 is the exception:
  // writing is taught exactly as it was in lessons 1-10, same WritePart.
  const b1 = lc.part1_blocks     || null;
  const b2 = lc.part2_components || null;
  const b3 = lc.part3_dialogue   || null;
  const b5 = lc.part5_culture    || null;
  const isPartTwo = Boolean(b1 || b2 || b3 || b5);
  const writeTwo = isPartTwo ? (lc.part4_write || {}) : {};

  const SLIDES_TWO = [
    {
      part: b1 || {},
      body: (
        <>
          {(b1?.blocks || []).map(x => <BlockCard key={x.character} item={x} />)}
          {b1?.match ? <MatchCard item={b1.match} /> : null}
        </>
      ),
    },
    {
      part: b2 || {},
      body: (
        <>
          {b2?.caveat ? <Text style={s.intro}>{b2.caveat}</Text> : null}
          {(b2?.components || []).map(x => (
            <ComponentCard key={x.radical} item={x} radicalAudio={b2.radical_audio} />
          ))}
          {b2?.group ? <GroupCheck item={b2.group} /> : null}
        </>
      ),
    },
    {
      part: b3 || {},
      body: (
        <>
          {/* characters, then the words they build, then the dialogues */}
          {(b3?.characters || []).map(c => <CharacterIntroCard key={c.character} item={c} />)}
          {(b3?.words || []).map(w => <WordCard key={w.word} item={w} />)}
          {/* A few of those words, said aloud. */}
          {b3?.read_aloud ? (
            <View style={s.card}>
              <Text style={s.structureQ}>{b3.read_aloud.title}</Text>
              {b3.read_aloud.intro ? <Text style={s.body}>{b3.read_aloud.intro}</Text> : null}
              {b3.read_aloud.items.map(x => <ReadAloud key={x.text} item={x} />)}
            </View>
          ) : null}
          {(b3?.dialogues || []).map((d, i) => <DialogueCard key={`${d.title}-${i}`} item={d} />)}
        </>
      ),
    },
    ...((writeTwo.characters || []).length
      ? [{
          part: writeTwo,
          noScroll: true,
          body: (
            <WritePart
              showPinyin={false}
              chars={writeTwo.characters}
              infoFor={(c) => charInfo[c]}
              onBack={() => setOpenPart(null)}
              onAllDone={handleWriteFinished}
              completesLearn={writeCompletesLearn}
              hasNextPart={writeHasNextPart}
              nextLabel={nextPartLabel}
              nextLabel={nextPartLabel}
              canvasSize={writeCanvas}
            />
          ),
        }]
      : []),
    { part: b5 || {}, body: b5 ? <CultureCard item={b5} /> : null },
  ];

  const SLIDES_ONE = [
    {
      part: p1,
      body: (
        <>
          {(p1.strokes || []).map(st => <StrokeCard key={st.stroke} item={st} />)}
          {(p1.recognition_check || []).map((q, i) => <RecognitionCheck key={i} item={q} />)}
        </>
      ),
    },
    {
      part: p2,
      // Structure comes first when a lesson teaches one: you cannot follow a
      // left-before-right rule until you can see which part is the left.
      // Rules are keyed on the character, not the rule — one rule can produce
      // several characters (先中间后两边 covers 山, 小 and 少).
      body: (
        <>
          {/* A lesson may teach one structure (Lesson 8) or several
              (Lesson 9 teaches both kinds of enclosure). */}
          {(p2.structures || (p2.structure ? [p2.structure] : [])).map((st, i) => (
            <StructureCard key={st.name || i} item={st} />
          ))}
          {(p2.rules || []).map((r, i) => <RuleCard key={`${r.result_char}-${i}`} item={r} />)}
        </>
      ),
    },
    { part: p3, body: (p3.characters || []).map(c => <BuildCard key={c.character} item={c} />) },
    {
      part: p4,
      body: (
        <>
          {(p4.patterns || []).map(pt => <PatternCard key={pt.word} item={pt} pinyinFor={pinyinFor} />)}
          {(p4.sentences || []).map((st, i) => (
            <SentenceCard key={`${st.sentence}-${i}`} item={st} pinyinFor={pinyinFor} />
          ))}
        </>
      ),
    },
    ...((p5.characters || []).length
      ? [{
          part: p5,
          noScroll: true,
          body: (
            <WritePart
              chars={p5.characters}
              infoFor={(c) => charInfo[c]}
              onBack={() => setOpenPart(null)}
              onAllDone={handleWriteFinished}
              completesLearn={writeCompletesLearn}
              hasNextPart={writeHasNextPart}
              canvasSize={writeCanvas}
            />
          ),
        }]
      : []),
  ];

  const SLIDES = isPartTwo ? SLIDES_TWO : SLIDES_ONE;

  // Write is the LAST part in Characters 1 and the FOURTH in Characters 2,
  // where a culture part follows it. Its index is worked out from the slide
  // list rather than assumed — hard-coding 4 ticked the wrong part in the
  // second half, which left Practice locked.
  const writeIndex = SLIDES.findIndex(sl => sl.noScroll);

  // What finishing Write will actually do, which is what its button says.
  // A following part always wins: in Characters 2 the culture part comes
  // after writing, so Write hands on to it rather than skipping to Practice.
  const writeHasNextPart = writeIndex >= 0 && writeIndex + 1 < SLIDES.length;
  const writeCompletesLearn =
    !writeHasNextPart &&
    writeIndex >= 0 &&
    SLIDES.every((_, i) => i === writeIndex || partsDone.includes(i));
  const nextPartLabel = writeHasNextPart
    ? `Go to Part ${writeIndex + 2}${SLIDES[writeIndex + 1]?.part?.title ? ` · ${SLIDES[writeIndex + 1].part.title}` : ''} →`
    : '';

  // Icons and accent colours for the stage list, matching how the HSK levels
  // present their practice stages. Names and blurbs come from the lesson data.
  const PART_META = isPartTwo
    ? [
        { icon: '👁',  color: '#5E789F' },   // 独体字
        { icon: '🧩',  color: '#b87243' },   // 部件与部首
        { icon: '💬',  color: '#25523D' },   // 使用
        { icon: '✍️',  color: WARM_ORANGE }, // 书写
        { icon: '🔍',  color: '#6B4FA0' },   // 汉字探秘
      ]
    : [
        { icon: '👁',  color: '#5E789F' },
        { icon: '🧱',  color: '#38529D' },
        { icon: '📖',  color: '#25523D' },
        { icon: '🧩',  color: '#b87243' },
        { icon: '✍️',  color: WARM_ORANGE },
      ];

  // Finishing Write is no different from finishing any other part: tick it,
  // then either move on or hand off to Practice. finishPart already does both.
  //
  // A function declaration, not a const arrow: the SLIDES array above passes
  // this to WritePart, and an arrow declared here would still be in its
  // temporal dead zone when that array is built.
  function handleWriteFinished() {
    if (writeIndex >= 0) finishPart(writeIndex);
  }

  const allPartsDone = SLIDES.every((_, i) => partsDone.includes(i));

  // Finishing the last outstanding part is what unlocks Practice.
  const finishPart = (i) => {
    const alreadyDone = partsDone.includes(i);
    onPartDone?.(i);
    const after = alreadyDone ? partsDone : [...partsDone, i];
    // Only hand off to Practice when this part was the last one outstanding.
    // Re-doing a part that was already ticked just carries on through Learn.
    const justCompletedTheSet = !alreadyDone && SLIDES.every((_, n) => after.includes(n));

    if (justCompletedTheSet) onLearnComplete?.();
    else if (i + 1 < SLIDES.length) setOpenPart(i + 1);  // straight on to the next
    else setOpenPart(null);
  };

  // ── Learn: the stage list ─────────────────────────────────────────────────
  const renderPartList = () => (
    <ScrollView key="part-list" contentContainerStyle={s.tabContent} showsVerticalScrollIndicator={false}>
      <View style={s.dotsRow}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[s.dot, partsDone.includes(i) && s.dotDone]} />
        ))}
      </View>

      {SLIDES.map((sl, i) => {
        const meta = PART_META[i] || PART_META[0];
        const done = partsDone.includes(i);
        return (
          <TouchableOpacity
            key={i}
            style={s.stageCard}
            onPress={() => setOpenPart(i)}
            activeOpacity={0.85}
          >
            <View style={[s.stageIcon, { backgroundColor: meta.color }]}>
              <Text style={s.stageIconText}>{meta.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.stageName}>{sl.part.title}</Text>
              <Text style={s.stageDesc}>{sl.part.subtitle}</Text>
            </View>
            {done
              ? <Text style={s.stageCheck}>✅</Text>
              : <View style={[s.stageGo, { backgroundColor: meta.color }]}>
                  <Text style={s.stageGoText}>→</Text>
                </View>}
          </TouchableOpacity>
        );
      })}

      {allPartsDone && (
        <TouchableOpacity style={s.navPrimary} onPress={onLearnComplete} activeOpacity={0.85}>
          <Text style={s.navPrimaryText}>🎯 Go to Practice</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  // ── Learn: one open part ──────────────────────────────────────────────────
  const renderOpenPart = () => {
    const current = SLIDES[openPart];
    const meta = PART_META[openPart] || PART_META[0];

    const head = (
      <View style={s.partHead}>
        <View style={[s.partNum, { backgroundColor: meta.color }]}>
          <Text style={s.partNumText}>{openPart + 1}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.partTitle}>{current.part.title}</Text>
          <Text style={s.partSub}>{current.part.subtitle}</Text>
        </View>
      </View>
    );

    if (current.noScroll) {
      return <View style={s.fixedSlide}>{head}{current.body}</View>;
    }

    return (
      // Keyed on the part so moving to the next one starts at the top
      // instead of inheriting the previous part's scroll position.
      <ScrollView
        key={`part-${openPart}`}
        contentContainerStyle={s.tabContent}
        showsVerticalScrollIndicator={false}
      >
        {head}
        {current.part.intro ? <Text style={s.intro}>{current.part.intro}</Text> : null}
        {current.body}

        <View style={s.navBar}>
          <TouchableOpacity style={s.navBtn} onPress={() => setOpenPart(null)} activeOpacity={0.8}>
            <Text style={s.navBtnText}>← Back</Text>
          </TouchableOpacity>
          {/* Finishing the last outstanding part goes straight to Practice,
              so the button says that rather than a bare "Done". */}
          <TouchableOpacity style={s.navPrimary} onPress={() => finishPart(openPart)} activeOpacity={0.85}>
            <Text style={s.navPrimaryText}>
              {SLIDES.every((_, i) => i === openPart || partsDone.includes(i))
                ? '🎯 Go to Practice'
                : 'Done ✓'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  const renderLearn = () => (openPart == null ? renderPartList() : renderOpenPart());

  // Practice is four stages, unlocked in order, same shape as the Pinyin course.
  const renderPractice = () => (
    <ScrollView key="practice" contentContainerStyle={s.tabContent} showsVerticalScrollIndicator={false}>
      {!learnDone && (
        <View style={s.lockedBanner}>
          <Text style={s.lockedEmoji}>🔒</Text>
          <Text style={s.lockedTitle}>Complete Learn First</Text>
          <Text style={s.lockedSub}>
            Work through all five parts to unlock Practice.
          </Text>
        </View>
      )}

      {stagesForLesson(lessonData.id).map(stage => {
        const stageDone = stagesPassed.includes(stage.index);
        const unlocked  = learnDone && (stage.index === 0 || stagesPassed.includes(stage.index - 1));
        return (
          <TouchableOpacity
            key={stage.index}
            style={[s.recallCard, !unlocked && s.recallLocked]}
            onPress={() => unlocked && onStartStage(stage.index)}
            activeOpacity={unlocked ? 0.85 : 1}
          >
            <View style={[s.recallDot, { backgroundColor: unlocked ? stage.color : 'rgba(55,73,80,0.18)' }]}>
              <Text style={s.recallDotText}>{stageDone ? '✓' : unlocked ? stage.icon : '🔒'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.recallTitle, !unlocked && s.lockedText]}>{stage.name}</Text>
              <Text style={s.recallDesc}>
                {stageDone ? 'Passed 🎉' : stage.desc}
              </Text>
            </View>
            {unlocked && <Text style={s.recallArrow}>{stageDone ? '↩' : '→'}</Text>}
          </TouchableOpacity>
        );
      })}

      {/* Passing every stage unlocks the lesson quiz. */}
      {(() => {
        const unlocked = stagesPassed.length >= practiceStageCount(lessonData.id);
        return (
          <TouchableOpacity
            style={[s.quizCta, !unlocked && s.recallLocked]}
            onPress={() => unlocked && onStartQuiz?.()}
            activeOpacity={unlocked ? 0.85 : 1}
          >
            <Text style={s.quizCtaEmoji}>{quizPassed ? '🏆' : unlocked ? '📝' : '🔒'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[s.quizCtaTitle, !unlocked && s.lockedText]}>Lesson Quiz</Text>
              <Text style={s.quizCtaSub}>
                {quizPassed
                  ? 'Passed 🎉'
                  : unlocked
                    ? `${QUIZ_LENGTH} questions · 60% to pass`
                    : 'Finish all four stages to unlock'}
              </Text>
            </View>
            {unlocked && <Text style={s.recallArrow}>→</Text>}
          </TouchableOpacity>
        );
      })()}

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  return (
    <ScreenBackground levelId="hsk1">
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="dark-content" />

        <View style={s.header}>
          {/* Back goes up exactly one level: out of an open part to the part
              list, and only from the list itself out of the lesson. Without
              this it always left the lesson, skipping a level. */}
          <TouchableOpacity
            onPress={openPart != null ? () => setOpenPart(null) : onBack}
            style={s.backBtn}
          >
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
  // Pinyin reads as a label for the character above it, not as a second title
  // beside it — so it is stacked underneath and a good deal smaller.
  titleStack: { flex: 1 },
  bigName:   { fontSize: 30, fontWeight: '900', color: DEEP_NAVY },
  bigPinyin: { fontSize: 16, fontWeight: '700', color: WARM_BROWN, marginTop: 1 },
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
    minWidth: 80, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1.5, borderColor: 'rgba(155,104,70,0.30)', backgroundColor: CARD_WHITE,
    alignItems: 'center',
  },
  textChoiceLabel:  { fontSize: 22, lineHeight: 29, fontWeight: '800', color: DEEP_NAVY },
  textChoicePinyin: { fontSize: 12, color: WARM_BROWN, marginTop: 2 },
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


  writeDoneWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 10 },
  writeDoneEmoji: { fontSize: 54 },
  writeDoneTitle: { fontSize: 20, fontWeight: '900', color: DEEP_NAVY, marginBottom: 4 },
  writeDoneBtn: {
    alignSelf: 'stretch', backgroundColor: SLATE_TEAL, borderRadius: 14,
    paddingVertical: 16, paddingHorizontal: 24, alignItems: 'center',
  },
  writeDoneBtnText: { fontSize: 17, fontWeight: '800', color: CARD_WHITE },
  writeAgainBtn: {
    paddingHorizontal: 20, paddingVertical: 13, borderRadius: 14,
    borderWidth: 1.5, borderColor: 'rgba(155,104,70,0.35)', backgroundColor: CARD_WHITE,
  },
  writeDoneBack: { fontSize: 15, fontWeight: '700', color: WARM_BROWN, marginTop: 4 },
  writeAgainText: { fontSize: 15, fontWeight: '700', color: WARM_BROWN },

  quizCta: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: SLATE_TEAL, borderRadius: 14, padding: 18, marginTop: 8,
  },
  quizCtaEmoji: { fontSize: 30 },
  quizCtaTitle: { fontSize: 17, fontWeight: '800', color: CARD_WHITE, marginBottom: 2 },
  quizCtaSub:   { fontSize: 13, color: 'rgba(255,255,255,0.78)' },

  stageCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: CARD_WHITE, borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(155,104,70,0.18)',
  },
  stageIcon: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  stageIconText: { fontSize: 26 },
  stageName: { fontSize: 16, fontWeight: '800', color: DEEP_NAVY, marginBottom: 3 },
  stageDesc: { fontSize: 13, color: SLATE_TEAL },
  stageCheck: { fontSize: 22 },
  stageGo: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  stageGoText: { color: CARD_WHITE, fontWeight: '900', fontSize: 15 },

  fixedSlide: { flex: 1, paddingHorizontal: 20, paddingTop: 10, gap: 10 },
  writeWrap:  { flex: 1, gap: 12 },
  writeTop:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  writeBack:  {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: CARD_WHITE, borderWidth: 1.5, borderColor: 'rgba(155,104,70,0.30)',
  },
  writeBackText: { fontSize: 14, fontWeight: '700', color: WARM_BROWN },
  writeCount: { fontSize: 15, fontWeight: '800', color: SLATE_TEAL },
  writeRef: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: CARD_WHITE, borderRadius: 14, padding: 10,
    borderWidth: 1, borderColor: 'rgba(155,104,70,0.18)',
  },
  miniGrid: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFF8ED', borderRadius: 8,
    borderWidth: 1.5, borderColor: 'rgba(196,80,58,0.35)',
  },
  miniCrossV: { position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(196,80,58,0.25)' },
  miniCrossH: { position: 'absolute', top: '50%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(196,80,58,0.25)' },

  // Part 2 · character structure (左右结构), shown before the writing rules
  structureCard: { borderColor: WARM_ORANGE, borderWidth: 1.5 },
  structureRule: {
    backgroundColor: '#FFF3E0', borderRadius: 10, padding: 12, gap: 3,
    borderLeftWidth: 4, borderLeftColor: WARM_ORANGE,
  },
  structureRuleCn: { fontSize: 19, fontWeight: '900', color: DEEP_NAVY },
  structureRuleEn: { fontSize: 14, color: SLATE_TEAL },
  structureQ:      { fontSize: 16, fontWeight: '800', color: DEEP_NAVY },

  // An exception to the rule just stated — deliberately a different colour
  // from the rule box so it reads as "but not these".
  exceptionBox: {
    backgroundColor: 'rgba(196,80,58,0.07)', borderRadius: 12, padding: 12, gap: 8,
    borderLeftWidth: 4, borderLeftColor: '#C4503A',
  },
  exceptionHead:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  exceptionRadical:  { fontSize: 34, fontWeight: '900', color: '#C4503A' },
  exceptionName:     { fontSize: 17, fontWeight: '900', color: DEEP_NAVY },
  exceptionPinyin:   { fontSize: 13, fontWeight: '700', color: WARM_BROWN },
  exceptionNameEn:   { fontSize: 13, color: SLATE_TEAL },
  exceptionRuleCn:   { fontSize: 18, fontWeight: '900', color: '#C4503A' },
  exceptionRuleEn:   { fontSize: 14, color: SLATE_TEAL, lineHeight: 19 },
  exceptionRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  exceptionChip: {
    flexGrow: 1, alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 10, backgroundColor: CARD_WHITE,
    borderWidth: 1, borderColor: 'rgba(196,80,58,0.25)',
  },
  exceptionChipCn:    { fontSize: 26, fontWeight: '900', color: DEEP_NAVY },
  exceptionChipPy:    { fontSize: 13, color: WARM_BROWN },
  exceptionChipEn:    { fontSize: 12, fontWeight: '700', color: WARM_ORANGE },
  exceptionChipInner: { fontSize: 11, color: SLATE_TEAL, marginTop: 2 },

  splitRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFF8ED', borderRadius: 12, padding: 10,
  },
  splitBox: {
    flexDirection: 'row', alignItems: 'stretch', height: 54,
    borderRadius: 8, borderWidth: 1.5, borderColor: 'rgba(155,104,70,0.35)',
    backgroundColor: CARD_WHITE, overflow: 'hidden',
  },
  splitHalf:    { minWidth: 32, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' },
  splitDivider: { width: 1.5, backgroundColor: 'rgba(155,104,70,0.35)' },
  // Shown instead of the divider when one part wraps around the other.
  splitWrapMark: { justifyContent: 'center', paddingHorizontal: 2 },
  splitWrapText: { fontSize: 15, fontWeight: '900', color: WARM_BROWN },
  splitPart:    { fontSize: 24, fontWeight: '800', color: WARM_BROWN },
  splitEquals:  { fontSize: 16, fontWeight: '800', color: SLATE_TEAL },
  splitWhole:   { alignItems: 'center', minWidth: 44 },
  splitWholeChar: { fontSize: 32, fontWeight: '900', color: DEEP_NAVY },
  splitWholePy:   { fontSize: 12, color: WARM_BROWN },
  splitNotes:   { flex: 1, gap: 1 },
  splitNote:    { fontSize: 14, fontWeight: '700', color: WARM_ORANGE },
  splitNoteDim: { fontSize: 12, color: SLATE_TEAL, lineHeight: 16 },

  contrastBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: 'rgba(55,73,80,0.06)', borderRadius: 12, padding: 12,
  },
  contrastChars: { fontSize: 26, fontWeight: '900', color: DEEP_NAVY, letterSpacing: 2 },

  // Part 4 · a whole sentence
  sentenceStage: {
    alignSelf: 'stretch', alignItems: 'center', gap: 6,
    backgroundColor: '#FFF8ED', borderRadius: 14, paddingVertical: 18, paddingHorizontal: 12,
    borderWidth: 1, borderColor: 'rgba(155,104,70,0.15)',
  },
  sentenceCn: { fontSize: 32, fontWeight: '900', color: DEEP_NAVY, textAlign: 'center', letterSpacing: 1 },
  sentencePy: { fontSize: 16, fontWeight: '600', color: WARM_BROWN, textAlign: 'center' },
  sentenceAudioBtn: {
    marginTop: 4, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20,
    backgroundColor: WARM_BROWN,
  },
  sentenceAudioText: { fontSize: 15, fontWeight: '800', color: CARD_WHITE },

  // A picture standing in for the answer.
  answerImageStage: {
    alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 14, backgroundColor: '#FFF8ED',
    borderWidth: 1, borderColor: 'rgba(155,104,70,0.15)',
  },
  answerImageGlyph: { fontSize: 72, lineHeight: 84 },

  // The answer to a question sentence.
  replyStage: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(46,125,50,0.08)', borderRadius: 12, padding: 12,
    borderLeftWidth: 4, borderLeftColor: SUCCESS,
  },
  replyArrow: { fontSize: 20, fontWeight: '900', color: SUCCESS },
  replyCn:    { fontSize: 24, fontWeight: '900', color: DEEP_NAVY, letterSpacing: 1 },
  replyPy:    { fontSize: 14, fontWeight: '600', color: WARM_BROWN, marginTop: 1 },
  replyEn:    { fontSize: 14, fontWeight: '700', color: WARM_ORANGE, marginTop: 1 },

  breakdownRow:   { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  breakdownArrow: { fontSize: 18, fontWeight: '900', color: SLATE_TEAL },
  breakdownChip: {
    flexGrow: 1, alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8,
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(155,104,70,0.25)',
    backgroundColor: CARD_WHITE,
  },
  breakdownRole: { fontSize: 11, fontWeight: '700', color: SLATE_TEAL, textTransform: 'uppercase', letterSpacing: 0.5 },
  breakdownCn:   { fontSize: 22, fontWeight: '900', color: DEEP_NAVY, marginTop: 2 },
  breakdownPy:   { fontSize: 13, color: WARM_BROWN },
  breakdownEn:   { fontSize: 13, fontWeight: '700', color: WARM_ORANGE },

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
  varEnText: { fontSize: 12, fontWeight: '700', color: WARM_ORANGE },

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
    minWidth: 50, height: 50, borderRadius: 10,
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
  // A sentence blank holds a whole word, not one character.
  eqCellWide:   { paddingHorizontal: 10 },
  eqPlus:       { fontSize: 18, fontWeight: '800', color: SLATE_TEAL },
  eqEquals:     { fontSize: 18, fontWeight: '800', color: SLATE_TEAL, marginHorizontal: 2 },
  eqMeaning:    { fontSize: 16, fontWeight: '700', color: WARM_ORANGE },

  charChoice: {
    minWidth: 70, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1.5, borderColor: 'rgba(155,104,70,0.30)', backgroundColor: CARD_WHITE,
    alignItems: 'center',
  },
  charChoiceIdle:  { opacity: 0.5 },
  // Chinese-only answers, the same 28 the Practice screen uses.
  charChoiceText:  { fontSize: 28, lineHeight: 36, fontWeight: '900', color: DEEP_NAVY },
  // Part 4's answers, two steps down from the Part 2 buttons.
  charChoiceTextAudio: { fontSize: 24, lineHeight: 31 },
  quizActions: { flexDirection: 'row', alignItems: 'center', gap: 14 },

  // Slide navigation (inside the scroll content)
  navBar: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20,
  },
  navBtn: {
    paddingHorizontal: 20, paddingVertical: 15, borderRadius: 14,
    borderWidth: 1.5, borderColor: 'rgba(155,104,70,0.30)', backgroundColor: CARD_WHITE,
  },
  navBtnText:         { fontSize: 16, fontWeight: '700', color: WARM_BROWN },
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
