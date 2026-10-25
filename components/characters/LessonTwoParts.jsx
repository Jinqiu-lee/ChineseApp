// Learn cards for Characters Foundations 2 (lessons 11-20).
//
// The second half of the course teaches a different thing from the first, so
// it needs different cards. Characters 1 builds a character out of strokes;
// Characters 2 takes characters apart into components and puts them to work:
//
//   Part 1  独体字      a picture becomes a character
//   Part 2  部件与部首   that character shrinks into a radical inside others
//   Part 3  使用        words, then dialogue
//   Part 4  书写        unchanged — reuses the writer from Characters 1
//   Part 5  汉字探秘     one thing worth knowing about the language
//
// Part 4 is deliberately absent here: the lesson screen keeps using WritePart,
// so stroke order is taught exactly as it was in lessons 1-10.

import React, { useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator,
  Modal, useWindowDimensions,
} from 'react-native';
import StrokeAnimator from './StrokeAnimator';
import { getLessonImage } from '../../data/characters/lessonImages';
import { GlossSentence } from './Gloss';
import { speakChinese } from '../../utils/tts';
import { startRecording, stopAndTranscribe, calculateAccuracy } from '../../utils/speechRecognition';
import { DEEP_NAVY, WARM_ORANGE, SLATE_TEAL, WARM_BROWN, CARD_WHITE, SUCCESS } from '../../constants/colors';

const ART = 160;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// A `picture` field holds either an image key or a literal emoji, so a lesson
// can be written before its artwork is drawn. Whichever it is, this renders it.
//
// Tapping an image opens it full screen; tapping again puts it back. Several
// of these are wide strips — the 人 evolution runs 2808px — and at card width
// the detail is simply too small to read.
function Picture({ value, height, style, zoomable = true }) {
  const [zoomed, setZoomed] = useState(false);
  const { width: winW, height: winH } = useWindowDimensions();
  const asset = getLessonImage(value);

  if (!asset) return <Text style={[{ fontSize: height * 0.55 }, style]}>{value}</Text>;

  const img = (
    <Image
      source={asset}
      style={[{ width: '100%', height, borderRadius: 12 }, style]}
      resizeMode="contain"
    />
  );
  if (!zoomable) return img;

  return (
    <>
      <TouchableOpacity style={s.pictureTouch} onPress={() => setZoomed(true)} activeOpacity={0.9}>
        {img}
      </TouchableOpacity>

      <Modal visible={zoomed} transparent animationType="fade" onRequestClose={() => setZoomed(false)}>
        <TouchableOpacity style={s.zoomBackdrop} activeOpacity={1} onPress={() => setZoomed(false)}>
          <Image
            source={asset}
            style={{ width: winW, height: winH * 0.8 }}
            resizeMode="contain"
          />
          <Text style={s.zoomHint}>tap anywhere to close</Text>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

// Shown under any question once an answer has been picked.
function Feedback({ picked, correct, explain }) {
  if (picked == null) return null;
  const right = picked === correct;
  return (
    <View style={[s.feedback, right ? s.feedbackRight : s.feedbackWrong]}>
      <Text style={s.feedbackIcon}>{right ? '✓' : '✕'}</Text>
      <Text style={[s.feedbackText, right ? s.feedbackTextRight : s.feedbackTextWrong]}>
        {right ? (explain || 'Correct') : `Not quite — the answer is ${correct}`}
      </Text>
    </View>
  );
}

// A row of short answers. Used by every check in this half.
// `audioFor` decides what a tapped answer says. A radical shape is not a
// character — tapping 灬 or 氵 made the voice read it as something it is not —
// so a question can map each shape to its spoken name, and anything with no
// entry stays silent rather than saying the wrong thing.
function say(c, audioFor) {
  const a = audioFor ? audioFor(c) : { text: c };
  if (a) speakChinese(a.text, 'female', a.pinyin);
}

function Choices({ choices, correct, picked, onPick, big = false, labelFor, audioFor }) {
  return (
    <View style={s.choiceRow}>
      {choices.map(c => {
        const reveal = picked != null;
        return (
          <TouchableOpacity
            key={c}
            style={[
              s.choice,
              reveal && c === correct && s.choiceRight,
              reveal && picked === c && c !== correct && s.choiceWrong,
            ]}
            onPress={() => { say(c, audioFor); if (picked == null) onPick(c); }}
            activeOpacity={0.8}
          >
            <Text style={big ? s.choiceTextBig : s.choiceText}>
              {labelFor ? labelFor(c) : c}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// A question with more than one right answer: 火 is the fire radical beside a
// character and 灬 is the same radical beneath one, so both have to be picked.
// Selections toggle, and nothing is marked until Check is pressed.
function MultiChoices({ choices, correct, chosen, setChosen, checked, onCheck, big = false, audioFor }) {
  return (
    <>
      <View style={s.choiceRow}>
        {choices.map(c => {
          const sel = chosen.includes(c);
          const isRight = correct.includes(c);
          return (
            <TouchableOpacity
              key={c}
              style={[
                s.choice,
                sel && !checked && s.choiceChosen,
                checked && isRight && s.choiceRight,
                checked && sel && !isRight && s.choiceWrong,
              ]}
              onPress={() => {
                say(c, audioFor);
                if (checked) return;
                setChosen(sel ? chosen.filter(x => x !== c) : [...chosen, c]);
              }}
              activeOpacity={0.8}
            >
              <Text style={big ? s.choiceTextBig : s.choiceText}>{c}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {!checked && (
        <TouchableOpacity
          style={[s.stepBtn, !chosen.length && s.stepBtnOff]}
          disabled={!chosen.length}
          onPress={onCheck}
          activeOpacity={0.85}
        >
          <Text style={s.stepBtnText}>
            {chosen.length ? `Check ${chosen.length} picked →` : 'Pick every shape it takes'}
          </Text>
        </TouchableOpacity>
      )}
    </>
  );
}

// ── Part 1 · 独体字 ──────────────────────────────────────────────────────────
// Picture first, then the character writing itself, then what it means.
export function BlockCard({ item }) {
  const [picked, setPicked] = useState(null);
  return (
    <View style={s.card}>
      {getLessonImage(item.picture) ? (
        // The uploaded art already carries the picture → character story, so
        // it runs full width and the animation sits under it as the how-to.
        <>
          <View style={s.pictureWide}>
            <Picture value={item.picture} height={150} />
          </View>
          <View style={s.artStageCentred}>
            <StrokeAnimator char={item.character} size={ART - 40} loop colored />
          </View>
        </>
      ) : (
        <View style={s.transformRow}>
          <View style={s.pictureBox}><Picture value={item.picture} height={90} /></View>
          <Text style={s.arrow}>→</Text>
          <View style={s.artStage}>
            <StrokeAnimator char={item.character} size={ART - 40} loop colored />
          </View>
        </View>
      )}

      <TouchableOpacity
        style={s.titleRow}
        onPress={() => speakChinese(item.audio_text || item.character, 'female', item.pinyin)}
        activeOpacity={0.7}
      >
        <View style={{ flex: 1 }}>
          <Text style={s.bigName}>{item.character}</Text>
          <Text style={s.bigPinyin}>{item.pinyin}</Text>
        </View>
        <Text style={s.audioIcon}>🔊</Text>
      </TouchableOpacity>
      <Text style={s.meaningEn}>{item.meaning}</Text>
      {item.note ? <Text style={s.body}>{item.note}</Text> : null}

      {item.match && (
        <View style={{ gap: 10 }}>
          <Text style={s.q}>Which character is this?</Text>
          <View style={s.pictureBoxSmall}><Picture value={item.match.prompt_picture} height={58} /></View>
          <Choices choices={item.match.choices} correct={item.match.correct} picked={picked} onPick={setPicked} big />
          <Feedback picked={picked} correct={item.match.correct} />
        </View>
      )}
    </View>
  );
}

// The round-up at the end of Part 1: every picture against every character.
export function MatchCard({ item }) {
  const [picked, setPicked] = useState({});
  // Rows and answers both came out in data order, so row 1's answer was always
  // the first button and the card could be solved straight down the diagonal
  // without looking at a single picture. Both are shuffled once per mount —
  // once, not per render, or the buttons would move under the finger.
  const [rows] = useState(() => shuffle(item.pairs));
  const [answersFor] = useState(() => {
    const chars = item.pairs.map(p => p.character);
    return Object.fromEntries(item.pairs.map(p => [p.picture, shuffle(chars)]));
  });
  return (
    <View style={[s.card, s.cardAccent]}>
      <Text style={s.q}>{item.question}</Text>
      {rows.map(pair => {
        const got = picked[pair.picture];
        return (
          <View key={pair.picture} style={s.matchRow}>
            <View style={s.pictureBoxSmall}><Picture value={pair.picture} height={58} /></View>
            <View style={{ flex: 1 }}>
              <Choices
                choices={answersFor[pair.picture]}
                correct={pair.character}
                picked={got ?? null}
                onPick={(c) => setPicked(p => ({ ...p, [pair.picture]: c }))}
                big
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ── Part 2 · 部件与部首 ──────────────────────────────────────────────────────
// Revealed a step at a time: the radical, where it came from, the characters
// that carry it, a guess at what they share, and only then the answer.
// A radical does not always carry the same number of characters — Lesson 12's
// 木字旁 group has two where the others have three — so the button says how
// many this one actually has.
const COUNT_WORD = ['', 'one', 'two', 'three', 'four', 'five', 'six'];

export function ComponentCard({ item, radicalAudio }) {
  const [step, setStep] = useState(0);        // 0 shape · 1 characters · 2 find · 3 reveal
  const [found, setFound] = useState(null);
  // A find question may have several right answers; those are gathered before
  // being checked, rather than scored on the first tap.
  const multi = Array.isArray(item.find?.correct);
  const [chosen, setChosen] = useState([]);
  const [checked, setChecked] = useState(false);
  // Answers that are radical shapes speak the radical's name; fragments like
  // 执 or 干 are not words and stay silent.
  const findAudio = (c) => (radicalAudio || {})[c] || null;
  const allRight = multi && checked
    && chosen.length === item.find.correct.length
    && chosen.every(c => item.find.correct.includes(c));

  return (
    <View style={s.card}>
      {/* 人 → 亻 */}
      <View style={s.transformRow}>
        <View style={s.artStage}>
          <StrokeAnimator char={item.from.character} size={ART - 40} loop colored />
        </View>
        <Text style={s.arrow}>→</Text>
        <View style={s.radicalBox}><Text style={s.radicalGlyph}>{item.radical}</Text></View>
      </View>

      <TouchableOpacity
        style={s.titleRow}
        onPress={() => speakChinese(item.audio_text || item.name, 'female', item.pinyin)}
        activeOpacity={0.7}
      >
        <View style={{ flex: 1 }}>
          <Text style={s.bigName}>{item.name}</Text>
          <Text style={s.bigPinyin}>{item.pinyin}</Text>
        </View>
        <Text style={s.audioIcon}>🔊</Text>
      </TouchableOpacity>
      <Text style={s.meaningEn}>{item.name_en}</Text>
      {item.hint ? <Text style={s.body}>{item.hint}</Text> : null}

      {step === 0 && (
        <TouchableOpacity style={s.stepBtn} onPress={() => setStep(1)} activeOpacity={0.85}>
          <Text style={s.stepBtnText}>
            {item.characters.length === 1
              ? 'Find it inside this character →'
              : `Find it inside ${COUNT_WORD[item.characters.length] || item.characters.length} characters →`}
          </Text>
        </TouchableOpacity>
      )}

      {step >= 1 && (
        <View style={s.carryRow}>
          {item.characters.map(c => (
            <TouchableOpacity
              key={c.character}
              style={s.carryChip}
              onPress={() => speakChinese(c.audio_text || c.character, 'female', c.pinyin)}
              activeOpacity={0.8}
            >
              <Text style={s.carryCn}>{c.character}</Text>
              <Text style={s.carryPy}>{c.pinyin}</Text>
              <Text style={s.carryEn}>{c.meaning}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {step === 1 && (
        <TouchableOpacity style={s.stepBtn} onPress={() => setStep(2)} activeOpacity={0.85}>
          <Text style={s.stepBtnText}>Next →</Text>
        </TouchableOpacity>
      )}

      {step >= 2 && item.find && (
        <View style={{ gap: 10 }}>
          <Text style={s.q}>{item.find.question}</Text>
          {multi ? (
            <>
              <MultiChoices
                choices={item.find.choices}
                correct={item.find.correct}
                chosen={chosen}
                setChosen={setChosen}
                checked={checked}
                onCheck={() => { setChecked(true); setStep(3); }}
                audioFor={findAudio}
                big
              />
              {checked && (
                <View style={[s.feedback, allRight ? s.feedbackRight : s.feedbackWrong]}>
                  <Text style={s.feedbackIcon}>{allRight ? '✓' : '✕'}</Text>
                  <Text style={[s.feedbackText, allRight ? s.feedbackTextRight : s.feedbackTextWrong]}>
                    {allRight
                      ? `Both — ${item.find.correct.join(' and ')}`
                      : `Not quite — it is ${item.find.correct.join(' and ')}, both of them`}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <>
              <Choices
                choices={item.find.choices}
                correct={item.find.correct}
                picked={found}
                onPick={(c) => { setFound(c); setStep(3); }}
                audioFor={findAudio}
                big
              />
              <Feedback picked={found} correct={item.find.correct} />
            </>
          )}
        </View>
      )}

      {step >= 3 && item.reveal && (
        <View style={s.revealBox}>
          <Text style={s.revealLabel}>What they share</Text>
          <Text style={s.revealCategory}>{item.reveal.category}</Text>
          <Text style={s.body}>{item.reveal.note}</Text>
        </View>
      )}
    </View>
  );
}

// Listen, then say it back. Same engine as the speaking exercises in the
// Chinese Journey lessons — startRecording / stopAndTranscribe / accuracy —
// in a card-sized shell rather than a full exercise screen.
export function ReadAloud({ item }) {
  const [phase, setPhase] = useState('idle');   // idle · recording · processing · result
  const [accuracy, setAccuracy] = useState(null);
  const recordingRef = useRef(null);

  const target = item.text;

  const begin = async () => {
    try {
      recordingRef.current = await startRecording();
      setPhase('recording');
    } catch (e) {
      console.log('[ReadAloud] could not start recording:', e?.message);
      setPhase('idle');
    }
  };

  const finish = async () => {
    setPhase('processing');
    try {
      const transcript = await stopAndTranscribe(recordingRef.current, target);
      recordingRef.current = null;
      setAccuracy(calculateAccuracy(transcript, target));
    } catch (e) {
      console.log('[ReadAloud] transcription failed:', e?.message);
      setAccuracy(0);
    }
    setPhase('result');
  };

  const retry = () => { setAccuracy(null); setPhase('idle'); };
  const good = accuracy != null && accuracy >= 50;

  return (
    <View style={s.readBox}>
      <Text style={s.stepLabel}>Read it aloud</Text>
      {item.intro ? <Text style={s.body}>{item.intro}</Text> : null}

      <TouchableOpacity
        style={s.readTarget}
        onPress={() => speakChinese(item.audio_text || target, 'female', item.pinyin)}
        activeOpacity={0.8}
      >
        <View style={{ flex: 1 }}>
          <Text style={s.readCn}>{target}</Text>
          <Text style={s.readPy}>{item.pinyin}</Text>
          <Text style={s.readEn}>{item.meaning}</Text>
        </View>
        <Text style={s.audioIcon}>🔊</Text>
      </TouchableOpacity>

      {phase === 'idle' && (
        <TouchableOpacity style={s.recBtn} onPress={begin} activeOpacity={0.85}>
          <Text style={s.recBtnText}>🎤  Record</Text>
        </TouchableOpacity>
      )}
      {phase === 'recording' && (
        <TouchableOpacity style={[s.recBtn, s.recBtnLive]} onPress={finish} activeOpacity={0.85}>
          <Text style={s.recBtnText}>⏹  Stop</Text>
        </TouchableOpacity>
      )}
      {phase === 'processing' && (
        <View style={s.recBusy}>
          <ActivityIndicator color={WARM_BROWN} />
          <Text style={s.body}>Listening…</Text>
        </View>
      )}
      {phase === 'result' && (
        <>
          <View style={[s.feedback, good ? s.feedbackRight : s.feedbackWrong]}>
            <Text style={s.feedbackIcon}>{good ? '✓' : '🎤'}</Text>
            <Text style={[s.feedbackText, good ? s.feedbackTextRight : s.feedbackTextWrong]}>
              {accuracy >= 90 ? `Excellent — ${accuracy}%`
                : accuracy >= 50 ? `Good — ${accuracy}%`
                : "Couldn't quite catch that"}
            </Text>
          </View>
          <TouchableOpacity onPress={retry} activeOpacity={0.7}>
            <Text style={s.again}>↻ try again</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

// One of the single characters Part 3 introduces before the words.
export function CharacterIntroCard({ item }) {
  return (
    <TouchableOpacity
      style={s.charIntro}
      onPress={() => speakChinese(item.audio_text || item.character, 'female', item.pinyin)}
      activeOpacity={0.8}
    >
      <StrokeAnimator char={item.character} size={64} loop colored />
      <View style={{ flex: 1 }}>
        <Text style={s.charIntroCn}>{item.character}</Text>
        <Text style={s.charIntroPy}>{item.pinyin}</Text>
        <Text style={s.charIntroEn}>{item.meaning}</Text>
      </View>
      <Text style={s.audioIconSm}>🔊</Text>
    </TouchableOpacity>
  );
}

// ── Part 3 · 使用 ───────────────────────────────────────────────────────────
export function WordCard({ item }) {
  return (
    <TouchableOpacity
      style={s.wordRow}
      onPress={() => speakChinese(item.audio_text || item.word, 'female', item.pinyin)}
      activeOpacity={0.8}
    >
      <View style={{ flex: 1 }}>
        <Text style={s.wordCn}>{item.word}</Text>
        <Text style={s.wordPy}>{item.pinyin}</Text>
        <Text style={s.wordEn}>{item.meaning}</Text>
      </View>
      {item.built_from ? <Text style={s.wordBuilt}>{item.built_from}</Text> : null}
      <Text style={s.audioIcon}>🔊</Text>
    </TouchableOpacity>
  );
}

// Listen → Understand → Speak, the three steps each dialogue runs through.
export function DialogueCard({ item }) {
  const [tiles, setTiles] = useState([]);
  // The data lists the tiles in the order they belong, so showing them as-is
  // makes the answer "left to right". Shuffled once, not on every render.
  const [offered] = useState(() => shuffle(item.speak?.tiles || []));

  const speak = item.speak;
  const built = tiles.join('');
  const wanted = (speak?.answer || []).join('');
  const done = speak ? tiles.length >= speak.answer.length : false;
  const right = done && built === wanted;

  return (
    <View style={s.card}>
      {/* Most dialogues carry one picture. One that contrasts two things —
          这是汗水 / 那是泪水 — carries two, shown side by side under the word
          that points at each. */}
      {(item.pictures || []).length ? (
        <View style={s.picturePair}>
          {item.pictures.map((p, i) => (
            <View key={i} style={s.picturePairCell}>
              <View style={s.pictureWide}><Picture value={p.picture} height={130} /></View>
              {p.label ? <Text style={s.picturePairLabel}>{p.label}</Text> : null}
              {p.caption ? <Text style={s.picturePairCaption}>{p.caption}</Text> : null}
            </View>
          ))}
        </View>
      ) : getLessonImage(item.picture) ? (
        <View style={s.pictureWide}><Picture value={item.picture} height={170} /></View>
      ) : null}

      <View style={s.dialogueHead}>
        {(item.pictures || []).length || getLessonImage(item.picture)
          ? null : <Text style={s.dialoguePic}>{item.picture}</Text>}
        <View style={{ flex: 1 }}>
          <Text style={s.dialogueTitle}>{item.title}</Text>
          <Text style={s.dialogueGoal}>{item.goal}</Text>
        </View>
      </View>

      {/* 1 · Listen */}
      {item.lines.map((l, i) => (
        <TouchableOpacity
          key={`${l.text}-${i}`}
          style={[s.lineRow, l.speaker === 'A' ? s.lineA : s.lineB]}
          onPress={() => speakChinese(l.audio_text || l.text, 'female', l.pinyin)}
          activeOpacity={0.8}
        >
          <Text style={s.lineSpeaker}>{l.speaker}</Text>
          <View style={{ flex: 1 }}>
            {/* The line already shows what the whole sentence means; the
                underline is for looking up one word inside it. Nested Text
                presses win over the row's own tap, so the audio still works
                everywhere else on the row. */}
            <GlossSentence text={l.text} style={s.lineCn} />
            <Text style={s.linePy}>{l.pinyin}</Text>
            <Text style={s.lineEn}>{l.meaning}</Text>
          </View>
          <Text style={s.audioIconSm}>🔊</Text>
        </TouchableOpacity>
      ))}

      {/* 2 · Read it back */}
      {item.read && <ReadAloud item={item.read} />}

      {/* 3 · Speak — put the words in order */}
      {speak && (
        <View style={s.speakBox}>
          <Text style={s.q}>{speak.question}</Text>
          {/* A filled slot gives the word back when tapped — a mis-tap used to
              be unrecoverable until all the slots were full. */}
          <View style={s.slotRow}>
            {speak.answer.map((_, i) => (
              <TouchableOpacity
                key={i}
                style={[s.slot, tiles[i] && s.slotFilled,
                  done && (tiles[i] === speak.answer[i] ? s.slotRight : s.slotWrong)]}
                onPress={() => { if (!done && tiles[i]) setTiles(t => t.filter((_, j) => j !== i)); }}
                activeOpacity={!done && tiles[i] ? 0.6 : 1}
              >
                <Text style={[s.slotText, done && tiles[i] && s.slotTextLit]}>
                  {tiles[i] || '?'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {!done && tiles.length > 0 && (
            <Text style={s.undoHint}>tap a word to take it back</Text>
          )}
          <View style={s.choiceRow}>
            {offered.map(t => (
              <TouchableOpacity
                key={t}
                style={[s.tile, tiles.includes(t) && s.tileUsed]}
                onPress={() => { if (!tiles.includes(t) && !done) { speakChinese(t); setTiles([...tiles, t]); } }}
                activeOpacity={0.8}
              >
                <Text style={s.tileText}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {done && (
            <>
              <View style={[s.feedback, right ? s.feedbackRight : s.feedbackWrong]}>
                <Text style={s.feedbackIcon}>{right ? '✓' : '✕'}</Text>
                <Text style={[s.feedbackText, right ? s.feedbackTextRight : s.feedbackTextWrong]}>
                  {right ? `${speak.result}  ${speak.pinyin}` : `Not quite — ${speak.result}`}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setTiles([])} activeOpacity={0.7}>
                <Text style={s.again}>↻ try again</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
}

// ── Part 5 · 汉字探秘 ───────────────────────────────────────────────────────
export function CultureCard({ item }) {
  const [answers, setAnswers] = useState({});
  // Step numbers come from the blocks this lesson actually carries. Lesson 11
  // has listen/notice/discover/try and still reads 1-4; Lesson 12 adds the
  // five-phase cycle and the seasons and reads 1-6, with no hard-coded digits.
  const order = ['listen', 'notice', 'discover', 'cycle', 'seasons', 'try']
    .filter(k => item[k]);
  const no = (k) => order.indexOf(k) + 1;
  // 五行 reads far faster as a picture than as a glyph, so each element can
  // carry an emoji. Lessons without the map simply show the character alone.
  const emo = (c) => (item.emoji || {})[c] || null;
  return (
    <View style={[s.card, s.cardAccent]}>
      <Text style={s.topicCn}>{item.topic}</Text>
      <Text style={s.topicEn}>{item.topic_en}</Text>
      {getLessonImage(item.picture) ? (
        <View style={s.pictureWide}><Picture value={item.picture} height={170} /></View>
      ) : null}

      {item.listen && (
        <View style={{ gap: 8 }}>
          <Text style={s.stepLabel}>{no('listen')} · Listen</Text>
          {item.listen.intro ? <Text style={s.body}>{item.listen.intro}</Text> : null}
          <View style={s.listenRow}>
            {item.listen.items.map(x => (
              <TouchableOpacity
                key={x.character}
                style={s.listenChip}
                onPress={() => speakChinese(x.audio_text || x.character, 'female', x.pinyin)}
                activeOpacity={0.8}
              >
                <Text style={s.listenCn}>{x.character}</Text>
                <Text style={s.listenPy}>{x.pinyin}</Text>
                <Text style={s.listenEn}>{x.meaning}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {item.notice ? (
        <View style={{ gap: 4 }}>
          <Text style={s.stepLabel}>{no('notice')} · Notice</Text>
          <Text style={s.body}>{item.notice}</Text>
        </View>
      ) : null}

      {item.discover ? (
        <View style={{ gap: 4 }}>
          <Text style={s.stepLabel}>{no('discover')} · Discover</Text>
          <Text style={s.body}>{item.discover}</Text>
        </View>
      ) : null}

      {item.cycle && (
        <View style={{ gap: 10 }}>
          <Text style={s.stepLabel}>{no('cycle')} · {item.cycle.title}</Text>
          {item.cycle.intro ? <Text style={s.body}>{item.cycle.intro}</Text> : null}
          {getLessonImage(item.cycle.picture) ? (
            <View style={s.pictureWide}><Picture value={item.cycle.picture} height={300} /></View>
          ) : null}
          {/* Each step is its own tappable line: 木 → 火, and what that means. */}
          {item.cycle.steps.map((st, i) => (
            <TouchableOpacity
              key={i}
              style={s.cycleRow}
              onPress={() => speakChinese(st.audio_text, 'female', st.pinyin)}
              activeOpacity={0.8}
            >
              <View style={s.cycleCell}>
                {emo(st.from) ? <Text style={s.cycleEmoji}>{emo(st.from)}</Text> : null}
                <Text style={s.cycleGlyph}>{st.from}</Text>
              </View>
              <Text style={s.cycleArrow}>→</Text>
              <View style={s.cycleCell}>
                {emo(st.to) ? <Text style={s.cycleEmoji}>{emo(st.to)}</Text> : null}
                <Text style={s.cycleGlyph}>{st.to}</Text>
              </View>
              <Text style={s.cycleText}>{st.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {item.seasons && (
        <View style={{ gap: 8 }}>
          <Text style={s.stepLabel}>{no('seasons')} · {item.seasons.title}</Text>
          {item.seasons.intro ? <Text style={s.body}>{item.seasons.intro}</Text> : null}
          {item.seasons.items.map((x, i) => (
            <TouchableOpacity
              key={i}
              style={s.seasonRow}
              onPress={() => speakChinese(x.character, 'female', x.pinyin)}
              activeOpacity={0.8}
            >
              {emo(x.character) ? <Text style={s.seasonEmoji}>{emo(x.character)}</Text> : null}
              <Text style={s.seasonGlyph}>{x.character}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.seasonLabel}>{x.label}</Text>
                <Text style={s.seasonNote}>{x.note}</Text>
              </View>
            </TouchableOpacity>
          ))}
          {item.seasons.caveat ? <Text style={s.caveat}>{item.seasons.caveat}</Text> : null}
        </View>
      )}

      {item.try && (
        <View style={{ gap: 10 }}>
          <Text style={s.stepLabel}>{no('try')} · Try it</Text>
          {item.try.intro ? <Text style={s.body}>{item.try.intro}</Text> : null}
          {item.try.items.map((x, i) => (
            <View key={i} style={s.tryBox}>
              <Text style={s.tryCn}>{x.sentence}</Text>
              <Text style={s.tryPy}>{x.pinyin}</Text>
              <Text style={s.tryEn}>{x.meaning}</Text>
              <Choices
                choices={x.choices}
                correct={x.correct}
                picked={answers[i] ?? null}
                onPick={(c) => setAnswers(a => ({ ...a, [i]: c }))}
                labelFor={(c) => (emo(c) ? `${emo(c)} ${c}` : c)}
                big
              />
              <Feedback picked={answers[i] ?? null} correct={x.correct} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: CARD_WHITE, borderRadius: 14, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(155,104,70,0.18)', gap: 10,
  },
  cardAccent: { borderColor: WARM_ORANGE, borderWidth: 1.5 },

  // picture → character
  transformRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  arrow: { fontSize: 24, fontWeight: '900', color: SLATE_TEAL },
  pictureBox: {
    width: ART - 40, height: ART - 40, borderRadius: 14, backgroundColor: '#FFF3E0',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(155,104,70,0.2)',
  },
  pictureGlyph: { fontSize: 64 },
  pictureBoxSmall: {
    width: 68, height: 68, borderRadius: 12, backgroundColor: '#FFF3E0',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(155,104,70,0.2)',
  },
  pictureGlyphSmall: { fontSize: 34 },
  zoomBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center', justifyContent: 'center',
  },
  zoomHint: {
    position: 'absolute', bottom: 40,
    color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600',
  },

  // The zoom wrapper has to carry a width of its own: the image inside it is
  // width:'100%', and in a box that centres its children (pictureBoxSmall) an
  // auto-width wrapper gives that percentage nothing to resolve against, so the
  // image collapses to zero width and the question looks empty.
  pictureTouch: { alignSelf: 'stretch', width: '100%' },

  // Uploaded artwork runs the width of the card.
  pictureWide: {
    alignSelf: 'stretch', borderRadius: 12, overflow: 'hidden',
    backgroundColor: '#FFF8ED', padding: 6,
    borderWidth: 1, borderColor: 'rgba(155,104,70,0.15)',
  },
  artStageCentred: { alignSelf: 'center' },
  artStage: {
    width: ART - 40, height: ART - 40, borderRadius: 14, backgroundColor: '#FFF8ED',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(155,104,70,0.15)',
  },
  radicalBox: {
    width: ART - 40, height: ART - 40, borderRadius: 14, backgroundColor: '#FFF3E0',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: WARM_ORANGE,
  },
  radicalGlyph: { fontSize: 64, fontWeight: '900', color: WARM_BROWN },

  titleRow:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bigName:   { fontSize: 30, fontWeight: '900', color: DEEP_NAVY },
  bigPinyin: { fontSize: 16, fontWeight: '700', color: WARM_BROWN, marginTop: 1 },
  meaningEn: { fontSize: 16, fontWeight: '700', color: WARM_ORANGE },
  body:      { fontSize: 15, color: SLATE_TEAL, lineHeight: 21 },
  q:         { fontSize: 16, fontWeight: '800', color: DEEP_NAVY },
  audioIcon:   { fontSize: 24 },
  audioIconSm: { fontSize: 18 },

  matchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  // answers
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  choice: {
    minWidth: 70, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1.5, borderColor: 'rgba(155,104,70,0.30)', backgroundColor: CARD_WHITE,
    alignItems: 'center',
  },
  choiceText:    { fontSize: 18, fontWeight: '800', color: DEEP_NAVY, textAlign: 'center' },
  choiceTextBig: { fontSize: 28, lineHeight: 36, fontWeight: '900', color: DEEP_NAVY },
  choiceRight:   { backgroundColor: 'rgba(46,125,50,0.18)', borderColor: SUCCESS, borderWidth: 2.5 },
  choiceWrong:   { backgroundColor: 'rgba(196,80,58,0.15)', borderColor: '#C4503A', borderWidth: 2.5 },

  feedback: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, padding: 10 },
  feedbackRight:     { backgroundColor: 'rgba(46,125,50,0.12)' },
  feedbackWrong:     { backgroundColor: 'rgba(196,80,58,0.10)' },
  feedbackIcon:      { fontSize: 16, fontWeight: '900' },
  feedbackText:      { flex: 1, fontSize: 15, fontWeight: '700' },
  feedbackTextRight: { color: '#2E7D32' },
  feedbackTextWrong: { color: '#C4503A' },

  stepBtn: {
    alignSelf: 'center', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20,
    backgroundColor: WARM_BROWN,
  },
  stepBtnText: { fontSize: 15, fontWeight: '800', color: CARD_WHITE },
  stepBtnOff:  { opacity: 0.45 },
  choiceChosen: { borderColor: WARM_ORANGE, borderWidth: 2.5, backgroundColor: '#FFF3E0' },

  carryRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  carryChip: {
    flexGrow: 1, alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 12, backgroundColor: '#FFF8ED',
    borderWidth: 1, borderColor: 'rgba(155,104,70,0.22)',
  },
  carryCn: { fontSize: 30, fontWeight: '900', color: DEEP_NAVY },
  carryPy: { fontSize: 13, color: WARM_BROWN },
  carryEn: { fontSize: 12, fontWeight: '700', color: WARM_ORANGE },

  revealBox: {
    backgroundColor: 'rgba(46,125,50,0.08)', borderRadius: 12, padding: 12, gap: 4,
    borderLeftWidth: 4, borderLeftColor: SUCCESS,
  },
  revealLabel:    { fontSize: 11, fontWeight: '800', color: SLATE_TEAL, letterSpacing: 0.5, textTransform: 'uppercase' },
  revealCategory: { fontSize: 18, fontWeight: '900', color: DEEP_NAVY },

  // words
  wordRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: CARD_WHITE, borderRadius: 12, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(155,104,70,0.18)',
  },
  wordCn:    { fontSize: 24, fontWeight: '900', color: DEEP_NAVY },
  wordPy:    { fontSize: 14, color: WARM_BROWN },
  wordEn:    { fontSize: 14, fontWeight: '700', color: WARM_ORANGE },
  wordBuilt: { fontSize: 13, color: SLATE_TEAL },

  // dialogue
  dialogueHead:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dialoguePic:   { fontSize: 40 },
  dialogueTitle: { fontSize: 18, fontWeight: '900', color: DEEP_NAVY },
  dialogueGoal:  { fontSize: 14, color: WARM_BROWN },
  lineRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 12, padding: 11,
  },
  lineA: { backgroundColor: '#FFF3E0' },
  lineB: { backgroundColor: 'rgba(46,125,50,0.08)' },
  lineSpeaker: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: WARM_BROWN, color: CARD_WHITE,
    textAlign: 'center', lineHeight: 24, fontSize: 12, fontWeight: '900', overflow: 'hidden',
  },
  lineCn: { fontSize: 20, fontWeight: '800', color: DEEP_NAVY },
  linePy: { fontSize: 13, color: WARM_BROWN },
  lineEn: { fontSize: 13, color: SLATE_TEAL },

  speakBox: { gap: 10, backgroundColor: '#FFF8ED', borderRadius: 12, padding: 12 },
  slotRow:  { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 6 },
  slot: {
    minWidth: 56, height: 50, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(155,104,70,0.35)',
    backgroundColor: CARD_WHITE,
  },
  slotFilled: { borderStyle: 'solid', borderColor: WARM_ORANGE },
  slotRight:  { backgroundColor: 'rgba(46,125,50,0.7)', borderColor: SUCCESS },
  slotWrong:  { backgroundColor: 'rgba(196,80,58,0.7)', borderColor: '#C4503A' },
  slotText:    { fontSize: 22, fontWeight: '900', color: DEEP_NAVY },
  slotTextLit: { color: CARD_WHITE },
  tile: {
    minWidth: 56, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
    backgroundColor: CARD_WHITE, borderWidth: 1.5, borderColor: 'rgba(155,104,70,0.3)',
    alignItems: 'center',
  },
  tileUsed: { opacity: 0.35 },
  tileText: { fontSize: 22, fontWeight: '900', color: DEEP_NAVY },
  again:    { fontSize: 14, fontWeight: '700', color: WARM_BROWN, textAlign: 'center' },

  // culture
  topicCn:   { fontSize: 22, fontWeight: '900', color: DEEP_NAVY },
  topicEn:   { fontSize: 15, color: SLATE_TEAL },
  stepLabel: { fontSize: 12, fontWeight: '800', color: WARM_BROWN, letterSpacing: 0.5, textTransform: 'uppercase' },
  // Lesson 11 shows three of these and Lesson 12 shows five, so the row wraps
  // rather than squeezing five 36pt glyphs into one line. At minWidth 92 three
  // still sit on one row, which leaves Lesson 11 looking exactly as it did.
  listenRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  listenChip: {
    flex: 1, minWidth: 92, alignItems: 'center', paddingVertical: 12, borderRadius: 12,
    backgroundColor: '#FFF8ED', borderWidth: 1, borderColor: 'rgba(155,104,70,0.22)',
  },

  undoHint: { fontSize: 12, color: WARM_BROWN, textAlign: 'center', marginTop: -4 },

  picturePair:        { flexDirection: 'row', gap: 10 },
  picturePairCell:    { flex: 1, gap: 4 },
  picturePairLabel:   { fontSize: 20, fontWeight: '900', color: DEEP_NAVY, textAlign: 'center' },
  picturePairCaption: { fontSize: 13, fontWeight: '700', color: WARM_BROWN, textAlign: 'center' },

  // 五行 · one line per step of the generative cycle.
  cycleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFF8ED', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(155,104,70,0.18)',
  },
  cycleCell:  { alignItems: 'center', width: 34 },
  cycleEmoji: { fontSize: 18 },
  cycleGlyph: { fontSize: 24, fontWeight: '900', color: DEEP_NAVY },
  cycleArrow: { fontSize: 16, color: WARM_BROWN },
  cycleText:  { flex: 1, fontSize: 14, color: SLATE_TEAL, lineHeight: 19 },

  seasonRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(155,104,70,0.18)',
  },
  seasonEmoji: { fontSize: 22 },
  seasonGlyph: { fontSize: 28, fontWeight: '900', color: DEEP_NAVY, width: 36, textAlign: 'center' },
  seasonLabel: { fontSize: 15, fontWeight: '800', color: DEEP_NAVY },
  seasonNote:  { fontSize: 13, color: SLATE_TEAL },
  caveat:      { fontSize: 13, fontStyle: 'italic', color: WARM_BROWN, lineHeight: 18 },
  listenCn: { fontSize: 36, fontWeight: '900', color: DEEP_NAVY },
  listenPy: { fontSize: 15, fontWeight: '700', color: WARM_BROWN },
  listenEn: { fontSize: 13, fontWeight: '700', color: WARM_ORANGE },

  tryBox: {
    gap: 8, backgroundColor: '#FFF8ED', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: 'rgba(155,104,70,0.18)',
  },
  // read-and-record
  readBox: { gap: 10, backgroundColor: '#FFF3E0', borderRadius: 12, padding: 12 },
  readTarget: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: CARD_WHITE, borderRadius: 10, padding: 11,
    borderWidth: 1, borderColor: 'rgba(155,104,70,0.2)',
  },
  readCn: { fontSize: 22, fontWeight: '900', color: DEEP_NAVY },
  readPy: { fontSize: 13, color: WARM_BROWN },
  readEn: { fontSize: 13, color: SLATE_TEAL },
  recBtn: {
    alignSelf: 'center', paddingHorizontal: 24, paddingVertical: 11, borderRadius: 22,
    backgroundColor: WARM_BROWN,
  },
  recBtnLive:  { backgroundColor: '#C4503A' },
  recBtnText:  { fontSize: 16, fontWeight: '800', color: CARD_WHITE },
  recBusy:     { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center' },

  // the single characters Part 3 introduces first
  charIntro: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: CARD_WHITE, borderRadius: 12, padding: 10, marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(155,104,70,0.18)',
  },
  charIntroCn: { fontSize: 26, fontWeight: '900', color: DEEP_NAVY },
  charIntroPy: { fontSize: 13, color: WARM_BROWN },
  charIntroEn: { fontSize: 13, fontWeight: '700', color: WARM_ORANGE },

  tryCn: { fontSize: 20, fontWeight: '800', color: DEEP_NAVY, lineHeight: 28 },
  tryPy: { fontSize: 13, color: WARM_BROWN },
  tryEn: { fontSize: 13, color: SLATE_TEAL },
});
