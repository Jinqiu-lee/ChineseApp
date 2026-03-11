// ─────────────────────────────────────────────────────────────────────────────
// Pinyin local audio map
//
// HOW TO ADD YOUR RECORDINGS:
//   1. Put your MP3 file in:  assets/audio/pinyin/
//   2. Uncomment the matching line below
//   3. Save — the app will instantly use your recording instead of TTS
//
// FILE NAMING:
//   Initials → init_<initial>.mp3   e.g. init_b.mp3, init_zh.mp3
//   Finals   → fin_<final>.mp3      e.g. fin_a.mp3, fin_ao.mp3, fin_v.mp3 (ü)
//
// Record each sound in isolation, the way it's taught:
//   b → "bō"  p → "pō"  m → "mō"  (not the English letter name)
//   a → "ā"   ao → "áo"  ing → "īng"
// ─────────────────────────────────────────────────────────────────────────────

export const PINYIN_AUDIO = {

  // ── INITIALS (声母) ─────────────────────────────────────────────────────
  // Labials
  // 'init_b':  require('../assets/audio/pinyin/init_b.mp3'),
  // 'init_p':  require('../assets/audio/pinyin/init_p.mp3'),
  // 'init_m':  require('../assets/audio/pinyin/init_m.mp3'),
  // 'init_f':  require('../assets/audio/pinyin/init_f.mp3'),

  // Alveolars
  // 'init_d':  require('../assets/audio/pinyin/init_d.mp3'),
  // 'init_t':  require('../assets/audio/pinyin/init_t.mp3'),
  // 'init_n':  require('../assets/audio/pinyin/init_n.mp3'),
  // 'init_l':  require('../assets/audio/pinyin/init_l.mp3'),

  // Velars
  // 'init_g':  require('../assets/audio/pinyin/init_g.mp3'),
  // 'init_k':  require('../assets/audio/pinyin/init_k.mp3'),
  // 'init_h':  require('../assets/audio/pinyin/init_h.mp3'),

  // Palatals
  // 'init_j':  require('../assets/audio/pinyin/init_j.mp3'),
  // 'init_q':  require('../assets/audio/pinyin/init_q.mp3'),
  // 'init_x':  require('../assets/audio/pinyin/init_x.mp3'),

  // Retroflexes
  // 'init_zh': require('../assets/audio/pinyin/init_zh.mp3'),
  // 'init_ch': require('../assets/audio/pinyin/init_ch.mp3'),
  // 'init_sh': require('../assets/audio/pinyin/init_sh.mp3'),
  // 'init_r':  require('../assets/audio/pinyin/init_r.mp3'),

  // Sibilants
  // 'init_z':  require('../assets/audio/pinyin/init_z.mp3'),
  // 'init_c':  require('../assets/audio/pinyin/init_c.mp3'),
  // 'init_s':  require('../assets/audio/pinyin/init_s.mp3'),

  // Semi-vowels
  // 'init_y':  require('../assets/audio/pinyin/init_y.mp3'),
  // 'init_w':  require('../assets/audio/pinyin/init_w.mp3'),


  // ── FINALS (韵母) ────────────────────────────────────────────────────────
  // Simple vowels
  // 'fin_a':   require('../assets/audio/pinyin/fin_a.mp3'),
  // 'fin_o':   require('../assets/audio/pinyin/fin_o.mp3'),
  // 'fin_e':   require('../assets/audio/pinyin/fin_e.mp3'),
  // 'fin_i':   require('../assets/audio/pinyin/fin_i.mp3'),
  // 'fin_u':   require('../assets/audio/pinyin/fin_u.mp3'),
  // 'fin_v':   require('../assets/audio/pinyin/fin_v.mp3'),   // ü sound

  // Compound
  // 'fin_ai':  require('../assets/audio/pinyin/fin_ai.mp3'),
  // 'fin_ei':  require('../assets/audio/pinyin/fin_ei.mp3'),
  // 'fin_ui':  require('../assets/audio/pinyin/fin_ui.mp3'),
  // 'fin_ao':  require('../assets/audio/pinyin/fin_ao.mp3'),
  // 'fin_ou':  require('../assets/audio/pinyin/fin_ou.mp3'),
  // 'fin_iu':  require('../assets/audio/pinyin/fin_iu.mp3'),
  // 'fin_ie':  require('../assets/audio/pinyin/fin_ie.mp3'),
  // 'fin_ve':  require('../assets/audio/pinyin/fin_ve.mp3'),  // üe sound
  // 'fin_er':  require('../assets/audio/pinyin/fin_er.mp3'),

  // Nasal -n
  // 'fin_an':  require('../assets/audio/pinyin/fin_an.mp3'),
  // 'fin_en':  require('../assets/audio/pinyin/fin_en.mp3'),
  // 'fin_in':  require('../assets/audio/pinyin/fin_in.mp3'),
  // 'fin_un':  require('../assets/audio/pinyin/fin_un.mp3'),
  // 'fin_vn':  require('../assets/audio/pinyin/fin_vn.mp3'),  // ün sound

  // Nasal -ng
  // 'fin_ang': require('../assets/audio/pinyin/fin_ang.mp3'),
  // 'fin_eng': require('../assets/audio/pinyin/fin_eng.mp3'),
  // 'fin_ing': require('../assets/audio/pinyin/fin_ing.mp3'),
  // 'fin_ong': require('../assets/audio/pinyin/fin_ong.mp3'),
};
