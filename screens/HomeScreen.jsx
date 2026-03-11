import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LevelChangeModal from '../components/LevelChangeModal';

const LEVEL_CONFIG = [
  { id: 'hsk1', number: 1, emoji: '🌱', title: 'Beginner',              subtitle: 'HSK 1', color: '#00D2D3' },
  { id: 'hsk2', number: 2, emoji: '🚶', title: 'Explorer',              subtitle: 'HSK 2', color: '#54A0FF' },
  { id: 'hsk3', number: 3, emoji: '🗣',  title: 'Conversation Builder',  subtitle: 'HSK 3', color: '#1DD1A1' },
  { id: 'hsk4', number: 4, emoji: '🌟', title: 'Confident Speaker',     subtitle: 'HSK 4', color: '#FF9F43' },
  { id: 'hsk5', number: 5, emoji: '🔥', title: 'Communicator',          subtitle: 'HSK 5', color: '#a29bfe' },
  { id: 'hsk6', number: 6, emoji: '🎓', title: 'Advanced',              subtitle: 'HSK 6', color: '#fd79a8' },
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
  hsk3: { emoji: '⚔️', title: "Adventurer's Challenge", desc: "Brave traveler! Finish all 5 HSK2 lessons and conquer the Level Quiz to push deeper into uncharted territory!" },
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
    { id: 1, title: 'Daily Routines',      topic_chinese: '日常生活' },
    { id: 2, title: 'Weather & Seasons',   topic_chinese: '天气怎么样？' },
    { id: 3, title: 'Transportation',      topic_chinese: '怎么去？' },
    { id: 4, title: 'Shopping & Prices',   topic_chinese: '多少钱？' },
    { id: 5, title: 'Health & Body',       topic_chinese: '身体好吗？' },
  ],
  hsk3: [
    { id: 1, title: 'Experiences & Travel', topic_chinese: '去过哪里？' },
    { id: 2, title: 'Feelings & Emotions',  topic_chinese: '感受如何？' },
    { id: 3, title: 'Work & Study',         topic_chinese: '工作学习' },
    { id: 4, title: 'Hobbies & Interests',  topic_chinese: '爱好是什么？' },
    { id: 5, title: 'Comparisons',          topic_chinese: '比较' },
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
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(
    () => returnLevelId ? LEVEL_CONFIG.find(l => l.id === returnLevelId) ?? null : null
  );
  const [showLevelChangeModal, setShowLevelChangeModal] = useState(false);
  const [foundationModal, setFoundationModal] = useState(null); // 'pinyin' | 'characters' | null

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

  const handlePinyinSection = () => {
    setShowMenu(false);
    setFoundationModal('pinyin');
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

        {/* Chinese Foundations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📖 Chinese Foundations</Text>
          <View style={styles.foundationsRow}>
            <TouchableOpacity style={styles.foundationCard} onPress={handlePinyinSection} activeOpacity={0.8}>
              <Text style={styles.foundationEmoji}>🔊</Text>
              <Text style={styles.foundationTitle}>Pinyin</Text>
              <Text style={styles.foundationSubtitle}>Sound System</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.foundationCard} onPress={handleCharactersSection} activeOpacity={0.8}>
              <Text style={styles.foundationEmoji}>✍️</Text>
              <Text style={styles.foundationTitle}>Characters</Text>
              <Text style={styles.foundationSubtitle}>Writing System</Text>
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

            <TouchableOpacity style={styles.menuItem} onPress={handlePinyinSection}>
              <Text style={styles.menuItemEmoji}>🔊</Text>
              <View style={styles.menuItemTextContainer}>
                <Text style={styles.menuItemText}>Pinyin Learning</Text>
                <Text style={styles.menuItemSubtext}>Tones & Pronunciation</Text>
              </View>
              <Text style={styles.menuItemArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleCharactersSection}>
              <Text style={styles.menuItemEmoji}>✍️</Text>
              <View style={styles.menuItemTextContainer}>
                <Text style={styles.menuItemText}>Chinese Characters</Text>
                <Text style={styles.menuItemSubtext}>Stroke Order & Radicals</Text>
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

const styles = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: '#1a1a2e' },
  topHeader:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  menuButton:      { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  menuIcon:        { fontSize: 24, color: '#fff' },
  appTitle:        { fontSize: 18, fontWeight: '700', color: '#fff' },
  container:       { flex: 1 },
  contentContainer:{ padding: 20 },

  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  greeting:        { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 4 },
  subtitle:        { fontSize: 14, color: '#636e72' },
  levelBadge:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 2, gap: 6 },
  levelBadgeEmoji: { fontSize: 20 },
  levelBadgeText:  { fontSize: 16, fontWeight: '800' },

  section:         { marginBottom: 28 },
  sectionTitle:    { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 14 },

  // Foundations
  foundationsRow:       { flexDirection: 'row', gap: 12 },
  foundationCard:       { flex: 1, backgroundColor: '#16213e', borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#2d3436' },
  foundationEmoji:      { fontSize: 32, marginBottom: 8 },
  foundationTitle:      { fontSize: 15, fontWeight: '800', color: '#fff', marginBottom: 4 },
  foundationSubtitle:   { fontSize: 12, color: '#636e72', textAlign: 'center' },

  // Chinese Journey path
  pathRow:            { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 0 },
  pathConnectorCol:   { alignItems: 'center', width: 32, marginRight: 10, marginTop: 14 },
  pathDot:            { width: 18, height: 18, borderRadius: 9, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  pathDotInner:       { width: 8, height: 8, borderRadius: 4 },
  pathDotCheck:       { fontSize: 10, color: '#fff', fontWeight: '900' },
  pathLine:           { width: 2, flex: 1, minHeight: 20, marginVertical: 2 },
  pathCard:           { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#16213e', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: '#2d3436', gap: 10 },
  pathEmoji:          { fontSize: 24, width: 30, textAlign: 'center' },
  pathInfo:           { flex: 1 },
  pathLevelNum:       { fontSize: 12, fontWeight: '800', letterSpacing: 0.5, marginBottom: 2 },
  pathTitle:          { fontSize: 15, fontWeight: '700', color: '#fff' },
  pathStatusCol:      { alignItems: 'flex-end', minWidth: 70 },
  pathCurrentLabel:   { fontSize: 11, fontWeight: '800' },
  pathCompletedLabel: { fontSize: 11, fontWeight: '700', color: '#1DD1A1' },
  pathSoonLabel:      { fontSize: 10, fontWeight: '700', color: '#636e72', backgroundColor: 'rgba(255,255,255,0.07)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  pathLockIcon:       { fontSize: 14 },
  dimmed:               { opacity: 0.4 },
  menuItemDisabled:     { opacity: 0.5 },
  menuItemTextDisabled: { color: '#636e72' },

  // Level lessons view
  levelDetailBadge:     { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#16213e', borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 2 },
  levelDetailEmoji:     { fontSize: 40 },
  levelDetailTitle:     { fontSize: 18, fontWeight: '800', marginBottom: 3 },
  levelDetailSubtitle:  { fontSize: 13, color: '#636e72' },

  // Level progress bar
  progressSection:  { backgroundColor: '#16213e', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#2d3436' },
  progressHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressTitle:    { fontSize: 14, fontWeight: '700', color: '#fff' },
  progressCount:    { fontSize: 13, fontWeight: '800' },
  progressBarBg:    { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressBarFill:  { height: '100%', borderRadius: 4 },
  progressWords:    { fontSize: 13, color: '#636e72', textAlign: 'right' },

  lessonsSection:       { marginBottom: 24 },
  lessonCard:           { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16213e', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2d3436' },
  lessonCardDone:       { borderColor: '#1DD1A1' + '55' },
  lessonNumber:         { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  lessonNumberText:     { fontSize: 16, fontWeight: '800' },
  lessonInfo:           { flex: 1 },
  lessonTitle:          { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 3 },
  lessonChinese:        { fontSize: 13, color: '#a29bfe' },
  lessonArrow:          { fontSize: 20, color: '#636e72' },

  quizSection:          { marginBottom: 20 },
  quizCard:             { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16213e', borderRadius: 20, padding: 20, borderWidth: 2 },
  quizEmoji:            { fontSize: 32, marginRight: 14 },
  quizInfo:             { flex: 1 },
  quizTitle:            { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 4 },
  quizDesc:             { fontSize: 13, color: '#636e72' },
  quizArrow:            { fontSize: 20, fontWeight: '700' },

  // Menu modal
  modalOverlay:         { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  menuPanel:            { backgroundColor: '#16213e', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40 },
  menuHeader:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  menuHeaderText:       { fontSize: 20, fontWeight: '800', color: '#fff' },
  menuClose:            { fontSize: 24, color: '#636e72' },
  menuLevelCard:        { flexDirection: 'row', alignItems: 'center', margin: 20, padding: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, borderWidth: 2, gap: 12 },
  menuLevelEmoji:       { fontSize: 32 },
  menuLevelLabel:       { fontSize: 12, color: '#636e72', marginBottom: 2 },
  menuLevelText:        { fontSize: 16, fontWeight: '800' },
  menuSectionHeader:    { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  menuSectionTitle:     { fontSize: 14, fontWeight: '700', color: '#a29bfe', letterSpacing: 0.5 },
  menuItem:             { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  menuItemEmoji:        { fontSize: 24, marginRight: 14, width: 32 },
  menuItemTextContainer:{ flex: 1 },
  menuItemText:         { fontSize: 16, fontWeight: '600', color: '#fff' },
  menuItemSubtext:      { fontSize: 12, color: '#636e72', marginTop: 2 },
  menuItemArrow:        { fontSize: 18, color: '#636e72' },

  // Foundation description modal
  foundationOverlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  foundationSheet:          { backgroundColor: '#16213e', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '85%' },
  foundationSheetHandle:    { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, alignSelf: 'center', marginTop: 12 },
  foundationSheetHeader:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16, borderBottomWidth: 1 },
  foundationSheetEmoji:     { fontSize: 36 },
  foundationSheetCloseBtn:  { padding: 4 },
  foundationSheetClose:     { fontSize: 22, color: '#636e72' },
  foundationSheetBody:      { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32 },
  foundationSheetTitle:     { fontSize: 20, fontWeight: '900', lineHeight: 28, marginBottom: 8 },
  foundationSheetTagline:   { fontSize: 15, fontWeight: '600', color: '#b2bec3', marginBottom: 16 },
  foundationSheetDesc:      { fontSize: 14, color: '#b2bec3', lineHeight: 22, marginBottom: 24 },
  foundationLearnBox:       { borderWidth: 1.5, borderRadius: 18, padding: 18, marginBottom: 20 },
  foundationLearnTitle:     { fontSize: 14, fontWeight: '800', marginBottom: 14 },
  foundationLearnRow:       { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  foundationLearnIcon:      { fontSize: 20, width: 28, textAlign: 'center' },
  foundationLearnText:      { fontSize: 14, color: '#dfe6e9', flex: 1, fontWeight: '500' },
  foundationComingSoon:     { borderWidth: 1.5, borderRadius: 14, padding: 16, alignItems: 'center' },
  foundationComingSoonText: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  foundationComingSoonSub:  { fontSize: 13, color: '#636e72' },
});
