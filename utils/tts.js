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
