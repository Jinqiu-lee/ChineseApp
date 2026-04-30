import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { speakAsAvatar, speakChinese, stopAudio } from '../utils/tts';
import AvatarCharacter from './AvatarCharacter';
import { getAvatar } from '../config/avatarConfig';
import { DEEP_NAVY, WARM_ORANGE, SLATE_TEAL, WARM_BROWN, CARD_WHITE } from '../constants/colors';
import {
  getPairForDialogue,
  shortName,
  shouldPreserveDialogue,
  swapDialogueLine,
  augmentSpeakerWithAvatar,
} from '../utils/applyAvatarNames';

// Replaces dialogue speaker roles with the correct avatar pair for this dialogue's
// position in the lesson. Dialogue 0 uses the primary pair, dialogue 1 the alternate
// pair from the same group — so a lesson with 2 dialogues shows 4 distinct avatars.
// Also replaces character names in chinese, pinyin, and english fields.
// Family/medical dialogues are left unchanged.
function replaceDialogueRoles(dialogue, primaryAvatarId, dialogueIndex = 0) {
  if (shouldPreserveDialogue(dialogue)) {
    // For preserved dialogues, still augment any speakers that match known literary avatars
    // so they get their own image and voice instead of just an emoji.
    const rawA = dialogue.speakers?.A;
    const rawB = dialogue.speakers?.B;
    const augA = augmentSpeakerWithAvatar(rawA);
    const augB = augmentSpeakerWithAvatar(rawB);
    if (augA === rawA && augB === rawB) return dialogue; // nothing changed
    return { ...dialogue, speakers: { A: augA, B: augB } };
  }

  const [idA, idB] = getPairForDialogue(primaryAvatarId, dialogueIndex);
  const avatarA = getAvatar(idA);
  const avatarB = getAvatar(idB);

  const nameA = shortName(avatarA.chineseName);
  const nameB = shortName(avatarB.chineseName);
  const namePinyinA = avatarA.shortNamePinyin || '';
  const namePinyinB = avatarB.shortNamePinyin || '';

  const origNameA = dialogue.speakers?.A?.name || '';
  const origNameB = dialogue.speakers?.B?.name || '';

  return {
    ...dialogue,
    lines: dialogue.lines.map(line => {
      let l = swapDialogueLine(line, origNameA, nameA);
      l = swapDialogueLine(l, origNameB, nameB);
      return l;
    }),
    speakers: {
      A: {
        name: nameA,
        name_pinyin: namePinyinA,
        role: avatarA.englishName,
        gender: avatarA.gender,
        isAvatar: true,
        avatarId: idA,
      },
      B: {
        name: nameB,
        name_pinyin: namePinyinB,
        role: avatarB.englishName,
        gender: avatarB.gender,
        isAvatar: true,
        avatarId: idB,
      },
    },
  };
}

// ── Dialogue scene images — single consolidated file per level ───────────
const IMAGES_BY_LEVEL = {
  hsk1: require('../data/hsk1/hsk1_images/hsk1_images.json'),
  hsk2: require('../data/hsk2/hsk2_images/hsk2_images.json'),
  hsk3: require('../data/hsk3/hsk3_images/hsk3_images.json'),
  hsk4: require('../data/hsk4_level4/hsk4_level4_images/hsk4_images.json'),
  hsk5: require('../data/hsk4_level5/hsk4_level5_images/hsk5_images.json'),
  hsk6: require('../data/hsk6/hsk6_images/hsk6_images.json'),
};

function getDialogueImage(dialogueId, lessonNumber, levelId = 'hsk1') {
  try {
    const imageData = IMAGES_BY_LEVEL[levelId] || IMAGES_BY_LEVEL.hsk1;
    const lesson = imageData.lessons?.[String(lessonNumber)];
    return lesson?.dialogue_images?.[String(dialogueId)] || null;
  } catch { return null; }
}

// Literary/artistic figure names that may appear as role placeholders in lesson JSON.
// For preserved (non-avatar-replaced) dialogues, display the speaker's role instead of this name.
const LITERARY_FIGURE_NAMES = new Set([
  '张爱玲','爱玲','李白','鲁迅','但丁','加缪',
  '简奥斯汀','奥斯汀','费兰特','兰特','刘慈欣','慈欣',
  '苏轼','萨特','波伏娃','西蒙娜','伍尔夫','杨绛',
]);

function getDisplayName(info) {
  if (!info) return '';
  if (info.isAvatar) return info.name;
  if (LITERARY_FIGURE_NAMES.has(info.name) && info.role) return info.role;
  return info.name;
}

// Role-based voice routing: maps speaker name/role to a pseudo-avatar ID
// so family/social role characters share a consistent voice across all dialogues.
const GRANDMA_KEYWORDS = ['奶奶', '外婆', '姥姥', '祖母'];
const GRANDPA_KEYWORDS = ['爷爷', '外公', '姥爷', '祖父'];

function getElderAvatarId(info) {
  if (!info) return null;
  const name = info.name || '';
  const role = info.role || '';
  const text = `${name} ${role}`;
  if (GRANDMA_KEYWORDS.some(k => text.includes(k))) return 'grandma';
  if (GRANDPA_KEYWORDS.some(k => text.includes(k))) return 'grandpa';
  // Middle-aged woman: 妈妈, or any name/role ending with 阿姨
  if (name === '妈妈' || role === '妈妈' || name.endsWith('阿姨') || role.endsWith('阿姨')) return 'auntie';
  // Middle-aged man: 爸爸, or any name/role ending with 叔叔
  if (name === '爸爸' || role === '爸爸' || name.endsWith('叔叔') || role.endsWith('叔叔')) return 'uncle';
  return null;
}

// Gender-based palette
const PALETTE = {
  female: { bubble: 'rgba(253,121,168,0.12)', border: 'rgba(253,121,168,0.3)', pinyin: '#fd79a8', badge: 'rgba(253,121,168,0.2)', emoji: '👩' },
  male:   { bubble: 'rgba(84,160,255,0.12)',  border: 'rgba(84,160,255,0.3)',  pinyin: '#54A0FF', badge: 'rgba(84,160,255,0.2)',  emoji: '👨' },
};

export default function DialogueSection({ dialogues = [], lessonNumber, levelId = 'hsk1', avatarId = 'eileen' }) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>💬 Dialogues ({dialogues.length})</Text>
      {dialogues.map((dialogue, idx) => (
        <DialogueCard
          key={dialogue.id ?? idx}
          dialogue={replaceDialogueRoles(dialogue, avatarId, idx)}
          lessonNumber={lessonNumber}
          levelId={levelId}
          avatarId={avatarId}
        />
      ))}
    </View>
  );
}

function DialogueCard({ dialogue, lessonNumber, levelId, avatarId }) {
  const [showPinyin, setShowPinyin] = useState(false);
  const [playingLine, setPlayingLine] = useState(null); // index of currently playing line
  const sessionRef = useRef(0); // incremented on each new play session to cancel old ones
  // Yoga under-measures multi-line text on first render when content appears conditionally
  // (e.g. toggling the Dialogue section open). Force one synchronous re-render after mount
  // so Yoga gets a second layout pass with finalised container sizes — fixes invisible last lines.
  const [, forceLayout] = useState(0);
  React.useLayoutEffect(() => { forceLayout(1); }, []);

  // Stop audio when this card unmounts (section closed, screen navigated away, etc.)
  React.useEffect(() => {
    return () => { stopAudio(); };
  }, []);

  const speakerA = dialogue.speakers?.A;
  const speakerB = dialogue.speakers?.B;
  const palA = PALETTE[(speakerA?.gender) || 'female'];
  const palB = PALETTE[(speakerB?.gender) || 'male'];
  const sceneImg = getDialogueImage(dialogue.id, lessonNumber, levelId);

  // Play from `startIndex` through to the end of the dialogue, one line at a time.
  // If the user clicks the line that's already playing, stop.
  const handleSpeak = async (startIndex) => {
    const lines = dialogue.lines;

    // Toggle: clicking the currently-playing line stops everything
    if (playingLine === startIndex) {
      sessionRef.current += 1;
      setPlayingLine(null);
      await stopAudio();
      return;
    }

    // Start a new session (cancels any running auto-play loop)
    sessionRef.current += 1;
    const session = sessionRef.current;
    await stopAudio();
    setPlayingLine(null);

    for (let i = startIndex; i < lines.length; i++) {
      if (sessionRef.current !== session) break; // cancelled by another click

      const line = lines[i];
      const isA  = line.speaker === 'A';
      const info = isA ? speakerA : speakerB;

      setPlayingLine(i);

      const elderVoiceId = getElderAvatarId(info);
      const voiceId = elderVoiceId || info?.avatarId || null;
      const finished = voiceId
        ? await speakAsAvatar(line.chinese, voiceId)
        : await speakChinese(line.chinese, info?.gender || 'female');

      // If stopped externally (toggle / new click), exit loop
      if (!finished || sessionRef.current !== session) break;

      // Short pause between lines (skip after the last one)
      if (i < lines.length - 1) {
        await new Promise(r => setTimeout(r, 350));
      }
    }

    if (sessionRef.current === session) setPlayingLine(null);
  };

  return (
    <View style={styles.card}>

      {/* Scene banner – emoji or real photo */}
      {sceneImg && (
        <View style={[styles.sceneBanner, { backgroundColor: sceneImg.color || SLATE_TEAL }]}>
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
            {showPinyin && dialogue.title_pinyin ? (
              <Text style={styles.cardTitlePinyin}>{dialogue.title_pinyin}</Text>
            ) : null}
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
            {speakerA && (speakerA.isAvatar
              ? <AvatarSpeakerTag info={speakerA} pal={palA} avatarId={speakerA.avatarId} showPinyin={showPinyin} />
              : <SpeakerTag info={speakerA} pal={palA} showPinyin={showPinyin} />
            )}
            <Text style={styles.vsText}>vs</Text>
            {speakerB && (speakerB.isAvatar
              ? <AvatarSpeakerTag info={speakerB} pal={palB} avatarId={speakerB.avatarId} showPinyin={showPinyin} />
              : <SpeakerTag info={speakerB} pal={palB} showPinyin={showPinyin} />
            )}
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

              {/* Avatar badge — avatar image for replaced roles, emoji for preserved */}
              <View style={info?.isAvatar ? styles.avatarBadgeChar : styles.avatarBadge}>
                {info?.isAvatar ? (
                  <AvatarCharacter avatarId={info.avatarId} expression="neutral" size={48} />
                ) : (
                  <Text style={styles.avatarEmoji}>{pal.emoji}</Text>
                )}
                <Text style={styles.avatarName}>{getDisplayName(info) || line.speaker}</Text>
              </View>

              {/* Bubble */}
              <View style={[styles.bubble, { backgroundColor: pal.bubble, borderColor: pal.border }]}>
                <Text style={styles.bubbleChinese}>{line.chinese}</Text>
                <TouchableOpacity
                  onPress={() => handleSpeak(i)}
                  style={styles.speakBtn}
                >
                  <Text style={styles.speakBtnText}>
                    {playingLine === i ? '⏹' : '🔊'}
                  </Text>
                </TouchableOpacity>
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

function SpeakerTag({ info, pal, showPinyin }) {
  return (
    <View style={[styles.speakerTag, { backgroundColor: pal.badge, borderColor: pal.border }]}>
      <Text style={styles.speakerTagEmoji}>{pal.emoji}</Text>
      <View>
        <Text style={[styles.speakerTagName, { color: pal.pinyin }]}>{getDisplayName(info)}</Text>
        {showPinyin && info.name_pinyin ? (
          <Text style={[styles.speakerTagPinyin, { color: pal.pinyin }]}>{info.name_pinyin}</Text>
        ) : null}
        <Text style={styles.speakerTagRole}>{info.role}</Text>
        {showPinyin && info.role_pinyin ? (
          <Text style={styles.speakerTagPinyin}>{info.role_pinyin}</Text>
        ) : null}
      </View>
    </View>
  );
}

function AvatarSpeakerTag({ info, pal, avatarId, showPinyin }) {
  return (
    <View style={[styles.speakerTag, styles.speakerTagAvatar, { borderColor: WARM_ORANGE }]}>
      <AvatarCharacter avatarId={avatarId} expression="neutral" size={36} />
      <View>
        <Text style={[styles.speakerTagName, { color: WARM_ORANGE }]}>{info.name}</Text>
        {showPinyin && info.name_pinyin ? (
          <Text style={[styles.speakerTagPinyin, { color: WARM_ORANGE }]}>{info.name_pinyin}</Text>
        ) : null}
        <Text style={styles.speakerTagRole}>{info.role}</Text>
        {showPinyin && info.role_pinyin ? (
          <Text style={styles.speakerTagPinyin}>{info.role_pinyin}</Text>
        ) : null}
      </View>
    </View>
  );
}

const VG = {
  cardDark: 'rgba(255,255,255,0.92)',
  gold: WARM_BROWN, orange: WARM_ORANGE,
  cream: DEEP_NAVY, creamMuted: SLATE_TEAL,
  border: 'rgba(155,104,70,0.20)',
};


const styles = StyleSheet.create({
  container:    { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: VG.cream, marginBottom: 14 },

  card: {
    backgroundColor: VG.cardDark,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: VG.border,
  },

  // Scene banner (above card header)
  sceneBanner: {
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  scenePhoto:   { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  sceneEmoji:   { fontSize: 44 },
  sceneLabelWrap: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(28,42,68,0.72)',
    paddingVertical: 4, paddingHorizontal: 12,
  },
  sceneLabel: { fontSize: 13, fontWeight: '700', color: VG.cream },
  cardHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(247,240,232,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: VG.border,
    gap: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitleChinese: { fontSize: 16, fontWeight: '800', color: VG.cream },
  cardTitlePinyin:  { fontSize: 12, color: VG.orange, fontStyle: 'italic', marginTop: 1 },
  cardTitleEnglish: { fontSize: 12, color: VG.creamMuted, marginTop: 2 },

  pinyinToggle: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 10, borderWidth: 1.5,
    borderColor: VG.border, backgroundColor: CARD_WHITE,
  },
  pinyinToggleOn:     { borderColor: VG.gold, backgroundColor: 'rgba(224,176,75,0.15)' },
  pinyinToggleText:   { fontSize: 14, fontWeight: '700', color: VG.creamMuted },
  pinyinToggleTextOn: { color: VG.gold },

  // Speaker name row
  speakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  vsText: { fontSize: 11, fontWeight: '700', color: VG.creamMuted },
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
  speakerTagEmoji:  { fontSize: 20 },
  speakerTagName:   { fontSize: 14, fontWeight: '800' },
  speakerTagPinyin: { fontSize: 10, color: VG.creamMuted, fontStyle: 'italic' },
  speakerTagRole:   { fontSize: 11, color: VG.creamMuted },
  speakerTagAvatar: { backgroundColor: 'rgba(224,176,75,0.1)' },

  // Lines — overflow:visible so that if Yoga under-measures a bubble height on first
  // render, the text renders visibly in the gap rather than being silently clipped.
  lines:    { padding: 14, gap: 12, overflow: 'visible' },
  lineRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 10, overflow: 'visible' },
  lineRowA: { flexDirection: 'row' },
  lineRowB: { flexDirection: 'row-reverse' },

  // Avatar badge (emoji variant — for student speaker B)
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
  avatarName:  { fontSize: 10, fontWeight: '800', color: VG.cream, marginTop: 2 },
  // Avatar badge using AvatarCharacter image (for speaker A / avatar)
  avatarBadgeChar: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
    width: 52,
  },

  bubble: {
    flexShrink: 1,
    borderRadius: 14,
    paddingTop: 12, paddingBottom: 12, paddingLeft: 12, paddingRight: 40,
    borderWidth: 1,
    overflow: 'visible',
  },
  bubbleChinese:{ fontSize: 18, fontWeight: '700', color: VG.cream, lineHeight: 26 },
  speakBtn:     { position: 'absolute', top: 10, right: 10, width: 26, alignItems: 'center' },
  speakBtnText: { fontSize: 16 },
  bubblePinyin: { fontSize: 13, fontStyle: 'italic', marginTop: 4, marginBottom: 2 },
  bubbleEnglish:{ fontSize: 13, color: VG.creamMuted, marginTop: 4, lineHeight: 18 },
});
