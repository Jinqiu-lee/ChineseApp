import React, { useState } from 'react';
// CORRECT: screens folder is in root
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import LessonDetailScreen from './screens/LessonDetailScreen';
import LevelQuizScreen from './screens/LevelQuizScreen';

/**
 * Main App Component
 * Simple state-based navigation between screens
 */
export default function App() {
  // Navigation state
  const [currentScreen, setCurrentScreen] = useState('onboarding');
  const [userData, setUserData] = useState(null);
  const [currentLessonId, setCurrentLessonId] = useState(null);

  // ═══════════════════════════════════════════════════════════
  // NAVIGATION HANDLERS
  // ═══════════════════════════════════════════════════════════

  /**
   * Handle onboarding completion
   * Saves user data and navigates to home screen
   */
  const handleOnboardingComplete = (data) => {
    setUserData(data);
    setCurrentScreen('home');
  };

  /**
   * Navigate to lesson detail screen
   */
  const handleLessonPress = (lessonId) => {
    setCurrentLessonId(lessonId);
    setCurrentScreen('lesson');
  };

  /**
   * Navigate back to home screen
   */
  const handleBackToHome = () => {
    setCurrentScreen('home');
    setCurrentLessonId(null);
  };

  /**
   * Change level - go back to onboarding manual selection
   */
  const handleChangeLevel = () => {
    setCurrentScreen('onboarding');
    // Keep user data so age is preserved
  };

  /**
   * Retake placement test - restart onboarding completely
   */
  const handleRetakeTest = () => {
    setCurrentScreen('onboarding');
    setUserData(null); // Clear everything to start fresh
  };

  /**
   * Handle game navigation (placeholder)
   * TODO: Create game screens
   */
  const handlePlayGame = (gameType) => {
    console.log(`[Game] Navigate to: ${gameType}`);
    alert(`🎮 ${gameType.toUpperCase()}\n\nGame coming soon!`);
    // TODO: setCurrentScreen('game'); setCurrentGame(gameType);
  };

  /**
   * Handle lesson quiz navigation (placeholder)
   * TODO: Create quiz screen
   */
  const handleTakeQuiz = () => {
    console.log('[Quiz] Navigate to lesson quiz');
    alert('📝 Lesson Quiz\n\nQuiz screen coming soon!');
    // TODO: setCurrentScreen('quiz');
  };

  /**
   * Handle level final quiz navigation
   */
  const handleLevelQuizPress = () => {
    console.log('[Level Quiz] Navigate to level final quiz');
    setCurrentScreen('levelQuiz');
  };

  // ═══════════════════════════════════════════════════════════
  // SCREEN RENDERING
  // ═══════════════════════════════════════════════════════════

  // Show onboarding screen
  if (currentScreen === 'onboarding') {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  // Show home screen
  if (currentScreen === 'home') {
    return (
      <HomeScreen
        userData={userData}
        onLessonPress={handleLessonPress}
        onLevelQuizPress={handleLevelQuizPress}
        onChangeLevel={handleChangeLevel}
        onRetakeTest={handleRetakeTest}
      />
    );
  }

  // Show lesson detail screen
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

  // Show level quiz screen
  if (currentScreen === 'levelQuiz') {
    return (
      <LevelQuizScreen
        onBack={handleBackToHome}
        onComplete={() => {
          // When quiz is completed, could save results here
          handleBackToHome();
        }}
      />
    );
  }

  // Fallback (should never reach here)
  return null;
}