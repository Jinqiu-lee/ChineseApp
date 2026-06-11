import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  useWindowDimensions,
  ScrollView,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { speakAsAvatar } from '../utils/tts';
import { generateWordMiniExercises } from '../utils/exerciseGenerator';
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
// Default export: VocabularySection
// Activates sequential flow when any non-phrase word has mini_exercises.
// Phrases always use the old accordion layout.
// ─────────────────────────────────────────────────────────────────────────────

export default function VocabularySection({ vocabulary, showPinyin = true, avatarId = 'eileen', wordsDone, phrasesDone, onPhrasesDone, onWordsComplete, lessonId, levelId }) {
  const rawWords = (vocabulary || []).filter(v => v.part_of_speech !== 'phrase');
  const phrases  = (vocabulary || []).filter(v => v.part_of_speech === 'phrase');

  // Augment words with generated exercises once per mount, for words that
  // have no JSON-level mini_exercises (lessons 2-15 and other levels).
  const augRef = useRef(null);
  if (!augRef.current) {
    augRef.current = rawWords.map(w =>
      (w.mini_exercises || []).length > 0
        ? w
        : { ...w, mini_exercises: generateWordMiniExercises(w, rawWords) }
    );
  }
  const words = augRef.current;

  const hasExercises = words.some(w => (w.mini_exercises || []).length > 0);

  return (
    <View style={styles.container}>
      {words.length > 0 && (
        wordsDone && hasExercises ? (
          <ReadOnlyWordsView words={words} showPinyin={showPinyin} avatarId={avatarId} />
        ) : hasExercises ? (
          <NewWordsSequential
            words={words}
            showPinyin={showPinyin}
            avatarId={avatarId}
            lessonId={lessonId}
            levelId={levelId}
            onComplete={onWordsComplete}
          />
        ) : (
          <ItemGroup
            items={words}
            label="New Words"
            count={`${words.length} words`}
            isPhrase={false}
            showPinyin={showPinyin}
            avatarId={avatarId}
          />
        )
      )}
      {phrases.length > 0 && (
        <PhraseFeedSection
          phrases={phrases}
          showPinyin={showPinyin}
          avatarId={avatarId}
          initialDone={phrasesDone}
          onAllDone={onPhrasesDone}
          lessonId={lessonId}
          levelId={levelId}
        />
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ReadOnlyWordsView — shown when New Words section was already completed
// ─────────────────────────────────────────────────────────────────────────────

function ReadOnlyWordsView({ words, showPinyin, avatarId }) {
  const [selectedWord, setSelectedWord] = useState(null);

  return (
    <View style={styles.readOnlyList}>
      {words.map((w, i) => (
        <TouchableOpacity
          key={w.id ?? i}
          style={styles.readOnlyRow}
          onPress={() => setSelectedWord(w)}
          activeOpacity={0.7}
        >
          <Text style={styles.readOnlyChinese}>{w.chinese}</Text>
          <View style={styles.readOnlyMid}>
            {showPinyin && w.pinyin ? (
              <Text style={styles.readOnlyPinyin}>{w.pinyin}</Text>
            ) : null}
            <Text style={styles.readOnlyEnglish}>{w.english}</Text>
          </View>
          {w.part_of_speech ? (
            <View style={styles.posBadge}>
              <Text style={styles.posBadgeText}>{w.part_of_speech}</Text>
            </View>
          ) : null}
          <Text style={styles.readOnlyCheck}>&#x2713;</Text>
        </TouchableOpacity>
      ))}

      <Modal
        visible={!!selectedWord}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedWord(null)}
      >
        <View style={styles.reviewOverlay}>
          <View style={styles.reviewCard}>
            {selectedWord && (
              <>
                <TouchableOpacity
                  style={styles.reviewClose}
                  onPress={() => setSelectedWord(null)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.reviewCloseText}>✕</Text>
                </TouchableOpacity>

                <Text style={styles.reviewChinese}>{selectedWord.chinese}</Text>
                {selectedWord.pinyin ? (
                  <Text style={styles.reviewPinyin}>{selectedWord.pinyin}</Text>
                ) : null}
                <Text style={styles.reviewEnglish}>{selectedWord.english}</Text>
                {selectedWord.part_of_speech ? (
                  <View style={styles.reviewPosBadge}>
                    <Text style={styles.reviewPosBadgeText}>{selectedWord.part_of_speech}</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={styles.reviewAudioBtn}
                  onPress={() => speakAsAvatar(selectedWord.chinese, avatarId, selectedWord.pinyin)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.reviewAudioBtnText}>🔊 Play Audio</Text>
                </TouchableOpacity>

                {selectedWord.example ? (
                  <View style={styles.reviewExampleBox}>
                    <Text style={styles.reviewExampleChinese}>{selectedWord.example}</Text>
                    {selectedWord.translation ? (
                      <Text style={styles.reviewExampleEnglish}>{selectedWord.translation}</Text>
                    ) : null}
                  </View>
                ) : null}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NewWordsSequential — Duolingo-style sequential card flow
// ─────────────────────────────────────────────────────────────────────────────

function NewWordsSequential({ words, showPinyin, avatarId, lessonId, levelId, onComplete }) {
  const { width } = useWindowDimensions();

  const isPersisted = !!lessonId;
  const storageKey  = `wordProgress_${levelId}_lesson_${lessonId}`;

  // wordIdx: which word we're on. step: 0=WordCard, 1=MultipleChoice, 2=FillBlank, 3=Audio
  const [wordIdx, setWordIdx]         = useState(0);
  const [step, setStep]               = useState(0);
  const [done, setDone]               = useState(false);
  // null = loading or no prompt; { completedCount } = show resume prompt
  const [resumePrompt, setResumePrompt] = useState(isPersisted ? null : undefined);

  const slideAnim = useRef(new Animated.Value(0)).current;

  // Load saved progress on mount
  useEffect(() => {
    if (!isPersisted) return;
    AsyncStorage.getItem(storageKey).then(val => {
      if (val !== null) {
        const completedCount = parseInt(val, 10);
        if (!isNaN(completedCount) && completedCount > 0 && completedCount < words.length) {
          setResumePrompt({ completedCount });
          return;
        }
      }
      setResumePrompt(undefined); // no saved progress worth prompting
    }).catch(() => setResumePrompt(undefined));
  }, []);

  // Save how many words have been completed (called when leaving each word)
  const saveProgress = useCallback((completedCount) => {
    if (!isPersisted) return;
    AsyncStorage.setItem(storageKey, String(completedCount)).catch(() => {});
  }, [storageKey, isPersisted]);

  // Slide animation helper
  const slideTransition = useCallback((nextWordIdx, nextStep, direction = -1) => {
    Animated.timing(slideAnim, {
      toValue: direction * width,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setWordIdx(nextWordIdx);
      setStep(nextStep);
      slideAnim.setValue(-direction * width);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
    });
  }, [slideAnim, width]);

  const currentWord = words[wordIdx] || null;

  // Advance to next step or next word
  const handleAdvance = useCallback(() => {
    if (!currentWord) return;
    const exercises = currentWord.mini_exercises || [];
    const hasMC     = exercises.some(e => e.type === 'multiple_choice');
    const hasFB     = exercises.some(e => e.type === 'fill_blank');

    let nextStep = step;
    if (step === 0) {
      nextStep = hasMC ? 1 : hasFB ? 2 : 3;
    } else if (step === 1) {
      nextStep = hasFB ? 2 : 3;
    } else if (step === 2) {
      nextStep = 3;
    } else {
      // step === 3 (audio) — completed this word, move forward
      const nextIdx = wordIdx + 1;
      saveProgress(nextIdx); // nextIdx == number of completed words
      if (nextIdx >= words.length) {
        // All done — clear saved progress so re-entry shows review mode
        if (isPersisted) AsyncStorage.removeItem(storageKey).catch(() => {});
        Animated.timing(slideAnim, {
          toValue: -width,
          duration: 220,
          useNativeDriver: true,
        }).start(() => {
          if (onComplete) onComplete();
          setDone(true);
        });
        return;
      }
      slideTransition(nextIdx, 0);
      return;
    }
    slideTransition(wordIdx, nextStep);
  }, [currentWord, step, wordIdx, words.length, slideAnim, width, slideTransition, saveProgress, isPersisted, storageKey, onComplete]);

  // Go back to step 0 of the previous word (review mode — does not affect saved progress)
  const handleBack = useCallback(() => {
    if (wordIdx === 0 && step === 0) return;
    if (step > 0) {
      slideTransition(wordIdx, 0, 1);
    } else {
      slideTransition(wordIdx - 1, 0, 1);
    }
  }, [wordIdx, step, slideTransition]);

  // ── Resume prompt (shown while null = loading) ────────────────────────────
  if (resumePrompt === null) {
    // Still loading from AsyncStorage — render nothing briefly
    return null;
  }

  if (resumePrompt) {
    const { completedCount } = resumePrompt;
    return (
      <View style={styles.resumeCard}>
        <Text style={styles.resumeTitle}>Welcome back! 📖</Text>
        <Text style={styles.resumeBody}>
          You've learned{' '}
          <Text style={styles.resumeAccent}>{completedCount} of {words.length}</Text>
          {' '}words.{'\n'}Continue from word {completedCount + 1}?
        </Text>
        <TouchableOpacity
          style={styles.resumeContinueBtn}
          onPress={() => {
            setWordIdx(completedCount);
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
            setWordIdx(0);
            setStep(0);
            setResumePrompt(undefined);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.resumeRestartBtnText}>Start Over</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (done) {
    return <CompletionCard words={words} showPinyin={showPinyin} avatarId={avatarId} />;
  }

  if (!currentWord) return null;

  const stepLabel = (() => {
    if (step === 0) return 'Word Card';
    if (step === 1) return 'Multiple Choice';
    if (step === 2) return 'Fill in the Blank';
    return 'Listen & Choose';
  })();

  const canGoBack = wordIdx > 0 || step > 0;

  return (
    <View style={styles.seqContainer}>
      {/* Progress dots + label + back button */}
      <View style={styles.progressRow}>
        <TouchableOpacity
          onPress={handleBack}
          disabled={!canGoBack}
          style={[styles.backBtn, !canGoBack && styles.backBtnHidden]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.dotsRow}>
          {words.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i <= wordIdx ? styles.dotFilled : styles.dotEmpty,
              ]}
            />
          ))}
        </View>
        <Text style={styles.progressLabel}>
          Word {wordIdx + 1} of {words.length} &middot; {stepLabel}
        </Text>
      </View>

      {/* Animated panel */}
      <View style={[styles.seqPanelOuter, { overflow: 'hidden' }]}>
        <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
          {step === 0 && (
            <WordCardPanel
              word={currentWord}
              showPinyin={showPinyin}
              avatarId={avatarId}
              onNext={handleAdvance}
            />
          )}
          {step === 1 && (
            <MultipleChoicePanel
              word={currentWord}
              onNext={handleAdvance}
            />
          )}
          {step === 2 && (
            <VocabFillBlankPanel
              word={currentWord}
              onNext={handleAdvance}
            />
          )}
          {step === 3 && (
            <AudioExercisePanel
              word={currentWord}
              words={words}
              avatarId={avatarId}
              onNext={handleAdvance}
            />
          )}
        </Animated.View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WordCardPanel — Step 0: shows the word in full
// ─────────────────────────────────────────────────────────────────────────────

function WordCardPanel({ word, showPinyin, avatarId, onNext }) {
  return (
    <View style={styles.stepCard}>
      <View style={styles.wordCardCenter}>
        <Text style={styles.wordCardChinese}>{word.chinese}</Text>
        {showPinyin && word.pinyin ? (
          <Text style={styles.wordCardPinyin}>{word.pinyin}</Text>
        ) : null}
        <Text style={styles.wordCardEnglish}>{word.english}</Text>
        {word.part_of_speech ? (
          <View style={styles.posBadge}>
            <Text style={styles.posBadgeText}>{word.part_of_speech}</Text>
          </View>
        ) : null}
        <TouchableOpacity
          style={styles.playBtn}
          onPress={() => speakAsAvatar(word.chinese, avatarId, word.pinyin)}
        >
          <Text style={styles.audioEmoji}>&#x1F50A;</Text>
          <Text style={styles.playBtnText}>Play</Text>
        </TouchableOpacity>
      </View>

      {word.example ? (
        <View style={styles.exampleBox}>
          <View style={styles.exampleHeader}>
            <Text style={styles.exampleChinese}>{word.example}</Text>
            <TouchableOpacity
              style={styles.exampleAudioBtn}
              onPress={() => speakAsAvatar(word.example, avatarId)}
            >
              <Text style={styles.audioEmoji}>&#x1F50A;</Text>
            </TouchableOpacity>
          </View>
          {word.example_pinyin ? (
            <Text style={styles.examplePinyin}>{word.example_pinyin}</Text>
          ) : null}
          {word.translation ? (
            <Text style={styles.exampleTranslation}>{word.translation}</Text>
          ) : null}
        </View>
      ) : null}

      <TouchableOpacity style={styles.nextBtn} onPress={onNext}>
        <Text style={styles.nextBtnText}>Next &rarr;</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MultipleChoicePanel — Step 1: multiple_choice mini exercise
// Wrong: flash red 400ms then revert. Correct: turns green, auto-advance 600ms.
// ─────────────────────────────────────────────────────────────────────────────

function MultipleChoicePanel({ word, onNext }) {
  const exercises = (word.mini_exercises || []).filter(e => e.type === 'multiple_choice');
  const ex = exercises[0] || null;

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

  const _vopts     = ex?.options || [];
  const _hasCJK    = _vopts.some(o => /[一-鿿]/.test(o));
  const _hasLatin  = _vopts.some(o => /[a-zA-Z]/.test(o));
  const optionsAreChinese = _hasCJK;
  // pure Chinese → 17, mixed or English → 15
  const mcqBaseText = _hasCJK && !_hasLatin ? styles.fbOptBtnText : styles.optBtnText;

  const handleSelect = useCallback((opt) => {
    if (correct) return;
    if (flash !== null) return;

    if (opt === ex.correct) {
      setSelected(opt);
      setCorrect(true);
      setTimeout(() => { onNext(); }, 600);
    } else {
      setFlash(opt);
      setTimeout(() => { setFlash(null); }, 400);
    }
  }, [correct, flash, ex, onNext]);

  if (!ex) {
    return (
      <View style={styles.stepCard}>
        <Text style={styles.stepTitle}>Multiple Choice</Text>
        <TouchableOpacity style={styles.nextBtn} onPress={onNext}>
          <Text style={styles.nextBtnText}>Next &rarr;</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.stepCard}>
      <View style={styles.mcqHeader}>
        <Text style={styles.stepTitle}>Multiple Choice</Text>
        {optionsAreChinese && (
          <TouchableOpacity onPress={() => setShowPinyin(v => !v)} activeOpacity={0.7}>
            <Text style={styles.showPinyinToggle}>
              {showPinyin ? 'Hide Pinyin' : 'Show Pinyin'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.stepQuestion}>{ex.question}</Text>

      <View style={styles.optionsCol}>
        {(shuffled.current || []).map(({ opt, pin }, i) => {
          let btnStyle = styles.optBtn;
          let txtStyle = mcqBaseText;

          if (correct && opt === ex.correct) {
            btnStyle = styles.optBtnCorrect;
            txtStyle = [mcqBaseText, { color: SUCCESS }];
          } else if (flash === opt) {
            btnStyle = styles.optBtnWrong;
            txtStyle = [mcqBaseText, { color: ERROR }];
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
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VocabFillBlankPanel — Step 2: fill_blank mini exercise
// ─────────────────────────────────────────────────────────────────────────────

function VocabFillBlankPanel({ word, onNext }) {
  const ex = (word.mini_exercises || []).find(e => e.type === 'fill_blank') || null;
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
      setTimeout(() => onNext(), 700);
    } else {
      setFlash(opt);
      setTimeout(() => setFlash(null), 400);
    }
  }, [correct, flash, ex, onNext]);

  if (!ex) {
    return (
      <View style={styles.stepCard}>
        <TouchableOpacity style={styles.nextBtn} onPress={onNext}>
          <Text style={styles.nextBtnText}>Next →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const qChinese = ex.question_chinese || '';
  const qPinyin  = ex.question_pinyin  || '';
  const qEnglish = ex.question_english || '';
  const parts    = qChinese.split(/___+/);
  const filled   = correct ? ex.correct : '___';

  return (
    <View style={styles.stepCard}>
      <View style={styles.mcqHeader}>
        <Text style={styles.stepTitle}>Fill in the Blank</Text>
        <TouchableOpacity onPress={() => setShowPinyin(v => !v)} activeOpacity={0.7}>
          <Text style={styles.showPinyinToggle}>
            {showPinyin ? 'Hide Pinyin' : 'Show Pinyin'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sentence with blank */}
      <View style={styles.fbSentenceBox}>
        <Text style={styles.fbSentenceText}>
          {parts[0]}
          <Text style={[styles.fbBlank, correct && { color: SUCCESS }]}>{filled}</Text>
          {parts[1] || ''}
        </Text>
        {showPinyin && qPinyin ? (
          <Text style={styles.fbPinyin}>{qPinyin}</Text>
        ) : null}
        {qEnglish ? (
          <Text style={styles.fbEnglish}>{qEnglish}</Text>
        ) : null}
      </View>

      <View style={styles.optionsCol}>
        {(shuffled.current || []).map(({ opt, pin }, i) => {
          let btnStyle = styles.optBtn;
          let txtStyle = styles.fbOptBtnText;
          if (correct && opt === ex.correct) {
            btnStyle = styles.optBtnCorrect;
            txtStyle = [styles.fbOptBtnText, { color: SUCCESS }];
          } else if (flash === opt) {
            btnStyle = styles.optBtnWrong;
            txtStyle = [styles.fbOptBtnText, { color: ERROR }];
          } else if (correct && opt !== ex.correct) {
            btnStyle = styles.optBtnDimmed;
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
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AudioExercisePanel — Step 3: Listen & Choose
// Auto-plays TTS on mount, shows 4 English options.
// ─────────────────────────────────────────────────────────────────────────────

function AudioExercisePanel({ word, words, avatarId, onNext }) {
  const [selected, setSelected] = useState(null);
  const [correct,  setCorrect]  = useState(false);
  const [flash,    setFlash]    = useState(null);

  // Build 4 options: correct word.english + 3 random distractors
  const options = useRef(null);
  if (!options.current) {
    const distractors = words
      .filter(w => w.id !== word.id && w.english !== word.english)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(w => w.english);

    const allOpts = [word.english, ...distractors].sort(() => Math.random() - 0.5);
    options.current = allOpts;
  }

  useEffect(() => {
    const t = setTimeout(() => {
      speakAsAvatar(word.chinese, avatarId, word.pinyin);
    }, 300);
    return () => clearTimeout(t);
  }, [word.chinese, avatarId]);

  const handleSelect = useCallback((opt) => {
    if (correct) return;
    if (flash !== null) return;

    if (opt === word.english) {
      setSelected(opt);
      setCorrect(true);
      setTimeout(() => {
        onNext();
      }, 600);
    } else {
      setFlash(opt);
      setTimeout(() => {
        setFlash(null);
      }, 400);
    }
  }, [correct, flash, word.english, onNext]);

  return (
    <View style={styles.stepCard}>
      <Text style={styles.stepTitle}>Listen & Choose</Text>

      <View style={styles.audioCenter}>
        <TouchableOpacity
          style={styles.bigPlayBtn}
          onPress={() => speakAsAvatar(word.chinese, avatarId, word.pinyin)}
        >
          <Text style={styles.bigPlayEmoji}>&#x1F50A;</Text>
        </TouchableOpacity>
        <Text style={styles.audioHint}>Tap to replay</Text>
      </View>

      <View style={styles.optionsCol}>
        {options.current.map((opt, i) => {
          let btnStyle = styles.optBtn;
          let txtStyle = styles.optBtnText;

          if (correct && opt === word.english) {
            btnStyle = styles.optBtnCorrect;
            txtStyle = [styles.optBtnText, { color: SUCCESS }];
          } else if (flash === opt) {
            btnStyle = styles.optBtnWrong;
            txtStyle = [styles.optBtnText, { color: ERROR }];
          }

          return (
            <TouchableOpacity
              key={i}
              style={btnStyle}
              onPress={() => handleSelect(opt)}
              activeOpacity={0.75}
            >
              <Text style={txtStyle}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CompletionCard — shown after all words are studied
// ─────────────────────────────────────────────────────────────────────────────

function CompletionCard({ words, showPinyin, avatarId }) {
  const [selectedWord, setSelectedWord] = useState(null);

  return (
    <View style={styles.completionCard}>
      <Text style={styles.completionEmoji}>&#x1F389;</Text>
      <Text style={styles.completionTitle}>All Words Studied!</Text>
      <Text style={styles.completionSub}>
        New Words complete! Continue to Grammar &amp; Sentences.
      </Text>

      <ScrollView style={styles.summaryScroll} showsVerticalScrollIndicator={false}>
        {words.map((w, i) => (
          <TouchableOpacity
            key={w.id ?? i}
            style={styles.summaryRow}
            onPress={() => setSelectedWord(w)}
            activeOpacity={0.7}
          >
            <Text style={styles.summaryChinese}>{w.chinese}</Text>
            {showPinyin && w.pinyin ? (
              <Text style={styles.summaryPinyin}>{w.pinyin}</Text>
            ) : null}
            <Text style={styles.summaryEnglish}>{w.english}</Text>
            <Text style={styles.summaryTapHint}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Word review modal */}
      <Modal
        visible={!!selectedWord}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedWord(null)}
      >
        <View style={styles.reviewOverlay}>
          <View style={styles.reviewCard}>
            {selectedWord && (
              <>
                <TouchableOpacity
                  style={styles.reviewClose}
                  onPress={() => setSelectedWord(null)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.reviewCloseText}>✕</Text>
                </TouchableOpacity>

                <Text style={styles.reviewChinese}>{selectedWord.chinese}</Text>
                {selectedWord.pinyin ? (
                  <Text style={styles.reviewPinyin}>{selectedWord.pinyin}</Text>
                ) : null}
                <Text style={styles.reviewEnglish}>{selectedWord.english}</Text>
                {selectedWord.part_of_speech ? (
                  <View style={styles.reviewPosBadge}>
                    <Text style={styles.reviewPosBadgeText}>{selectedWord.part_of_speech}</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={styles.reviewAudioBtn}
                  onPress={() => speakAsAvatar(selectedWord.chinese, avatarId, selectedWord.pinyin)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.reviewAudioBtnText}>🔊 Play Audio</Text>
                </TouchableOpacity>

                {selectedWord.example ? (
                  <View style={styles.reviewExampleBox}>
                    <Text style={styles.reviewExampleChinese}>{selectedWord.example}</Text>
                    {selectedWord.translation ? (
                      <Text style={styles.reviewExampleEnglish}>{selectedWord.translation}</Text>
                    ) : null}
                  </View>
                ) : null}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PhraseFeedSection — collapsible header + feed-style phrase reveal
// ─────────────────────────────────────────────────────────────────────────────

function PhraseFeedSection({ phrases, showPinyin, avatarId, initialDone, onAllDone, lessonId, levelId }) {
  const [isOpen, setIsOpen]             = useState(false);
  const [visibleCount, setVisibleCount] = useState(1);
  const [flowDone]                      = useState(!!initialDone);
  const completionNotified              = useRef(!!initialDone);
  const storageKey = lessonId ? `phraseProgress_${levelId}_lesson_${lessonId}` : null;

  // Load saved phrase progress on mount
  useEffect(() => {
    if (!storageKey || flowDone) return;
    AsyncStorage.getItem(storageKey).then(val => {
      if (val !== null) {
        const saved = parseInt(val, 10);
        if (!isNaN(saved) && saved > 1 && saved <= phrases.length) {
          setVisibleCount(saved);
        }
      }
    }).catch(() => {});
  }, []);

  const handleNext = () => {
    const next = visibleCount + 1;
    setVisibleCount(next);
    if (storageKey) {
      AsyncStorage.setItem(storageKey, String(next)).catch(() => {});
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    if (flowDone) return;
    if (visibleCount < phrases.length) return;
    if (completionNotified.current) return;
    completionNotified.current = true;
    if (storageKey) AsyncStorage.removeItem(storageKey).catch(() => {});
    if (onAllDone) onAllDone();
  }, [isOpen, visibleCount, phrases.length, flowDone, onAllDone]);

  return (
    <View style={styles.feedSection}>
      <TouchableOpacity
        style={styles.feedHeader}
        onPress={() => setIsOpen(v => !v)}
        activeOpacity={0.75}
      >
        <Text style={styles.feedHeaderTitle}>Key Phrases</Text>
        <View style={styles.feedHeaderRight}>
          <Text style={styles.feedHeaderCount}>{phrases.length} phrases</Text>
          <Text style={styles.feedHeaderChevron}>{isOpen ? '▼' : '▶'}</Text>
        </View>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.feedBody}>
          {flowDone ? (
            phrases.map((phrase, i) => (
              <View key={phrase.id ?? i} style={styles.feedDoneRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.feedDoneChinese}>{phrase.chinese}</Text>
                  {showPinyin && phrase.pinyin
                    ? <Text style={styles.feedDonePinyin}>{phrase.pinyin}</Text>
                    : null}
                  <Text style={styles.feedDoneEnglish}>{phrase.english}</Text>
                </View>
                <Text style={styles.feedDoneCheck}>&#x2713;</Text>
              </View>
            ))
          ) : (
            phrases.slice(0, visibleCount).map((phrase, i) => {
              const isActive = i === visibleCount - 1;

              if (!isActive) {
                return (
                  <View key={phrase.id ?? i} style={styles.feedDoneRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.feedDoneChinese}>{phrase.chinese}</Text>
                      {showPinyin && phrase.pinyin
                        ? <Text style={styles.feedDonePinyin}>{phrase.pinyin}</Text>
                        : null}
                      <Text style={styles.feedDoneEnglish}>{phrase.english}</Text>
                    </View>
                    <Text style={styles.feedDoneCheck}>&#x2713;</Text>
                  </View>
                );
              }

              return (
                <View key={phrase.id ?? i} style={styles.feedActiveCard}>
                  <View>
                    <Text style={styles.feedActiveChinese}>{phrase.chinese}</Text>
                    {showPinyin && phrase.pinyin
                      ? <Text style={styles.feedActivePinyin}>{phrase.pinyin}</Text>
                      : null}
                    <Text style={styles.feedActiveEnglish}>{phrase.english}</Text>
                  </View>

                  <View style={styles.feedActiveActions}>
                    <TouchableOpacity
                      style={styles.feedPlayBtn}
                      onPress={() => speakAsAvatar(phrase.chinese, avatarId)}
                    >
                      <Text style={styles.audioEmoji}>&#x1F50A;</Text>
                      <Text style={styles.feedPlayBtnText}>Play</Text>
                    </TouchableOpacity>

                    {visibleCount < phrases.length ? (
                      <TouchableOpacity
                        style={styles.feedNextBtn}
                        onPress={handleNext}
                      >
                        <Text style={styles.feedNextBtnText}>Next &rarr;</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.feedAllDone}>
                        <Text style={styles.feedAllDoneText}>&#x1F389; All done!</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback: ItemGroup + VocabCard (old accordion layout)
// Used for words when no mini_exercises present.
// ─────────────────────────────────────────────────────────────────────────────

function ItemGroup({ items, label, count, isPhrase, showPinyin, avatarId }) {
  return (
    <View style={styles.group}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupTitle}>{label}</Text>
        <Text style={styles.groupCount}>{count}</Text>
      </View>

      {items.map(item => (
        <VocabCardWrapper
          key={item.id}
          item={item}
          isPhrase={isPhrase}
          showPinyin={showPinyin}
          avatarId={avatarId}
        />
      ))}
    </View>
  );
}

function VocabCardWrapper({ item, isPhrase, showPinyin, avatarId }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <VocabCard
      item={item}
      isPhrase={isPhrase}
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(v => !v)}
      showPinyin={showPinyin}
      avatarId={avatarId}
      completedBadge={false}
    />
  );
}

function VocabCard({ item, isPhrase, isExpanded, onToggle, showPinyin, avatarId, completedBadge }) {
  return (
    <TouchableOpacity
      style={[styles.card, isPhrase && styles.cardPhrase, completedBadge && styles.cardCompleted]}
      onPress={onToggle}
      activeOpacity={0.75}
    >
      <View style={styles.cardMain}>
        <View style={styles.cardLeft}>
          <Text
            style={[styles.chinese, isPhrase && styles.chinesePhrase]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
          >
            {item.chinese}
          </Text>
          {showPinyin && item.pinyin ? (
            <Text style={styles.pinyin} numberOfLines={1}>
              {item.pinyin}
            </Text>
          ) : null}
        </View>

        <View style={styles.cardRight}>
          <Text style={styles.english} numberOfLines={2}>
            {item.english}
          </Text>
          <View style={styles.cardRightBottom}>
            {item.part_of_speech ? (
              <Text style={[styles.pos, item.part_of_speech === 'phrase' && styles.posPhrase]}>
                {item.part_of_speech}
              </Text>
            ) : null}
            {completedBadge ? (
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>&#x2713;</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {isExpanded && (
        <View style={styles.details}>
          {!showPinyin && item.pinyin ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Pinyin:</Text>
              <Text style={[styles.detailValue, { color: WARM_ORANGE, fontStyle: 'italic' }]}>
                {item.pinyin}
              </Text>
            </View>
          ) : null}
          {item.example ? (
            <View style={styles.exampleBox}>
              <View style={styles.exampleHeader}>
                <Text style={styles.exampleChinese}>{item.example}</Text>
                <TouchableOpacity
                  style={styles.exampleAudioBtn}
                  onPress={(e) => { e.stopPropagation(); speakAsAvatar(item.example, avatarId); }}
                >
                  <Text style={styles.audioEmoji}>&#x1F50A;</Text>
                </TouchableOpacity>
              </View>
              {item.translation ? (
                <Text style={styles.exampleTranslation}>{item.translation}</Text>
              ) : null}
            </View>
          ) : null}
          <TouchableOpacity
            style={[styles.audioBtn, isPhrase && styles.audioBtnPhrase]}
            onPress={() => speakAsAvatar(item.chinese, avatarId)}
          >
            <Text style={styles.audioBtnText}>&#x1F50A; Play Word</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Palette & Styles
// ─────────────────────────────────────────────────────────────────────────────

const VG = {
  cardDark:    'rgba(255,255,255,0.92)',
  onCard:      DEEP_NAVY,
  onCardMuted: WARM_BROWN,
  gold:        WARM_BROWN,
  orange:      WARM_ORANGE,
  cream:       DEEP_NAVY,
  creamMuted:  SLATE_TEAL,
  border:      'rgba(155,104,70,0.20)',
};

const styles = StyleSheet.create({
  container: { marginBottom: 24 },

  // ── Read-only words view ───────────────────────────────────────────────────
  readOnlyList: { gap: 8, marginBottom: 8 },
  readOnlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.22)',
    gap: 10,
  },
  readOnlyChinese: { fontSize: 22, fontWeight: '800', color: DEEP_NAVY, minWidth: 48 },
  readOnlyMid:     { flex: 1 },
  readOnlyPinyin:  { fontSize: 12, color: WARM_ORANGE, fontStyle: 'italic', marginBottom: 1 },
  readOnlyEnglish: { fontSize: 13, fontWeight: '600', color: DEEP_NAVY },
  readOnlyCheck:   { fontSize: 16, color: SUCCESS, fontWeight: '800' },

  // ── Sequential flow ────────────────────────────────────────────────────────
  seqContainer: { marginBottom: 8 },

  progressRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  backBtn:      { paddingHorizontal: 6, paddingVertical: 2 },
  backBtnHidden:{ opacity: 0 },
  backBtnText:  { fontSize: 22, color: WARM_BROWN, fontWeight: '700', lineHeight: 26 },
  dotsRow:      { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  dot:          { width: 10, height: 10, borderRadius: 5 },
  dotFilled:    { backgroundColor: WARM_ORANGE },
  dotEmpty:     { backgroundColor: 'rgba(155,104,70,0.22)' },
  progressLabel: { fontSize: 12, fontWeight: '700', color: WARM_ORANGE },

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

  seqPanelOuter: { borderRadius: 16, overflow: 'hidden' },

  stepCard: {
    backgroundColor: VG.cardDark,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: VG.border,
    gap: 14,
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: SLATE_TEAL,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  mcqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  stepQuestion: {
    fontSize: 16,
    fontWeight: '700',
    color: DEEP_NAVY,
    lineHeight: 24,
  },

  // Word card step
  wordCardCenter: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  wordCardChinese: { fontSize: 45, fontWeight: '900', color: DEEP_NAVY },
  wordCardPinyin:  { fontSize: 20, fontWeight: '600', color: WARM_ORANGE, fontStyle: 'italic' },
  wordCardEnglish: { fontSize: 17, fontWeight: '600', color: DEEP_NAVY },
  posBadge: {
    backgroundColor: 'rgba(55,73,80,0.12)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 4,
  },
  posBadgeText: { fontSize: 12, color: SLATE_TEAL, fontWeight: '600' },

  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(224,176,75,0.14)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: 'rgba(224,176,75,0.3)',
  },
  playBtnText: { fontSize: 13, fontWeight: '700', color: WARM_BROWN },

  nextBtn: {
    backgroundColor: WARM_ORANGE,
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  nextBtnText: { fontSize: 13, fontWeight: '800', color: '#fff' },

  audioEmoji: { fontSize: 18 },

  // Audio exercise step
  audioCenter: { alignItems: 'center', gap: 8, paddingVertical: 12 },
  bigPlayBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(224,176,75,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(224,176,75,0.4)',
  },
  bigPlayEmoji: { fontSize: 32 },
  audioHint: { fontSize: 12, color: SLATE_TEAL },

  // Options
  optionsCol: { gap: 8 },
  optBtn: {
    backgroundColor: CARD_WHITE,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(55,73,80,0.18)',
  },
  optBtnCorrect: {
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: SUCCESS,
  },
  optBtnWrong: {
    backgroundColor: '#fde8e8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: ERROR,
  },
  optBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: DEEP_NAVY,
  },
  fbOptBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: DEEP_NAVY,
  },
  optPinyin: {
    fontSize: 11,
    color: SLATE_TEAL,
    fontStyle: 'italic',
    marginTop: 2,
  },

  // Fill-blank panel
  fbSentenceBox: {
    backgroundColor: CARD_WHITE,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(224,176,75,0.25)',
  },
  fbSentenceText: {
    fontSize: 22,
    fontWeight: '800',
    color: DEEP_NAVY,
    textAlign: 'center',
    lineHeight: 32,
  },
  fbBlank: {
    fontSize: 22,
    fontWeight: '900',
    color: WARM_ORANGE,
    textDecorationLine: 'underline',
  },
  fbPinyin: {
    fontSize: 13,
    color: WARM_ORANGE,
    fontStyle: 'italic',
    marginTop: 6,
    textAlign: 'center',
  },
  fbEnglish: {
    fontSize: 13,
    color: SLATE_TEAL,
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Completion card
  completionCard: {
    backgroundColor: VG.cardDark,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.35)',
    alignItems: 'center',
    gap: 8,
  },
  completionEmoji: { fontSize: 40 },
  completionTitle: { fontSize: 22, fontWeight: '900', color: DEEP_NAVY },
  completionSub:   { fontSize: 14, color: SLATE_TEAL, textAlign: 'center', lineHeight: 20 },
  summaryScroll:   { width: '100%', maxHeight: 260, marginTop: 12 },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(155,104,70,0.12)',
  },
  summaryChinese: { fontSize: 18, fontWeight: '800', color: DEEP_NAVY, width: 50 },
  summaryPinyin:  { fontSize: 12, color: WARM_ORANGE, fontStyle: 'italic', flex: 1 },
  summaryEnglish: { fontSize: 13, color: SLATE_TEAL, fontWeight: '600', flex: 1 },
  summaryTapHint: { fontSize: 16, color: WARM_BROWN, fontWeight: '600' },

  // Review modal
  reviewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28,42,68,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  reviewCard: {
    backgroundColor: CARD_WHITE,
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 10,
  },
  reviewClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0EDE8',
    borderRadius: 16,
  },
  reviewCloseText: { fontSize: 14, fontWeight: '700', color: DEEP_NAVY },
  reviewChinese:   { fontSize: 56, fontWeight: '900', color: DEEP_NAVY, marginTop: 8, marginBottom: 6 },
  reviewPinyin:    { fontSize: 20, color: WARM_ORANGE, fontStyle: 'italic', marginBottom: 8 },
  reviewEnglish:   { fontSize: 18, fontWeight: '700', color: DEEP_NAVY, textAlign: 'center', marginBottom: 8 },
  reviewPosBadge: {
    backgroundColor: '#F0EDE8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 16,
  },
  reviewPosBadgeText: { fontSize: 13, color: WARM_BROWN, fontWeight: '600' },
  reviewAudioBtn: {
    backgroundColor: DEEP_NAVY,
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginBottom: 18,
  },
  reviewAudioBtnText: { fontSize: 16, fontWeight: '700', color: CARD_WHITE },
  reviewExampleBox: {
    width: '100%',
    backgroundColor: '#F7F4F0',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  reviewExampleChinese: { fontSize: 17, fontWeight: '700', color: DEEP_NAVY, textAlign: 'center' },
  reviewExampleEnglish: { fontSize: 13, color: SLATE_TEAL, textAlign: 'center', fontStyle: 'italic' },

  // ── Phrase feed ────────────────────────────────────────────────────────────
  feedSection: { marginBottom: 16 },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: VG.border,
  },
  feedHeaderTitle: { fontSize: 17, fontWeight: '800', color: VG.cream },
  feedHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  feedHeaderCount: {
    fontSize: 12, fontWeight: '600', color: SLATE_TEAL,
    backgroundColor: 'rgba(55,73,80,0.12)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  feedHeaderChevron: { fontSize: 13, color: SLATE_TEAL },

  feedBody: { gap: 8, marginTop: 6 },

  feedDoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.22)',
    gap: 10,
  },
  feedDoneChinese: { fontSize: 16, fontWeight: '700', color: DEEP_NAVY },
  feedDonePinyin:  { fontSize: 11, color: WARM_ORANGE, fontStyle: 'italic' },
  feedDoneEnglish: { fontSize: 12, color: SLATE_TEAL },
  feedDoneCheck:   { fontSize: 18, color: SUCCESS, fontWeight: '800' },

  feedActiveCard: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.22)',
  },
  feedActiveChinese: { fontSize: 16, fontWeight: '700', color: DEEP_NAVY },
  feedActivePinyin:  { fontSize: 11, color: WARM_ORANGE, fontStyle: 'italic' },
  feedActiveEnglish: { fontSize: 12, color: SLATE_TEAL },

  feedActiveActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  feedPlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(224,176,75,0.14)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(224,176,75,0.3)',
  },
  feedPlayBtnText: { fontSize: 13, fontWeight: '700', color: WARM_BROWN },
  feedNextBtn: {
    backgroundColor: WARM_ORANGE,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 9,
    alignItems: 'center',
  },
  feedNextBtnText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  feedAllDone: {
    backgroundColor: 'rgba(76,175,80,0.12)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  feedAllDoneText: { fontSize: 13, fontWeight: '700', color: SUCCESS },

  // ── Fallback accordion ─────────────────────────────────────────────────────
  group: { marginBottom: 20 },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  groupTitle: { fontSize: 18, fontWeight: '800', color: VG.cream },
  groupCount: { fontSize: 13, fontWeight: '600', color: VG.creamMuted },

  card: {
    backgroundColor: VG.cardDark,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: VG.border,
  },
  cardPhrase: {
    borderColor: 'rgba(224,176,75,0.35)',
    backgroundColor: CARD_WHITE,
  },
  cardCompleted: {
    borderColor: 'rgba(76,175,80,0.40)',
  },

  cardMain: { flexDirection: 'row', alignItems: 'center' },
  cardLeft: { width: '42%', paddingRight: 8 },
  chinese: { fontSize: 24, fontWeight: '800', color: VG.cream, marginBottom: 2 },
  chinesePhrase: { fontSize: 20 },
  pinyin: { fontSize: 13, color: VG.orange, fontStyle: 'italic' },

  cardRight: { flex: 1, alignItems: 'flex-end', gap: 4 },
  cardRightBottom: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  completedBadge: {
    backgroundColor: SUCCESS,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBadgeText: { fontSize: 11, fontWeight: '900', color: '#fff' },
  english: {
    fontSize: 14,
    fontWeight: '600',
    color: VG.cream,
    marginBottom: 4,
    textAlign: 'right',
  },
  pos: {
    fontSize: 11,
    color: SLATE_TEAL,
    backgroundColor: 'rgba(55,73,80,0.14)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  posPhrase: {
    color: WARM_ORANGE,
    backgroundColor: 'rgba(155,104,70,0.15)',
  },

  details: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(55,73,80,0.15)',
  },
  detailRow: { flexDirection: 'row', marginBottom: 8 },
  detailLabel: { fontSize: 13, fontWeight: '600', color: VG.gold, marginRight: 8 },
  detailValue: { fontSize: 13, color: VG.cream, flex: 1 },

  exampleBox: {
    backgroundColor: 'rgba(247,240,232,0.95)',
    borderLeftWidth: 3,
    borderLeftColor: VG.gold,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  exampleChinese: {
    fontSize: 15,
    fontWeight: '600',
    color: VG.cream,
    flex: 1,
    marginRight: 8,
  },
  exampleAudioBtn: {
    backgroundColor: 'rgba(224,176,75,0.18)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  examplePinyin: {
    fontSize: 12,
    color: WARM_ORANGE,
    fontStyle: 'italic',
    marginTop: 1,
  },
  exampleTranslation: {
    fontSize: 13,
    color: VG.creamMuted,
    fontStyle: 'italic',
  },
  audioBtn: {
    backgroundColor: 'rgba(224,176,75,0.12)',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(224,176,75,0.3)',
  },
  audioBtnPhrase: {
    backgroundColor: 'rgba(244,197,66,0.1)',
    borderColor: 'rgba(244,197,66,0.3)',
  },
  audioBtnText: { fontSize: 14, fontWeight: '600', color: VG.gold },
});
