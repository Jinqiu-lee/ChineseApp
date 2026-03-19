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
  // Add entries here as you record corrections, e.g.:
  // '背包': require('../assets/audio/replace_audios/bei1bao1.mp3'),
  // '还书': require('../assets/audio/replace_audios/huan2shu1.mp3'),
};
