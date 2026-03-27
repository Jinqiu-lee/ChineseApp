import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { GOOGLE_API_KEY } from '../config/googleApiKey';

const STT_URL = `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_API_KEY}`;

// Platform-specific recording options for Google STT compatibility
// iOS  → LINEAR16 PCM (.caf) → STT encoding: LINEAR16
// Android → AMR-WB (.amr)    → STT encoding: AMR_WB
const RECORDING_OPTIONS = {
  isMeteringEnabled: false,
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

export async function stopAndTranscribe(recording) {
  await recording.stopAndUnloadAsync();
  await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

  const uri = recording.getURI();
  if (!uri) throw new Error('No recording URI');

  const base64Audio = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });

  const res = await fetch(STT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      config: {
        ...STT_CONFIG,
        languageCode: 'zh-CN',
        maxAlternatives: 1,
      },
      audio: { content: base64Audio },
    }),
  });

  const json = await res.json();

  if (json.error) {
    console.error('STT API error:', JSON.stringify(json.error));
    return '';
  }

  const transcript = json.results?.[0]?.alternatives?.[0]?.transcript || '';
  return transcript;
}

// ── Accuracy ─────────────────────────────────────────────────────────────
// Returns 0–100: percentage of expected characters found in transcription
export function calculateAccuracy(transcribed, expected) {
  const clean = s => s.replace(/[，。！？、；：""''（）【】《》…—~·\s]/g, '');
  const e = [...clean(expected)];
  const remaining = [...clean(transcribed)];

  if (e.length === 0) return 100;

  let matches = 0;
  for (const char of e) {
    const idx = remaining.indexOf(char);
    if (idx !== -1) {
      matches++;
      remaining.splice(idx, 1);
    }
  }

  return Math.round((matches / e.length) * 100);
}

