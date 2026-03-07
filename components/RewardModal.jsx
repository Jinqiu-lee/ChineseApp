import { useEffect, useRef, useState } from "react";
import {
  Modal, View, Text, TouchableOpacity,
  StyleSheet, Animated, SafeAreaView,
} from "react-native";
import { getRank, getXPToNextRank, ALL_BADGES } from "../hooks/useProgress";

// ── Animated star component ───────────────────────────────────────
function AnimatedStar({ delay, size = 28 }) {
  const scale = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 80 }),
        Animated.timing(rotate, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <Animated.Text style={[{ fontSize: size }, { transform: [{ scale }, { rotate: spin }] }]}>
      ⭐
    </Animated.Text>
  );
}

// ── XP bar animation ──────────────────────────────────────────────
function XPBar({ totalXP, xpEarned, color }) {
  const { progress, nextRank, xpNeeded } = getXPToNextRank(totalXP - xpEarned); // before
  const { progress: newProgress } = getXPToNextRank(totalXP); // after
  const barAnim = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: newProgress,
      duration: 800,
      delay: 400,
      useNativeDriver: false,
    }).start();
  }, []);

  const width = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={xp.container}>
      <View style={xp.labelRow}>
        <Text style={xp.label}>XP Progress</Text>
        {nextRank && <Text style={xp.nextLabel}>{xpNeeded} XP to {nextRank.rank}</Text>}
      </View>
      <View style={xp.barBg}>
        <Animated.View style={[xp.barFill, { width, backgroundColor: color }]} />
      </View>
      <Text style={xp.totalLabel}>{totalXP} XP total</Text>
    </View>
  );
}

// ── Main RewardModal ──────────────────────────────────────────────
export default function RewardModal({ visible, onClose, xpEarned = 0, scorePercent = 1, totalXP = 0, newBadges = [], streak = 0 }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;

  const rank = getRank(totalXP);
  const starCount = scorePercent >= 1 ? 3 : scorePercent >= 0.6 ? 2 : 1;
  const newBadgeObjects = ALL_BADGES.filter((b) => newBadges.includes(b.id));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 60, useNativeDriver: true }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(60);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.card, { transform: [{ translateY: slideAnim }] }]}>

          {/* Stars */}
          <View style={styles.starsRow}>
            {[0, 1, 2].map((i) => (
              i < starCount
                ? <AnimatedStar key={i} delay={i * 150} size={i === 1 ? 40 : 28} />
                : <Text key={i} style={styles.starEmpty}>☆</Text>
            ))}
          </View>

          {/* Result headline */}
          <Text style={styles.headline}>
            {scorePercent >= 1 ? "Perfect! 太棒了！" : scorePercent >= 0.6 ? "Well done! 很好！" : "Keep going! 加油！"}
          </Text>

          {/* XP earned */}
          <View style={[styles.xpBadge, { backgroundColor: rank.color + "22", borderColor: rank.color }]}>
            <Text style={[styles.xpEarned, { color: rank.color }]}>+{xpEarned} XP</Text>
            <Text style={[styles.rankLabel, { color: rank.color }]}>{rank.rankChinese} · {rank.rank}</Text>
          </View>

          {/* XP bar */}
          <XPBar totalXP={totalXP} xpEarned={xpEarned} color={rank.color} />

          {/* Streak */}
          {streak > 0 && (
            <View style={styles.streakRow}>
              <Text style={styles.streakFire}>🔥</Text>
              <Text style={styles.streakText}>{streak} day streak!</Text>
            </View>
          )}

          {/* New badges */}
          {newBadgeObjects.length > 0 && (
            <View style={styles.badgesSection}>
              <Text style={styles.badgesTitle}>🎉 New Badge{newBadgeObjects.length > 1 ? "s" : ""} Unlocked!</Text>
              {newBadgeObjects.map((b) => (
                <View key={b.id} style={styles.badgeRow}>
                  <Text style={styles.badgeEmoji}>{b.emoji}</Text>
                  <View>
                    <Text style={styles.badgeName}>{b.name} · {b.nameChinese}</Text>
                    <Text style={styles.badgeDesc}>{b.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Continue button */}
          <TouchableOpacity style={[styles.continueBtn, { backgroundColor: rank.color }]} onPress={onClose}>
            <Text style={styles.continueBtnText}>Continue  继续 →</Text>
          </TouchableOpacity>

        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: "#1a1a2e",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 48,
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 16,
  },
  starEmpty: { fontSize: 28, color: "#636e72" },
  headline: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
  },
  xpBadge: {
    alignSelf: "center",
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  xpEarned: { fontSize: 28, fontWeight: "900" },
  rankLabel: { fontSize: 13, fontWeight: "600", marginTop: 2, letterSpacing: 0.5 },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 16,
    backgroundColor: "rgba(255,243,205,0.1)",
    padding: 10,
    borderRadius: 12,
  },
  streakFire: { fontSize: 22 },
  streakText: { fontSize: 16, fontWeight: "700", color: "#ffeaa7" },
  badgesSection: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  badgesTitle: { fontSize: 14, fontWeight: "700", color: "#fff", marginBottom: 10 },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  badgeEmoji: { fontSize: 28 },
  badgeName: { fontSize: 14, fontWeight: "700", color: "#fff" },
  badgeDesc: { fontSize: 12, color: "#636e72", marginTop: 1 },
  continueBtn: {
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 4,
  },
  continueBtnText: { fontSize: 16, fontWeight: "800", color: "#fff" },
});

const xp = StyleSheet.create({
  container: { marginBottom: 14 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  label: { fontSize: 12, color: "#636e72", fontWeight: "600" },
  nextLabel: { fontSize: 12, color: "#636e72" },
  barBg: { height: 8, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 4, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 4 },
  totalLabel: { fontSize: 11, color: "#636e72", marginTop: 4, textAlign: "right" },
});
