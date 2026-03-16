// ─────────────────────────────────────────────────────────────────────────────
// Pinyin local audio map
//
// Folder structure:
//   assets/audio/pinyin/initials/   init_b.mp3, init_zh.mp3 ...
//   assets/audio/pinyin/finals/     fin_a.mp3,  fin_ao.mp3  ...
//   assets/audio/pinyin/tones/      ma1.mp3,    gongzuo4.mp3 ...
//
// To activate a recording: uncomment its line and save.
// TTS is used automatically for any entry that is still commented out.
// ─────────────────────────────────────────────────────────────────────────────

export const PINYIN_AUDIO = {

  // ── INITIALS (声母) ─────────────────────────────────────────────────────
  'init_b':  require('../assets/audio/pinyin/initials/init_b.mp3'),
  'init_p':  require('../assets/audio/pinyin/initials/init_p.mp3'),
  'init_m':  require('../assets/audio/pinyin/initials/init_m.mp3'),
  'init_f':  require('../assets/audio/pinyin/initials/init_f.mp3'),
  'init_d':  require('../assets/audio/pinyin/initials/init_d.mp3'),
  'init_t':  require('../assets/audio/pinyin/initials/init_t.mp3'),
  'init_n':  require('../assets/audio/pinyin/initials/init_n.mp3'),
  'init_l':  require('../assets/audio/pinyin/initials/init_l.mp3'),
  'init_g':  require('../assets/audio/pinyin/initials/init_g.mp3'),
  'init_k':  require('../assets/audio/pinyin/initials/init_k.mp3'),
  'init_h':  require('../assets/audio/pinyin/initials/init_h.mp3'),
  'init_j':  require('../assets/audio/pinyin/initials/init_j.mp3'),
  'init_q':  require('../assets/audio/pinyin/initials/init_q.mp3'),
  'init_x':  require('../assets/audio/pinyin/initials/init_x.mp3'),
  'init_zh': require('../assets/audio/pinyin/initials/init_zh.mp3'),
  'init_ch': require('../assets/audio/pinyin/initials/init_ch.mp3'),
  'init_sh': require('../assets/audio/pinyin/initials/init_sh.mp3'),
  'init_r':  require('../assets/audio/pinyin/initials/init_r.mp3'),
  'init_z':  require('../assets/audio/pinyin/initials/init_z.mp3'),
  'init_c':  require('../assets/audio/pinyin/initials/init_c.mp3'),
  'init_s':  require('../assets/audio/pinyin/initials/init_s.mp3'),
  'init_y':  require('../assets/audio/pinyin/initials/init_y.mp3'),
  'init_w':  require('../assets/audio/pinyin/initials/init_w.mp3'),

  // ── FINALS (韵母) ────────────────────────────────────────────────────────
  'fin_a':   require('../assets/audio/pinyin/finals/fin_a.mp3'),
  'fin_o':   require('../assets/audio/pinyin/finals/fin_o.mp3'),
  'fin_e':   require('../assets/audio/pinyin/finals/fin_e.mp3'),
  'fin_i':   require('../assets/audio/pinyin/finals/fin_i.mp3'),
  'fin_u':   require('../assets/audio/pinyin/finals/fin_u.mp3'),
  'fin_v':   require('../assets/audio/pinyin/finals/fin_v.mp3'),
  'fin_ai':  require('../assets/audio/pinyin/finals/fin_ai.mp3'),
  'fin_ei':  require('../assets/audio/pinyin/finals/fin_ei.mp3'),
  'fin_ui':  require('../assets/audio/pinyin/finals/fin_ui.mp3'),
  'fin_ao':  require('../assets/audio/pinyin/finals/fin_ao.mp3'),
  'fin_ou':  require('../assets/audio/pinyin/finals/fin_ou.mp3'),
  'fin_iu':  require('../assets/audio/pinyin/finals/fin_iu.mp3'),
  'fin_ie':  require('../assets/audio/pinyin/finals/fin_ie.mp3'),
  'fin_ve':  require('../assets/audio/pinyin/finals/fin_ve.mp3'),
  'fin_er':  require('../assets/audio/pinyin/finals/fin_er.mp3'),
  'fin_an':  require('../assets/audio/pinyin/finals/fin_an.mp3'),
  'fin_en':  require('../assets/audio/pinyin/finals/fin_en.mp3'),
  'fin_in':  require('../assets/audio/pinyin/finals/fin_in.mp3'),
  'fin_un':  require('../assets/audio/pinyin/finals/fin_un.mp3'),
  'fin_vn':  require('../assets/audio/pinyin/finals/fin_vn.mp3'),
  'fin_ang': require('../assets/audio/pinyin/finals/fin_ang.mp3'),
  'fin_eng': require('../assets/audio/pinyin/finals/fin_eng.mp3'),
  'fin_ing': require('../assets/audio/pinyin/finals/fin_ing.mp3'),
  'fin_ong': require('../assets/audio/pinyin/finals/fin_ong.mp3'),

  // ── VOWEL TONES — pure vowels, 4 tones each ─────────────────────────────
  // Folder: assets/audio/pinyin/vowel_tones/
  // Uncomment each line after you drop the corresponding .mp3 file in.
  'a1': require('../assets/audio/pinyin/vowel_tones/a1.mp3'),
  'a2': require('../assets/audio/pinyin/vowel_tones/a2.mp3'),
  'a3': require('../assets/audio/pinyin/vowel_tones/a3.mp3'),
  'a4': require('../assets/audio/pinyin/vowel_tones/a4.mp3'),
  'o1': require('../assets/audio/pinyin/vowel_tones/o1.mp3'),
  'o2': require('../assets/audio/pinyin/vowel_tones/o2.mp3'),
  'o3': require('../assets/audio/pinyin/vowel_tones/o3.mp3'),
  'o4': require('../assets/audio/pinyin/vowel_tones/o4.mp3'),
  'e1': require('../assets/audio/pinyin/vowel_tones/e1.mp3'),
  'e2': require('../assets/audio/pinyin/vowel_tones/e2.mp3'),
  'e3': require('../assets/audio/pinyin/vowel_tones/e3.mp3'),
  'e4': require('../assets/audio/pinyin/vowel_tones/e4.mp3'),
  'i1': require('../assets/audio/pinyin/vowel_tones/i1.mp3'),
  'i2': require('../assets/audio/pinyin/vowel_tones/i2.mp3'),
  'i3': require('../assets/audio/pinyin/vowel_tones/i3.mp3'),
  'i4': require('../assets/audio/pinyin/vowel_tones/i4.mp3'),
  'u1': require('../assets/audio/pinyin/vowel_tones/u1.mp3'),
  'u2': require('../assets/audio/pinyin/vowel_tones/u2.mp3'),
  'u3': require('../assets/audio/pinyin/vowel_tones/u3.mp3'),
  'u4': require('../assets/audio/pinyin/vowel_tones/u4.mp3'),
  'v1': require('../assets/audio/pinyin/vowel_tones/v1.mp3'),  // ü tone 1 (ǖ)  — standalone vowel
  'v2': require('../assets/audio/pinyin/vowel_tones/v2.mp3'),  // ü tone 2 (ǘ)
  'v3': require('../assets/audio/pinyin/vowel_tones/v3.mp3'),  // ü tone 3 (ǚ)
  'v4': require('../assets/audio/pinyin/vowel_tones/v4.mp3'),  // ü tone 4 (ǜ)

  // ── COMPOUND FINAL TONES — used in lesson tone popup (tap final → hear tones)
  // Folder: assets/audio/pinyin/vowel_tones/
  // See RECORD_COMPOUND_FINALS.txt for what to say for each file.

  // Lesson 2 — ai ei ui ao ou iu (24 files)
  'ai1': require('../assets/audio/pinyin/vowel_tones/ai1.mp3'),  // āi  tone 1
  'ai2': require('../assets/audio/pinyin/vowel_tones/ai2.mp3'),  // ái  tone 2
  'ai3': require('../assets/audio/pinyin/vowel_tones/ai3.mp3'),  // ǎi  tone 3
  'ai4': require('../assets/audio/pinyin/vowel_tones/ai4.mp3'),  // ài  tone 4
  'ei1': require('../assets/audio/pinyin/vowel_tones/ei1.mp3'),  // ēi  tone 1
  'ei2': require('../assets/audio/pinyin/vowel_tones/ei2.mp3'),  // éi  tone 2
  'ei3': require('../assets/audio/pinyin/vowel_tones/ei3.mp3'),  // ěi  tone 3
  'ei4': require('../assets/audio/pinyin/vowel_tones/ei4.mp3'),  // èi  tone 4
  'ui1': require('../assets/audio/pinyin/vowel_tones/ui1.mp3'),  // uī  tone 1
  'ui2': require('../assets/audio/pinyin/vowel_tones/ui2.mp3'),  // uí  tone 2
  'ui3': require('../assets/audio/pinyin/vowel_tones/ui3.mp3'),  // uǐ  tone 3
  'ui4': require('../assets/audio/pinyin/vowel_tones/ui4.mp3'),  // uì  tone 4
  'ao1': require('../assets/audio/pinyin/vowel_tones/ao1.mp3'),  // āo  tone 1
  'ao2': require('../assets/audio/pinyin/vowel_tones/ao2.mp3'),  // áo  tone 2
  'ao3': require('../assets/audio/pinyin/vowel_tones/ao3.mp3'),  // ǎo  tone 3
  'ao4': require('../assets/audio/pinyin/vowel_tones/ao4.mp3'),  // ào  tone 4
  'ou1': require('../assets/audio/pinyin/vowel_tones/ou1.mp3'),  // ōu  tone 1
  'ou2': require('../assets/audio/pinyin/vowel_tones/ou2.mp3'),  // óu  tone 2
  'ou3': require('../assets/audio/pinyin/vowel_tones/ou3.mp3'),  // ǒu  tone 3
  'ou4': require('../assets/audio/pinyin/vowel_tones/ou4.mp3'),  // òu  tone 4
  'iu1': require('../assets/audio/pinyin/vowel_tones/iu1.mp3'),  // iū  tone 1
  'iu2': require('../assets/audio/pinyin/vowel_tones/iu2.mp3'),  // iú  tone 2
  'iu3': require('../assets/audio/pinyin/vowel_tones/iu3.mp3'),  // iǔ  tone 3
  'iu4': require('../assets/audio/pinyin/vowel_tones/iu4.mp3'),  // iù  tone 4

  // Lesson 3 — ie üe er (12 files)
  'ie1': require('../assets/audio/pinyin/vowel_tones/ie1.mp3'),  // iē  tone 1
  'ie2': require('../assets/audio/pinyin/vowel_tones/ie2.mp3'),  // ié  tone 2
  'ie3': require('../assets/audio/pinyin/vowel_tones/ie3.mp3'),  // iě  tone 3
  'ie4': require('../assets/audio/pinyin/vowel_tones/ie4.mp3'),  // iè  tone 4
  've1': require('../assets/audio/pinyin/vowel_tones/ve1.mp3'),  // üē  tone 1 (üe)
  've2': require('../assets/audio/pinyin/vowel_tones/ve2.mp3'),  // üé  tone 2
  've3': require('../assets/audio/pinyin/vowel_tones/ve3.mp3'),  // üě  tone 3
  've4': require('../assets/audio/pinyin/vowel_tones/ve4.mp3'),  // üè  tone 4
  'er1': require('../assets/audio/pinyin/vowel_tones/er1.mp3'),  // ēr  tone 1
  // 'er2': require('../assets/audio/pinyin/vowel_tones/er2.mp3'),  // ér  tone 2  ← duplicate: tones/er2.mp3 used instead
  'er3': require('../assets/audio/pinyin/vowel_tones/er3.mp3'),  // ěr  tone 3
  // 'er4': require('../assets/audio/pinyin/vowel_tones/er4.mp3'),  // èr  tone 4  ← duplicate: tones/er4.mp3 used instead

  // Lesson 4 — an en in un ün (20 files)  note: un1-un4 serve both un and ün
  'an1': require('../assets/audio/pinyin/vowel_tones/an1.mp3'),  // ān  tone 1
  'an2': require('../assets/audio/pinyin/vowel_tones/an2.mp3'),  // án  tone 2
  'an3': require('../assets/audio/pinyin/vowel_tones/an3.mp3'),  // ǎn  tone 3
  'an4': require('../assets/audio/pinyin/vowel_tones/an4.mp3'),  // àn  tone 4
  'en1': require('../assets/audio/pinyin/vowel_tones/en1.mp3'),  // ēn  tone 1
  'en2': require('../assets/audio/pinyin/vowel_tones/en2.mp3'),  // én  tone 2
  'en3': require('../assets/audio/pinyin/vowel_tones/en3.mp3'),  // ěn  tone 3
  'en4': require('../assets/audio/pinyin/vowel_tones/en4.mp3'),  // èn  tone 4
  'in1': require('../assets/audio/pinyin/vowel_tones/in1.mp3'),  // īn  tone 1
  'in2': require('../assets/audio/pinyin/vowel_tones/in2.mp3'),  // ín  tone 2
  'in3': require('../assets/audio/pinyin/vowel_tones/in3.mp3'),  // ǐn  tone 3
  'in4': require('../assets/audio/pinyin/vowel_tones/in4.mp3'),  // ìn  tone 4
  'un1': require('../assets/audio/pinyin/vowel_tones/un1.mp3'),  // ūn  tone 1  (also serves ün)
  'un2': require('../assets/audio/pinyin/vowel_tones/un2.mp3'),  // ún  tone 2
  'un3': require('../assets/audio/pinyin/vowel_tones/un3.mp3'),  // ǔn  tone 3
  'un4': require('../assets/audio/pinyin/vowel_tones/un4.mp3'),  // ùn  tone 4
  'vn1': require('../assets/audio/pinyin/vowel_tones/vn1.mp3'),  // ǖn  tone 1 (ün separate recording)
  'vn2': require('../assets/audio/pinyin/vowel_tones/vn2.mp3'),  // ǘn  tone 2
  'vn3': require('../assets/audio/pinyin/vowel_tones/vn3.mp3'),  // ǚn  tone 3
  'vn4': require('../assets/audio/pinyin/vowel_tones/vn4.mp3'),  // ǜn  tone 4

  // Lesson 5 — ang eng ing ong (16 files)
  'ang1': require('../assets/audio/pinyin/vowel_tones/ang1.mp3'),  // āng  tone 1
  'ang2': require('../assets/audio/pinyin/vowel_tones/ang2.mp3'),  // áng  tone 2
  'ang3': require('../assets/audio/pinyin/vowel_tones/ang3.mp3'),  // ǎng  tone 3
  'ang4': require('../assets/audio/pinyin/vowel_tones/ang4.mp3'),  // àng  tone 4
  'eng1': require('../assets/audio/pinyin/vowel_tones/eng1.mp3'),  // ēng  tone 1
  'eng2': require('../assets/audio/pinyin/vowel_tones/eng2.mp3'),  // éng  tone 2
  'eng3': require('../assets/audio/pinyin/vowel_tones/eng3.mp3'),  // ěng  tone 3
  'eng4': require('../assets/audio/pinyin/vowel_tones/eng4.mp3'),  // èng  tone 4
  'ing1': require('../assets/audio/pinyin/vowel_tones/ing1.mp3'),  // īng  tone 1
  'ing2': require('../assets/audio/pinyin/vowel_tones/ing2.mp3'),  // íng  tone 2
  'ing3': require('../assets/audio/pinyin/vowel_tones/ing3.mp3'),  // ǐng  tone 3
  'ing4': require('../assets/audio/pinyin/vowel_tones/ing4.mp3'),  // ìng  tone 4
  'ong1': require('../assets/audio/pinyin/vowel_tones/ong1.mp3'),  // ōng  tone 1
  'ong2': require('../assets/audio/pinyin/vowel_tones/ong2.mp3'),  // óng  tone 2
  'ong3': require('../assets/audio/pinyin/vowel_tones/ong3.mp3'),  // ǒng  tone 3
  'ong4': require('../assets/audio/pinyin/vowel_tones/ong4.mp3'),  // òng  tone 4

  // Lesson 6 — ia iao ian iang ua uai uo uan uang üan (40 files)
  // 'ia1':   require('../assets/audio/pinyin/vowel_tones/ia1.mp3'),    // iā  tone 1
  // 'ia2':   require('../assets/audio/pinyin/vowel_tones/ia2.mp3'),    // iá  tone 2
  // 'ia3':   require('../assets/audio/pinyin/vowel_tones/ia3.mp3'),    // iǎ  tone 3
  // 'ia4':   require('../assets/audio/pinyin/vowel_tones/ia4.mp3'),    // ià  tone 4
  // 'iao1':  require('../assets/audio/pinyin/vowel_tones/iao1.mp3'),   // iāo tone 1
  // 'iao2':  require('../assets/audio/pinyin/vowel_tones/iao2.mp3'),   // iáo tone 2
  // 'iao3':  require('../assets/audio/pinyin/vowel_tones/iao3.mp3'),   // iǎo tone 3
  // 'iao4':  require('../assets/audio/pinyin/vowel_tones/iao4.mp3'),   // iào tone 4
  // 'ian1':  require('../assets/audio/pinyin/vowel_tones/ian1.mp3'),   // iān tone 1
  // 'ian2':  require('../assets/audio/pinyin/vowel_tones/ian2.mp3'),   // ián tone 2
  // 'ian3':  require('../assets/audio/pinyin/vowel_tones/ian3.mp3'),   // iǎn tone 3
  // 'ian4':  require('../assets/audio/pinyin/vowel_tones/ian4.mp3'),   // iàn tone 4
  // 'iang1': require('../assets/audio/pinyin/vowel_tones/iang1.mp3'),  // iāng tone 1
  // 'iang2': require('../assets/audio/pinyin/vowel_tones/iang2.mp3'),  // iáng tone 2
  // 'iang3': require('../assets/audio/pinyin/vowel_tones/iang3.mp3'),  // iǎng tone 3
  // 'iang4': require('../assets/audio/pinyin/vowel_tones/iang4.mp3'),  // iàng tone 4
  // 'ua1':   require('../assets/audio/pinyin/vowel_tones/ua1.mp3'),    // uā  tone 1
  // 'ua2':   require('../assets/audio/pinyin/vowel_tones/ua2.mp3'),    // uá  tone 2
  // 'ua3':   require('../assets/audio/pinyin/vowel_tones/ua3.mp3'),    // uǎ  tone 3
  // 'ua4':   require('../assets/audio/pinyin/vowel_tones/ua4.mp3'),    // uà  tone 4
  // 'uai1':  require('../assets/audio/pinyin/vowel_tones/uai1.mp3'),   // uāi tone 1
  // 'uai2':  require('../assets/audio/pinyin/vowel_tones/uai2.mp3'),   // uái tone 2
  // 'uai3':  require('../assets/audio/pinyin/vowel_tones/uai3.mp3'),   // uǎi tone 3
  // 'uai4':  require('../assets/audio/pinyin/vowel_tones/uai4.mp3'),   // uài tone 4
  // 'uo1':   require('../assets/audio/pinyin/vowel_tones/uo1.mp3'),    // uō  tone 1
  // 'uo2':   require('../assets/audio/pinyin/vowel_tones/uo2.mp3'),    // uó  tone 2
  // 'uo3':   require('../assets/audio/pinyin/vowel_tones/uo3.mp3'),    // uǒ  tone 3
  // 'uo4':   require('../assets/audio/pinyin/vowel_tones/uo4.mp3'),    // uò  tone 4
  // 'uan1':  require('../assets/audio/pinyin/vowel_tones/uan1.mp3'),   // uān tone 1
  // 'uan2':  require('../assets/audio/pinyin/vowel_tones/uan2.mp3'),   // uán tone 2
  // 'uan3':  require('../assets/audio/pinyin/vowel_tones/uan3.mp3'),   // uǎn tone 3
  // 'uan4':  require('../assets/audio/pinyin/vowel_tones/uan4.mp3'),   // uàn tone 4
  // 'uang1': require('../assets/audio/pinyin/vowel_tones/uang1.mp3'),  // uāng tone 1
  // 'uang2': require('../assets/audio/pinyin/vowel_tones/uang2.mp3'),  // uáng tone 2
  // 'uang3': require('../assets/audio/pinyin/vowel_tones/uang3.mp3'),  // uǎng tone 3
  // 'uang4': require('../assets/audio/pinyin/vowel_tones/uang4.mp3'),  // uàng tone 4
  // 'van1':  require('../assets/audio/pinyin/vowel_tones/van1.mp3'),   // üān tone 1 (üan)
  // 'van2':  require('../assets/audio/pinyin/vowel_tones/van2.mp3'),   // üán tone 2
  // 'van3':  require('../assets/audio/pinyin/vowel_tones/van3.mp3'),   // üǎn tone 3
  // 'van4':  require('../assets/audio/pinyin/vowel_tones/van4.mp3'),   // üàn tone 4

  // ── TONE PRACTICE — lesson syllables ────────────────────────────────────
  'ba4_ba0':     require('../assets/audio/pinyin/tones/ba4_ba0.mp3'),
  'cai4':        require('../assets/audio/pinyin/tones/cai4.mp3'),
  'cha2':        require('../assets/audio/pinyin/tones/cha2.mp3'),
  'chi1':        require('../assets/audio/pinyin/tones/chi1.mp3'),
  'chuzuche1':   require('../assets/audio/pinyin/tones/chuzuche1.mp3'),
  'di4_di0':     require('../assets/audio/pinyin/tones/di4_di0.mp3'),
  'diannao3':    require('../assets/audio/pinyin/tones/diannao3.mp3'),
  'ditie3':      require('../assets/audio/pinyin/tones/ditie3.mp3'),
  'dou1':        require('../assets/audio/pinyin/tones/dou1.mp3'),
  'er4':         require('../assets/audio/pinyin/tones/er4.mp3'),
  'erzi2':       require('../assets/audio/pinyin/tones/erzi2.mp3'),
  'fanguan3':    require('../assets/audio/pinyin/tones/fanguan3.mp3'),
  'feiji1':      require('../assets/audio/pinyin/tones/feiji1.mp3'),
  'fenzhong1':   require('../assets/audio/pinyin/tones/fenzhong1.mp3'),
  'gaoxing4':    require('../assets/audio/pinyin/tones/gaoxing4.mp3'),
  'ge1_ge0':     require('../assets/audio/pinyin/tones/ge1_ge0.mp3'),
  'gongzuo4':    require('../assets/audio/pinyin/tones/gongzuo4.mp3'),
  'gui4':        require('../assets/audio/pinyin/tones/gui4.mp3'),
  'hanyu3':      require('../assets/audio/pinyin/tones/hanyu3.mp3'),
  'he1':         require('../assets/audio/pinyin/tones/he1.mp3'),
  'hui2':        require('../assets/audio/pinyin/tones/hui2.mp3'),
  'jichang3':    require('../assets/audio/pinyin/tones/jichang3.mp3'),
  'jie3_jie0':   require('../assets/audio/pinyin/tones/jie3_jie0.mp3'),
  'kan4':        require('../assets/audio/pinyin/tones/kan4.mp3'),
  'kuai4':       require('../assets/audio/pinyin/tones/kuai4.mp3'),
  'lai2':        require('../assets/audio/pinyin/tones/lai2.mp3'),
  'leng3':       require('../assets/audio/pinyin/tones/leng3.mp3'),
  'ma1':         require('../assets/audio/pinyin/tones/ma1.mp3'),
  'ma1_ma0':     require('../assets/audio/pinyin/tones/ma1_ma0.mp3'),
  'ma2':         require('../assets/audio/pinyin/tones/ma2.mp3'),
  'ma3':         require('../assets/audio/pinyin/tones/ma3.mp3'),
  'ma4':         require('../assets/audio/pinyin/tones/ma4.mp3'),
  'mai3':        require('../assets/audio/pinyin/tones/mai3.mp3'),
  'mei4_mei0':   require('../assets/audio/pinyin/tones/mei4_mei0.mp3'),
  'nar3':        require('../assets/audio/pinyin/tones/nar3.mp3'),
  'nar4':        require('../assets/audio/pinyin/tones/nar4.mp3'),
  'neng2':       require('../assets/audio/pinyin/tones/neng2.mp3'),
  'nuer2':       require('../assets/audio/pinyin/tones/nuer2.mp3'),
  'pengyou2':    require('../assets/audio/pinyin/tones/pengyou2.mp3'),
  'piaoliang4':  require('../assets/audio/pinyin/tones/piaoliang4.mp3'),
  'qian2':       require('../assets/audio/pinyin/tones/qian2.mp3'),
  'qu4':         require('../assets/audio/pinyin/tones/qu4.mp3'),
  're4':         require('../assets/audio/pinyin/tones/re4.mp3'),
  'renshi4':     require('../assets/audio/pinyin/tones/renshi4.mp3'),
  'san1':        require('../assets/audio/pinyin/tones/san1.mp3'),
  'shang4':      require('../assets/audio/pinyin/tones/shang4.mp3'),
  'shao3':       require('../assets/audio/pinyin/tones/shao3.mp3'),
  'shihou2':     require('../assets/audio/pinyin/tones/shihou2.mp3'),
  'shui3':       require('../assets/audio/pinyin/tones/shui3.mp3'),
  'shuiguo3':    require('../assets/audio/pinyin/tones/shuiguo3.mp3'),
  'shuo1':       require('../assets/audio/pinyin/tones/shuo1.mp3'),
  'si4':         require('../assets/audio/pinyin/tones/si4.mp3'),
  'tai4':        require('../assets/audio/pinyin/tones/tai4.mp3'),
  'tianqi4':     require('../assets/audio/pinyin/tones/tianqi4.mp3'),
  'wu3':         require('../assets/audio/pinyin/tones/wu3.mp3'),
  'xia4':        require('../assets/audio/pinyin/tones/xia4.mp3'),
  'xianzai4':    require('../assets/audio/pinyin/tones/xianzai4.mp3'),
  'xie3':        require('../assets/audio/pinyin/tones/xie3.mp3'),
  'xuexi2':      require('../assets/audio/pinyin/tones/xuexi2.mp3'),
  'yi1':         require('../assets/audio/pinyin/tones/yi1.mp3'),
  'yifu1':       require('../assets/audio/pinyin/tones/yifu1.mp3'),
  'yisheng1':    require('../assets/audio/pinyin/tones/yisheng1.mp3'),
  'yizi3':       require('../assets/audio/pinyin/tones/yizi3.mp3'),
  'zai4':        require('../assets/audio/pinyin/tones/zai4.mp3'),
  'zenmeyang4':  require('../assets/audio/pinyin/tones/zenmeyang4.mp3'),
  'zher4':       require('../assets/audio/pinyin/tones/zher4.mp3'),
  'zhongwu3':    require('../assets/audio/pinyin/tones/zhongwu3.mp3'),
  'zhu4':        require('../assets/audio/pinyin/tones/zhu4.mp3'),
  'zhuozi1':     require('../assets/audio/pinyin/tones/zhuozi1.mp3'),
  'zuo4':        require('../assets/audio/pinyin/tones/zuo4.mp3'),

  // ── Pending — add file to tones/ and uncomment when ready ───────────────
  'piao4':    require('../assets/audio/pinyin/tones/piao4.mp3'),    
  'xingqi1':  require('../assets/audio/pinyin/tones/xingqi1.mp3'),   

  // ── PINYIN STAGE SYLLABLES — uncomment after recording each file ─────────
  // See RECORD_2_LESSON_1.txt through RECORD_11_LESSON_10.txt for what to say

  // Lesson 1
  'ba1':  require('../assets/audio/pinyin/tones/ba1.mp3'),    // bā  八 eight
  'bi3':  require('../assets/audio/pinyin/tones/bi3.mp3'),    // bǐ  笔 pen
  'da4':  require('../assets/audio/pinyin/tones/da4.mp3'),    // dà  大 big

  // Lesson 2
   'hao3':       require('../assets/audio/pinyin/tones/hao3.mp3'),      // hǎo  好 good
   'qi1':        require('../assets/audio/pinyin/tones/qi1.mp3'),       // qī   七 seven
   'jia1':       require('../assets/audio/pinyin/tones/jia1.mp3'),      // jiā  家 home
   'mao1':       require('../assets/audio/pinyin/tones/mao1.mp3'),      // māo  猫 cat
   'gou3':       require('../assets/audio/pinyin/tones/gou3.mp3'),      // gǒu  狗 dog
   'xi3':        require('../assets/audio/pinyin/tones/xi3.mp3'),       // xǐ   洗 wash
   'bei1':       require('../assets/audio/pinyin/tones/bei1.mp3'),      // bēi  杯 cup
   'ni3_hao3':   require('../assets/audio/pinyin/tones/ni3_hao3.mp3'),  // nǐhǎo 你好 hello

  // Lesson 3
   'zhe4':          require('../assets/audio/pinyin/tones/zhe4.mp3'),          // zhè  这 this
   'shu1':          require('../assets/audio/pinyin/tones/shu1.mp3'),          // shū  书 book
   'jie3':          require('../assets/audio/pinyin/tones/jie3.mp3'),          // jiě  姐 older sister
   'yue4':          require('../assets/audio/pinyin/tones/yue4.mp3'),          // yuè  月 moon/month
   'er2':           require('../assets/audio/pinyin/tones/er2.mp3'),           // ér   儿 child
   'zhong1':        require('../assets/audio/pinyin/tones/zhong1.mp3'),        // zhōng 中 middle
   'chu1_zu1_che1': require('../assets/audio/pinyin/tones/chu1_zu1_che1.mp3'), // chūzūchē 出租车 taxi

  // Lesson 4
   'cong2': require('../assets/audio/pinyin/tones/cong2.mp3'),  // cóng  从 from
   'men2':  require('../assets/audio/pinyin/tones/men2.mp3'),   // mén   门 door
   'fen1':  require('../assets/audio/pinyin/tones/fen1.mp3'),   // fēn   分 minute
   'xin1':  require('../assets/audio/pinyin/tones/xin1.mp3'),   // xīn   心 heart
   'cun1':  require('../assets/audio/pinyin/tones/cun1.mp3'),   // cūn   村 village
   'jun1':  require('../assets/audio/pinyin/tones/jun1.mp3'),   // jūn   军 army
   'ban1':  require('../assets/audio/pinyin/tones/ban1.mp3'),   // bān   班 class
   'ren2':  require('../assets/audio/pinyin/tones/ren2.mp3'),   // rén   人 person
   'nin2':  require('../assets/audio/pinyin/tones/nin2.mp3'),   // nín   您 you (formal)

  // Lesson 5
   'yang2':       require('../assets/audio/pinyin/tones/yang2.mp3'),       // yáng  羊 sheep
   'wang2':       require('../assets/audio/pinyin/tones/wang2.mp3'),       // wáng  王 king
   'ying1':       require('../assets/audio/pinyin/tones/ying1.mp3'),       // yīng  英 hero
   'dong1':       require('../assets/audio/pinyin/tones/dong1.mp3'),       // dōng  东 east
   'shang1':      require('../assets/audio/pinyin/tones/shang1.mp3'),      // shāng 商 business
   'weng4':       require('../assets/audio/pinyin/tones/weng4.mp3'),       // wèng  瓮 jar
   'ming2':       require('../assets/audio/pinyin/tones/ming2.mp3'),       // míng  名 name
   'peng2_you0':  require('../assets/audio/pinyin/tones/peng2_you0.mp3'),  // péngyou 朋友 friend

  // Lesson 6
   'qiao2':  require('../assets/audio/pinyin/tones/qiao2.mp3'),  // qiáo  桥 bridge
   'xian1':  require('../assets/audio/pinyin/tones/xian1.mp3'),  // xiān  仙 fairy
   'liang2': require('../assets/audio/pinyin/tones/liang2.mp3'), // liáng 凉 cool
   'gua1':   require('../assets/audio/pinyin/tones/gua1.mp3'),   // guā   瓜 melon
   'huai4':  require('../assets/audio/pinyin/tones/huai4.mp3'),  // huài  坏 bad
   'guo2':   require('../assets/audio/pinyin/tones/guo2.mp3'),   // guó   国 country
   'guan1':  require('../assets/audio/pinyin/tones/guan1.mp3'),  // guān  关 close
   'yuan2':  require('../assets/audio/pinyin/tones/yuan2.mp3'),  // yuán  元 yuan

  // Lesson 7
   'zhi1': require('../assets/audio/pinyin/tones/zhi1.mp3'),  // zhī  知 know
   'shi1': require('../assets/audio/pinyin/tones/shi1.mp3'),  // shī  师 teacher
   'ri4':  require('../assets/audio/pinyin/tones/ri4.mp3'),   // rì   日 day/sun
   'zi4':  require('../assets/audio/pinyin/tones/zi4.mp3'),   // zì   字 character
   'si1':  require('../assets/audio/pinyin/tones/si1.mp3'),   // sī   丝 silk
   'wu1':  require('../assets/audio/pinyin/tones/wu1.mp3'),   // wū   屋 house
   'yu2':  require('../assets/audio/pinyin/tones/yu2.mp3'),   // yú   鱼 fish
   'ye4':  require('../assets/audio/pinyin/tones/ye4.mp3'),   // yè   夜 night

  // Lesson 8 — tone sandhi phrases (say with CHANGED tone, not dictionary tone)
   'yi2_ge4':    require('../assets/audio/pinyin/tones/yi2_ge4.mp3'),    // yí gè   一个
   'yi4_tian1':  require('../assets/audio/pinyin/tones/yi4_tian1.mp3'),  // yì tiān 一天
   'yi4_qi3':    require('../assets/audio/pinyin/tones/yi4_qi3.mp3'),    // yì qǐ   一起
   'yi2_wei4':   require('../assets/audio/pinyin/tones/yi2_wei4.mp3'),   // yí wèi  一位
   'yi2_ci4':    require('../assets/audio/pinyin/tones/yi2_ci4.mp3'),    // yí cì   一次
   'yi4_qian1':  require('../assets/audio/pinyin/tones/yi4_qian1.mp3'),  // yì qiān 一千
   'yi4_bai3':   require('../assets/audio/pinyin/tones/yi4_bai3.mp3'),   // yì bǎi  一百
   'di4_yi1':    require('../assets/audio/pinyin/tones/di4_yi1.mp3'),    // dì yī   第一
   'shi2_yi1':   require('../assets/audio/pinyin/tones/shi2_yi1.mp3'),   // shí yī  十一
   'bu2_dui4':   require('../assets/audio/pinyin/tones/bu2_dui4.mp3'),   // bú duì  不对
   'bu2_shi4':   require('../assets/audio/pinyin/tones/bu2_shi4.mp3'),   // bú shì  不是
   'bu2_cuo4':   require('../assets/audio/pinyin/tones/bu2_cuo4.mp3'),   // bú cuò  不错
   'bu4_hao3':   require('../assets/audio/pinyin/tones/bu4_hao3.mp3'),   // bù hǎo  不好
   'bu4_neng2':  require('../assets/audio/pinyin/tones/bu4_neng2.mp3'),  // bù néng 不能
   'bu4_xing2':  require('../assets/audio/pinyin/tones/bu4_xing2.mp3'),  // bù xíng 不行

  // Lesson 9 — neutral tone particles
   'de0': require('../assets/audio/pinyin/tones/de0.mp3'),  // de  的 (particle — very light)
   'le0': require('../assets/audio/pinyin/tones/le0.mp3'),  // le  了 (particle — very light)

  // Lesson 10 — common phrases
   // 'ni3_hao3' already defined in Lesson 2 above
   'xie4_xie4':       require('../assets/audio/pinyin/tones/xie4_xie4.mp3'),       // xièxiè   谢谢
   'zai4_jian4':      require('../assets/audio/pinyin/tones/zai4_jian4.mp3'),      // zàijiàn  再见
   'dui4_bu4_qi3':    require('../assets/audio/pinyin/tones/dui4_bu4_qi3.mp3'),    // duìbuqǐ  对不起
   'mei2_guan1_xi0':  require('../assets/audio/pinyin/tones/mei2_guan1_xi0.mp3'),  // méiguānxi 没关系
   'zhong1_guo2':     require('../assets/audio/pinyin/tones/zhong1_guo2.mp3'),     // Zhōngguó  中国
   'ge1':             require('../assets/audio/pinyin/tones/ge1.mp3'),             // gē  歌 song
   'ji1':             require('../assets/audio/pinyin/tones/ji1.mp3'),             // jī  鸡 chicken

  // ── SPELLING RULES — uncomment after recording each file ──────────────────
  // See RECORD_SPELLING_LESSON_1.txt through RECORD_SPELLING_LESSON_10.txt

  // Lesson 1 — Initial + a/o/e/i/u/ü
  'pa2':  require('../assets/audio/pinyin/tones/pa2.mp3'),   // pá
  'fa4':  require('../assets/audio/pinyin/tones/fa4.mp3'),   // fà
  'ta1':  require('../assets/audio/pinyin/tones/ta1.mp3'),   // tā
  'na3':  require('../assets/audio/pinyin/tones/na3.mp3'),   // nǎ
  'la1':  require('../assets/audio/pinyin/tones/la1.mp3'),   // lā
  'bo1':  require('../assets/audio/pinyin/tones/bo1.mp3'),   // bō
  'po2':  require('../assets/audio/pinyin/tones/po2.mp3'),   // pó
  'mo2':  require('../assets/audio/pinyin/tones/mo2.mp3'),   // mó
  'fo2':  require('../assets/audio/pinyin/tones/fo2.mp3'),   // fó
  'me1':  require('../assets/audio/pinyin/tones/me1.mp3'),   // mē
  'de2':  require('../assets/audio/pinyin/tones/de2.mp3'),   // dé
  'te4':  require('../assets/audio/pinyin/tones/te4.mp3'),   // tè
  'ne4':  require('../assets/audio/pinyin/tones/ne4.mp3'),   // nè
  'le4':  require('../assets/audio/pinyin/tones/le4.mp3'),   // lè
  'pi2':  require('../assets/audio/pinyin/tones/pi2.mp3'),   // pí
  'mi3':  require('../assets/audio/pinyin/tones/mi3.mp3'),   // mǐ
  'di4':  require('../assets/audio/pinyin/tones/di4.mp3'),   // dì
  'ti2':  require('../assets/audio/pinyin/tones/ti2.mp3'),   // tí
  'ni3':  require('../assets/audio/pinyin/tones/ni3.mp3'),   // nǐ  you
  'li4':  require('../assets/audio/pinyin/tones/li4.mp3'),   // lì
  'bu4':  require('../assets/audio/pinyin/tones/bu4.mp3'),   // bù
  'pu4':  require('../assets/audio/pinyin/tones/pu4.mp3'),   // pù
  'mu4':  require('../assets/audio/pinyin/tones/mu4.mp3'),   // mù  wood
  'fu2':  require('../assets/audio/pinyin/tones/fu2.mp3'),   // fú  luck
  'du4':  require('../assets/audio/pinyin/tones/du4.mp3'),   // dù  belly
  'tu4':  require('../assets/audio/pinyin/tones/tu4.mp3'),   // tù  rabbit
  'nu3':  require('../assets/audio/pinyin/tones/nu3.mp3'),   // nǔ  effort
  'lu4':  require('../assets/audio/pinyin/tones/lu4.mp3'),   // lù  road
  'nv3':  require('../assets/audio/pinyin/tones/nv3.mp3'),   // nǚ  female/woman
  'lv4':  require('../assets/audio/pinyin/tones/lv4.mp3'),   // lǜ  green

  // Lesson 2 — ai/ei/ui/ao/ou/iu, j/q/x
  // 'bai1': require('../assets/audio/pinyin/tones/bai1.mp3'),  // bāi
  'bai2': require('../assets/audio/pinyin/tones/bai2.mp3'),  // bái  white
  'pai2': require('../assets/audio/pinyin/tones/pai2.mp3'),  // pái  brand
  'mai3': require('../assets/audio/pinyin/tones/mai3.mp3'),  // mǎi  buy
  // 'mai1': require('../assets/audio/pinyin/tones/mai1.mp3'),  // māi
  'dai1': require('../assets/audio/pinyin/tones/dai1.mp3'),  // dāi  stay
  'nai3': require('../assets/audio/pinyin/tones/nai3.mp3'),  // nǎi  milk
  'hai3': require('../assets/audio/pinyin/tones/hai3.mp3'),  // hǎi  sea
  'tai2': require('../assets/audio/pinyin/tones/tai2.mp3'),  // tái  platform
  // 'nai1': require('../assets/audio/pinyin/tones/nai1.mp3'),  // nāi  grandma
  // 'lai1': require('../assets/audio/pinyin/tones/lai1.mp3'),  // lāi
  // 'gai1': require('../assets/audio/pinyin/tones/gai1.mp3'),  // gāi  should
  'kai1': require('../assets/audio/pinyin/tones/kai1.mp3'),  // kāi  open
  // 'hai1': require('../assets/audio/pinyin/tones/hai1.mp3'),  // hāi  alas
  // 'pei1': require('../assets/audio/pinyin/tones/pei1.mp3'),  // pēi
  'mei2': require('../assets/audio/pinyin/tones/mei2.mp3'),  // méi  no/eyebrow
  'fei1': require('../assets/audio/pinyin/tones/fei1.mp3'),  // fēi  fly
  'lei4': require('../assets/audio/pinyin/tones/lei4.mp3'),  // lèi  tired
  'gei3': require('../assets/audio/pinyin/tones/gei3.mp3'),  // gěi  give
  'dui4': require('../assets/audio/pinyin/tones/dui4.mp3'),  // duì  correct
  'tui1': require('../assets/audio/pinyin/tones/tui1.mp3'),  // tuī  push
  'gui1': require('../assets/audio/pinyin/tones/gui1.mp3'),  // guī  turtle
  'kui1': require('../assets/audio/pinyin/tones/kui1.mp3'),  // kuī  lose
  'hui1': require('../assets/audio/pinyin/tones/hui1.mp3'),  // huī  gray
  'bao1': require('../assets/audio/pinyin/tones/bao1.mp3'),  // bāo  wrap
  // 'pao2': require('../assets/audio/pinyin/tones/pao2.mp3'),  // páo  run
  'pao3': require('../assets/audio/pinyin/tones/pao3.mp3'),  // pǎo  run
  'mao2': require('../assets/audio/pinyin/tones/mao2.mp3'),  // máo  hair
  'dao1': require('../assets/audio/pinyin/tones/dao1.mp3'),  // dāo  knife
  'tao2': require('../assets/audio/pinyin/tones/tao2.mp3'),  // táo  peach
  'nao4': require('../assets/audio/pinyin/tones/nao4.mp3'),  // nào  noisy
  'lao2': require('../assets/audio/pinyin/tones/lao2.mp3'),  // láo  labor
  'gao1': require('../assets/audio/pinyin/tones/gao1.mp3'),  // gāo  tall
  // 'kao1': require('../assets/audio/pinyin/tones/kao1.mp3'),  // kāo  bake
  // 'hao1': require('../assets/audio/pinyin/tones/hao1.mp3'),  // hāo
  'mou2': require('../assets/audio/pinyin/tones/mou2.mp3'),  // móu  scheme
  'tou2': require('../assets/audio/pinyin/tones/tou2.mp3'),  // tóu  head
  // 'nou2': require('../assets/audio/pinyin/tones/nou2.mp3'),  // nóu
  'lou2': require('../assets/audio/pinyin/tones/lou2.mp3'),  // lóu  floor
  'kou3': require('../assets/audio/pinyin/tones/kou3.mp3'),  // kǒu  mouth
  'hou2': require('../assets/audio/pinyin/tones/hou2.mp3'),  // hóu  monkey
  'niu2': require('../assets/audio/pinyin/tones/niu2.mp3'),  // niú  cow
  'liu2': require('../assets/audio/pinyin/tones/liu2.mp3'),  // liú  flow
  'jiu3': require('../assets/audio/pinyin/tones/jiu3.mp3'),  // jiǔ  nine/wine
  // 'jiu1': require('../assets/audio/pinyin/tones/jiu1.mp3'),  // jiū
  // 'qiu2': require('../assets/audio/pinyin/tones/qiu2.mp3'),  // qiú  ball
  'xiu1': require('../assets/audio/pinyin/tones/xiu1.mp3'),  // xiū  repair
  'xi1':  require('../assets/audio/pinyin/tones/xi1.mp3'),   // xī   west/hope

  // Lesson 3 — zh/ch/sh/r, ie, üe, er
  'zha1':  require('../assets/audio/pinyin/tones/zha1.mp3'),  // zhā
  // 'cha1':  require('../assets/audio/pinyin/tones/cha1.mp3'),  // chā  differ
  'sha1':  require('../assets/audio/pinyin/tones/sha1.mp3'),  // shā  sand
  // 'ra2':   require('../assets/audio/pinyin/tones/ra2.mp3'),   // rá
  'zhao1': require('../assets/audio/pinyin/tones/zhao1.mp3'), // zhāo  beckon
  'chao2': require('../assets/audio/pinyin/tones/chao2.mp3'), // cháo  dynasty
  'shao1': require('../assets/audio/pinyin/tones/shao1.mp3'), // shāo  a little
  'rao2':  require('../assets/audio/pinyin/tones/rao2.mp3'),  // ráo  forgive
  'bie1':  require('../assets/audio/pinyin/tones/bie1.mp3'),  // biē
  // 'pie2':  require('../assets/audio/pinyin/tones/pie2.mp3'),  // pié
  'die1':  require('../assets/audio/pinyin/tones/die1.mp3'),  // diē  fall
  'tie1':  require('../assets/audio/pinyin/tones/tie1.mp3'),  // tiē  stick
  'nie1':  require('../assets/audio/pinyin/tones/nie1.mp3'),  // niē  pinch
  // 'lie1':  require('../assets/audio/pinyin/tones/lie1.mp3'),  // liē
  'jie1':  require('../assets/audio/pinyin/tones/jie1.mp3'),  // jiē  street
  'qie1':  require('../assets/audio/pinyin/tones/qie1.mp3'),  // qiē  cut
  'xie1':  require('../assets/audio/pinyin/tones/xie1.mp3'),  // xiē  some
  // 'nve1':  require('../assets/audio/pinyin/tones/nve1.mp3'),  // nüē
  'lve4':  require('../assets/audio/pinyin/tones/lve4.mp3'),  // lüè  abbreviate
  'jue1':  require('../assets/audio/pinyin/tones/jue1.mp3'),  // juē  (written jue)
  'que1':  require('../assets/audio/pinyin/tones/que1.mp3'),  // quē  lack
  // 'xue1':  require('../assets/audio/pinyin/tones/xue1.mp3'),  // xuē  snow

  // Lesson 4 — z/c/s, -an/-en/-in/-un/-ün
  'za1':   require('../assets/audio/pinyin/tones/za1.mp3'),   // zā
  'ca1':   require('../assets/audio/pinyin/tones/ca1.mp3'),   // cā  wipe
  // 'sa1':   require('../assets/audio/pinyin/tones/sa1.mp3'),   // sā  scatter
  'ze2':   require('../assets/audio/pinyin/tones/ze2.mp3'),   // zé  standard
  'ce4':   require('../assets/audio/pinyin/tones/ce4.mp3'),   // cè  survey
  'se4':   require('../assets/audio/pinyin/tones/se4.mp3'),   // sè  color
  'zu2':   require('../assets/audio/pinyin/tones/zu2.mp3'),   // zú  foot
  'cu4':   require('../assets/audio/pinyin/tones/cu4.mp3'),   // cù  vinegar
  'su1':   require('../assets/audio/pinyin/tones/su1.mp3'),   // sū  revive
  'pan2':  require('../assets/audio/pinyin/tones/pan2.mp3'),  // pán  plate
  'man4':  require('../assets/audio/pinyin/tones/man4.mp3'),  // màn  slow
  'fan1':  require('../assets/audio/pinyin/tones/fan1.mp3'),  // fān  turn over
  'dan1':  require('../assets/audio/pinyin/tones/dan1.mp3'),  // dān  single
  'tan2':  require('../assets/audio/pinyin/tones/tan2.mp3'),  // tán  talk
  'nan2':  require('../assets/audio/pinyin/tones/nan2.mp3'),  // nán  difficult
  'lan2':  require('../assets/audio/pinyin/tones/lan2.mp3'),  // lán  blue
  'gan1':  require('../assets/audio/pinyin/tones/gan1.mp3'),  // gān  dry
  'han4':  require('../assets/audio/pinyin/tones/han4.mp3'),  // hàn  Chinese/sweat
  'ben1':  require('../assets/audio/pinyin/tones/ben1.mp3'),  // bēn  run
  'pen2':  require('../assets/audio/pinyin/tones/pen2.mp3'),  // pén  basin
  // 'den4':  require('../assets/audio/pinyin/tones/den4.mp3'),  // dèn
  'nen4':  require('../assets/audio/pinyin/tones/nen4.mp3'),  // nèn  tender
  'gen1':  require('../assets/audio/pinyin/tones/gen1.mp3'),  // gēn  root
  'hen3':  require('../assets/audio/pinyin/tones/hen3.mp3'),  // hěn  very
  'zhen1': require('../assets/audio/pinyin/tones/zhen1.mp3'), // zhēn  needle
  'chen2': require('../assets/audio/pinyin/tones/chen2.mp3'), // chén  morning
  'shen2': require('../assets/audio/pinyin/tones/shen2.mp3'), // shén  spirit
  'bin1':  require('../assets/audio/pinyin/tones/bin1.mp3'),  // bīn  guest
  'pin2':  require('../assets/audio/pinyin/tones/pin2.mp3'),  // pín  poor
  'min3':  require('../assets/audio/pinyin/tones/min3.mp3'),  // mǐn  quick
  'lin2':  require('../assets/audio/pinyin/tones/lin2.mp3'),  // lín  forest
  // 'jin1':  require('../assets/audio/pinyin/tones/jin1.mp3'),  // jīn  gold
  // 'qin2':  require('../assets/audio/pinyin/tones/qin2.mp3'),  // qín  diligent
  // 'dun1':  require('../assets/audio/pinyin/tones/dun1.mp3'),  // dūn  squat
  // 'tun1':  require('../assets/audio/pinyin/tones/tun1.mp3'),  // tūn  swallow
  // 'lun2':  require('../assets/audio/pinyin/tones/lun2.mp3'),  // lún  wheel
  // 'gun1':  require('../assets/audio/pinyin/tones/gun1.mp3'),  // gūn  roll
  // 'kun4':  require('../assets/audio/pinyin/tones/kun4.mp3'),  // kùn  tired
  // 'hun2':  require('../assets/audio/pinyin/tones/hun2.mp3'),  // hún  soul
  // 'zhun1': require('../assets/audio/pinyin/tones/zhun1.mp3'), // zhūn  accurate
  // 'chun2': require('../assets/audio/pinyin/tones/chun2.mp3'), // chún  pure
  // 'run2':  require('../assets/audio/pinyin/tones/run2.mp3'),  // rún  moist
  // 'zun1':  require('../assets/audio/pinyin/tones/zun1.mp3'),  // zūn  respect
  // 'qun2':  require('../assets/audio/pinyin/tones/qun2.mp3'),  // qún  skirt
  // 'xun1':  require('../assets/audio/pinyin/tones/xun1.mp3'),  // xūn  smoke

  // Lesson 5 — y/w, -ang/-eng/-ing/-ong
  // 'ya1':    require('../assets/audio/pinyin/tones/ya1.mp3'),    // yā  duck
  // 'ye1':    require('../assets/audio/pinyin/tones/ye1.mp3'),    // yē  grandpa
  // 'wa1':    require('../assets/audio/pinyin/tones/wa1.mp3'),    // wā  dig
  // 'wo2':    require('../assets/audio/pinyin/tones/wo2.mp3'),    // wó
  // 'bang1':  require('../assets/audio/pinyin/tones/bang1.mp3'),  // bāng  help
  // 'pang2':  require('../assets/audio/pinyin/tones/pang2.mp3'),  // páng  fat
  // 'mang1':  require('../assets/audio/pinyin/tones/mang1.mp3'),  // māng  busy
  // 'fang1':  require('../assets/audio/pinyin/tones/fang1.mp3'),  // fāng  direction
  // 'dang1':  require('../assets/audio/pinyin/tones/dang1.mp3'),  // dāng  should
  // 'tang2':  require('../assets/audio/pinyin/tones/tang2.mp3'),  // táng  sugar
  // 'nang2':  require('../assets/audio/pinyin/tones/nang2.mp3'),  // náng  naan
  // 'lang2':  require('../assets/audio/pinyin/tones/lang2.mp3'),  // láng  wolf
  // 'gang1':  require('../assets/audio/pinyin/tones/gang1.mp3'),  // gāng  steel
  // 'kang4':  require('../assets/audio/pinyin/tones/kang4.mp3'),  // kàng  resist
  // 'hang2':  require('../assets/audio/pinyin/tones/hang2.mp3'),  // háng  trade
  'zhang1': require('../assets/audio/pinyin/tones/zhang1.mp3'), // zhāng  chapter
  // 'chang2': require('../assets/audio/pinyin/tones/chang2.mp3'), // cháng  long
  // 'rang2':  require('../assets/audio/pinyin/tones/rang2.mp3'),  // ráng  cede
  // 'zang1':  require('../assets/audio/pinyin/tones/zang1.mp3'),  // zāng  dirty
  // 'cang2':  require('../assets/audio/pinyin/tones/cang2.mp3'),  // cáng  hide
  // 'sang1':  require('../assets/audio/pinyin/tones/sang1.mp3'),  // sāng  mulberry
  // 'beng2':  require('../assets/audio/pinyin/tones/beng2.mp3'),  // béng
  // 'peng2':  require('../assets/audio/pinyin/tones/peng2.mp3'),  // péng  friend
  // 'meng2':  require('../assets/audio/pinyin/tones/meng2.mp3'),  // méng  dream
  // 'feng2':  require('../assets/audio/pinyin/tones/feng2.mp3'),  // féng  sew
  // 'deng3':  require('../assets/audio/pinyin/tones/deng3.mp3'),  // děng  wait
  // 'teng2':  require('../assets/audio/pinyin/tones/teng2.mp3'),  // téng  pain
  // 'leng2':  require('../assets/audio/pinyin/tones/leng2.mp3'),  // léng  edge
  // 'geng4':  require('../assets/audio/pinyin/tones/geng4.mp3'),  // gèng  more
  // 'keng1':  require('../assets/audio/pinyin/tones/keng1.mp3'),  // kēng  pit
  // 'heng2':  require('../assets/audio/pinyin/tones/heng2.mp3'),  // héng  horizontal
  // 'zheng1': require('../assets/audio/pinyin/tones/zheng1.mp3'), // zhēng  steam
  // 'cheng2': require('../assets/audio/pinyin/tones/cheng2.mp3'), // chéng  city
  // 'sheng2': require('../assets/audio/pinyin/tones/sheng2.mp3'), // shéng  rope
  // 'reng2':  require('../assets/audio/pinyin/tones/reng2.mp3'),  // réng  still
  // 'zeng4':  require('../assets/audio/pinyin/tones/zeng4.mp3'),  // zèng  gift
  // 'ceng2':  require('../assets/audio/pinyin/tones/ceng2.mp3'),  // céng  layer
  // 'seng1':  require('../assets/audio/pinyin/tones/seng1.mp3'),  // sēng  monk
  // 'bing1':  require('../assets/audio/pinyin/tones/bing1.mp3'),  // bīng  ice
  // 'ping2':  require('../assets/audio/pinyin/tones/ping2.mp3'),  // píng  flat
  // 'ding1':  require('../assets/audio/pinyin/tones/ding1.mp3'),  // dīng  nail
  // 'ting2':  require('../assets/audio/pinyin/tones/ting2.mp3'),  // tíng  stop
  // 'ning2':  require('../assets/audio/pinyin/tones/ning2.mp3'),  // níng  peaceful
  // 'ling2':  require('../assets/audio/pinyin/tones/ling2.mp3'),  // líng  zero
  // 'jing1':  require('../assets/audio/pinyin/tones/jing1.mp3'),  // jīng  capital
  // 'qing2':  require('../assets/audio/pinyin/tones/qing2.mp3'),  // qíng  feeling
  // 'xing1':  require('../assets/audio/pinyin/tones/xing1.mp3'),  // xīng  star
  // 'tong2':  require('../assets/audio/pinyin/tones/tong2.mp3'),  // tóng  same
  // 'nong2':  require('../assets/audio/pinyin/tones/nong2.mp3'),  // nóng  farming
  // 'long2':  require('../assets/audio/pinyin/tones/long2.mp3'),  // lóng  dragon
  // 'gong1':  require('../assets/audio/pinyin/tones/gong1.mp3'),  // gōng  work
  // 'kong1':  require('../assets/audio/pinyin/tones/kong1.mp3'),  // kōng  empty
  // 'hong2':  require('../assets/audio/pinyin/tones/hong2.mp3'),  // hóng  red
  'chong2': require('../assets/audio/pinyin/tones/chong2.mp3'), // chóng  insect
  // 'song1':  require('../assets/audio/pinyin/tones/song1.mp3'),  // sōng  pine
  // 'zong1':  require('../assets/audio/pinyin/tones/zong1.mp3'),  // zōng  ancestor

  // Lesson 6 — ia/iao/ian/iang/ua/uai/uo/uan/uang/üan
  'qia1':    require('../assets/audio/pinyin/tones/qia1.mp3'),    // qiā
  'xia1':    require('../assets/audio/pinyin/tones/xia1.mp3'),    // xiā  shrimp
  // 'nia3':    require('../assets/audio/pinyin/tones/nia3.mp3'),    // niǎ
  'lia3':    require('../assets/audio/pinyin/tones/lia3.mp3'),    // liǎ  two
  'biao1':   require('../assets/audio/pinyin/tones/biao1.mp3'),   // biāo  mark
  // 'piao2':   require('../assets/audio/pinyin/tones/piao2.mp3'),   // piáo  float
  // 'miao1':   require('../assets/audio/pinyin/tones/miao1.mp3'),   // miāo  meow
  'diao4':   require('../assets/audio/pinyin/tones/diao4.mp3'),   // diào  hang
  'tiao2':   require('../assets/audio/pinyin/tones/tiao2.mp3'),   // tiáo  strip
  'niao3':   require('../assets/audio/pinyin/tones/niao3.mp3'),   // niǎo  bird
  'liao3':   require('../assets/audio/pinyin/tones/liao3.mp3'),   // liǎo  understand
  'jiao1':   require('../assets/audio/pinyin/tones/jiao1.mp3'),   // jiāo  teach
  'qiao1':   require('../assets/audio/pinyin/tones/qiao1.mp3'),   // qiāo  knock
  // 'xiao1':   require('../assets/audio/pinyin/tones/xiao1.mp3'),   // xiāo  small
  'bian1':   require('../assets/audio/pinyin/tones/bian1.mp3'),   // biān  side
  'pian1':   require('../assets/audio/pinyin/tones/pian1.mp3'),   // piān  one-sided
  'mian4':   require('../assets/audio/pinyin/tones/mian4.mp3'),   // miàn  face
  'dian3':   require('../assets/audio/pinyin/tones/dian3.mp3'),   // diǎn  point
  'tian1':   require('../assets/audio/pinyin/tones/tian1.mp3'),   // tiān  sky
  'nian2':   require('../assets/audio/pinyin/tones/nian2.mp3'),   // nián  year
  'lian3':   require('../assets/audio/pinyin/tones/lian3.mp3'),   // liǎn  face
  'jian1':   require('../assets/audio/pinyin/tones/jian1.mp3'),   // jiān  shoulder
  'niang2':  require('../assets/audio/pinyin/tones/niang2.mp3'),  // niáng  mother
  'jiang1':  require('../assets/audio/pinyin/tones/jiang1.mp3'),  // jiāng  river
  'qiang1':  require('../assets/audio/pinyin/tones/qiang1.mp3'),  // qiāng  gun
  'xiang1':  require('../assets/audio/pinyin/tones/xiang1.mp3'),  // xiāng  fragrant
  'kua1':    require('../assets/audio/pinyin/tones/kua1.mp3'),    // kuā  boast
  'hua1':    require('../assets/audio/pinyin/tones/hua1.mp3'),    // huā  flower
  'zhua1':   require('../assets/audio/pinyin/tones/zhua1.mp3'),   // zhuā  grab
  'shua1':   require('../assets/audio/pinyin/tones/shua1.mp3'),   // shuā  brush
  'guai1':   require('../assets/audio/pinyin/tones/guai1.mp3'),   // guāi  well-behaved
  // 'kuai1':   require('../assets/audio/pinyin/tones/kuai1.mp3'),   // kuāi
  // 'huai1':   require('../assets/audio/pinyin/tones/huai1.mp3'),   // huāi
  // 'zhuai1':  require('../assets/audio/pinyin/tones/zhuai1.mp3'),  // zhuāi  drag
  'shuai1':  require('../assets/audio/pinyin/tones/shuai1.mp3'),  // shuāi  handsome
  'duo1':    require('../assets/audio/pinyin/tones/duo1.mp3'),    // duō  many
  'tuo1':    require('../assets/audio/pinyin/tones/tuo1.mp3'),    // tuō  pull
  // 'nuo4':    require('../assets/audio/pinyin/tones/nuo4.mp3'),    // nuò  promise
  // 'luo1':    require('../assets/audio/pinyin/tones/luo1.mp3'),    // luō  net
  'guo1':    require('../assets/audio/pinyin/tones/guo1.mp3'),    // guō  pot
  'kuo4':    require('../assets/audio/pinyin/tones/kuo4.mp3'),    // kuò  broad
  'huo4':    require('../assets/audio/pinyin/tones/huo4.mp3'),    // huò  goods
  'zhuo1':   require('../assets/audio/pinyin/tones/zhuo1.mp3'),   // zhuō  table
  'chuo1':   require('../assets/audio/pinyin/tones/chuo1.mp3'),   // chuō  poke
  'ruo4':    require('../assets/audio/pinyin/tones/ruo4.mp3'),    // ruò  weak
  'cuo1':    require('../assets/audio/pinyin/tones/cuo1.mp3'),    // cuō  rub
  'suo1':    require('../assets/audio/pinyin/tones/suo1.mp3'),    // suō  shrink
  'duan1':   require('../assets/audio/pinyin/tones/duan1.mp3'),   // duān  proper
  'tuan2':   require('../assets/audio/pinyin/tones/tuan2.mp3'),   // tuán  group
  'nuan3':   require('../assets/audio/pinyin/tones/nuan3.mp3'),   // nuǎn  warm
  'luan4':   require('../assets/audio/pinyin/tones/luan4.mp3'),   // luàn  chaos
  'kuan1':   require('../assets/audio/pinyin/tones/kuan1.mp3'),   // kuān  wide
  'huan2':   require('../assets/audio/pinyin/tones/huan2.mp3'),   // huán  return
  'zhuan1':  require('../assets/audio/pinyin/tones/zhuan1.mp3'),  // zhuān  special
  // 'chuan2':  require('../assets/audio/pinyin/tones/chuan2.mp3'),  // chuán  boat
  'shuan1':  require('../assets/audio/pinyin/tones/shuan1.mp3'),  // shuān  latch
  'ruan3':   require('../assets/audio/pinyin/tones/ruan3.mp3'),   // ruǎn  soft
  'zuan1':   require('../assets/audio/pinyin/tones/zuan1.mp3'),   // zuān  drill
  'cuan1':   require('../assets/audio/pinyin/tones/cuan1.mp3'),   // cuān  flee
  'suan4':   require('../assets/audio/pinyin/tones/suan4.mp3'),   // suàn  calculate
  // 'guang1':  require('../assets/audio/pinyin/tones/guang1.mp3'),  // guāng  light
  'kuang1':  require('../assets/audio/pinyin/tones/kuang1.mp3'),  // kuāng  basket
  'huang2':  require('../assets/audio/pinyin/tones/huang2.mp3'),  // huáng  yellow
  'zhuang1': require('../assets/audio/pinyin/tones/zhuang1.mp3'), // zhuāng  dress up
  'chuang1': require('../assets/audio/pinyin/tones/chuang1.mp3'), // chuāng  window
  'shuang1': require('../assets/audio/pinyin/tones/shuang1.mp3'), // shuāng  pair
  'juan1':   require('../assets/audio/pinyin/tones/juan1.mp3'),   // juān  donate
  'quan1':   require('../assets/audio/pinyin/tones/quan1.mp3'),   // quān  circle
  'xuan1':   require('../assets/audio/pinyin/tones/xuan1.mp3'),   // xuān  announce

  // Lesson 7 — whole-syllable compound finals
  // 'ri2':   require('../assets/audio/pinyin/tones/ri2.mp3'),   // rí  (tone 2)
  // 'zi1':   require('../assets/audio/pinyin/tones/zi1.mp3'),   // zī  character
  'ci2':   require('../assets/audio/pinyin/tones/ci2.mp3'),   // cí  word
  'zhan1': require('../assets/audio/pinyin/tones/zhan1.mp3'), // zhān
  // 'zhang1':require('../assets/audio/pinyin/tones/zhang1.mp3'),// zhāng  chapter
  // 'chong2':require('../assets/audio/pinyin/tones/chong2.mp3'),// chóng  insect
  'chan2': require('../assets/audio/pinyin/tones/chan2.mp3'),  // chán  meditation
  'shan1': require('../assets/audio/pinyin/tones/shan1.mp3'),  // shān  mountain
  'ran2':  require('../assets/audio/pinyin/tones/ran2.mp3'),  // rán  burn
  'zao1':  require('../assets/audio/pinyin/tones/zao1.mp3'),  // zāo  messy
  // 'zan1':  require('../assets/audio/pinyin/tones/zan1.mp3'),  // zān
  'cao1':  require('../assets/audio/pinyin/tones/cao1.mp3'),  // cāo  operate
  'can1':  require('../assets/audio/pinyin/tones/can1.mp3'),  // cān  meal
  // 'sao1':  require('../assets/audio/pinyin/tones/sao1.mp3'),  // sāo  sweep

  // Lesson 8 — 不 sandhi
  'bu4_lai2': require('../assets/audio/pinyin/tones/bu4_lai2.mp3'), // bù lái  not coming

  // Lesson 9 — neutral tone & erhua
  'ma0':     require('../assets/audio/pinyin/tones/ma0.mp3'),     // ma  吗 question particle
  'wanr2':   require('../assets/audio/pinyin/tones/wanr2.mp3'),   // wánr  玩儿 play
  'dianr3':  require('../assets/audio/pinyin/tones/dianr3.mp3'),  // diǎnr 点儿 a little
  'yihuir4': require('../assets/audio/pinyin/tones/yihuir4.mp3'), // yīhuìr 一会儿 a moment
};
