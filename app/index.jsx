import { useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, StatusBar
} from "react-native";
import { useDrawer } from "../contexts/AppContexts";
import useProgress, { getRank, getXPToNextRank } from "../hooks/useProgress";
import LevelChangeModal from "../components/LevelChangeModal";

const LEVELS = [
  { id: "yct1", label: "YCT 1", emoji: "🌱", color: "#FF6B6B", age: "Age 5–7",     lessons: 11 },
  { id: "yct2", label: "YCT 2", emoji: "🌿", color: "#FF9F43", age: "Age 7–8",     lessons: 3  },
  { id: "yct3", label: "YCT 3", emoji: "🌳", color: "#54A0FF", age: "Age 8–12",    lessons: 2  },
  { id: "yct4", label: "YCT 4", emoji: "🌲", color: "#5F27CD", age: "Age 10–12",   lessons: 2  },
  { id: "hsk1", label: "HSK 1", emoji: "⭐",     color: "#00D2D3", age: "Adults / 10+", lessons: 3 },
  { id: "hsk2", label: "HSK 2", emoji: "⭐⭐",   color: "#FF6B6B", age: "Adults / 10+", lessons: 2 },
  { id: "hsk3", label: "HSK 3", emoji: "⭐⭐⭐", color: "#1DD1A1", age: "Adults / 12+", lessons: 2 },
];

const LESSON_COUNTS = { yct1: 11, yct2: 3, yct3: 2, yct4: 2, hsk1: 3, hsk2: 2, hsk3: 2 };

export default function HomeScreen({ navigation }) {
  const drawer = useDrawer();
  const { progress, loaded, changeLevel, poorLessonAlert, dismissPoorAlert } = useProgress();

  const [manualModalVisible, setManualModalVisible] = useState(false);

  // FIX 4: use placement badge when XP is 0
  const xpRank = getRank(progress.totalXP);
  const placement = progress.placementResult;
  const displayRank = progress.totalXP === 0 && placement
    ? { rankChinese: placement.levelChinese, rank: placement.level, color: placement.color }
    : xpRank;
  const { progress: rankProgress, nextRank } = getXPToNextRank(progress.totalXP);

  // Current recommended level (from placement or manual change)
  const currentLevelId = progress.currentRecommendedLevel
    || progress.placementResult?.recommendedLevel
    || null;
  const currentLevelObj = LEVELS.find((l) => l.id === currentLevelId);

  const handleLevelChange = (newLevelId) => {
    changeLevel(newLevelId);
    setManualModalVisible(false);
  };

  const handleSuggestConfirm = (newLevelId) => {
    changeLevel(newLevelId);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <ScrollView contentContainerStyle={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuBtn} onPress={() => drawer.open(navigation)}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.appTitle}>学中文</Text>
          <Text style={styles.appSubtitle}>Learn Chinese</Text>
          <Text style={styles.appTagline}>Choose your level to begin 🎮</Text>
        </View>

        {/* Stats bar */}
        {loaded && (
          <View style={styles.statsBar}>
            <View style={styles.statsLeft}>
              <View style={[styles.rankBadge, { backgroundColor: displayRank.color }]}>
                <Text style={styles.rankText}>{displayRank.rankChinese}</Text>
              </View>
              <View style={styles.xpBarWrap}>
                <View style={styles.xpBarBg}>
                  <View style={[styles.xpBarFill, { width: `${rankProgress * 100}%`, backgroundColor: displayRank.color }]} />
                </View>
                <Text style={styles.xpLabel}>
                  {progress.totalXP} XP{nextRank ? ` · ${nextRank.rank} next` : " · Max Rank!"}
                </Text>
              </View>
            </View>
            <View style={styles.statsRight}>
              <Text style={styles.streakFire}>🔥</Text>
              <Text style={[styles.streakNum, { color: displayRank.color }]}>{progress.streak}</Text>
            </View>
          </View>
        )}

        {/* Current level + Change button */}
        {loaded && currentLevelObj && (
          <View style={styles.currentLevelBar}>
            <View style={styles.currentLevelLeft}>
              <Text style={styles.currentLevelMeta}>Your Level</Text>
              <View style={styles.currentLevelRow}>
                <Text style={[styles.currentLevelBadge, { color: currentLevelObj.color }]}>
                  {currentLevelObj.emoji}
                </Text>
                <Text style={[styles.currentLevelLabel, { color: currentLevelObj.color }]}>
                  {currentLevelObj.label}
                </Text>
                <Text style={styles.currentLevelDesc}>{currentLevelObj.age}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.changeLevelBtn, { borderColor: currentLevelObj.color }]}
              onPress={() => setManualModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.changeLevelBtnText, { color: currentLevelObj.color }]}>
                Change
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Level Cards */}
        <View style={styles.grid}>
          {LEVELS.map((level) => {
            const lvlProg = progress.levelProgress?.[level.id];
            const completed = lvlProg?.lessonsCompleted?.length || 0;
            const total = LESSON_COUNTS[level.id];
            const pct = completed / total;
            const isComplete = completed >= total;
            const isRecommended = level.id === currentLevelId;

            return (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.card,
                  { borderColor: level.color },
                  isRecommended && styles.cardRecommended,
                ]}
                onPress={() => navigation.navigate("Unit", { level })}
                activeOpacity={0.85}
              >
                {isComplete && (
                  <View style={[styles.completeBadge, { backgroundColor: level.color }]}>
                    <Text style={styles.completeBadgeText}>✓</Text>
                  </View>
                )}
                {isRecommended && !isComplete && (
                  <View style={[styles.recommendedBadge, { backgroundColor: level.color }]}>
                    <Text style={styles.recommendedBadgeText}>★</Text>
                  </View>
                )}

                <Text style={styles.cardEmoji}>{level.emoji}</Text>
                <Text style={[styles.cardLabel, { color: level.color }]}>{level.label}</Text>
                <Text style={styles.cardAge}>{level.age}</Text>

                <View style={[styles.pill, { backgroundColor: level.color + "22" }]}>
                  <Text style={[styles.pillText, { color: level.color }]}>
                    {level.lessons} {level.lessons === 1 ? "lesson" : "lessons"}
                  </Text>
                </View>

                {completed > 0 && (
                  <View style={styles.progressWrap}>
                    <View style={styles.progressBg}>
                      <View style={[styles.progressFill, { width: `${pct * 100}%`, backgroundColor: level.color }]} />
                    </View>
                    <Text style={[styles.progressText, { color: level.color }]}>{completed}/{total}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.footer}>More levels coming soon! 🚀</Text>
      </ScrollView>

      {/* Manual level change modal — always accessible */}
      <LevelChangeModal
        visible={manualModalVisible}
        onClose={() => setManualModalVisible(false)}
        onConfirm={handleLevelChange}
        currentLevelId={currentLevelId}
        mode="manual"
      />

      {/* Auto-suggest modal — shown when lesson avg < 50% */}
      <LevelChangeModal
        visible={!!poorLessonAlert}
        onClose={dismissPoorAlert}
        onConfirm={handleSuggestConfirm}
        currentLevelId={poorLessonAlert?.levelId || currentLevelId}
        mode="suggest"
        poorScorePct={poorLessonAlert?.avgScore}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: "#1a1a2e" },
  container:    { paddingHorizontal: 16, paddingBottom: 40 },
  header:       { alignItems: "center", paddingTop: 32, paddingBottom: 20, position: "relative" },
  menuBtn:      { position: "absolute", top: 32, left: 0, padding: 8 },
  menuIcon:     { fontSize: 26, color: "#fff" },
  appTitle:     { fontSize: 52, fontWeight: "800", color: "#FFFFFF", letterSpacing: 4 },
  appSubtitle:  { fontSize: 18, color: "#a29bfe", letterSpacing: 6, marginTop: 4, fontWeight: "300" },
  appTagline:   { fontSize: 14, color: "#636e72", marginTop: 12, letterSpacing: 0.5 },

  // Stats bar
  statsBar:     { flexDirection: "row", alignItems: "center", backgroundColor: "#16213e", borderRadius: 16, padding: 14, marginBottom: 10, gap: 12 },
  statsLeft:    { flex: 1, gap: 6 },
  rankBadge:    { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  rankText:     { fontSize: 12, fontWeight: "800", color: "#fff", letterSpacing: 0.5 },
  xpBarWrap:    { gap: 4 },
  xpBarBg:      { height: 6, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" },
  xpBarFill:    { height: "100%", borderRadius: 3 },
  xpLabel:      { fontSize: 11, color: "#636e72" },
  statsRight:   { alignItems: "center" },
  streakFire:   { fontSize: 20 },
  streakNum:    { fontSize: 18, fontWeight: "900" },

  // Current level bar
  currentLevelBar:   { flexDirection: "row", alignItems: "center", backgroundColor: "#16213e", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16, justifyContent: "space-between" },
  currentLevelLeft:  { flex: 1 },
  currentLevelMeta:  { fontSize: 10, color: "#636e72", fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  currentLevelRow:   { flexDirection: "row", alignItems: "center", gap: 6 },
  currentLevelBadge: { fontSize: 18 },
  currentLevelLabel: { fontSize: 16, fontWeight: "800" },
  currentLevelDesc:  { fontSize: 12, color: "#636e72", marginLeft: 4 },
  changeLevelBtn:    { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  changeLevelBtnText:{ fontSize: 13, fontWeight: "700" },

  // Grid
  grid:              { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 },
  card:              { width: "47%", backgroundColor: "#16213e", borderRadius: 20, padding: 20, alignItems: "center", borderWidth: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5, position: "relative" },
  cardRecommended:   { borderWidth: 2.5 },
  completeBadge:     { position: "absolute", top: 10, right: 10, width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  completeBadgeText: { fontSize: 12, color: "#fff", fontWeight: "800" },
  recommendedBadge:  { position: "absolute", top: 10, right: 10, width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  recommendedBadgeText: { fontSize: 12, color: "#fff", fontWeight: "800" },
  cardEmoji:         { fontSize: 32, marginBottom: 8 },
  cardLabel:         { fontSize: 22, fontWeight: "800", letterSpacing: 1 },
  cardAge:           { fontSize: 11, color: "#636e72", marginTop: 4, textAlign: "center" },
  pill:              { marginTop: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  pillText:          { fontSize: 11, fontWeight: "600" },
  progressWrap:      { width: "100%", marginTop: 10, gap: 3 },
  progressBg:        { height: 4, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden" },
  progressFill:      { height: "100%", borderRadius: 2 },
  progressText:      { fontSize: 10, fontWeight: "700", textAlign: "right" },
  footer:            { textAlign: "center", color: "#636e72", fontSize: 13, marginTop: 28 },
});
