import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { GOOGLE_API_KEY } from '../config/googleApiKey';
import AVATAR_VOICES from '../config/avatarVoices';
import { PINYIN_AUDIO } from './pinyinAudio';
import { REPLACE_AUDIO } from './replaceAudio';

const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || '';

const GOOGLE_TTS_API_KEY = GOOGLE_API_KEY;

// Character-level overrides: every instance of this character gets the given pinyin.
// Value is the pinyin tone-number string passed to SSML <phoneme>.
const PHONEME_OVERRIDES = {
  '谁': 'shei2',
  // 说 — Google TTS zh-CN misreads this as shui4; force shuō (tone 1)
  '说': 'shuo1',
  // Note: 背 is polyphonic (bēi = carry on back, bèi = background/memorize)
  // and handled per-compound in COMPOUND_PHONEME_OVERRIDES below.
  // Note: 还 is NOT here — it is polyphonic (hái vs huán) and handled
  // per-compound in COMPOUND_PHONEME_OVERRIDES below.
};

// Compound-word overrides: matched BEFORE character-level overrides.
// Each entry maps a multi-character string → array of [char, pinyin] pairs.
// Use this for polyphonic characters whose reading depends on the word they appear in.
// Default TTS reads 还 as hái (still/also) — override only "return" compounds to huán.
// 不了 as a sentence-final particle is read as bù le (neutral tone), not bù liǎo.
const COMPOUND_PHONEME_OVERRIDES = {
  // 还 huán (return) — default TTS reads hái, so override return-meaning compounds only
  '还书': [['还', 'huan2'], ['书', 'shu1']],
  '还钱': [['还', 'huan2'], ['钱', 'qian2']],
  '还给': [['还', 'huan2'], ['给', 'gei3']],
  '还回': [['还', 'huan2'], ['回', 'hui2']],
  '归还': [['归', 'gui1'], ['还', 'huan2']],
  '偿还': [['偿', 'chang2'], ['还', 'huan2']],
  '还款': [['还', 'huan2'], ['款', 'kuan3']],
  // 背 — polyphonic: bēi (carry on back) vs bèi (background / memorize / back of body)
  // bèi4 compounds:
  '背景': [['背', 'bei4'], ['景', 'jing3']],
  '背诵': [['背', 'bei4'], ['诵', 'song4']],
  '违背': [['违', 'wei2'], ['背', 'bei4']],
  '后背': [['后', 'hou4'], ['背', 'bei4']],
  '背叛': [['背', 'bei4'], ['叛', 'pan4']],
  // bēi1 compounds:
  '背包': [['背', 'bei1'], ['包', 'bao1']],
  '背着': [['背', 'bei1'], ['着', 'zhe0']],
  '背负': [['背', 'bei1'], ['负', 'fu4']],
  // 不了 as a sentence-final particle is read as bù le (neutral tone), not bù liǎo.
  '不了': [['不', 'bu4'], ['了', 'le0']],
  // 加缪 — surname 缪 is read miu4 (not miao4) for the name Camus
  '加缪': [['加', 'jia1'], ['缪', 'miu4']],
  // 大夫 — colloquial word for doctor: 大 is dài (dai4), not dà (da4)
  '大夫': [['大', 'dai4'], ['夫', 'fu0']],
  // 量 — polyphonic: liáng (liang2) as verb "to measure", liàng (liang4) as noun "quantity/amount"
  // Verb compounds (liang2):
  '量体温': [['量', 'liang2'], ['体', 'ti3'], ['温', 'wen1']],
  '量一下': [['量', 'liang2'], ['一', 'yi1'], ['下', 'xia4']],
  '商量':   [['商', 'shang1'], ['量', 'liang2']],
  // Noun compounds (liang4):
  '数量':   [['数', 'shu4'], ['量', 'liang4']],
  '重量':   [['重', 'zhong4'], ['量', 'liang4']],
  '质量':   [['质', 'zhi4'], ['量', 'liang4']],
  '力量':   [['力', 'li4'], ['量', 'liang4']],
  '能量':   [['能', 'neng2'], ['量', 'liang4']],
  '用量':   [['用', 'yong4'], ['量', 'liang4']],
  '剂量':   [['剂', 'ji4'], ['量', 'liang4']],
};

// ── Polyphonic context resolver ──────────────────────────────────────────────
// Scans a plain-text string for known polyphonic characters and wraps each
// bare occurrence (i.e. not already inside an SSML tag) with the correct
// <phoneme> reading, determined by surrounding characters.
//
// Rules (checked after compound overrides, so recognised multi-char words like
// 归还/还书/重量 are already wrapped and skipped here):
//   还 — followed by 是/有/好/可/要/会/需/值/得/行 → hái (still/also)
//         otherwise → huán (return)
//   长 — followed by 大/高/胖/进/出 or preceded by 成/生/茁/院/拔 → zhǎng (grow)
//         otherwise → cháng (long)
//   行 — preceded by 银/商/旅/同/业 → háng (profession/row)
//         otherwise → xíng (ok/travel)
//   重 — followed by 新/复/来/做/写/试 → chóng (repeat)
//         otherwise → zhòng (heavy/important)
const POLYPHONIC_RULES = [
  {
    char: '还',
    resolve: (chars, i) => {
      const next = chars[i + 1] || '';
      return '是有好可要会需值得行'.includes(next) ? 'hai2' : 'huan2';
    },
  },
  {
    char: '长',
    resolve: (chars, i) => {
      const next = chars[i + 1] || '';
      const prev = chars[i - 1] || '';
      if ('大高胖进出'.includes(next)) return 'zhang3';
      if ('成生茁院拔'.includes(prev)) return 'zhang3';
      return 'chang2';
    },
  },
  {
    char: '行',
    resolve: (chars, i) => {
      const prev = chars[i - 1] || '';
      return '银商旅同业'.includes(prev) ? 'hang2' : 'xing2';
    },
  },
  {
    char: '重',
    resolve: (chars, i) => {
      const next = chars[i + 1] || '';
      return '新复来做写试'.includes(next) ? 'chong2' : 'zhong4';
    },
  },
];

// Returns true if position i in the string is inside an SSML tag.
function insideTag(str, i) {
  const before = str.lastIndexOf('<', i);
  const close  = str.lastIndexOf('>', i);
  return before > close; // inside a tag if < comes after the last >
}

function resolvePolyphonic(text) {
  let result = text;
  for (const { char, resolve } of POLYPHONIC_RULES) {
    // Rebuild on each pass so tag offsets stay accurate.
    let out = '';
    const chars = [...result]; // unicode-safe split
    let skip = 0; // chars to skip (already consumed by tag traversal)
    for (let i = 0; i < chars.length; i++) {
      if (chars[i] !== char) { out += chars[i]; continue; }
      // If this char is inside an existing SSML tag, leave it untouched.
      if (insideTag(out, out.length)) { out += chars[i]; continue; }
      const pinyin = resolve(chars, i);
      out += `<phoneme alphabet="pinyin" ph="${pinyin}">${char}</phoneme>`;
    }
    result = out;
  }
  return result;
}

function buildSSML(text) {
  let inner = text;

  // Step 1: apply compound overrides first (longest-match wins within this map)
  for (const [compound, chars] of Object.entries(COMPOUND_PHONEME_OVERRIDES)) {
    if (inner.includes(compound)) {
      const ssml = chars
        .map(([ch, ph]) => `<phoneme alphabet="pinyin" ph="${ph}">${ch}</phoneme>`)
        .join('');
      inner = inner.replaceAll(compound, ssml);
    }
  }

  // Step 2: context-aware polyphonic resolver for 还/长/行/重
  // Runs after compound overrides so already-wrapped chars are skipped.
  inner = resolvePolyphonic(inner);

  // Step 3: apply single-character overrides to any remaining bare characters
  for (const [char, pinyin] of Object.entries(PHONEME_OVERRIDES)) {
    inner = inner.replaceAll(
      char,
      `<phoneme alphabet="pinyin" ph="${pinyin}">${char}</phoneme>`,
    );
  }

  return `<speak>${inner}</speak>`;
}

// Simple in-memory cache: cacheKey (text+gender) → base64 MP3 string
const audioCache = new Map();

const TMP_FILE = FileSystem.cacheDirectory + 'tts_temp.mp3';

// Voice configs by gender
// Male: higher pitch + slower rate → soft, young, non-aggressive
const VOICE_CONFIG = {
  female: { ssmlGender: 'FEMALE', speakingRate: 0.9, pitch: 2.0 },
  male:   { ssmlGender: 'MALE',   speakingRate: 0.85, pitch: 5.0 },
};

// ── Pinyin TTS helpers ───────────────────────────────────────────────────
const PY_TONE_NUM = {
  'ā':1,'á':2,'ǎ':3,'à':4,
  'ē':1,'é':2,'ě':3,'è':4,
  'ī':1,'í':2,'ǐ':3,'ì':4,
  'ō':1,'ó':2,'ǒ':3,'ò':4,
  'ū':1,'ú':2,'ǔ':3,'ù':4,
  'ǖ':1,'ǘ':2,'ǚ':3,'ǜ':4,
};
const PY_STRIP = {
  'ā':'a','á':'a','ǎ':'a','à':'a',
  'ē':'e','é':'e','ě':'e','è':'e',
  'ī':'i','í':'i','ǐ':'i','ì':'i',
  'ō':'o','ó':'o','ǒ':'o','ò':'o',
  'ū':'u','ú':'u','ǔ':'u','ù':'u',
  'ǖ':'v','ǘ':'v','ǚ':'v','ǜ':'v',
};

// Convert diacritic pinyin syllable to numbered format: "mā" → "ma1", "zhōng" → "zhong1"
function pinyinToNumbered(syllable) {
  let tone = 0; // neutral tone = 0
  let base = '';
  for (const ch of syllable.toLowerCase().trim()) {
    if (PY_TONE_NUM[ch]) { tone = PY_TONE_NUM[ch]; base += PY_STRIP[ch]; }
    else base += ch;
  }
  return base + tone;
}

// Canonical numbered-pinyin syllable for each initial (as taught in class)
const INITIAL_CANONICAL_PY = {
  'b':'bo1','p':'po4','m':'mo2','f':'fo2',
  'd':'de2','t':'te4','n':'na4','l':'la1',
  'g':'ge1','k':'ke1','h':'he2',
  'j':'ji1','q':'qi2','x':'xi1',
  'zh':'zhi1','ch':'chi2','sh':'shi4','r':'ri4',
  'z':'zi4','c':'ci2','s':'si1',
  'y':'yi1','w':'wu2',
};

// Canonical numbered-pinyin for each final
const FINAL_CANONICAL_PY = {
  'a':'a1','o':'o1','e':'e2','i':'yi1','u':'wu2','ü':'yu2','v':'yu2',
  'ai':'ai4','ei':'ei1','ui':'wei4','ao':'ao4','ou':'ou3',
  'iu':'you3','ie':'ye2','üe':'yue4','er':'er3',
  'an':'an1','en':'en1','in':'yin1','un':'wen2','ün':'yun1',
  'ang':'ang2','eng':'eng1','ing':'ying1','ong':'hong2',
};

// Derive the PINYIN_AUDIO map key for a given syllable input.
// Returns e.g. 'init_b', 'fin_ao', 'fin_v' (for ü), or 'ma1' for tone practice.
function getPinyinAudioKey(syllable) {
  const lower = syllable.toLowerCase().trim();
  // If the input is already a key in the map (e.g. 'nv1', 'ba1'), use it directly.
  if (PINYIN_AUDIO[lower]) return lower;
  // Normalize ü → v and remove apostrophes for filename safety
  const normalized = lower.replace(/ü/g, 'v').replace(/'/g, '');
  if (INITIAL_CANONICAL_PY[normalized] || INITIAL_CANONICAL_PY[lower]) return `init_${normalized}`;
  if (FINAL_CANONICAL_PY[normalized] || FINAL_CANONICAL_PY[lower])   return `fin_${normalized}`;
  // Tone-practice syllable → numbered form (e.g. "mā" → "ma1", "nǚ'ér" → "nuer2")
  const numbered = pinyinToNumbered(normalized);
  if (PINYIN_AUDIO[numbered]) return numbered;
  // Fallback: if only a single fin_ recording exists (no 4-tone set), strip the tone digit
  const base = numbered.replace(/\d$/, '');
  if (PINYIN_AUDIO[`fin_${base}`]) return `fin_${base}`;
  return numbered;
}

// Play a bundled local MP3 asset (from the require() map).
async function playLocalAudio(assetModule) {
  await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  const { sound } = await Audio.Sound.createAsync(assetModule);
  await sound.playAsync();
  sound.setOnPlaybackStatusUpdate((s) => { if (s.didJustFinish) sound.unloadAsync(); });
}

// Speak a pinyin syllable. Uses your recorded MP3 if available, falls back to TTS.
// Examples: speakPinyin("mā"), speakPinyin("b"), speakPinyin("ao")
export async function speakPinyin(syllable, gender = 'female') {
  // ── 1. Try local recording first ────────────────────────────────────────
  const key = getPinyinAudioKey(syllable);
  const localAsset = PINYIN_AUDIO[key];
  if (localAsset) {
    try {
      await playLocalAudio(localAsset);
      return;
    } catch (err) {
      console.warn('speakPinyin: local file failed, falling back to TTS:', err);
    }
  }

  // ── 2. Fall back to Google TTS ───────────────────────────────────────────
  if (!GOOGLE_TTS_API_KEY || GOOGLE_TTS_API_KEY === 'YOUR_GOOGLE_CLOUD_API_KEY_HERE') {
    console.warn('tts.js: No local audio and no API key set.');
    return;
  }

  const lower = syllable.toLowerCase().trim();
  let numbered;
  if (INITIAL_CANONICAL_PY[lower]) {
    numbered = INITIAL_CANONICAL_PY[lower];
  } else if (FINAL_CANONICAL_PY[lower]) {
    numbered = FINAL_CANONICAL_PY[lower];
  } else {
    numbered = pinyinToNumbered(lower);
  }

  const vc = VOICE_CONFIG[gender] || VOICE_CONFIG.female;
  const cacheKey = `py:${gender}:${numbered}`;

  try {
    let base64Audio = audioCache.get(cacheKey);
    if (!base64Audio) {
      const ssml = `<speak><phoneme alphabet="pinyin" ph="${numbered}">啊</phoneme></speak>`;
      const res = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { ssml },
            voice: { languageCode: 'zh-CN', ssmlGender: vc.ssmlGender },
            audioConfig: { audioEncoding: 'MP3', speakingRate: 0.8, pitch: vc.pitch },
          }),
        },
      );
      const json = await res.json();
      if (!json.audioContent) { console.error('speakPinyin API error:', JSON.stringify(json)); return; }
      base64Audio = json.audioContent;
      audioCache.set(cacheKey, base64Audio);
    }
    await FileSystem.writeAsStringAsync(TMP_FILE, base64Audio, { encoding: 'base64' });
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const { sound } = await Audio.Sound.createAsync({ uri: TMP_FILE });
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((s) => { if (s.didJustFinish) sound.unloadAsync(); });
  } catch (err) {
    console.error('speakPinyin error:', err);
  }
}

// ── Avatar voice configs ─────────────────────────────────────────────────
// Pitch range: -20 to +20 semitones. Rate range: 0.25–4.0 (1.0 = normal).
// Each avatar is tuned to be clearly distinct from the others.
const AVATAR_VOICE_CONFIG = {
  // Li Bai — young, bright, passionate; cmn-CN-Wavenet-C
  libai:  { ssmlGender: 'MALE',   voiceName: 'cmn-CN-Wavenet-C', pitch:  5,  speakingRate: 1.03 },
  // Lu Xun — stern, blunt, deliberate: noticeably low pitch + slow
  luxun:  { ssmlGender: 'MALE',   pitch: -5,  speakingRate: 0.80 },
  // Eileen Chang — controlled, precise, cool; cmn-CN-Wavenet-A
  eileen: { ssmlGender: 'FEMALE', voiceName: 'cmn-CN-Wavenet-A', pitch:  0,  speakingRate: 0.90 },
  // Jane Austen
  jane:   { ssmlGender: 'FEMALE', pitch:  2,  speakingRate: 0.95 },
  // Camus — calm, even, measured: mildly low male + moderately slow
  camus:    { ssmlGender: 'MALE',   pitch: -2,  speakingRate: 0.87 },
  // Dante — deep, grave, solemn: lowest pitch + slowest male rate
  dante:    { ssmlGender: 'MALE',   pitch: -8,  speakingRate: 0.76 },
  // Elena Ferrante — soft, medium-low female, slow and thoughtful, intimate
  elena:    { ssmlGender: 'FEMALE', pitch: -3,  speakingRate: 0.75 },
  // Liu Cixin — calm, slightly deep male, emotionally restrained, vast
  liucixin: { ssmlGender: 'MALE',   pitch: -4,  speakingRate: 0.82 },
  // Van Gogh — impassioned, intense, slightly unpredictable artist
  vangogh:  { ssmlGender: 'MALE',   pitch:  3,  speakingRate: 0.92 },
  // Simone de Beauvoir — 40s, wise, lower, steady and passionate
  beauvoir: { ssmlGender: 'FEMALE', pitch: -4,  speakingRate: 0.82 },
  // Virginia Woolf — controlled, precise, cool; cmn-CN-Wavenet-A
  woolf:    { ssmlGender: 'FEMALE', voiceName: 'cmn-CN-Wavenet-A', pitch:  0,  speakingRate: 0.90 },
  // Picasso — 50s, witty, humorous, faster with Spanish-flavoured passion
  picasso:  { ssmlGender: 'MALE',   pitch:  4,  speakingRate: 1.00 },
  // Sartre — philosophical, deliberate, deep
  sartre:   { ssmlGender: 'MALE',   pitch: -3,  speakingRate: 0.80 },
  // Su Shi — mid-age, warm, grounded; cmn-CN-Wavenet-B
  sushi:    { ssmlGender: 'MALE',   voiceName: 'cmn-CN-Wavenet-B', pitch: -5,  speakingRate: 0.90 },
  // Yang Jiang — elder, slow, serene, wise; cmn-CN-Wavenet-E
  yangjiang:{ ssmlGender: 'FEMALE', voiceName: 'cmn-CN-Wavenet-E', pitch: -15, speakingRate: 0.80 },
};

// Speak text using the avatar's personalised voice profile.
// Tries ElevenLabs first (if key + voiceId are set), then falls back to Google TTS,
// then falls back to speakChinese().
export async function speakAsAvatar(text, avatarId = 'eileen') {
  // ── 1. ElevenLabs path ──────────────────────────────────────────────────
  if (ELEVENLABS_API_KEY && ELEVENLABS_API_KEY !== 'YOUR_ELEVENLABS_API_KEY_HERE') {
    const voiceEntry = AVATAR_VOICES[avatarId];
    // voiceId: null means "skip ElevenLabs, fall back to Google TTS" (dante, elena, liucixin).
    // voiceId: undefined (avatar not in config) also skips ElevenLabs.
    // Also skip if voiceId is an unfilled placeholder string.
    const voiceId = voiceEntry?.voiceId ?? null;

    if (voiceId !== null && !voiceId.startsWith('PLACEHOLDER')) {
      // Cache stores base64 string (same pattern as Google TTS path)
      const cacheKey = `eleven_v1:${avatarId}:${text}`;
      try {
        let base64Audio = audioCache.get(cacheKey);

        if (!base64Audio) {
          const res = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY,
              },
              body: JSON.stringify({
                text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: { stability: 0.5, similarity_boost: 0.75 },
              }),
            },
          );

          if (!res.ok) {
            console.warn(`speakAsAvatar ElevenLabs error for ${avatarId}:`, res.status);
            // fall through to Google TTS below
          } else {
            // ElevenLabs returns raw MP3 bytes — convert to base64 for FileSystem
            const arrayBuffer = await res.arrayBuffer();
            const uint8 = new Uint8Array(arrayBuffer);
            let binary = '';
            for (let i = 0; i < uint8.byteLength; i++) binary += String.fromCharCode(uint8[i]);
            base64Audio = btoa(binary);
            audioCache.set(cacheKey, base64Audio);
          }
        }

        if (base64Audio) {
          await FileSystem.writeAsStringAsync(TMP_FILE, base64Audio, { encoding: 'base64' });
          await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
          const { sound } = await Audio.Sound.createAsync({ uri: TMP_FILE });
          await sound.playAsync();
          sound.setOnPlaybackStatusUpdate((s) => { if (s.didJustFinish) sound.unloadAsync(); });
          return;
        }
      } catch (err) {
        console.warn('speakAsAvatar ElevenLabs error, falling through to Google TTS:', err);
      }
    }
  }

  // ── 2. Google TTS path ──────────────────────────────────────────────────
  if (!GOOGLE_TTS_API_KEY || GOOGLE_TTS_API_KEY === 'YOUR_GOOGLE_CLOUD_API_KEY_HERE') {
    return speakChinese(text);
  }

  const vc = AVATAR_VOICE_CONFIG[avatarId];
  if (!vc) return speakChinese(text);

  const cacheKey = `avatar_v4:${avatarId}:${text}`;

  try {
    let base64Audio = audioCache.get(cacheKey);

    if (!base64Audio) {
      const res = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { ssml: buildSSML(text) },
            voice: {
              languageCode: 'zh-CN',
              ssmlGender: vc.ssmlGender,
              ...(vc.voiceName ? { name: vc.voiceName } : {}),
            },
            audioConfig: {
              audioEncoding: 'MP3',
              speakingRate: vc.speakingRate,
              pitch: vc.pitch,
            },
          }),
        },
      );

      const json = await res.json();
      if (!json.audioContent) {
        console.warn(`speakAsAvatar: API error for ${avatarId}, falling back:`, JSON.stringify(json));
        return speakChinese(text);
      }
      base64Audio = json.audioContent;
      audioCache.set(cacheKey, base64Audio);
    }

    await FileSystem.writeAsStringAsync(TMP_FILE, base64Audio, { encoding: 'base64' });
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const { sound } = await Audio.Sound.createAsync({ uri: TMP_FILE });
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((s) => { if (s.didJustFinish) sound.unloadAsync(); });
  } catch (err) {
    console.warn('speakAsAvatar error, falling back to speakChinese:', err);
    return speakChinese(text);
  }
}

export async function speakChinese(text, gender = 'female') {
  // ── 0. Check for user-uploaded replacement audio (exact match) ───────────
  if (REPLACE_AUDIO[text]) {
    try {
      await playLocalAudio(REPLACE_AUDIO[text]);
      return;
    } catch (err) {
      console.warn('speakChinese: replacement file failed, falling back to TTS:', err);
    }
  }

  if (!GOOGLE_TTS_API_KEY || GOOGLE_TTS_API_KEY === 'YOUR_GOOGLE_CLOUD_API_KEY_HERE') {
    console.warn('tts.js: Set your GOOGLE_TTS_API_KEY to enable audio.');
    return;
  }

  const vc = VOICE_CONFIG[gender] || VOICE_CONFIG.female;
  const cacheKey = `${gender}:${text}`;

  try {
    let base64Audio = audioCache.get(cacheKey);

    if (!base64Audio) {
      const res = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { ssml: buildSSML(text) },
            voice: {
              languageCode: 'zh-CN',
              ssmlGender: vc.ssmlGender,
            },
            audioConfig: {
              audioEncoding: 'MP3',
              speakingRate: vc.speakingRate,
              pitch: vc.pitch,
            },
          }),
        },
      );

      const json = await res.json();
      if (!json.audioContent) {
        console.error('TTS API error:', JSON.stringify(json));
        return;
      }
      base64Audio = json.audioContent;
      audioCache.set(cacheKey, base64Audio);
    }

    // Write base64 MP3 to a temp file then play it
    await FileSystem.writeAsStringAsync(TMP_FILE, base64Audio, {
      encoding: 'base64',
    });

    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const { sound } = await Audio.Sound.createAsync({ uri: TMP_FILE });
    await sound.playAsync();
    // Unload after playback to free memory
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) sound.unloadAsync();
    });
  } catch (err) {
    console.error('speakChinese error:', err);
  }
}
