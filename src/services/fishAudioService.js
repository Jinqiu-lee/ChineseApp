// FISH AUDIO — disabled for now, reserved for post-launch
// To re-enable: wire speakWithFishAudio into ttsService.js

import { Audio } from 'expo-av';
import AVATAR_VOICES from '../config/avatarVoices';

// Normalize avatar key variations to match AVATAR_VOICES keys
const normalizeKey = (key) => {
  if (!key) return null;
  const map = {
    'li_bai': 'libai',
    'lu_xun': 'luxun',
    'zhang_ailing': 'eileen',
    'su_shi': 'sushi',
    'yang_jiang': 'yangjiang',
    'simone_de_beauvoir': 'beauvoir',
    'virginia_woolf': 'woolf',
    'jane_austen': 'jane',
    'liu_cixin': 'liucixin',
  };
  return map[key] || key;
};

let currentSound = null;

export const speakWithFishAudio = async (text, avatarKey) => {
  try {
    const normalizedKey = normalizeKey(avatarKey);
    const avatar = AVATAR_VOICES[normalizedKey];

    if (!avatar) {
      console.warn(`[FishAudio] No voice config found for: ${avatarKey} (normalized: ${normalizedKey})`);
      return false; // signal to fall back to original TTS
    }

    if (avatar.engine === 'original') {
      console.log(`[FishAudio] ${avatarKey} uses original TTS — skipping Fish Audio`);
      return false; // signal to fall back to original TTS
    }

    console.log(`[FishAudio] Speaking as ${avatarKey} | referenceId: ${avatar.referenceId}`);

    const response = await fetch('https://api.fish.audio/v1/tts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_FISH_AUDIO_API_KEY}`,
        'Content-Type': 'application/json',
        'model': 's2-pro',
      },
      body: JSON.stringify({
        text: text,
        reference_id: avatar.referenceId,
        format: 'mp3',
        normalize: true,
        latency: 'normal',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[FishAudio] API error ${response.status}:`, errorText);
      return false;
    }

    // Get audio as base64
    const arrayBuffer = await response.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte), ''
      )
    );
    const uri = `data:audio/mp3;base64,${base64}`;

    // Unload previous sound
    if (currentSound) {
      await currentSound.unloadAsync();
      currentSound = null;
    }

    // Play new sound
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true }
    );
    currentSound = sound;

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
        currentSound = null;
      }
    });

    return true; // signal that Fish Audio handled it

  } catch (error) {
    console.error('[FishAudio] Error:', error);
    return false; // signal to fall back to original TTS
  }
};

// DEV TEST FUNCTION — call this from a test button
export const testFishAudioVoices = async () => {
  console.log('[FishAudio] Starting voice test...');

  await speakWithFishAudio('床前明月光，疑是地上霜。', 'libai');
  await new Promise(resolve => setTimeout(resolve, 4000));

  await speakWithFishAudio('我还没有还书给他。', 'camus');
  await new Promise(resolve => setTimeout(resolve, 4000));

  await speakWithFishAudio('我们仨，走在人生边上。', 'yangjiang');
  await new Promise(resolve => setTimeout(resolve, 4000));

  console.log('[FishAudio] Voice test complete.');
};
