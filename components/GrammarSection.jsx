import React, { useState, useRef, useEffect, useCallback } from 'react';
import { generateGrammarMiniExercises } from '../utils/exerciseGenerator';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEEP_NAVY,
  WARM_ORANGE,
  SLATE_TEAL,
  WARM_BROWN,
  CARD_WHITE,
  SUCCESS,
  ERROR,
} from '../constants/colors';

// ─────────────────────────────────────────────────────────────────────────────
// parseGrammarForDisplay
// Parses a grammar point into { usage, usageParts, structure } for display.
// Extracts "Formula: ..." / "Structure: ..." lines into structure field.
// Strips inline "E.g." / "Example:" lines (we use the structured examples[] array).
// For pattern-format points (HSK6) the pattern field itself is the structure.
// ─────────────────────────────────────────────────────────────────────────────

function parseGrammarForDisplay(point) {
  const text = point.explanation || '';

  if (point.pattern) {
    const parts = text.split(/\. |。/).map(s => s.replace(/\.$/, '').trim()).filter(Boolean);
    return { usage: text, usageParts: parts, structure: point.pattern };
  }

  const EG = '\x01';
  const parts = text
    .replace(/E\.g\. /g, EG + ' ')
    .split(/\. |。/)
    .map(s => s.replace(new RegExp(EG + ' ', 'g'), 'E.g. ').replace(/\.$/, '').trim())
    .filter(Boolean);

  const usageParts = [];
  const structureParts = [];

  for (const part of parts) {
    if (/^(formula|structure):/i.test(part)) {
      structureParts.push(part.replace(/^(formula|structure):\s*/i, ''));
    } else if (/^(e\.g\.|example:|another example:|note:)/i.test(part)) {
      // skip — use structured examples[] instead
    } else {
      usageParts.push(part);
    }
  }

  return {
    usage: usageParts.join('. '),
    usageParts,
    structure: structureParts.join(' | '),
  };
}

function isChineseStart(s) {
  const c = (s || '').charCodeAt(0);
  return (c >= 0x4e00 && c <= 0x9fff) || (c >= 0x3400 && c <= 0x4dbf);
}

// ─────────────────────────────────────────────────────────────────────────────
// buildDisplayPoints
// Groups usageParts into intro + max 3 numbered points.
// Consecutive same-type (CJK-start vs Latin-start) sentences are merged.
// ─────────────────────────────────────────────────────────────────────────────

function buildDisplayPoints(usageParts) {
  if (usageParts.length <= 1) return { intro: usageParts[0] || '', points: [] };
  const intro = usageParts[0];
  const tail = usageParts.slice(1);
  const groups = [];
  let cur = [tail[0]];
  let curType = isChineseStart(tail[0]);
  for (let i = 1; i < tail.length; i++) {
    const t = isChineseStart(tail[i]);
    if (groups.length >= 3) {
      cur.push(tail[i]);
    } else if (t === curType) {
      cur.push(tail[i]);
    } else {
      groups.push(cur);
      cur = [tail[i]];
      curType = t;
    }
  }
  groups.push(cur);
  return { intro, points: groups };
}

// ─────────────────────────────────────────────────────────────────────────────
// Default export: GrammarSection
// Activates sequential flow when any grammar point has mini_exercises.
// Falls back to accordion otherwise.
// ─────────────────────────────────────────────────────────────────────────────

export default function GrammarSection({ grammarPoints, allDone, onAllDone, lessonId, levelId }) {
  const rawPoints = grammarPoints || [];

  // Augment grammar points with generated exercises once per mount, for
  // points that have no JSON-level mini_exercises (lessons 2-15 and others).
  const augRef = useRef(null);
  if (!augRef.current) {
    augRef.current = rawPoints.map(p =>
      (p.mini_exercises || []).length > 0
        ? p
        : { ...p, mini_exercises: generateGrammarMiniExercises(p) }
    );
  }
  const points = augRef.current;

  const hasExercises = points.some(p => (p.mini_exercises || []).length > 0);

  if (hasExercises) {
    return (
      <GrammarSequential
        grammarPoints={points}
        initialDone={!!allDone}
        lessonId={lessonId}
        levelId={levelId}
        onAllDone={onAllDone}
      />
    );
  }

  return <GrammarAccordion grammarPoints={points} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// GrammarSequential — slide-left sequential grammar flow (3 steps per point)
// Step 0: Grammar Card  Step 1: MCQ  Step 2: Fill-in-the-blank
// ─────────────────────────────────────────────────────────────────────────────

function getNextGrammarStep(currentStep, point) {
  const exs    = point.mini_exercises || [];
  const hasMCQ = exs.some(e => e.type === 'multiple_choice');
  const hasFB  = exs.some(e => e.type === 'fill_blank');
  if (currentStep === 0) {
    if (hasMCQ) return 1;
    if (hasFB)  return 2;
    return -1;
  }
  if (currentStep === 1) {
    if (hasFB) return 2;
    return -1;
  }
  return -1;
}

function GrammarSequential({ grammarPoints, initialDone, lessonId, levelId, onAllDone }) {
  const isPersisted = !!lessonId;
  const storageKey  = `grammarProgress_${levelId}_lesson_${lessonId}`;

  const [gramIdx, setGramIdx] = useState(0);
  const [step,    setStep]    = useState(0);
  const [done,    setDone]    = useState(!!initialDone);
  // null = loading; { completedCount } = show prompt; undefined = no prompt
  const [resumePrompt, setResumePrompt] = useState(
    initialDone ? undefined : (isPersisted ? null : undefined)
  );

  // Load saved grammar progress on mount (skip if already done)
  useEffect(() => {
    if (!isPersisted || initialDone) return;
    AsyncStorage.getItem(storageKey).then(val => {
      if (val !== null) {
        const completedCount = parseInt(val, 10);
        if (!isNaN(completedCount) && completedCount > 0 && completedCount < grammarPoints.length) {
          setResumePrompt({ completedCount });
          return;
        }
      }
      setResumePrompt(undefined);
    }).catch(() => setResumePrompt(undefined));
  }, []);

  const saveProgress = useCallback((completedCount) => {
    if (!isPersisted) return;
    AsyncStorage.setItem(storageKey, String(completedCount)).catch(() => {});
  }, [storageKey, isPersisted]);

  const handleAdvance = useCallback(() => {
    const point    = grammarPoints[gramIdx];
    const nextStep = getNextGrammarStep(step, point);
    if (nextStep === -1) {
      const nextIdx = gramIdx + 1;
      saveProgress(nextIdx);
      if (nextIdx >= grammarPoints.length) {
        if (isPersisted) AsyncStorage.removeItem(storageKey).catch(() => {});
        setDone(true);
        if (onAllDone) onAllDone();
      } else {
        setGramIdx(nextIdx);
        setStep(0);
      }
    } else {
      setStep(nextStep);
    }
  }, [gramIdx, step, grammarPoints, onAllDone, saveProgress, isPersisted, storageKey]);

  // Go back to step 0 of previous point (or step 0 of current if mid-point)
  const handleBack = useCallback(() => {
    if (step > 0) {
      setStep(0);
    } else if (gramIdx > 0) {
      setGramIdx(gramIdx - 1);
      setStep(0);
    }
  }, [gramIdx, step]);

  const totalPoints    = grammarPoints.length;
  const completedCount = done ? totalPoints : gramIdx;
  const point          = grammarPoints[gramIdx];
  const stepLabel      = step === 0 ? 'Grammar' : step === 1 ? 'Multiple Choice' : 'Fill in the Blank';
  const canGoBack      = gramIdx > 0 || step > 0;

  // ── Resume prompt ──────────────────────────────────────────────────────────
  if (resumePrompt === null) return null; // loading

  if (resumePrompt) {
    const { completedCount: saved } = resumePrompt;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Grammar Points ({totalPoints})</Text>
        <View style={styles.resumeCard}>
          <Text style={styles.resumeTitle}>Welcome back! 📖</Text>
          <Text style={styles.resumeBody}>
            You've reviewed{' '}
            <Text style={styles.resumeAccent}>{saved} of {totalPoints}</Text>
            {' '}grammar points.{'\n'}Continue from point {saved + 1}?
          </Text>
          <TouchableOpacity
            style={styles.resumeContinueBtn}
            onPress={() => {
              setGramIdx(saved);
              setStep(0);
              setResumePrompt(undefined);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.resumeContinueBtnText}>Continue →</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.resumeRestartBtn}
            onPress={() => {
              if (isPersisted) AsyncStorage.removeItem(storageKey).catch(() => {});
              setGramIdx(0);
              setStep(0);
              setResumePrompt(undefined);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.resumeRestartBtnText}>Start Over</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grammar Points ({totalPoints})</Text>

      {/* Progress dots + back button */}
      <View style={styles.progressRow}>
        <TouchableOpacity
          onPress={handleBack}
          disabled={!canGoBack}
          style={[styles.backBtn, !canGoBack && styles.backBtnHidden]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.dotsRowFlex}>
          <View style={styles.dotsRow}>
            {grammarPoints.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i < completedCount || (i === gramIdx && !done) ? styles.dotFilled : styles.dotEmpty]}
              />
            ))}
          </View>
          <Text style={styles.progressLabel}>
            {done
              ? `All ${totalPoints} grammar points done`
              : `Grammar ${gramIdx + 1} of ${totalPoints} · ${stepLabel}`}
          </Text>
        </View>
      </View>

      {/* Completed grammar rows */}
      {grammarPoints.slice(0, completedCount).map((p, i) => (
        <CompletedGrammarPoint key={p.id ?? p.number ?? i} point={p} />
      ))}

      {/* Current active step panel */}
      {!done && (
        <View style={styles.seqPanelOuter}>
          {step === 0 && (
            <GrammarCardPanel
              key={`${gramIdx}-card`}
              point={point}
              onNext={handleAdvance}
            />
          )}
          {step === 1 && (
            <GrammarMCQPanel
              key={`${gramIdx}-mcq`}
              point={point}
              onNext={handleAdvance}
            />
          )}
          {step === 2 && (
            <GrammarFillBlankPanel
              key={`${gramIdx}-fb`}
              point={point}
              allPoints={grammarPoints}
              onNext={handleAdvance}
            />
          )}
        </View>
      )}

      {done && <GrammarCompletionCard grammarPoints={grammarPoints} />}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CompletedGrammarPoint — collapsible completed grammar row with content
// ─────────────────────────────────────────────────────────────────────────────

function CompletedGrammarPoint({ point }) {
  const [open, setOpen] = useState(false);
  const { usageParts, structure } = parseGrammarForDisplay(point);
  const examples = (point.examples || []).map(ex =>
    typeof ex === 'string' ? { chinese: ex, english: '' } : ex
  );
  const { intro, points } = buildDisplayPoints(usageParts);
  const headerLabel = point.pattern
    ? `${point.pattern} — ${point.meaning}`
    : `${point.number}. ${point.title}`;

  return (
    <View style={styles.gramDoneRow}>
      <TouchableOpacity
        style={styles.gramDoneHeader}
        onPress={() => setOpen(v => !v)}
        activeOpacity={0.75}
      >
        <Text style={styles.gramDoneTitle} numberOfLines={open ? undefined : 1}>{headerLabel}</Text>
        <View style={styles.gramDoneRight}>
          <Text style={styles.gramDoneCheck}>✓</Text>
          <Text style={styles.gramDoneChevron}>{open ? '▼' : '▶'}</Text>
        </View>
      </TouchableOpacity>

      {open && (
        <View style={styles.gramDoneContent}>
          {points.length === 0 ? (
            !!intro && <Text style={styles.usageText}>{intro}</Text>
          ) : (
            <View>
              {!!intro && <Text style={[styles.usageText, { marginBottom: 4 }]}>{intro}</Text>}
              {points.map((group, i) => {
                const isCJK = isChineseStart(group[0]);
                return (
                  <View key={i} style={styles.pointRow}>
                    <Text style={styles.usageItemNum}>{i + 1}.  </Text>
                    {group.length === 1 ? (
                      <Text style={styles.pointText}>{group[0]}</Text>
                    ) : isCJK ? (
                      <View style={styles.bulletBlock}>
                        {group.map((s, j) => (
                          <Text key={j} style={styles.bulletItem}>
                            <Text style={styles.bullet}>&bull;  </Text>{s}
                          </Text>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.pointText}>{group.join('. ')}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}
          {!!structure && (
            <Text style={styles.structureLine}>
              <Text style={styles.fieldLabel}>Structure: </Text>
              {structure}
            </Text>
          )}
          {examples.length > 0 && (
            <View style={styles.examplesBlock}>
              <Text style={styles.fieldLabel}>Examples:</Text>
              {examples.map((ex, i) => (
                <View key={i} style={styles.exampleEntry}>
                  <Text style={styles.exampleChinese}>{ex.chinese}</Text>
                  {!!ex.pinyin  && <Text style={styles.examplePinyin}>{ex.pinyin}</Text>}
                  {!!ex.english && <Text style={styles.exampleEnglish}>{ex.english}</Text>}
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GrammarCardPanel — Step 0: grammar content card
// ─────────────────────────────────────────────────────────────────────────────

function GrammarCardPanel({ point, onNext }) {
  const { usageParts, structure } = parseGrammarForDisplay(point);
  const examples = (point.examples || []).map(ex =>
    typeof ex === 'string' ? { chinese: ex, english: '' } : ex
  );
  const { intro, points } = buildDisplayPoints(usageParts);

  const headerLabel = point.pattern
    ? `${point.pattern}  —  ${point.meaning}`
    : `${point.number}. ${point.title}`;

  return (
    <View style={styles.seqCard}>
      <View style={styles.seqCardHeader}>
        <Text style={styles.seqCardHeaderText}>{headerLabel}</Text>
      </View>

      <View style={styles.seqCardContent}>
        {/* Explanation */}
        {points.length === 0 ? (
          !!intro && <Text style={styles.usageText}>{intro}</Text>
        ) : (
          <View>
            {!!intro && <Text style={[styles.usageText, { marginBottom: 4 }]}>{intro}</Text>}
            {points.map((group, i) => {
              const isCJK = isChineseStart(group[0]);
              return (
                <View key={i} style={styles.pointRow}>
                  <Text style={styles.usageItemNum}>{i + 1}.  </Text>
                  {group.length === 1 ? (
                    <Text style={styles.pointText}>{group[0]}</Text>
                  ) : isCJK ? (
                    <View style={styles.bulletBlock}>
                      {group.map((s, j) => (
                        <Text key={j} style={styles.bulletItem}>
                          <Text style={styles.bullet}>&bull;  </Text>{s}
                        </Text>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.pointText}>{group.join('. ')}</Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Structure */}
        {!!structure && (
          <Text style={styles.structureLine}>
            <Text style={styles.fieldLabel}>Structure: </Text>
            {structure}
          </Text>
        )}

        {/* Examples */}
        {examples.length > 0 && (
          <View style={styles.examplesBlock}>
            <Text style={styles.fieldLabel}>Examples:</Text>
            {examples.map((ex, i) => (
              <View key={i} style={styles.exampleEntry}>
                <Text style={styles.exampleChinese}>{ex.chinese}</Text>
                {!!ex.pinyin  && <Text style={styles.examplePinyin}>{ex.pinyin}</Text>}
                {!!ex.english && <Text style={styles.exampleEnglish}>{ex.english}</Text>}
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.nextBtn} onPress={onNext} activeOpacity={0.85}>
          <Text style={styles.nextBtnText}>Next &rarr;</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GrammarMCQPanel — Step 1: multiple-choice exercise
// Wrong: red flash 400ms then revert. Correct: green, auto-advance 600ms.
// ─────────────────────────────────────────────────────────────────────────────

function GrammarMCQPanel({ point, onNext }) {
  const ex = (point.mini_exercises || []).find(e => e.type === 'multiple_choice') || null;

  const [selected,   setSelected]   = useState(null);
  const [correct,    setCorrect]    = useState(false);
  const [flash,      setFlash]      = useState(null);
  const [showPinyin, setShowPinyin] = useState(false);

  const shuffled = useRef(null);
  if (ex && !shuffled.current) {
    const pairs = (ex.options || []).map((opt, i) => ({ opt, pin: ex.option_pinyin?.[i] ?? null }));
    pairs.sort(() => Math.random() - 0.5);
    shuffled.current = pairs;
  }

  const optionsAreChinese = (ex?.options || []).some(o => /[一-鿿]/.test(o));

  const handleSelect = useCallback((opt) => {
    if (correct || flash !== null) return;
    if (opt === ex.correct) {
      setSelected(opt);
      setCorrect(true);
      setTimeout(onNext, 600);
    } else {
      setFlash(opt);
      setTimeout(() => setFlash(null), 400);
    }
  }, [correct, flash, ex, onNext]);

  if (!ex) {
    return (
      <View style={styles.seqCard}>
        <View style={styles.seqCardContent}>
          <TouchableOpacity style={styles.nextBtn} onPress={onNext} activeOpacity={0.85}>
            <Text style={styles.nextBtnText}>Next &rarr;</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.seqCard}>
      <View style={styles.seqCardHeader}>
        <Text style={styles.stepTypeLabel}>Multiple Choice</Text>
        {optionsAreChinese && (
          <TouchableOpacity onPress={() => setShowPinyin(v => !v)} activeOpacity={0.7}>
            <Text style={styles.showPinyinToggle}>
              {showPinyin ? 'Hide Pinyin' : 'Show Pinyin'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.seqCardContent}>
        <Text style={styles.exerciseQuestion}>{ex.question}</Text>
        <View style={styles.optionsCol}>
          {(shuffled.current || []).map(({ opt, pin }, i) => {
            let btnStyle = styles.optBtn;
            let txtStyle = styles.optBtnText;
            if (correct && opt === ex.correct) {
              btnStyle = styles.optBtnCorrect;
              txtStyle = [styles.optBtnText, { color: SUCCESS }];
            } else if (flash === opt) {
              btnStyle = styles.optBtnWrong;
              txtStyle = [styles.optBtnText, { color: ERROR }];
            } else if (correct && opt !== ex.correct) {
              btnStyle = styles.optBtnDimmed;
              txtStyle = [styles.optBtnText, { color: 'rgba(28,42,68,0.35)' }];
            }
            return (
              <TouchableOpacity
                key={i}
                style={btnStyle}
                onPress={() => handleSelect(opt)}
                activeOpacity={0.75}
              >
                <Text style={txtStyle}>{opt}</Text>
                {optionsAreChinese && showPinyin && pin ? <Text style={styles.optPinyin}>{pin}</Text> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GrammarFillBlankPanel — Step 2: fill-in-the-blank exercise
// Renders question with ___ styled as a blank. Same correct/wrong behavior.
// ─────────────────────────────────────────────────────────────────────────────

function GrammarFillBlankPanel({ point, allPoints, onNext }) {
  const ex = (point.mini_exercises || []).find(e => e.type === 'fill_blank') || null;

  const [selected,   setSelected]   = useState(null);
  const [correct,    setCorrect]    = useState(false);
  const [flash,      setFlash]      = useState(null);
  const [showPinyin, setShowPinyin] = useState(false);

  const shuffled = useRef(null);
  if (ex && !shuffled.current) {
    const pairs = (ex.options || []).map((opt, i) => ({ opt, pin: ex.option_pinyin?.[i] ?? null }));
    pairs.sort(() => Math.random() - 0.5);
    shuffled.current = pairs;
  }

  const handleSelect = useCallback((opt) => {
    if (correct || flash !== null) return;
    if (opt === ex.correct) {
      setSelected(opt);
      setCorrect(true);
      setTimeout(onNext, 600);
    } else {
      setFlash(opt);
      setTimeout(() => setFlash(null), 400);
    }
  }, [correct, flash, ex, onNext]);

  if (!ex) {
    return (
      <View style={styles.seqCard}>
        <View style={styles.seqCardContent}>
          <TouchableOpacity style={styles.nextBtn} onPress={onNext} activeOpacity={0.85}>
            <Text style={styles.nextBtnText}>Next &rarr;</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const qChinese = ex.question_chinese || ex.question || '';
  const qPinyin  = ex.question_pinyin  || '';
  const qEnglish = ex.question_english || '';
  const blankParts = qChinese.split(/___+/);

  return (
    <View style={styles.seqCard}>
      <View style={styles.seqCardHeader}>
        <Text style={styles.stepTypeLabel}>Fill in the Blank</Text>
        <TouchableOpacity onPress={() => setShowPinyin(v => !v)} activeOpacity={0.7}>
          <Text style={styles.showPinyinToggle}>
            {showPinyin ? 'Hide Pinyin' : 'Show Pinyin'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.seqCardContent}>
        {/* Sentence with blank */}
        <View style={styles.fillSentenceBox}>
          <Text style={styles.fillSentenceText}>
            {blankParts[0]}
            <Text style={[styles.fillBlank, correct && { color: SUCCESS }]}>
              {correct ? ex.correct : '___'}
            </Text>
            {blankParts[1] || ''}
          </Text>
          {showPinyin && qPinyin ? (
            <Text style={styles.qPinyinText}>{qPinyin}</Text>
          ) : null}
          {qEnglish ? (
            <Text style={styles.qEnglishText}>{qEnglish}</Text>
          ) : null}
        </View>

        <View style={styles.optionsCol}>
          {(shuffled.current || []).map(({ opt, pin }, i) => {
            let btnStyle = styles.optBtn;
            let txtStyle = styles.optBtnText;
            if (correct && opt === ex.correct) {
              btnStyle = styles.optBtnCorrect;
              txtStyle = [styles.optBtnText, { color: SUCCESS }];
            } else if (flash === opt) {
              btnStyle = styles.optBtnWrong;
              txtStyle = [styles.optBtnText, { color: ERROR }];
            } else if (correct && opt !== ex.correct) {
              btnStyle = styles.optBtnDimmed;
              txtStyle = [styles.optBtnText, { color: 'rgba(28,42,68,0.35)' }];
            }
            return (
              <TouchableOpacity
                key={i}
                style={btnStyle}
                onPress={() => handleSelect(opt)}
                activeOpacity={0.75}
              >
                <Text style={txtStyle}>{opt}</Text>
                {showPinyin && pin ? <Text style={styles.optPinyin}>{pin}</Text> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GrammarCompletionCard — shown after all grammar points reviewed
// ─────────────────────────────────────────────────────────────────────────────

function GrammarCompletionCard({ grammarPoints }) {
  return (
    <View style={styles.completionCard}>
      <Text style={styles.completionCheck}>&#x2713;</Text>
      <Text style={styles.completionTitle}>All grammar reviewed</Text>
      <View style={styles.completionList}>
        {grammarPoints.map((p, i) => {
          const label = p.pattern
            ? `${p.pattern} — ${p.meaning}`
            : `${p.number}. ${p.title}`;
          return (
            <View key={p.id ?? p.number ?? i} style={styles.completionRow}>
              <Text style={styles.completionRowDot}>&bull;</Text>
              <Text style={styles.completionRowText}>{label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback accordion: GrammarAccordion + GrammarPointCard
// ─────────────────────────────────────────────────────────────────────────────

function GrammarAccordion({ grammarPoints }) {
  const [expandedPoints, setExpandedPoints] = useState([]);

  const togglePoint = (index) => {
    setExpandedPoints(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grammar Points ({grammarPoints.length})</Text>
      {grammarPoints.map((point, index) => (
        <GrammarPointCard
          key={point.id ?? point.number ?? index}
          point={point}
          isExpanded={expandedPoints.includes(index)}
          onToggle={() => togglePoint(index)}
        />
      ))}
    </View>
  );
}

function GrammarPointCard({ point, isExpanded, onToggle }) {
  const { usage, usageParts, structure } = parseGrammarForDisplay(point);
  const examples = (point.examples || []).map(ex =>
    typeof ex === 'string' ? { chinese: ex, english: '' } : ex
  );

  const { intro, points } = buildDisplayPoints(usageParts);

  const miniExs = point.mini_exercises || [];
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [selected,    setSelected]    = useState(null);
  const [answered,    setAnswered]    = useState(false);

  const currentEx = miniExs[exerciseIdx] || null;

  const handleSelect = (opt) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
  };

  const handleNext = () => {
    const nextIdx = exerciseIdx + 1 < miniExs.length ? exerciseIdx + 1 : 0;
    setExerciseIdx(nextIdx);
    setSelected(null);
    setAnswered(false);
  };

  const headerLabel = point.pattern
    ? `${point.pattern}  —  ${point.meaning}`
    : `${point.number}. ${point.title}`;

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Text style={styles.cardHeaderText}>{headerLabel}</Text>
        <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.cardContent}>

          {/* 1 — Meaning / Usage */}
          {points.length === 0 ? (
            !!intro && <Text style={styles.usageText}>{intro}</Text>
          ) : (
            <View>
              {!!intro && <Text style={[styles.usageText, { marginBottom: 4 }]}>{intro}</Text>}
              {points.map((group, i) => {
                const isCJK = isChineseStart(group[0]);
                return (
                  <View key={i} style={styles.pointRow}>
                    <Text style={styles.usageItemNum}>{i + 1}.  </Text>
                    {group.length === 1 ? (
                      <Text style={styles.pointText}>{group[0]}</Text>
                    ) : isCJK ? (
                      <View style={styles.bulletBlock}>
                        {group.map((s, j) => (
                          <Text key={j} style={styles.bulletItem}>
                            <Text style={styles.bullet}>&bull;  </Text>{s}
                          </Text>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.pointText}>{group.join('. ')}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* 2 — Structure line */}
          {!!structure && (
            <Text style={styles.structureLine}>
              <Text style={styles.fieldLabel}>Structure: </Text>
              {structure}
            </Text>
          )}

          {/* 3 — Examples */}
          {examples.length > 0 && (
            <View style={styles.examplesBlock}>
              <Text style={styles.fieldLabel}>Examples:</Text>
              {examples.map((ex, i) => (
                <View key={i} style={styles.exampleEntry}>
                  <Text style={styles.exampleChinese}>{ex.chinese}</Text>
                  {!!ex.pinyin && (
                    <Text style={styles.examplePinyin}>{ex.pinyin}</Text>
                  )}
                  {!!ex.english && (
                    <Text style={styles.exampleEnglish}>{ex.english}</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* 4 — Mini exercises (accordion fallback inline) */}
          {currentEx && (
            <View style={styles.exerciseBox}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseLabel}>Quick Check</Text>
                {miniExs.length > 1 && (
                  <Text style={styles.exerciseCounter}>
                    {exerciseIdx + 1} / {miniExs.length}
                  </Text>
                )}
              </View>
              <Text style={styles.exerciseQuestion}>{currentEx.question}</Text>
              <View style={styles.optionsCol}>
                {(currentEx.options || []).map((opt, i) => {
                  let btnStyle = styles.optBtn;
                  let txtStyle = styles.optBtnText;
                  if (answered) {
                    if (opt === currentEx.correct) {
                      btnStyle = styles.optBtnCorrect;
                      txtStyle = [styles.optBtnText, { color: SUCCESS }];
                    } else if (opt === selected) {
                      btnStyle = styles.optBtnWrong;
                      txtStyle = [styles.optBtnText, { color: ERROR }];
                    } else {
                      btnStyle = styles.optBtnDimmed;
                      txtStyle = [styles.optBtnText, { color: 'rgba(28,42,68,0.35)' }];
                    }
                  }
                  return (
                    <TouchableOpacity
                      key={i}
                      style={btnStyle}
                      onPress={() => handleSelect(opt)}
                      disabled={answered}
                      activeOpacity={0.75}
                    >
                      <Text style={txtStyle}>{opt}</Text>
                      {currentEx.option_pinyin?.[i] ? (
                        <Text style={styles.optPinyin}>{currentEx.option_pinyin[i]}</Text>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
              {answered && (
                <View style={styles.resultRow}>
                  <Text style={[styles.resultText, { color: selected === currentEx.correct ? SUCCESS : ERROR }]}>
                    {selected === currentEx.correct ? 'Correct!' : `Answer: ${currentEx.correct}`}
                  </Text>
                  <TouchableOpacity
                    style={[styles.nextBtnSmall, { backgroundColor: selected === currentEx.correct ? SUCCESS : SLATE_TEAL }]}
                    onPress={handleNext}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.nextBtnSmallText}>Next &rarr;</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Palette & Styles
// ─────────────────────────────────────────────────────────────────────────────

const VG = {
  cardDark:   'rgba(255,255,255,0.92)',
  gold:       WARM_BROWN,
  orange:     WARM_ORANGE,
  cream:      DEEP_NAVY,
  creamMuted: SLATE_TEAL,
  border:     'rgba(155,104,70,0.20)',
};

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  title: { fontSize: 20, fontWeight: '800', color: VG.cream, marginBottom: 12 },

  // ── Progress bar ────────────────────────────────────────────────────────────
  progressRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 8 },
  backBtn:       { paddingHorizontal: 6, paddingVertical: 2 },
  backBtnHidden: { opacity: 0 },
  backBtnText:   { fontSize: 22, color: WARM_BROWN, fontWeight: '700', lineHeight: 26 },
  dotsRowFlex:   { flex: 1 },
  dotsRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 6 },
  dot:           { width: 10, height: 10, borderRadius: 5 },
  dotFilled:     { backgroundColor: WARM_ORANGE },
  dotEmpty:      { backgroundColor: 'rgba(155,104,70,0.22)' },
  progressLabel: { fontSize: 12, fontWeight: '600', color: SLATE_TEAL },

  // ── Resume prompt ──────────────────────────────────────────────────────────
  resumeCard: {
    backgroundColor: CARD_WHITE,
    borderRadius: 20,
    padding: 28,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: WARM_BROWN,
    alignItems: 'center',
    gap: 16,
  },
  resumeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: WARM_BROWN,
  },
  resumeBody: {
    fontSize: 15,
    color: DEEP_NAVY,
    textAlign: 'center',
    lineHeight: 24,
  },
  resumeAccent: {
    fontWeight: '800',
    color: WARM_ORANGE,
  },
  resumeContinueBtn: {
    backgroundColor: WARM_BROWN,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 40,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  resumeContinueBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  resumeRestartBtn: {
    paddingVertical: 8,
    alignSelf: 'center',
  },
  resumeRestartBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: SLATE_TEAL,
  },

  // ── Completed grammar done rows ──────────────────────────────────────────
  gramDoneRow: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.25)',
    overflow: 'hidden',
  },
  gramDoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  gramDoneTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: DEEP_NAVY,
  },
  gramDoneRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gramDoneCheck: {
    fontSize: 16,
    color: SUCCESS,
    fontWeight: '800',
  },
  gramDoneChevron: {
    fontSize: 11,
    color: SLATE_TEAL,
  },
  gramDoneContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(76,175,80,0.15)',
  },

  // ── Sequential panel ─────────────────────────────────────────────────────
  seqPanelOuter: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  stepTypeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: SLATE_TEAL,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  fillSentenceBox: {
    backgroundColor: 'rgba(247,240,232,0.95)',
    borderLeftWidth: 3,
    borderLeftColor: WARM_ORANGE,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  fillSentenceText: {
    fontSize: 18,
    fontWeight: '700',
    color: DEEP_NAVY,
    lineHeight: 28,
  },
  fillBlank: {
    fontSize: 18,
    fontWeight: '900',
    color: WARM_ORANGE,
    textDecorationLine: 'underline',
  },

  seqCard: {
    backgroundColor: VG.cardDark,
    borderRadius: 16,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: VG.border,
  },
  seqCardHeader: {
    padding: 16,
    backgroundColor: 'rgba(155,104,70,0.10)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seqCardHeaderText: {
    fontSize: 15,
    fontWeight: '700',
    color: VG.cream,
  },
  showPinyinToggle: {
    fontSize: 12,
    fontWeight: '700',
    color: SLATE_TEAL,
    borderWidth: 1,
    borderColor: SLATE_TEAL,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  qPinyinText: {
    fontSize: 13,
    color: WARM_ORANGE,
    fontStyle: 'italic',
    marginTop: 4,
  },
  qEnglishText: {
    fontSize: 13,
    color: SLATE_TEAL,
    marginTop: 2,
  },
  seqCardContent: { padding: 16, gap: 10 },

  // ── Exercise block (sequential + fallback) ────────────────────────────────
  exerciseBox: {
    backgroundColor: '#F0F6F7',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(55,73,80,0.22)',
    gap: 10,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: SLATE_TEAL,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  exerciseCounter: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(55,73,80,0.55)',
  },
  exerciseQuestion: {
    fontSize: 15,
    fontWeight: '700',
    color: DEEP_NAVY,
    lineHeight: 22,
  },
  optionsCol: { gap: 7 },
  optBtn: {
    backgroundColor: CARD_WHITE,
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(55,73,80,0.18)',
  },
  optBtnCorrect: {
    backgroundColor: '#e8f5e9',
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: SUCCESS,
  },
  optBtnWrong: {
    backgroundColor: '#fde8e8',
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: ERROR,
  },
  optBtnDimmed: {
    backgroundColor: '#F5F2EE',
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(55,73,80,0.08)',
  },
  optBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: DEEP_NAVY,
  },
  optPinyin: {
    fontSize: 11,
    color: SLATE_TEAL,
    fontStyle: 'italic',
    marginTop: 1,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  resultText: { fontSize: 14, fontWeight: '700', flex: 1 },
  nextBtnSmall: {
    borderRadius: 9,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  nextBtnSmallText: { fontSize: 13, fontWeight: '800', color: '#fff' },

  nextBtn: {
    backgroundColor: WARM_ORANGE,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },

  // ── Completion card ─────────────────────────────────────────────────────
  completionCard: {
    backgroundColor: VG.cardDark,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.35)',
    gap: 10,
  },
  completionCheck: { fontSize: 32, textAlign: 'center', color: SUCCESS },
  completionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: DEEP_NAVY,
    textAlign: 'center',
  },
  completionList: { marginTop: 8, gap: 6 },
  completionRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  completionRowDot: { color: WARM_ORANGE, fontWeight: '700', fontSize: 14 },
  completionRowText: { fontSize: 14, color: DEEP_NAVY, flex: 1, lineHeight: 20 },

  // ── Fallback accordion card ────────────────────────────────────────────
  card: {
    backgroundColor: VG.cardDark,
    borderRadius: 16,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: VG.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(155,104,70,0.10)',
  },
  cardHeaderText: { fontSize: 15, fontWeight: '700', color: VG.cream, flex: 1, paddingRight: 8 },
  expandIcon: { fontSize: 14, color: VG.gold },

  cardContent: { padding: 16, gap: 10 },

  // ── Shared grammar content styles ──────────────────────────────────────
  usageText: {
    fontSize: 14,
    lineHeight: 22,
    color: VG.cream,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  usageItemNum: {
    fontWeight: '700',
    color: VG.gold,
    fontSize: 14,
    lineHeight: 22,
  },
  pointText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: VG.cream,
  },
  bulletBlock: { flex: 1 },
  bulletItem: {
    fontSize: 14,
    lineHeight: 22,
    color: VG.cream,
    marginBottom: 2,
  },
  bullet: { color: VG.gold, fontWeight: '700' },

  structureLine: {
    fontSize: 14,
    lineHeight: 21,
    color: VG.cream,
    backgroundColor: 'rgba(247,240,232,0.95)',
    borderLeftWidth: 3,
    borderLeftColor: VG.gold,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  fieldLabel: { fontWeight: '800', color: VG.gold },

  examplesBlock: {
    backgroundColor: 'rgba(247,240,232,0.95)',
    borderLeftWidth: 3,
    borderLeftColor: WARM_ORANGE,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 5,
  },
  exampleEntry:   { marginBottom: 2 },
  exampleChinese: { fontSize: 14, fontWeight: '700', color: VG.cream, lineHeight: 21 },
  examplePinyin:  { fontSize: 12, color: VG.gold, lineHeight: 18 },
  exampleEnglish: { fontSize: 13, color: VG.creamMuted, fontStyle: 'italic', lineHeight: 19 },
});
