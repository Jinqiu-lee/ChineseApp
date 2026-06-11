"""
Generate mini_exercises for HSK3 lessons 7-15.
Same pattern as lessons 1-6: 3 per vocab word (non-phrase), 3 per grammar point.
Does NOT modify any other content in the JSON files.
"""
import json, random, copy, os

# ── helpers (identical to l1_6 script) ───────────────────────────────────────

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
    # L7
    '认识': ('我们___三年了。', "We've known each other for three years."),
    '毕业': ('他___以后找到了工作。', 'After he graduated, he found a job.'),
    '结婚': ('他们___了。', 'They got married.'),
    '分手': ('他们___了。', 'They broke up.'),
    '已经': ('我___吃完了。', "I've already finished eating."),
    '刚': ('我___到。', 'I just arrived.'),
    '爱好': ('你的___是什么？', 'What are your hobbies?'),
    '经历': ('这是一次难忘的___。', 'This is an unforgettable experience.'),
    '联系': ('请保持___。', 'Please keep in touch.'),
    '发展': ('中国经济___很快。', "China's economy is developing quickly."),
    '期间': ('假期___要好好休息。', 'Rest well during the holiday.'),
    '感情': ('他们的___很好。', 'Their relationship is very good.'),
    # L8
    '跟': ('我___你一起去。', "I'll go with you."),
    '不管': ('___天气好不好，我都去。', "Regardless of whether the weather is good, I'll go."),
    '只要': ('___你努力，就能成功。', 'As long as you work hard, you can succeed.'),
    '肯定': ('他___会来的。', 'He will definitely come.'),
    '随便': ('___，你来决定吧。', "Whatever, you decide."),
    '反正': ('___我已经决定了。', "Anyway, I've already decided."),
    '无论': ('___多难，我都坚持。', 'No matter how hard, I will persist.'),
    '决定': ('我们___去旅游。', 'We decided to go traveling.'),
    '选择': ('你可以___你想要的。', 'You can choose what you want.'),
    '哪怕': ('___下雨，我也要去。', "Even if it rains, I'll go."),
    '一…就…': ('我一回家___睡觉。', 'As soon as I get home, I sleep.'),
    # L9
    '汉语': ('我在学___。', "I'm learning Mandarin Chinese."),
    '一样': ('他们两个___高。', 'The two of them are the same height.'),
    '像': ('她___她妈妈。', 'She is like her mother.'),
    '还': ('他比我___好。', 'He is even better than me.'),
    '更': ('这本书___有意思。', 'This book is even more interesting.'),
    '流利': ('她说得很___。', 'She speaks very fluently.'),
    '地道': ('他的汉语很___。', 'His Chinese is very authentic.'),
    '厉害': ('你真___！', "You're really impressive!"),
    '进步': ('你___了很多。', "You've improved a lot."),
    '赞': ('这个菜真___！', 'This dish is really great!'),
    '口音': ('他有外国___。', 'He has a foreign accent.'),
    '母语': ('汉语是我的___。', 'Chinese is my mother tongue.'),
    # L10
    '数学': ('___很难学。', 'Mathematics is very hard to learn.'),
    '历史': ('我喜欢学___。', 'I like studying history.'),
    '难': ('这道题很___。', 'This question is very difficult.'),
    '容易': ('这个___做。', 'This is easy to do.'),
    '成绩': ('我的___提高了。', 'My grades have improved.'),
    '科目': ('你最喜欢哪个___？', 'Which subject do you like most?'),
    '复习': ('考试前要好好___。', 'Revise well before the exam.'),
    '努力': ('你很___！', "You're very hardworking!"),
    '一些': ('我有___问题想问。', 'I have some questions to ask.'),
    '好多了': ('今天感觉___。', 'Feeling much better today.'),
    '多了': ('数学比历史难___。', 'Mathematics is much harder than history.'),
    # L11
    '空调': ('请把___打开。', 'Please turn on the air conditioner.'),
    '忘': ('别___关灯！', "Don't forget to turn off the lights!"),
    '关': ('请把门___上。', 'Please close the door.'),
    '开': ('请把窗户___开。', 'Please open the window.'),
    '灯': ('别忘了关___。', "Don't forget to turn off the light."),
    '窗户': ('请打开___。', 'Please open the window.'),
    '帮': ('你能___我吗？', 'Can you help me?'),
    '顺便': ('你___帮我买一下。', "Please buy it for me while you're at it."),
    '浪费': ('不要___电。', "Don't waste electricity."),
    '电': ('节约用___。', 'Save electricity.'),
    '节约': ('我们要___用水。', 'We should save water.'),
    '随手': ('请___关灯。', 'Please turn off the light right away.'),
    # L12
    '重要': ('这件事很___。', 'This matter is very important.'),
    '东西': ('把你的___拿走。', 'Take your things away.'),
    '放': ('把书___在书架上。', 'Put the book on the bookshelf.'),
    '拿': ('你能帮我___一下吗？', 'Can you help me carry this?'),
    '搬': ('我们要___家了。', "We're moving house."),
    '背': ('我___着一个书包。', "I'm carrying a backpack on my back."),
    '提': ('她___着一个袋子。', "She's carrying a bag in her hand."),
    '保管': ('你帮我___这个。', 'Help me keep this safe.'),
    '借': ('我想___你的书。', 'I want to borrow your book.'),
    '还': ('我把书___给你了。', 'I returned the book to you.'),
    '丢': ('我把钥匙___了。', 'I lost my keys.'),
    '被': ('我的钱包___偷了。', 'My wallet was stolen.'),
    # L13
    '走路': ('我每天___上班。', 'I walk to work every day.'),
    '骑车': ('他喜欢___去学校。', 'He likes to ride a bike to school.'),
    '坐车': ('我们___去吧。', "Let's take a vehicle."),
    '开车': ('他会___。', 'He can drive.'),
    '打车': ('我要___去机场。', 'I want to take a taxi to the airport.'),
    '地铁': ('坐___比较快。', 'Taking the subway is relatively fast.'),
    '公交车': ('我坐___去的。', 'I went by public bus.'),
    '堵车': ('路上___了。', "There's a traffic jam on the road."),
    '方便': ('地铁很___。', 'The subway is very convenient.'),
    '方式': ('你用什么___去学校？', 'What method do you use to get to school?'),
    '交通': ('这里的___很发达。', 'The transportation here is very developed.'),
    '步行': ('我___上班。', 'I walk to work on foot.'),
    # L14
    '过来': ('你___一下。', 'Come over here for a moment.'),
    '过去': ('我们___看看。', "Let's go over to see."),
    '进来': ('请___！', 'Please come in!'),
    '进去': ('你能___吗？', 'Can you go in?'),
    '出来': ('请___！', 'Please come out!'),
    '出去': ('我要___一下。', "I'm going to go out for a bit."),
    '上来': ('请你___。', 'Please come up.'),
    '下来': ('你可以___了。', 'You can come down now.'),
    '回来': ('你几点___？', 'What time will you come back?'),
    '回去': ('我要___了。', "I'm going back."),
    '起来': ('他笑___了。', 'He started laughing.'),
    '带来': ('你___什么了？', 'What did you bring here?'),
    # L15
    '其他': ('___问题我不知道。', "I don't know about the other questions."),
    '差不多': ('我们___到了。', "We're almost there."),
    '基本上': ('我___都会了。', "I've basically learned it all."),
    '几乎': ('___所有人都来了。', 'Almost everyone came.'),
    '大概': ('___有三十个人。', 'There are probably thirty people.'),
    '不但': ('他___会说英语，还会说法语。', 'He not only speaks English, but also French.'),
    '而且': ('她聪明，___努力。', 'She is smart, and moreover hardworking.'),
    '反正': ('___我不去了。', "Anyway, I'm not going."),
    '其实': ('___我知道。', 'Actually I know.'),
    '还行': ('味道___吧。', "The taste is not bad, right?"),
}

# ── Special overrides for polyphonic characters ─────────────────────────────
# L9: 还 = hái (still/even more); L12: 还 = huán (to return)
# The word appears in both lessons; pool distractors differ so MCQ auto-gen is fine.
# The fill_blank sentence is defined above correctly for each context.

# ── handcrafted grammar mini exercises ───────────────────────────────────────

GRAMMAR_MINI = {

    # ── L7 ────────────────────────────────────────────────────────────────────
    'hsk3_l7_g1': [  # 时段补语
        {
            "type": "multiple_choice",
            "question": "V + 了 + Time Duration expresses...",
            "correct": "How long an action has lasted",
            "options": [
                "How long an action has lasted",
                "When an action will happen",
                "How many times an action happened",
                "Whether an action is complete"
            ],
            "option_pinyin": ["shí duàn", "shí jiān", "cì shù", "wán chéng"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: I've been studying Chinese for two years.",
            "correct": "了",
            "options": ["了", "过", "着", "的"],
            "option_pinyin": ["le", "guò", "zhe", "de"],
            "question_chinese": "我学汉语学___两年了。",
            "question_pinyin": "我学汉语学___两年了。",
            "question_english": "I've been studying Chinese for two years."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses a duration complement?",
            "correct": "她等了三十分钟了。",
            "options": [
                "她等了三十分钟了。",
                "她等三十分钟了。",
                "她等了了三十分钟。",
                "她三十分钟等了。"
            ],
            "option_pinyin": [
                "tā děng le sān shí fēn zhōng le",
                "tā děng sān shí fēn zhōng le",
                "tā děng le le sān shí fēn zhōng",
                "tā sān shí fēn zhōng děng le"
            ]
        },
    ],

    'hsk3_l7_g2': [  # 刚 vs 已经
        {
            "type": "multiple_choice",
            "question": "What is the difference between 刚 and 已经?",
            "correct": "刚 = just now (very recent); 已经 = already (completed, possibly some time ago)",
            "options": [
                "刚 = just now (very recent); 已经 = already (completed, possibly some time ago)",
                "刚 = already; 已经 = just now",
                "They mean exactly the same thing",
                "刚 = not yet; 已经 = still"
            ],
            "option_pinyin": ["gāng / yǐ jīng", "yǐ jīng / gāng", "same", "hái méi / hái"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: I just arrived.",
            "correct": "刚",
            "options": ["刚", "已经", "还", "才"],
            "option_pinyin": ["gāng", "yǐ jīng", "hái", "cái"],
            "question_chinese": "我___到。",
            "question_pinyin": "我___到。",
            "question_english": "I just arrived."
        },
        {
            "type": "fill_blank",
            "question": "Fill in: I've already eaten.",
            "correct": "已经",
            "options": ["已经", "刚", "才", "还"],
            "option_pinyin": ["yǐ jīng", "gāng", "cái", "hái"],
            "question_chinese": "我___吃了。",
            "question_pinyin": "我___吃了。",
            "question_english": "I've already eaten."
        },
    ],

    'hsk3_l7_g3': [  # 不…就… / 不…才…
        {
            "type": "multiple_choice",
            "question": "What does 不...就... express?",
            "correct": "If not X, then Y (a consequence follows)",
            "options": [
                "If not X, then Y (a consequence follows)",
                "Not until X (delay before result)",
                "Not only X but also Y",
                "Neither X nor Y"
            ],
            "option_pinyin": ["bù...jiù...", "bù...cái...", "bù dàn...ér qiě...", "jì bù...yě bù..."]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: If you don't sleep early, you'll be tired.",
            "correct": "就",
            "options": ["就", "才", "都", "也"],
            "option_pinyin": ["jiù", "cái", "dōu", "yě"],
            "question_chinese": "不早点睡___会累。",
            "question_pinyin": "不早点睡___会累。",
            "question_english": "If you don't sleep early, you'll be tired."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence is correct?",
            "correct": "不努力就不会进步。",
            "options": [
                "不努力就不会进步。",
                "就不努力不会进步。",
                "不努力不就会进步。",
                "不会进步就不努力。"
            ],
            "option_pinyin": [
                "bù nǔ lì jiù bù huì jìn bù",
                "jiù bù nǔ lì bù huì jìn bù",
                "bù nǔ lì bù jiù huì jìn bù",
                "bù huì jìn bù jiù bù nǔ lì"
            ]
        },
    ],

    # ── L8 ────────────────────────────────────────────────────────────────────
    'hsk3_l8_g1': [  # 一...就...
        {
            "type": "multiple_choice",
            "question": "What does 一...就... express?",
            "correct": "As soon as action 1 happens, action 2 immediately follows",
            "options": [
                "As soon as action 1 happens, action 2 immediately follows",
                "Either action 1 or action 2",
                "Action 1 happens slowly, then action 2",
                "Action 1 and action 2 never happen together"
            ],
            "option_pinyin": ["yī...jiù...", "huò zhě...huò zhě...", "màn man...zài...", "cóng bù..."]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: As soon as I get home, I sleep.",
            "correct": "就",
            "options": ["就", "才", "都", "也"],
            "option_pinyin": ["jiù", "cái", "dōu", "yě"],
            "question_chinese": "我一回家___睡觉。",
            "question_pinyin": "我一回家___睡觉。",
            "question_english": "As soon as I get home, I sleep."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence is correct?",
            "correct": "他一看到我就笑了。",
            "options": [
                "他一看到我就笑了。",
                "他就一看到我笑了。",
                "一他看到我就笑了。",
                "他看到我一就笑了。"
            ],
            "option_pinyin": [
                "tā yī kàn dào wǒ jiù xiào le",
                "tā jiù yī kàn dào wǒ xiào le",
                "yī tā kàn dào wǒ jiù xiào le",
                "tā kàn dào wǒ yī jiù xiào le"
            ]
        },
    ],

    'hsk3_l8_g2': [  # 不管/无论...都/也...
        {
            "type": "multiple_choice",
            "question": "不管/无论...都... expresses that...",
            "correct": "The result is true regardless of the condition",
            "options": [
                "The result is true regardless of the condition",
                "The result depends on the condition",
                "The condition and result are unrelated",
                "Neither the condition nor result matters"
            ],
            "option_pinyin": ["bù guǎn...dōu...", "rú guǒ...jiù...", "suī rán...dàn shì...", "jì rán...jiù..."]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: No matter how tired I am, I exercise.",
            "correct": "不管",
            "options": ["不管", "虽然", "因为", "如果"],
            "option_pinyin": ["bù guǎn", "suī rán", "yīn wèi", "rú guǒ"],
            "question_chinese": "___多累，我都锻炼。",
            "question_pinyin": "___多累，我都锻炼。",
            "question_english": "No matter how tired I am, I exercise."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence is correct?",
            "correct": "无论多难，他都坚持。",
            "options": [
                "无论多难，他都坚持。",
                "他无论多难都坚持。",
                "无论他多难，坚持都。",
                "都无论多难，他坚持。"
            ],
            "option_pinyin": [
                "wú lùn duō nán tā dōu jiān chí",
                "tā wú lùn duō nán dōu jiān chí",
                "wú lùn tā duō nán jiān chí dōu",
                "dōu wú lùn duō nán tā jiān chí"
            ]
        },
    ],

    'hsk3_l8_g3': [  # 疑问代词的活用
        {
            "type": "multiple_choice",
            "question": "In 你去哪儿我就去哪儿, the second 哪儿 means...",
            "correct": "Wherever (indefinite pronoun, not a real question)",
            "options": [
                "Wherever (indefinite pronoun, not a real question)",
                "Where exactly? (asking a question)",
                "Nowhere",
                "Here"
            ],
            "option_pinyin": ["nǎ r", "nǎ r?", "nǎ r yě bù", "zhè r"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: He eats everything.",
            "correct": "都",
            "options": ["都", "也", "还", "就"],
            "option_pinyin": ["dōu", "yě", "hái", "jiù"],
            "question_chinese": "他什么___吃。",
            "question_pinyin": "他什么___吃。",
            "question_english": "He eats everything."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence uses a question word as an indefinite pronoun?",
            "correct": "你喜欢什么，我就买什么。",
            "options": [
                "你喜欢什么，我就买什么。",
                "你喜欢什么？",
                "我不知道你喜欢什么。",
                "你喜欢什么东西？"
            ],
            "option_pinyin": [
                "nǐ xǐ huān shén me wǒ jiù mǎi shén me",
                "nǐ xǐ huān shén me",
                "wǒ bù zhī dào nǐ xǐ huān shén me",
                "nǐ xǐ huān shén me dōng xi"
            ]
        },
    ],

    # ── L9 ────────────────────────────────────────────────────────────────────
    'hsk3_l9_g1': [  # A比B还/更+Adj
        {
            "type": "multiple_choice",
            "question": "What do 还 and 更 add to a 比 sentence?",
            "correct": "They intensify the comparison — 'even more...' than a simple 比",
            "options": [
                "They intensify the comparison — 'even more...' than a simple 比",
                "They weaken the comparison",
                "They change it to a question",
                "They make it a negative comparison"
            ],
            "option_pinyin": ["hái / gèng", "yì diǎn yě bù", "ma?", "méi yǒu bǐ"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: She is even more beautiful than her sister.",
            "correct": "更",
            "options": ["更", "很", "也", "比"],
            "option_pinyin": ["gèng", "hěn", "yě", "bǐ"],
            "question_chinese": "她比姐姐___漂亮。",
            "question_pinyin": "她比姐姐___漂亮。",
            "question_english": "She is even more beautiful than her sister."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence is correct?",
            "correct": "他比我还厉害。",
            "options": [
                "他比我还厉害。",
                "他比我很厉害。",
                "他比我太厉害。",
                "他比我非常厉害。"
            ],
            "option_pinyin": [
                "tā bǐ wǒ hái lì hài",
                "tā bǐ wǒ hěn lì hài",
                "tā bǐ wǒ tài lì hài",
                "tā bǐ wǒ fēi cháng lì hài"
            ]
        },
    ],

    'hsk3_l9_g2': [  # 像...一样...
        {
            "type": "multiple_choice",
            "question": "像...一样 is used for...",
            "correct": "Similes and comparisons of equality (like / as...as...)",
            "options": [
                "Similes and comparisons of equality (like / as...as...)",
                "Contrasting two things",
                "Expressing a gradual change",
                "Expressing surprise"
            ],
            "option_pinyin": ["xiàng...yī yàng...", "dàn shì...", "yuè lái yuè...", "zhēn...a"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: He speaks as well as a Chinese person.",
            "correct": "一样",
            "options": ["一样", "一起", "一共", "一定"],
            "option_pinyin": ["yī yàng", "yī qǐ", "yī gòng", "yī dìng"],
            "question_chinese": "他说得像中国人___好。",
            "question_pinyin": "他说得像中国人___好。",
            "question_english": "He speaks as well as a Chinese person."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence is correct?",
            "correct": "她唱得像歌手一样好。",
            "options": [
                "她唱得像歌手一样好。",
                "她唱得一样像歌手好。",
                "她像唱得歌手一样好。",
                "一样她唱得像歌手好。"
            ],
            "option_pinyin": [
                "tā chàng de xiàng gē shǒu yī yàng hǎo",
                "tā chàng de yī yàng xiàng gē shǒu hǎo",
                "tā xiàng chàng de gē shǒu yī yàng hǎo",
                "yī yàng tā chàng de xiàng gē shǒu hǎo"
            ]
        },
    ],

    'hsk3_l9_g3': [  # V得+Adj — Degree Complements
        {
            "type": "multiple_choice",
            "question": "Verb + 得 + Adjective describes...",
            "correct": "How well or to what degree an action is performed",
            "options": [
                "How well or to what degree an action is performed",
                "How long an action lasted",
                "How many times an action happened",
                "Whether an action is possible"
            ],
            "option_pinyin": ["shuō de hǎo", "shuō le duō jiǔ", "shuō le jǐ cì", "shuō de liǎo"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: She speaks very fluently.",
            "correct": "得",
            "options": ["得", "了", "着", "过"],
            "option_pinyin": ["de", "le", "zhe", "guò"],
            "question_chinese": "她说___很流利。",
            "question_pinyin": "她说___很流利。",
            "question_english": "She speaks very fluently."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence is correct?",
            "correct": "他写得很漂亮。",
            "options": [
                "他写得很漂亮。",
                "他很漂亮写得。",
                "他写很漂亮得。",
                "得他写很漂亮。"
            ],
            "option_pinyin": [
                "tā xiě de hěn piào liang",
                "tā hěn piào liang xiě de",
                "tā xiě hěn piào liang de",
                "de tā xiě hěn piào liang"
            ]
        },
    ],

    # ── L10 ───────────────────────────────────────────────────────────────────
    'hsk3_l10_g1': [  # A比B+Adj+多了
        {
            "type": "multiple_choice",
            "question": "What does 多了 after an adjective in a 比 sentence emphasise?",
            "correct": "A big degree of difference (much more...)",
            "options": [
                "A big degree of difference (much more...)",
                "A small difference",
                "Exact equality",
                "A decreasing difference"
            ],
            "option_pinyin": ["duō le", "yī diǎn", "yī yàng", "yuè lái yuè shǎo"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Maths is much harder than history.",
            "correct": "多了",
            "options": ["多了", "一样", "也", "很"],
            "option_pinyin": ["duō le", "yī yàng", "yě", "hěn"],
            "question_chinese": "数学比历史难___。",
            "question_pinyin": "数学比历史难___。",
            "question_english": "Maths is much harder than history."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence is correct?",
            "correct": "今天比昨天热多了。",
            "options": [
                "今天比昨天热多了。",
                "今天比昨天多了热。",
                "多了今天比昨天热。",
                "今天多了比昨天热。"
            ],
            "option_pinyin": [
                "jīn tiān bǐ zuó tiān rè duō le",
                "jīn tiān bǐ zuó tiān duō le rè",
                "duō le jīn tiān bǐ zuó tiān rè",
                "jīn tiān duō le bǐ zuó tiān rè"
            ]
        },
    ],

    'hsk3_l10_g2': [  # 些
        {
            "type": "multiple_choice",
            "question": "一些 in a sentence means...",
            "correct": "Some / a few (placed before a noun)",
            "options": [
                "Some / a few (placed before a noun)",
                "All / every",
                "None / not any",
                "Too many"
            ],
            "option_pinyin": ["yì xiē", "suǒ yǒu", "yī gè yě méi", "tài duō le"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: I have some questions.",
            "correct": "一些",
            "options": ["一些", "很多", "没有", "所有"],
            "option_pinyin": ["yì xiē", "hěn duō", "méi yǒu", "suǒ yǒu"],
            "question_chinese": "我有___问题想问。",
            "question_pinyin": "我有___问题想问。",
            "question_english": "I have some questions to ask."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence uses 些 correctly?",
            "correct": "这些问题很难。",
            "options": [
                "这些问题很难。",
                "问题这些很难。",
                "很难这些问题。",
                "这问题些很难。"
            ],
            "option_pinyin": [
                "zhè xiē wèn tí hěn nán",
                "wèn tí zhè xiē hěn nán",
                "hěn nán zhè xiē wèn tí",
                "zhè wèn tí xiē hěn nán"
            ]
        },
    ],

    'hsk3_l10_g3': [  # 数量补语
        {
            "type": "multiple_choice",
            "question": "A quantitative complement (数量补语) tells us...",
            "correct": "How much or how long an action happened",
            "options": [
                "How much or how long an action happened",
                "How well an action was performed",
                "Whether an action is possible",
                "How many people did the action"
            ],
            "option_pinyin": ["shù liàng", "chéng dù", "kě néng xìng", "rén shù"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: I revised for three hours.",
            "correct": "了",
            "options": ["了", "得", "着", "过"],
            "option_pinyin": ["le", "de", "zhe", "guò"],
            "question_chinese": "我复习___三个小时。",
            "question_pinyin": "我复习___三个小时。",
            "question_english": "I revised for three hours."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence is correct?",
            "correct": "他学了两个小时的数学。",
            "options": [
                "他学了两个小时的数学。",
                "他学数学两个小时了。",
                "他两个小时学了数学。",
                "数学他学了两个小时。"
            ],
            "option_pinyin": [
                "tā xué le liǎng gè xiǎo shí de shù xué",
                "tā xué shù xué liǎng gè xiǎo shí le",
                "tā liǎng gè xiǎo shí xué le shù xué",
                "shù xué tā xué le liǎng gè xiǎo shí"
            ]
        },
    ],

    # ── L11 ───────────────────────────────────────────────────────────────────
    'hsk3_l11_g1': [  # 把字句（1）
        {
            "type": "multiple_choice",
            "question": "In a 把 sentence, the verb must be followed by...",
            "correct": "A complement (了, 开, 上, etc.) — bare verbs are not allowed",
            "options": [
                "A complement (了, 开, 上, etc.) — bare verbs are not allowed",
                "An object",
                "A time expression",
                "A subject"
            ],
            "option_pinyin": ["bǎ + obj + V + complement", "bǎ + obj", "bǎ + time", "bǎ + subj"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: I turned off the air conditioner.",
            "correct": "把",
            "options": ["把", "被", "让", "给"],
            "option_pinyin": ["bǎ", "bèi", "ràng", "gěi"],
            "question_chinese": "我___空调关了。",
            "question_pinyin": "我___空调关了。",
            "question_english": "I turned off the air conditioner."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence is correct?",
            "correct": "请把窗户关上。",
            "options": [
                "请把窗户关上。",
                "请窗户把关上。",
                "请关上把窗户。",
                "把请窗户关上。"
            ],
            "option_pinyin": [
                "qǐng bǎ chuāng hu guān shàng",
                "qǐng chuāng hu bǎ guān shàng",
                "qǐng guān shàng bǎ chuāng hu",
                "bǎ qǐng chuāng hu guān shàng"
            ]
        },
    ],

    'hsk3_l11_g2': [  # 句末「了2」
        {
            "type": "multiple_choice",
            "question": "Sentence-final 了 (了₂) signals...",
            "correct": "A change of state or new situation",
            "options": [
                "A change of state or new situation",
                "A completed action (same as V+了)",
                "A past experience",
                "An ongoing action"
            ],
            "option_pinyin": ["le₂", "le₁", "guò", "zhe"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: It's raining now. (wasn't before)",
            "correct": "了",
            "options": ["了", "的", "着", "过"],
            "option_pinyin": ["le", "de", "zhe", "guò"],
            "question_chinese": "下雨___。",
            "question_pinyin": "下雨___。",
            "question_english": "It's raining now."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence uses sentence-final 了 to signal a new situation?",
            "correct": "春天来了。",
            "options": [
                "春天来了。",
                "他来了三次。",
                "他来了以后睡觉。",
                "你来了吗？"
            ],
            "option_pinyin": [
                "chūn tiān lái le",
                "tā lái le sān cì",
                "tā lái le yǐ hòu shuì jiào",
                "nǐ lái le ma"
            ]
        },
    ],

    'hsk3_l11_g3': [  # 别...了
        {
            "type": "multiple_choice",
            "question": "What does 别 + Verb (+ 了) mean?",
            "correct": "Don't / Stop doing something",
            "options": [
                "Don't / Stop doing something",
                "Please do something",
                "You should do something",
                "You must do something"
            ],
            "option_pinyin": ["bié...le", "qǐng...", "yīng gāi...", "bì xū..."]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Don't waste electricity.",
            "correct": "别",
            "options": ["别", "不", "没", "要"],
            "option_pinyin": ["bié", "bù", "méi", "yào"],
            "question_chinese": "___浪费电了。",
            "question_pinyin": "___浪费电了。",
            "question_english": "Don't waste electricity."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence is correct?",
            "correct": "别忘了关灯。",
            "options": [
                "别忘了关灯。",
                "别了忘关灯。",
                "忘了别关灯。",
                "关灯别忘了。"
            ],
            "option_pinyin": [
                "bié wàng le guān dēng",
                "bié le wàng guān dēng",
                "wàng le bié guān dēng",
                "guān dēng bié wàng le"
            ]
        },
    ],

    # ── L12 ───────────────────────────────────────────────────────────────────
    'hsk3_l12_g1': [  # 把字句（2）
        {
            "type": "multiple_choice",
            "question": "Which verbs CANNOT be used in a 把 sentence?",
            "correct": "Verbs of cognition and emotion (知道, 喜欢, 是, 有)",
            "options": [
                "Verbs of cognition and emotion (知道, 喜欢, 是, 有)",
                "Action verbs (放, 拿, 搬)",
                "Verbs with result complements",
                "Directional verbs"
            ],
            "option_pinyin": ["zhī dào / xǐ huān", "fàng / ná / bān", "V + result", "V + 来/去"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Put the book back.",
            "correct": "把",
            "options": ["把", "被", "让", "叫"],
            "option_pinyin": ["bǎ", "bèi", "ràng", "jiào"],
            "question_chinese": "___书放回去。",
            "question_pinyin": "___书放回去。",
            "question_english": "Put the book back."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence is correct?",
            "correct": "她把东西放好了。",
            "options": [
                "她把东西放好了。",
                "她放把东西好了。",
                "把她东西放好了。",
                "她东西把放好了。"
            ],
            "option_pinyin": [
                "tā bǎ dōng xi fàng hǎo le",
                "tā fàng bǎ dōng xi hǎo le",
                "bǎ tā dōng xi fàng hǎo le",
                "tā dōng xi bǎ fàng hǎo le"
            ]
        },
    ],

    'hsk3_l12_g2': [  # 被字句
        {
            "type": "multiple_choice",
            "question": "The 被 sentence pattern is...",
            "correct": "Object + 被 + (Agent) + Verb + Complement",
            "options": [
                "Object + 被 + (Agent) + Verb + Complement",
                "Subject + 被 + Verb + Object",
                "Agent + 被 + Object + Verb",
                "被 + Verb + Object + Subject"
            ],
            "option_pinyin": [
                "obj + bèi + (agent) + V + comp",
                "subj + bèi + V + obj",
                "agent + bèi + obj + V",
                "bèi + V + obj + subj"
            ]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: My wallet was stolen.",
            "correct": "被",
            "options": ["被", "把", "让", "给"],
            "option_pinyin": ["bèi", "bǎ", "ràng", "gěi"],
            "question_chinese": "我的钱包___偷了。",
            "question_pinyin": "我的钱包___偷了。",
            "question_english": "My wallet was stolen."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence is correct?",
            "correct": "东西被人拿走了。",
            "options": [
                "东西被人拿走了。",
                "被东西人拿走了。",
                "人被东西拿走了。",
                "东西人被拿走了。"
            ],
            "option_pinyin": [
                "dōng xi bèi rén ná zǒu le",
                "bèi dōng xi rén ná zǒu le",
                "rén bèi dōng xi ná zǒu le",
                "dōng xi rén bèi ná zǒu le"
            ]
        },
    ],

    'hsk3_l12_g3': [  # 放在/拿到
        {
            "type": "multiple_choice",
            "question": "放在 + Place expresses...",
            "correct": "Putting something at/in a place (action + result location)",
            "options": [
                "Putting something at/in a place (action + result location)",
                "Taking something from a place",
                "Moving towards a place",
                "Losing something at a place"
            ],
            "option_pinyin": ["fàng zài", "ná zǒu", "wǎng", "diū zài"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Put the book on the desk.",
            "correct": "在",
            "options": ["在", "到", "了", "上"],
            "option_pinyin": ["zài", "dào", "le", "shàng"],
            "question_chinese": "把书放___桌子上。",
            "question_pinyin": "把书放___桌子上。",
            "question_english": "Put the book on the desk."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence is correct?",
            "correct": "请把钥匙放在门口。",
            "options": [
                "请把钥匙放在门口。",
                "请放在把钥匙门口。",
                "请在把钥匙放门口。",
                "请把在钥匙放门口。"
            ],
            "option_pinyin": [
                "qǐng bǎ yào shi fàng zài mén kǒu",
                "qǐng fàng zài bǎ yào shi mén kǒu",
                "qǐng zài bǎ yào shi fàng mén kǒu",
                "qǐng bǎ zài yào shi fàng mén kǒu"
            ]
        },
    ],

    # ── L13 ───────────────────────────────────────────────────────────────────
    'hsk3_l13_g1': [  # 是...的 Structure
        {
            "type": "multiple_choice",
            "question": "是...的 is used to emphasise...",
            "correct": "HOW, WHEN, WHERE, or WITH WHOM a past action was done",
            "options": [
                "HOW, WHEN, WHERE, or WITH WHOM a past action was done",
                "Whether an action happened or not",
                "How long an action took",
                "How many times an action happened"
            ],
            "option_pinyin": ["shì...de", "yǒu méi yǒu", "duō jiǔ", "jǐ cì"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: I came here by walking.",
            "correct": "的",
            "options": ["的", "了", "过", "着"],
            "option_pinyin": ["de", "le", "guò", "zhe"],
            "question_chinese": "我是走回来___。",
            "question_pinyin": "我是走回来___。",
            "question_english": "I came here by walking."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence is correct?",
            "correct": "他是坐地铁来的。",
            "options": [
                "他是坐地铁来的。",
                "他坐地铁是来的。",
                "是他坐地铁来的。",
                "他坐是地铁来的。"
            ],
            "option_pinyin": [
                "tā shì zuò dì tiě lái de",
                "tā zuò dì tiě shì lái de",
                "shì tā zuò dì tiě lái de",
                "tā zuò shì dì tiě lái de"
            ]
        },
    ],

    'hsk3_l13_g2': [  # 几种交通方式
        {
            "type": "multiple_choice",
            "question": "Which verb is used for riding a bike?",
            "correct": "骑 (qí)",
            "options": ["骑 (qí)", "坐 (zuò)", "开 (kāi)", "走 (zǒu)"],
            "option_pinyin": ["qí", "zuò", "kāi", "zǒu"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: He takes the subway to work.",
            "correct": "地铁",
            "options": ["地铁", "公交车", "骑车", "步行"],
            "option_pinyin": ["dì tiě", "gōng jiāo chē", "qí chē", "bù xíng"],
            "question_chinese": "他坐___上班。",
            "question_pinyin": "他坐___上班。",
            "question_english": "He takes the subway to work."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence is correct?",
            "correct": "我是骑车来的。",
            "options": [
                "我是骑车来的。",
                "我是坐车骑来的。",
                "我骑是车来的。",
                "骑车是我来的。"
            ],
            "option_pinyin": [
                "wǒ shì qí chē lái de",
                "wǒ shì zuò chē qí lái de",
                "wǒ qí shì chē lái de",
                "qí chē shì wǒ lái de"
            ]
        },
    ],

    'hsk3_l13_g3': [  # 是...的 否定与疑问
        {
            "type": "multiple_choice",
            "question": "The negative form of 是...的 is...",
            "correct": "不是...的",
            "options": [
                "不是...的",
                "没有...的",
                "不...的",
                "不...是...的"
            ],
            "option_pinyin": ["bú shì...de", "méi yǒu...de", "bù...de", "bù...shì...de"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: I didn't walk here, I came by vehicle.",
            "correct": "是",
            "options": ["是", "在", "有", "去"],
            "option_pinyin": ["shì", "zài", "yǒu", "qù"],
            "question_chinese": "我不是走来的，___坐车来的。",
            "question_pinyin": "我不是走来的，___坐车来的。",
            "question_english": "I didn't walk here, I came by vehicle."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence is correct?",
            "correct": "你是怎么来的？",
            "options": [
                "你是怎么来的？",
                "你怎么是来的？",
                "是你怎么来的？",
                "你来是怎么的？"
            ],
            "option_pinyin": [
                "nǐ shì zěn me lái de",
                "nǐ zěn me shì lái de",
                "shì nǐ zěn me lái de",
                "nǐ lái shì zěn me de"
            ]
        },
    ],

    # ── L14 ───────────────────────────────────────────────────────────────────
    'hsk3_l14_g1': [  # 趋向补语
        {
            "type": "multiple_choice",
            "question": "In directional complements, 来 and 去 indicate...",
            "correct": "来 = motion towards speaker; 去 = motion away from speaker",
            "options": [
                "来 = motion towards speaker; 去 = motion away from speaker",
                "来 = motion away; 去 = towards speaker",
                "Both mean the same direction",
                "来 = completed; 去 = not completed"
            ],
            "option_pinyin": ["lái / qù", "qù / lái", "same", "le / wèi wán"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Please come in. (towards speaker)",
            "correct": "来",
            "options": ["来", "去", "回", "过"],
            "option_pinyin": ["lái", "qù", "huí", "guò"],
            "question_chinese": "请进___！",
            "question_pinyin": "请进___！",
            "question_english": "Please come in!"
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence is correct?",
            "correct": "你快出来！",
            "options": [
                "你快出来！",
                "你快来出！",
                "来你快出！",
                "你出快来！"
            ],
            "option_pinyin": [
                "nǐ kuài chū lái",
                "nǐ kuài lái chū",
                "lái nǐ kuài chū",
                "nǐ chū kuài lái"
            ]
        },
    ],

    'hsk3_l14_g2': [  # 把字句 + 趋向补语
        {
            "type": "multiple_choice",
            "question": "Subject + 把 + Object + Verb + Directional Complement expresses...",
            "correct": "Both the disposal action and the direction of the result",
            "options": [
                "Both the disposal action and the direction of the result",
                "Only the direction of movement",
                "Only what was done to the object",
                "A passive action"
            ],
            "option_pinyin": ["bǎ + obj + V + dir", "dir only", "bǎ only", "bèi"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Please bring the fruit over here.",
            "correct": "过",
            "options": ["过", "上", "下", "出"],
            "option_pinyin": ["guò", "shàng", "xià", "chū"],
            "question_chinese": "请把水果拿___来。",
            "question_pinyin": "请把水果拿___来。",
            "question_english": "Please bring the fruit over here."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence is correct?",
            "correct": "把书搬进去吧。",
            "options": [
                "把书搬进去吧。",
                "书把搬进去吧。",
                "把搬书进去吧。",
                "搬把书进去吧。"
            ],
            "option_pinyin": [
                "bǎ shū bān jìn qù ba",
                "shū bǎ bān jìn qù ba",
                "bǎ bān shū jìn qù ba",
                "bān bǎ shū jìn qù ba"
            ]
        },
    ],

    'hsk3_l14_g3': [  # 起来 的特殊用法
        {
            "type": "multiple_choice",
            "question": "When 起来 follows a verb (e.g. 唱起来), it means...",
            "correct": "Start to (the action begins)",
            "options": [
                "Start to (the action begins)",
                "Finish doing (the action ends)",
                "Do again",
                "Do slowly"
            ],
            "option_pinyin": ["qǐ lái = start", "qǐ lái = finish", "zài", "màn man"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: He started laughing.",
            "correct": "起来",
            "options": ["起来", "下去", "出来", "回来"],
            "option_pinyin": ["qǐ lái", "xià qù", "chū lái", "huí lái"],
            "question_chinese": "他笑___了。",
            "question_pinyin": "他笑___了。",
            "question_english": "He started laughing."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence uses 起来 to mean 'seems/looks like'?",
            "correct": "看起来很好吃。",
            "options": [
                "看起来很好吃。",
                "他站起来了。",
                "唱起来很开心。",
                "他跑起来了。"
            ],
            "option_pinyin": [
                "kàn qǐ lái hěn hǎo chī",
                "tā zhàn qǐ lái le",
                "chàng qǐ lái hěn kāi xīn",
                "tā pǎo qǐ lái le"
            ]
        },
    ],

    # ── L15 ───────────────────────────────────────────────────────────────────
    'hsk3_l15_g1': [  # 几乎/基本上/差不多
        {
            "type": "multiple_choice",
            "question": "Which word means 'almost (very close to 100%, near complete)'?",
            "correct": "几乎 (jī hū)",
            "options": ["几乎 (jī hū)", "基本上 (jī běn shàng)", "差不多 (chà bu duō)", "大概 (dà gài)"],
            "option_pinyin": ["jī hū", "jī běn shàng", "chà bu duō", "dà gài"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Almost everyone came.",
            "correct": "几乎",
            "options": ["几乎", "基本上", "差不多", "大概"],
            "option_pinyin": ["jī hū", "jī běn shàng", "chà bu duō", "dà gài"],
            "question_chinese": "___所有人都来了。",
            "question_pinyin": "___所有人都来了。",
            "question_english": "Almost everyone came."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence is correct?",
            "correct": "基本上没问题。",
            "options": [
                "基本上没问题。",
                "没基本上问题。",
                "问题基本上没。",
                "基本没上问题。"
            ],
            "option_pinyin": [
                "jī běn shàng méi wèn tí",
                "méi jī běn shàng wèn tí",
                "wèn tí jī běn shàng méi",
                "jī běn méi shàng wèn tí"
            ]
        },
    ],

    'hsk3_l15_g2': [  # 不但...而且...
        {
            "type": "multiple_choice",
            "question": "不但...而且 expresses...",
            "correct": "Not only A, but also B (B is typically stronger than A)",
            "options": [
                "Not only A, but also B (B is typically stronger than A)",
                "Either A or B",
                "Neither A nor B",
                "A, but not B"
            ],
            "option_pinyin": ["bú dàn...ér qiě...", "huò zhě...huò zhě...", "jì bù...yě bù...", "suī rán...dàn shì..."]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: He not only works hard, but also is smart.",
            "correct": "不但",
            "options": ["不但", "虽然", "因为", "如果"],
            "option_pinyin": ["bú dàn", "suī rán", "yīn wèi", "rú guǒ"],
            "question_chinese": "他___努力，而且很聪明。",
            "question_pinyin": "他___努力，而且很聪明。",
            "question_english": "He not only works hard, but also is smart."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence is correct?",
            "correct": "她不但会唱歌，而且会跳舞。",
            "options": [
                "她不但会唱歌，而且会跳舞。",
                "她而且不但会唱歌，会跳舞。",
                "不但她会唱歌，而且跳舞。",
                "她会不但唱歌，而且跳舞。"
            ],
            "option_pinyin": [
                "tā bú dàn huì chàng gē ér qiě huì tiào wǔ",
                "tā ér qiě bú dàn huì chàng gē huì tiào wǔ",
                "bú dàn tā huì chàng gē ér qiě tiào wǔ",
                "tā huì bú dàn chàng gē ér qiě tiào wǔ"
            ]
        },
    ],

    'hsk3_l15_g3': [  # 疑问代词的灵活运用
        {
            "type": "multiple_choice",
            "question": "什么都 + Verb means...",
            "correct": "Everything / anything (question word as indefinite pronoun with 都)",
            "options": [
                "Everything / anything (question word as indefinite pronoun with 都)",
                "What exactly? (a real question)",
                "Nothing at all",
                "Something specific"
            ],
            "option_pinyin": ["shén me dōu", "shén me?", "shén me yě méi", "mǒu ge"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: She goes everywhere.",
            "correct": "都",
            "options": ["都", "也", "还", "就"],
            "option_pinyin": ["dōu", "yě", "hái", "jiù"],
            "question_chinese": "她哪里___去。",
            "question_pinyin": "她哪里___去。",
            "question_english": "She goes everywhere."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence uses question words as indefinite pronouns?",
            "correct": "他什么都吃，哪里都去。",
            "options": [
                "他什么都吃，哪里都去。",
                "他什么都不吃？",
                "他去哪里了？",
                "他什么时候来的？"
            ],
            "option_pinyin": [
                "tā shén me dōu chī nǎ lǐ dōu qù",
                "tā shén me dōu bù chī",
                "tā qù nǎ lǐ le",
                "tā shén me shí hòu lái de"
            ]
        },
    ],
}

# ── grammar key mapping ───────────────────────────────────────────────────────

GRAMMAR_KEYS = {
    7:  ['hsk3_l7_g1',  'hsk3_l7_g2',  'hsk3_l7_g3'],
    8:  ['hsk3_l8_g1',  'hsk3_l8_g2',  'hsk3_l8_g3'],
    9:  ['hsk3_l9_g1',  'hsk3_l9_g2',  'hsk3_l9_g3'],
    10: ['hsk3_l10_g1', 'hsk3_l10_g2', 'hsk3_l10_g3'],
    11: ['hsk3_l11_g1', 'hsk3_l11_g2', 'hsk3_l11_g3'],
    12: ['hsk3_l12_g1', 'hsk3_l12_g2', 'hsk3_l12_g3'],
    13: ['hsk3_l13_g1', 'hsk3_l13_g2', 'hsk3_l13_g3'],
    14: ['hsk3_l14_g1', 'hsk3_l14_g2', 'hsk3_l14_g3'],
    15: ['hsk3_l15_g1', 'hsk3_l15_g2', 'hsk3_l15_g3'],
}

# ── main processing ───────────────────────────────────────────────────────────

random.seed(42)
DATA_DIR = os.path.dirname(os.path.abspath(__file__))

for lesson_num in range(7, 16):
    path = os.path.join(DATA_DIR, f'hsk3_lesson_{lesson_num}.json')
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
