import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import LessonDetailScreen from './screens/LessonDetailScreen';
import LevelQuizScreen from './screens/LevelQuizScreen';
import LessonStagesScreen from './screens/LessonStagesScreen';
import StageExercisesScreen from './screens/StageExercisesScreen';

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
  const [stageProgress, setStageProgress] = useState({});  // { "hsk1_5": [0, 1, 2] }
  const [levelState, setLevelState] = useState(DEFAULT_LEVEL_STATE);

  // ── Load saved data on startup ──────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [savedUser, savedLevel, savedProgress, savedStageProgress] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.userData),
          AsyncStorage.getItem(STORAGE_KEYS.levelState),
          AsyncStorage.getItem(STORAGE_KEYS.lessonProgress),
          AsyncStorage.getItem(STORAGE_KEYS.stageProgress),
        ]);
        const parsedUser = savedUser ? JSON.parse(savedUser) : null;
        if (parsedUser) {
          setUserData(parsedUser);
          setCurrentScreen('home');
        }
        if (savedLevel)         setLevelState(JSON.parse(savedLevel));
        if (savedProgress)      setLessonProgress(JSON.parse(savedProgress));
        if (savedStageProgress) setStageProgress(JSON.parse(savedStageProgress));
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

  const handleStageComplete = (stageIndex) => {
    const key = `${currentLessonLevelId}_${currentLessonId}`;
    setStageProgress(prev => {
      const existing = prev[key] || [];
      if (existing.includes(stageIndex)) return prev;
      return { ...prev, [key]: [...existing, stageIndex].sort((a, b) => a - b) };
    });
    setCurrentScreen('lessonStages');
  };

  // ── Helper to get stage progress for current lesson ──────────
  const currentStageProgressKey = `${currentLessonLevelId}_${currentLessonId}`;
  const currentStageProgressArr = stageProgress[currentStageProgressKey] || [];
  const currentLessonData = LESSONS[currentLessonId] || null;

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
        onComplete={handleStageComplete}
        onBack={() => setCurrentScreen('lessonStages')}
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
