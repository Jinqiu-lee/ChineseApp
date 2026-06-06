import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DEEP_NAVY, SLATE_TEAL, CARD_WHITE, SUCCESS, ERROR } from '../constants/colors';

export default function MiniExerciseCard({
  exercise,
  exerciseIdx = 0,
  exerciseCount = 1,
  selected,
  answered,
  onSelect,
  onNext,
}) {
  const { question, correct, options, option_pinyin } = exercise;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>⚡ Quick Check</Text>
        {exerciseCount > 1 && (
          <Text style={styles.counter}>{exerciseIdx + 1} / {exerciseCount}</Text>
        )}
      </View>

      <Text style={styles.question}>{question}</Text>

      <View style={styles.options}>
        {(options || []).map((opt, i) => {
          let btnStyle = styles.opt;
          let txtStyle = styles.optText;
          if (answered) {
            if (opt === correct)       { btnStyle = styles.optCorrect; txtStyle = [styles.optText, { color: SUCCESS }]; }
            else if (opt === selected) { btnStyle = styles.optWrong;   txtStyle = [styles.optText, { color: ERROR }]; }
            else                       { btnStyle = styles.optDimmed;  txtStyle = [styles.optText, { color: 'rgba(28,42,68,0.35)' }]; }
          }
          return (
            <TouchableOpacity
              key={i}
              style={btnStyle}
              onPress={() => onSelect(opt)}
              disabled={answered}
              activeOpacity={0.75}
            >
              <Text style={txtStyle}>{opt}</Text>
              {option_pinyin?.[i] ? (
                <Text style={styles.optPinyin}>{option_pinyin[i]}</Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {answered && (
        <View style={styles.resultRow}>
          <Text style={[styles.resultText, { color: selected === correct ? SUCCESS : ERROR }]}>
            {selected === correct ? '✓ Correct!' : `✗  Answer: ${correct}`}
          </Text>
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: selected === correct ? SUCCESS : SLATE_TEAL }]}
            onPress={onNext}
            activeOpacity={0.85}
          >
            <Text style={styles.nextBtnText}>Next →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F0F6F7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    marginTop: -2,
    borderWidth: 1.5,
    borderColor: 'rgba(55,73,80,0.22)',
    gap: 10,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: SLATE_TEAL,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  counter: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(55,73,80,0.55)',
  },

  question: {
    fontSize: 15,
    fontWeight: '700',
    color: DEEP_NAVY,
    lineHeight: 22,
  },

  options: {
    gap: 6,
  },
  opt: {
    backgroundColor: CARD_WHITE,
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1.5,
    borderColor: 'rgba(55,73,80,0.18)',
  },
  optCorrect: {
    backgroundColor: '#e8f5e9',
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1.5,
    borderColor: SUCCESS,
  },
  optWrong: {
    backgroundColor: '#fde8e8',
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1.5,
    borderColor: ERROR,
  },
  optDimmed: {
    backgroundColor: '#F5F2EE',
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1.5,
    borderColor: 'rgba(55,73,80,0.08)',
  },
  optText: {
    fontSize: 14,
    fontWeight: '600',
    color: DEEP_NAVY,
  },
  optPinyin: {
    fontSize: 11,
    color: SLATE_TEAL,
    fontStyle: 'italic',
    marginTop: 1,
  },

  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  resultText: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  nextBtn: {
    borderRadius: 9,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  nextBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
  },
});
