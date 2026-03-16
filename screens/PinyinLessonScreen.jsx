import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { speakPinyin } from '../utils/tts';

const TONE_COLORS = ['#FF6B6B', '#FF9F43', '#1DD1A1', '#54A0FF'];
const TONE_NAMES  = ['1st Tone ā', '2nd Tone á', '3rd Tone ǎ', '4th Tone à'];

// Diacritic tone marks for each final — used in the tones popup
const FINAL_TONES = {
  'a':  ['ā','á','ǎ','à'],   'o':  ['ō','ó','ǒ','ò'],   'e':  ['ē','é','ě','è'],
  'i':  ['ī','í','ǐ','ì'],   'u':  ['ū','ú','ǔ','ù'],   'ü':  ['ǖ','ǘ','ǚ','ǜ'],
  'ai': ['āi','ái','ǎi','ài'],  'ei': ['ēi','éi','ěi','èi'],
  'ui': ['uī','uí','uǐ','uì'],  'ao': ['āo','áo','ǎo','ào'],
  'ou': ['ōu','óu','ǒu','òu'],  'iu': ['iū','iú','iǔ','iù'],
  'ie': ['iē','ié','iě','iè'],  'üe': ['üē','üé','üě','üè'],
  'er': ['ēr','ér','ěr','èr'],
  'an': ['ān','án','ǎn','àn'],  'en': ['ēn','én','ěn','èn'],
  'in': ['īn','ín','ǐn','ìn'],  'un': ['ūn','ún','ǔn','ùn'],
  'ün': ['ǖn','ǘn','ǚn','ǜn'],
  'ang': ['āng','áng','ǎng','àng'],  'eng': ['ēng','éng','ěng','èng'],
  'ing': ['īng','íng','ǐng','ìng'],  'ong': ['ōng','óng','ǒng','òng'],
  'ia':  ['iā','iá','iǎ','ià'],   'iao': ['iāo','iáo','iǎo','iào'],
  'ian': ['iān','ián','iǎn','iàn'], 'iang':['iāng','iáng','iǎng','iàng'],
  'ua':  ['uā','uá','uǎ','uà'],   'uai': ['uāi','uái','uǎi','uài'],
  'uo':  ['uō','uó','uǒ','uò'],   'uan': ['uān','uán','uǎn','uàn'],
  'uang':['uāng','uáng','uǎng','uàng'], 'üan':['üān','üán','üǎn','üàn'],
};

export default function PinyinLessonScreen({
  lessonData,
  stageProgress = [],     // e.g. [0,1,2] = stages 0,1,2 done
  quizPassed = false,
  onBack,
  onStartStage,           // (stageIndex: 0|1|2) => void
  onTakeQuiz,
}) {
  const [tab,           setTab]           = useState('learn'); // 'learn' | 'practice'
  const [selectedFinal, setSelectedFinal] = useState(null);  // opens tone popup

  if (!lessonData) return null;

  const stages = [
    { index: 0, title: 'Stage 1 · Listen & Identify', desc: 'Hear audio → pick tone, initial, or final', icon: '🔊' },
    { index: 1, title: 'Stage 2 · Read & Repeat',     desc: 'See the syllable, listen and repeat aloud',   icon: '🗣️' },
    { index: 2, title: 'Stage 3 · Visual Spelling',   desc: 'See written syllable → identify tone/parts',   icon: '✏️' },
  ];

  const allStagesDone = stageProgress.length >= 3;

  const renderLearnTab = () => {
    const content = lessonData.learn_content || {};
    const tones = content.tones || [];
    const rules = content.rules || [];
    const newFinals   = lessonData.new_finals   || [];
    const newInitials = lessonData.new_initials  || [];
    const singleFinals = new Set(lessonData.single_finals || []);
    const wholeSyl    = lessonData.whole_syllables || {};

    return (
      <ScrollView contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>

        {/* Tones reference */}
        {tones.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>THE FOUR TONES</Text>
            {tones.map((t, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.toneRow, { borderColor: TONE_COLORS[t.tone - 1] + '88' }]}
                onPress={() => speakPinyin(t.example_syllable)}
                activeOpacity={0.75}
              >
                <View style={[styles.toneBadge, { backgroundColor: TONE_COLORS[t.tone - 1] }]}>
                  <Text style={styles.toneBadgeText}>{t.tone}</Text>
                </View>
                <View style={styles.toneInfo}>
                  <Text style={[styles.toneMark, { color: TONE_COLORS[t.tone - 1] }]}>{t.mark ?? ''}</Text>
                  <Text style={styles.toneName}>{t.name}</Text>
                  <Text style={styles.toneDesc}>{t.desc}</Text>
                  <Text style={styles.toneExample}>{t.example_syllable} · "{t.example_meaning}"</Text>
                </View>
                <Text style={styles.audioBtn}>🔊</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* New initials */}
        {newInitials.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: 24 }]}>NEW INITIALS (声母)</Text>
            <View style={styles.chipsRow}>
              {newInitials.map((init, i) => (
                <TouchableOpacity key={i} style={styles.chipInitial} onPress={() => speakPinyin(init)} activeOpacity={0.75}>
                  <Text style={styles.chipInitialText}>{init}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* New finals — tap to play sound or open tone popup */}
        {newFinals.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: 24 }]}>NEW FINALS (韵母)</Text>
            <Text style={styles.finalHint}>Tap a final to hear it</Text>
            <View style={styles.chipsRow}>
              {newFinals.map((fin, i) => (
                <TouchableOpacity
                  key={i} style={styles.chipFinalTappable}
                  onPress={() => singleFinals.has(fin) ? speakPinyin(fin) : setSelectedFinal(fin)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.chipFinalText}>{fin}</Text>
                  <Text style={styles.chipFinalArrow}>{singleFinals.has(fin) ? '🔊' : '↗'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Whole syllables */}
        {Object.entries(wholeSyl).map(([group, items]) => (
          <React.Fragment key={group}>
            <Text style={[styles.sectionLabel, { marginTop: 24 }]}>
              {group.replace(/_/g, ' ').toUpperCase()}
            </Text>
            <View style={styles.chipsRow}>
              {items.map((syl, i) => (
                <TouchableOpacity key={i} style={styles.chipWhole} onPress={() => speakPinyin(syl)} activeOpacity={0.75}>
                  <Text style={styles.chipWholeText}>{syl}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </React.Fragment>
        ))}

        {/* Rules */}
        {rules.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: 24 }]}>KEY RULES</Text>
            <View style={styles.rulesBox}>
              {rules.map((rule, i) => (
                <Text key={i} style={styles.ruleText}>• {rule}</Text>
              ))}
            </View>
          </>
        )}

        {/* Sandhi rules */}
        {lessonData.sandhi_rules && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: 24 }]}>TONE SANDHI RULES</Text>
            {['yi','bu'].map(key => {
              const s = lessonData.sandhi_rules[key];
              if (!s) return null;
              return (
                <View key={key} style={styles.sandhiBox}>
                  <Text style={styles.sandhiTitle}>{key === 'yi' ? '一 (yī)' : '不 (bù)'}</Text>
                  {s.rules.map((r, i) => (
                    <View key={i} style={styles.sandhiRow}>
                      <Text style={styles.sandhiArrow}>→</Text>
                      <Text style={styles.sandhiRule}>{r.example_pinyin} — {r.meaning}</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </>
        )}

        {/* Neutral tone words */}
        {lessonData.neutral_tone_words && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: 24 }]}>NEUTRAL TONE WORDS (轻声)</Text>
            <View style={styles.wordGrid}>
              {lessonData.neutral_tone_words.map((w, i) => (
                <TouchableOpacity key={i} style={styles.wordCard} onPress={() => speakPinyin(w.pinyin)} activeOpacity={0.75}>
                  <Text style={styles.wordChinese}>{w.word}</Text>
                  <Text style={styles.wordPinyin}>{w.pinyin}</Text>
                  <Text style={styles.wordMeaning}>{w.meaning}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Erhua words */}
        {lessonData.erhua_words && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: 24 }]}>ERHUA WORDS (儿化)</Text>
            <View style={styles.wordGrid}>
              {lessonData.erhua_words.map((w, i) => (
                <TouchableOpacity key={i} style={styles.wordCard} onPress={() => speakPinyin(w.pinyin)} activeOpacity={0.75}>
                  <Text style={styles.wordChinese}>{w.word}</Text>
                  <Text style={styles.wordPinyin}>{w.pinyin}</Text>
                  <Text style={styles.wordMeaning}>{w.meaning}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Spelling rules — always visible */}
        {(lessonData.learn_content?.spelling_rules || []).length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: 24 }]}>✏️ SPELLING RULES</Text>
            {(lessonData.learn_content.spelling_rules).map((rule, i) => (
              <View key={i} style={styles.spellingRule}>
                <Text style={styles.spellingRuleTitle}>{rule.title}</Text>
                <Text style={styles.spellingRuleText}>{rule.rule}</Text>
                {(rule.examples || []).map((ex, j) => (
                  <TouchableOpacity
                    key={j} style={styles.spellingExample}
                    onPress={() => speakPinyin(ex.audio_key || ex.pinyin)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.spellingExPinyin}>{ex.pinyin}</Text>
                    {ex.note ? <Text style={styles.spellingExNote}>{ex.note}</Text> : null}
                    <Text style={styles.spellingExAudio}>🔊</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  const renderPracticeTab = () => (
    <ScrollView contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.practiceIntro}>
        Complete all 3 stages, then take the Lesson Quiz to unlock the next lesson.
      </Text>

      {stages.map(stage => {
        const done = stageProgress.includes(stage.index);
        return (
          <TouchableOpacity
            key={stage.index}
            style={[styles.stageCard, done && styles.stageCardDone]}
            onPress={() => onStartStage(stage.index)}
            activeOpacity={0.85}
          >
            <View style={styles.stageLeft}>
              <Text style={styles.stageIcon}>{done ? '✅' : stage.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.stageTitle}>{stage.title}</Text>
                <Text style={styles.stageDesc}>{stage.desc}</Text>
              </View>
            </View>
            <Text style={styles.stageArrow}>{done ? '↩' : '→'}</Text>
          </TouchableOpacity>
        );
      })}

      {/* Lesson Quiz */}
      <TouchableOpacity
        style={[styles.quizBtn, !allStagesDone && styles.quizBtnLocked]}
        onPress={() => allStagesDone && onTakeQuiz()}
        activeOpacity={allStagesDone ? 0.85 : 1}
      >
        <Text style={styles.quizBtnEmoji}>{quizPassed ? '🏆' : allStagesDone ? '🎯' : '🔒'}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.quizBtnTitle, !allStagesDone && styles.lockedText]}>
            Lesson Quiz
          </Text>
          <Text style={[styles.quizBtnSub, !allStagesDone && styles.lockedText]}>
            {quizPassed
              ? 'Passed! 🎉'
              : allStagesDone
                ? '10 questions · Need 60% to pass'
                : 'Complete all 3 stages first'}
          </Text>
        </View>
        {allStagesDone && !quizPassed && <Text style={styles.stageArrow}>→</Text>}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {lessonData.emoji} Lesson {lessonData.id}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Lesson title card */}
      <View style={styles.lessonBanner}>
        <Text style={styles.bannerTitle}>{lessonData.title}</Text>
        <Text style={styles.bannerSub}>{lessonData.subtitle}</Text>
        <Text style={styles.bannerDesc}>{lessonData.description}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {['learn','practice'].map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'learn' ? '📖 Learn' : '🎯 Practice'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'learn' ? renderLearnTab() : renderPracticeTab()}

      {/* Final Tones Popup */}
      <Modal
        visible={!!selectedFinal}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedFinal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Tones for: <Text style={styles.modalFinal}>{selectedFinal}</Text>
              </Text>
              <TouchableOpacity onPress={() => setSelectedFinal(null)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>Tap each card to hear the tone</Text>

            {(FINAL_TONES[selectedFinal] || []).map((mark, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.modalToneCard, { borderColor: TONE_COLORS[i] + '99', backgroundColor: TONE_COLORS[i] + '15' }]}
                onPress={() => speakPinyin(mark)}
                activeOpacity={0.75}
              >
                <View style={[styles.modalToneBadge, { backgroundColor: TONE_COLORS[i] }]}>
                  <Text style={styles.modalToneBadgeNum}>{i + 1}</Text>
                </View>
                <Text style={[styles.modalToneMark, { color: TONE_COLORS[i] }]}>{mark}</Text>
                <Text style={styles.modalToneName}>{TONE_NAMES[i]}</Text>
                <Text style={styles.modalAudioIcon}>🔊</Text>
              </TouchableOpacity>
            ))}

            {!FINAL_TONES[selectedFinal] && (
              <Text style={styles.modalNoTones}>Tone variants not available for this final.</Text>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a1a2e' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backBtn:     { paddingVertical: 8, paddingRight: 12 },
  backBtnText: { fontSize: 16, fontWeight: '600', color: '#a29bfe' },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#fff', flex: 1, textAlign: 'center' },

  lessonBanner: {
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#16213e',
  },
  bannerTitle: { fontSize: 18, fontWeight: '900', color: '#fff', marginBottom: 2 },
  bannerSub:   { fontSize: 13, color: '#54A0FF', marginBottom: 4 },
  bannerDesc:  { fontSize: 13, color: '#b2bec3', lineHeight: 18 },

  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  tab:          { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive:    { borderBottomWidth: 2, borderBottomColor: '#54A0FF' },
  tabText:      { fontSize: 14, fontWeight: '700', color: '#636e72' },
  tabTextActive:{ color: '#54A0FF' },

  tabContent: { padding: 20 },

  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: '#636e72',
    letterSpacing: 1.5, marginBottom: 10,
  },

  // Tone rows
  toneRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#16213e', borderRadius: 16, padding: 14,
    marginBottom: 10, borderWidth: 1.5,
  },
  toneBadge:     { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  toneBadgeText: { fontSize: 18, fontWeight: '900', color: '#fff' },
  toneInfo:      { flex: 1, gap: 2 },
  toneMark:      { fontSize: 22, fontWeight: '900' },
  toneName:      { fontSize: 14, fontWeight: '700', color: '#fff' },
  toneDesc:      { fontSize: 12, color: '#b2bec3' },
  toneExample:   { fontSize: 12, color: '#636e72' },
  audioBtn:      { fontSize: 20 },

  // Chips
  chipsRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipInitial:     { backgroundColor: '#16213e', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5, borderColor: '#a29bfe55' },
  chipInitialText: { fontSize: 16, fontWeight: '700', color: '#a29bfe' },
  chipFinal:       { backgroundColor: '#16213e', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5, borderColor: '#1DD1A155' },
  chipFinalText:   { fontSize: 16, fontWeight: '700', color: '#1DD1A1' },
  chipWhole:       { backgroundColor: '#16213e', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5, borderColor: '#54A0FF55' },
  chipWholeText:   { fontSize: 16, fontWeight: '700', color: '#54A0FF' },

  // Rules
  rulesBox: {
    backgroundColor: 'rgba(162,155,254,0.08)', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#a29bfe33', gap: 8,
  },
  ruleText: { fontSize: 13, color: '#b2bec3', lineHeight: 20 },

  // Sandhi
  sandhiBox:  { backgroundColor: '#16213e', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#54A0FF33' },
  sandhiTitle:{ fontSize: 16, fontWeight: '800', color: '#54A0FF', marginBottom: 8 },
  sandhiRow:  { flexDirection: 'row', gap: 8, marginBottom: 4 },
  sandhiArrow:{ color: '#FF9F43', fontWeight: '700' },
  sandhiRule: { fontSize: 13, color: '#b2bec3', flex: 1 },

  // Word grid
  wordGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  wordCard: {
    backgroundColor: '#16213e', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#a29bfe33', alignItems: 'center', minWidth: '30%',
  },
  wordChinese: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 2 },
  wordPinyin:  { fontSize: 13, color: '#54A0FF', marginBottom: 2 },
  wordMeaning: { fontSize: 11, color: '#636e72' },

  // Practice tab
  practiceIntro: { fontSize: 13, color: '#b2bec3', lineHeight: 20, marginBottom: 20 },

  stageCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#16213e', borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1.5, borderColor: '#a29bfe22', gap: 12,
  },
  stageCardDone: { borderColor: '#1DD1A155' },
  stageLeft:     { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  stageIcon:     { fontSize: 26 },
  stageTitle:    { fontSize: 15, fontWeight: '800', color: '#fff', marginBottom: 2 },
  stageDesc:     { fontSize: 12, color: '#636e72' },
  stageArrow:    { fontSize: 18, color: '#a29bfe', fontWeight: '700' },

  quizBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#54A0FF', borderRadius: 18, padding: 20, marginTop: 8,
  },
  quizBtnLocked: { backgroundColor: '#16213e', borderWidth: 1.5, borderColor: '#2d3436' },
  quizBtnEmoji:  { fontSize: 28 },
  quizBtnTitle:  { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 2 },
  quizBtnSub:    { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  lockedText:    { color: '#4a4a6a' },

  // Finals tappable chip
  finalHint:          { fontSize: 11, color: '#636e72', marginBottom: 8, fontStyle: 'italic' },
  chipFinalTappable:  { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#16213e', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5, borderColor: '#1DD1A188' },
  chipFinalArrow:     { fontSize: 11, color: '#1DD1A1', fontWeight: '700' },

  // Tone popup modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#16213e', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40, gap: 12,
    borderTopWidth: 1, borderColor: '#a29bfe33',
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4,
  },
  modalTitle:    { fontSize: 17, fontWeight: '800', color: '#fff' },
  modalFinal:    { color: '#1DD1A1', fontSize: 20 },
  modalCloseBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  modalCloseText:{ fontSize: 18, color: '#636e72', fontWeight: '700' },
  modalSub:      { fontSize: 12, color: '#636e72', marginBottom: 4 },
  modalToneCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 14, padding: 14, borderWidth: 1.5,
  },
  modalToneBadge: {
    width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
  },
  modalToneBadgeNum: { fontSize: 16, fontWeight: '900', color: '#fff' },
  modalToneMark:     { fontSize: 32, fontWeight: '900', flex: 1 },
  modalToneName:     { fontSize: 12, color: '#b2bec3', flex: 2 },
  modalAudioIcon:    { fontSize: 20 },
  modalNoTones:      { fontSize: 14, color: '#636e72', textAlign: 'center', padding: 20 },

  // Spelling section
  spellingHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 0 },
  spellingChevron:    { fontSize: 11, color: '#636e72' },
  spellingPlaceholder:{ backgroundColor: '#16213e', borderRadius: 14, padding: 20, alignItems: 'center', marginTop: 10 },
  spellingPlaceholderText: { fontSize: 13, color: '#636e72' },
  spellingRule:       { backgroundColor: '#16213e', borderRadius: 14, padding: 16, marginTop: 10, borderWidth: 1, borderColor: '#a29bfe33' },
  spellingRuleTitle:  { fontSize: 15, fontWeight: '800', color: '#fff', marginBottom: 4 },
  spellingRuleText:   { fontSize: 13, color: '#b2bec3', lineHeight: 19, marginBottom: 10 },
  spellingExample:    { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(162,155,254,0.08)', borderRadius: 10, padding: 10, marginBottom: 6 },
  spellingExPinyin:   { fontSize: 15, fontWeight: '700', color: '#a29bfe', flex: 1 },
  spellingExNote:     { fontSize: 12, color: '#636e72', flex: 2 },
  spellingExAudio:    { fontSize: 18 },
});
