// ElevenLabs voice IDs for each avatar.
// Keys match the avatar identifiers in config/avatarConfig.js.
// Entries with voiceId: null use the existing Google TTS voice instead of ElevenLabs.
// Replace PLACEHOLDER_* strings with real ElevenLabs voice IDs before going live.

// Fallback voiceId used when an avatar has no entry or its voiceId is null.
// Point this at any generic Mandarin-capable ElevenLabs voice.
export const DEFAULT_ELEVEN_VOICE_ID = 'PLACEHOLDER_default';

const AVATAR_VOICES = {
  // Eileen Chang — intimate, natural; Google TTS FEMALE pitch -1, rate 0.80
  eileen:    { voiceId: null },

  // Li Bai — Google TTS cmn-CN-Wavenet-C, pitch 10, rate 1.05
  libai:     { voiceId: null },

  // Lu Xun — Google TTS cmn-CN-Wavenet-B
  luxun:     { voiceId: null },

  // Dante Alighieri — Google TTS cmn-CN-Wavenet-C
  dante:     { voiceId: null },

  // Albert Camus — Google TTS cmn-CN-Wavenet-D
  camus:     { voiceId: null },

  // Jane Austen — bright, witty, precise; Google TTS FEMALE pitch +2, rate 0.95
  jane:      { voiceId: null },

  // Elena Ferrante — Google TTS cmn-CN-Wavenet-A
  elena:     { voiceId: null },

  // Liu Cixin — calm, restrained, vast; UNCHANGED (keep existing voice)
  liucixin:  { voiceId: null },

  // Vincent van Gogh — removed from dialogues; no ElevenLabs voice needed
  vangogh:   { voiceId: null },

  // Simone de Beauvoir — Google TTS cmn-CN-Wavenet-E
  beauvoir:  { voiceId: null },

  // Virginia Woolf — Google TTS cmn-CN-Wavenet-A, pitch 0, rate 0.90
  woolf:     { voiceId: null },

  // Pablo Picasso — removed from dialogues; no ElevenLabs voice needed
  picasso:   { voiceId: null },

  // Jean-Paul Sartre — Google TTS cmn-CN-Wavenet-B
  sartre:    { voiceId: null },

  // Yang Jiang — Google TTS cmn-CN-Wavenet-E, pitch -15, rate 0.80
  yangjiang: { voiceId: null },

  // Su Shi — deep, grave; Google TTS MALE pitch -8, rate 0.76
  sushi:     { voiceId: null },
};

export default AVATAR_VOICES;

// ── DEV helper ───────────────────────────────────────────────────────────────
// Call logAvatarVoices() during app startup (guarded by DEV_UNLOCK_ALL) to
// confirm every avatar has a voiceId wired correctly before going to production.
export function logAvatarVoices() {
  const DESCRIPTIONS = {
    eileen:    'intimate, natural, literary Shanghai voice',
    libai:     'bright, exclamatory, classic Tang poet',
    luxun:     'stern, blunt, deliberate; modern Chinese realist',
    dante:     'deep, grave, solemn — Google TTS (unchanged)',
    camus:     'calm, measured, philosophical; French-Algerian warmth',
    jane:      'bright, witty, precise; crisp Regency English cadence',
    elena:     'soft, intimate, introspective — Google TTS (unchanged)',
    liucixin:  'calm, restrained, vast — Google TTS (unchanged)',
    vangogh:   'impassioned, intense, slightly unpredictable',
    beauvoir:  'wise, lower, steady and passionate',
    woolf:     'lyrical, lower key, slightly slower; stream-of-consciousness',
    picasso:   'witty, humorous, faster; Mediterranean energy',
    sartre:    'philosophical, deliberate, world-weary',
    yangjiang: 'elder, slow, wise and elegant; graceful 70s female',
    sushi:     '50s wisdom; lower and slower than Li Bai',
  };

  console.log('\n── Avatar Voice Configuration ──────────────────────────');
  Object.entries(AVATAR_VOICES).forEach(([key, { voiceId }]) => {
    const status = voiceId === null
      ? '(Google TTS)'
      : voiceId.startsWith('PLACEHOLDER')
        ? '⚠️  PLACEHOLDER — not wired'
        : `✅  ${voiceId}`;
    console.log(`  ${key.padEnd(12)} ${status}  — ${DESCRIPTIONS[key] || ''}`);
  });
  console.log('────────────────────────────────────────────────────────\n');
}
