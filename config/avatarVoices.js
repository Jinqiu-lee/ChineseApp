// ElevenLabs voice IDs for each avatar.
// Keys match the avatar identifiers in config/avatarConfig.js.
// Entries with voiceId: null use the existing Google TTS voice instead of ElevenLabs.
// Replace PLACEHOLDER_* strings with real ElevenLabs voice IDs before going live.

// Fallback voiceId used when an avatar has no entry or its voiceId is null.
// Point this at any generic Mandarin-capable ElevenLabs voice.
export const DEFAULT_ELEVEN_VOICE_ID = 'PLACEHOLDER_default';

const AVATAR_VOICES = {
  // Eileen Chang — intimate, natural, literary Shanghai voice
  eileen:    { voiceId: 'Ul9WvCihLg49MLu44xfj' },

  // Li Bai — bright, exclamatory, classic Tang poet
  libai:     { voiceId: 'U9IusOUvPHFbqRQIHkVh' },

  // Lu Xun — stern, blunt, deliberate; modern Chinese realist
  luxun:     { voiceId: '0NR5Z8eaUqhg0D1A34Kk' },

  // Dante Alighieri — deep, grave, solemn; UNCHANGED (keep existing voice)
  dante:     { voiceId: null },

  // Albert Camus — calm, measured, philosophical; French-Algerian warmth
  camus:     { voiceId: 'LR6e92zZ1KBeAEoE1I9J' },

  // Jane Austen — bright, witty, precise; crisp Regency English cadence
  jane:      { voiceId: 'JRFjU1coKyrPTR37RTqR' },

  // Elena Ferrante — soft, intimate, introspective; UNCHANGED (keep existing voice)
  elena:     { voiceId: null },

  // Liu Cixin — calm, restrained, vast; UNCHANGED (keep existing voice)
  liucixin:  { voiceId: null },

  // Vincent van Gogh — impassioned, intense, slightly unpredictable
  vangogh:   { voiceId: 'VqRZ6BFefek5cPzVm5MN' },

  // Simone de Beauvoir — wise, lower, steady and passionate
  beauvoir:  { voiceId: 'eJb7rGmurZw1QsQcctjy' },

  // Virginia Woolf — lyrical, lower key, slightly slower; stream-of-consciousness
  woolf:     { voiceId: 'Tzf8K1T8bC5nay312fzF' },

  // Pablo Picasso — witty, humorous, faster; Mediterranean energy
  picasso:   { voiceId: 'Tcg63YwW0LxikmdRNXoy' },

  // Jean-Paul Sartre — philosophical, deliberate, world-weary
  sartre:    { voiceId: 'IhXgclqv7cpik4fmbuFY' },

  // Yang Jiang — elder, slow, wise and elegant; graceful 70s female
  yangjiang: { voiceId: 'kn53b2ZipRDVLK5bBxva' },

  // Su Shi — 50s, wisdom; lower and slower than Li Bai
  sushi:     { voiceId: 'sxvGmyDpdgNtznrLkg1W' },
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
