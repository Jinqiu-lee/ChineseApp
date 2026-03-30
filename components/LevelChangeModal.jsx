import { useRef, useEffect } from "react";
import {
  Modal, View, Text, TouchableOpacity,
  StyleSheet, Animated, ScrollView, Pressable, SafeAreaView,
} from "react-native";
import { DEEP_NAVY, SLATE_TEAL, WARM_BROWN, CARD_WHITE } from "../constants/colors";

const ALL_LEVELS = [
  { id: "hsk1", label: "Level 1 – Beginner",             badge: "🌱", color: "#00D2D3", desc: "Complete beginner, starting from scratch" },
  { id: "hsk2", label: "Level 2 – Explorer",             badge: "🚶", color: "#54A0FF", desc: "Know basics, ready to build vocabulary" },
  { id: "hsk3", label: "Level 3 – Conversation Builder", badge: "🗣",  color: "#1DD1A1", desc: "Can hold simple conversations" },
  { id: "hsk4", label: "Level 4 – Confident Speaker",    badge: "🌟", color: "#FF9F43", desc: "Comfortable with everyday Chinese" },
  { id: "hsk5", label: "Level 5 – Communicator",         badge: "🔥", color: "#a29bfe", desc: "Advanced, near-fluent communication" },
];

// Given a level id, return the one step down
export function getDowngradedLevel(currentLevelId) {
  const idx = ALL_LEVELS.findIndex((l) => l.id === currentLevelId);
  if (idx <= 0) return null;
  return ALL_LEVELS[idx - 1];
}

// Given a level id, return the one step up
export function getUpgradedLevel(currentLevelId) {
  const idx = ALL_LEVELS.findIndex((l) => l.id === currentLevelId);
  if (idx < 0 || idx >= ALL_LEVELS.length - 1) return null;
  return ALL_LEVELS[idx + 1];
}

export default function LevelChangeModal({
  visible,
  onClose,
  onConfirm,           // (newLevelId) => void
  currentLevelId,      // current recommended level
  mode = "manual",     // "manual" | "suggest"
  poorScorePct = null, // e.g. 0.38 — shown in suggest mode
}) {
  const slideAnim = useRef(new Animated.Value(400)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(400);
    }
  }, [visible]);

  const currentLevel = ALL_LEVELS.find((l) => l.id === currentLevelId);
  const suggestedDown = getDowngradedLevel(currentLevelId);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[m.overlay, { opacity: fadeAnim }]}>
        <Pressable style={m.backdrop} onPress={onClose} />

        <Animated.View style={[m.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <SafeAreaView>
            {/* Handle */}
            <View style={m.handle} />

            {/* ── Suggest mode header ── */}
            {mode === "suggest" && (
              <View style={m.suggestBanner}>
                <Text style={m.suggestEmoji}>📉</Text>
                <View style={m.suggestText}>
                  <Text style={m.suggestTitle}>Lesson was tough!</Text>
                  <Text style={m.suggestSub}>
                    You got {Math.round((poorScorePct ?? 0) * 100)}% on this lesson.{"\n"}
                    It's totally okay to step down a level.
                  </Text>
                </View>
              </View>
            )}

            {/* ── Manual mode header ── */}
            {mode === "manual" && (
              <View style={m.manualHeader}>
                <Text style={m.manualTitle}>Change Your Level</Text>
                <Text style={m.manualSub}>Pick a new level — this is a one-time change</Text>
              </View>
            )}

            {/* Current level */}
            {currentLevel && (
              <View style={m.currentRow}>
                <Text style={m.currentLabel}>Current level:</Text>
                <View style={[m.currentBadge, { backgroundColor: currentLevel.color }]}>
                  <Text style={m.currentBadgeText}>{currentLevel.badge} {currentLevel.label}</Text>
                </View>
              </View>
            )}

            {/* ── Suggest mode: just show one step down ── */}
            {mode === "suggest" && suggestedDown && (
              <View style={m.suggestOptions}>
                <TouchableOpacity
                  style={[m.suggestBtn, { borderColor: suggestedDown.color }]}
                  onPress={() => onConfirm(suggestedDown.id)}
                  activeOpacity={0.8}
                >
                  <Text style={m.suggestBtnEmoji}>{suggestedDown.badge}</Text>
                  <View style={m.suggestBtnInfo}>
                    <Text style={[m.suggestBtnLabel, { color: suggestedDown.color }]}>
                      Switch to {suggestedDown.label}
                    </Text>
                    <Text style={m.suggestBtnDesc}>{suggestedDown.desc}</Text>
                  </View>
                  <Text style={[m.suggestBtnArrow, { color: suggestedDown.color }]}>→</Text>
                </TouchableOpacity>

                <TouchableOpacity style={m.keepBtn} onPress={onClose} activeOpacity={0.7}>
                  <Text style={m.keepBtnText}>No thanks, I'll keep trying 💪</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Manual mode: full list ── */}
            {mode === "manual" && (
              <ScrollView style={m.listScroll} showsVerticalScrollIndicator={false}>
                {ALL_LEVELS.map((lvl) => {
                  const isCurrent = lvl.id === currentLevelId;
                  return (
                    <TouchableOpacity
                      key={lvl.id}
                      style={[m.listItem, { borderColor: isCurrent ? lvl.color : "rgba(255,255,255,0.08)" }, isCurrent && m.listItemCurrent]}
                      onPress={() => { if (!isCurrent) onConfirm(lvl.id); }}
                      activeOpacity={isCurrent ? 1 : 0.75}
                    >
                      <Text style={m.listEmoji}>{lvl.badge}</Text>
                      <View style={m.listInfo}>
                        <Text style={[m.listLabel, { color: isCurrent ? lvl.color : DEEP_NAVY }]}>
                          {lvl.label} {isCurrent ? "← current" : ""}
                        </Text>
                        <Text style={m.listDesc}>{lvl.desc}</Text>
                      </View>
                      {!isCurrent && <Text style={[m.listArrow, { color: lvl.color }]}>→</Text>}
                      {isCurrent && <View style={[m.activeDot, { backgroundColor: lvl.color }]} />}
                    </TouchableOpacity>
                  );
                })}
                <View style={{ height: 24 }} />
              </ScrollView>
            )}
          </SafeAreaView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const m = StyleSheet.create({
  overlay:       { flex: 1, justifyContent: "flex-end" },
  backdrop:      { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet:         { backgroundColor: CARD_WHITE, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingBottom: 8, maxHeight: "85%" },
  handle:        { width: 40, height: 4, backgroundColor: "rgba(155,104,70,0.25)", borderRadius: 2, alignSelf: "center", marginTop: 12, marginBottom: 16 },

  suggestBanner: { flexDirection: "row", alignItems: "flex-start", backgroundColor: "rgba(232,82,42,0.08)", borderRadius: 16, padding: 14, marginBottom: 16, gap: 12, borderWidth: 1, borderColor: "rgba(232,82,42,0.20)" },
  suggestEmoji:  { fontSize: 32 },
  suggestText:   { flex: 1 },
  suggestTitle:  { fontSize: 17, fontWeight: "800", color: DEEP_NAVY, marginBottom: 4 },
  suggestSub:    { fontSize: 13, color: SLATE_TEAL, lineHeight: 20 },

  manualHeader:  { marginBottom: 16 },
  manualTitle:   { fontSize: 20, fontWeight: "800", color: DEEP_NAVY, marginBottom: 4 },
  manualSub:     { fontSize: 13, color: SLATE_TEAL },

  currentRow:    { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  currentLabel:  { fontSize: 13, color: SLATE_TEAL },
  currentBadge:  { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  currentBadgeText: { fontSize: 13, fontWeight: "800", color: CARD_WHITE },

  suggestOptions:{ gap: 10, marginBottom: 8 },
  suggestBtn:    { flexDirection: "row", alignItems: "center", backgroundColor: CARD_WHITE, borderRadius: 16, padding: 16, borderWidth: 2, gap: 12 },
  suggestBtnEmoji: { fontSize: 28 },
  suggestBtnInfo:  { flex: 1 },
  suggestBtnLabel: { fontSize: 17, fontWeight: "800" },
  suggestBtnDesc:  { fontSize: 12, color: SLATE_TEAL, marginTop: 2 },
  suggestBtnArrow: { fontSize: 20, fontWeight: "700" },
  keepBtn:       { padding: 16, alignItems: "center" },
  keepBtnText:   { fontSize: 14, color: WARM_BROWN, fontWeight: "600" },

  listScroll:    { maxHeight: 400 },
  listItem:      { flexDirection: "row", alignItems: "center", backgroundColor: CARD_WHITE, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: "rgba(155,104,70,0.20)", gap: 12 },
  listItemCurrent: { backgroundColor: "rgba(155,104,70,0.08)" },
  listEmoji:     { fontSize: 24, width: 32, textAlign: "center" },
  listInfo:      { flex: 1 },
  listLabel:     { fontSize: 15, fontWeight: "700" },
  listDesc:      { fontSize: 11, color: SLATE_TEAL, marginTop: 2 },
  listArrow:     { fontSize: 18, fontWeight: "700" },
  activeDot:     { width: 8, height: 8, borderRadius: 4 },
});
