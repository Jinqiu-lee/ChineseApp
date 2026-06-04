import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

// ── Developer flag ───────────────────────────────────────────
// TODO: set to false before release
const DEV_UNLOCK_ALL = false;
import { logAvatarVoices } from './config/avatarVoices';
if (DEV_UNLOCK_ALL) logAvatarVoices();
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
import UnlockModal from './components/UnlockModal';
import RewardModal from './components/RewardModal';
import useProgress, { computeNewBadges } from './hooks/useProgress';
import BadgesScreen from './screens/BadgesScreen';
import PaywallScreen from './screens/PaywallScreen';
import { checkSubscriptionStatus } from './services/RevenueCatService';

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
import hsk3lesson1  from './data/hsk3/hsk3_lesson_1.json';
import hsk3lesson2  from './data/hsk3/hsk3_lesson_2.json';
import hsk3lesson3  from './data/hsk3/hsk3_lesson_3.json';
import hsk3lesson4  from './data/hsk3/hsk3_lesson_4.json';
import hsk3lesson5  from './data/hsk3/hsk3_lesson_5.json';
import hsk3lesson6  from './data/hsk3/hsk3_lesson_6.json';
import hsk3lesson7  from './data/hsk3/hsk3_lesson_7.json';
import hsk3lesson8  from './data/hsk3/hsk3_lesson_8.json';
import hsk3lesson9  from './data/hsk3/hsk3_lesson_9.json';
import hsk3lesson10 from './data/hsk3/hsk3_lesson_10.json';
import hsk3lesson11 from './data/hsk3/hsk3_lesson_11.json';
import hsk3lesson12 from './data/hsk3/hsk3_lesson_12.json';
import hsk3lesson13 from './data/hsk3/hsk3_lesson_13.json';
import hsk3lesson14 from './data/hsk3/hsk3_lesson_14.json';
import hsk3lesson15 from './data/hsk3/hsk3_lesson_15.json';
import hsk4lesson1  from './data/hsk4_level4/hsk4_lesson_1.json';
import hsk4lesson2  from './data/hsk4_level4/hsk4_lesson_2.json';
import hsk4lesson3  from './data/hsk4_level4/hsk4_lesson_3.json';
import hsk4lesson4  from './data/hsk4_level4/hsk4_lesson_4.json';
import hsk4lesson5  from './data/hsk4_level4/hsk4_lesson_5.json';
import hsk4lesson6  from './data/hsk4_level4/hsk4_lesson_6.json';
import hsk4lesson7  from './data/hsk4_level4/hsk4_lesson_7.json';
import hsk4lesson8  from './data/hsk4_level4/hsk4_lesson_8.json';
import hsk4lesson9  from './data/hsk4_level4/hsk4_lesson_9.json';
import hsk4lesson10 from './data/hsk4_level4/hsk4_lesson_10.json';
import hsk4lesson11 from './data/hsk4_level4/hsk4_lesson_11.json';
import hsk4lesson12 from './data/hsk4_level4/hsk4_lesson_12.json';
import hsk4lesson13 from './data/hsk4_level4/hsk4_lesson_13.json';
import hsk4lesson14 from './data/hsk4_level4/hsk4_lesson_14.json';
import hsk4lesson15 from './data/hsk4_level4/hsk4_lesson_15.json';
import hsk5lesson1  from './data/hsk4_level5/hsk5_lesson_1.json';
import hsk5lesson2  from './data/hsk4_level5/hsk5_lesson_2.json';
import hsk5lesson3  from './data/hsk4_level5/hsk5_lesson_3.json';
import hsk5lesson4  from './data/hsk4_level5/hsk5_lesson_4.json';
import hsk5lesson5  from './data/hsk4_level5/hsk5_lesson_5.json';
import hsk5lesson6  from './data/hsk4_level5/hsk5_lesson_6.json';
import hsk5lesson7  from './data/hsk4_level5/hsk5_lesson_7.json';
import hsk5lesson8  from './data/hsk4_level5/hsk5_lesson_8.json';
import hsk5lesson9  from './data/hsk4_level5/hsk5_lesson_9.json';
import hsk5lesson10 from './data/hsk4_level5/hsk5_lesson_10.json';
import hsk5lesson11 from './data/hsk4_level5/hsk5_lesson_11.json';
import hsk5lesson12 from './data/hsk4_level5/hsk5_lesson_12.json';
import hsk5lesson13 from './data/hsk4_level5/hsk5_lesson_13.json';
import hsk5lesson14 from './data/hsk4_level5/hsk5_lesson_14.json';
import hsk5lesson15 from './data/hsk4_level5/hsk5_lesson_15.json';

import hsk6lesson1  from './data/hsk6/hsk6_lesson_1.json';
import hsk6lesson2  from './data/hsk6/hsk6_lesson_2.json';
import hsk6lesson3  from './data/hsk6/hsk6_lesson_3.json';
import hsk6lesson4  from './data/hsk6/hsk6_lesson_4.json';
import hsk6lesson5  from './data/hsk6/hsk6_lesson_5.json';
import hsk6lesson6  from './data/hsk6/hsk6_lesson_6.json';
import hsk6lesson7  from './data/hsk6/hsk6_lesson_7.json';
import hsk6lesson8  from './data/hsk6/hsk6_lesson_8.json';
import hsk6lesson9  from './data/hsk6/hsk6_lesson_9.json';
import hsk6lesson10 from './data/hsk6/hsk6_lesson_10.json';
import hsk6lesson11 from './data/hsk6/hsk6_lesson_11.json';
import hsk6lesson12 from './data/hsk6/hsk6_lesson_12.json';
import hsk6lesson13 from './data/hsk6/hsk6_lesson_13.json';
import hsk6lesson14 from './data/hsk6/hsk6_lesson_14.json';

const LESSONS_BY_LEVEL = {
  hsk1: { 1: lesson1, 2: lesson2, 3: lesson3, 4: lesson4, 5: lesson5, 6: lesson6, 7: lesson7, 8: lesson8, 9: lesson9, 10: lesson10, 11: lesson11, 12: lesson12, 13: lesson13, 14: lesson14, 15: lesson15 },
  hsk2: { 1: hsk2lesson1, 2: hsk2lesson2, 3: hsk2lesson3, 4: hsk2lesson4, 5: hsk2lesson5, 6: hsk2lesson6, 7: hsk2lesson7, 8: hsk2lesson8, 9: hsk2lesson9, 10: hsk2lesson10, 11: hsk2lesson11, 12: hsk2lesson12, 13: hsk2lesson13, 14: hsk2lesson14, 15: hsk2lesson15 },
  hsk3: { 1: hsk3lesson1, 2: hsk3lesson2, 3: hsk3lesson3, 4: hsk3lesson4, 5: hsk3lesson5, 6: hsk3lesson6, 7: hsk3lesson7, 8: hsk3lesson8, 9: hsk3lesson9, 10: hsk3lesson10, 11: hsk3lesson11, 12: hsk3lesson12, 13: hsk3lesson13, 14: hsk3lesson14, 15: hsk3lesson15 },
  hsk4: { 1: hsk4lesson1, 2: hsk4lesson2, 3: hsk4lesson3, 4: hsk4lesson4, 5: hsk4lesson5, 6: hsk4lesson6, 7: hsk4lesson7, 8: hsk4lesson8, 9: hsk4lesson9, 10: hsk4lesson10, 11: hsk4lesson11, 12: hsk4lesson12, 13: hsk4lesson13, 14: hsk4lesson14, 15: hsk4lesson15 },
  hsk5: { 1: hsk5lesson1, 2: hsk5lesson2, 3: hsk5lesson3, 4: hsk5lesson4, 5: hsk5lesson5, 6: hsk5lesson6, 7: hsk5lesson7, 8: hsk5lesson8, 9: hsk5lesson9, 10: hsk5lesson10, 11: hsk5lesson11, 12: hsk5lesson12, 13: hsk5lesson13, 14: hsk5lesson14, 15: hsk5lesson15 },
  hsk6: { 1: hsk6lesson1, 2: hsk6lesson2, 3: hsk6lesson3, 4: hsk6lesson4, 5: hsk6lesson5, 6: hsk6lesson6, 7: hsk6lesson7, 8: hsk6lesson8, 9: hsk6lesson9, 10: hsk6lesson10, 11: hsk6lesson11, 12: hsk6lesson12, 13: hsk6lesson13, 14: hsk6lesson14 },
};
const LESSONS = LESSONS_BY_LEVEL.hsk1; // keep for backward compat

const ALL_LEVEL_IDS = ['hsk1', 'hsk2', 'hsk3', 'hsk4', 'hsk5', 'hsk6'];

const STORAGE_KEYS = {
  userData:           '@chineseapp:userData',
  levelState:         '@chineseapp:levelState',
  lessonProgress:     '@chineseapp:lessonProgress',
  stageProgress:      '@chineseapp:stageProgress',
  roundScores:        '@chineseapp:roundScores',
  pinyinQuizPassed:   '@chineseapp:pinyinQuizPassed',
  pinyinStageProgress:'@chineseapp:pinyinStageProgress',
  pinyinLearnDone:    '@chineseapp:pinyinLearnDone',
  quizPassedLessons:  '@chineseapp:quizPassedLessons',
  sectionProgress:    '@chineseapp:sectionProgress',
};

const DEFAULT_LEVEL_STATE = {
  unlockedLevels: ['hsk1', 'hsk2', 'hsk3', 'hsk4', 'hsk5', 'hsk6'],
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
  const [returnLessonId, setReturnLessonId] = useState(null); // which lesson to scroll to on back
  const [pinyinReturnTo, setPinyinReturnTo] = useState('home'); // 'home' | 'lessonPinyin'
  // Pinyin Learning System state
  const [currentPinyinLessonId, setCurrentPinyinLessonId] = useState(null);
  const [currentPinyinStageIndex, setCurrentPinyinStageIndex] = useState(null);
  const [pinyinQuizPassed, setPinyinQuizPassed] = useState([]);       // [1,2,3,...] lesson IDs passed
  const [pinyinStageProgress, setPinyinStageProgress] = useState({}); // { "pinyin_1": [0,1,2] }
  const [pinyinLearnDone, setPinyinLearnDone] = useState({});         // { "pinyin_1": true }
  const [quizPassedLessons, setQuizPassedLessons] = useState({});     // { "hsk1": [1,2,...], "hsk2": [...] }
  const [sectionProgress, setSectionProgress] = useState({});         // { "hsk1_5": { newwords: true, grammar: true, ... } }
  const [pinyinLessonInitialTab, setPinyinLessonInitialTab] = useState('learn');
  const [lessonInitialTab, setLessonInitialTab] = useState('learning');
  const [lessonInitialOpenSection, setLessonInitialOpenSection] = useState(null);
  const [unlockModal, setUnlockModal] = useState(null); // null | { title, message, primaryLabel, secondaryLabel, onPrimary, onSecondary }
  const [rewardModal, setRewardModal] = useState(null); // null | { xpEarned, scorePercent, stageIndex }
  const { awardXP, xp, streak, progress: xpProgress } = useProgress(); // xpProgress used for computeNewBadges snapshot
  const lastStageScoreRef = useRef({ score: 0, total: 0 });
  const shownPopups = useRef(new Set()); // tracks which unlock popups have fired this session

  // ── Load saved data on startup ──────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [savedUser, savedLevel, savedProgress, savedStageProgress, savedRoundScores, savedPinyinQuiz, savedPinyinStage, savedQuizPassedLessons, savedSectionProgress, savedPinyinLearnDone] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.userData),
          AsyncStorage.getItem(STORAGE_KEYS.levelState),
          AsyncStorage.getItem(STORAGE_KEYS.lessonProgress),
          AsyncStorage.getItem(STORAGE_KEYS.stageProgress),
          AsyncStorage.getItem(STORAGE_KEYS.roundScores),
          AsyncStorage.getItem(STORAGE_KEYS.pinyinQuizPassed),
          AsyncStorage.getItem(STORAGE_KEYS.pinyinStageProgress),
          AsyncStorage.getItem(STORAGE_KEYS.quizPassedLessons),
          AsyncStorage.getItem(STORAGE_KEYS.sectionProgress),
          AsyncStorage.getItem(STORAGE_KEYS.pinyinLearnDone),
        ]);
        const parsedUser = savedUser ? JSON.parse(savedUser) : null;
        if (parsedUser) {
          setUserData(parsedUser);
          setCurrentScreen('home');
        }
        if (savedLevel) {
          const parsed = JSON.parse(savedLevel);
          setLevelState({ ...parsed, unlockedLevels: ['hsk1', 'hsk2', 'hsk3', 'hsk4', 'hsk5', 'hsk6'] });
        }
        if (savedProgress)          setLessonProgress(JSON.parse(savedProgress));
        if (savedStageProgress)     setStageProgress(JSON.parse(savedStageProgress));
        if (savedRoundScores)       setRoundScores(JSON.parse(savedRoundScores));
        if (savedPinyinQuiz)        setPinyinQuizPassed(JSON.parse(savedPinyinQuiz));
        if (savedPinyinStage)       setPinyinStageProgress(JSON.parse(savedPinyinStage));
        if (savedQuizPassedLessons) setQuizPassedLessons(JSON.parse(savedQuizPassedLessons));
        if (savedSectionProgress)   setSectionProgress(JSON.parse(savedSectionProgress));
        if (savedPinyinLearnDone)   setPinyinLearnDone(JSON.parse(savedPinyinLearnDone));
      } catch (e) {
        console.warn('Failed to restore saved data:', e);
      } finally {
        setIsLoading(false);
        SplashScreen.hideAsync();
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

  useEffect(() => {
    if (isLoading) return;
    AsyncStorage.setItem(STORAGE_KEYS.pinyinLearnDone, JSON.stringify(pinyinLearnDone)).catch(console.warn);
  }, [pinyinLearnDone, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    AsyncStorage.setItem(STORAGE_KEYS.quizPassedLessons, JSON.stringify(quizPassedLessons)).catch(console.warn);
  }, [quizPassedLessons, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    AsyncStorage.setItem(STORAGE_KEYS.sectionProgress, JSON.stringify(sectionProgress)).catch(console.warn);
  }, [sectionProgress, isLoading]);

  // Auto-complete lesson when 2 practice rounds + quiz are done
  useEffect(() => {
    if (!currentLessonId || !currentLessonLevelId) return;
    const r2 = (stageProgress[`${currentLessonLevelId}_${currentLessonId}_r2`] || []).length >= 5;
    const quizPassed = (quizPassedLessons[currentLessonLevelId] || []).includes(currentLessonId);
    const alreadyDone = (lessonProgress[currentLessonLevelId] || []).includes(currentLessonId);
    if (r2 && quizPassed && !alreadyDone) {
      handleLessonComplete(currentLessonId);
    }
  }, [stageProgress, quizPassedLessons, currentLessonId, currentLessonLevelId]);

  // ── Splash while loading ─────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={splash.container}>
          <ActivityIndicator size="large" color="#a29bfe" />
        </View>
      </SafeAreaProvider>
    );
  }

  // ── Handlers ────────────────────────────────────────────────
  const handleOnboardingComplete = (data) => {
    const startLevel = data.result.recommendedLevel || 'hsk1';
    const startIdx = Math.max(ALL_LEVEL_IDS.indexOf(startLevel), 0);
    const extraIdx = data.result.unlockNext ? startIdx + 1 : startIdx;
    setUserData(data);
    setLevelState({
      unlockedLevels: ALL_LEVEL_IDS.slice(0, Math.min(extraIdx + 1, ALL_LEVEL_IDS.length)),
      completedLevels: [],
      levelSetBy: data.result.source || 'manual',
      levelChangedUsed: false,
    });
    setCurrentScreen('home');
  };

  const goToLesson = (tab = 'learning', openSection = null) => {
    setLessonInitialTab(tab);
    setLessonInitialOpenSection(openSection);
    setCurrentScreen('lesson');
  };

  const handleLessonPress = async (levelId, lessonId) => {
    if (lessonId > 3) {
      const subscribed = await checkSubscriptionStatus();
      if (!subscribed) {
        setCurrentLessonLevelId(levelId);
        setCurrentLessonId(lessonId);
        setCurrentScreen('paywall');
        return;
      }
    }
    setCurrentLessonLevelId(levelId);
    setCurrentLessonId(lessonId);
    const r1Done = (stageProgress[`${levelId}_${lessonId}_r1`] || []).length >= 5;
    const r2Done = (stageProgress[`${levelId}_${lessonId}_r2`] || []).length >= 5;
    setCurrentRound(r1Done && r2Done ? 3 : r1Done ? 2 : 1);
    goToLesson('learning');
  };

  const handleQuizPass = () => {
    const levelId = currentLessonLevelId;
    const lessonId = currentLessonId;
    if (!levelId || !lessonId) return;
    setQuizPassedLessons(prev => {
      const existing = prev[levelId] || [];
      if (existing.includes(lessonId)) return prev;
      return { ...prev, [levelId]: [...existing, lessonId] };
    });
  };

  const handleLessonComplete = (lessonId) => {
    const levelId = currentLessonLevelId;
    if (!levelId) { handleBackToHome(); return; }
    awardXP(50, levelId, lessonId, 1);
    setLessonProgress(prev => {
      const existing = prev[levelId] || [];
      if (existing.includes(lessonId)) return prev;
      return { ...prev, [levelId]: [...existing, lessonId] };
    });
    handleBackToHome(levelId);
  };

  const handleBackToHome = (levelId = null) => {
    setReturnLevelId(levelId);
    setReturnLessonId(currentLessonId);
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

  const handleResetProgress = () => {
    setUserData(null);
    setLevelState(DEFAULT_LEVEL_STATE);
    setLessonProgress({});
    setStageProgress({});
    setRoundScores({});
    setPinyinQuizPassed([]);
    setPinyinStageProgress({});
    setPinyinLearnDone({});
    setQuizPassedLessons({});
    setSectionProgress({});
    Object.values(STORAGE_KEYS).forEach(k => AsyncStorage.removeItem(k).catch(() => {}));
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

  const handlePinyinLearnComplete = () => {
    const key = `pinyin_${currentPinyinLessonId}`;
    setPinyinLearnDone(prev => ({ ...prev, [key]: true }));
    // Auto-navigate to Stage 1
    setCurrentPinyinStageIndex(0);
    setCurrentScreen('pinyinStage');
  };

  const handlePinyinStageComplete = (score, total) => {
    const key = `pinyin_${currentPinyinLessonId}`;
    const existingStages = pinyinStageProgress[key] || [];
    const stageIndex = currentPinyinStageIndex;
    const updatedStages = existingStages.includes(stageIndex)
      ? existingStages
      : [...existingStages, stageIndex];

    setPinyinStageProgress(prev => {
      const ex = prev[key] || [];
      if (ex.includes(stageIndex)) return prev;
      return { ...prev, [key]: [...ex, stageIndex] };
    });

    // Stage 1 done → auto-navigate to Stage 2
    if (stageIndex === 0) {
      setCurrentPinyinStageIndex(1);
      setCurrentScreen('pinyinStage');
      return;
    }

    // Stage 2 done → popup to go to Stages 3 & 4
    if (stageIndex === 1) {
      const popupKey = `${key}:stages12_done`;
      if (!shownPopups.current.has(popupKey)) {
        shownPopups.current.add(popupKey);
        setUnlockModal({
          title: 'Great Progress! 🎉',
          message: 'Stages 1 & 2 complete!\nReady to tackle Stages 3 & 4?',
          primaryLabel: 'Go to Stage 3 & 4',
          secondaryLabel: 'Continue Practice',
          onPrimary: () => {
            setUnlockModal(null);
            setCurrentPinyinStageIndex(2);
            setCurrentScreen('pinyinStage');
          },
          onSecondary: () => {
            setUnlockModal(null);
            setPinyinLessonInitialTab('practice');
            setCurrentScreen('pinyinLesson');
          },
        });
        return;
      }
    }

    // All 4 stages done → quiz popup
    if (updatedStages.length >= 4) {
      const popupKey = `${key}:all_stages_done`;
      if (!shownPopups.current.has(popupKey)) {
        shownPopups.current.add(popupKey);
        setUnlockModal({
          title: 'Quiz Unlocked! 🎯',
          message: 'All 4 stages complete!\nTake the Lesson Quiz to advance.',
          primaryLabel: 'Continue to Quiz',
          secondaryLabel: 'Later',
          onPrimary: () => {
            setUnlockModal(null);
            setCurrentScreen('pinyinLessonQuiz');
          },
          onSecondary: () => {
            setUnlockModal(null);
            setPinyinLessonInitialTab('practice');
            setCurrentScreen('pinyinLesson');
          },
        });
        return;
      }
      setPinyinLessonInitialTab('practice');
      setCurrentScreen('pinyinLesson');
      return;
    }

    setPinyinLessonInitialTab('practice');
    setCurrentScreen('pinyinLesson');
  };

  const handleOpenPinyinLinkedHSKLesson = () => {
    const lessonId = currentPinyinLessonId;
    setCurrentLessonLevelId('hsk1');
    setCurrentLessonId(lessonId);
    const r1Done = (stageProgress[`hsk1_${lessonId}_r1`] || []).length >= 5;
    const r2Done = (stageProgress[`hsk1_${lessonId}_r2`] || []).length >= 5;
    setCurrentRound(r1Done && r2Done ? 3 : r1Done ? 2 : 1);
    goToLesson('learning');
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
    if (DEV_UNLOCK_ALL || score >= 60) {
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

  // Marks the stage as complete and records the score — no navigation.
  // Called automatically when the user finishes the last exercise.
  const handleStageComplete = (stageIndex, score = 0, total = 0) => {
    const key = `${currentLessonLevelId}_${currentLessonId}_r${currentRound}`;
    lastStageScoreRef.current = { score, total };

    setRoundScores(prev => {
      const existing = prev[key] || { score: 0, total: 0 };
      return { ...prev, [key]: { score: existing.score + score, total: existing.total + total } };
    });

    const existingStages = stageProgress[key] || [];
    const newStages = existingStages.includes(stageIndex)
      ? existingStages
      : [...existingStages, stageIndex].sort((a, b) => a - b);
    setStageProgress(prev => ({ ...prev, [key]: newStages }));
  };

  // Decides where to go after the user taps "Continue" on the Stage Complete screen.
  // Runs after handleStageComplete has already updated stageProgress.
  const handleStageContinue = (stageIndex) => {
    const key = `${currentLessonLevelId}_${currentLessonId}_r${currentRound}`;
    const lessonKey = `${currentLessonLevelId}_${currentLessonId}`;

    // Recompute updated stages (guard against state not yet propagated)
    const existingStages = stageProgress[key] || [];
    const updatedStages = existingStages.includes(stageIndex)
      ? existingStages
      : [...existingStages, stageIndex].sort((a, b) => a - b);

    // All 5 done
    if (updatedStages.length >= 5) {
      // BEHAVIOR 3b: All stages done + dialogue not yet studied → Dialogue unlock popup
      const sd = sectionProgress[lessonKey] || {};
      if (currentRound === 1 && !DEV_UNLOCK_ALL && !sd.dialogue) {
        const popupKey = `${lessonKey}:dialogueunlock`;
        if (!shownPopups.current.has(popupKey)) {
          shownPopups.current.add(popupKey);
          setUnlockModal({
            title: 'Dialogue Unlocked!',
            message: 'Keep going — Dialogue is now available to study',
            primaryLabel: 'Go to Dialogue',
            secondaryLabel: 'Later',
            onPrimary: () => { setUnlockModal(null); goToLesson('learning', 'dialogue'); },
            onSecondary: () => { setUnlockModal(null); goToLesson('practice'); },
          });
          return;
        }
      }
      setCurrentScreen('roundComplete');
      return;
    }

    // BEHAVIOR 2 Step A: Stage 2 complete + grammar not done → "Keep Learning!" popup
    if (stageIndex === 1 && currentRound === 1 && !DEV_UNLOCK_ALL) {
      const sd = sectionProgress[lessonKey] || {};
      if (!sd.grammar) {
        const popupKey = `${lessonKey}:stage2_grammar`;
        if (!shownPopups.current.has(popupKey)) {
          shownPopups.current.add(popupKey);
          setUnlockModal({
            title: 'Keep Learning!',
            message: 'Complete Grammar to continue unlocking practice stages',
            primaryLabel: 'Go to Grammar',
            secondaryLabel: 'Later',
            onPrimary: () => { setUnlockModal(null); goToLesson('learning', 'grammar'); },
            onSecondary: () => { setUnlockModal(null); goToLesson('practice'); },
          });
          return;
        }
      }
    }

    // Check if the next stage is unlocked and not yet completed
    const nextIndex = stageIndex + 1;
    if (nextIndex < 5) {
      const sectionDone = sectionProgress[lessonKey] || {};
      let nextUnlocked = false;
      if (DEV_UNLOCK_ALL) {
        nextUnlocked = true;
      } else if (currentRound === 1) {
        nextUnlocked = (nextIndex === 0 || nextIndex === 1)
          ? !!sectionDone?.newwords
          : !!(sectionDone?.sentences && sectionDone?.grammar);
      } else {
        nextUnlocked = true; // Rounds 2/3: sequential
      }
      const nextCompleted = updatedStages.includes(nextIndex);
      if (nextUnlocked && !nextCompleted) {
        setCurrentStageIndex(nextIndex);
        setCurrentScreen('stageExercises');
        return;
      }
    }

    goToLesson('practice');
  };

  const handleSectionComplete = (sectionKey) => {
    const lessonKey = `${currentLessonLevelId}_${currentLessonId}`;
    const existing = sectionProgress[lessonKey] || {};

    setSectionProgress(prev => {
      const ex = prev[lessonKey] || {};
      if (ex[sectionKey]) return prev;
      return { ...prev, [lessonKey]: { ...ex, [sectionKey]: true } };
    });

    const newSections = { ...existing, [sectionKey]: true };

    // BEHAVIOR 1: New Words done → immediately navigate into Stage 1 (no popup)
    if (sectionKey === 'newwords' && !DEV_UNLOCK_ALL) {
      const stageKey = `${currentLessonLevelId}_${currentLessonId}_r${currentRound}`;
      if (!(stageProgress[stageKey] || []).includes(0)) {
        setCurrentStageIndex(0);
        setCurrentScreen('stageExercises');
        return;
      }
    }

    // BEHAVIOR 2 Step B: Grammar just done + sentences not yet done → "Almost There!" popup
    if (sectionKey === 'grammar' && currentRound === 1 && !DEV_UNLOCK_ALL && !existing.sentences) {
      const popupKey = `${lessonKey}:grammar_done`;
      if (!shownPopups.current.has(popupKey)) {
        shownPopups.current.add(popupKey);
        setUnlockModal({
          title: 'Almost There!',
          message: 'Now complete Sentences to unlock Stage 3, 4 and 5',
          primaryLabel: 'Go to Sentences',
          secondaryLabel: 'Later',
          onPrimary: () => { setUnlockModal(null); goToLesson('learning', 'phrases'); },
          onSecondary: () => setUnlockModal(null),
        });
        return;
      }
    }

    // BEHAVIOR 3a: Both grammar AND sentences now done for first time → Stage 3 unlock popup
    if (currentRound === 1 && !DEV_UNLOCK_ALL && newSections.grammar && newSections.sentences) {
      if (!(existing.grammar && existing.sentences)) {
        const popupKey = `${lessonKey}:stage3unlock`;
        if (!shownPopups.current.has(popupKey)) {
          const stageKey = `${currentLessonLevelId}_${currentLessonId}_r${currentRound}`;
          if (!(stageProgress[stageKey] || []).includes(2)) {
            shownPopups.current.add(popupKey);
            setUnlockModal({
              title: 'Stage 3 Unlocked!',
              message: 'Ready to continue your practice?',
              primaryLabel: 'Go to Stage 3',
              secondaryLabel: 'Later',
              onPrimary: () => {
                setUnlockModal(null);
                setCurrentStageIndex(2);
                setCurrentScreen('stageExercises');
              },
              onSecondary: () => setUnlockModal(null),
            });
            return;
          }
        }
      }
    }

    // BEHAVIOR 3c: All 4 sections done → Round 2 unlock popup
    if (!DEV_UNLOCK_ALL && newSections.newwords && newSections.grammar && newSections.sentences && newSections.dialogue) {
      const popupKey = `${lessonKey}:round2unlock`;
      if (!shownPopups.current.has(popupKey)) {
        shownPopups.current.add(popupKey);
        setUnlockModal({
          title: 'Round 2 Unlocked!',
          message: "You've mastered Round 1 — ready for the next round?",
          primaryLabel: 'Start Round 2',
          secondaryLabel: 'Later',
          onPrimary: () => {
            setUnlockModal(null);
            setCurrentRound(2);
            setCurrentStageIndex(0);
            setCurrentScreen('stageExercises');
          },
          onSecondary: () => setUnlockModal(null),
        });
      }
    }
  };

  const handleRoundAdvance = () => {
    if (currentRound === 1 && !DEV_UNLOCK_ALL) {
      const lessonKey = `${currentLessonLevelId}_${currentLessonId}`;
      const done = sectionProgress[lessonKey] || {};
      const sectionsComplete = ['newwords', 'sentences', 'grammar', 'dialogue'].filter(k => done[k]).length;
      if (sectionsComplete < 4) {
        Alert.alert(
          'Keep Learning!',
          'Complete New Words, Grammar, Sentences, and Dialogue in the Learning tab before advancing to Round 2.',
          [{ text: 'OK' }]
        );
        goToLesson('learning');
        return;
      }
    }
    setCurrentRound(prev => Math.min(prev + 1, 3));
    goToLesson('learning');
  };

  // ── Helper to get stage progress for current lesson & round ─────────────
  const currentStageProgressKey = `${currentLessonLevelId}_${currentLessonId}_r${currentRound}`;
  const currentStageProgressArr = stageProgress[currentStageProgressKey] || [];
  const currentLessonData = (LESSONS_BY_LEVEL[currentLessonLevelId] || LESSONS)[currentLessonId] || null;
  const currentLessonKey = `${currentLessonLevelId}_${currentLessonId}`;
  const currentSectionDone = sectionProgress[currentLessonKey] || {};
  const currentRound1Done = (stageProgress[`${currentLessonLevelId}_${currentLessonId}_r1`] || []).length >= 5;

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
  const quizUnlocked = DEV_UNLOCK_ALL || (r2Done && combinedAccuracy >= 90) || r3Done;
  const lessonQuizPassed = (quizPassedLessons[currentLessonLevelId] || []).includes(currentLessonId);
  const lessonAlreadyCompleted = (lessonProgress[currentLessonLevelId] || []).includes(currentLessonId);

  // ── Screen renderer ──────────────────────────────────────────
  const renderCurrentScreen = () => {
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
          returnLessonId={returnLessonId}
          onLessonPress={handleLessonPress}
          onLevelQuizPress={handleLevelQuizPress}
          onChangeLevelConfirm={handleChangeLevelConfirm}
          onRetakeTest={handleRetakeTest}
          onResetProgress={handleResetProgress}
          onAchievementsPress={() => setCurrentScreen('badges')}
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
          devUnlockAll={DEV_UNLOCK_ALL}
          r2Done={r2Done}
          lessonQuizPassed={lessonQuizPassed}
          lessonCompleted={lessonAlreadyCompleted}
          round1Done={currentRound1Done}
          sectionDone={currentSectionDone}
          initialTab={lessonInitialTab}
          initialOpenSection={lessonInitialOpenSection}
          onSectionComplete={handleSectionComplete}
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
          levelId={currentLessonLevelId}
          stageProgress={currentStageProgressArr}
          devUnlockAll={DEV_UNLOCK_ALL}
          currentRound={currentRound}
          sectionDone={currentSectionDone}
          onSelectStage={handleSelectStage}
          onBack={() => goToLesson('practice')}
        />
      );
    }
    if (currentScreen === 'stageExercises') {
      return (
        <StageExercisesScreen
          key={currentStageIndex}
          lessonData={currentLessonData}
          levelId={currentLessonLevelId}
          stageIndex={currentStageIndex}
          roundIndex={currentRound - 1}
          onComplete={handleStageComplete}
          onNext={(stageIndex) => {
            const { score, total } = lastStageScoreRef.current;
            const scorePercent = total > 0 ? score / total : 0;
            const newBadgesSnapshot = computeNewBadges(xpProgress, 20, currentLessonLevelId, currentLessonId, scorePercent);
            awardXP(20, currentLessonLevelId, currentLessonId, scorePercent);
            setRewardModal({ xpEarned: 20, scorePercent, stageIndex, newBadges: newBadgesSnapshot });
          }}
          onBack={() => goToLesson('practice')}
        />
      );
    }
    if (currentScreen === 'roundComplete') {
      const currentRoundScoreKey = `${currentLessonLevelId}_${currentLessonId}_r${currentRound}`;
      const currentRoundScore = roundScores[currentRoundScoreKey] || { score: 0, total: 0 };
      return (
        <RoundCompleteScreen
          currentRound={currentRound}
          levelId={currentLessonLevelId}
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
          levelId={currentLessonLevelId}
          onBack={() => goToLesson('practice')}
          onQuizPass={handleQuizPass}
        />
      );
    }
    if (currentScreen === 'lessonPinyin') {
      return (
        <LessonPinyinScreen
          lessonData={currentLessonData}
          onBack={() => goToLesson('learning')}
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
      const pinyinLearnKey = `pinyin_${currentPinyinLessonId}`;
      const hskLessonTopic = (LESSONS_BY_LEVEL.hsk1[currentPinyinLessonId] || {}).topic || '';
      return (
        <PinyinLessonScreen
          lessonData={pinyinLessonData}
          stageProgress={pinyinStageDone}
          quizPassed={pinyinQuizPassed2}
          learnDone={!!pinyinLearnDone[pinyinLearnKey]}
          initialTab={pinyinLessonInitialTab}
          hskLessonTopic={hskLessonTopic}
          onBack={() => setCurrentScreen('pinyinSystem')}
          onStartStage={handleStartPinyinStage}
          onLearnComplete={handlePinyinLearnComplete}
          onTakeQuiz={handleOpenPinyinLessonQuiz}
          onOpenHSKLesson={handleOpenPinyinLinkedHSKLesson}
        />
      );
    }
    if (currentScreen === 'pinyinStage') {
      const pinyinLessonData = PINYIN_LESSONS[currentPinyinLessonId];
      return (
        <PinyinStageScreen
          key={currentPinyinStageIndex}
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
    if (currentScreen === 'badges') {
      return <BadgesScreen onBack={() => setCurrentScreen('home')} />;
    }
    if (currentScreen === 'paywall') {
      return (
        <PaywallScreen
          onDismiss={() => {
            setCurrentLessonId(null);
            setCurrentLessonLevelId(null);
            setCurrentScreen('home');
          }}
          onSubscribed={() => {
            const levelId = currentLessonLevelId;
            const lessonId = currentLessonId;
            if (!levelId || !lessonId) { setCurrentScreen('home'); return; }
            const r1Done = (stageProgress[`${levelId}_${lessonId}_r1`] || []).length >= 5;
            const r2Done = (stageProgress[`${levelId}_${lessonId}_r2`] || []).length >= 5;
            setCurrentRound(r1Done && r2Done ? 3 : r1Done ? 2 : 1);
            goToLesson('learning');
          }}
        />
      );
    }
    return null;
  };

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        {renderCurrentScreen()}
        <UnlockModal
          visible={!!unlockModal}
          title={unlockModal?.title}
          message={unlockModal?.message}
          primaryLabel={unlockModal?.primaryLabel}
          secondaryLabel={unlockModal?.secondaryLabel}
          onPrimary={unlockModal?.onPrimary}
          onSecondary={unlockModal?.onSecondary}
        />
        <RewardModal
          visible={rewardModal !== null}
          xpEarned={rewardModal?.xpEarned || 0}
          scorePercent={rewardModal?.scorePercent || 0}
          totalXP={xp}
          newBadges={rewardModal?.newBadges || []}
          streak={streak}
          onClose={() => {
            const stageIndex = rewardModal?.stageIndex;
            setRewardModal(null);
            handleStageContinue(stageIndex);
          }}
          onBreak={() => {
            setRewardModal(null);
            setCurrentScreen('lessonStages');
          }}
        />
      </View>
    </SafeAreaProvider>
  );
}

const splash = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center' },
});
