import { getAvatar } from '../config/avatarConfig';

// ── Avatar conversation groups ────────────────────────────────────────────────
// Two groups of 4. Within a lesson, dialogues rotate through the group's two
// pairs so a lesson with 2+ dialogues naturally features 4 distinct participants.
//   Group A (literary fiction): eileen · libai · elena · liucixin
//   Group B (philosophy/realism): luxun · jane · dante · camus
export const AVATAR_GROUPS = {
  eileen:   [['eileen',   'libai'],    ['elena',    'liucixin']],
  libai:    [['libai',    'eileen'],   ['liucixin', 'elena']],
  elena:    [['elena',    'liucixin'], ['eileen',   'libai']],
  liucixin: [['liucixin', 'elena'],    ['libai',    'eileen']],
  luxun:    [['luxun',    'jane'],     ['dante',    'camus']],
  jane:     [['jane',     'luxun'],    ['camus',    'dante']],
  dante:    [['dante',    'camus'],    ['luxun',    'jane']],
  camus:    [['camus',    'dante'],    ['jane',     'luxun']],
};

// Returns the [avatarAId, avatarBId] pair to use for dialogue at dialogueIndex.
export function getPairForDialogue(primaryAvatarId, dialogueIndex = 0) {
  const groups = AVATAR_GROUPS[primaryAvatarId];
  if (!groups) return ['eileen', 'libai'];
  return groups[dialogueIndex % groups.length];
}

// Derive the display name from a full Chinese name.
// 张爱玲 → 爱玲 | 简奥斯汀 → 奥斯汀 | 李白 → 李白 | 费兰特 → 兰特
export function shortName(chineseName) {
  return chineseName.length > 2 ? chineseName.slice(1) : chineseName;
}

// ── Family / medical role detection ─────────────────────────────────────────
export const PRESERVE_ROLE_KEYWORDS = [
  '爸','妈','父','母','儿子','女儿','孩子','宝','祖','孙',
  '奶奶','爷爷','外婆','外公','姥姥','姥爷',
  '医生','大夫','护士','病人','患者',
  '老师','教授','教师','校长','老板','经理','顾问','律师',
  // Named literary figures used directly as dialogue speakers (dialogue-only avatars)
  '苏轼','萨特','波伏娃','西蒙娜','伍尔夫','杨绛',
  '但丁','加缪','鲁迅','李白','爱玲','张爱玲',
  '奥斯汀','简奥斯汀','兰特','费兰特','慈欣','刘慈欣',
];

// Map from the Chinese name used in lesson JSON → avatarId in avatarConfig
export const LITERARY_AVATAR_MAP = {
  '苏轼':  'sushi',
  '萨特':  'sartre',
  '波伏娃':'beauvoir',
  '西蒙娜':'beauvoir',
  '伍尔夫':'woolf',
  '杨绛':  'yangjiang',
  '但丁':  'dante',
  '加缪':  'camus',
  '鲁迅':  'luxun',
  '李白':  'libai',
  '爱玲':  'eileen',
  '张爱玲':'eileen',
  '奥斯汀':'jane',
  '简奥斯汀':'jane',
  '兰特':  'elena',
  '费兰特':'elena',
  '慈欣':  'liucixin',
  '刘慈欣':'liucixin',
};

// Augment a single speaker record with avatar info if their name matches a known literary avatar.
export function augmentSpeakerWithAvatar(speakerInfo) {
  if (!speakerInfo) return speakerInfo;
  const avatarId = LITERARY_AVATAR_MAP[speakerInfo.name];
  if (!avatarId) return speakerInfo;
  const avatar = getAvatar(avatarId);
  return {
    ...speakerInfo,
    isAvatar: true,
    avatarId,
    gender: avatar.gender,
  };
}

export function shouldPreserveDialogue(dialogue) {
  const speakers = Object.values(dialogue.speakers || {});
  // Only check the speaker's NAME — role-keywords in the role field alone (e.g. 加缪 with
  // role="老师") should NOT trigger preservation; only real role-names like 王老师 or 李医生 do.
  return speakers.some(sp =>
    PRESERVE_ROLE_KEYWORDS.some(k => (sp.name || '').includes(k))
  );
}

// ── Name → pinyin / English lookup ───────────────────────────────────────────
export const NAME_LOOKUP = {
  // Original character names
  '小明':  { pinyin: 'Xiǎo Míng',  english: 'Xiao Ming'  },
  '小丽':  { pinyin: 'Xiǎo Lì',    english: 'Xiao Li'    },
  '小华':  { pinyin: 'Xiǎo Huá',   english: 'Xiao Hua'   },
  '小红':  { pinyin: 'Xiǎo Hóng',  english: 'Xiao Hong'  },
  '小刚':  { pinyin: 'Xiǎo Gāng',  english: 'Xiao Gang'  },
  '小文':  { pinyin: 'Xiǎo Wén',   english: 'Xiao Wen'   },
  '小云':  { pinyin: 'Xiǎo Yún',   english: 'Xiao Yun'   },
  '小李':  { pinyin: 'Xiǎo Lǐ',    english: 'Xiao Li'    },
  '小周':  { pinyin: 'Xiǎo Zhōu',  english: 'Xiao Zhou'  },
  '小月':  { pinyin: 'Xiǎo Yuè',   english: 'Xiao Yue'   },
  '小倩':  { pinyin: 'Xiǎo Qiàn',  english: 'Xiao Qian'  },
  '小美':  { pinyin: 'Xiǎo Měi',   english: 'Xiao Mei'   },
  '小梅':  { pinyin: 'Xiǎo Méi',   english: 'Xiao Mei'   },
  '小燕':  { pinyin: 'Xiǎo Yàn',   english: 'Xiao Yan'   },
  '小林':  { pinyin: 'Xiǎo Lín',   english: 'Xiao Lin'   },
  '小陈':  { pinyin: 'Xiǎo Chén',  english: 'Xiao Chen'  },
  '小雨':  { pinyin: 'Xiǎo Yǔ',    english: 'Xiao Yu'    },
  '小雪':  { pinyin: 'Xiǎo Xuě',   english: 'Xiao Xue'   },
  '小芳':  { pinyin: 'Xiǎo Fāng',  english: 'Xiao Fang'  },
  '小强':  { pinyin: 'Xiǎo Qiáng', english: 'Xiao Qiang' },
  '小敏':  { pinyin: 'Xiǎo Mǐn',   english: 'Xiao Min'   },
  '小玲':  { pinyin: 'Xiǎo Líng',  english: 'Xiao Ling'  },
  '小张':  { pinyin: 'Xiǎo Zhāng', english: 'Xiao Zhang' },
  '大卫':  { pinyin: 'Dà Wèi',     english: 'David'      },
  '大伟':  { pinyin: 'Dà Wěi',     english: 'Da Wei'     },
  '大明':  { pinyin: 'Dà Míng',    english: 'Da Ming'    },
  '大强':  { pinyin: 'Dà Qiáng',   english: 'Da Qiang'   },
  '建国':  { pinyin: 'Jiàn Guó',   english: 'Jian Guo'   },
  '建明':  { pinyin: 'Jiàn Míng',  english: 'Jian Ming'  },
  '明明':  { pinyin: 'Míng Míng',  english: 'Ming Ming'  },
  '明轩':  { pinyin: 'Míng Xuān',  english: 'Ming Xuan'  },
  '晓晓':  { pinyin: 'Xiǎo Xiǎo',  english: 'Xiao Xiao'  },
  '晓燕':  { pinyin: 'Xiǎo Yàn',   english: 'Xiao Yan'   },
  '晓菲':  { pinyin: 'Xiǎo Fēi',   english: 'Xiao Fei'   },
  '晓雯':  { pinyin: 'Xiǎo Wén',   english: 'Xiao Wen'   },
  '张明':  { pinyin: 'Zhāng Míng', english: 'Zhang Ming' },
  '海涛':  { pinyin: 'Hǎi Tāo',    english: 'Hai Tao'    },
  '志远':  { pinyin: 'Zhì Yuǎn',   english: 'Zhi Yuan'   },
  '子涵':  { pinyin: 'Zǐ Hán',     english: 'Zi Han'     },
  '丽华':  { pinyin: 'Lì Huá',     english: 'Li Hua'     },
  '阿华':  { pinyin: 'Ā Huá',      english: 'A Hua'      },
  '阿强':  { pinyin: 'Ā Qiáng',    english: 'A Qiang'    },
  '阿梅':  { pinyin: 'Ā Méi',      english: 'A Mei'      },
  '阿辉':  { pinyin: 'Ā Huī',      english: 'A Hui'      },
  '芳芳':  { pinyin: 'Fāng Fāng',  english: 'Fang Fang'  },
  '雨桐':  { pinyin: 'Yǔ Tóng',    english: 'Yu Tong'    },
  '李明':  { pinyin: 'Lǐ Míng',    english: 'Li Ming'    },
  '李梅':  { pinyin: 'Lǐ Méi',     english: 'Li Mei'     },
  '李强':  { pinyin: 'Lǐ Qiáng',   english: 'Li Qiang'   },
  '玛丽':  { pinyin: 'Mǎ Lì',      english: 'Ma Li'      },
  '林海':  { pinyin: 'Lín Hǎi',    english: 'Lin Hai'    },
  '王明':  { pinyin: 'Wáng Míng',  english: 'Wang Ming'  },
  '王芳':  { pinyin: 'Wáng Fāng',  english: 'Wang Fang'  },
  // Avatar short names (replacement targets)
  '爱玲':  { pinyin: 'Ài Líng',    english: 'Eileen'     },
  '李白':  { pinyin: 'Lǐ Bái',     english: 'Li Bai'     },
  '鲁迅':  { pinyin: 'Lǔ Xùn',     english: 'Lu Xun'     },
  '但丁':  { pinyin: 'Dàn Dīng',   english: 'Dante'      },
  '加缪':  { pinyin: 'Jiā Miù',    english: 'Camus'      },
  '奥斯汀':{ pinyin: 'Ào Sī Tīng', english: 'Austen'     },
  '兰特':  { pinyin: 'Lán Tè',     english: 'Elena'      },
  '慈欣':  { pinyin: 'Cí Xīn',     english: 'Liu Cixin'  },
  // Titles used as character names in dialogue lines
  '李教授':{ pinyin: 'Lǐ jiào shòu', english: 'Professor Li' },
  '王顾问':{ pinyin: 'Wáng gù wèn',  english: 'Advisor Wang' },
  // Famous artists and writers (used as replacement names in JSON data)
  '苏轼':  { pinyin: 'Sū Shì',     english: 'Su Shi'     },
  '萨特':  { pinyin: 'Sà Tè',      english: 'Sartre'     },
  '波伏娃':{ pinyin: 'Bō Fú Wá',   english: 'Beauvoir'   },
  '西蒙娜':{ pinyin: 'Xī Méng Nà', english: 'Simone'     },
  '伍尔夫':{ pinyin: 'Wǔ Ěr Fū',   english: 'Woolf'      },
  '严歌苓':{ pinyin: 'Yán Gē Líng',english: 'Yan Geling' },
};

// ── Line-level text swap ──────────────────────────────────────────────────────
export function swapDialogueLine(line, origName, newName) {
  if (!origName || !newName || origName === newName) return line;

  let { chinese = '', pinyin = '', english = '' } = line;
  if (!chinese.includes(origName)) return line;

  chinese = chinese.split(origName).join(newName);

  const origPy = NAME_LOOKUP[origName]?.pinyin;
  const newPy  = NAME_LOOKUP[newName]?.pinyin;
  if (origPy && newPy && pinyin.includes(origPy)) {
    pinyin = pinyin.split(origPy).join(newPy);
  }

  const origEn = NAME_LOOKUP[origName]?.english;
  const newEn  = NAME_LOOKUP[newName]?.english;
  if (origEn && newEn && english.includes(origEn)) {
    english = english.split(origEn).join(newEn);
  }

  return { ...line, chinese, pinyin, english };
}

// ── Lesson-level preprocessing for exercises ─────────────────────────────────
// Deep-processes lessonData to swap character names with avatar names in all
// dialogue lines. Each dialogue uses the pair appropriate for its index
// (rotating through the lesson's group), so a lesson with 2+ dialogues
// naturally surfaces 4 distinct avatar participants.
// Family/medical dialogues are left completely unchanged.
export function applyAvatarNames(lessonData, primaryAvatarId) {
  if (!lessonData || !primaryAvatarId) return lessonData;

  const dialogues = (lessonData.dialogues || []).map((dialogue, idx) => {
    if (shouldPreserveDialogue(dialogue)) return dialogue;

    const [idA, idB] = getPairForDialogue(primaryAvatarId, idx);
    const avatarA = getAvatar(idA);
    const avatarB = getAvatar(idB);
    const nameA = shortName(avatarA.chineseName);
    const nameB = shortName(avatarB.chineseName);

    const origNameA = dialogue.speakers?.A?.name || '';
    const origNameB = dialogue.speakers?.B?.name || '';

    return {
      ...dialogue,
      lines: dialogue.lines.map(line => {
        let l = swapDialogueLine(line, origNameA, nameA);
        l = swapDialogueLine(l, origNameB, nameB);
        return l;
      }),
    };
  });

  return { ...lessonData, dialogues };
}
