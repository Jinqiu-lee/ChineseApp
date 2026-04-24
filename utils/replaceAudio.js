// ── Replace Audio Map ──────────────────────────────────────────────────────
// Maps Chinese text (exact match) → local MP3 asset.
//
// When the app plays audio for a word/phrase and the text exactly matches a
// key here, the local file is used instead of Google TTS.
//
// HOW TO ADD A REPLACEMENT:
//   1. Record the correct pronunciation as an MP3.
//   2. Save it to:  assets/audio/replace_audios/<filename>.mp3
//   3. Add a require() entry below, e.g.:
//        '背包': require('../assets/audio/replace_audios/bei1bao1.mp3'),
//
// NAMING CONVENTION:
//   Use numbered pinyin for clarity: bei1bao1.mp3, huan2.mp3, etc.
//   For single characters you can also name by the character context.
//
// NOTE ON POLYPHONIC CHARACTERS (多音字):
//   If a character has the right pronunciation via PHONEME_OVERRIDES in tts.js
//   (e.g. 背→bei1, 还→huan2), you usually don't need a replacement here.
//   Add a replacement only when TTS still sounds wrong despite the override,
//   or when you want a human-recorded voice for a specific word.
// ──────────────────────────────────────────────────────────────────────────

export const REPLACE_AUDIO = {
  // 姐姐 — Google TTS mispronounces the neutral tone on the second syllable;
  // use the local recording which has jie3_jie0 (3rd tone + neutral) correctly.
  '姐姐': require('../assets/audio/pinyin/tones/jie3_jie0.mp3'),
  // 有 — use local you3.mp3 for accurate 3rd-tone pronunciation
  '有': require('../assets/audio/pinyin/tones/you3.mp3'),
  // 给 — Google TTS sometimes mispronounces as jǐ (classical/formal reading);
  // use user-recorded gei3_user.mp3 for correct gěi (give) pronunciation
  '给': require('../assets/audio/replace_audios/gei3_user.mp3'),
  // 行 — polyphonic (xíng = ok/travel vs háng = profession/row); standalone 行 means "ok" → xíng.
  // Google TTS defaults to háng in isolation; use pre-generated file.
  '行': require('../assets/audio/replace_audios/xing2.mp3'),
  // hsk3 L2 dialogue lines where ElevenLabs reads 行 as háng instead of xíng.
  '行，进去吧，我们在里面等他回来。': require('../assets/audio/replace_audios/xing2_line1.mp3'),
  '行，你出去的时候把门关上，外面风很大。': require('../assets/audio/replace_audios/xing2_line2.mp3'),
  // 长 — polyphonic (cháng = long vs zhǎng = grow); standalone 长 → cháng (long).
  '长': require('../assets/audio/replace_audios/chang2.mp3'),
  '头发比较长': require('../assets/audio/replace_audios/toufa_bijiao_chang2.mp3'),
  // 背 — polyphonic (bēi = carry on back vs bèi = back/memorise); standalone 背 → bēi.
  // Google TTS defaults to bèi in isolation; use pre-generated file.
  '背': require('../assets/audio/replace_audios/bei1_standalone.mp3'),
  // hsk3 L9 D1: 地道 should be dì dào (authentic), not de+dào.
  '哪里！你的进步很大，已经说得很地道了，真赞！': require('../assets/audio/replace_audios/didao_line.mp3'),
  // 够喝了 — 喝 is hē (drink) not hè (shout); Google TTS defaults to hè here.
  '够喝了': require('../assets/audio/replace_audios/gou4_he1_le.mp3'),
  // 不了，谢谢，我已经饱了。 — 不了 as declining particle (bù le), not bù liǎo.
  '不了，谢谢，我已经饱了。': require('../assets/audio/replace_audios/bu4_le_xiexi.mp3'),
};

// ── Pinyin-keyed replacement audio ─────────────────────────────────────────
// For polyphonic single-character vocabulary words that appear in multiple
// lessons with DIFFERENT readings, REPLACE_AUDIO (keyed by text alone) cannot
// distinguish them. This map is keyed by "char_pinyin_numbered" and is checked
// when speakChinese() is called with an explicit pinyinHint (e.g. from the
// vocabulary section, which passes item.pinyin).
//
// Key format: "<chinese>_<numbered_pinyin>"  e.g. "还_hai2", "还_huan2"
// ──────────────────────────────────────────────────────────────────────────
export const REPLACE_AUDIO_BY_PINYIN = {
  // 还 hái (still/also) — e.g. hsk2 lesson 6 vocabulary
  '还_hai2': require('../assets/audio/replace_audios/hai2.mp3'),
  // 还 huán (to return sth) — e.g. hsk3 lesson 12 vocabulary
  '还_huan2': require('../assets/audio/replace_audios/huan2_standalone.mp3'),
};
