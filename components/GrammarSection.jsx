import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';

function GrammarSection({ grammarPoints }) {
  const [expandedPoints, setExpandedPoints] = useState([0]);

  const togglePoint = (index) => {
    setExpandedPoints(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📚 Grammar Points ({grammarPoints.length})</Text>
      
      {grammarPoints.map((point, index) => (
        <GrammarPointCard
          key={point.number}
          point={point}
          isExpanded={expandedPoints.includes(index)}
          onToggle={() => togglePoint(index)}
        />
      ))}
    </View>
  );
}

function GrammarPointCard({ point, isExpanded, onToggle }) {
  const [showExercises, setShowExercises] = useState(false);

  return (
    <View style={styles.card}>
      <TouchableOpacity 
        style={styles.cardHeader} 
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Text style={styles.cardHeaderText}>
          {point.number}. {point.title}
        </Text>
        <Text style={styles.expandIcon}>
          {isExpanded ? '▼' : '▶'}
        </Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.cardContent}>
          <View style={styles.explanationBox}>
            <Text style={styles.explanationText}>{point.explanation}</Text>
          </View>

          <Text style={styles.sectionLabel}>Examples:</Text>
          {point.examples.map((example, idx) => (
            <View key={idx} style={styles.exampleItem}>
              <Text style={styles.exampleChinese}>{example.chinese}</Text>
              <Text style={styles.examplePinyin}>{example.pinyin}</Text>
              <Text style={styles.exampleEnglish}>"{example.english}"</Text>
            </View>
          ))}

          <TouchableOpacity
            style={styles.practiceButton}
            onPress={() => setShowExercises(!showExercises)}
          >
            <Text style={styles.practiceButtonText}>
              {showExercises ? '✓ Hide Practice' : `📝 Practice (${point.exercises.length} exercises)`}
            </Text>
          </TouchableOpacity>

          {showExercises && (
            <ExerciseSection exercises={point.exercises} />
          )}
        </View>
      )}
    </View>
  );
}

function ExerciseSection({ exercises }) {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const exercise = exercises[currentExercise];
  const isMultipleChoice = exercise.type === 'multiple_choice';

  // Debug log
  console.log('Exercise:', exercise);
  console.log('Has option_pinyin?', exercise.option_pinyin);

  const checkAnswer = () => {
    let correct;
    if (isMultipleChoice) {
      correct = selectedOption === exercise.correct;
    } else {
      correct = userAnswer.trim().toLowerCase() === exercise.answer?.toLowerCase();
    }
    setIsCorrect(correct);
    setShowFeedback(true);
  };

  const nextExercise = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setUserAnswer('');
      setSelectedOption(null);
      setShowFeedback(false);
      setIsCorrect(false);
    }
  };

  const previousExercise = () => {
    if (currentExercise > 0) {
      setCurrentExercise(currentExercise - 1);
      setUserAnswer('');
      setSelectedOption(null);
      setShowFeedback(false);
      setIsCorrect(false);
    }
  };

  const canCheck = isMultipleChoice ? selectedOption !== null : userAnswer.trim().length > 0;

  return (
    <View style={styles.exerciseContainer}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseProgress}>
          Exercise {currentExercise + 1} / {exercises.length}
        </Text>
        <Text style={styles.exerciseType}>
          {isMultipleChoice ? 'Multiple Choice' : exercise.type}
        </Text>
      </View>

      <View style={styles.questionBox}>
        <Text style={styles.questionText}>{exercise.question}</Text>
        {exercise.question_pinyin && (
          <Text style={styles.questionPinyin}>{exercise.question_pinyin}</Text>
        )}
      </View>

      {isMultipleChoice && (
        <View style={styles.mcOptionsContainer}>
          {exercise.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isCorrectOption = option === exercise.correct;
            
            let optionStyle = [styles.mcOption];
            let textStyle = [styles.mcOptionText];

            if (showFeedback) {
              if (isCorrectOption) {
                optionStyle.push(styles.mcOptionCorrect);
                textStyle.push(styles.mcOptionTextWhite);
              } else if (isSelected && !isCorrectOption) {
                optionStyle.push(styles.mcOptionWrong);
                textStyle.push(styles.mcOptionTextWhite);
              }
            } else if (isSelected) {
              optionStyle.push(styles.mcOptionSelected);
            }

            // Get pinyin for this option
            const optionPinyin = exercise.option_pinyin?.[idx];
            
            // Debug log
            console.log(`Option ${idx}: "${option}", Pinyin: "${optionPinyin}"`);

            return (
              <TouchableOpacity
                key={idx}
                style={optionStyle}
                onPress={() => !showFeedback && setSelectedOption(option)}
                disabled={showFeedback}
                activeOpacity={0.7}
              >
                <Text style={textStyle}>{option}</Text>
                {/* ALWAYS SHOW PINYIN IF AVAILABLE */}
                {optionPinyin && (
                  <Text style={styles.optionPinyin}>
                    {optionPinyin}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {!isMultipleChoice && (
        <TextInput
          style={styles.answerInput}
          value={userAnswer}
          onChangeText={setUserAnswer}
          placeholder="Type your answer here..."
          placeholderTextColor="#999"
          multiline
          editable={!showFeedback}
        />
      )}

      {!showFeedback && (
        <TouchableOpacity
          style={[styles.checkButton, !canCheck && styles.checkButtonDisabled]}
          onPress={checkAnswer}
          disabled={!canCheck}
        >
          <Text style={styles.checkButtonText}>Check Answer</Text>
        </TouchableOpacity>
      )}

      {showFeedback && (
        <View style={[
          styles.feedbackBox,
          isCorrect ? styles.correctFeedback : styles.incorrectFeedback
        ]}>
          <Text style={styles.feedbackEmoji}>
            {isCorrect ? '✅' : '❌'}
          </Text>
          <Text style={styles.feedbackText}>
            {isCorrect ? 'Correct! 太棒了！' : 'Not quite right'}
          </Text>
          {!isCorrect && (
            <View style={styles.answerBox}>
              <Text style={styles.answerLabel}>Correct Answer:</Text>
              <Text style={styles.answerText}>
                {isMultipleChoice ? exercise.correct : exercise.answer}
              </Text>
              {exercise.correct_pinyin && (
                <Text style={styles.answerPinyin}>{exercise.correct_pinyin}</Text>
              )}
            </View>
          )}
        </View>
      )}

      {showFeedback && (
        <View style={styles.exerciseNav}>
          <TouchableOpacity
            style={[styles.navButton, currentExercise === 0 && styles.navButtonDisabled]}
            onPress={previousExercise}
            disabled={currentExercise === 0}
          >
            <Text style={styles.navButtonText}>← Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, currentExercise === exercises.length - 1 && styles.navButtonDisabled]}
            onPress={nextExercise}
            disabled={currentExercise === exercises.length - 1}
          >
            <Text style={styles.navButtonText}>
              {currentExercise === exercises.length - 1 ? 'Done ✓' : 'Next →'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#e0e0e0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#f5f5f5' },
  cardHeaderText: { fontSize: 18, fontWeight: '600', color: '#333', flex: 1 },
  expandIcon: { fontSize: 16, color: '#666' },
  cardContent: { padding: 16 },
  explanationBox: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, marginBottom: 16 },
  explanationText: { fontSize: 15, lineHeight: 22, color: '#444' },
  sectionLabel: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#555' },
  exampleItem: { backgroundColor: '#fff9e6', padding: 12, borderRadius: 8, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: '#ffd700' },
  exampleChinese: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  examplePinyin: { fontSize: 16, color: '#666', fontStyle: 'italic', marginBottom: 4 },
  exampleEnglish: { fontSize: 15, color: '#555' },
  practiceButton: { backgroundColor: '#4CAF50', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  practiceButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  exerciseContainer: { marginTop: 16, padding: 16, backgroundColor: '#f0f8ff', borderRadius: 12, borderWidth: 2, borderColor: '#4CAF50' },
  exerciseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  exerciseProgress: { fontSize: 16, fontWeight: '600', color: '#333' },
  exerciseType: { fontSize: 13, color: '#666', backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  questionBox: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 12 },
  questionText: { fontSize: 17, lineHeight: 24, color: '#333' },
  questionPinyin: { fontSize: 14, color: '#a29bfe', fontStyle: 'italic', marginTop: 6 },
  mcOptionsContainer: { gap: 10, marginBottom: 12 },
  mcOption: { backgroundColor: '#16213e', borderRadius: 12, padding: 16, borderWidth: 2, borderColor: '#2d3436' },
  mcOptionSelected: { borderColor: '#a29bfe', backgroundColor: 'rgba(162,155,254,0.1)' },
  mcOptionCorrect: { backgroundColor: '#1DD1A1', borderColor: '#1DD1A1' },
  mcOptionWrong: { backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' },
  mcOptionText: { fontSize: 15, color: '#fff', fontWeight: '600' },
  mcOptionTextWhite: { color: '#fff' },
  // UPDATED: Bright yellow/gold pinyin on dark background
  optionPinyin: { fontSize: 14, color: '#FFD700', fontStyle: 'italic', marginTop: 6, fontWeight: '500' },
  answerInput: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, minHeight: 50, marginBottom: 12 },
  checkButton: { backgroundColor: '#2196F3', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  checkButtonDisabled: { backgroundColor: '#636e72', opacity: 0.5 },
  checkButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  feedbackBox: { padding: 16, borderRadius: 8, marginBottom: 12 },
  correctFeedback: { backgroundColor: '#e8f5e9', borderWidth: 2, borderColor: '#4CAF50' },
  incorrectFeedback: { backgroundColor: '#ffebee', borderWidth: 2, borderColor: '#f44336' },
  feedbackEmoji: { fontSize: 32, textAlign: 'center', marginBottom: 8 },
  feedbackText: { fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 12 },
  answerBox: { backgroundColor: '#fff', padding: 12, borderRadius: 6 },
  answerLabel: { fontSize: 14, color: '#666', marginBottom: 4 },
  answerText: { fontSize: 17, fontWeight: '600', color: '#333' },
  answerPinyin: { fontSize: 14, color: '#a29bfe', fontStyle: 'italic', marginTop: 4 },
  exerciseNav: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  navButton: { flex: 1, backgroundColor: '#666', padding: 12, borderRadius: 8, alignItems: 'center' },
  navButtonDisabled: { backgroundColor: '#ccc' },
  navButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});

export default GrammarSection;
