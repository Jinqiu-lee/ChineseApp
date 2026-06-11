"""
Generate mini_exercises for HSK4 Level 4 lessons 1-5.
Same pattern as HSK3 scripts: 3 per vocab word (non-phrase), 3 per grammar point.
Does NOT modify any other content in the JSON files.
"""
import json, random, copy, os

# ── helpers (identical to HSK3 scripts) ──────────────────────────────────────

def shuffled4(correct_val, distractors):
    pool = distractors[:3]
    pos = random.randint(0, 3)
    return pool[:pos] + [correct_val] + pool[pos:]

def mcq_english(word, pool):
    others = [w for w in pool if w['chinese'] != word['chinese']]
    random.shuffle(others)
    distractors = others[:3]
    opts = shuffled4(word['english'], [d['english'] for d in distractors])
    eng_to_py = {word['english']: word['pinyin']}
    for d in distractors:
        eng_to_py[d['english']] = d['pinyin']
    return {
        "type": "multiple_choice",
        "question": f"What does {word['chinese']} mean?",
        "correct": word['english'],
        "options": opts,
        "option_pinyin": [eng_to_py.get(o, '') for o in opts]
    }

def mcq_chinese(word, pool):
    others = [w for w in pool if w['chinese'] != word['chinese']]
    random.shuffle(others)
    distractors = others[:3]
    opts = shuffled4(word['chinese'], [d['chinese'] for d in distractors])
    py_map = {word['chinese']: word['pinyin']}
    for d in distractors:
        py_map[d['chinese']] = d['pinyin']
    return {
        "type": "multiple_choice",
        "question": f"Which word means '{word['english']}'?",
        "correct": word['chinese'],
        "options": opts,
        "option_pinyin": [py_map.get(o, '') for o in opts]
    }

def fill_blank(word, pool, sentence_zh, sentence_en):
    others = [w for w in pool if w['chinese'] != word['chinese']]
    random.shuffle(others)
    distractors = others[:3]
    opts = shuffled4(word['chinese'], [d['chinese'] for d in distractors])
    py_map = {word['chinese']: word['pinyin']}
    for d in distractors:
        py_map[d['chinese']] = d['pinyin']
    return {
        "type": "fill_blank",
        "question": f"Fill in: {word['english']}",
        "correct": word['chinese'],
        "options": opts,
        "option_pinyin": [py_map.get(o, '') for o in opts],
        "question_chinese": sentence_zh,
        "question_pinyin": sentence_zh,
        "question_english": sentence_en
    }

def gen_vocab_mini(word, pool):
    zh = word['chinese']
    sent_zh, sent_en = SENTENCES.get(zh, ('___。', zh))
    return [
        mcq_english(word, pool),
        fill_blank(word, pool, sent_zh, sent_en),
        mcq_chinese(word, pool),
    ]

# ── example sentences per word ────────────────────────────────────────────────

SENTENCES = {
    # L1 — Love & Romance
    '爱情': ('他们的___非常真实。', 'Their romantic love is very real.'),
    '感情': ('他们两个人___很好。', 'The two of them have a very strong bond.'),
    '感动': ('他的话让我很___。', 'His words moved me deeply.'),
    '感觉': ('我___很幸福。', 'I feel very happy.'),
    '浪漫': ('他为她准备了一个___的约会。', 'He prepared a romantic date for her.'),
    '幸福': ('家人在一起真___。', 'Being with family is truly happiness.'),
    '邀请': ('他___她去看电影。', 'He invited her to watch a movie.'),
    '幽默': ('他非常___，总是让大家开心。', 'He is very humorous and always makes everyone happy.'),
    '约会': ('他们今晚有个___。', 'They have a date tonight.'),
    '骄傲': ('他对自己的孩子感到___。', 'He feels proud of his children.'),
    '表示': ('她用微笑___感谢。', 'She used a smile to express gratitude.'),
    '抱': ('她___着小猫，很开心。', 'She held the kitten in her arms, very happy.'),

    # L2 — Friendship
    '诚实': ('做人要___。', 'Be honest in life.'),
    '信心': ('我对你有___。', 'I have confidence in you.'),
    '联系': ('我们要保持___。', 'We must keep in touch.'),
    '互相': ('朋友应该___帮助。', 'Friends should help each other.'),
    '共同': ('我们有___的爱好。', 'We have common hobbies.'),
    '支持': ('谢谢你___我。', 'Thank you for supporting me.'),
    '鼓励': ('老师___我们要努力。', 'The teacher encouraged us to work hard.'),
    '友谊': ('我们的___很珍贵。', 'Our friendship is very precious.'),
    '友好': ('她对每个人都很___。', 'She is friendly to everyone.'),
    '误会': ('我们之间有个___。', 'There is a misunderstanding between us.'),
    '道歉': ('他向她___了。', 'He apologized to her.'),
    '抱歉': ('我很___，我来晚了。', "I'm sorry, I came late."),

    # L3 — Communication
    '交流': ('我们需要多___。', 'We need to communicate more.'),
    '对话': ('他们进行了友好的___。', 'They had a friendly dialogue.'),
    '解释': ('他___了原因。', 'He explained the reason.'),
    '礼貌': ('要学会___地说话。', 'Learn to speak politely.'),
    '表扬': ('老师___了她的作文。', "The teacher praised her essay."),
    '批评': ('他___我做错了。', 'He criticized me for making a mistake.'),
    '词语': ('你学了多少个汉语___？', 'How many Chinese words have you learned?'),
    '说明': ('请___一下使用方法。', 'Please explain how to use it.'),
    '信息': ('他发了一条___给我。', 'He sent me a message.'),
    '翻译': ('你能帮我___这句话吗？', 'Can you help me translate this sentence?'),
    '详细': ('他解释得很___。', 'He explained it in great detail.'),
    '直接': ('他说话很___。', 'He speaks very directly.'),

    # L4 — Work & Career
    '职业': ('你的___是什么？', 'What is your occupation?'),
    '技术': ('他有很好的___。', 'He has very good technical skills.'),
    '经历': ('这是一次宝贵的___。', 'This is a valuable experience.'),
    '经验': ('他有丰富的工作___。', 'He has rich work experience.'),
    '负责': ('他___这个项目。', 'He is responsible for this project.'),
    '管理': ('她___一个大团队。', 'She manages a large team.'),
    '成功': ('他的努力让他___了。', 'His hard work led to his success.'),
    '成为': ('她想___一名医生。', 'She wants to become a doctor.'),
    '教授': ('他是一位___。', 'He is a professor.'),
    '记者': ('她是一名___。', 'She is a journalist.'),
    '博士': ('他拿到了___学位。', 'He obtained his doctorate degree.'),
    '招聘': ('这家公司正在___新员工。', 'This company is hiring new employees.'),
    '应聘': ('她去___那个职位。', 'She went to apply for that position.'),
    '背景': ('他有很好的教育___。', 'He has a good educational background.'),
    '项目': ('这个___非常重要。', 'This project is very important.'),

    # L5 — Money & Finance
    '工资': ('他的___每月有五千元。', 'His salary is 5,000 yuan per month.'),
    '收入': ('她的___比上个月多了。', 'Her income is more than last month.'),
    '付款': ('请在这里___。', 'Please pay here.'),
    '富': ('他家很___。', 'His family is very wealthy.'),
    '穷': ('他们家以前很___。', 'Their family used to be very poor.'),
    '赚': ('他努力工作来___钱。', 'He works hard to earn money.'),
    '存': ('他把钱___在银行里。', 'He saves money in the bank.'),
    '奖金': ('这个月他得到了___。', 'He received a bonus this month.'),
    '零钱': ('我没有___。', "I don't have any change."),
    '价格': ('这件衣服的___太高了。', 'The price of this clothing is too high.'),
    '估计': ('我___要花三个小时。', 'I estimate it will take three hours.'),
    '浪费': ('不要___钱。', "Don't waste money."),
}

# ── handcrafted grammar mini exercises ───────────────────────────────────────

GRAMMAR_MINI = {

    # ── L1 ────────────────────────────────────────────────────────────────────
    'hsk4_l1_g1': [  # 不仅...而且... — Not only...but also...
        {
            "type": "multiple_choice",
            "question": "不仅...而且 expresses...",
            "correct": "Not only A, but also B (B often adds something stronger)",
            "options": [
                "Not only A, but also B (B often adds something stronger)",
                "Either A or B (a choice between two things)",
                "A, but not B (a contradiction)",
                "Neither A nor B (complete negation)"
            ],
            "option_pinyin": ["bù jǐn...ér qiě...", "A huò B", "A dàn fēi B", "jì bù...yě bù..."]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: He is not only humorous, but also very considerate.",
            "correct": "不仅",
            "options": ["不仅", "虽然", "因为", "如果"],
            "option_pinyin": ["bù jǐn", "suī rán", "yīn wèi", "rú guǒ"],
            "question_chinese": "他___幽默，而且非常体贴。",
            "question_pinyin": "他___幽默，而且非常体贴。",
            "question_english": "He is not only humorous, but also very considerate."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 不仅...而且?",
            "correct": "她不仅会唱歌，而且会跳舞。",
            "options": [
                "她不仅会唱歌，而且会跳舞。",
                "她而且不仅会唱歌，会跳舞。",
                "不仅会唱歌，她而且跳舞。",
                "她会唱歌，不仅而且跳舞。"
            ],
            "option_pinyin": [
                "tā bù jǐn huì chàng gē ér qiě huì tiào wǔ",
                "tā ér qiě bù jǐn huì chàng gē huì tiào wǔ",
                "bù jǐn huì chàng gē tā ér qiě tiào wǔ",
                "tā huì chàng gē bù jǐn ér qiě tiào wǔ"
            ]
        },
    ],

    'hsk4_l1_g2': [  # 为了 — In order to / For the sake of
        {
            "type": "multiple_choice",
            "question": "为了 placed before a verb/clause expresses...",
            "correct": "Purpose or motivation: 'in order to / for the sake of'",
            "options": [
                "Purpose or motivation: 'in order to / for the sake of'",
                "Reason for a past event: 'because of'",
                "A condition: 'if only'",
                "A concession: 'even though'"
            ],
            "option_pinyin": ["wèi le + V", "yīn wèi", "rú guǒ", "jǐn guǎn"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: In order to move her, he prepared a romantic date.",
            "correct": "为了",
            "options": ["为了", "因为", "虽然", "只要"],
            "option_pinyin": ["wèi le", "yīn wèi", "suī rán", "zhǐ yào"],
            "question_chinese": "___让她感动，他准备了一个浪漫的约会。",
            "question_pinyin": "___让她感动，他准备了一个浪漫的约会。",
            "question_english": "In order to move her, he prepared a romantic date."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 为了?",
            "correct": "为了学好汉语，他每天练习两个小时。",
            "options": [
                "为了学好汉语，他每天练习两个小时。",
                "他每天练习两个小时为了。",
                "他为了，学好汉语每天练习。",
                "为了他学好汉语，每天练习两个小时。"
            ],
            "option_pinyin": [
                "wèi le xué hǎo hàn yǔ tā měi tiān liàn xí liǎng gè xiǎo shí",
                "tā měi tiān liàn xí liǎng gè xiǎo shí wèi le",
                "tā wèi le xué hǎo hàn yǔ měi tiān liàn xí",
                "wèi le tā xué hǎo hàn yǔ měi tiān liàn xí"
            ]
        },
    ],

    'hsk4_l1_g3': [  # 却 — But / However (indicating contrast)
        {
            "type": "multiple_choice",
            "question": "却 expresses...",
            "correct": "An unexpected contrast within a sentence (but / yet — placed before the verb)",
            "options": [
                "An unexpected contrast within a sentence (but / yet — placed before the verb)",
                "A reason or cause (because)",
                "A condition (if)",
                "A sequence of events (and then)"
            ],
            "option_pinyin": ["què", "yīn wèi", "rú guǒ", "rán hòu"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: He is very arrogant, but very gentle toward her.",
            "correct": "却",
            "options": ["却", "而且", "因为", "所以"],
            "option_pinyin": ["què", "ér qiě", "yīn wèi", "suǒ yǐ"],
            "question_chinese": "他很骄傲，___对她非常温柔。",
            "question_pinyin": "他很骄傲，___对她非常温柔。",
            "question_english": "He is very arrogant, but very gentle toward her."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 却?",
            "correct": "她很努力，却没有通过考试。",
            "options": [
                "她很努力，却没有通过考试。",
                "她却很努力没有通过考试。",
                "却她很努力，没有通过考试。",
                "她很努力没有，却通过考试。"
            ],
            "option_pinyin": [
                "tā hěn nǔ lì què méi yǒu tōng guò kǎo shì",
                "tā què hěn nǔ lì méi yǒu tōng guò kǎo shì",
                "què tā hěn nǔ lì méi yǒu tōng guò kǎo shì",
                "tā hěn nǔ lì méi yǒu què tōng guò kǎo shì"
            ]
        },
    ],

    # ── L2 ────────────────────────────────────────────────────────────────────
    'hsk4_l2_g1': [  # 却 — contrast (second lesson; different exercises)
        {
            "type": "multiple_choice",
            "question": "却 differs from 但是/可是 in that...",
            "correct": "却 is an adverb placed before the verb; 但是/可是 are conjunctions linking two clauses",
            "options": [
                "却 is an adverb placed before the verb; 但是/可是 are conjunctions linking two clauses",
                "却 and 但是 are completely interchangeable",
                "却 must start the sentence; 但是 must end it",
                "却 is only used in questions; 但是 in statements"
            ],
            "option_pinyin": ["què (adv)", "jiāo huàn", "kāi tóu / jié wěi", "wèn jù / chén shù"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: He said he would come, but he didn't show up.",
            "correct": "却",
            "options": ["却", "就", "也", "还"],
            "option_pinyin": ["què", "jiù", "yě", "hái"],
            "question_chinese": "他说要来，___没有出现。",
            "question_pinyin": "他说要来，___没有出现。",
            "question_english": "He said he would come, but he didn't show up."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 却?",
            "correct": "他学了很多年，却还是不流利。",
            "options": [
                "他学了很多年，却还是不流利。",
                "却他学了很多年，还是不流利。",
                "他却了学很多年，还是不流利。",
                "他学了很多年，还是不流利却。"
            ],
            "option_pinyin": [
                "tā xué le hěn duō nián què hái shì bù liú lì",
                "què tā xué le hěn duō nián hái shì bù liú lì",
                "tā què le xué hěn duō nián hái shì bù liú lì",
                "tā xué le hěn duō nián hái shì bù liú lì què"
            ]
        },
    ],

    'hsk4_l2_g2': [  # 从来 — Never / Always (habitual negation or affirmation)
        {
            "type": "multiple_choice",
            "question": "从来 is most commonly paired with...",
            "correct": "从来不 (never, habitual) or 从来没有 (have never, experiential)",
            "options": [
                "从来不 (never, habitual) or 从来没有 (have never, experiential)",
                "从来很 (always very) or 从来太 (always too)",
                "从来以后 (after always) or 从来以前 (before always)",
                "从来什么 (what always) or 从来哪里 (where always)"
            ],
            "option_pinyin": ["cóng lái bù / cóng lái méi yǒu", "cóng lái hěn", "cóng lái yǐ hòu", "cóng lái shén me"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: He never lies.",
            "correct": "从来",
            "options": ["从来", "一直", "经常", "偶尔"],
            "option_pinyin": ["cóng lái", "yī zhí", "jīng cháng", "ǒu ěr"],
            "question_chinese": "他___不说谎。",
            "question_pinyin": "他___不说谎。",
            "question_english": "He never lies."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 从来?",
            "correct": "我从来没有去过那里。",
            "options": [
                "我从来没有去过那里。",
                "我没有从来去过那里。",
                "从来我去过没有那里。",
                "我去过那里从来没有。"
            ],
            "option_pinyin": [
                "wǒ cóng lái méi yǒu qù guò nà lǐ",
                "wǒ méi yǒu cóng lái qù guò nà lǐ",
                "cóng lái wǒ qù guò méi yǒu nà lǐ",
                "wǒ qù guò nà lǐ cóng lái méi yǒu"
            ]
        },
    ],

    'hsk4_l2_g3': [  # 互相 — Each other / Mutually
        {
            "type": "multiple_choice",
            "question": "互相 is placed...",
            "correct": "Before the verb, showing the action is performed by both parties toward each other",
            "options": [
                "Before the verb, showing the action is performed by both parties toward each other",
                "After the verb, as a complement",
                "At the end of the sentence as a particle",
                "Before the subject, as a topic marker"
            ],
            "option_pinyin": ["hù xiāng + V", "V + hù xiāng", "jù mò cí", "zhǔ tí biāo jì"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Friends should help each other.",
            "correct": "互相",
            "options": ["互相", "一起", "共同", "彼此"],
            "option_pinyin": ["hù xiāng", "yī qǐ", "gòng tóng", "bǐ cǐ"],
            "question_chinese": "朋友之间应该___帮助。",
            "question_pinyin": "朋友之间应该___帮助。",
            "question_english": "Friends should help each other."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 互相?",
            "correct": "他们互相学习，共同进步。",
            "options": [
                "他们互相学习，共同进步。",
                "他们学习互相，共同进步。",
                "互相他们学习，共同进步。",
                "他们共同互相，进步学习。"
            ],
            "option_pinyin": [
                "tā men hù xiāng xué xí gòng tóng jìn bù",
                "tā men xué xí hù xiāng gòng tóng jìn bù",
                "hù xiāng tā men xué xí gòng tóng jìn bù",
                "tā men gòng tóng hù xiāng jìn bù xué xí"
            ]
        },
    ],

    # ── L3 ────────────────────────────────────────────────────────────────────
    'hsk4_l3_g1': [  # 对于 — Regarding / With regard to
        {
            "type": "multiple_choice",
            "question": "对于 introduces...",
            "correct": "The topic or subject of concern: 'regarding X' or 'as for X'",
            "options": [
                "The topic or subject of concern: 'regarding X' or 'as for X'",
                "The agent performing an action: 'by X'",
                "The destination of movement: 'toward X'",
                "The time of an event: 'at the time of X'"
            ],
            "option_pinyin": ["duì yú + tí mù", "yóu + zhǔ dòng zhě", "xiàng + mù dì dì", "zài + shí jiān"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Regarding this issue, he has a different view.",
            "correct": "对于",
            "options": ["对于", "关于", "由于", "因为"],
            "option_pinyin": ["duì yú", "guān yú", "yóu yú", "yīn wèi"],
            "question_chinese": "___这个问题，他有不同的看法。",
            "question_pinyin": "___这个问题，他有不同的看法。",
            "question_english": "Regarding this issue, he has a different view."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 对于?",
            "correct": "对于这次考试，我没有把握。",
            "options": [
                "对于这次考试，我没有把握。",
                "我对于没有把握，这次考试。",
                "这次考试对于，我没有把握。",
                "我没有对于把握，这次考试。"
            ],
            "option_pinyin": [
                "duì yú zhè cì kǎo shì wǒ méi yǒu bǎ wò",
                "wǒ duì yú méi yǒu bǎ wò zhè cì kǎo shì",
                "zhè cì kǎo shì duì yú wǒ méi yǒu bǎ wò",
                "wǒ méi yǒu duì yú bǎ wò zhè cì kǎo shì"
            ]
        },
    ],

    'hsk4_l3_g2': [  # 表示 as a discourse marker
        {
            "type": "multiple_choice",
            "question": "As a discourse marker, 表示 means...",
            "correct": "To express / indicate an attitude, intention, or meaning (formally)",
            "options": [
                "To express / indicate an attitude, intention, or meaning (formally)",
                "To describe / narrate a past event",
                "To ask a question politely",
                "To give a command or instruction"
            ],
            "option_pinyin": ["biǎo shì tài dù", "miáo shù shì jiàn", "tí wèn", "xià mìng lìng"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: He nodded to indicate agreement.",
            "correct": "表示",
            "options": ["表示", "说明", "解释", "提醒"],
            "option_pinyin": ["biǎo shì", "shuō míng", "jiě shì", "tí xǐng"],
            "question_chinese": "他点头___同意。",
            "question_pinyin": "他点头___同意。",
            "question_english": "He nodded to indicate agreement."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 表示?",
            "correct": "她的表情表示她并不快乐。",
            "options": [
                "她的表情表示她并不快乐。",
                "她的表情她并不快乐表示。",
                "表示她的表情，她并不快乐。",
                "她并不快乐，表示她的表情。"
            ],
            "option_pinyin": [
                "tā de biǎo qíng biǎo shì tā bìng bù kuài lè",
                "tā de biǎo qíng tā bìng bù kuài lè biǎo shì",
                "biǎo shì tā de biǎo qíng tā bìng bù kuài lè",
                "tā bìng bù kuài lè biǎo shì tā de biǎo qíng"
            ]
        },
    ],

    'hsk4_l3_g3': [  # 是否 — Whether or not
        {
            "type": "multiple_choice",
            "question": "是否 is used to...",
            "correct": "Express uncertainty or enquire/state whether something is the case (formal register)",
            "options": [
                "Express uncertainty or enquire/state whether something is the case (formal register)",
                "Express a strong agreement with something",
                "Describe the manner of an action",
                "Indicate the sequence of two events"
            ],
            "option_pinyin": ["shì fǒu", "biǎo shì tóng yì", "miáo shù fāng shì", "shùn xù"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: I don't know whether he will come or not.",
            "correct": "是否",
            "options": ["是否", "是不是", "会不会", "有没有"],
            "option_pinyin": ["shì fǒu", "shì bu shì", "huì bu huì", "yǒu méi yǒu"],
            "question_chinese": "我不知道他___会来。",
            "question_pinyin": "我不知道他___会来。",
            "question_english": "I don't know whether he will come or not."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 是否?",
            "correct": "请说明是否同意这个方案。",
            "options": [
                "请说明是否同意这个方案。",
                "请说明这个方案是否同意。",
                "是否请说明同意这个方案。",
                "请是否说明同意这个方案。"
            ],
            "option_pinyin": [
                "qǐng shuō míng shì fǒu tóng yì zhè gè fāng àn",
                "qǐng shuō míng zhè gè fāng àn shì fǒu tóng yì",
                "shì fǒu qǐng shuō míng tóng yì zhè gè fāng àn",
                "qǐng shì fǒu shuō míng tóng yì zhè gè fāng àn"
            ]
        },
    ],

    # ── L4 ────────────────────────────────────────────────────────────────────
    'hsk4_l4_g1': [  # 通过 — Through / By means of
        {
            "type": "multiple_choice",
            "question": "通过 + N/VP means...",
            "correct": "Through X / By means of X (a method, channel, or process)",
            "options": [
                "Through X / By means of X (a method, channel, or process)",
                "Because of X (a reason or cause)",
                "Toward X (a direction or destination)",
                "Despite X (a concession)"
            ],
            "option_pinyin": ["tōng guò + fāng fǎ", "yīn wèi + yuán yīn", "xiàng + mù biāo", "jǐn guǎn + ràng bù"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: He improved his Chinese level through practice.",
            "correct": "通过",
            "options": ["通过", "经过", "经历", "为了"],
            "option_pinyin": ["tōng guò", "jīng guò", "jīng lì", "wèi le"],
            "question_chinese": "他___练习，提高了汉语水平。",
            "question_pinyin": "他___练习，提高了汉语水平。",
            "question_english": "He improved his Chinese level through practice."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 通过?",
            "correct": "通过这次经历，他学到了很多。",
            "options": [
                "通过这次经历，他学到了很多。",
                "他通过了，这次经历学到了很多。",
                "这次经历通过，他学到了很多。",
                "他学到了很多，这次经历通过。"
            ],
            "option_pinyin": [
                "tōng guò zhè cì jīng lì tā xué dào le hěn duō",
                "tā tōng guò le zhè cì jīng lì xué dào le hěn duō",
                "zhè cì jīng lì tōng guò tā xué dào le hěn duō",
                "tā xué dào le hěn duō zhè cì jīng lì tōng guò"
            ]
        },
    ],

    'hsk4_l4_g2': [  # 继续 — To continue (aspect usage)
        {
            "type": "multiple_choice",
            "question": "继续 placed before a verb means...",
            "correct": "To continue doing something (the action was paused or interrupted)",
            "options": [
                "To continue doing something (the action was paused or interrupted)",
                "To start doing something for the first time",
                "To stop doing something",
                "To finish doing something completely"
            ],
            "option_pinyin": ["jì xù + V", "kāi shǐ + V", "tíng zhǐ + V", "wán chéng + V"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Please continue to work hard.",
            "correct": "继续",
            "options": ["继续", "开始", "停止", "完成"],
            "option_pinyin": ["jì xù", "kāi shǐ", "tíng zhǐ", "wán chéng"],
            "question_chinese": "请___努力工作。",
            "question_pinyin": "请___努力工作。",
            "question_english": "Please continue to work hard."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 继续?",
            "correct": "他们继续讨论，没有停下来。",
            "options": [
                "他们继续讨论，没有停下来。",
                "他们讨论继续，没有停下来。",
                "继续他们，讨论没有停下来。",
                "他们没有停下来，讨论继续了。"
            ],
            "option_pinyin": [
                "tā men jì xù tǎo lùn méi yǒu tíng xià lái",
                "tā men tǎo lùn jì xù méi yǒu tíng xià lái",
                "jì xù tā men tǎo lùn méi yǒu tíng xià lái",
                "tā men méi yǒu tíng xià lái tǎo lùn jì xù le"
            ]
        },
    ],

    'hsk4_l4_g3': [  # 负责 — To be responsible for
        {
            "type": "multiple_choice",
            "question": "负责 + Object/VP means...",
            "correct": "To be responsible for / in charge of (a task or duty)",
            "options": [
                "To be responsible for / in charge of (a task or duty)",
                "To refuse to do something",
                "To be afraid of something",
                "To depend on someone else"
            ],
            "option_pinyin": ["fù zé + rèn wù", "jù jué", "hài pà", "yī lài"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: She is responsible for managing this team.",
            "correct": "负责",
            "options": ["负责", "管理", "决定", "安排"],
            "option_pinyin": ["fù zé", "guǎn lǐ", "jué dìng", "ān pái"],
            "question_chinese": "她___管理这个团队。",
            "question_pinyin": "她___管理这个团队。",
            "question_english": "She is responsible for managing this team."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 负责?",
            "correct": "他负责这个项目的所有工作。",
            "options": [
                "他负责这个项目的所有工作。",
                "他这个项目负责的所有工作。",
                "负责他这个项目，所有工作。",
                "这个项目他所有工作，负责。"
            ],
            "option_pinyin": [
                "tā fù zé zhè gè xiàng mù de suǒ yǒu gōng zuò",
                "tā zhè gè xiàng mù fù zé de suǒ yǒu gōng zuò",
                "fù zé tā zhè gè xiàng mù suǒ yǒu gōng zuò",
                "zhè gè xiàng mù tā suǒ yǒu gōng zuò fù zé"
            ]
        },
    ],

    # ── L5 ────────────────────────────────────────────────────────────────────
    'hsk4_l5_g1': [  # 为了 — In order to (different exercises from L1)
        {
            "type": "multiple_choice",
            "question": "为了 + VP expresses the _____ of an action.",
            "correct": "Purpose (why the action is done — the goal being aimed for)",
            "options": [
                "Purpose (why the action is done — the goal being aimed for)",
                "Result (what happened after the action)",
                "Duration (how long the action takes)",
                "Manner (how the action is performed)"
            ],
            "option_pinyin": ["mù de", "jié guǒ", "shí duàn", "fāng shì"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: In order to earn more money, he works overtime every day.",
            "correct": "为了",
            "options": ["为了", "因为", "既然", "否则"],
            "option_pinyin": ["wèi le", "yīn wèi", "jì rán", "fǒu zé"],
            "question_chinese": "他___赚更多钱，每天加班。",
            "question_pinyin": "他___赚更多钱，每天加班。",
            "question_english": "In order to earn more money, he works overtime every day."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 为了?",
            "correct": "为了节约，他不买零食。",
            "options": [
                "为了节约，他不买零食。",
                "他不买零食，为了节约。",
                "为了他节约，不买零食。",
                "他节约为了，不买零食。"
            ],
            "option_pinyin": [
                "wèi le jié yuē tā bù mǎi líng shí",
                "tā bù mǎi líng shí wèi le jié yuē",
                "wèi le tā jié yuē bù mǎi líng shí",
                "tā jié yuē wèi le bù mǎi líng shí"
            ]
        },
    ],

    'hsk4_l5_g2': [  # 既然 — Since / Given that
        {
            "type": "multiple_choice",
            "question": "既然 expresses...",
            "correct": "Since / Given that (accepting a known fact, then drawing a logical conclusion)",
            "options": [
                "Since / Given that (accepting a known fact, then drawing a logical conclusion)",
                "Even though / Although (a concession)",
                "As long as (a condition for a result)",
                "In case (a precaution against something happening)"
            ],
            "option_pinyin": ["jì rán...jiù...", "suī rán...dàn shì...", "zhǐ yào...jiù...", "wàn yī...jiù..."]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Since you've already decided, just stick with it.",
            "correct": "既然",
            "options": ["既然", "虽然", "只要", "如果"],
            "option_pinyin": ["jì rán", "suī rán", "zhǐ yào", "rú guǒ"],
            "question_chinese": "___你已经决定了，就坚持下去吧。",
            "question_pinyin": "___你已经决定了，就坚持下去吧。",
            "question_english": "Since you've already decided, just stick with it."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 既然?",
            "correct": "既然你不喜欢，就别去了。",
            "options": [
                "既然你不喜欢，就别去了。",
                "你既然不喜欢了，就别去。",
                "既然你，不喜欢就别去了。",
                "你不喜欢既然，别就去了。"
            ],
            "option_pinyin": [
                "jì rán nǐ bù xǐ huān jiù bié qù le",
                "nǐ jì rán bù xǐ huān le jiù bié qù",
                "jì rán nǐ bù xǐ huān jiù bié qù le",
                "nǐ bù xǐ huān jì rán bié jiù qù le"
            ]
        },
    ],

    'hsk4_l5_g3': [  # 否则 — Otherwise / Or else
        {
            "type": "multiple_choice",
            "question": "否则 means...",
            "correct": "Otherwise / Or else — introduces a negative consequence if the previous condition is not met",
            "options": [
                "Otherwise / Or else — introduces a negative consequence if the previous condition is not met",
                "Therefore — introduces a positive result",
                "However — introduces an unexpected contrast",
                "Moreover — adds an additional point"
            ],
            "option_pinyin": ["fǒu zé", "suǒ yǐ", "rán ér", "lìng wài"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: You must work hard; otherwise you will fail.",
            "correct": "否则",
            "options": ["否则", "所以", "而且", "虽然"],
            "option_pinyin": ["fǒu zé", "suǒ yǐ", "ér qiě", "suī rán"],
            "question_chinese": "你要努力，___会失败。",
            "question_pinyin": "你要努力，___会失败。",
            "question_english": "You must work hard; otherwise you will fail."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 否则?",
            "correct": "快点走，否则就来不及了。",
            "options": [
                "快点走，否则就来不及了。",
                "否则快点走，就来不及了。",
                "快点走就，否则来不及了。",
                "来不及了，快点走否则。"
            ],
            "option_pinyin": [
                "kuài diǎn zǒu fǒu zé jiù lái bu jí le",
                "fǒu zé kuài diǎn zǒu jiù lái bu jí le",
                "kuài diǎn zǒu jiù fǒu zé lái bu jí le",
                "lái bu jí le kuài diǎn zǒu fǒu zé"
            ]
        },
    ],
}

# ── grammar key mapping (lesson number → list of GRAMMAR_MINI keys) ──────────

GRAMMAR_KEYS = {
    1: ['hsk4_l1_g1', 'hsk4_l1_g2', 'hsk4_l1_g3'],
    2: ['hsk4_l2_g1', 'hsk4_l2_g2', 'hsk4_l2_g3'],
    3: ['hsk4_l3_g1', 'hsk4_l3_g2', 'hsk4_l3_g3'],
    4: ['hsk4_l4_g1', 'hsk4_l4_g2', 'hsk4_l4_g3'],
    5: ['hsk4_l5_g1', 'hsk4_l5_g2', 'hsk4_l5_g3'],
}

# ── main processing ───────────────────────────────────────────────────────────

random.seed(42)
DATA_DIR = os.path.dirname(os.path.abspath(__file__))

for lesson_num in range(1, 6):
    path = os.path.join(DATA_DIR, f'hsk4_lesson_{lesson_num}.json')
    with open(path, encoding='utf-8') as f:
        data = json.load(f)

    pool = [v for v in data['vocabulary'] if v.get('part_of_speech') != 'phrase']

    vocab_count = 0
    for word in data['vocabulary']:
        if word.get('part_of_speech') == 'phrase':
            continue
        word['mini_exercises'] = gen_vocab_mini(word, pool)
        vocab_count += 1

    gp_count = 0
    gps = data.get('grammar_points', [])
    keys = GRAMMAR_KEYS[lesson_num]
    for i, gp in enumerate(gps):
        key = keys[i] if i < len(keys) else None
        if key and key in GRAMMAR_MINI:
            gp['mini_exercises'] = copy.deepcopy(GRAMMAR_MINI[key])
            gp_count += 1

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f'L{lesson_num}: {vocab_count} vocab words, {gp_count} grammar points — done.')

print('\nAll done!')
