import { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView
} from "react-native";

// ── Tokenizer: vocab-aware, longest-match-first ───────────────────
// Given a Chinese sentence string and a vocab list, split into tokens
// that preserve multi-character words (e.g. 地方, 北京, 老师).
// Strategy: greedily match the longest known vocab word at each position,
// fall back to single character.
// Words that must always stay together even when absent from lesson vocab.
// Sorted longest-first so 3-char entries beat their 2-char sub-strings.
const SUPPLEMENT_WORDS = [
  '来不及','来得及','不得不','不得了','了不起','差不多','没关系',
  '没问题','不一定','不知道','不应该','不可以','不需要','不仅仅','不仅是',
  '不仅','不但','而且','虽然','但是','因为','所以','如果','因此',
  '即使','尽管','随着','由于','通过','既然','否则','然而','不过',
  '况且','何况','甚至','反而','其实','总之','毕竟','除非','只要',
  '只有','无论','不管','相反','已经','刚才','马上','立刻','突然',
  '仍然','依然','竟然','居然','果然','当然','确实','真正','几乎',
  '大约','可能','也许','应该','需要','可以','能够','必须','愿意',
  '打算','计划','希望','觉得','认为','知道','发现','相信','担心',
  '害怕','决定','选择','继续','开始','结束','完成','实现','达到',
  '满足','超过','减少','增加','提高','改变','发展','解决','处理',
  '分析','研究','管理','控制','保持','保证','负责','注意','了解',
  '关心','支持','帮助','参加','提供','建议','检查','安排','准备',
  '推迟','取消','举办','进行','影响','联系','表示','表达','翻译',
  '解释','说明','描述','项目','员工','合理','赚钱','打针','工作',
  '学习','生活','运动','锻炼','休息','旅行','购物','做饭','打扫',
  '洗衣','上班','下班','上课','下课','回家','出门','出发','到达',
  '离开','经济','社会','政府','环境','问题','情况','原因','结果',
  '方法','方式','效果','条件','要求','标准','质量','内容','关系',
  '态度','习惯','能力','机会','责任','目标','未来','过去','现在',
  '以前','以后','刚刚','总是','经常','偶尔','从来','永远','完全',
  '基本','一般','特别','非常','十分','相当','比较','有点','一些',
  '有些','各种','所有','全部','部分','许多','大量','少量','更加',
  '另外','此外','其中','其他','以及','并且','或者','还是','就是',
  '不是','正是','都是','互相','彼此','自己','自然','当时','同时',
  '经过','关于','对于','根据','按照','除了','包括','比如','例如',
  '尤其','主要','重要','必要','实际','真实','直接','间接',
].sort((a, b) => b.length - a.length);

function tokenizeSentence(chineseSentence, vocab) {
  if (!chineseSentence) return [];

  // Build a set of known words, sorted longest-first for greedy matching
  const knownWords = [
    ...SUPPLEMENT_WORDS,
    ...vocab.map((v) => v.chinese).filter(Boolean),
  ].sort((a, b) => b.length - a.length);

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
