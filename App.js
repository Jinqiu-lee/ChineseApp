import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import LessonDetailScreen from './screens/LessonDetailScreen';
import LevelQuizScreen from './screens/LevelQuizScreen';
import LessonQuizScreen from './screens/LessonQuizScreen';
import LessonPinyinScreen from './screens/LessonPinyinScreen';
import FoundationsPinyinScreen from './screens/FoundationsPinyinScreen';
import LessonStagesScreen from './screens/LessonStagesScreen';
import StageExercisesScreen from './screens/StageExercisesScreen';
import RoundCompleteScreen from './screens/RoundCompleteScreen';
import PinyinSystemScreen from './screens/PinyinSystemScreen';
import PinyinLessonScreen from './screens/PinyinLessonScreen';
import PinyinStageScreen from './screens/PinyinStageScreen';
import PinyinLessonQuizScreen from './screens/PinyinLessonQuizScreen';
import PinyinFinalQuizScreen from './screens/PinyinFinalQuizScreen';

// Pinyin lesson data
import pinyinLesson1  from './data/pinyin/pinyin_lesson_1.json';
import pinyinLesson2  from './data/pinyin/pinyin_lesson_2.json';
import pinyinLesson3  from './data/pinyin/pinyin_lesson_3.json';
import pinyinLesson4  from './data/pinyin/pinyin_lesson_4.json';
import pinyinLesson5  from './data/pinyin/pinyin_lesson_5.json';
import pinyinLesson6  from './data/pinyin/pinyin_lesson_6.json';
import pinyinLesson7  from './data/pinyin/pinyin_lesson_7.json';
import pinyinLesson8  from './data/pinyin/pinyin_lesson_8.json';
import pinyinLesson9  from './data/pinyin/pinyin_lesson_9.json';
import pinyinLesson10 from './data/pinyin/pinyin_lesson_10.json';

const PINYIN_LESSONS = {
  1: pinyinLesson1, 2: pinyinLesson2, 3: pinyinLesson3, 4: pinyinLesson4, 5: pinyinLesson5,
  6: pinyinLesson6, 7: pinyinLesson7, 8: pinyinLesson8, 9: pinyinLesson9, 10: pinyinLesson10,
};
const ALL_PINYIN_LESSONS = Object.values(PINYIN_LESSONS);

// Lesson data (needed to pass to stage screens)
import lesson1 from './data/hsk1/hsk1_lesson_1.json';
import lesson2 from './data/hsk1/hsk1_lesson_2.json';
import lesson3 from './data/hsk1/hsk1_lesson_3.json';
import lesson4 from './data/hsk1/hsk1_lesson_4.json';
import lesson5 from './data/hsk1/hsk1_lesson_5.json';
import lesson6 from './data/hsk1/hsk1_lesson_6.json';
import lesson7 from './data/hsk1/hsk1_lesson_7.json';
import lesson8 from './data/hsk1/hsk1_lesson_8.json';
import lesson9 from './data/hsk1/hsk1_lesson_9.json';
import lesson10 from './data/hsk1/hsk1_lesson_10.json';
import lesson11 from './data/hsk1/hsk1_lesson_11.json';
import lesson12 from './data/hsk1/hsk1_lesson_12.json';
import lesson13 from './data/hsk1/hsk1_lesson_13.json';
import lesson14 from './data/hsk1/hsk1_lesson_14.json';
import lesson15 from './data/hsk1/hsk1_lesson_15.json';
import hsk2lesson1 from './data/hsk2/hsk2_lesson_1.json';
import hsk2lesson2 from './data/hsk2/hsk2_lesson_2.json';
import hsk2lesson3 from './data/hsk2/hsk2_lesson_3.json';
import hsk2lesson4 from './data/hsk2/hsk2_lesson_4.json';
import hsk2lesson5 from './data/hsk2/hsk2_lesson_5.json';
import hsk2lesson6 from './data/hsk2/hsk2_lesson_6.json';
import hsk2lesson7 from './data/hsk2/hsk2_lesson_7.json';
import hsk2lesson8 from './data/hsk2/hsk2_lesson_8.json';
import hsk2lesson9 from './data/hsk2/hsk2_lesson_9.json';
import hsk2lesson10 from './data/hsk2/hsk2_lesson_10.json';
import hsk2lesson11 from './data/hsk2/hsk2_lesson_11.json';
import hsk2lesson12 from './data/hsk2/hsk2_lesson_12.json';
import hsk2lesson13 from './data/hsk2/hsk2_lesson_13.json';
import hsk2lesson14 from './data/hsk2/hsk2_lesson_14.json';
import hsk2lesson15 from './data/hsk2/hsk2_lesson_15.json';

const LESSONS_BY_LEVEL = {
  hsk1: { 1: lesson1, 2: lesson2, 3: lesson3, 4: lesson4, 5: lesson5, 6: lesson6, 7: lesson7, 8: lesson8, 9: lesson9, 10: lesson10, 11: lesson11, 12: lesson12, 13: lesson13, 14: lesson14, 15: lesson15 },
  hsk2: { 1: hsk2lesson1, 2: hsk2lesson2, 3: hsk2lesson3, 4: hsk2lesson4, 5: hsk2lesson5, 6: hsk2lesson6, 7: hsk2lesson7, 8: hsk2lesson8, 9: hsk2lesson9, 10: hsk2lesson10, 11: hsk2lesson11, 12: hsk2lesson12, 13: hsk2lesson13, 14: hsk2lesson14, 15: hsk2lesson15 },
};
const LESSONS = LESSONS_BY_LEVEL.hsk1; // keep for backward compat

const ALL_LEVEL_IDS = ['hsk1', 'hsk2', 'hsk3', 'hsk4', 'hsk5'];

const STORAGE_KEYS = {
  userData:           '@chineseapp:userData',
  levelState:         '@chineseapp:levelState',
  lessonProgress:     '@chineseapp:lessonProgress',
  stageProgress:      '@chineseapp:stageProgress',
  roundScores:        '@chineseapp:roundScores',
  pinyinQuizPassed:   '@chineseapp:pinyinQuizPassed',
  pinyinStageProgress:'@chineseapp:pinyinStageProgress',
};

const DEFAULT_LEVEL_STATE = {
  unlockedLevels: ['hsk1'],
  completedLevels: [],
  levelSetBy: 'manual',
  levelChangedUsed: false,
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('onboarding');
  const [userData, setUserData] = useState(null);
  const [currentLessonId, setCurrentLessonId] = useState(null);
  const [currentLessonLevelId, setCurrentLessonLevelId] = useState(null);
  const [currentQuizLevelId, setCurrentQuizLevelId] = useState(null);
  const [currentStageIndex, setCurrentStageIndex] = useState(null);
  const [lessonProgress, setLessonProgress] = useState({});
  const [stageProgress, setStageProgress] = useState({});  // { "hsk1_5_r1": [0,1,2] }
  const [roundScores, setRoundScores] = useState({});      // { "hsk1_5_r1": {score,total} }
  const [levelState, setLevelState] = useState(DEFAULT_LEVEL_STATE);
  const [currentRound, setCurrentRound] = useState(1);    // 1 | 2 | 3
  const [returnLevelId, setReturnLevelId] = useState(null); // which level list to return to on back
  const [pinyinReturnTo, setPinyinReturnTo] = useState('home'); // 'home' | 'lessonPinyin'
  // Pinyin Learning System state
  const [currentPinyinLessonId, setCurrentPinyinLessonId] = useState(null);
  const [currentPinyinStageIndex, setCurrentPinyinStageIndex] = useState(null);
  const [pinyinQuizPassed, setPinyinQuizPassed] = useState([]);       // [1,2,3,...] lesson IDs passed
  const [pinyinStageProgress, setPinyinStageProgress] = useState({}); // { "pinyin_1": [0,1,2] }
  const [pinyinLessonInitialTab, setPinyinLessonInitialTab] = useState('learn');

  // ── Load saved data on startup ──────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [savedUser, savedLevel, savedProgress, savedStageProgress, savedRoundScores, savedPinyinQuiz, savedPinyinStage] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.userData),
          AsyncStorage.getItem(STORAGE_KEYS.levelState),
          AsyncStorage.getItem(STORAGE_KEYS.lessonProgress),
          AsyncStorage.getItem(STORAGE_KEYS.stageProgress),
          AsyncStorage.getItem(STORAGE_KEYS.roundScores),
          AsyncStorage.getItem(STORAGE_KEYS.pinyinQuizPassed),
          AsyncStorage.getItem(STORAGE_KEYS.pinyinStageProgress),
        ]);
        const parsedUser = savedUser ? JSON.parse(savedUser) : null;
        if (parsedUser) {
          setUserData(parsedUser);
          setCurrentScreen('home');
        }
        if (savedLevel)         setLevelState(JSON.parse(savedLevel));
        if (savedProgress)      setLessonProgress(JSON.parse(savedProgress));
        if (savedStageProgress) setStageProgress(JSON.parse(savedStageProgress));
        if (savedRoundScores)   setRoundScores(JSON.parse(savedRoundScores));
        if (savedPinyinQuiz)    setPinyinQuizPassed(JSON.parse(savedPinyinQuiz));
        if (savedPinyinStage)   setPinyinStageProgress(JSON.parse(savedPinyinStage));
      } catch (e) {
        console.warn('Failed to restore saved data:', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // ── Persist whenever state changes ──────────────────────────
  useEffect(() => {
    if (isLoading) return;
    AsyncStorage.setItem(STORAGE_KEYS.userData, JSON.stringify(userData)).catch(console.warn);
  }, [userData, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    AsyncStorage.setItem(STORAGE_KEYS.levelState, JSON.stringify(levelState)).catch(console.warn);
  }, [levelState, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    AsyncStorage.setItem(STORAGE_KEYS.lessonProgress, JSON.stringify(lessonProgress)).catch(console.warn);
  }, [lessonProgress, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    AsyncStorage.setItem(STORAGE_KEYS.stageProgress, JSON.stringify(stageProgress)).catch(console.warn);
  }, [stageProgress, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    AsyncStorage.setItem(STORAGE_KEYS.roundScores, JSON.stringify(roundScores)).catch(console.warn);
  }, [roundScores, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    AsyncStorage.setItem(STORAGE_KEYS.pinyinQuizPassed, JSON.stringify(pinyinQuizPassed)).catch(console.warn);
  }, [pinyinQuizPassed, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    AsyncStorage.setItem(STORAGE_KEYS.pinyinStageProgress, JSON.stringify(pinyinStageProgress)).catch(console.warn);
  }, [pinyinStageProgress, isLoading]);

  // ── Splash while loading ─────────────────────────────────────
  if (isLoading) {
    return (
      <View style={splash.container}>
        <ActivityIndicator size="large" color="#a29bfe" />
      </View>
    );
  }

  // ── Handlers ────────────────────────────────────────────────
  const handleOnboardingComplete = (data) => {
    const startLevel = data.result.recommendedLevel || 'hsk1';
    const startIdx = Math.max(ALL_LEVEL_IDS.indexOf(startLevel), 0);
    setUserData(data);
    setLevelState({
      unlockedLevels: ALL_LEVEL_IDS.slice(0, startIdx + 1),
      completedLevels: [],
      levelSetBy: data.result.source || 'manual',
      levelChangedUsed: false,
    });
    setCurrentScreen('home');
  };

  const handleLessonPress = (levelId, lessonId) => {
    setCurrentLessonLevelId(levelId);
    setCurrentLessonId(lessonId);
    // Derive which round to show based on completed stage progress
    const r1Done = (stageProgress[`${levelId}_${lessonId}_r1`] || []).length >= 5;
    const r2Done = (stageProgress[`${levelId}_${lessonId}_r2`] || []).length >= 5;
    setCurrentRound(r1Done && r2Done ? 3 : r1Done ? 2 : 1);
    setCurrentScreen('lesson');
  };

  const handleLessonComplete = (lessonId) => {
    const levelId = currentLessonLevelId;
    if (!levelId) { handleBackToHome(); return; }
    setLessonProgress(prev => {
      const existing = prev[levelId] || [];
      if (existing.includes(lessonId)) return prev;
      return { ...prev, [levelId]: [...existing, lessonId] };
    });
    handleBackToHome(levelId);
  };

  const handleBackToHome = (levelId = null) => {
    setReturnLevelId(levelId);
    setCurrentScreen('home');
    setCurrentLessonId(null);
    setCurrentQuizLevelId(null);
    setCurrentStageIndex(null);
  };

  const handleChangeLevelConfirm = (newLevelId) => {
    const startIdx = Math.max(ALL_LEVEL_IDS.indexOf(newLevelId), 0);
    setUserData(prev => ({
      ...prev,
      result: { ...prev.result, recommendedLevel: newLevelId },
    }));
    setLevelState(prev => ({
      ...prev,
      unlockedLevels: ALL_LEVEL_IDS.slice(0, startIdx + 1),
      completedLevels: [],
      levelChangedUsed: true,
    }));
  };

  const handleRetakeTest = () => {
    setLevelState({ unlockedLevels: ['hsk1'], completedLevels: [], levelSetBy: 'manual', levelChangedUsed: false });
    setCurrentScreen('onboarding');
  };

  const handlePlayGame = (gameType) => {
    alert(`🎮 ${gameType.toUpperCase()}\n\nGame coming soon!`);
  };

  const handleTakeQuiz = () => {
    setCurrentScreen('lessonQuiz');
  };

  // ── Pinyin Learning System handlers ─────────────────────────
  const handleOpenPinyinSystem = () => {
    setCurrentScreen('pinyinSystem');
  };

  const handleSelectPinyinLesson = (lessonId) => {
    setCurrentPinyinLessonId(lessonId);
    setPinyinLessonInitialTab('learn');
    setCurrentScreen('pinyinLesson');
  };

  const handleStartPinyinStage = (stageIndex) => {
    setCurrentPinyinStageIndex(stageIndex);
    setCurrentScreen('pinyinStage');
  };

  const handlePinyinStageComplete = (score, total) => {
    const key = `pinyin_${currentPinyinLessonId}`;
    setPinyinStageProgress(prev => {
      const existing = prev[key] || [];
      const idx = currentPinyinStageIndex;
      if (existing.includes(idx)) return prev;
      return { ...prev, [key]: [...existing, idx] };
    });
    setPinyinLessonInitialTab('practice');
    setCurrentScreen('pinyinLesson');
  };

  const handleOpenPinyinLessonQuiz = () => {
    setCurrentScreen('pinyinLessonQuiz');
  };

  const handlePinyinQuizPass = () => {
    setPinyinQuizPassed(prev => {
      if (prev.includes(currentPinyinLessonId)) return prev;
      return [...prev, currentPinyinLessonId];
    });
    setCurrentScreen('pinyinSystem');
  };

  const handlePinyinFinalQuiz = () => {
    setCurrentScreen('pinyinFinalQuiz');
  };

  const handleOpenLessonPinyin = () => {
    setCurrentScreen('lessonPinyin');
  };

  const handleOpenFoundationsPinyin = (returnTo = 'home') => {
    setPinyinReturnTo(returnTo);
    setCurrentScreen('foundationsPinyin');
  };

  const handleBackFromFoundationsPinyin = () => {
    if (pinyinReturnTo === 'lessonPinyin') {
      setCurrentScreen('lessonPinyin');
    } else {
      handleBackToHome();
    }
  };

  const handleLevelQuizPress = (levelId) => {
    setCurrentQuizLevelId(levelId || userData?.result?.recommendedLevel || 'hsk1');
    setCurrentScreen('levelQuiz');
  };

  const handleLevelQuizComplete = (score) => {
    const levelId = currentQuizLevelId || userData?.result?.recommendedLevel || 'hsk1';
    if (score >= 60) {
      const idx = ALL_LEVEL_IDS.indexOf(levelId);
      const nextLevel = idx >= 0 && idx < ALL_LEVEL_IDS.length - 1 ? ALL_LEVEL_IDS[idx + 1] : null;
      setLevelState(prev => ({
        ...prev,
        completedLevels: [...new Set([...prev.completedLevels, levelId])],
        unlockedLevels: nextLevel && !prev.unlockedLevels.includes(nextLevel)
          ? [...prev.unlockedLevels, nextLevel]
          : prev.unlockedLevels,
      }));
    }
    handleBackToHome(levelId);
  };

  // ── Stage navigation handlers ────────────────────────────────
  const handleStartPractice = () => {
    setCurrentScreen('lessonStages');
  };

  const handleSelectStage = (stageIndex) => {
    setCurrentStageIndex(stageIndex);
    setCurrentScreen('stageExercises');
  };

  const handleStageComplete = (stageIndex, score = 0, total = 0) => {
    const key = `${currentLessonLevelId}_${currentLessonId}_r${currentRound}`;

    // Accumulate round score
    setRoundScores(prev => {
      const existing = prev[key] || { score: 0, total: 0 };
      return { ...prev, [key]: { score: existing.score + score, total: existing.total + total } };
    });

    // Update stage completion and compute new progress inline (avoids stale state)
    const existingStages = stageProgress[key] || [];
    const newStages = existingStages.includes(stageIndex)
      ? existingStages
      : [...existingStages, stageIndex].sort((a, b) => a - b);
    setStageProgress(prev => ({ ...prev, [key]: newStages }));

    // All 5 stages done → show round complete screen
    if (newStages.length >= 5) {
      setCurrentScreen('roundComplete');
    } else {
      setCurrentScreen('lesson');
    }
  };

  const handleRoundAdvance = () => {
    setCurrentRound(prev => Math.min(prev + 1, 3));
    setCurrentScreen('lesson');
  };

  // ── Helper to get stage progress for current lesson & round ─────────────
  const currentStageProgressKey = `${currentLessonLevelId}_${currentLessonId}_r${currentRound}`;
  const currentStageProgressArr = stageProgress[currentStageProgressKey] || [];
  const currentLessonData = (LESSONS_BY_LEVEL[currentLessonLevelId] || LESSONS)[currentLessonId] || null;

  // Combined accuracy for rounds 1 + 2 (used by RoundCompleteScreen after round 2)
  const r1Score = roundScores[`${currentLessonLevelId}_${currentLessonId}_r1`] || { score: 0, total: 0 };
  const r2Score = roundScores[`${currentLessonLevelId}_${currentLessonId}_r2`] || { score: 0, total: 0 };
  const combinedTotal = r1Score.total + r2Score.total;
  const combinedAccuracy = combinedTotal > 0
    ? Math.round(((r1Score.score + r2Score.score) / combinedTotal) * 100)
    : 0;

  // Quiz unlocked when: Round 2 all done + ≥90% combined accuracy, OR Round 3 all done
  const r2Done = (stageProgress[`${currentLessonLevelId}_${currentLessonId}_r2`] || []).length >= 5;
  const r3Done = (stageProgress[`${currentLessonLevelId}_${currentLessonId}_r3`] || []).length >= 5;
  const quizUnlocked = (r2Done && combinedAccuracy >= 90) || r3Done;

  // ── Screens ──────────────────────────────────────────────────
  if (currentScreen === 'onboarding') {
    return (
      <OnboardingScreen
        onComplete={handleOnboardingComplete}
        initialAge={userData?.age}
        onCancel={userData ? handleBackToHome : null}
      />
    );
  }

  if (currentScreen === 'home') {
    return (
      <HomeScreen
        userData={userData}
        levelState={levelState}
        lessonProgress={lessonProgress}
        returnLevelId={returnLevelId}
        onLessonPress={handleLessonPress}
        onLevelQuizPress={handleLevelQuizPress}
        onChangeLevelConfirm={handleChangeLevelConfirm}
        onRetakeTest={handleRetakeTest}
        onFoundationsPinyinPress={() => handleOpenFoundationsPinyin('home')}
      />
    );
  }

  if (currentScreen === 'lesson') {
    return (
      <LessonDetailScreen
        lessonId={currentLessonId}
        levelId={currentLessonLevelId}
        stageProgress={currentStageProgressArr}
        currentRound={currentRound}
        quizUnlocked={quizUnlocked}
        onBack={() => handleBackToHome(currentLessonLevelId)}
        onLessonComplete={handleLessonComplete}
        onTakeQuiz={handleTakeQuiz}
        onOpenPinyin={handleOpenLessonPinyin}
        onSelectStage={handleSelectStage}
      />
    );
  }

  if (currentScreen === 'lessonStages') {
    return (
      <LessonStagesScreen
        lessonData={currentLessonData}
        stageProgress={currentStageProgressArr}
        onSelectStage={handleSelectStage}
        onBack={() => setCurrentScreen('lesson')}
      />
    );
  }

  if (currentScreen === 'stageExercises') {
    return (
      <StageExercisesScreen
        lessonData={currentLessonData}
        stageIndex={currentStageIndex}
        roundIndex={currentRound - 1}
        onComplete={handleStageComplete}
        onBack={() => setCurrentScreen('lesson')}
      />
    );
  }

  if (currentScreen === 'roundComplete') {
    const currentRoundScoreKey = `${currentLessonLevelId}_${currentLessonId}_r${currentRound}`;
    const currentRoundScore = roundScores[currentRoundScoreKey] || { score: 0, total: 0 };
    return (
      <RoundCompleteScreen
        currentRound={currentRound}
        roundScore={currentRoundScore}
        combinedAccuracy={combinedAccuracy}
        onContinue={handleRoundAdvance}
        onTakeQuiz={handleTakeQuiz}
      />
    );
  }

  if (currentScreen === 'lessonQuiz') {
    return (
      <LessonQuizScreen
        lessonData={currentLessonData}
        onBack={() => setCurrentScreen('lesson')}
      />
    );
  }

  if (currentScreen === 'lessonPinyin') {
    return (
      <LessonPinyinScreen
        lessonData={currentLessonData}
        onBack={() => setCurrentScreen('lesson')}
        onOpenFoundations={() => handleOpenFoundationsPinyin('lessonPinyin')}
      />
    );
  }

  if (currentScreen === 'foundationsPinyin') {
    return (
      <FoundationsPinyinScreen
        onBack={handleBackFromFoundationsPinyin}
        lessonContext={pinyinReturnTo === 'lessonPinyin' ? currentLessonData : null}
        onOpenPinyinSystem={handleOpenPinyinSystem}
      />
    );
  }

  if (currentScreen === 'pinyinSystem') {
    return (
      <PinyinSystemScreen
        onBack={() => setCurrentScreen('foundationsPinyin')}
        onSelectLesson={handleSelectPinyinLesson}
        onFinalQuiz={handlePinyinFinalQuiz}
        quizPassedLessons={pinyinQuizPassed}
        pinyinStageProgress={pinyinStageProgress}
      />
    );
  }

  if (currentScreen === 'pinyinLesson') {
    const pinyinLessonData  = PINYIN_LESSONS[currentPinyinLessonId];
    const pinyinStageKey    = `pinyin_${currentPinyinLessonId}`;
    const pinyinStageDone   = pinyinStageProgress[pinyinStageKey] || [];
    const pinyinQuizPassed2 = pinyinQuizPassed.includes(currentPinyinLessonId);
    return (
      <PinyinLessonScreen
        lessonData={pinyinLessonData}
        stageProgress={pinyinStageDone}
        quizPassed={pinyinQuizPassed2}
        initialTab={pinyinLessonInitialTab}
        onBack={() => setCurrentScreen('pinyinSystem')}
        onStartStage={handleStartPinyinStage}
        onTakeQuiz={handleOpenPinyinLessonQuiz}
      />
    );
  }

  if (currentScreen === 'pinyinStage') {
    const pinyinLessonData = PINYIN_LESSONS[currentPinyinLessonId];
    return (
      <PinyinStageScreen
        lessonData={pinyinLessonData}
        stageIndex={currentPinyinStageIndex}
        onComplete={handlePinyinStageComplete}
        onBack={() => setCurrentScreen('pinyinLesson')}
      />
    );
  }

  if (currentScreen === 'pinyinLessonQuiz') {
    const pinyinLessonData = PINYIN_LESSONS[currentPinyinLessonId];
    return (
      <PinyinLessonQuizScreen
        lessonData={pinyinLessonData}
        onPass={handlePinyinQuizPass}
        onFail={() => setCurrentScreen('pinyinLesson')}
        onBack={() => setCurrentScreen('pinyinLesson')}
      />
    );
  }

  if (currentScreen === 'pinyinFinalQuiz') {
    return (
      <PinyinFinalQuizScreen
        allLessons={ALL_PINYIN_LESSONS}
        onBack={() => setCurrentScreen('pinyinSystem')}
      />
    );
  }

  if (currentScreen === 'levelQuiz') {
    return (
      <LevelQuizScreen
        currentLevelId={currentQuizLevelId || userData?.result?.recommendedLevel || 'hsk1'}
        onBack={() => handleBackToHome(currentQuizLevelId)}
        onComplete={handleLevelQuizComplete}
      />
    );
  }

  return null;
}

const splash = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center' },
});
