import React, { useState } from 'react';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import LessonDetailScreen from './screens/LessonDetailScreen';
import LevelQuizScreen from './screens/LevelQuizScreen';

const ALL_LEVEL_IDS = ['hsk1', 'hsk2', 'hsk3', 'hsk4', 'hsk5'];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('onboarding');
  const [userData, setUserData] = useState(null);
  const [currentLessonId, setCurrentLessonId] = useState(null);
  const [currentQuizLevelId, setCurrentQuizLevelId] = useState(null);
  const [levelState, setLevelState] = useState({
    unlockedLevels: ['hsk1'],
    completedLevels: [],
    levelSetBy: 'manual',   // 'manual' | 'test'
    levelChangedUsed: false, // one-time change for manual users
  });

  const handleOnboardingComplete = (data) => {
    const startLevel = data.result.recommendedLevel || 'hsk1';
    const startIdx = Math.max(ALL_LEVEL_IDS.indexOf(startLevel), 0);
    // Unlock all levels up to and including the starting level
    const unlockedLevels = ALL_LEVEL_IDS.slice(0, startIdx + 1);
    setUserData(data);
    setLevelState({
      unlockedLevels,
      completedLevels: [],
      levelSetBy: data.result.source || 'manual',
      levelChangedUsed: false,
    });
    setCurrentScreen('home');
  };

  const handleLessonPress = (lessonId) => {
    setCurrentLessonId(lessonId);
    setCurrentScreen('lesson');
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
    setCurrentLessonId(null);
    setCurrentQuizLevelId(null);
  };

  // Called when a manual-pick user confirms a level change (one-time only)
  const handleChangeLevelConfirm = (newLevelId) => {
    const startIdx = Math.max(ALL_LEVEL_IDS.indexOf(newLevelId), 0);
    const unlockedLevels = ALL_LEVEL_IDS.slice(0, startIdx + 1);
    setUserData(prev => ({
      ...prev,
      result: { ...prev.result, recommendedLevel: newLevelId },
    }));
    setLevelState(prev => ({
      ...prev,
      unlockedLevels,
      completedLevels: [],
      levelChangedUsed: true,
    }));
  };

  const handleRetakeTest = () => {
    // Keep userData so the age is preserved — OnboardingScreen will skip the age step
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

  // Called by LevelQuizScreen when the user finishes with a passing score (>=60%)
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
        onBack={handleBackToHome}
        onPlayGame={handlePlayGame}
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