import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { GOOGLE_API_KEY } from '../config/googleApiKey';
import { pinyin } from 'pinyin-pro';

const STT_URL = `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_API_KEY}`;

// Platform-specific recording options for Google STT compatibility
// iOS  → LINEAR16 PCM (.caf) → STT encoding: LINEAR16
// Android → AMR-WB (.amr)    → STT encoding: AMR_WB
const RECORDING_OPTIONS = {
  // On, so a recording can hear its own silence and stop itself — see
  // watchSilence below. Metering costs nothing when nobody reads it.
  isMeteringEnabled: true,
  android: {
    extension: '.amr',
    outputFormat: Audio.AndroidOutputFormat.AMR_WB,
    audioEncoder: Audio.AndroidAudioEncoder.AMR_WB,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: '.caf',
    outputFormat: Audio.IOSOutputFormat.LINEARPCM,
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};

const STT_CONFIG = Platform.OS === 'android'
  ? { encoding: 'AMR_WB', sampleRateHertz: 16000 }
  : { encoding: 'LINEAR16', sampleRateHertz: 16000 };

// ── Recording ────────────────────────────────────────────────────────────
export async function startRecording() {
  const { granted } = await Audio.requestPermissionsAsync();
  if (!granted) throw new Error('Microphone permission denied');

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });

  const { recording } = await Audio.Recording.createAsync(RECORDING_OPTIONS);
  return recording;
}

/**
 * Stop a recording that has gone quiet.
 *
 * Calls `onSilence` once the microphone has stayed at room level for
 * `silenceMs` without a break. The Stop button is untouched — this only
 * covers tapping Record and then saying nothing, or walking away mid-answer.
 *
 * The level is measured against the room, not against a fixed number. A
 * first pass of `calibrateMs` listens to the room as it sounds before anyone
 * speaks, and only something `speechMargin` dB above that counts as a voice.
 * A fixed threshold does not work: expo-av meters from -160 dB (true silence)
 * to 0 dB, and an ordinary quiet room already sits near -40, so anything
 * absolute is either never reached or tripped constantly.
 *
 * If the platform reports no metering, this never fires. Cutting a recording
 * short because we cannot hear it would be worse than letting it run.
 *
 * Returns a cancel function; call it when the recording stops for any other
 * reason.
 */
export function watchSilence(recording, onSilence, opts = {}) {
  const {
    silenceMs    = 5000,   // how long the room has to stay quiet
    pollMs       = 200,
    calibrateMs  = 700,    // how long we listen before judging anything
    speechMargin = 10,     // dB above the room that counts as speech
    quietestRoom = -50,    // do not treat a silent booth as the bar to beat
  } = opts;

  const startedAt = Date.now();
  const samples = [];
  let roomLevel = null;
  let lastSound = Date.now();
  let done = false;
  const cancel = () => { done = true; clearInterval(timer); };

  const timer = setInterval(async () => {
    if (done) return;
    let level = null;
    try {
      const status = await recording.getStatusAsync();
      if (!status?.isRecording) return;
      level = typeof status.metering === 'number' ? status.metering : null;
    } catch {
      cancel();           // the recording went away under us
      return;
    }
    if (level == null) return;              // no meter here; never auto-stop

    const now = Date.now();

    if (roomLevel == null) {
      samples.push(level);
      if (now - startedAt < calibrateMs) return;
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      roomLevel = Math.max(quietestRoom, mean);
      lastSound = now;                      // the clock starts after calibration
      if (__DEV__) {
        console.log(`[watchSilence] room ${roomLevel.toFixed(1)} dB · ` +
          `speech above ${(roomLevel + speechMargin).toFixed(1)} dB · ` +
          `stops after ${silenceMs / 1000}s quiet`);
      }
      return;
    }

    if (level > roomLevel + speechMargin) { lastSound = now; return; }
    if (now - lastSound >= silenceMs) { cancel(); onSilence(); }
  }, pollMs);

  return cancel;
}

// ── Pinyin conversion ────────────────────────────────────────────────────
// Returns tone-free pinyin as a single lowercase string, e.g. 妈妈 → "mama"
function convertToPinyinString(chineseText) {
  return pinyin(chineseText, {
    toneType: 'none',
    type: 'string',
    separator: '',
  }).toLowerCase().trim();
}

// ── Number normalisation ─────────────────────────────────────────────────
// Converts Chinese digit characters → Arabic so "六月" and "6月" compare equal.
const ZH_DIGIT_MAP = {
  '零':'0','一':'1','二':'2','三':'3','四':'4',
  '五':'5','六':'6','七':'7','八':'8','九':'9',
};
function normaliseNumbers(s) {
  return s.replace(/[零一二三四五六七八九]/g, ch => ZH_DIGIT_MAP[ch] ?? ch);
}

// ── Transcription ─────────────────────────────────────────────────────────
// hintText  — the Chinese string we expect the user to say.
//             Passed as a speechContexts boost so Google STT favours it.
//             Essential for short words (months, numbers, single characters).
export async function stopAndTranscribe(recording, hintText = '') {
  await recording.stopAndUnloadAsync();
  await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

  const uri = recording.getURI();
  if (!uri) throw new Error('No recording URI');

  const base64Audio = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });

  // Use command_and_search model for short utterances (≤4 chars) — it is
  // optimised for isolated words and performs far better than 'default' for
  // month names, numbers and other short phrases.
  const cleanHint = hintText.replace(/[，。！？、；：\s]/g, '');
  const model = cleanHint.length <= 6 ? 'command_and_search' : 'default';

  // Build speech contexts: include both the original hint and the
  // number-normalised form so "六月" matches whether STT returns 六月 or 6月.
  const phrases = hintText
    ? [hintText, normaliseNumbers(hintText)].filter(Boolean)
    : [];

  const res = await fetch(STT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      config: {
        ...STT_CONFIG,
        languageCode: 'zh-CN',
        model,
        maxAlternatives: 3,
        enableAutomaticPunctuation: false,
        ...(phrases.length > 0 && {
          speechContexts: [{ phrases, boost: 20 }],
        }),
      },
      audio: { content: base64Audio },
    }),
  });

  const json = await res.json();

  if (json.error) {
    console.error('STT API error:', JSON.stringify(json.error));
    return '';
  }

  // Pick the alternative that scores highest against the expected text.
  // With maxAlternatives: 3, we get up to 3 guesses and take the best match.
  const alternatives = json.results?.[0]?.alternatives || [];
  if (alternatives.length === 0) return '';

  if (!hintText) return alternatives[0].transcript || '';

  let best = '';
  let bestScore = -1;
  for (const alt of alternatives) {
    const t = alt.transcript || '';
    const s = scoreMatch(t, hintText);
    if (s > bestScore) { bestScore = s; best = t; }
  }
  return best;
}

// Internal raw score used to pick the best alternative (not clamped to 100).
function scoreMatch(transcribed, expected) {
  const clean = s => normaliseNumbers(
    s.replace(/[，。！？、；：""''（）【】《》…—~·\s]/g, '')
  );
  const e = [...clean(expected)];
  const r = [...clean(transcribed)];
  let m = 0;
  for (const ch of e) {
    const i = r.indexOf(ch);
    if (i !== -1) { m++; r.splice(i, 1); }
  }

  // Pinyin fallback: if character match is low, compare tone-free pinyin instead
  if (e.length > 0 && m / e.length < 0.5) {
    const ep = [...convertToPinyinString(expected)];
    const tp = [...convertToPinyinString(transcribed)];
    let pm = 0;
    const remaining = [...tp];
    for (const ch of ep) {
      const i = remaining.indexOf(ch);
      if (i !== -1) { pm++; remaining.splice(i, 1); }
    }
    if (pm > m) return pm;
  }

  return m;
}

// ── Accuracy ─────────────────────────────────────────────────────────────
// Returns 0–100. Normalises Chinese numbers to Arabic before comparing so
// "6月" scores the same as "六月". Short words (≤2 chars) get a gentler
// floor: any single correct character gives at least 60%.
export function calculateAccuracy(transcribed, expected) {
  const clean = s => normaliseNumbers(
    s.replace(/[，。！？、；：""''（）【】《》…—~·\s]/g, '')
  );
  const e = [...clean(expected)];
  const remaining = [...clean(transcribed)];

  if (e.length === 0) return 100;

  let matches = 0;
  for (const char of e) {
    const idx = remaining.indexOf(char);
    if (idx !== -1) { matches++; remaining.splice(idx, 1); }
  }

  const raw = Math.round((matches / e.length) * 100);

  // Pinyin fallback: if character match is low, compare tone-free pinyin
  if (raw < 50) {
    const expectedPinyinStr = convertToPinyinString(expected);
    const transcribedPinyinStr = convertToPinyinString(transcribed);

    if (expectedPinyinStr && transcribedPinyinStr) {
      const ep = [...expectedPinyinStr];
      const remaining = [...transcribedPinyinStr];
      let pinyinMatches = 0;
      for (const ch of ep) {
        const idx = remaining.indexOf(ch);
        if (idx !== -1) { pinyinMatches++; remaining.splice(idx, 1); }
      }
      const pinyinRaw = Math.round((pinyinMatches / ep.length) * 100);

      if (pinyinRaw > raw) {
        if (e.length <= 2 && pinyinMatches >= 1) return Math.max(pinyinRaw, 60);
        return pinyinRaw;
      }
    }
  }

  // For very short words (1–2 chars) a single match is a good sign —
  // lift the floor to 60% so one correct character doesn't show as 50%.
  if (e.length <= 2 && matches >= 1) return Math.max(raw, 60);

  return raw;
}

