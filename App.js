import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import LessonDetailScreen from './screens/LessonDetailScreen';
import LevelQuizScreen from './screens/LevelQuizScreen';
import LessonStagesScreen from './screens/LessonStagesScreen';
import StageExercisesScreen from './screens/StageExercisesScreen';
import RoundCompleteScreen from './screens/RoundCompleteScreen';

// Lesson data (needed to pass to stage screens)
import lesson1 from './data/hsk1/hsk1_lesson_1.json';
import lesson2 from './data/hsk1/hsk1_lesson_2.json';
import lesson3 from './data/hsk1/hsk1_lesson_3.json';
import lesson4 from './data/hsk1/hsk1_lesson_4.json';
import lesson5 from './data/hsk1/hsk1_lesson_5.json';
import lesson6 from './data/hsk1/hsk1_lesson_6.json';
import lesson7 from './data/hsk1/hsk1_lesson_7.json';
import lesson8 from './data/hsk1/hsk1_lesson_8.json';

const LESSONS = { 1: lesson1, 2: lesson2, 3: lesson3, 4: lesson4, 5: lesson5, 6: lesson6, 7: lesson7, 8: lesson8 };

const ALL_LEVEL_IDS = ['hsk1', 'hsk2', 'hsk3', 'hsk4', 'hsk5'];

const STORAGE_KEYS = {
  userData:       '@chineseapp:userData',
  levelState:     '@chineseapp:levelState',
  lessonProgress: '@chineseapp:lessonProgress',
  stageProgress:  '@chineseapp:stageProgress',
  roundScores:    '@chineseapp:roundScores',
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

  // ── Load saved data on startup ──────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [savedUser, savedLevel, savedProgress, savedStageProgress, savedRoundScores] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.userData),
          AsyncStorage.getItem(STORAGE_KEYS.levelState),
          AsyncStorage.getItem(STORAGE_KEYS.lessonProgress),
          AsyncStorage.getItem(STORAGE_KEYS.stageProgress),
          AsyncStorage.getItem(STORAGE_KEYS.roundScores),
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
    handleBackToHome();
  };

  const handleBackToHome = () => {
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
    alert('📝 Lesson Quiz\n\nQuiz screen coming soon!');
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
    handleBackToHome();
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
  const currentLessonData = LESSONS[currentLessonId] || null;

  // Combined accuracy for rounds 1 + 2 (used by RoundCompleteScreen after round 2)
  const r1Score = roundScores[`${currentLessonLevelId}_${currentLessonId}_r1`] || { score: 0, total: 0 };
  const r2Score = roundScores[`${currentLessonLevelId}_${currentLessonId}_r2`] || { score: 0, total: 0 };
  const combinedTotal = r1Score.total + r2Score.total;
  const combinedAccuracy = combinedTotal > 0
    ? Math.round(((r1Score.score + r2Score.score) / combinedTotal) * 100)
    : 0;

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
        onLessonPress={handleLessonPress}
        onLevelQuizPress={handleLevelQuizPress}
        onChangeLevelConfirm={handleChangeLevelConfirm}
        onRetakeTest={handleRetakeTest}
      />
    );
  }

  if (currentScreen === 'lesson') {
    return (
      <LessonDetailScreen
        lessonId={currentLessonId}
        stageProgress={currentStageProgressArr}
        currentRound={currentRound}
        onBack={handleBackToHome}
        onLessonComplete={handleLessonComplete}
        onTakeQuiz={handleTakeQuiz}
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

  if (currentScreen === 'levelQuiz') {
    return (
      <LevelQuizScreen
        currentLevelId={currentQuizLevelId || userData?.result?.recommendedLevel || 'hsk1'}
        onBack={handleBackToHome}
        onComplete={handleLevelQuizComplete}
      />
    );
  }

  return null;
}

const splash = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center' },
});
