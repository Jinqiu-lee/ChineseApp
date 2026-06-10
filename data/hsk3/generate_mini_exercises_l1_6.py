"""
Generate mini_exercises for HSK3 lessons 1-6.
Adds 3 exercises per vocab word (non-phrase) and 3 per grammar point.
Does NOT modify any other content in the JSON files.
"""
import json, random, copy, os

# ── helpers ──────────────────────────────────────────────────────────────────

def shuffled4(correct_val, distractors):
    """Return list of 4 items with correct_val at a random position."""
    pool = distractors[:3]
    pos = random.randint(0, 3)
    result = pool[:pos] + [correct_val] + pool[pos:]
    return result

def mcq_english(word, pool):
    """MCQ: What does X mean? → options are English meanings."""
    others = [w for w in pool if w['chinese'] != word['chinese']]
    random.shuffle(others)
    distractors = others[:3]
    opts = shuffled4(word['english'], [d['english'] for d in distractors])
    # option_pinyin: pinyin of each option's Chinese equivalent
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

def mcq_chinese(word, pool, sentence=None):
    """MCQ: Which word means '...'? → options are Chinese words."""
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
    """Fill blank with Chinese word; sentence_zh has ___ placeholder."""
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

# ── example sentences per word ────────────────────────────────────────────────

SENTENCES = {
    # L1
    '打算': ('你___去哪里？', 'Where do you plan to go?'),
    '计划': ('今天的___是什么？', "What is today's plan?"),
    '顺便': ('请___帮我买点东西。', 'Please buy something for me while you\'re at it.'),
    '附近': ('超市就在___。', 'The supermarket is right nearby.'),
    '超市': ('我去___买东西。', "I'm going to the supermarket to buy things."),
    '社区': ('这个___很漂亮。', 'This community is very beautiful.'),
    '美发': ('我要去___剪头发。', "I'm going to the hairdresser to get a haircut."),
    '帮': ('请你___我一下。', 'Please help me.'),
    '趟': ('我去了一___超市。', 'I made one trip to the supermarket.'),
    '然后': ('我先去超市，___回家。', "I'll go to the supermarket first, then go home."),
    '啊': ('真好___！', "That's great!"),
    # L2
    '刮风': ('今天___了。', "It's windy today."),
    '风': ('外面___很大。', 'The wind outside is very strong.'),
    '差不多': ('我们___到了。', "We're almost there."),
    '大约': ('___有三十个人。', 'There are approximately thirty people.'),
    '左右': ('三点___见。', 'See you around 3 o\'clock.'),
    '总是': ('他___迟到。', "He's always late."),
    '习惯': ('我___早起。', "I'm in the habit of getting up early."),
    '愿意': ('你___帮我吗？', 'Are you willing to help me?'),
    '行': ('这样___吗？', 'Is this OK?'),
    '进来': ('请___！', 'Please come in!'),
    '出去': ('我要___一下。', "I'm going to go out for a bit."),
    '回来': ('你几点___？', 'What time will you come back?'),
    # L3
    '饮料': ('你要什么___？', 'What drink do you want?'),
    '放': ('把书___在桌子上。', 'Put the book on the table.'),
    '台': ('这___电脑是我的。', 'This computer is mine.'),
    '瓶': ('一___水。', 'A bottle of water.'),
    '果汁': ('我要喝___。', 'I want to drink fruit juice.'),
    '矿泉水': ('给我一瓶___。', 'Give me a bottle of mineral water.'),
    '就': ('银行___在你旁边。', 'The bank is right next to you.'),
    '旁边': ('银行在邮局___。', 'The bank is next to the post office.'),
    '右边': ('厕所在___。', 'The bathroom is on the right.'),
    '左边': ('图书馆在___。', 'The library is on the left.'),
    '够': ('钱___了吗？', 'Is the money enough?'),
    '着': ('门开___呢。', 'The door is open.'),
    # L4
    '刚才': ('___你去哪里了？', 'Where did you go just now?'),
    '聊天': ('我们___了很久。', 'We chatted for a long time.'),
    '邻居': ('他是我的___。', 'He is my neighbour.'),
    '借': ('我___了一本书。', 'I borrowed a book.'),
    '声音': ('音乐的___太大了。', 'The sound of the music is too loud.'),
    '音乐': ('我喜欢听___。', 'I like listening to music.'),
    '管': ('这不关你的事，别___！', "This is none of your business, don't interfere!"),
    '闲事': ('少管___！', 'Mind your own business!'),
    '关系': ('我们的___很好。', 'Our relationship is very good.'),
    '自己': ('你要照顾___。', 'You need to take care of yourself.'),
    '互相': ('我们要___帮助。', 'We should help each other.'),
    '而且': ('他聪明，___努力。', 'He is smart, and moreover diligent.'),
    # L5
    '越来越': ('天气___热了。', 'The weather is getting hotter and hotter.'),
    '最近': ('___你怎么样？', 'How have you been recently?'),
    '胖': ('我觉得自己___了。', "I feel like I've gotten fat."),
    '锻炼': ('我每天___一小时。', 'I exercise one hour every day.'),
    '坚持': ('你要___锻炼。', 'You need to keep exercising.'),
    '体重': ('我的___增加了。', 'My body weight has increased.'),
    '减肥': ('我想___。', 'I want to lose weight.'),
    '健康': ('运动对___有好处。', 'Exercise is good for health.'),
    '比较': ('这里的天气___好。', 'The weather here is relatively good.'),
    '这么': ('你___努力。', 'You work so hard.'),
    '节食': ('他在___。', 'He is dieting.'),
    '瘦': ('她___了很多。', 'She has become much slimmer.'),
    # L6
    '可能': ('他___来晚了。', 'He might be coming late.'),
    '忽然': ('天___下雨了。', 'It suddenly started to rain.'),
    '或者': ('你喝茶___咖啡？', 'Do you drink tea or coffee?'),
    '地方': ('这个___很美。', 'This place is very beautiful.'),
    '既然': ('___你不想去，就别去了。', "Since you don't want to go, don't go."),
    '好像': ('他___不高兴。', 'He seems unhappy.'),
    '当然': ('___可以！', 'Of course you can!'),
    '明明': ('他___知道，但不说。', "He obviously knows but doesn't say."),
    '丢': ('我把钥匙___了。', 'I lost my keys.'),
    '到处': ('我___找他。', 'I looked for him everywhere.'),
    '肯定': ('他___会来的。', 'He will definitely come.'),
    '找': ('我在___我的钥匙。', "I'm looking for my keys."),
}

def gen_vocab_mini(word, pool):
    """Generate 3 mini exercises for a vocabulary word."""
    zh = word['chinese']
    sent_zh, sent_en = SENTENCES.get(zh, (f'___。', zh))
    return [
        mcq_english(word, pool),
        fill_blank(word, pool, sent_zh, sent_en),
        mcq_chinese(word, pool),
    ]

# ── handcrafted grammar point exercises ──────────────────────────────────────

GRAMMAR_MINI = {

    # ── L1 ────────────────────────────────────────────────────────────────────
    'hsk3_l1_g1': [  # 不的变调
        {
            "type": "multiple_choice",
            "question": "不 before a 4th-tone syllable changes to which tone?",
            "correct": "2nd tone (bú)",
            "options": ["2nd tone (bú)", "1st tone (bū)", "3rd tone (bǔ)", "Stays 4th tone (bù)"],
            "option_pinyin": ["bú", "bū", "bǔ", "bù"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: 不去 is pronounced bú qù because 去 is 4th tone.",
            "correct": "去",
            "options": ["走", "来", "去", "说"],
            "option_pinyin": ["zǒu", "lái", "qù", "shuō"],
            "question_chinese": "不___ (bú ___) — 去 is 4th tone, so 不 becomes 2nd tone.",
            "question_pinyin": "不___ — tone sandhi applies here.",
            "question_english": "Fill the blank to show the tone-sandhi context: 不___ = bú ___."
        },
        {
            "type": "multiple_choice",
            "question": "Which pronunciation is correct?",
            "correct": "不是 = bú shì",
            "options": ["不是 = bú shì", "不走 = bú zǒu", "不说 = bú shuō", "不来 = bú lái"],
            "option_pinyin": ["bú shì", "bù zǒu", "bù shuō", "bù lái"]
        },
    ],

    'hsk3_l1_g2': [  # 不…了
        {
            "type": "multiple_choice",
            "question": "What does 我不去了 mean?",
            "correct": "I'm not going anymore.",
            "options": [
                "I'm not going anymore.",
                "I won't go tomorrow.",
                "I never go.",
                "I'm going now."
            ],
            "option_pinyin": ["wǒ bù qù le", "wǒ míng tiān bù qù", "wǒ cóng bù qù", "wǒ xiàn zài qù"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: I'm not eating anymore.",
            "correct": "了",
            "options": ["了", "过", "着", "的"],
            "option_pinyin": ["le", "guò", "zhe", "de"],
            "question_chinese": "我不吃___。",
            "question_pinyin": "我不吃___。",
            "question_english": "I'm not eating anymore."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence means 'She doesn't drink coffee anymore'?",
            "correct": "她不喝咖啡了。",
            "options": [
                "她不喝咖啡了。",
                "她没有咖啡。",
                "她不喝咖啡吗？",
                "她喝了咖啡。"
            ],
            "option_pinyin": [
                "tā bù hē kā fēi le",
                "tā méi yǒu kā fēi",
                "tā bù hē kā fēi ma",
                "tā hē le kā fēi"
            ]
        },
    ],

    'hsk3_l1_g3': [  # 先…然后…
        {
            "type": "multiple_choice",
            "question": "What does 先...然后... express?",
            "correct": "A sequence of two actions (first...then...)",
            "options": [
                "A sequence of two actions (first...then...)",
                "A contrast between two ideas",
                "A condition and its result",
                "A choice between two options"
            ],
            "option_pinyin": ["xiān...rán hòu...", "dàn shì...", "rú guǒ...", "huò zhě..."]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: I'll go to the supermarket first, then go home.",
            "correct": "然后",
            "options": ["然后", "虽然", "如果", "因为"],
            "option_pinyin": ["rán hòu", "suī rán", "rú guǒ", "yīn wèi"],
            "question_chinese": "我先去超市，___回家。",
            "question_pinyin": "我先去超市，___回家。",
            "question_english": "I'll go to the supermarket first, then go home."
        },
        {
            "type": "fill_blank",
            "question": "Fill in: First...then...",
            "correct": "先",
            "options": ["先", "再", "又", "还"],
            "option_pinyin": ["xiān", "zài", "yòu", "hái"],
            "question_chinese": "你___吃饭，然后做作业。",
            "question_pinyin": "你___吃饭，然后做作业。",
            "question_english": "You eat first, then do your homework."
        },
    ],

    # ── L2 ────────────────────────────────────────────────────────────────────
    'hsk3_l2_g1': [  # 把字句
        {
            "type": "multiple_choice",
            "question": "What is the function of 把 in a sentence?",
            "correct": "Move the object before the verb to show what happened to it",
            "options": [
                "Move the object before the verb to show what happened to it",
                "Indicate a passive voice",
                "Show that an action is completed",
                "Connect two clauses"
            ],
            "option_pinyin": ["bǎ", "bèi", "le", "ér qiě"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: I put the book on the table.",
            "correct": "把",
            "options": ["把", "被", "让", "给"],
            "option_pinyin": ["bǎ", "bèi", "ràng", "gěi"],
            "question_chinese": "我___书放在桌子上了。",
            "question_pinyin": "我___书放在桌子上了。",
            "question_english": "I put the book on the table."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence is correct?",
            "correct": "他把作业做完了。",
            "options": [
                "他把作业做完了。",
                "他做完把作业了。",
                "他做了把作业完。",
                "把他作业做完了。"
            ],
            "option_pinyin": [
                "tā bǎ zuò yè zuò wán le",
                "tā zuò wán bǎ zuò yè le",
                "tā zuò le bǎ zuò yè wán",
                "bǎ tā zuò yè zuò wán le"
            ]
        },
    ],

    'hsk3_l2_g2': [  # 大约词语
        {
            "type": "multiple_choice",
            "question": "Where does 左右 go in a sentence?",
            "correct": "After a number or time expression",
            "options": [
                "After a number or time expression",
                "Before a number",
                "At the beginning of a sentence",
                "After the verb"
            ],
            "option_pinyin": ["zuǒ yòu", "dà yuē", "chà bu duō", "zuǒ yòu"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: There are about ten people.",
            "correct": "左右",
            "options": ["左右", "大约", "差不多", "以上"],
            "option_pinyin": ["zuǒ yòu", "dà yuē", "chà bu duō", "yǐ shàng"],
            "question_chinese": "有十个人___。",
            "question_pinyin": "有十个人___。",
            "question_english": "There are about ten people."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence uses an approximation word correctly?",
            "correct": "大约有三十人。",
            "options": [
                "大约有三十人。",
                "有三十大约人。",
                "有三十人大约。",
                "人三十大约有。"
            ],
            "option_pinyin": [
                "dà yuē yǒu sān shí rén",
                "yǒu sān shí dà yuē rén",
                "yǒu sān shí rén dà yuē",
                "rén sān shí dà yuē yǒu"
            ]
        },
    ],

    'hsk3_l2_g3': [  # 总是 vs 一直
        {
            "type": "multiple_choice",
            "question": "What is the difference between 总是 and 一直?",
            "correct": "总是 = always (habitual); 一直 = continuously (uninterrupted)",
            "options": [
                "总是 = always (habitual); 一直 = continuously (uninterrupted)",
                "总是 = sometimes; 一直 = always",
                "总是 = never; 一直 = sometimes",
                "They mean exactly the same thing"
            ],
            "option_pinyin": ["zǒng shì / yì zhí", "yǒu shí / zǒng shì", "cóng bù / yǒu shí", "same"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: He is always late. (habitual pattern)",
            "correct": "总是",
            "options": ["总是", "一直", "常常", "有时"],
            "option_pinyin": ["zǒng shì", "yì zhí", "cháng cháng", "yǒu shí"],
            "question_chinese": "他___迟到。",
            "question_pinyin": "他___迟到。",
            "question_english": "He is always late."
        },
        {
            "type": "fill_blank",
            "question": "Fill in: It has been raining continuously since morning.",
            "correct": "一直",
            "options": ["一直", "总是", "再", "还"],
            "option_pinyin": ["yì zhí", "zǒng shì", "zài", "hái"],
            "question_chinese": "从早上开始___下雨。",
            "question_pinyin": "从早上开始___下雨。",
            "question_english": "It has been raining continuously since morning."
        },
    ],

    # ── L3 ────────────────────────────────────────────────────────────────────
    'hsk3_l3_g1': [  # 就在位置
        {
            "type": "multiple_choice",
            "question": "What does 就在 add to a location statement?",
            "correct": "Certainty and precision (right here/there)",
            "options": [
                "Certainty and precision (right here/there)",
                "Uncertainty (maybe here)",
                "Distance (far away)",
                "Movement towards a place"
            ],
            "option_pinyin": ["jiù zài", "kě néng zài", "hěn yuǎn", "wǎng"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: The bathroom is right at the entrance.",
            "correct": "就",
            "options": ["就", "都", "也", "还"],
            "option_pinyin": ["jiù", "dōu", "yě", "hái"],
            "question_chinese": "厕所___在门口。",
            "question_pinyin": "厕所___在门口。",
            "question_english": "The bathroom is right at the entrance."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence is correct?",
            "correct": "超市就在附近。",
            "options": [
                "超市就在附近。",
                "就超市在附近。",
                "超市在就附近。",
                "附近就超市在。"
            ],
            "option_pinyin": [
                "chāo shì jiù zài fù jìn",
                "jiù chāo shì zài fù jìn",
                "chāo shì zài jiù fù jìn",
                "fù jìn jiù chāo shì zài"
            ]
        },
    ],

    'hsk3_l3_g2': [  # 名量词
        {
            "type": "multiple_choice",
            "question": "Which is the correct measure word for 水 (water)?",
            "correct": "瓶 (bottle)",
            "options": ["瓶 (bottle)", "台 (machine)", "张 (flat thing)", "条 (strip)"],
            "option_pinyin": ["píng", "tái", "zhāng", "tiáo"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: One bottle of water.",
            "correct": "瓶",
            "options": ["瓶", "台", "张", "本"],
            "option_pinyin": ["píng", "tái", "zhāng", "běn"],
            "question_chinese": "一___水。",
            "question_pinyin": "一___水。",
            "question_english": "One bottle of water."
        },
        {
            "type": "fill_blank",
            "question": "Fill in: One [measure word] computer.",
            "correct": "台",
            "options": ["台", "瓶", "本", "张"],
            "option_pinyin": ["tái", "píng", "běn", "zhāng"],
            "question_chinese": "一___电脑。",
            "question_pinyin": "一___电脑。",
            "question_english": "One computer."
        },
    ],

    'hsk3_l3_g3': [  # 动词+着
        {
            "type": "multiple_choice",
            "question": "What does Verb + 着 express?",
            "correct": "An ongoing state resulting from an action",
            "options": [
                "An ongoing state resulting from an action",
                "A completed action",
                "A future action",
                "A repeated action"
            ],
            "option_pinyin": ["zhe", "le", "jiāng", "yòu"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: The door is open. (ongoing state)",
            "correct": "着",
            "options": ["着", "了", "过", "的"],
            "option_pinyin": ["zhe", "le", "guò", "de"],
            "question_chinese": "门开___呢。",
            "question_pinyin": "门开___呢。",
            "question_english": "The door is open."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence describes an ongoing state?",
            "correct": "桌上放着饮料。",
            "options": [
                "桌上放着饮料。",
                "桌上放了饮料。",
                "桌上放过饮料。",
                "桌上有放饮料。"
            ],
            "option_pinyin": [
                "zhuō shàng fàng zhe yǐn liào",
                "zhuō shàng fàng le yǐn liào",
                "zhuō shàng fàng guò yǐn liào",
                "zhuō shàng yǒu fàng yǐn liào"
            ]
        },
    ],

    # ── L4 ────────────────────────────────────────────────────────────────────
    'hsk3_l4_g1': [  # 跟/和伴随
        {
            "type": "multiple_choice",
            "question": "What does Subject + 跟 + Person + Verb mean?",
            "correct": "Do something with someone",
            "options": [
                "Do something with someone",
                "Do something instead of someone",
                "Do something for someone",
                "Do something without someone"
            ],
            "option_pinyin": ["gēn", "tì", "wèi", "méi yǒu"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: I chat with him.",
            "correct": "跟",
            "options": ["跟", "被", "让", "把"],
            "option_pinyin": ["gēn", "bèi", "ràng", "bǎ"],
            "question_chinese": "我___他聊天。",
            "question_pinyin": "我___他聊天。",
            "question_english": "I chat with him."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence is correct?",
            "correct": "他和朋友去图书馆了。",
            "options": [
                "他和朋友去图书馆了。",
                "他去和朋友图书馆了。",
                "和他朋友去图书馆了。",
                "他朋友和去图书馆了。"
            ],
            "option_pinyin": [
                "tā hé péng yǒu qù tú shū guǎn le",
                "tā qù hé péng yǒu tú shū guǎn le",
                "hé tā péng yǒu qù tú shū guǎn le",
                "tā péng yǒu hé qù tú shū guǎn le"
            ]
        },
    ],

    'hsk3_l4_g2': [  # 自己
        {
            "type": "multiple_choice",
            "question": "What does 自己 mean?",
            "correct": "Oneself (refers back to the subject)",
            "options": [
                "Oneself (refers back to the subject)",
                "Each other",
                "Someone else",
                "No one"
            ],
            "option_pinyin": ["zì jǐ", "hù xiāng", "bié rén", "méi rén"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: He does it himself.",
            "correct": "自己",
            "options": ["自己", "互相", "别人", "大家"],
            "option_pinyin": ["zì jǐ", "hù xiāng", "bié rén", "dà jiā"],
            "question_chinese": "他___做。",
            "question_pinyin": "他___做。",
            "question_english": "He does it himself."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence is correct?",
            "correct": "你要照顾好自己。",
            "options": [
                "你要照顾好自己。",
                "自己你要照顾好。",
                "你自己要好照顾。",
                "照顾好你自己要。"
            ],
            "option_pinyin": [
                "nǐ yào zhào gù hǎo zì jǐ",
                "zì jǐ nǐ yào zhào gù hǎo",
                "nǐ zì jǐ yào hǎo zhào gù",
                "zhào gù hǎo nǐ zì jǐ yào"
            ]
        },
    ],

    'hsk3_l4_g3': [  # 而且
        {
            "type": "multiple_choice",
            "question": "What does 而且 mean?",
            "correct": "Moreover / Furthermore (adds a stronger point)",
            "options": [
                "Moreover / Furthermore (adds a stronger point)",
                "But / However (contrasts)",
                "Because (gives a reason)",
                "If (gives a condition)"
            ],
            "option_pinyin": ["ér qiě", "dàn shì", "yīn wèi", "rú guǒ"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: He is smart, moreover hardworking.",
            "correct": "而且",
            "options": ["而且", "但是", "因为", "虽然"],
            "option_pinyin": ["ér qiě", "dàn shì", "yīn wèi", "suī rán"],
            "question_chinese": "他很聪明，___很努力。",
            "question_pinyin": "他很聪明，___很努力。",
            "question_english": "He is smart, moreover very hardworking."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence uses 而且 correctly?",
            "correct": "她唱歌好，而且跳舞也好。",
            "options": [
                "她唱歌好，而且跳舞也好。",
                "她而且唱歌好，跳舞也好。",
                "而且她唱歌好，跳舞也好。",
                "她唱歌好，跳舞而且也好。"
            ],
            "option_pinyin": [
                "tā chàng gē hǎo ér qiě tiào wǔ yě hǎo",
                "tā ér qiě chàng gē hǎo tiào wǔ yě hǎo",
                "ér qiě tā chàng gē hǎo tiào wǔ yě hǎo",
                "tā chàng gē hǎo tiào wǔ ér qiě yě hǎo"
            ]
        },
    ],

    # ── L5 ────────────────────────────────────────────────────────────────────
    'hsk3_l5_g1': [  # 越来越
        {
            "type": "multiple_choice",
            "question": "What does 越来越 + Adjective express?",
            "correct": "A gradual increase of a quality (more and more...)",
            "options": [
                "A gradual increase of a quality (more and more...)",
                "A comparison between two things",
                "A sudden change",
                "A fixed state"
            ],
            "option_pinyin": ["yuè lái yuè", "bǐ jiào", "hū rán", "yì zhí"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: The weather is getting hotter and hotter.",
            "correct": "越来越",
            "options": ["越来越", "比较", "非常", "有点"],
            "option_pinyin": ["yuè lái yuè", "bǐ jiào", "fēi cháng", "yǒu diǎn"],
            "question_chinese": "天气___热了。",
            "question_pinyin": "天气___热了。",
            "question_english": "The weather is getting hotter and hotter."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence is correct?",
            "correct": "她越来越漂亮了。",
            "options": [
                "她越来越漂亮了。",
                "她漂亮越来越了。",
                "越来越她漂亮了。",
                "她了越来越漂亮。"
            ],
            "option_pinyin": [
                "tā yuè lái yuè piào liang le",
                "tā piào liang yuè lái yuè le",
                "yuè lái yuè tā piào liang le",
                "tā le yuè lái yuè piào liang"
            ]
        },
    ],

    'hsk3_l5_g2': [  # 越…越…
        {
            "type": "multiple_choice",
            "question": "What does 越...越... express?",
            "correct": "The more...the more... (proportional relationship)",
            "options": [
                "The more...the more... (proportional relationship)",
                "More and more (single quality increasing)",
                "Either...or...",
                "Not only...but also..."
            ],
            "option_pinyin": ["yuè...yuè...", "yuè lái yuè", "huò zhě...huò zhě...", "bù dàn...ér qiě..."]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: The more you eat, the fatter you get.",
            "correct": "越",
            "options": ["越", "更", "很", "比"],
            "option_pinyin": ["yuè", "gèng", "hěn", "bǐ"],
            "question_chinese": "___吃___胖。",
            "question_pinyin": "___吃___胖。",
            "question_english": "The more you eat, the fatter you get."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence is correct?",
            "correct": "他越跑越快。",
            "options": [
                "他越跑越快。",
                "他跑越越快。",
                "越他跑越快。",
                "他越快跑越。"
            ],
            "option_pinyin": [
                "tā yuè pǎo yuè kuài",
                "tā pǎo yuè yuè kuài",
                "yuè tā pǎo yuè kuài",
                "tā yuè kuài pǎo yuè"
            ]
        },
    ],

    'hsk3_l5_g3': [  # 比较
        {
            "type": "multiple_choice",
            "question": "What does 比较 mean before an adjective?",
            "correct": "Relatively / Rather (softer than 很 or 非常)",
            "options": [
                "Relatively / Rather (softer than 很 or 非常)",
                "Very / Extremely",
                "Not at all",
                "The most (superlative)"
            ],
            "option_pinyin": ["bǐ jiào", "fēi cháng", "yī diǎn yě bù", "zuì"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: This place is relatively expensive.",
            "correct": "比较",
            "options": ["比较", "非常", "很", "最"],
            "option_pinyin": ["bǐ jiào", "fēi cháng", "hěn", "zuì"],
            "question_chinese": "这里___贵。",
            "question_pinyin": "这里___贵。",
            "question_english": "This place is relatively expensive."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence is correct?",
            "correct": "他的身体比较健康。",
            "options": [
                "他的身体比较健康。",
                "他的比较身体健康。",
                "比较他的身体健康。",
                "他的身体健康比较。"
            ],
            "option_pinyin": [
                "tā de shēn tǐ bǐ jiào jiàn kāng",
                "tā de bǐ jiào shēn tǐ jiàn kāng",
                "bǐ jiào tā de shēn tǐ jiàn kāng",
                "tā de shēn tǐ jiàn kāng bǐ jiào"
            ]
        },
    ],

    # ── L6 ────────────────────────────────────────────────────────────────────
    'hsk3_l6_g1': [  # V得/不了
        {
            "type": "multiple_choice",
            "question": "What does 找得到 mean?",
            "correct": "Can find it (result is achievable)",
            "options": [
                "Can find it (result is achievable)",
                "Cannot find it",
                "Found it already",
                "Looking for it"
            ],
            "option_pinyin": ["zhǎo de dào", "zhǎo bu dào", "zhǎo dào le", "zhǎo"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: I can't finish eating this. (too much)",
            "correct": "不了",
            "options": ["不了", "得了", "不到", "得到"],
            "option_pinyin": ["bu liǎo", "de liǎo", "bú dào", "de dào"],
            "question_chinese": "这个我吃___。",
            "question_pinyin": "这个我吃___。",
            "question_english": "I can't finish eating this."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence means 'I can finish the work'?",
            "correct": "我做得完这个工作。",
            "options": [
                "我做得完这个工作。",
                "我做不完这个工作。",
                "我完了这个工作。",
                "我做这个工作完了。"
            ],
            "option_pinyin": [
                "wǒ zuò de wán zhè ge gōng zuò",
                "wǒ zuò bu wán zhè ge gōng zuò",
                "wǒ wán le zhè ge gōng zuò",
                "wǒ zuò zhè ge gōng zuò wán le"
            ]
        },
    ],

    'hsk3_l6_g2': [  # 既然…就…
        {
            "type": "multiple_choice",
            "question": "What does 既然...就... express?",
            "correct": "Since [known fact]...then [logical conclusion]",
            "options": [
                "Since [known fact]...then [logical conclusion]",
                "Although...still...",
                "If...then...",
                "Not only...but also..."
            ],
            "option_pinyin": ["jì rán...jiù...", "suī rán...hái...", "rú guǒ...jiù...", "bù dàn...ér qiě..."]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Since you know, tell me.",
            "correct": "既然",
            "options": ["既然", "虽然", "如果", "因为"],
            "option_pinyin": ["jì rán", "suī rán", "rú guǒ", "yīn wèi"],
            "question_chinese": "___你知道，就告诉我吧。",
            "question_pinyin": "___你知道，就告诉我吧。",
            "question_english": "Since you know, tell me."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence is correct?",
            "correct": "既然你来了，就一起吃饭吧。",
            "options": [
                "既然你来了，就一起吃饭吧。",
                "你既然来了，一起就吃饭吧。",
                "就既然你来了，一起吃饭吧。",
                "既然就你来了，一起吃饭吧。"
            ],
            "option_pinyin": [
                "jì rán nǐ lái le jiù yì qǐ chī fàn ba",
                "nǐ jì rán lái le yì qǐ jiù chī fàn ba",
                "jiù jì rán nǐ lái le yì qǐ chī fàn ba",
                "jì rán jiù nǐ lái le yì qǐ chī fàn ba"
            ]
        },
    ],

    'hsk3_l6_g3': [  # 好像/明明
        {
            "type": "multiple_choice",
            "question": "What is the difference between 好像 and 明明?",
            "correct": "好像 = seems/as if (uncertain); 明明 = obviously (speaker knows the truth)",
            "options": [
                "好像 = seems/as if (uncertain); 明明 = obviously (speaker knows the truth)",
                "好像 = obviously; 明明 = seems uncertain",
                "They mean the same thing",
                "好像 = never; 明明 = always"
            ],
            "option_pinyin": ["hǎo xiàng / míng míng", "míng míng / hǎo xiàng", "same", "never/always"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: He seems unhappy.",
            "correct": "好像",
            "options": ["好像", "明明", "肯定", "当然"],
            "option_pinyin": ["hǎo xiàng", "míng míng", "kěn dìng", "dāng rán"],
            "question_chinese": "他___不高兴。",
            "question_pinyin": "他___不高兴。",
            "question_english": "He seems unhappy."
        },
        {
            "type": "fill_blank",
            "question": "Fill in: He obviously knows but won't say.",
            "correct": "明明",
            "options": ["明明", "好像", "可能", "也许"],
            "option_pinyin": ["míng míng", "hǎo xiàng", "kě néng", "yě xǔ"],
            "question_chinese": "他___知道，但不说。",
            "question_pinyin": "他___知道，但不说。",
            "question_english": "He obviously knows but won't say."
        },
    ],
}

# ── grammar key mapping ───────────────────────────────────────────────────────

GRAMMAR_KEYS = {
    1: ['hsk3_l1_g1', 'hsk3_l1_g2', 'hsk3_l1_g3'],
    2: ['hsk3_l2_g1', 'hsk3_l2_g2', 'hsk3_l2_g3'],
    3: ['hsk3_l3_g1', 'hsk3_l3_g2', 'hsk3_l3_g3'],
    4: ['hsk3_l4_g1', 'hsk3_l4_g2', 'hsk3_l4_g3'],
    5: ['hsk3_l5_g1', 'hsk3_l5_g2', 'hsk3_l5_g3'],
    6: ['hsk3_l6_g1', 'hsk3_l6_g2', 'hsk3_l6_g3'],
}

# ── main processing ───────────────────────────────────────────────────────────

random.seed(42)
DATA_DIR = os.path.dirname(os.path.abspath(__file__))

for lesson_num in range(1, 7):
    path = os.path.join(DATA_DIR, f'hsk3_lesson_{lesson_num}.json')
    with open(path, encoding='utf-8') as f:
        data = json.load(f)

    # build vocab pool (non-phrase only)
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
