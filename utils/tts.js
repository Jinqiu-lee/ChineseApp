import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { GOOGLE_API_KEY } from '../config/googleApiKey';

const GOOGLE_TTS_API_KEY = GOOGLE_API_KEY;

// Words whose standard Putonghua pronunciation differs from preferred colloquial form.
// Value is the pinyin tone number string passed to SSML <phoneme>.
const PHONEME_OVERRIDES = {
  '谁': 'shei2',
};

function buildSSML(text) {
  let inner = text;
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
  'ǖ':'u','ǘ':'u','ǚ':'u','ǜ':'u',
};

// Convert diacritic pinyin syllable to numbered format: "mā" → "ma1", "zhōng" → "zhong1"
function pinyinToNumbered(syllable) {
  let tone = 5; // neutral default
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

// Speak a pinyin syllable (with or without tone marks) using SSML phoneme.
// Examples: speakPinyin("mā"), speakPinyin("ma1"), speakPinyin("b") (uses canonical)
export async function speakPinyin(syllable, gender = 'female') {
  if (!GOOGLE_TTS_API_KEY || GOOGLE_TTS_API_KEY === 'YOUR_GOOGLE_CLOUD_API_KEY_HERE') {
    console.warn('tts.js: Set your GOOGLE_TTS_API_KEY to enable audio.');
    return;
  }
  // If it's a bare initial or final with no tone mark, look up canonical syllable
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
      // Use SSML phoneme — "啊" is a placeholder, pronunciation is driven by ph attribute
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
    sound.setOnPlaybackStatusUpdate((status) => { if (status.didJustFinish) sound.unloadAsync(); });
  } catch (err) {
    console.error('speakPinyin error:', err);
  }
}

export async function speakChinese(text, gender = 'female') {
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
