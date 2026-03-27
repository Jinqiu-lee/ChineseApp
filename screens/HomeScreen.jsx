import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Modal, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfettiCannon from 'react-native-confetti-cannon';
import LevelChangeModal from '../components/LevelChangeModal';
import AvatarCharacter from '../components/AvatarCharacter';
import AvatarPicker from '../components/AvatarPicker';
import useProgress from '../hooks/useProgress';

const LEVEL_CONFIG = [
  { id: 'hsk1', number: 1, emoji: '🌻', title: 'Sunflower Fields',    subtitle: 'HSK 1', color: '#F4C542' },
  { id: 'hsk2', number: 2, emoji: '☕', title: 'Café Terrace',        subtitle: 'HSK 2', color: '#E8B84B' },
  { id: 'hsk3', number: 3, emoji: '🌾', title: 'Wheat Fields',        subtitle: 'HSK 3', color: '#8DBF6E' },
  { id: 'hsk4', number: 4, emoji: '🏡', title: 'Homes & Villages',    subtitle: 'HSK 4', color: '#C4703A' },
  { id: 'hsk5', number: 5, emoji: '🌌', title: 'Starry Night',        subtitle: 'HSK 5', color: '#7BA7D4' },
  { id: 'hsk6', number: 6, emoji: '🌼', title: 'Irises in Bloom',     subtitle: 'HSK 6', color: '#A87DC8' },
];

const LEVEL_WORD_DATA = {
  hsk1: { totalWords: 150, wordsPerLesson: 19 },
  hsk2: { totalWords: 300, wordsPerLesson: 30 },
  hsk3: { totalWords: 600, wordsPerLesson: 60 },
  hsk4: { totalWords: 900, wordsPerLesson: 0 },
  hsk5: { totalWords: 1200, wordsPerLesson: 0 },
};

const UNLOCK_QUESTS = {
  hsk2: { emoji: '🗺️', title: "Explorer's Quest", desc: "Complete all 8 HSK1 lessons and pass the Level Quiz with 60%+ to unlock this realm. Your adventure continues!" },
  hsk3: { emoji: '⚔️', title: "Adventurer's Challenge", desc: "Brave traveler! Finish all 15 HSK2 lessons and conquer the Level Quiz to push deeper into uncharted territory!" },
  hsk4: { emoji: '🏰', title: "Warrior's Trial", desc: "A fortress awaits! Master all 5 HSK3 lessons and ace the Level Quiz to storm the castle of the Confident Speaker!" },
  hsk5: { emoji: '🔥', title: "Champion's Gauntlet", desc: "Legendary challenge! Complete all HSK4 lessons and defeat the Level Quiz to claim the title of Communicator!" },
  hsk6: { emoji: '🌟', title: 'The Legendary Realm', desc: "The ultimate realm is being forged! Keep conquering the earlier levels to prepare for the greatest challenge. Coming soon!" },
};

const LESSONS_BY_LEVEL = {
  hsk1: [
    { id: 1,  title: 'Greetings & Introductions', topic_chinese: '你好！' },
    { id: 2,  title: 'Numbers & Age',             topic_chinese: '你多大？' },
    { id: 3,  title: 'Time & Date',               topic_chinese: '今天几号？' },
    { id: 4,  title: 'Family Members',            topic_chinese: '我的家' },
    { id: 5,  title: 'Food & Drinks',             topic_chinese: '吃什么？' },
    { id: 6,  title: 'Shopping & Money',          topic_chinese: '多少钱？' },
    { id: 7,  title: 'Locations & Directions',    topic_chinese: '在哪儿？' },
    { id: 8,  title: 'Daily Activities',          topic_chinese: '你做什么？' },
    { id: 9,  title: 'Making Friends',            topic_chinese: '认识朋友' },
    { id: 10, title: 'Weather',                   topic_chinese: '天气怎么样' },
    { id: 11, title: 'Telling Time',              topic_chinese: '现在几点' },
    { id: 12, title: 'Ability & Animals',         topic_chinese: '我能做什么' },
    { id: 13, title: 'Home & Things',             topic_chinese: '家里有什么' },
    { id: 14, title: 'Completed Actions',         topic_chinese: '买了什么' },
    { id: 15, title: 'Getting Around',            topic_chinese: '怎么去' },
  ],
  hsk2: [
    { id: 1,  title: 'Travel & Activities 1',        topic_chinese: '旅游与活动（一）' },
    { id: 2,  title: 'Daily Routines',               topic_chinese: '日常生活' },
    { id: 3,  title: 'Directions',                   topic_chinese: '方向与位置' },
    { id: 4,  title: 'Work',                         topic_chinese: '工作' },
    { id: 5,  title: 'Shopping & Activities 2',      topic_chinese: '购物与活动（二）' },
    { id: 6,  title: 'Food & Health',                topic_chinese: '饮食与健康' },
    { id: 7,  title: 'Commuting & Transportation',   topic_chinese: '通勤与交通' },
    { id: 8,  title: 'Social Life 1',                topic_chinese: '社交生活（一）' },
    { id: 9,  title: 'Hobby & Free Time',            topic_chinese: '爱好与休闲' },
    { id: 10, title: 'Family Time',                  topic_chinese: '家庭时光' },
    { id: 11, title: 'Leisure Time 1',               topic_chinese: '休闲时光（一）' },
    { id: 12, title: 'Weather & Social 2',           topic_chinese: '天气与社交（二）' },
    { id: 13, title: 'Appearances & Emotions',       topic_chinese: '外貌与情感' },
    { id: 14, title: 'Movie & Leisure 2',            topic_chinese: '电影与休闲（二）' },
    { id: 15, title: 'New Year!',                    topic_chinese: '新年快乐！' },
  ],
  hsk3: [
    { id: 1,  title: 'Plans & Weekend',             topic_chinese: '周末你有什么计划' },
    { id: 2,  title: 'Timing & Return',             topic_chinese: '他什么时候回来' },
    { id: 3,  title: 'Location & Things',           topic_chinese: '桌子上放着哪些饮料' },
    { id: 4,  title: 'Social Behaviour',            topic_chinese: '她总是爱管闲事儿' },
    { id: 5,  title: 'Health & Lifestyle',          topic_chinese: '你越来越胖了' },
    { id: 6,  title: 'Possibility & Doubt',         topic_chinese: '怎么忽然找不到了' },
    { id: 7,  title: 'Time & Relationships',        topic_chinese: '我已经认识五年了' },
    { id: 8,  title: 'Conditions & Decisions',      topic_chinese: '你去哪儿我就跟去哪儿' },
    { id: 9,  title: 'Comparison & Compliments',    topic_chinese: '她的汉语说得像中国人一样好' },
    { id: 10, title: 'Study & Subjects',            topic_chinese: '数学比历史难多了' },
    { id: 11, title: 'Home & Reminders',            topic_chinese: '别忘了把空调关了' },
    { id: 12, title: 'The Bǎ & Bèi Sentences',     topic_chinese: '把重要的东西放在我这儿' },
    { id: 13, title: 'Transport & 是...的',          topic_chinese: '我是走回来的' },
    { id: 14, title: 'Directional Complements',     topic_chinese: '请把水果拿过来' },
    { id: 15, title: 'General Expressions',         topic_chinese: '其他都还行没问题' },
  ],
  hsk4: [
    { id: 1,  title: 'Love & Romance',              topic_chinese: '简单的爱情' },
    { id: 2,  title: 'Friendship & Trust',          topic_chinese: '真正的朋友' },
    { id: 3,  title: 'Communication & Expressions', topic_chinese: '表达与交流' },
    { id: 4,  title: 'Work & Career',               topic_chinese: '职业与成功' },
    { id: 5,  title: 'Money & Finance',             topic_chinese: '金钱与理财' },
    { id: 6,  title: 'Smart Shopping',              topic_chinese: '买对的，不买贵的' },
    { id: 7,  title: 'Quality & Standards',         topic_chinese: '一分价一分货' },
    { id: 8,  title: 'Health & Medicine',           topic_chinese: '最好的医生是自己' },
    { id: 9,  title: 'Lifestyle & Habits',          topic_chinese: '养成好习惯' },
    { id: 10, title: 'Nature & Environment',        topic_chinese: '生活中不乏美景' },
    { id: 11, title: 'Weather & Change',            topic_chinese: '阳光总在风雨后（一）' },
    { id: 12, title: 'Perseverance & Achievement',  topic_chinese: '坚持就是胜利' },
    { id: 13, title: 'Happiness & Contentment',     topic_chinese: '幸福的标准（一）' },
    { id: 14, title: 'Society & Values',            topic_chinese: '社会与责任' },
    { id: 15, title: 'Culture, Arts & Idioms',      topic_chinese: '中国文化与艺术' },
  ],
  hsk5: [
    { id: 1,  title: 'Travel & Transportation', topic_chinese: '旅行与交通' },
    { id: 2,  title: 'Education & Learning',    topic_chinese: '教育与学习' },
    { id: 3,  title: 'Media & Technology',      topic_chinese: '媒体与科技' },
    { id: 4,  title: 'Food & Cuisine',          topic_chinese: '饮食与美食' },
    { id: 5,  title: 'Sports & Fitness',        topic_chinese: '体育与健身' },
    { id: 6,  title: 'Law & Rights',            topic_chinese: '法律与权利' },
    { id: 7,  title: 'Business & Economy',      topic_chinese: '商业与经济' },
    { id: 8,  title: 'Family & Relationships',  topic_chinese: '家庭与人际关系' },
    { id: 9,  title: 'Language & Communication',topic_chinese: '语言与交流' },
    { id: 10, title: 'Urban Life',              topic_chinese: '城市生活' },
    { id: 11, title: 'Arts & Culture',          topic_chinese: '艺术与文化' },
    { id: 12, title: 'Character & Personality', topic_chinese: '性格与品质' },
    { id: 13, title: 'Health & Medicine',       topic_chinese: '健康与医疗' },
    { id: 14, title: 'Time & Life Stages',      topic_chinese: '时间与人生阶段' },
    { id: 15, title: 'Achievement & Success',   topic_chinese: '成就与成功' },
  ],
};

export default function HomeScreen({
  userData,
  levelState,
  lessonProgress,
  returnLevelId = null,
  onLessonPress,
  onLevelQuizPress,
  onChangeLevelConfirm,
  onRetakeTest,
  onFoundationsPinyinPress,
}) {
  const { xp, streak } = useProgress();

  const [showMenu, setShowMenu] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(
    () => returnLevelId ? LEVEL_CONFIG.find(l => l.id === returnLevelId) ?? null : null
  );
  const [showLevelChangeModal, setShowLevelChangeModal] = useState(false);
  const [foundationModal, setFoundationModal] = useState(null); // 'pinyin' | 'characters' | null
  const [avatarId, setAvatarId] = useState('eileen');

  const confettiRef = useRef(null);
  const avatarBounce = useRef(new Animated.Value(1)).current;
  const prevStreakRef = useRef(streak);

  // Fire confetti + bounce when streak increases
  useEffect(() => {
    if (streak > prevStreakRef.current) {
      confettiRef.current?.start();
      Animated.sequence([
        Animated.spring(avatarBounce, { toValue: 1.25, useNativeDriver: true }),
        Animated.spring(avatarBounce, { toValue: 0.92, useNativeDriver: true }),
        Animated.spring(avatarBounce, { toValue: 1.08, useNativeDriver: true }),
        Animated.spring(avatarBounce, { toValue: 1.0,  useNativeDriver: true }),
      ]).start();
    }
    prevStreakRef.current = streak;
  }, [streak]);

  useEffect(() => {
    AsyncStorage.getItem('avatarId').then(val => { if (val) setAvatarId(val); }).catch(() => {});
  }, []);

  const handleSelectAvatar = (id) => {
    setAvatarId(id);
    AsyncStorage.setItem('avatarId', id).catch(() => {});
  };

  // Daily encouraging message — rotates by day of week, one per avatar personality
  const DAILY_MESSAGES = {
    eileen: [
      "Some stories are worth telling twice\u2026 start yours again today.",
      "Perhaps learning is the only thing that truly stays with us.",
      "A little melancholy, a little beauty \u2014 that\u2019s a good study day.",
      "Words, once learned, become a part of you forever.",
      "The world outside is rushing. In here, take your time.",
      "Something about today feels like it\u2019s meant for quiet learning.",
      "Even half a lesson is more than none at all.",
    ],
    libai: [
      "The moon is bright \u2014 perfect for learning something new! \uD83C\uDF15",
      "A thousand miles begin with one character. Let\u2019s go!",
      "Wine and poetry can wait \u2014 first, one more lesson! \uD83C\uDF77",
      "Even rivers flow one wave at a time. Study on!",
      "The mountains don\u2019t rush, and neither do we. But we do study! \u26F0\uFE0F",
      "Stars appear one by one \u2014 like the words you\u2019re learning. \u2728",
      "Today the wind is good. A fine day for adventure and Chinese!",
    ],
    luxun: [
      "The only way forward is through the work.",
      "Others complain about difficulty. You just study.",
      "Reality doesn\u2019t wait. Neither should you.",
      "No lesson is wasted, even if it feels that way.",
      "Progress is quiet. Excuses are loud.",
      "You studied yesterday. That\u2019s the only reason to study again today.",
      "The path is made by walking it. Keep walking.",
    ],
    dante: [
      "Through knowledge, we ascend. Begin today\u2019s lesson.",
      "Every great journey starts with a single purposeful step.",
      "The structured mind learns well. Be structured.",
      "Wisdom is built lesson by lesson. Do not skip a day.",
      "What you learn today becomes the guide for tomorrow.",
      "In the pursuit of mastery, there are no shortcuts \u2014 only steps.",
      "Your future self will thank you for the discipline you show today.",
    ],
    camus: [
      "You don\u2019t need a reason to learn. Showing up is enough.",
      "One lesson. That\u2019s all. Then the rest takes care of itself.",
      "Life is uncertain. Your progress, however, is in your hands.",
      "There is quiet freedom in choosing to study today.",
      "Small and steady. That\u2019s all it takes.",
      "Today feels like a good day to understand one more thing.",
      "The habit of learning is itself a kind of happiness.",
    ],
    jane: [
      "It is a truth universally acknowledged \u2014 study is better with a good mood!",
      "A little effort today makes for a very elegant tomorrow. \u2615",
      "Practice makes perfect, and perfection makes for wonderful conversation.",
      "What a fine occasion to impress oneself with one\u2019s own progress!",
      "One does not simply skip a lesson without at least a twinge of guilt.",
      "Today\u2019s lesson is the foundation of tomorrow\u2019s wit. Shall we begin?",
      "Even the best parties are improved by someone who speaks Chinese. \uD83C\uDF89",
    ],
  };

  const todayMessage = (() => {
    const day = new Date().getDay(); // 0 (Sun) – 6 (Sat)
    const msgs = DAILY_MESSAGES[avatarId] || DAILY_MESSAGES.eileen;
    return msgs[day];
  })();

  const FOUNDATION_CONTENT = {
    pinyin: {
      emoji: '🔊',
      title: 'Pinyin – Master Chinese Sounds',
      tagline: 'Unlock the sound system of Chinese! 🎧',
      body: 'Learn Pinyin, tones, and pronunciation so you can read and say Chinese words correctly. Train your ears and voice to sound like a real Chinese speaker!',
      color: '#54A0FF',
      bullets: [
        { icon: '🎵', text: 'Four tones & pronunciation rules' },
        { icon: '🔤', text: 'Initials, finals, and combinations' },
        { icon: '👂', text: 'Listening & speaking practice' },
        { icon: '📖', text: 'Read any Chinese word with Pinyin' },
      ],
    },
    characters: {
      emoji: '✍️',
      title: 'Chinese Characters – Discover the Writing System',
      tagline: 'Explore the world of Chinese characters! ✨',
      body: 'Learn strokes, radicals, and basic characters step by step. Start reading and writing the building blocks of Chinese.',
      color: '#1DD1A1',
      bullets: [
        { icon: '✏️', text: 'Stroke order & writing technique' },
        { icon: '🧩', text: 'Radicals — the building blocks' },
        { icon: '📝', text: 'Basic high-frequency characters' },
        { icon: '🔍', text: 'Character recognition & meaning' },
      ],
    },
  };

  const { result } = userData;
  const currentLevelConfig =
    LEVEL_CONFIG.find(l => l.id === result.recommendedLevel) || LEVEL_CONFIG[0];

  const isHsk3Plus = currentLevelConfig.number >= 3;

  const handlePinyinSection = () => {
    setShowMenu(false);
    if (isHsk3Plus) {
      Alert.alert(
        '🔊 Pinyin – HSK 1 & 2',
        "You've already reached HSK 3! Pinyin is designed for beginners at HSK 1–2 level.\n\nAt your level, focus on Chinese Characters to strengthen your reading and writing skills.",
        [
          { text: 'Go to Characters', onPress: () => setFoundationModal('characters'), style: 'default' },
          { text: 'Open Pinyin Anyway', onPress: () => { if (onFoundationsPinyinPress) onFoundationsPinyinPress(); }, style: 'cancel' },
        ]
      );
    } else {
      if (onFoundationsPinyinPress) onFoundationsPinyinPress();
    }
  };

  const handleCharactersSection = () => {
    setShowMenu(false);
    setFoundationModal('characters');
  };

  const canChangeLevel = levelState.levelSetBy === 'manual' && !levelState.levelChangedUsed;

  const handleLevelPress = (level) => {
    if (level.id === 'hsk6') {
      alert('🎓 Level 6: Advanced\n\nThis advanced level is coming soon!\nKeep working through the earlier levels. 加油！');
      return;
    }
    const isLocked = !levelState.unlockedLevels.includes(level.id);
    if (isLocked) {
      const quest = UNLOCK_QUESTS[level.id];
      if (quest) {
        alert(`${quest.emoji} ${quest.title}\n\n${quest.desc}`);
      } else {
        alert(`${level.emoji} Level ${level.number}: ${level.title}\n\nComplete the previous level quiz with 60%+ to unlock!`);
      }
      return;
    }
    setSelectedLevel(level);
  };

  const handleChangeLevelConfirm = (newLevelId) => {
    onChangeLevelConfirm(newLevelId);
    setShowLevelChangeModal(false);
  };

  // ── Level lessons view ──────────────────────────────────────────
  if (selectedLevel) {
    const lessons = LESSONS_BY_LEVEL[selectedLevel.id] || [];
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" />

        <View style={styles.topHeader}>
          <TouchableOpacity style={styles.menuButton} onPress={() => setSelectedLevel(null)}>
            <Text style={styles.menuIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.appTitle}>{selectedLevel.emoji} Level {selectedLevel.number}</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={[styles.levelDetailBadge, { backgroundColor: selectedLevel.color + '22', borderColor: selectedLevel.color }]}>
            <Text style={styles.levelDetailEmoji}>{selectedLevel.emoji}</Text>
            <View>
              <Text style={[styles.levelDetailTitle, { color: selectedLevel.color }]}>
                Level {selectedLevel.number}: {selectedLevel.title}
              </Text>
              <Text style={styles.levelDetailSubtitle}>{selectedLevel.subtitle}</Text>
            </View>
          </View>

          {/* Progress bar */}
          {(() => {
            const completed = (lessonProgress[selectedLevel.id] || []).length;
            const total = lessons.length;
            const wordData = LEVEL_WORD_DATA[selectedLevel.id];
            const pct = total > 0 ? completed / total : 0;
            const wordsLearned = wordData ? completed * wordData.wordsPerLesson : 0;
            return total > 0 ? (
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressTitle}>{selectedLevel.subtitle} Progress</Text>
                  <Text style={[styles.progressCount, { color: selectedLevel.color }]}>{completed}/{total} lessons</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${pct * 100}%`, backgroundColor: selectedLevel.color }]} />
                </View>
                {wordData && (
                  <Text style={styles.progressWords}>
                    {wordsLearned} / {wordData.totalWords} words learned
                  </Text>
                )}
              </View>
            ) : null;
          })()}

          <View style={styles.lessonsSection}>
            <Text style={styles.sectionTitle}>📚 Lessons</Text>
            {lessons.map((lesson) => {
              const isDone = (lessonProgress[selectedLevel.id] || []).includes(lesson.id);
              return (
              <TouchableOpacity
                key={lesson.id}
                style={[styles.lessonCard, isDone && styles.lessonCardDone]}
                onPress={() => onLessonPress(selectedLevel.id, lesson.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.lessonNumber, { backgroundColor: selectedLevel.color + '33' }]}>
                  <Text style={[styles.lessonNumberText, { color: selectedLevel.color }]}>{lesson.id}</Text>
                </View>
                <View style={styles.lessonInfo}>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  <Text style={styles.lessonChinese}>{lesson.topic_chinese}</Text>
                </View>
                <Text style={[styles.lessonArrow, isDone && { color: '#1DD1A1' }]}>
                  {isDone ? '✓' : '→'}
                </Text>
              </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.quizSection}>
            <TouchableOpacity
              style={[styles.quizCard, { borderColor: selectedLevel.color }]}
              onPress={() => onLevelQuizPress(selectedLevel.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.quizEmoji}>🏆</Text>
              <View style={styles.quizInfo}>
                <Text style={styles.quizTitle}>Level Final Quiz</Text>
                <Text style={styles.quizDesc}>Test your knowledge · 30 questions</Text>
              </View>
              <Text style={[styles.quizArrow, { color: selectedLevel.color }]}>→</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Hub view ────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setShowMenu(true)}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.appTitle}>Chinese Learning</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

        {/* Greeting + current level */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>你好！Hello!</Text>
            <Text style={styles.subtitle}>Ready to learn Chinese?</Text>
          </View>
          <View style={[styles.levelBadge, { backgroundColor: currentLevelConfig.color + '22', borderColor: currentLevelConfig.color }]}>
            <Text style={styles.levelBadgeEmoji}>{currentLevelConfig.emoji}</Text>
            <Text style={[styles.levelBadgeText, { color: currentLevelConfig.color }]}>
              Lv {currentLevelConfig.number}
            </Text>
          </View>
        </View>

        {/* Avatar + Picker */}
        <View style={styles.avatarSection}>
          <Animated.View style={{ transform: [{ scale: avatarBounce }] }}>
            <AvatarCharacter avatarId={avatarId} expression="idle" size={160} />
          </Animated.View>

          {/* Daily message */}
          <View style={styles.avatarMessageBubble}>
            <Text style={styles.avatarMessageText}>{todayMessage}</Text>
          </View>

          {/* Streak + XP row */}
          <View style={styles.statsRow}>
            <View style={styles.statBadge}>
              <Text style={styles.statBadgeIcon}>🔥</Text>
              <Text style={styles.statBadgeValue}>{streak}</Text>
              <Text style={styles.statBadgeLabel}>day streak</Text>
            </View>
            <View style={[styles.statBadge, styles.statBadgeXP]}>
              <Text style={styles.statBadgeIcon}>⭐</Text>
              <Text style={styles.statBadgeValue}>{xp}</Text>
              <Text style={styles.statBadgeLabel}>XP</Text>
            </View>
          </View>

          <AvatarPicker selectedId={avatarId} onSelect={handleSelectAvatar} />
        </View>

        {/* Confetti — fires on streak increase */}
        <ConfettiCannon
          ref={confettiRef}
          count={80}
          origin={{ x: 200, y: 0 }}
          autoStart={false}
          fadeOut
        />

        {/* Chinese Foundations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📖 Chinese Foundations</Text>
          <View style={styles.foundationsRow}>
            {/* Pinyin card — dimmed for HSK3+ */}
            <TouchableOpacity
              style={[styles.foundationCard, isHsk3Plus && styles.foundationCardDimmed]}
              onPress={handlePinyinSection}
              activeOpacity={0.8}
            >
              <Text style={[styles.foundationEmoji, isHsk3Plus && styles.foundationEmojiDimmed]}>🔊</Text>
              <Text style={[styles.foundationTitle, isHsk3Plus && styles.foundationTitleDimmed]}>Pinyin</Text>
              <Text style={[styles.foundationSubtitle, isHsk3Plus && styles.foundationSubtitleDimmed]}>Sound System</Text>
              {isHsk3Plus && <Text style={styles.foundationLevelTag}>HSK 1–2</Text>}
            </TouchableOpacity>
            {/* Characters card — highlighted for HSK3+ */}
            <TouchableOpacity
              style={[styles.foundationCard, isHsk3Plus && styles.foundationCardHighlighted]}
              onPress={handleCharactersSection}
              activeOpacity={0.8}
            >
              <Text style={styles.foundationEmoji}>✍️</Text>
              <Text style={styles.foundationTitle}>Characters</Text>
              <Text style={styles.foundationSubtitle}>Writing System</Text>
              {isHsk3Plus && <Text style={styles.foundationRecommendedTag}>Recommended ✦</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {/* Chinese Journey path */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗺 Chinese Journey</Text>
          {LEVEL_CONFIG.map((level, index) => {
            const isCurrent = level.id === result.recommendedLevel;
            const isComingSoon = level.id === 'hsk6';
            const isLocked = isComingSoon || !levelState.unlockedLevels.includes(level.id);
            const isCompleted = levelState.completedLevels.includes(level.id);
            const isLast = index === LEVEL_CONFIG.length - 1;
            const dotColor = isCompleted ? '#1DD1A1' : isLocked ? '#2d3436' : level.color;

            return (
              <View key={level.id} style={styles.pathRow}>
                {/* Left connector */}
                <View style={styles.pathConnectorCol}>
                  <View style={[styles.pathDot, { backgroundColor: dotColor, borderColor: dotColor }]}>
                    {isCompleted && <Text style={styles.pathDotCheck}>✓</Text>}
                    {isCurrent && !isCompleted && <View style={[styles.pathDotInner, { backgroundColor: level.color }]} />}
                  </View>
                  {!isLast && <View style={[styles.pathLine, { backgroundColor: isCompleted ? '#1DD1A1' : '#2d3436' }]} />}
                </View>

                {/* Card */}
                <TouchableOpacity
                  style={[
                    styles.pathCard,
                    isCurrent && { backgroundColor: level.color + '15', borderColor: level.color },
                    isCompleted && { borderColor: '#1DD1A1' + '88' },
                  ]}
                  onPress={() => handleLevelPress(level)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pathEmoji, isLocked && !isComingSoon && styles.dimmed]}>{level.emoji}</Text>
                  <View style={styles.pathInfo}>
                    <Text style={[styles.pathLevelNum, { color: isLocked ? '#636e72' : level.color }]}>
                      Level {level.number}
                    </Text>
                    <Text style={[styles.pathTitle, isLocked && !isComingSoon && styles.dimmed]}>{level.title}</Text>
                  </View>
                  <View style={styles.pathStatusCol}>
                    {isCurrent && !isCompleted && (
                      <Text style={[styles.pathCurrentLabel, { color: level.color }]}>← Your level</Text>
                    )}
                    {isCompleted && <Text style={styles.pathCompletedLabel}>✓ Done</Text>}
                    {isComingSoon && <Text style={styles.pathSoonLabel}>Soon</Text>}
                    {isLocked && !isComingSoon && <Text style={styles.pathLockIcon}>🔒</Text>}
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Menu Modal */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuPanel}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuHeaderText}>Menu</Text>
              <TouchableOpacity onPress={() => setShowMenu(false)}>
                <Text style={styles.menuClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.menuLevelCard, { borderColor: currentLevelConfig.color }]}>
              <Text style={styles.menuLevelEmoji}>{currentLevelConfig.emoji}</Text>
              <View>
                <Text style={styles.menuLevelLabel}>Current Level</Text>
                <Text style={[styles.menuLevelText, { color: currentLevelConfig.color }]}>
                  Level {currentLevelConfig.number}: {currentLevelConfig.title}
                </Text>
              </View>
            </View>

            <View style={styles.menuSectionHeader}>
              <Text style={styles.menuSectionTitle}>📖 Learning Tools</Text>
            </View>

            <TouchableOpacity style={[styles.menuItem, isHsk3Plus && styles.menuItemDimmed]} onPress={handlePinyinSection}>
              <Text style={styles.menuItemEmoji}>🔊</Text>
              <View style={styles.menuItemTextContainer}>
                <Text style={[styles.menuItemText, isHsk3Plus && styles.menuItemTextDimmed]}>Pinyin Learning</Text>
                <Text style={styles.menuItemSubtext}>{isHsk3Plus ? 'HSK 1–2 · Beginner level' : 'Tones & Pronunciation'}</Text>
              </View>
              <Text style={styles.menuItemArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, isHsk3Plus && styles.menuItemHighlighted]} onPress={handleCharactersSection}>
              <Text style={styles.menuItemEmoji}>✍️</Text>
              <View style={styles.menuItemTextContainer}>
                <Text style={styles.menuItemText}>Chinese Characters</Text>
                <Text style={styles.menuItemSubtext}>{isHsk3Plus ? 'Recommended for HSK 3+' : 'Stroke Order & Radicals'}</Text>
              </View>
              <Text style={styles.menuItemArrow}>→</Text>
            </TouchableOpacity>

            <View style={styles.menuSectionHeader}>
              <Text style={styles.menuSectionTitle}>⚙️ Settings</Text>
            </View>

            {levelState.levelSetBy === 'manual' && (
              <TouchableOpacity
                style={[styles.menuItem, levelState.levelChangedUsed && styles.menuItemDisabled]}
                onPress={() => {
                  if (levelState.levelChangedUsed) return;
                  setShowMenu(false);
                  setShowLevelChangeModal(true);
                }}
              >
                <Text style={styles.menuItemEmoji}>🔄</Text>
                <View style={styles.menuItemTextContainer}>
                  <Text style={[styles.menuItemText, levelState.levelChangedUsed && styles.menuItemTextDisabled]}>
                    Change Level
                  </Text>
                  {levelState.levelChangedUsed && (
                    <Text style={styles.menuItemSubtext}>Already used (one-time only)</Text>
                  )}
                </View>
                {!levelState.levelChangedUsed && <Text style={styles.menuItemArrow}>→</Text>}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { setShowMenu(false); onRetakeTest(); }}
            >
              <Text style={styles.menuItemEmoji}>📝</Text>
              <View style={styles.menuItemTextContainer}>
                <Text style={styles.menuItemText}>Retake Placement Test</Text>
              </View>
              <Text style={styles.menuItemArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { setShowMenu(false); alert('🔄 Progress Reset\n\n(Feature coming soon!)'); }}
            >
              <Text style={styles.menuItemEmoji}>🗑️</Text>
              <View style={styles.menuItemTextContainer}>
                <Text style={styles.menuItemText}>Reset Progress</Text>
              </View>
              <Text style={styles.menuItemArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <LevelChangeModal
        visible={showLevelChangeModal}
        onClose={() => setShowLevelChangeModal(false)}
        onConfirm={handleChangeLevelConfirm}
        currentLevelId={result.recommendedLevel}
        mode="manual"
      />

      {/* Foundation Description Modal */}
      <Modal
        visible={foundationModal !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setFoundationModal(null)}
      >
        <View style={styles.foundationOverlay}>
          <View style={styles.foundationSheet}>
            {(() => {
              const content = FOUNDATION_CONTENT[foundationModal];
              if (!content) return null;
              return (
                <>
                  <View style={styles.foundationSheetHandle} />

                  {/* Header */}
                  <View style={[styles.foundationSheetHeader, { borderBottomColor: content.color + '44' }]}>
                    <Text style={styles.foundationSheetEmoji}>{content.emoji}</Text>
                    <TouchableOpacity onPress={() => setFoundationModal(null)} style={styles.foundationSheetCloseBtn}>
                      <Text style={styles.foundationSheetClose}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.foundationSheetBody}>
                    {/* Title & tagline */}
                    <Text style={[styles.foundationSheetTitle, { color: content.color }]}>{content.title}</Text>
                    <Text style={styles.foundationSheetTagline}>{content.tagline}</Text>

                    {/* Body description */}
                    <Text style={styles.foundationSheetDesc}>{content.body}</Text>

                    {/* What you'll learn */}
                    <View style={[styles.foundationLearnBox, { borderColor: content.color + '44' }]}>
                      <Text style={[styles.foundationLearnTitle, { color: content.color }]}>What you'll learn:</Text>
                      {content.bullets.map((b, i) => (
                        <View key={i} style={styles.foundationLearnRow}>
                          <Text style={styles.foundationLearnIcon}>{b.icon}</Text>
                          <Text style={styles.foundationLearnText}>{b.text}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Coming soon badge */}
                    <View style={[styles.foundationComingSoon, { borderColor: content.color + '66' }]}>
                      <Text style={[styles.foundationComingSoonText, { color: content.color }]}>
                        Coming Soon
                      </Text>
                      <Text style={styles.foundationComingSoonSub}>
                        We're building this section. Stay tuned!
                      </Text>
                    </View>

                    <View style={{ height: 8 }} />
                  </ScrollView>
                </>
              );
            })()}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ── Van Gogh palette (inline for this screen) ─────────────────────────────────
const VG = {
  bg:           '#1C2A44',
  card:         '#243454',
  cardElevated: '#2C3F62',
  yellow:       '#F4C542',
  gold:         '#E0B04B',
  orange:       '#D98C2B',
  cream:        '#F7F3E9',
  creamMid:     '#C5B99A',
  creamMuted:   '#8A7E6E',
  success:      '#7DC47A',
  border:        'rgba(244,197,66,0.13)',
  borderMid:     'rgba(244,197,66,0.28)',
  borderStrong:  'rgba(244,197,66,0.50)',
  overlay:       'rgba(20,32,56,0.88)',
};

const styles = StyleSheet.create({
  // ── Layout ────────────────────────────────────────────────────────────────
  safe:             { flex: 1, backgroundColor: VG.bg },
  topHeader:        {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: VG.border,
  },
  menuButton:       { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  menuIcon:         { fontSize: 22, color: VG.gold },
  appTitle:         { fontSize: 18, fontWeight: '800', color: VG.cream, letterSpacing: 0.4 },
  container:        { flex: 1 },
  contentContainer: { padding: 20 },

  // ── Home hub header ────────────────────────────────────────────────────────
  header:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  greeting:         { fontSize: 28, fontWeight: '900', color: VG.cream, marginBottom: 4 },
  subtitle:         { fontSize: 14, color: VG.creamMuted },
  levelBadge:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 2, gap: 6 },
  levelBadgeEmoji:  { fontSize: 20 },
  levelBadgeText:   { fontSize: 16, fontWeight: '800' },

  // ── Avatar section ─────────────────────────────────────────────────────────
  avatarSection:    { alignItems: 'center', marginBottom: 24, gap: 12 },
  avatarMessageBubble: {
    backgroundColor: 'rgba(247,243,233,0.07)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: VG.borderMid,
    paddingHorizontal: 18,
    paddingVertical: 10,
    maxWidth: 300,
  },
  avatarMessageText: {
    color: VG.creamMid,
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },

  // ── Stats row ──────────────────────────────────────────────────────────────
  statsRow:     { flexDirection: 'row', gap: 12 },
  statBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(217,140,43,0.13)',
    borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(217,140,43,0.32)',
    paddingHorizontal: 14, paddingVertical: 7,
  },
  statBadgeXP: {
    backgroundColor: 'rgba(244,197,66,0.13)',
    borderColor: 'rgba(244,197,66,0.32)',
  },
  statBadgeIcon:  { fontSize: 16 },
  statBadgeValue: { fontSize: 17, fontWeight: '800', color: VG.cream },
  statBadgeLabel: { fontSize: 11, color: VG.creamMuted, fontWeight: '600' },

  // ── Section headings ───────────────────────────────────────────────────────
  section:      { marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: VG.cream, marginBottom: 14, letterSpacing: 0.2 },

  // ── Chinese Foundations cards ──────────────────────────────────────────────
  foundationsRow:            { flexDirection: 'row', gap: 12 },
  foundationCard:            { flex: 1, backgroundColor: VG.card, borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: VG.border },
  foundationCardDimmed:      { opacity: 0.45 },
  foundationCardHighlighted: { borderColor: VG.gold, backgroundColor: 'rgba(224,176,75,0.09)' },
  foundationEmoji:           { fontSize: 32, marginBottom: 8 },
  foundationEmojiDimmed:     { opacity: 0.5 },
  foundationTitle:           { fontSize: 15, fontWeight: '800', color: VG.cream, marginBottom: 4 },
  foundationTitleDimmed:     { color: VG.creamMuted },
  foundationSubtitle:        { fontSize: 12, color: VG.creamMuted, textAlign: 'center' },
  foundationSubtitleDimmed:  { color: '#5A5040' },
  foundationLevelTag:        {
    marginTop: 8, fontSize: 10, fontWeight: '700', color: VG.creamMuted,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  foundationRecommendedTag:  {
    marginTop: 8, fontSize: 10, fontWeight: '700', color: VG.gold,
    backgroundColor: 'rgba(224,176,75,0.16)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  menuItemDimmed:            { opacity: 0.5 },
  menuItemTextDimmed:        { color: VG.creamMuted },
  menuItemHighlighted:       { borderLeftWidth: 3, borderLeftColor: VG.gold },

  // ── Chinese Journey path ───────────────────────────────────────────────────
  pathRow:            { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 0 },
  pathConnectorCol:   { alignItems: 'center', width: 32, marginRight: 10, marginTop: 14 },
  pathDot:            { width: 18, height: 18, borderRadius: 9, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  pathDotInner:       { width: 8, height: 8, borderRadius: 4 },
  pathDotCheck:       { fontSize: 10, color: VG.bg, fontWeight: '900' },
  pathLine:           { width: 2, flex: 1, minHeight: 20, marginVertical: 2 },
  pathCard:           {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: VG.card, borderRadius: 14, padding: 14,
    marginBottom: 8, borderWidth: 1.5, borderColor: VG.border, gap: 10,
  },
  pathEmoji:          { fontSize: 24, width: 30, textAlign: 'center' },
  pathInfo:           { flex: 1 },
  pathLevelNum:       { fontSize: 12, fontWeight: '800', letterSpacing: 0.5, marginBottom: 2 },
  pathTitle:          { fontSize: 15, fontWeight: '700', color: VG.cream },
  pathStatusCol:      { alignItems: 'flex-end', minWidth: 70 },
  pathCurrentLabel:   { fontSize: 11, fontWeight: '800' },
  pathCompletedLabel: { fontSize: 11, fontWeight: '700', color: VG.success },
  pathSoonLabel:      {
    fontSize: 10, fontWeight: '700', color: VG.creamMuted,
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  pathLockIcon:       { fontSize: 14 },
  dimmed:             { opacity: 0.4 },
  menuItemDisabled:   { opacity: 0.5 },
  menuItemTextDisabled: { color: VG.creamMuted },

  // ── Level lessons view ─────────────────────────────────────────────────────
  levelDetailBadge:    {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: VG.card, borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 2,
  },
  levelDetailEmoji:    { fontSize: 40 },
  levelDetailTitle:    { fontSize: 18, fontWeight: '800', marginBottom: 3 },
  levelDetailSubtitle: { fontSize: 13, color: VG.creamMuted },

  // ── Progress bar ───────────────────────────────────────────────────────────
  progressSection:  { backgroundColor: VG.card, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: VG.border },
  progressHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressTitle:    { fontSize: 14, fontWeight: '700', color: VG.cream },
  progressCount:    { fontSize: 13, fontWeight: '800' },
  progressBarBg:    { height: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressBarFill:  { height: '100%', borderRadius: 4 },
  progressWords:    { fontSize: 13, color: VG.creamMuted, textAlign: 'right' },

  // ── Lesson cards ───────────────────────────────────────────────────────────
  lessonsSection: { marginBottom: 24 },
  lessonCard:     {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: VG.card, borderRadius: 16, padding: 16,
    marginBottom: 10, borderWidth: 1, borderColor: VG.border,
  },
  lessonCardDone:   { borderColor: 'rgba(125,196,122,0.45)' },
  lessonNumber:     { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  lessonNumberText: { fontSize: 16, fontWeight: '800' },
  lessonInfo:       { flex: 1 },
  lessonTitle:      { fontSize: 16, fontWeight: '700', color: VG.cream, marginBottom: 3 },
  lessonChinese:    { fontSize: 13, color: VG.gold },
  lessonArrow:      { fontSize: 20, color: VG.creamMuted },

  // ── Quiz card ──────────────────────────────────────────────────────────────
  quizSection:  { marginBottom: 20 },
  quizCard:     {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: VG.card, borderRadius: 20, padding: 20, borderWidth: 2,
  },
  quizEmoji:    { fontSize: 32, marginRight: 14 },
  quizInfo:     { flex: 1 },
  quizTitle:    { fontSize: 18, fontWeight: '800', color: VG.cream, marginBottom: 4 },
  quizDesc:     { fontSize: 13, color: VG.creamMuted },
  quizArrow:    { fontSize: 20, fontWeight: '700' },

  // ── Menu modal ─────────────────────────────────────────────────────────────
  modalOverlay:      { flex: 1, backgroundColor: VG.overlay, justifyContent: 'flex-end' },
  menuPanel:         { backgroundColor: VG.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40 },
  menuHeader:        {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 1, borderBottomColor: VG.border,
  },
  menuHeaderText:    { fontSize: 20, fontWeight: '800', color: VG.cream },
  menuClose:         { fontSize: 24, color: VG.creamMuted },
  menuLevelCard:     {
    flexDirection: 'row', alignItems: 'center',
    margin: 20, padding: 16,
    backgroundColor: 'rgba(244,197,66,0.06)',
    borderRadius: 16, borderWidth: 2, gap: 12,
  },
  menuLevelEmoji:    { fontSize: 32 },
  menuLevelLabel:    { fontSize: 12, color: VG.creamMuted, marginBottom: 2 },
  menuLevelText:     { fontSize: 16, fontWeight: '800' },
  menuSectionHeader: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  menuSectionTitle:  { fontSize: 14, fontWeight: '700', color: VG.gold, letterSpacing: 0.5 },
  menuItem:          {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: VG.border,
  },
  menuItemEmoji:         { fontSize: 24, marginRight: 14, width: 32 },
  menuItemTextContainer: { flex: 1 },
  menuItemText:          { fontSize: 16, fontWeight: '600', color: VG.cream },
  menuItemSubtext:       { fontSize: 12, color: VG.creamMuted, marginTop: 2 },
  menuItemArrow:         { fontSize: 18, color: VG.creamMuted },

  // ── Foundation description modal ───────────────────────────────────────────
  foundationOverlay:        { flex: 1, backgroundColor: VG.overlay, justifyContent: 'flex-end' },
  foundationSheet:          { backgroundColor: VG.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '85%' },
  foundationSheetHandle:    { width: 40, height: 4, backgroundColor: VG.borderMid, borderRadius: 2, alignSelf: 'center', marginTop: 12 },
  foundationSheetHeader:    {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16, borderBottomWidth: 1,
  },
  foundationSheetEmoji:     { fontSize: 36 },
  foundationSheetCloseBtn:  { padding: 4 },
  foundationSheetClose:     { fontSize: 22, color: VG.creamMuted },
  foundationSheetBody:      { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32 },
  foundationSheetTitle:     { fontSize: 20, fontWeight: '900', lineHeight: 28, marginBottom: 8 },
  foundationSheetTagline:   { fontSize: 15, fontWeight: '600', color: VG.creamMid, marginBottom: 16 },
  foundationSheetDesc:      { fontSize: 14, color: VG.creamMid, lineHeight: 22, marginBottom: 24 },
  foundationLearnBox:       { borderWidth: 1.5, borderRadius: 18, padding: 18, marginBottom: 20 },
  foundationLearnTitle:     { fontSize: 14, fontWeight: '800', marginBottom: 14 },
  foundationLearnRow:       { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  foundationLearnIcon:      { fontSize: 20, width: 28, textAlign: 'center' },
  foundationLearnText:      { fontSize: 14, color: VG.cream, flex: 1, fontWeight: '500' },
  foundationComingSoon:     { borderWidth: 1.5, borderRadius: 14, padding: 16, alignItems: 'center' },
  foundationComingSoonText: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  foundationComingSoonSub:  { fontSize: 13, color: VG.creamMuted },
});
