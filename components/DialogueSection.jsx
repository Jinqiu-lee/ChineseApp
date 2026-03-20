import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { speakChinese } from '../utils/tts';

// ── Dialogue scene images — single consolidated file per level ───────────
const IMAGES_BY_LEVEL = {
  hsk1: require('../data/hsk1/hsk1_images/hsk1_images.json'),
  hsk2: require('../data/hsk2/hsk2_images/hsk2_images.json'),
  hsk4: require('../data/hsk4_level4/hsk4_level4_images/hsk4_images.json'),
  hsk5: require('../data/hsk4_level5/hsk4_level5_images/hsk5_images.json'),
};

function getDialogueImage(dialogueId, lessonNumber, levelId = 'hsk1') {
  try {
    const imageData = IMAGES_BY_LEVEL[levelId] || IMAGES_BY_LEVEL.hsk1;
    const lesson = imageData.lessons?.[String(lessonNumber)];
    return lesson?.dialogue_images?.[String(dialogueId)] || null;
  } catch { return null; }
}

// Gender-based palette
const PALETTE = {
  female: { bubble: 'rgba(253,121,168,0.12)', border: 'rgba(253,121,168,0.3)', pinyin: '#fd79a8', badge: 'rgba(253,121,168,0.2)', emoji: '👩' },
  male:   { bubble: 'rgba(84,160,255,0.12)',  border: 'rgba(84,160,255,0.3)',  pinyin: '#54A0FF', badge: 'rgba(84,160,255,0.2)',  emoji: '👨' },
};

export default function DialogueSection({ dialogues = [], lessonNumber, levelId = 'hsk1' }) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>💬 Dialogues ({dialogues.length})</Text>
      {dialogues.map(dialogue => (
        <DialogueCard key={dialogue.id} dialogue={dialogue} lessonNumber={lessonNumber} levelId={levelId} />
      ))}
    </View>
  );
}

function DialogueCard({ dialogue, lessonNumber, levelId }) {
  const [showPinyin, setShowPinyin] = useState(false);

  const speakerA = dialogue.speakers?.A;
  const speakerB = dialogue.speakers?.B;
  const palA = PALETTE[(speakerA?.gender) || 'female'];
  const palB = PALETTE[(speakerB?.gender) || 'male'];
  const sceneImg = getDialogueImage(dialogue.id, lessonNumber, levelId);

  return (
    <View style={styles.card}>

      {/* Scene banner – emoji or real photo */}
      {sceneImg && (
        <View style={[styles.sceneBanner, { backgroundColor: sceneImg.color || '#16213e' }]}>
          {sceneImg.url ? (
            <Image source={{ uri: sceneImg.url }} style={styles.scenePhoto} resizeMode="cover" />
          ) : (
            <Text style={styles.sceneEmoji}>{sceneImg.emoji}</Text>
          )}
          <View style={styles.sceneLabelWrap}>
            <Text style={styles.sceneLabel}>{sceneImg.label}</Text>
          </View>
        </View>
      )}

      {/* Card header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.cardTitleChinese}>{dialogue.title_chinese}</Text>
            <Text style={styles.cardTitleEnglish}>{dialogue.title}</Text>
          </View>
          <TouchableOpacity
            style={[styles.pinyinToggle, showPinyin && styles.pinyinToggleOn]}
            onPress={() => setShowPinyin(v => !v)}
          >
            <Text style={[styles.pinyinToggleText, showPinyin && styles.pinyinToggleTextOn]}>拼</Text>
          </TouchableOpacity>
        </View>

        {/* Speaker name cards */}
        {(speakerA || speakerB) && (
          <View style={styles.speakerRow}>
            {speakerA && <SpeakerTag info={speakerA} pal={palA} />}
            <Text style={styles.vsText}>vs</Text>
            {speakerB && <SpeakerTag info={speakerB} pal={palB} />}
          </View>
        )}
      </View>

      {/* Dialogue lines */}
      <View style={styles.lines}>
        {dialogue.lines.map((line, i) => {
          const isA = line.speaker === 'A';
          const pal = isA ? palA : palB;
          const info = isA ? speakerA : speakerB;
          return (
            <View key={i} style={[styles.lineRow, isA ? styles.lineRowA : styles.lineRowB]}>

              {/* Avatar badge */}
              <View style={[styles.avatarBadge, { backgroundColor: pal.badge }]}>
                <Text style={styles.avatarEmoji}>{pal.emoji}</Text>
                <Text style={styles.avatarName}>{info?.name || line.speaker}</Text>
              </View>

              {/* Bubble */}
              <View style={[styles.bubble, { backgroundColor: pal.bubble, borderColor: pal.border }]}>
                <View style={styles.bubbleTop}>
                  <Text style={styles.bubbleChinese}>{line.chinese}</Text>
                  <TouchableOpacity onPress={() => speakChinese(line.chinese, info?.gender)} style={styles.speakBtn}>
                    <Text style={styles.speakBtnText}>🔊</Text>
                  </TouchableOpacity>
                </View>
                {showPinyin && (
                  <Text style={[styles.bubblePinyin, { color: pal.pinyin }]}>{line.pinyin}</Text>
                )}
                <Text style={styles.bubbleEnglish}>{line.english}</Text>
              </View>

            </View>
          );
        })}
      </View>

    </View>
  );
}

function SpeakerTag({ info, pal }) {
  return (
    <View style={[styles.speakerTag, { backgroundColor: pal.badge, borderColor: pal.border }]}>
      <Text style={styles.speakerTagEmoji}>{pal.emoji}</Text>
      <View>
        <Text style={[styles.speakerTagName, { color: pal.pinyin }]}>{info.name}</Text>
        <Text style={styles.speakerTagRole}>{info.role}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 14 },

  card: {
    backgroundColor: '#16213e',
    borderRadius: 18,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2d3436',
  },

  // Scene banner (above card header)
  sceneBanner: {
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  scenePhoto:   { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  sceneEmoji:   { fontSize: 44 },
  sceneLabelWrap: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingVertical: 4, paddingHorizontal: 12,
  },
  sceneLabel: { fontSize: 13, fontWeight: '700', color: '#fff' },
  cardHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderBottomWidth: 1,
    borderBottomColor: '#2d3436',
    gap: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitleChinese: { fontSize: 16, fontWeight: '800', color: '#fff' },
  cardTitleEnglish: { fontSize: 12, color: '#636e72', marginTop: 2 },

  pinyinToggle: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 10, borderWidth: 1.5,
    borderColor: '#2d3436', backgroundColor: 'rgba(255,255,255,0.04)',
  },
  pinyinToggleOn:     { borderColor: '#a29bfe', backgroundColor: 'rgba(162,155,254,0.15)' },
  pinyinToggleText:   { fontSize: 14, fontWeight: '700', color: '#636e72' },
  pinyinToggleTextOn: { color: '#a29bfe' },

  // Speaker name row
  speakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  vsText: { fontSize: 11, fontWeight: '700', color: '#636e72' },
  speakerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
  },
  speakerTagEmoji: { fontSize: 20 },
  speakerTagName:  { fontSize: 14, fontWeight: '800' },
  speakerTagRole:  { fontSize: 11, color: '#636e72' },

  // Lines
  lines:    { padding: 14, gap: 12 },
  lineRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  lineRowA: { flexDirection: 'row' },
  lineRowB: { flexDirection: 'row-reverse' },

  // Avatar badge (replaces the old letter circle)
  avatarBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 4,
    minWidth: 40,
    flexShrink: 0,
    marginTop: 2,
  },
  avatarEmoji: { fontSize: 20 },
  avatarName:  { fontSize: 10, fontWeight: '800', color: '#fff', marginTop: 2 },

  // Bubble
  bubble: {
    flex: 1, borderRadius: 14, padding: 12,
    maxWidth: '85%', borderWidth: 1,
  },
  bubbleTop:    { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  bubbleChinese:{ fontSize: 18, fontWeight: '700', color: '#fff', flex: 1, lineHeight: 26 },
  speakBtn:     { paddingLeft: 8, paddingTop: 2 },
  speakBtnText: { fontSize: 16 },
  bubblePinyin: { fontSize: 13, fontStyle: 'italic', marginTop: 4, marginBottom: 2 },
  bubbleEnglish:{ fontSize: 13, color: '#636e72', marginTop: 4, lineHeight: 18 },
});
