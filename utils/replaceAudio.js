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
  // 行 — polyphonic (xíng = ok/travel vs háng = profession/row); standalone 行 means "ok" → xíng (xing2).
  // Google TTS defaults to háng in isolation; use pre-generated file.
  '行': require('../assets/audio/replace_audios/xing2.mp3'),
  // hsk3 L2 dialogue lines where ElevenLabs reads 行 as háng instead of xíng.
  // speakAsAvatar now checks REPLACE_AUDIO first, so these pre-generated files
  // (with correct phoneme SSML and the character's avatar voice config) take priority.
  '行，进去吧，我们在里面等他回来。': require('../assets/audio/replace_audios/xing2_line1.mp3'),
  '行，你出去的时候把门关上，外面风很大。': require('../assets/audio/replace_audios/xing2_line2.mp3'),
  // 长 — polyphonic (cháng = long vs zhǎng = grow); standalone 长 here means "long" → cháng (chang2).
  // Google TTS defaults to zhǎng in isolation; use pre-generated file.
  '长': require('../assets/audio/replace_audios/chang2.mp3'),
  // 头发比较长 — 长 = cháng (long hair); force cháng so TTS doesn't read it as zhǎng.
  '头发比较长': require('../assets/audio/replace_audios/toufa_bijiao_chang2.mp3'),
  // 还 — polyphonic (hái vs huán); here standalone 还 means "still/also" → hái (hai2).
  // Google TTS ignores the phoneme tag override in some contexts; use pre-generated file.
  '还': require('../assets/audio/replace_audios/hai2.mp3'),
  // hsk3 L9 D1: 地道 should be dì dào (di4+dao4 = authentic), not de+dào.
  // 地 is misread as the structural particle "de" because ElevenLabs sees raw text.
  '哪里！你的进步很大，已经说得很地道了，真赞！': require('../assets/audio/replace_audios/didao_line.mp3'),
  // 够喝了 — 喝 is polyphonic: hē (drink) vs hè (shout/scold). Here it means "drink" → he1.
  // Google TTS defaults to hè in this context; use pre-generated file.
  '够喝了': require('../assets/audio/replace_audios/gou4_he1_le.mp3'),
  // 不了，谢谢，我已经饱了。 — 不了 as declining particle must be bù le (bu4+le0),
  // not bù liǎo (potential complement). Google TTS ignores le0 phoneme tag for 了,
  // so use pre-generated audio with the correct reading.
  '不了，谢谢，我已经饱了。': require('../assets/audio/replace_audios/bu4_le_xiexi.mp3'),
};
