import { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView
} from "react-native";

// ── Tokenizer: vocab-aware, longest-match-first ───────────────────
// Given a Chinese sentence string and a vocab list, split into tokens
// that preserve multi-character words (e.g. 地方, 北京, 老师).
// Strategy: greedily match the longest known vocab word at each position,
// fall back to single character.
function tokenizeSentence(chineseSentence, vocab) {
  if (!chineseSentence) return [];

  // Build a set of known words, sorted longest-first for greedy matching
  const knownWords = vocab
    .map((v) => v.chinese)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  const tokens = [];
  let i = 0;

  while (i < chineseSentence.length) {
    // Skip punctuation / spaces — treat them as separate single tokens
    const ch = chineseSentence[i];
    if (ch === " " || ch === "　") { i++; continue; }

    // Try to match a known vocab word starting at position i
    let matched = false;
    for (const word of knownWords) {
      if (word.length > 1 && chineseSentence.startsWith(word, i)) {
        tokens.push(word);
        i += word.length;
        matched = true;
        break;
      }
    }

    // No vocab match — emit single character
    if (!matched) {
      // Check if it's punctuation to skip
      if (/[\u3000-\u303f\uff00-\uffef，。！？、；：""''（）【】《》…—~·]/.test(ch)) {
        i++; // skip punctuation silently
      } else {
        tokens.push(ch);
        i++;
      }
    }
  }

  return tokens;
}

// Fisher-Yates shuffle
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SentenceBuilder({ vocab, sentences, color, onFinish }) {
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [tiles, setTiles]           = useState([]);   // { id, word, placed: bool }
  const [answer, setAnswer]         = useState([]);   // ids in order
  const [checked, setChecked]       = useState(false);
  const [isCorrect, setIsCorrect]   = useState(false);
  const [score, setScore]           = useState(0);

  const validSentences = (sentences || []).filter((s) => s?.chinese);

  useEffect(() => {
    if (validSentences.length > 0) loadSentence(0);
  }, []);

  const loadSentence = (idx) => {
    const s = validSentences[idx];
    if (!s) return;

    const tokens = tokenizeSentence(s.chinese, vocab);
    const shuffled = shuffle(tokens.map((word, i) => ({ id: `${idx}-${i}`, word })));
    setTiles(shuffled);
    setAnswer([]);
    setChecked(false);
    setIsCorrect(false);
  };

  const placeTile = (tile) => {
    if (checked) return;
    if (answer.find((t) => t.id === tile.id)) return;
    setAnswer((prev) => [...prev, tile]);
    setTiles((prev) => prev.map((t) => t.id === tile.id ? { ...t, placed: true } : t));
  };

  const removeTile = (tile) => {
    if (checked) return;
    setAnswer((prev) => prev.filter((t) => t.id !== tile.id));
    setTiles((prev) => prev.map((t) => t.id === tile.id ? { ...t, placed: false } : t));
  };

  const checkAnswer = () => {
    const s = validSentences[sentenceIndex];
    const correctTokens = tokenizeSentence(s.chinese, vocab);
    const userTokens = answer.map((t) => t.word);
    const correct = correctTokens.join("") === userTokens.join("");
    setIsCorrect(correct);
    setChecked(true);
    if (correct) setScore((prev) => prev + 1);
  };

  const next = () => {
    const nextIdx = sentenceIndex + 1;
    if (nextIdx >= validSentences.length) {
      onFinish && onFinish(score / validSentences.length);
    } else {
      setSentenceIndex(nextIdx);
      loadSentence(nextIdx);
    }
  };

  if (validSentences.length === 0) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyText}>No sentences available for this lesson.</Text>
      </View>
    );
  }

  const sentence = validSentences[sentenceIndex];
  const isLast = sentenceIndex + 1 >= validSentences.length;

  return (
    <ScrollView contentContainerStyle={s.container}>
      {/* Progress */}
      <View style={s.progressRow}>
        <Text style={s.progressText}>{sentenceIndex + 1} / {validSentences.length}</Text>
        <View style={s.progressBg}>
          <View style={[s.progressFill, { width: `${((sentenceIndex + 1) / validSentences.length) * 100}%`, backgroundColor: color }]} />
        </View>
        <Text style={s.scoreText}>⭐ {score}</Text>
      </View>

      {/* Instruction */}
      <View style={[s.instructionBox, { borderColor: color }]}>
        <Text style={s.instructionLabel}>🧩 Build this sentence:</Text>
        <Text style={s.englishSentence}>{sentence.english}</Text>
        {sentence.pinyin && <Text style={s.pinyinSentence}>{sentence.pinyin}</Text>}
      </View>

      {/* Answer tray */}
      <View style={s.answerTray}>
        {answer.length === 0 && (
          <Text style={s.answerPlaceholder}>Tap words below to build the sentence</Text>
        )}
        <View style={s.tileRow}>
          {answer.map((tile) => (
            <TouchableOpacity
              key={tile.id}
              style={[s.tile, s.tileAnswer, { borderColor: color },
                checked && (isCorrect ? s.tileCorrect : s.tileWrong)]}
              onPress={() => removeTile(tile)}
              disabled={checked}
              activeOpacity={0.75}
            >
              <Text style={[s.tileText, checked && s.tileTextWhite]}>{tile.word}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Word bank */}
      <View style={s.bankLabel}>
        <Text style={s.bankLabelText}>Word Bank</Text>
      </View>
      <View style={s.tileRow}>
        {tiles.map((tile) => (
          <TouchableOpacity
            key={tile.id}
            style={[s.tile, tile.placed && s.tilePlaced]}
            onPress={() => !tile.placed && placeTile(tile)}
            disabled={tile.placed || checked}
            activeOpacity={0.75}
          >
            <Text style={[s.tileText, tile.placed && s.tileTextFaded]}>{tile.word}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Check / feedback */}
      {!checked && answer.length > 0 && (
        <TouchableOpacity style={[s.checkBtn, { backgroundColor: color }]} onPress={checkAnswer}>
          <Text style={s.checkBtnText}>Check Answer ✓</Text>
        </TouchableOpacity>
      )}

      {checked && (
        <>
          <View style={[s.feedbackBox, { backgroundColor: isCorrect ? "#d4edda" : "#fdecea" }]}>
            <Text style={s.feedbackText}>
              {isCorrect ? "✅ Correct! 太棒了！" : `❌ Correct answer: ${sentence.chinese}`}
            </Text>
          </View>
          <TouchableOpacity style={[s.nextBtn, { backgroundColor: color }]} onPress={next}>
            <Text style={s.nextBtnText}>{isLast ? "Finish 🏆" : "Next Sentence →"}</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:          { padding: 16, paddingBottom: 48 },
  empty:              { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyText:          { fontSize: 15, color: "#636e72", textAlign: "center" },

  progressRow:        { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  progressText:       { fontSize: 12, color: "#636e72", fontWeight: "600", minWidth: 36 },
  progressBg:         { flex: 1, height: 6, backgroundColor: "#dfe6e9", borderRadius: 3, overflow: "hidden" },
  progressFill:       { height: "100%", borderRadius: 3 },
  scoreText:          { fontSize: 14, fontWeight: "700", color: "#2d3436" },

  instructionBox:     { backgroundColor: "#1a1a2e", borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 2 },
  instructionLabel:   { fontSize: 12, fontWeight: "700", color: "#a29bfe", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  englishSentence:    { fontSize: 17, fontWeight: "700", color: "#fff", lineHeight: 24 },
  pinyinSentence:     { fontSize: 13, color: "#a29bfe", marginTop: 6, fontStyle: "italic" },

  answerTray:         { minHeight: 72, backgroundColor: "#f8f9fa", borderRadius: 14, padding: 12, marginBottom: 12, borderWidth: 2, borderColor: "#dfe6e9", borderStyle: "dashed" },
  answerPlaceholder:  { fontSize: 13, color: "#b2bec3", textAlign: "center", marginTop: 8 },

  bankLabel:          { marginBottom: 8 },
  bankLabelText:      { fontSize: 12, color: "#636e72", fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },

  tileRow:            { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  tile:               { backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1.5, borderColor: "#dfe6e9", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
  tileAnswer:         { borderWidth: 2 },
  tilePlaced:         { backgroundColor: "#f1f2f6", borderColor: "#dfe6e9" },
  tileCorrect:        { backgroundColor: "#1DD1A1", borderColor: "#1DD1A1" },
  tileWrong:          { backgroundColor: "#FF6B6B", borderColor: "#FF6B6B" },
  tileText:           { fontSize: 18, fontWeight: "700", color: "#2d3436" },
  tileTextFaded:      { color: "#b2bec3" },
  tileTextWhite:      { color: "#fff" },

  checkBtn:           { padding: 16, borderRadius: 14, alignItems: "center", marginTop: 12 },
  checkBtnText:       { fontSize: 15, fontWeight: "800", color: "#fff" },

  feedbackBox:        { borderRadius: 12, padding: 14, marginTop: 12, marginBottom: 8 },
  feedbackText:       { fontSize: 14, fontWeight: "700", color: "#2d3436" },
  nextBtn:            { padding: 16, borderRadius: 14, alignItems: "center" },
  nextBtnText:        { fontSize: 15, fontWeight: "800", color: "#fff" },
});
