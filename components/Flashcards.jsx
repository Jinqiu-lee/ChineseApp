import { useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Dimensions
} from "react-native";

const { width } = Dimensions.get("window");

export default function FlashCard({ card, color, onCorrect, onSkip, cardIndex, totalCards }) {
  const [flipped, setFlipped] = useState(false);
  const [answered, setAnswered] = useState(false); // "correct" | "skip" | false
  const flipAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const flipCard = () => {
    if (answered) return;
    const toValue = flipped ? 0 : 1;
    Animated.spring(flipAnim, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setFlipped(!flipped);
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const handleCorrect = () => {
    setAnswered("correct");
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.08, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start(() => setTimeout(onCorrect, 300));
  };

  const handleSkip = () => {
    setAnswered("skip");
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start(() => setTimeout(onSkip, 300));
  };

  // Tone colour mapping
  const toneColors = ["#e74c3c", "#f39c12", "#27ae60", "#3498db", "#95a5a6"];
  const getToneColor = (tone) => toneColors[(tone || 1) - 1] || "#95a5a6";

  // Render pinyin with coloured tones
  const renderPinyinWithTones = (pinyin, tones) => {
    if (!tones || !pinyin) return <Text style={styles.pinyinText}>{pinyin}</Text>;
    const syllables = pinyin.split(" ");
    return (
      <View style={styles.pinyinRow}>
        {syllables.map((syl, i) => (
          <Text
            key={i}
            style={[styles.pinyinSyllable, { color: getToneColor(tones[i]) }]}
          >
            {syl}
            {i < syllables.length - 1 ? " " : ""}
          </Text>
        ))}
      </View>
    );
  };

  const borderColor = answered === "correct"
    ? "#1DD1A1"
    : answered === "skip"
    ? "#FF6B6B"
    : color;

  return (
    <View style={styles.wrapper}>
      {/* Progress */}
      <View style={styles.progressRow}>
        <Text style={styles.progressText}>
          {cardIndex + 1} / {totalCards}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((cardIndex + 1) / totalCards) * 100}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>

      {/* Tone Legend */}
      <View style={styles.toneLegend}>
        {["1st ā", "2nd á", "3rd ǎ", "4th à", "neutral"].map((t, i) => (
          <View key={i} style={styles.toneBadge}>
            <View style={[styles.toneDot, { backgroundColor: toneColors[i] }]} />
            <Text style={styles.toneLabel}>{t}</Text>
          </View>
        ))}
      </View>

      {/* Flip Card */}
      <TouchableOpacity onPress={flipCard} activeOpacity={0.95} style={styles.cardTouchable}>
        <Animated.View
          style={[
            styles.cardContainer,
            {
              transform: [
                { scale: scaleAnim },
                { translateX: shakeAnim },
              ],
              borderColor,
            },
          ]}
        >
          {/* Front Face */}
          <Animated.View
            style={[
              styles.cardFace,
              styles.cardFront,
              { backfaceVisibility: "hidden", transform: [{ rotateY: frontInterpolate }] },
            ]}
          >
            <Text style={styles.tapHint}>Tap to reveal</Text>
            <Text style={styles.chineseChar}>{card.chinese}</Text>
            <Text style={styles.partOfSpeech}>{card.part_of_speech?.replace(/_/g, " ")}</Text>
          </Animated.View>

          {/* Back Face */}
          <Animated.View
            style={[
              styles.cardFace,
              styles.cardBack,
              { backfaceVisibility: "hidden", transform: [{ rotateY: backInterpolate }] },
            ]}
          >
            <Text style={styles.tapHint}>Tap to flip back</Text>
            {renderPinyinWithTones(card.pinyin, card.tones)}
            <Text style={styles.englishText}>{card.english}</Text>
            <Text style={styles.chineseSmall}>{card.chinese}</Text>
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.skipBtn]}
          onPress={handleSkip}
          disabled={!!answered}
        >
          <Text style={styles.skipBtnText}>😅  Not Familiar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.correctBtn, { backgroundColor: color }]}
          onPress={handleCorrect}
          disabled={!!answered}
        >
          <Text style={styles.correctBtnText}>✓  Got It!</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>
        {flipped
          ? "Did you know it? → Got It!   Unsure? → Not Familiar"
          : "Tap the card to see the answer"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  progressRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  progressText: {
    fontSize: 13,
    color: "#636e72",
    fontWeight: "600",
    minWidth: 40,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#dfe6e9",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  toneLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    marginBottom: 16,
  },
  toneBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  toneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  toneLabel: {
    fontSize: 10,
    color: "#636e72",
    fontWeight: "500",
  },
  cardTouchable: {
    width: width - 40,
    height: 240,
    marginBottom: 20,
  },
  cardContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    borderWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardFace: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  cardFront: {
    backgroundColor: "#1a1a2e",
  },
  cardBack: {
    backgroundColor: "#fff",
  },
  tapHint: {
    position: "absolute",
    top: 14,
    right: 16,
    fontSize: 11,
    color: "#b2bec3",
    fontStyle: "italic",
  },
  chineseChar: {
    fontSize: 68,
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 4,
  },
  partOfSpeech: {
    position: "absolute",
    bottom: 16,
    fontSize: 11,
    color: "#636e72",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  pinyinRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 10,
  },
  pinyinSyllable: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 1,
  },
  pinyinText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2d3436",
    marginBottom: 10,
  },
  englishText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#2d3436",
    textAlign: "center",
  },
  chineseSmall: {
    fontSize: 16,
    color: "#b2bec3",
    marginTop: 8,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  skipBtn: {
    backgroundColor: "#f1f2f6",
  },
  correctBtn: {},
  skipBtnText: {
    color: "#636e72",
    fontWeight: "700",
    fontSize: 15,
  },
  correctBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  hint: {
    marginTop: 16,
    fontSize: 13,
    color: "#b2bec3",
    fontStyle: "italic",
  },
});
