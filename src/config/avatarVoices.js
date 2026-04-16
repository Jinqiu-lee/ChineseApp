// FISH AUDIO — disabled for now, reserved for post-launch
// To re-enable: wire speakWithFishAudio into ttsService.js

const AVATAR_VOICES = {

  // === FISH AUDIO — Chinese avatars (native Mandarin) ===
  libai:     { engine: 'fish', referenceId: 'db7e3bf0eddf45488dfee820b3a4f3ce' },  // 李白
  eileen:    { engine: 'fish', referenceId: '00e50f51f9154834aba8397fa04495e2' },  // 张爱玲
  sushi:     { engine: 'fish', referenceId: '55d76b087bd84a05b03071dfc5998985' },  // 苏轼
  yangjiang: { engine: 'google', voiceId: 'cmn-CN-Wavenet-A', pitch: -20, rate: 0.75 },  // elderly, wise grandmother

  // === FISH AUDIO — Foreign avatars (staying on Fish Audio) ===
  jane:      { engine: 'fish', referenceId: '4f92780a8d704799804914e3d2808f53' },  // 简·奥斯汀
  woolf:     { engine: 'fish', referenceId: '78ae47f5ac504d23b03d7f9edde7718b' },  // 伍尔夫

  // === GOOGLE TTS — switched for correct Chinese pronunciation ===
  luxun:     { engine: 'google', voiceId: 'cmn-CN-Wavenet-B', pitch: -5,  rate: 0.80 },  // deep male
  dante:     { engine: 'google', voiceId: 'cmn-CN-Wavenet-C', pitch: -8,  rate: 0.76 },  // authoritative male
  camus:     { engine: 'google', voiceId: 'cmn-CN-Wavenet-D', pitch: -2,  rate: 0.87 },  // calm male
  sartre:    { engine: 'google', voiceId: 'cmn-CN-Wavenet-B', pitch: -3,  rate: 0.80 },  // deliberate male
  elena:     { engine: 'google', voiceId: 'cmn-CN-Wavenet-A', pitch: -3,  rate: 0.75 },  // intimate female
  beauvoir:  { engine: 'google', voiceId: 'cmn-CN-Wavenet-E', pitch: -4,  rate: 0.82 },  // strong female

  // === ORIGINAL TTS — keep existing behavior, do not change ===
  liucixin:  { engine: 'original', referenceId: null },  // 刘慈欣

};

export default AVATAR_VOICES;
