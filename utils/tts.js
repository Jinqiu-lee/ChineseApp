import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { GOOGLE_API_KEY } from '../config/googleApiKey';
import { PINYIN_AUDIO } from './pinyinAudio';
import { REPLACE_AUDIO } from './replaceAudio';

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

  // Step 2: apply single-character overrides to any remaining bare characters
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
  // Li Bai — bright, fast, exclamatory poet: highest pitch + fastest rate
  libai:  { ssmlGender: 'MALE',   pitch:  7,  speakingRate: 1.08 },
  // Lu Xun — stern, blunt, deliberate: noticeably low pitch + slow
  luxun:  { ssmlGender: 'MALE',   pitch: -5,  speakingRate: 0.80 },
  // Eileen Chang — intimate, natural
  eileen: { ssmlGender: 'FEMALE', pitch: -1,  speakingRate: 0.80 },
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
  // Virginia Woolf — 30s, lyrical, lower key, slightly slower than Austen
  woolf:    { ssmlGender: 'FEMALE', pitch: -2,  speakingRate: 0.88 },
  // Picasso — 50s, witty, humorous, faster with Spanish-flavoured passion
  picasso:  { ssmlGender: 'MALE',   pitch:  4,  speakingRate: 1.00 },
  // Sartre — philosophical, deliberate, deep
  sartre:   { ssmlGender: 'MALE',   pitch: -3,  speakingRate: 0.80 },
  // Su Shi — 50s, wisdom, lower and slower than Li Bai
  sushi:    { ssmlGender: 'MALE',   pitch: -3,  speakingRate: 0.82 },
  // Yang Jiang — 70s, lower, slower, wise and elegant like a graceful elder
  yangjiang:{ ssmlGender: 'FEMALE', pitch: -6,  speakingRate: 0.70 },
};

// Speak text using the avatar's personalised voice profile.
// Falls back to speakChinese() if the API key is missing or the call fails.
export async function speakAsAvatar(text, avatarId = 'eileen') {
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
