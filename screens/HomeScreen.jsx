import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LEVEL_CONFIG = [
  { id: 'hsk1', number: 1, emoji: '🌱', title: 'Beginner',              subtitle: 'HSK 1', color: '#00D2D3', available: true },
  { id: 'hsk2', number: 2, emoji: '🚶', title: 'Explorer',              subtitle: 'HSK 2', color: '#54A0FF', available: true },
  { id: 'hsk3', number: 3, emoji: '🗣',  title: 'Conversation Builder',  subtitle: 'HSK 3', color: '#1DD1A1', available: true },
  { id: 'hsk4', number: 4, emoji: '🌟', title: 'Confident Speaker',     subtitle: 'HSK 4', color: '#FF9F43', available: false },
  { id: 'hsk5', number: 5, emoji: '🔥', title: 'Communicator',          subtitle: 'HSK 5', color: '#a29bfe', available: false },
];

const LESSONS_BY_LEVEL = {
  hsk1: [
    { id: 1, title: 'Greetings & Introductions', topic_chinese: '你好！' },
    { id: 2, title: 'Numbers & Age',             topic_chinese: '你多大？' },
    { id: 3, title: 'Time & Date',               topic_chinese: '今天几号？' },
    { id: 4, title: 'Family Members',            topic_chinese: '我的家' },
    { id: 5, title: 'Food & Drinks',             topic_chinese: '吃什么？' },
    { id: 6, title: 'Shopping & Money',          topic_chinese: '多少钱？' },
    { id: 7, title: 'Locations & Directions',    topic_chinese: '在哪儿？' },
    { id: 8, title: 'Daily Activities',          topic_chinese: '你做什么？' },
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
  onLessonPress,
  onLevelQuizPress,
  onChangeLevel,
  onRetakeTest,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);

  const { result } = userData;
  const currentLevelConfig =
    LEVEL_CONFIG.find(l => l.id === result.recommendedLevel) || LEVEL_CONFIG[0];

  const handlePinyinSection = () => {
    setShowMenu(false);
    alert('🔊 Pinyin Learning\n\nLearn the Pinyin sound system:\n• Four tones\n• Initials & Finals\n• Pronunciation practice\n\n(Coming soon!)');
  };

  const handleCharactersSection = () => {
    setShowMenu(false);
    alert('✍️ Chinese Characters\n\nLearn to read and write:\n• Stroke order\n• Radicals\n• Character components\n\n(Coming soon!)');
  };

  const handleLevelPress = (level) => {
    if (!level.available) {
      alert(`${level.emoji} Level ${level.number}: ${level.title}\n\nComing soon!`);
      return;
    }
    setSelectedLevel(level);
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

          <View style={styles.lessonsSection}>
            <Text style={styles.sectionTitle}>📚 Lessons</Text>
            {lessons.map((lesson) => (
              <TouchableOpacity
                key={lesson.id}
                style={styles.lessonCard}
                onPress={() => onLessonPress(lesson.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.lessonNumber, { backgroundColor: selectedLevel.color + '33' }]}>
                  <Text style={[styles.lessonNumberText, { color: selectedLevel.color }]}>{lesson.id}</Text>
                </View>
                <View style={styles.lessonInfo}>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  <Text style={styles.lessonChinese}>{lesson.topic_chinese}</Text>
                </View>
                <Text style={styles.lessonArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.quizSection}>
            <TouchableOpacity
              style={[styles.quizCard, { borderColor: selectedLevel.color }]}
              onPress={onLevelQuizPress}
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

        {/* Chinese Levels */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎓 Chinese Levels</Text>
          {LEVEL_CONFIG.map((level) => {
            const isCurrent = level.id === result.recommendedLevel;
            const isLocked = !level.available;
            return (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.levelCard,
                  { borderColor: isLocked ? '#2d3436' : level.color },
                  isCurrent && { backgroundColor: level.color + '15' },
                ]}
                onPress={() => handleLevelPress(level)}
                activeOpacity={0.8}
              >
                <Text style={[styles.levelCardEmoji, isLocked && styles.dimmed]}>{level.emoji}</Text>
                <View style={styles.levelCardInfo}>
                  <View style={styles.levelCardTitleRow}>
                    <Text style={[styles.levelCardNumber, { color: isLocked ? '#636e72' : level.color }]}>
                      Level {level.number}
                    </Text>
                    {isCurrent && (
                      <View style={[styles.currentBadge, { backgroundColor: level.color }]}>
                        <Text style={styles.currentBadgeText}>YOUR LEVEL</Text>
                      </View>
                    )}
                    {isLocked && (
                      <View style={styles.comingSoonBadge}>
                        <Text style={styles.comingSoonText}>COMING SOON</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.levelCardTitle, isLocked && styles.dimmed]}>{level.title}</Text>
                  <Text style={[styles.levelCardSubtitle, isLocked && styles.dimmed]}>{level.subtitle}</Text>
                </View>
                <Text style={{ fontSize: 18, color: isLocked ? '#2d3436' : level.color }}>
                  {isLocked ? '🔒' : '→'}
                </Text>
              </TouchableOpacity>
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

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { setShowMenu(false); onChangeLevel(); }}
            >
              <Text style={styles.menuItemEmoji}>🔄</Text>
              <View style={styles.menuItemTextContainer}>
                <Text style={styles.menuItemText}>Change Level</Text>
              </View>
              <Text style={styles.menuItemArrow}>→</Text>
            </TouchableOpacity>

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

  // Level cards (hub)
  levelCard:            { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16213e', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1.5 },
  levelCardEmoji:       { fontSize: 28, marginRight: 14, width: 36, textAlign: 'center' },
  levelCardInfo:        { flex: 1 },
  levelCardTitleRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  levelCardNumber:      { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  levelCardTitle:       { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 2 },
  levelCardSubtitle:    { fontSize: 12, color: '#636e72' },
  currentBadge:         { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  currentBadgeText:     { fontSize: 9, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  comingSoonBadge:      { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.08)' },
  comingSoonText:       { fontSize: 9, fontWeight: '700', color: '#636e72', letterSpacing: 0.5 },
  dimmed:               { opacity: 0.4 },

  // Level lessons view
  levelDetailBadge:     { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#16213e', borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 2 },
  levelDetailEmoji:     { fontSize: 40 },
  levelDetailTitle:     { fontSize: 18, fontWeight: '800', marginBottom: 3 },
  levelDetailSubtitle:  { fontSize: 13, color: '#636e72' },

  lessonsSection:       { marginBottom: 24 },
  lessonCard:           { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16213e', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2d3436' },
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
});
