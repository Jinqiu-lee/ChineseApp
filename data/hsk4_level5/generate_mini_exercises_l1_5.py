"""
Generate mini_exercises for HSK4 Level 5 (hsk5) lessons 1-5.
Same pattern as Level 4 scripts: 3 per vocab word (non-phrase), 3 per grammar point.
Does NOT modify any other content in the JSON files.
"""
import json, random, copy, os

# ── helpers (identical to Level 4 scripts) ────────────────────────────────────

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
    # L1 — Travel & Transportation
    '出差': ('他下周要去上海___。', 'He has to go on a business trip to Shanghai next week.'),
    '出发': ('我们明天早上八点___。', 'We depart at eight o\'clock tomorrow morning.'),
    '航班': ('我预订了一个下午三点的___。', 'I booked a 3 PM flight.'),
    '乘坐': ('我们___高铁去北京。', 'We took the high-speed train to Beijing.'),
    '导游': ('___带我们参观了故宫。', 'The tour guide took us to visit the Forbidden City.'),
    '降落': ('飞机已经顺利___了。', 'The plane has landed safely.'),
    '签证': ('出国前要申请___。', 'You need to apply for a visa before going abroad.'),
    '登机牌': ('请出示你的___。', 'Please show your boarding pass.'),
    '高速公路': ('走___会比走普通公路快很多。', 'Taking the highway is much faster than the regular road.'),
    '迷路': ('她在陌生城市___了。', 'She got lost in the unfamiliar city.'),
    '大使馆': ('他去___申请签证。', 'He went to the embassy to apply for a visa.'),
    '旅行': ('我喜欢利用假期___。', 'I like to travel during holidays.'),

    # L2 — Education & Learning
    '努力': ('他很___，每天学习到很晚。', 'He works very hard, studying late every day.'),
    '成绩': ('她这次考试___很好。', 'She did very well in the exam this time.'),
    '考试': ('明天有一场重要的___。', 'There is an important exam tomorrow.'),
    '复习': ('考试前要认真___。', 'You need to review carefully before the exam.'),
    '奖学金': ('他靠___完成了大学学业。', 'He completed his university studies with a scholarship.'),
    '毕业': ('她今年从大学___了。', 'She graduated from university this year.'),
    '专业': ('他学的___是计算机科学。', 'His major is computer science.'),
    '教授': ('这位___非常有名。', 'This professor is very well-known.'),
    '学期': ('这个___他选了四门课。', 'He selected four courses this semester.'),
    '图书馆': ('我经常去___借书。', 'I often go to the library to borrow books.'),
    '笔记': ('上课要认真记___。', 'You need to take careful notes in class.'),
    '课程': ('他选了一门很有趣的___。', 'He chose a very interesting course.'),

    # L3 — Media & Technology
    '网络': ('现在没有___很不方便。', 'It is very inconvenient without the internet now.'),
    '软件': ('你需要更新这个___。', 'You need to update this software.'),
    '下载': ('我___了一个新的应用程序。', 'I downloaded a new app.'),
    '视频': ('他喜欢在网上看___。', 'He likes watching videos online.'),
    '直播': ('她在做烹饪___。', 'She is doing a live cooking stream.'),
    '评论': ('这个视频有很多___。', 'This video has many comments.'),
    '平台': ('这个___有很多用户。', 'This platform has many users.'),
    '智能手机': ('现在几乎人人都有___。', 'Almost everyone has a smartphone now.'),
    '人工智能': ('___改变了很多行业。', 'Artificial intelligence has changed many industries.'),
    '数据': ('这些___显示销量在增长。', 'This data shows that sales are growing.'),
    '社交媒体': ('他每天花很多时间刷___。', 'He spends a lot of time scrolling social media every day.'),
    '更新': ('你的手机需要___系统了。', 'Your phone needs a system update.'),

    # L4 — Food & Cuisine
    '菜肴': ('这道___非常美味。', 'This dish is very delicious.'),
    '食材': ('好的___是美食的基础。', 'Good ingredients are the foundation of great food.'),
    '调味': ('他在给汤___。', 'He is seasoning the soup.'),
    '厨师': ('他是一位优秀的___。', 'He is an excellent chef.'),
    '饮食': ('健康的___非常重要。', 'Healthy eating habits are very important.'),
    '营养': ('蔬菜富含___。', 'Vegetables are rich in nutrition.'),
    '口味': ('每个地方的___不一样。', 'Every place has a different taste preference.'),
    '特色': ('这道菜是本店的___菜。', "This dish is the restaurant's specialty."),
    '烹饪': ('她擅长___各种菜肴。', 'She is good at cooking all kinds of dishes.'),
    '新鲜': ('这些蔬菜非常___。', 'These vegetables are very fresh.'),
    '食谱': ('她按照___上的步骤做菜。', 'She followed the steps on the recipe.'),
    '美食': ('她喜欢四处寻找各地___。', 'She loves searching for delicious food from all over.'),

    # L5 — Sports & Fitness
    '运动员': ('他是一名优秀的___。', 'He is an outstanding athlete.'),
    '比赛': ('明天有一场足球___。', 'There is a football match tomorrow.'),
    '训练': ('他每天坚持___两个小时。', 'He persists in training for two hours every day.'),
    '体能': ('好的___是运动员的基础。', 'Good physical fitness is the foundation of an athlete.'),
    '冠军': ('她在比赛中获得了___。', 'She won the championship in the competition.'),
    '赛场': ('观众们聚集在___周围。', 'The spectators gathered around the arena.'),
    '教练': ('他的___非常严格。', 'His coach is very strict.'),
    '坚持': ('不管多累，他都___训练。', 'No matter how tired he is, he keeps training.'),
    '竞争': ('这次比赛的___非常激烈。', 'The competition in this match is very fierce.'),
    '记录': ('他打破了世界___。', 'He broke the world record.'),
    '体育馆': ('比赛在___里举行。', 'The match is held in the gymnasium.'),
}

# ── handcrafted grammar mini exercises ───────────────────────────────────────

GRAMMAR_MINI = {

    # ── L1 ────────────────────────────────────────────────────────────────────
    'hsk5_l1_g1': [  # 顺便 — While you're at it
        {
            "type": "multiple_choice",
            "question": "顺便 in a sentence means...",
            "correct": "Doing something extra while doing the main action ('while you're at it')",
            "options": [
                "Doing something extra while doing the main action ('while you're at it')",
                "Showing a reason why the action happened",
                "Expressing contrast between two events",
                "Indicating that an action is being postponed"
            ],
            "option_pinyin": ["shùn biàn", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: I'm going shopping; I'll check the price for you while I'm at it.",
            "correct": "顺便",
            "options": ["顺便", "推迟", "因为", "已经"],
            "option_pinyin": ["shùn biàn", "tuī chí", "yīn wèi", "yǐ jīng"],
            "question_chinese": "我去买东西，___帮你看看价格。",
            "question_pinyin": "我去买东西，___帮你看看价格。",
            "question_english": "I'm going shopping; I'll check the price for you while I'm at it."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 顺便?",
            "correct": "他去机场，顺便把快递也取了。",
            "options": [
                "他去机场，顺便把快递也取了。",
                "顺便他去机场，把快递也取了。",
                "他顺便，去机场把快递取了。",
                "他去机场把快递顺便取了的。"
            ],
            "option_pinyin": [
                "tā qù jī chǎng shùn biàn bǎ kuài dì yě qǔ le",
                "shùn biàn tā qù jī chǎng bǎ kuài dì yě qǔ le",
                "tā shùn biàn qù jī chǎng bǎ kuài dì qǔ le",
                "tā qù jī chǎng bǎ kuài dì shùn biàn qǔ le de"
            ]
        },
    ],

    'hsk5_l1_g2': [  # 来不及 / 来得及 — No time / Still have time
        {
            "type": "multiple_choice",
            "question": "What is the difference between 来不及 and 来得及?",
            "correct": "来不及 means there is no time; 来得及 means there is still time",
            "options": [
                "来不及 means there is no time; 来得及 means there is still time",
                "来不及 means to arrive early; 来得及 means to arrive late",
                "They are interchangeable with no difference",
                "来不及 is formal; 来得及 is informal"
            ],
            "option_pinyin": ["lái bù jí / lái de jí", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: The plane is about to take off; we have no time to check in.",
            "correct": "来不及",
            "options": ["来不及", "来得及", "推迟", "顺便"],
            "option_pinyin": ["lái bù jí", "lái de jí", "tuī chí", "shùn biàn"],
            "question_chinese": "飞机马上起飞，我们___办理登机手续了。",
            "question_pinyin": "飞机马上起飞，我们___办理登机手续了。",
            "question_english": "The plane is about to take off; we have no time to check in."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 来得及?",
            "correct": "别着急，还来得及，航班还有一个小时。",
            "options": [
                "别着急，还来得及，航班还有一个小时。",
                "别着急，还来不及，航班还有一个小时。",
                "来得及，别着急航班还有一个小时。",
                "航班还有一个小时，来得及别着急。"
            ],
            "option_pinyin": [
                "bié zháo jí hái lái de jí háng bān hái yǒu yí gè xiǎo shí",
                "bié zháo jí hái lái bù jí háng bān hái yǒu yí gè xiǎo shí",
                "lái de jí bié zháo jí háng bān hái yǒu yí gè xiǎo shí",
                "háng bān hái yǒu yí gè xiǎo shí lái de jí bié zháo jí"
            ]
        },
    ],

    'hsk5_l1_g3': [  # 推迟 — To postpone / To delay
        {
            "type": "multiple_choice",
            "question": "推迟 means...",
            "correct": "To postpone or delay something to a later time",
            "options": [
                "To postpone or delay something to a later time",
                "To cancel something permanently",
                "To complete something ahead of schedule",
                "To repeat something again"
            ],
            "option_pinyin": ["tuī chí", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Due to the rain, the outdoor event was postponed.",
            "correct": "推迟",
            "options": ["推迟", "取消", "出发", "降落"],
            "option_pinyin": ["tuī chí", "qǔ xiāo", "chū fā", "jiàng luò"],
            "question_chinese": "由于下雨，户外活动被___了。",
            "question_pinyin": "由于下雨，户外活动被___了。",
            "question_english": "Due to the rain, the outdoor event was postponed."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 推迟?",
            "correct": "由于签证还没办好，他们把出发日期推迟了。",
            "options": [
                "由于签证还没办好，他们把出发日期推迟了。",
                "由于签证还没办好，推迟他们把出发日期了。",
                "他们由于推迟，签证还没办好出发日期。",
                "推迟由于签证，他们出发日期还没办好。"
            ],
            "option_pinyin": [
                "yóu yú qiān zhèng hái méi bàn hǎo tā men bǎ chū fā rì qī tuī chí le",
                "yóu yú qiān zhèng hái méi bàn hǎo tuī chí tā men bǎ chū fā rì qī le",
                "tā men yóu yú tuī chí qiān zhèng hái méi bàn hǎo chū fā rì qī",
                "tuī chí yóu yú qiān zhèng tā men chū fā rì qī hái méi bàn hǎo"
            ]
        },
    ],

    # ── L2 ────────────────────────────────────────────────────────────────────
    'hsk5_l2_g1': [  # 只有...才... — Only if...then...
        {
            "type": "multiple_choice",
            "question": "只有...才... expresses...",
            "correct": "A strict necessary condition: only if/when A, then (and only then) B can happen",
            "options": [
                "A strict necessary condition: only if/when A, then (and only then) B can happen",
                "A general condition: if A, then B (sufficient condition)",
                "No matter what A is, B will happen",
                "Although A is true, B still happens"
            ],
            "option_pinyin": ["zhǐ yǒu...cái...", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Only by studying hard can you pass the exam.",
            "correct": "只有",
            "options": ["只有", "如果", "不管", "虽然"],
            "option_pinyin": ["zhǐ yǒu", "rú guǒ", "bù guǎn", "suī rán"],
            "question_chinese": "___努力复习，才能通过考试。",
            "question_pinyin": "___努力复习，才能通过考试。",
            "question_english": "Only by studying hard can you pass the exam."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 只有...才...?",
            "correct": "只有坚持练习，才能取得好成绩。",
            "options": [
                "只有坚持练习，才能取得好成绩。",
                "才能只有坚持练习，取得好成绩。",
                "只有才能坚持练习，取得好成绩。",
                "坚持练习只有，才能取得好成绩。"
            ],
            "option_pinyin": [
                "zhǐ yǒu jiān chí liàn xí cái néng qǔ dé hǎo chéng jì",
                "cái néng zhǐ yǒu jiān chí liàn xí qǔ dé hǎo chéng jì",
                "zhǐ yǒu cái néng jiān chí liàn xí qǔ dé hǎo chéng jì",
                "jiān chí liàn xí zhǐ yǒu cái néng qǔ dé hǎo chéng jì"
            ]
        },
    ],

    'hsk5_l2_g2': [  # 越来越 — More and more
        {
            "type": "multiple_choice",
            "question": "越来越 + Adj/Verb expresses...",
            "correct": "A gradual increase or intensification over time: 'more and more'",
            "options": [
                "A gradual increase or intensification over time: 'more and more'",
                "A sudden, one-time change",
                "The highest degree of something: 'the most'",
                "A comparison between two different things"
            ],
            "option_pinyin": ["yuè lái yuè", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: His Chinese is getting better and better.",
            "correct": "越来越",
            "options": ["越来越", "非常", "总是", "已经"],
            "option_pinyin": ["yuè lái yuè", "fēi cháng", "zǒng shì", "yǐ jīng"],
            "question_chinese": "他的汉语___好了。",
            "question_pinyin": "他的汉语___好了。",
            "question_english": "His Chinese is getting better and better."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 越来越?",
            "correct": "天气越来越冷，要多穿衣服。",
            "options": [
                "天气越来越冷，要多穿衣服。",
                "天气来越越冷，要多穿衣服。",
                "越来越天气冷，要多穿衣服。",
                "天气冷越来越，要多穿衣服。"
            ],
            "option_pinyin": [
                "tiān qì yuè lái yuè lěng yào duō chuān yī fú",
                "tiān qì lái yuè yuè lěng yào duō chuān yī fú",
                "yuè lái yuè tiān qì lěng yào duō chuān yī fú",
                "tiān qì lěng yuè lái yuè yào duō chuān yī fú"
            ]
        },
    ],

    'hsk5_l2_g3': [  # 不管...都... — No matter...still...
        {
            "type": "multiple_choice",
            "question": "不管...都... expresses...",
            "correct": "No matter what the condition is, the result is always the same",
            "options": [
                "No matter what the condition is, the result is always the same",
                "Only when the condition is met does the result happen",
                "Although the condition is true, the result is unexpected",
                "Because of the condition, the result follows"
            ],
            "option_pinyin": ["bù guǎn...dōu...", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: No matter how difficult it is, he persists.",
            "correct": "不管",
            "options": ["不管", "如果", "只有", "因为"],
            "option_pinyin": ["bù guǎn", "rú guǒ", "zhǐ yǒu", "yīn wèi"],
            "question_chinese": "___多难，他都要坚持。",
            "question_pinyin": "___多难，他都要坚持。",
            "question_english": "No matter how difficult it is, he persists."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 不管...都...?",
            "correct": "不管结果怎样，都要努力去做。",
            "options": [
                "不管结果怎样，都要努力去做。",
                "结果不管怎样，要努力都去做。",
                "都不管结果，怎样努力去做。",
                "不管都要结果，怎样努力去做。"
            ],
            "option_pinyin": [
                "bù guǎn jié guǒ zěn yàng dōu yào nǔ lì qù zuò",
                "jié guǒ bù guǎn zěn yàng yào nǔ lì dōu qù zuò",
                "dōu bù guǎn jié guǒ zěn yàng nǔ lì qù zuò",
                "bù guǎn dōu yào jié guǒ zěn yàng nǔ lì qù zuò"
            ]
        },
    ],

    # ── L3 ────────────────────────────────────────────────────────────────────
    'hsk5_l3_g1': [  # 随着 — Along with; as
        {
            "type": "multiple_choice",
            "question": "随着 + N/VP means...",
            "correct": "Along with / As (something changes or progresses), implying simultaneous change",
            "options": [
                "Along with / As (something changes or progresses), implying simultaneous change",
                "Because of (a reason or cause)",
                "Despite (a concession)",
                "In order to (a purpose)"
            ],
            "option_pinyin": ["suí zhe", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: As technology develops, people's lives have become more convenient.",
            "correct": "随着",
            "options": ["随着", "因为", "虽然", "如果"],
            "option_pinyin": ["suí zhe", "yīn wèi", "suī rán", "rú guǒ"],
            "question_chinese": "___科技的发展，人们的生活更方便了。",
            "question_pinyin": "___科技的发展，人们的生活更方便了。",
            "question_english": "As technology develops, people's lives have become more convenient."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 随着?",
            "correct": "随着网络的普及，社交媒体越来越流行。",
            "options": [
                "随着网络的普及，社交媒体越来越流行。",
                "网络的普及随着，社交媒体越来越流行。",
                "社交媒体随着，网络越来越流行普及。",
                "越来越随着网络，社交媒体普及流行。"
            ],
            "option_pinyin": [
                "suí zhe wǎng luò de pǔ jí shè jiāo méi tǐ yuè lái yuè liú xíng",
                "wǎng luò de pǔ jí suí zhe shè jiāo méi tǐ yuè lái yuè liú xíng",
                "shè jiāo méi tǐ suí zhe wǎng luò yuè lái yuè liú xíng pǔ jí",
                "yuè lái yuè suí zhe wǎng luò shè jiāo méi tǐ pǔ jí liú xíng"
            ]
        },
    ],

    'hsk5_l3_g2': [  # 不仅如此 — Not only that; moreover
        {
            "type": "multiple_choice",
            "question": "不仅如此 in a sentence means...",
            "correct": "Not only that — introduces an additional, stronger point extending the previous statement",
            "options": [
                "Not only that — introduces an additional, stronger point extending the previous statement",
                "Although that is true — introduces a contrast",
                "Because of that — introduces a reason",
                "Therefore — introduces a logical conclusion"
            ],
            "option_pinyin": ["bù jǐn rú cǐ", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: This software is free; moreover, it also has no advertisements.",
            "correct": "不仅如此",
            "options": ["不仅如此", "虽然如此", "因此", "所以"],
            "option_pinyin": ["bù jǐn rú cǐ", "suī rán rú cǐ", "yīn cǐ", "suǒ yǐ"],
            "question_chinese": "这款软件免费；___，它还没有广告。",
            "question_pinyin": "这款软件免费；___，它还没有广告。",
            "question_english": "This software is free; moreover, it also has no advertisements."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 不仅如此?",
            "correct": "他会说英语和法语；不仅如此，他还会日语。",
            "options": [
                "他会说英语和法语；不仅如此，他还会日语。",
                "他不仅如此，会说英语和法语，还会日语。",
                "不仅如此他会，说英语和法语还会日语。",
                "他会说英语，不仅如此和法语，还会日语。"
            ],
            "option_pinyin": [
                "tā huì shuō yīng yǔ hé fǎ yǔ bù jǐn rú cǐ tā hái huì rì yǔ",
                "tā bù jǐn rú cǐ huì shuō yīng yǔ hé fǎ yǔ hái huì rì yǔ",
                "bù jǐn rú cǐ tā huì shuō yīng yǔ hé fǎ yǔ hái huì rì yǔ",
                "tā huì shuō yīng yǔ bù jǐn rú cǐ hé fǎ yǔ hái huì rì yǔ"
            ]
        },
    ],

    'hsk5_l3_g3': [  # 通过...来... — By means of; through...
        {
            "type": "multiple_choice",
            "question": "通过...来... expresses...",
            "correct": "Using X as a method or channel to achieve a goal ('by means of X')",
            "options": [
                "Using X as a method or channel to achieve a goal ('by means of X')",
                "Passing through a physical location",
                "Because of X, a result happens",
                "In order for X to happen in the future"
            ],
            "option_pinyin": ["tōng guò...lái...", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: We can learn more information through the internet.",
            "correct": "通过",
            "options": ["通过", "关于", "由于", "为了"],
            "option_pinyin": ["tōng guò", "guān yú", "yóu yú", "wèi le"],
            "question_chinese": "我们可以___网络来了解更多信息。",
            "question_pinyin": "我们可以___网络来了解更多信息。",
            "question_english": "We can learn more information through the internet."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 通过...来...?",
            "correct": "他通过看视频来学习烹饪技术。",
            "options": [
                "他通过看视频来学习烹饪技术。",
                "他看视频通过来学习烹饪技术。",
                "通过他看视频，来学习烹饪技术。",
                "他来通过看视频，学习烹饪技术。"
            ],
            "option_pinyin": [
                "tā tōng guò kàn shì pín lái xué xí pēng rèn jì shù",
                "tā kàn shì pín tōng guò lái xué xí pēng rèn jì shù",
                "tōng guò tā kàn shì pín lái xué xí pēng rèn jì shù",
                "tā lái tōng guò kàn shì pín xué xí pēng rèn jì shù"
            ]
        },
    ],

    # ── L4 ────────────────────────────────────────────────────────────────────
    'hsk5_l4_g1': [  # 既...又... — Both...and...
        {
            "type": "multiple_choice",
            "question": "既...又... expresses...",
            "correct": "Both A and B simultaneously — two positive qualities or actions at the same time",
            "options": [
                "Both A and B simultaneously — two positive qualities or actions at the same time",
                "Either A or B — a choice between two things",
                "Not A nor B — negating two things",
                "First A, then B — a sequence of steps"
            ],
            "option_pinyin": ["jì...yòu...", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: This dish is both fresh and nutritious.",
            "correct": "既",
            "options": ["既", "只", "越", "不"],
            "option_pinyin": ["jì", "zhǐ", "yuè", "bù"],
            "question_chinese": "这道菜___新鲜又营养。",
            "question_pinyin": "这道菜___新鲜又营养。",
            "question_english": "This dish is both fresh and nutritious."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 既...又...?",
            "correct": "这个菜既好吃又便宜。",
            "options": [
                "这个菜既好吃又便宜。",
                "这个菜又好吃既便宜。",
                "既这个菜好吃，又便宜。",
                "这个菜好吃既，又便宜。"
            ],
            "option_pinyin": [
                "zhè gè cài jì hǎo chī yòu pián yi",
                "zhè gè cài yòu hǎo chī jì pián yi",
                "jì zhè gè cài hǎo chī yòu pián yi",
                "zhè gè cài hǎo chī jì yòu pián yi"
            ]
        },
    ],

    'hsk5_l4_g2': [  # 越...越... — The more...the more...
        {
            "type": "multiple_choice",
            "question": "越...越... expresses...",
            "correct": "The more X, the more Y — two things intensify together proportionally",
            "options": [
                "The more X, the more Y — two things intensify together proportionally",
                "A gradual increase over time: 'more and more'",
                "The highest degree: 'the most'",
                "An unexpected contrast between two things"
            ],
            "option_pinyin": ["yuè...yuè...", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: The fresher the ingredients, the more delicious the food.",
            "correct": "越",
            "options": ["越", "更", "最", "很"],
            "option_pinyin": ["yuè", "gèng", "zuì", "hěn"],
            "question_chinese": "食材___新鲜，菜越好吃。",
            "question_pinyin": "食材___新鲜，菜越好吃。",
            "question_english": "The fresher the ingredients, the more delicious the food."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 越...越...?",
            "correct": "他练得越多，厨艺越好。",
            "options": [
                "他练得越多，厨艺越好。",
                "他越练得多，越厨艺好。",
                "越他练得多，厨艺越好。",
                "他练得多越，越厨艺好。"
            ],
            "option_pinyin": [
                "tā liàn de yuè duō chú yì yuè hǎo",
                "tā yuè liàn de duō yuè chú yì hǎo",
                "yuè tā liàn de duō chú yì yuè hǎo",
                "tā liàn de duō yuè yuè chú yì hǎo"
            ]
        },
    ],

    'hsk5_l4_g3': [  # 把 construction for cooking
        {
            "type": "multiple_choice",
            "question": "In the 把 construction for cooking (e.g. 把食材切好), 把 is used to...",
            "correct": "Move the object before the verb to emphasise the handling or processing of the ingredient",
            "options": [
                "Move the object before the verb to emphasise the handling or processing of the ingredient",
                "Show that an action was done to you (passive)",
                "Indicate that an action will happen in the future",
                "Express that something was done by someone else"
            ],
            "option_pinyin": ["bǎ + OBJ + V", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Please wash the ingredients clean first.",
            "correct": "把",
            "options": ["把", "让", "被", "给"],
            "option_pinyin": ["bǎ", "ràng", "bèi", "gěi"],
            "question_chinese": "请先___食材洗干净。",
            "question_pinyin": "请先___食材洗干净。",
            "question_english": "Please wash the ingredients clean first."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses the 把 construction?",
            "correct": "他把食材切好了，准备开始烹饪。",
            "options": [
                "他把食材切好了，准备开始烹饪。",
                "他食材把切好了，准备开始烹饪。",
                "把他食材切好了，准备开始烹饪。",
                "他切好了食材，把准备开始烹饪。"
            ],
            "option_pinyin": [
                "tā bǎ shí cái qiē hǎo le zhǔn bèi kāi shǐ pēng rèn",
                "tā shí cái bǎ qiē hǎo le zhǔn bèi kāi shǐ pēng rèn",
                "bǎ tā shí cái qiē hǎo le zhǔn bèi kāi shǐ pēng rèn",
                "tā qiē hǎo le shí cái bǎ zhǔn bèi kāi shǐ pēng rèn"
            ]
        },
    ],

    # ── L5 ────────────────────────────────────────────────────────────────────
    'hsk5_l5_g1': [  # 只要...就... — As long as...then...
        {
            "type": "multiple_choice",
            "question": "只要...就... expresses...",
            "correct": "As long as the condition (只要) is met, the result (就) will follow — a sufficient condition",
            "options": [
                "As long as the condition (只要) is met, the result (就) will follow — a sufficient condition",
                "Only if the condition is met will the result happen — a necessary condition",
                "No matter what the condition, the result is always the same",
                "Although the condition exists, the result is unexpected"
            ],
            "option_pinyin": ["zhǐ yào...jiù...", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: As long as you keep training, you will achieve good results.",
            "correct": "只要",
            "options": ["只要", "只有", "不管", "虽然"],
            "option_pinyin": ["zhǐ yào", "zhǐ yǒu", "bù guǎn", "suī rán"],
            "question_chinese": "___你坚持训练，就能取得好成绩。",
            "question_pinyin": "___你坚持训练，就能取得好成绩。",
            "question_english": "As long as you keep training, you will achieve good results."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 只要...就...?",
            "correct": "只要努力，就能成功。",
            "options": [
                "只要努力，就能成功。",
                "就努力，只要能成功。",
                "只要能成功，就努力。",
                "努力只要，就能成功。"
            ],
            "option_pinyin": [
                "zhǐ yào nǔ lì jiù néng chéng gōng",
                "jiù nǔ lì zhǐ yào néng chéng gōng",
                "zhǐ yào néng chéng gōng jiù nǔ lì",
                "nǔ lì zhǐ yào jiù néng chéng gōng"
            ]
        },
    ],

    'hsk5_l5_g2': [  # 尽管...还是... — Even though...still...
        {
            "type": "multiple_choice",
            "question": "尽管...还是... expresses...",
            "correct": "Even though A is true, B still happens — a concession with an unexpected continuation",
            "options": [
                "Even though A is true, B still happens — a concession with an unexpected continuation",
                "Because A is true, B happens — a cause-effect relationship",
                "As long as A, then B — a sufficient condition",
                "Only if A, then B — a necessary condition"
            ],
            "option_pinyin": ["jǐn guǎn...hái shì...", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Even though he was exhausted, he still completed the training.",
            "correct": "尽管",
            "options": ["尽管", "虽然", "因为", "只要"],
            "option_pinyin": ["jǐn guǎn", "suī rán", "yīn wèi", "zhǐ yào"],
            "question_chinese": "___他很累，还是坚持完成了训练。",
            "question_pinyin": "___他很累，还是坚持完成了训练。",
            "question_english": "Even though he was exhausted, he still completed the training."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 尽管...还是...?",
            "correct": "尽管天气很热，运动员还是坚持比赛。",
            "options": [
                "尽管天气很热，运动员还是坚持比赛。",
                "天气很热尽管，运动员坚持还是比赛。",
                "还是尽管天气很热，运动员坚持比赛。",
                "运动员尽管天气很热，坚持还是比赛。"
            ],
            "option_pinyin": [
                "jǐn guǎn tiān qì hěn rè yùn dòng yuán hái shì jiān chí bǐ sài",
                "tiān qì hěn rè jǐn guǎn yùn dòng yuán jiān chí hái shì bǐ sài",
                "hái shì jǐn guǎn tiān qì hěn rè yùn dòng yuán jiān chí bǐ sài",
                "yùn dòng yuán jǐn guǎn tiān qì hěn rè jiān chí hái shì bǐ sài"
            ]
        },
    ],

    'hsk5_l5_g3': [  # 一...就... — As soon as...then...
        {
            "type": "multiple_choice",
            "question": "一...就... expresses...",
            "correct": "As soon as A happens, B immediately follows — a tight temporal sequence",
            "options": [
                "As soon as A happens, B immediately follows — a tight temporal sequence",
                "No matter when A happens, B will still happen",
                "A is the condition for B — but timing is not important",
                "Although A happened, B did not follow"
            ],
            "option_pinyin": ["yī...jiù...", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: As soon as he arrived at the arena, he became nervous.",
            "correct": "一",
            "options": ["一", "就", "才", "都"],
            "option_pinyin": ["yī", "jiù", "cái", "dōu"],
            "question_chinese": "他___到赛场，就开始紧张。",
            "question_pinyin": "他___到赛场，就开始紧张。",
            "question_english": "As soon as he arrived at the arena, he became nervous."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 一...就...?",
            "correct": "教练一说话，运动员们就安静下来了。",
            "options": [
                "教练一说话，运动员们就安静下来了。",
                "就教练一说话，运动员们安静下来了。",
                "教练说话一，运动员们就安静下来了。",
                "运动员们一教练说话，就安静下来了。"
            ],
            "option_pinyin": [
                "jiào liàn yī shuō huà yùn dòng yuán men jiù ān jìng xià lái le",
                "jiù jiào liàn yī shuō huà yùn dòng yuán men ān jìng xià lái le",
                "jiào liàn shuō huà yī yùn dòng yuán men jiù ān jìng xià lái le",
                "yùn dòng yuán men yī jiào liàn shuō huà jiù ān jìng xià lái le"
            ]
        },
    ],
}

# ── grammar key mapping (lesson number → list of GRAMMAR_MINI keys) ──────────

GRAMMAR_KEYS = {
    1: ['hsk5_l1_g1', 'hsk5_l1_g2', 'hsk5_l1_g3'],
    2: ['hsk5_l2_g1', 'hsk5_l2_g2', 'hsk5_l2_g3'],
    3: ['hsk5_l3_g1', 'hsk5_l3_g2', 'hsk5_l3_g3'],
    4: ['hsk5_l4_g1', 'hsk5_l4_g2', 'hsk5_l4_g3'],
    5: ['hsk5_l5_g1', 'hsk5_l5_g2', 'hsk5_l5_g3'],
}

# ── main processing ───────────────────────────────────────────────────────────

random.seed(42)
DATA_DIR = os.path.dirname(os.path.abspath(__file__))

for lesson_num in range(1, 6):
    path = os.path.join(DATA_DIR, f'hsk5_lesson_{lesson_num}.json')
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
