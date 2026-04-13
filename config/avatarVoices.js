// ElevenLabs voice IDs for each avatar.
// Keys match the avatar identifiers in config/avatarConfig.js.
// Entries with voiceId: null use the existing Google TTS voice instead of ElevenLabs.
// Replace PLACEHOLDER_* strings with real ElevenLabs voice IDs before going live.

// Fallback voiceId used when an avatar has no entry or its voiceId is null.
// Point this at any generic Mandarin-capable ElevenLabs voice.
export const DEFAULT_ELEVEN_VOICE_ID = 'PLACEHOLDER_default';

const AVATAR_VOICES = {
  // Eileen Chang — intimate, natural, literary Shanghai voice
  eileen:    { voiceId: 'PLACEHOLDER_eileen' },

  // Li Bai — bright, exclamatory, classic Tang poet
  libai:     { voiceId: 'PLACEHOLDER_libai' },

  // Lu Xun — stern, blunt, deliberate; modern Chinese realist
  luxun:     { voiceId: 'PLACEHOLDER_luxun' },

  // Dante Alighieri — deep, grave, solemn; UNCHANGED (keep existing voice)
  dante:     { voiceId: null },

  // Albert Camus — calm, measured, philosophical; French-Algerian warmth
  camus:     { voiceId: 'PLACEHOLDER_camus' },

  // Jane Austen — bright, witty, precise; crisp Regency English cadence
  jane:      { voiceId: 'PLACEHOLDER_jane' },

  // Elena Ferrante — soft, intimate, introspective; UNCHANGED (keep existing voice)
  elena:     { voiceId: null },

  // Liu Cixin — calm, restrained, vast; UNCHANGED (keep existing voice)
  liucixin:  { voiceId: null },

  // Vincent van Gogh — impassioned, intense, slightly unpredictable
  vangogh:   { voiceId: 'PLACEHOLDER_vangogh' },

  // Simone de Beauvoir — wise, lower, steady and passionate
  beauvoir:  { voiceId: 'PLACEHOLDER_beauvoir' },

  // Virginia Woolf — lyrical, lower key, slightly slower; stream-of-consciousness
  woolf:     { voiceId: 'PLACEHOLDER_woolf' },

  // Pablo Picasso — witty, humorous, faster; Mediterranean energy
  picasso:   { voiceId: 'PLACEHOLDER_picasso' },

  // Jean-Paul Sartre — philosophical, deliberate, world-weary
  sartre:    { voiceId: 'PLACEHOLDER_sartre' },

  // Yang Jiang — elder, slow, wise and elegant; graceful 70s female
  yangjiang: { voiceId: 'PLACEHOLDER_yangjiang' },

  // Su Shi — 50s, wisdom; lower and slower than Li Bai
  sushi:     { voiceId: 'PLACEHOLDER_sushi' },
};

export default AVATAR_VOICES;
