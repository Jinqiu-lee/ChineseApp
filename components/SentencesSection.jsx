import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { speakAsAvatar } from '../utils/tts';
import { DEEP_NAVY, WARM_ORANGE, SLATE_TEAL, WARM_BROWN, CARD_WHITE, SUCCESS } from '../constants/colors';

const VG = {
  cardDark: 'rgba(255,255,255,0.92)',
  gold: WARM_BROWN, orange: WARM_ORANGE,
  cream: DEEP_NAVY, creamMuted: SLATE_TEAL,
  border: 'rgba(155,104,70,0.20)',
};

function SentencesSection({ sentences, avatarId = 'eileen', initialDone, onAllDone }) {
  const [isOpen,        setIsOpen]        = useState(false);
  const [showPinyin,    setShowPinyin]    = useState(false);
  const [visibleCount,  setVisibleCount]  = useState(1);
  const [flowDone]                        = useState(!!initialDone);
  const completionNotified                = useRef(!!initialDone);

  useEffect(() => {
    if (!isOpen) return;
    if (flowDone) return;
    if (visibleCount < sentences.length) return;
    if (completionNotified.current) return;
    completionNotified.current = true;
    if (onAllDone) onAllDone();
  }, [isOpen, visibleCount, sentences.length, flowDone, onAllDone]);

  return (
    <View style={styles.container}>
      {/* Collapsible header */}
      <TouchableOpacity
        style={styles.feedHeader}
        onPress={() => setIsOpen(v => !v)}
        activeOpacity={0.75}
      >
        <Text style={styles.feedHeaderTitle}>&#x1F4AC; Key Sentences</Text>
        <View style={styles.feedHeaderRight}>
          <Text style={styles.feedHeaderCount}>{sentences.length} sentences</Text>
          <Text style={styles.feedHeaderChevron}>{isOpen ? '▼' : '▶'}</Text>
        </View>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.feedBody}>
          {/* Show Pinyin toggle */}
          <TouchableOpacity
            style={[styles.pinyinToggle, showPinyin && styles.pinyinToggleActive]}
            onPress={() => setShowPinyin(v => !v)}
            activeOpacity={0.8}
          >
            <Text style={styles.pinyinToggleText}>
              {showPinyin ? 'Hide Pinyin' : 'Show Pinyin'}
            </Text>
          </TouchableOpacity>

          {flowDone ? (
            sentences.map((sentence, i) => (
              <View key={i} style={styles.feedDoneRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.feedDoneChinese}>{sentence.chinese}</Text>
                  {showPinyin && sentence.pinyin
                    ? <Text style={styles.feedDonePinyin}>{sentence.pinyin}</Text>
                    : null}
                  <Text style={styles.feedDoneEnglish}>{sentence.english}</Text>
                </View>
                <Text style={styles.feedDoneCheck}>&#x2713;</Text>
              </View>
            ))
          ) : (
            sentences.slice(0, visibleCount).map((sentence, i) => {
              const isActive = i === visibleCount - 1;

              if (!isActive) {
                return (
                  <View key={i} style={styles.feedDoneRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.feedDoneChinese}>{sentence.chinese}</Text>
                      {showPinyin && sentence.pinyin
                        ? <Text style={styles.feedDonePinyin}>{sentence.pinyin}</Text>
                        : null}
                      <Text style={styles.feedDoneEnglish}>{sentence.english}</Text>
                    </View>
                    <Text style={styles.feedDoneCheck}>&#x2713;</Text>
                  </View>
                );
              }

              return (
                <View key={i} style={styles.feedActiveCard}>
                  <View>
                    <Text style={styles.feedActiveChinese}>{sentence.chinese}</Text>
                    {showPinyin && sentence.pinyin
                      ? <Text style={styles.feedActivePinyin}>{sentence.pinyin}</Text>
                      : null}
                    <Text style={styles.feedActiveEnglish}>{sentence.english}</Text>
                  </View>

                  <View style={styles.feedActiveActions}>
                    <TouchableOpacity
                      style={styles.feedPlayBtn}
                      onPress={() => speakAsAvatar(sentence.chinese, avatarId)}
                    >
                      <Text style={styles.feedPlayEmoji}>&#x1F50A;</Text>
                      <Text style={styles.feedPlayBtnText}>Play</Text>
                    </TouchableOpacity>

                    {visibleCount < sentences.length ? (
                      <TouchableOpacity
                        style={styles.feedNextBtn}
                        onPress={() => setVisibleCount(v => v + 1)}
                      >
                        <Text style={styles.feedNextBtnText}>Next &rarr;</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.feedAllDone}>
                        <Text style={styles.feedAllDoneText}>&#x1F389; All done!</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },

  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: VG.border,
  },
  feedHeaderTitle: { fontSize: 17, fontWeight: '800', color: VG.cream },
  feedHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  feedHeaderCount: {
    fontSize: 12, fontWeight: '600', color: SLATE_TEAL,
    backgroundColor: 'rgba(55,73,80,0.12)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  feedHeaderChevron: { fontSize: 13, color: SLATE_TEAL },

  feedBody: { gap: 8, marginTop: 6 },

  pinyinToggle: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 8, borderWidth: 1.5,
    borderColor: 'rgba(155,104,70,0.4)',
  },
  pinyinToggleActive: { backgroundColor: VG.gold, borderColor: VG.gold },
  pinyinToggleText: { fontSize: 12, fontWeight: '700', color: SLATE_TEAL },

  feedDoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.22)',
    gap: 10,
  },
  feedDoneChinese: { fontSize: 16, fontWeight: '700', color: DEEP_NAVY },
  feedDonePinyin:  { fontSize: 11, color: WARM_ORANGE, fontStyle: 'italic' },
  feedDoneEnglish: { fontSize: 12, color: SLATE_TEAL },
  feedDoneCheck:   { fontSize: 18, color: SUCCESS, fontWeight: '800' },

  feedActiveCard: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.22)',
  },
  feedActiveChinese: { fontSize: 16, fontWeight: '700', color: DEEP_NAVY },
  feedActivePinyin:  { fontSize: 11, color: WARM_ORANGE, fontStyle: 'italic' },
  feedActiveEnglish: { fontSize: 12, color: SLATE_TEAL },

  feedActiveActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  feedPlayBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(224,176,75,0.14)',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(224,176,75,0.3)',
  },
  feedPlayEmoji:   { fontSize: 16 },
  feedPlayBtnText: { fontSize: 13, fontWeight: '700', color: WARM_BROWN },
  feedNextBtn: {
    backgroundColor: WARM_ORANGE,
    borderRadius: 10, paddingHorizontal: 20, paddingVertical: 9,
    alignItems: 'center',
  },
  feedNextBtnText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  feedAllDone: {
    backgroundColor: 'rgba(76,175,80,0.12)',
    borderRadius: 10, paddingHorizontal: 16, paddingVertical: 9,
  },
  feedAllDoneText: { fontSize: 13, fontWeight: '700', color: SUCCESS },
});

export default SentencesSection;
