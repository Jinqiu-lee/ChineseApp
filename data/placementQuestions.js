// ── Placement Questions ───────────────────────────────────────────
// type: "mc"     = multiple choice
//       "match"  = tap correct Chinese character (grid)
//       "pinyin" = choose correct pinyin for a character
//
// For MC questions with Chinese in the question text, add:
//   questionPinyin: "nǐ hǎo"   ← shown below the question
// For MC questions with Chinese options, add:
//   optionPinyin: { "妈妈": "māma", ... }

export const BASIC_QUESTIONS_YOUNG = [
    // YCT1 level — age <= 10
    {
      id: "b1", type: "mc",
      question: "What does 你好 mean?",
      questionPinyin: "nǐ hǎo",
      options: ["Goodbye", "Hello", "Thank you", "Sorry"],
      correct: "Hello",
    },
    {
      id: "b2", type: "match",
      question: "Tap the character that means 'I / Me'",
      options: ["他", "我", "你", "她"],
      correct: "我",
      hint: "wǒ",
    },
    {
      id: "b3", type: "mc",
      question: "What does 猫 mean?",
      questionPinyin: "māo",
      options: ["Dog", "Bird", "Cat", "Fish"],
      correct: "Cat",
    },
    {
      id: "b4", type: "match",
      question: "Tap the character for 'Big'",
      options: ["小", "多", "大", "好"],
      correct: "大",
      hint: "dà",
    },
    {
      id: "b5", type: "mc",
      question: "What number is 三?",
      questionPinyin: "sān",
      options: ["1", "2", "3", "4"],
      correct: "3",
    },
    // ── Pinyin question 1 ──
    {
      id: "b5p", type: "pinyin",
      question: "Which pinyin is correct for 你?",
      chineseWord: "你",
      options: ["wǒ", "nǐ", "tā", "nín"],
      correct: "nǐ",
    },
    {
      id: "b6", type: "match",
      question: "Tap the character that means 'Water'",
      options: ["火", "水", "山", "木"],
      correct: "水",
      hint: "shuǐ",
    },
    {
      id: "b7", type: "mc",
      question: "Which word means 'Mother'?",
      options: ["爸爸", "哥哥", "妈妈", "弟弟"],
      correct: "妈妈",
      optionPinyin: { "爸爸": "bàba", "哥哥": "gēge", "妈妈": "māma", "弟弟": "dìdi" },
    },
    {
      id: "b8", type: "mc",
      question: "What does 苹果 mean?",
      questionPinyin: "píngguǒ",
      options: ["Banana", "Orange", "Apple", "Grape"],
      correct: "Apple",
    },
    {
      id: "b9", type: "match",
      question: "Tap the character for 'Sun / Day'",
      options: ["月", "星", "日", "天"],
      correct: "日",
      hint: "rì",
    },
    // ── Pinyin question 2 ──
    {
      id: "b9p", type: "pinyin",
      question: "Which pinyin is correct for 猫?",
      chineseWord: "猫",
      options: ["gǒu", "niǎo", "māo", "yú"],
      correct: "māo",
    },
    {
      id: "b10", type: "mc",
      question: "What does 谢谢 mean?",
      questionPinyin: "xièxie",
      options: ["Please", "Sorry", "Hello", "Thank you"],
      correct: "Thank you",
    },
    {
      id: "b11", type: "match",
      question: "Tap the character that means 'Dog'",
      options: ["猫", "狗", "鸟", "鱼"],
      correct: "狗",
      hint: "gǒu",
    },
    {
      id: "b12", type: "mc",
      question: "What does 老师 mean?",
      questionPinyin: "lǎoshī",
      options: ["Student", "Doctor", "Teacher", "Friend"],
      correct: "Teacher",
    },
    // ── Pinyin question 3 ──
    {
      id: "b12p", type: "pinyin",
      question: "Which pinyin is correct for 水?",
      chineseWord: "水",
      options: ["huǒ", "shuǐ", "shān", "mù"],
      correct: "shuǐ",
    },
    {
      id: "b13", type: "match",
      question: "Tap the correct character for 'Good'",
      options: ["坏", "大", "好", "多"],
      correct: "好",
      hint: "hǎo",
    },
    {
      id: "b14", type: "mc",
      question: "Which word means 'Go to school'?",
      options: ["回家", "上学", "吃饭", "睡觉"],
      correct: "上学",
      optionPinyin: { "回家": "huíjiā", "上学": "shàngxué", "吃饭": "chīfàn", "睡觉": "shuìjiào" },
    },
    {
      id: "b15", type: "match",
      question: "Tap the character that means 'Eat'",
      options: ["喝", "吃", "看", "说"],
      correct: "吃",
      hint: "chī",
    },
  ];
  
  export const BASIC_QUESTIONS_ADULT = [
    // HSK1 level — age > 10
    {
      id: "a1", type: "mc",
      question: "What does 你好 mean?",
      questionPinyin: "nǐ hǎo",
      options: ["Goodbye", "Hello", "Thank you", "Sorry"],
      correct: "Hello",
    },
    {
      id: "a2", type: "match",
      question: "Tap the character that means 'I / Me'",
      options: ["他", "我", "你", "她"],
      correct: "我",
      hint: "wǒ",
    },
    {
      id: "a3", type: "mc",
      question: "What does 医院 mean?",
      questionPinyin: "yīyuàn",
      options: ["School", "Restaurant", "Hospital", "Hotel"],
      correct: "Hospital",
    },
    {
      id: "a4", type: "match",
      question: "Tap the character for 'Buy'",
      options: ["卖", "买", "用", "给"],
      correct: "买",
      hint: "mǎi",
    },
    {
      id: "a5", type: "mc",
      question: "What does 现在几点？mean?",
      questionPinyin: "xiànzài jǐ diǎn?",
      options: ["Where are you?", "What time is it?", "How much?", "How are you?"],
      correct: "What time is it?",
    },
    // ── Pinyin question 1 ──
    {
      id: "a5p", type: "pinyin",
      question: "Which pinyin is correct for 你?",
      chineseWord: "你",
      options: ["wǒ", "nǐ", "tā", "nín"],
      correct: "nǐ",
    },
    {
      id: "a6", type: "match",
      question: "Tap the character for 'Today'",
      options: ["明天", "昨天", "今天", "每天"],
      correct: "今天",
      hint: "jīntiān",
    },
    {
      id: "a7", type: "mc",
      question: "Which sentence means 'I like eating apples'?",
      options: ["我喜欢喝水", "我喜欢吃苹果", "我不喜欢苹果", "他吃苹果"],
      correct: "我喜欢吃苹果",
      optionPinyin: {
        "我喜欢喝水": "wǒ xǐhuān hē shuǐ",
        "我喜欢吃苹果": "wǒ xǐhuān chī píngguǒ",
        "我不喜欢苹果": "wǒ bù xǐhuān píngguǒ",
        "他吃苹果": "tā chī píngguǒ",
      },
    },
    {
      id: "a8", type: "mc",
      question: "What does 多少钱 mean?",
      questionPinyin: "duōshao qián",
      options: ["How many people?", "How much money?", "What time?", "Where is it?"],
      correct: "How much money?",
    },
    {
      id: "a9", type: "match",
      question: "Tap the character that means 'Big'",
      options: ["小", "多", "大", "好"],
      correct: "大",
      hint: "dà",
    },
    // ── Pinyin question 2 ──
    {
      id: "a9p", type: "pinyin",
      question: "Which pinyin is correct for 谢谢?",
      chineseWord: "谢谢",
      options: ["xièxie", "nǐhǎo", "zàijiàn", "duìbuqǐ"],
      correct: "xièxie",
    },
    {
      id: "a10", type: "mc",
      question: "What does 我不会说中文 mean?",
      questionPinyin: "wǒ bù huì shuō zhōngwén",
      options: ["I can speak Chinese", "I don't speak Chinese", "I want to learn Chinese", "Do you speak Chinese?"],
      correct: "I don't speak Chinese",
    },
    {
      id: "a11", type: "match",
      question: "Tap the correct character for 'Year'",
      options: ["月", "日", "年", "周"],
      correct: "年",
      hint: "nián",
    },
    {
      id: "a12", type: "mc",
      question: "What does 左边 mean?",
      questionPinyin: "zuǒbiān",
      options: ["Right side", "Left side", "Front", "Behind"],
      correct: "Left side",
    },
    // ── Pinyin question 3 ──
    {
      id: "a12p", type: "pinyin",
      question: "Which pinyin is correct for 老师?",
      chineseWord: "老师",
      options: ["xuéshēng", "lǎoshī", "péngyou", "jiārén"],
      correct: "lǎoshī",
    },
    {
      id: "a13", type: "match",
      question: "Tap the character for 'Good'",
      options: ["坏", "大", "好", "多"],
      correct: "好",
      hint: "hǎo",
    },
    {
      id: "a14", type: "mc",
      question: "Which word means 'Airplane'?",
      options: ["火车", "汽车", "飞机", "地铁"],
      correct: "飞机",
      optionPinyin: { "火车": "huǒchē", "汽车": "qìchē", "飞机": "fēijī", "地铁": "dìtiě" },
    },
    {
      id: "a15", type: "match",
      question: "Tap the character that means 'Water'",
      options: ["火", "水", "山", "木"],
      correct: "水",
      hint: "shuǐ",
    },
  ];
  
  export const ADVANCED_QUESTIONS = [
    // YCT2-3 / HSK2 level
    {
      id: "adv1", type: "mc",
      question: "What does 虽然…但是… mean?",
      questionPinyin: "suīrán… dànshì…",
      options: ["Because…therefore…", "Although…but…", "If…then…", "First…then…"],
      correct: "Although…but…",
    },
    {
      id: "adv2", type: "match",
      question: "Tap the character for 'Understand'",
      options: ["知道", "明白", "认识", "学习"],
      correct: "明白",
      hint: "míngbai",
    },
    {
      id: "adv3", type: "mc",
      question: "What does 把书放在桌子上 mean?",
      questionPinyin: "bǎ shū fàng zài zhuōzi shàng",
      options: ["Take the book off the table", "Put the book on the table", "Read the book on the table", "Buy a book for the table"],
      correct: "Put the book on the table",
    },
    {
      id: "adv4", type: "match",
      question: "Tap the character for 'Busy'",
      options: ["累", "忙", "快", "慢"],
      correct: "忙",
      hint: "máng",
    },
    {
      id: "adv5", type: "mc",
      question: "Complete: 他比我______。(He is taller than me)",
      options: ["高一点", "更高", "高得多", "All of the above"],
      correct: "All of the above",
      optionPinyin: { "高一点": "gāo yīdiǎn", "更高": "gèng gāo", "高得多": "gāo de duō" },
    },
    {
      id: "adv6", type: "mc",
      question: "What does 环境 mean?",
      questionPinyin: "huánjìng",
      options: ["Weather", "Environment", "Country", "Culture"],
      correct: "Environment",
    },
    {
      id: "adv7", type: "match",
      question: "Tap the character for 'Already'",
      options: ["还", "都", "已经", "就"],
      correct: "已经",
      hint: "yǐjīng",
    },
    {
      id: "adv8", type: "mc",
      question: "Which sentence uses 把 correctly?",
      options: ["我把吃了饭", "他把书看了", "我把书放好了", "她把去了学校"],
      correct: "我把书放好了",
      optionPinyin: {
        "我把吃了饭": "wǒ bǎ chī le fàn",
        "他把书看了": "tā bǎ shū kàn le",
        "我把书放好了": "wǒ bǎ shū fàng hǎo le",
        "她把去了学校": "tā bǎ qù le xuéxiào",
      },
    },
    {
      id: "adv9", type: "match",
      question: "Tap the character for 'Interesting'",
      options: ["有趣", "无聊", "好玩", "快乐"],
      correct: "有趣",
      hint: "yǒuqù",
    },
    {
      id: "adv10", type: "mc",
      question: "What does 越来越 mean?",
      questionPinyin: "yuè lái yuè",
      options: ["More and more", "Less and less", "Back and forth", "Here and there"],
      correct: "More and more",
    },
    {
      id: "adv11", type: "match",
      question: "Tap the character for 'Introduce'",
      options: ["介绍", "认识", "见面", "问好"],
      correct: "介绍",
      hint: "jièshào",
    },
    {
      id: "adv12", type: "mc",
      question: "What does 随便 mean?",
      questionPinyin: "suíbiàn",
      options: ["Be careful", "Whatever / Casual", "Hurry up", "Of course"],
      correct: "Whatever / Casual",
    },
    {
      id: "adv13", type: "match",
      question: "Tap the correct character for 'Experience'",
      options: ["经验", "经历", "体验", "感受"],
      correct: "经历",
      hint: "jīnglì",
    },
    {
      id: "adv14", type: "mc",
      question: "What does 不得不 mean?",
      questionPinyin: "bù dé bù",
      options: ["Cannot", "Have no choice but to", "Prefer not to", "Should not"],
      correct: "Have no choice but to",
    },
    {
      id: "adv15", type: "match",
      question: "Tap the character for 'Develop'",
      options: ["发展", "发现", "发生", "发明"],
      correct: "发展",
      hint: "fāzhǎn",
    },
  ];
  
  // ── Placement result logic ────────────────────────────────────────
  export function getPlacementResult(basicScore, basicTotal, advScore, advTotal) {
    const basicPct = basicScore / basicTotal;

    if (basicPct < 0.5) {
      return {
        level: "Beginner", levelChinese: "初级", badge: "🌱", color: "#00D2D3",
        description: "You're just getting started — great!",
        recommendedLevel: "hsk1",
        recommendedLabel: "Level 1 – Beginner",
        startFrom: "beginning",
        message: "We recommend starting with Level 1 from Lesson 1.",
      };
    }
    if (basicPct < 0.9) {
      return {
        level: "Beginner", levelChinese: "初级", badge: "🌱", color: "#00D2D3",
        description: "You know some basics — let's build on that!",
        recommendedLevel: "hsk1",
        recommendedLabel: "Level 1 – Beginner",
        startFrom: "middle",
        message: "You know some basics! Start Level 1 from Lesson 3.",
      };
    }
    if (advScore !== null) {
      const advPct = advScore / advTotal;
      if (advPct <= 0.8) {
        return {
          level: "Explorer", levelChinese: "基础", badge: "🚶", color: "#54A0FF",
          description: "Solid foundations — time for a challenge!",
          recommendedLevel: "hsk2",
          recommendedLabel: "Level 2 – Explorer",
          startFrom: "beginning",
          message: "Great job! We recommend starting Level 2 – Explorer.",
        };
      }
      return {
        level: "Conversation Builder", levelChinese: "中级", badge: "🗣", color: "#1DD1A1",
        description: "Impressive! You have strong Chinese skills.",
        recommendedLevel: "hsk3",
        recommendedLabel: "Level 3 – Conversation Builder",
        startFrom: "beginning",
        message: "Excellent! We recommend starting Level 3 – Conversation Builder.",
      };
    }
    return null;
  }