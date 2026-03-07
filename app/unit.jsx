import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView } from "react-native";

// Map of all available lessons per level
const LESSON_META = {
  yct1: [
    { lesson: 1, topic: "Greetings", topic_chinese: "问候", emoji: "👋" },
    { lesson: 2, topic: "What's Your Name?", topic_chinese: "你叫什么？", emoji: "🏷️" },
    { lesson: 3, topic: "Who Is He?", topic_chinese: "他是谁？", emoji: "👤" },
    { lesson: 4, topic: "Family", topic_chinese: "我的家", emoji: "👨‍👩‍👧" },
    { lesson: 5, topic: "Age & Numbers", topic_chinese: "数字和年龄", emoji: "🔢" },
    { lesson: 6, topic: "Appearance", topic_chinese: "外貌", emoji: "🪞" },
    { lesson: 7, topic: "Animals", topic_chinese: "动物", emoji: "🐾" },
    { lesson: 8, topic: "Places", topic_chinese: "地方", emoji: "📍" },
    { lesson: 9, topic: "Days of the Week", topic_chinese: "星期", emoji: "📅" },
    { lesson: 10, topic: "Telling Time", topic_chinese: "几点了", emoji: "🕐" },
    { lesson: 11, topic: "Food", topic_chinese: "食物", emoji: "🍜" },
  ],
  yct2: [
    { lesson: 2, topic: "School & Stationery", topic_chinese: "文具", emoji: "✏️" },
    { lesson: 6, topic: "Colours & Clothes", topic_chinese: "颜色", emoji: "🎨" },
    { lesson: 7, topic: "Weather", topic_chinese: "天气", emoji: "🌤️" },
  ],
  yct3: [
    { lesson: 2, topic: "Daily Routine", topic_chinese: "上学路上", emoji: "🚌" },
    { lesson: 8, topic: "Shopping", topic_chinese: "购物", emoji: "🛍️" },
  ],
  yct4: [
    { lesson: 2, topic: "Hobbies", topic_chinese: "爱好", emoji: "🎯" },
    { lesson: 4, topic: "Health", topic_chinese: "身体健康", emoji: "🏥" },
  ],
  hsk1: [
    { lesson: 3, topic: "Time & Date", topic_chinese: "时间日期", emoji: "📆" },
    { lesson: 4, topic: "Shopping & Money", topic_chinese: "购物", emoji: "💰" },
    { lesson: 5, topic: "Transportation", topic_chinese: "交通", emoji: "🚇" },
  ],
  hsk2: [
    { lesson: 1, topic: "Describing People", topic_chinese: "描述外貌", emoji: "🪞" },
    { lesson: 5, topic: "Making Plans", topic_chinese: "约好见面", emoji: "📋" },
  ],
  hsk3: [
    { lesson: 1, topic: "Expressing Opinions", topic_chinese: "表达意见", emoji: "💬" },
    { lesson: 5, topic: "Travel & Experience", topic_chinese: "旅行经历", emoji: "✈️" },
  ],
};

export default function UnitScreen({ navigation, route }) {
  const { level } = route.params;
  const lessons = LESSON_META[level.id] || [];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: level.color + "18" }]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.levelBadge, { backgroundColor: level.color }]}>{level.label}</Text>
          <Text style={styles.levelAge}>{level.age}</Text>
        </View>

        <Text style={styles.sectionTitle}>Choose a Lesson</Text>

        {/* Lesson Cards */}
        {lessons.map((item) => (
          <TouchableOpacity
            key={item.lesson}
            style={[styles.lessonCard, { borderLeftColor: level.color }]}
            onPress={() =>
              navigation.navigate("Game", {
                levelId: level.id,
                lessonNumber: item.lesson,
                color: level.color,
              })
            }
            activeOpacity={0.8}
          >
            <Text style={styles.lessonEmoji}>{item.emoji}</Text>
            <View style={styles.lessonInfo}>
              <Text style={styles.lessonNumber}>Lesson {item.lesson}</Text>
              <Text style={styles.lessonTopic}>{item.topic}</Text>
              <Text style={styles.lessonChinese}>{item.topic_chinese}</Text>
            </View>
            <Text style={[styles.arrow, { color: level.color }]}>▶</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  backBtn: {
    marginBottom: 12,
  },
  backText: {
    color: "#636e72",
    fontSize: 15,
    fontWeight: "500",
  },
  levelBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    color: "#fff",
    fontWeight: "800",
    fontSize: 18,
    letterSpacing: 1,
    overflow: "hidden",
  },
  levelAge: {
    fontSize: 13,
    color: "#636e72",
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2d3436",
    marginBottom: 16,
  },
  lessonCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lessonEmoji: {
    fontSize: 30,
    marginRight: 14,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonNumber: {
    fontSize: 11,
    color: "#b2bec3",
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  lessonTopic: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2d3436",
    marginTop: 2,
  },
  lessonChinese: {
    fontSize: 14,
    color: "#636e72",
    marginTop: 2,
  },
  arrow: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
