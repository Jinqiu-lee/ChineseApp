import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// CORRECT: components folder is in root
import VocabularySection from '../components/VocabularySection';
import SentencesSection from '../components/SentencesSection';
import GrammarSection from '../components/GrammarSection';

// CORRECT: data folder is in root
import lesson1 from '../data/hsk1/hsk1_lesson_1.json';
import lesson2 from '../data/hsk1/hsk1_lesson_2.json';
import lesson3 from '../data/hsk1/hsk1_lesson_3.json';
import lesson4 from '../data/hsk1/hsk1_lesson_4.json';
import lesson5 from '../data/hsk1/hsk1_lesson_5.json';
import lesson6 from '../data/hsk1/hsk1_lesson_6.json';
import lesson7 from '../data/hsk1/hsk1_lesson_7.json';
import lesson8 from '../data/hsk1/hsk1_lesson_8.json';

// Lesson mapping
const LESSONS = {
  1: lesson1,
  2: lesson2,
  3: lesson3,
  4: lesson4,
  5: lesson5,
  6: lesson6,
  7: lesson7,
  8: lesson8,
};

/**
 * LessonDetailScreen - Shows complete lesson content
 */
export default function LessonDetailScreen({
  lessonId,
  onBack,
  onLessonComplete,
  onPlayGame,
  onTakeQuiz
}) {
  const lesson = LESSONS[lessonId];

  if (!lesson) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ Lesson {lessonId} not found</Text>
          <Text style={styles.errorSubtext}>Available lessons: 1-8</Text>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const gameButtons = [
    { id: 'flashcard', label: 'Flashcards', emoji: '🎴', color: '#FF6B6B' },
    { id: 'matching', label: 'Matching', emoji: '🔄', color: '#54A0FF' },
    { id: 'word_shake', label: 'Word Shake', emoji: '🎯', color: '#1DD1A1' },
    { id: 'sentence_builder', label: 'Sentence Builder', emoji: '🧩', color: '#a29bfe' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.lessonNumber}>Lesson {lesson.lesson}</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Lesson Title */}
        <View style={styles.titleCard}>
          <Text style={styles.topicChinese}>{lesson.topic_chinese}</Text>
          <Text style={styles.topicEnglish}>{lesson.topic}</Text>
        </View>

        {/* Vocabulary Section */}
        <VocabularySection vocabulary={lesson.vocabulary} />

        {/* Key Sentences Section */}
        <SentencesSection sentences={lesson.key_sentences} />

        {/* Grammar Section */}
        <GrammarSection grammarPoints={lesson.grammar_points} />

        {/* Games Section */}
        <View style={styles.gamesSection}>
          <Text style={styles.sectionTitle}>🎮 Practice Games</Text>
          <View style={styles.gamesGrid}>
            {gameButtons.map((game) => (
              <TouchableOpacity
                key={game.id}
                style={[styles.gameCard, { borderColor: game.color }]}
                onPress={() => onPlayGame(game.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.gameEmoji}>{game.emoji}</Text>
                <Text style={[styles.gameLabel, { color: game.color }]}>
                  {game.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quiz Section */}
        <View style={styles.quizSection}>
          <TouchableOpacity
            style={styles.quizButton}
            onPress={onTakeQuiz}
            activeOpacity={0.8}
          >
            <Text style={styles.quizButtonEmoji}>📝</Text>
            <View style={styles.quizButtonInfo}>
              <Text style={styles.quizButtonTitle}>Lesson Quiz</Text>
              <Text style={styles.quizButtonDesc}>
                {lesson.quiz?.length || 9} questions · Test your knowledge
              </Text>
            </View>
            <Text style={styles.quizButtonArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Complete Lesson */}
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => onLessonComplete(lessonId)}
          activeOpacity={0.85}
        >
          <Text style={styles.completeButtonText}>✓ Complete Lesson</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a1a2e' },
  scrollView: { flex: 1 },
  contentContainer: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  backButton: { paddingVertical: 8, paddingRight: 12 },
  backButtonText: { fontSize: 16, fontWeight: '600', color: '#a29bfe' },
  headerCenter: { flex: 1, alignItems: 'center' },
  lessonNumber: { fontSize: 16, fontWeight: '700', color: '#fff' },
  titleCard: { backgroundColor: '#16213e', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#2d3436' },
  topicChinese: { fontSize: 32, fontWeight: '900', color: '#fff', marginBottom: 8 },
  topicEnglish: { fontSize: 18, fontWeight: '600', color: '#a29bfe' },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 16 },
  gamesSection: { marginBottom: 24 },
  gamesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gameCard: { width: '48%', backgroundColor: '#16213e', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 2 },
  gameEmoji: { fontSize: 32, marginBottom: 8 },
  gameLabel: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  quizSection: { marginBottom: 24 },
  quizButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16213e', borderRadius: 20, padding: 20, borderWidth: 2, borderColor: '#FF6B6B' },
  quizButtonEmoji: { fontSize: 32, marginRight: 14 },
  quizButtonInfo: { flex: 1 },
  quizButtonTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 4 },
  quizButtonDesc: { fontSize: 13, color: '#636e72' },
  quizButtonArrow: { fontSize: 20, fontWeight: '700', color: '#FF6B6B' },
  completeButton: { backgroundColor: '#1DD1A1', borderRadius: 18, padding: 18, alignItems: 'center', marginBottom: 12 },
  completeButtonText: { fontSize: 17, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  errorText: { fontSize: 20, fontWeight: '700', color: '#FF6B6B', marginBottom: 8 },
  errorSubtext: { fontSize: 14, color: '#636e72', marginBottom: 20 },
});
