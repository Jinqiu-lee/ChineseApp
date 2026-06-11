"""
Generate mini_exercises for HSK4 Level 4 lessons 6-15.
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
# Words shared across multiple lessons use a single generic sentence.
# Duplicates: 质量(L6,L7) 温度(L8,L10) 危险(L8,L11) 坚持(L8,L9,L12)
#             积极(L9,L12) 减少(L9,L11) 发展(L11,L14) 重视(L12,L14) 艺术(L14,L15)

SENTENCES = {
    # L6 — Shopping & Consumer
    '购物': ('她喜欢去___。', 'She likes to go shopping.'),
    '打折': ('这家店在___，很便宜。', 'This store is having a sale; everything is cheap.'),
    '顾客': ('这家店的___很多。', 'This store has many customers.'),
    '售货员': ('那位___很热情。', 'That salesperson is very enthusiastic.'),
    '免费': ('这里的停车是___的。', 'Parking here is free.'),
    '优点': ('这个产品有很多___。', 'This product has many advantages.'),
    '缺点': ('这个计划也有___。', 'This plan has its flaws too.'),
    '质量': ('这件衣服的___很好。', 'The quality of this clothing is very good.'),
    '材料': ('这双鞋的___非常好。', 'The material of these shoes is excellent.'),
    '逛': ('我们去___街吧。', "Let's go window-shopping."),
    '合适': ('这件衣服很___。', 'This piece of clothing fits very well.'),
    '讨论': ('他们正在___这个问题。', 'They are discussing this issue.'),

    # L7 — Quality & Standards
    '标准': ('他的要求很高，___也很严。', 'His demands are high; the standard is strict too.'),
    '合格': ('他的成绩___了。', 'His grades have passed.'),
    '符合': ('这个产品___标准。', 'This product meets the standard.'),
    '相同': ('我们的想法___。', 'Our ideas are the same.'),
    '相反': ('他的意见和我的___。', 'His opinion is the opposite of mine.'),
    '区别': ('这两个词有什么___？', 'What is the difference between these two words?'),
    '普遍': ('这个问题很___。', 'This problem is very common.'),
    '实际': ('我们要注意___情况。', 'We need to pay attention to the actual situation.'),
    # 质量 already defined in L6
    '正确': ('你的答案是___的。', 'Your answer is correct.'),
    '确实': ('你说得___。', 'What you said is indeed true.'),
    '判断': ('很难___这件事对不对。', 'It is hard to judge whether this matter is right.'),

    # L8 — Health & Medicine
    '打针': ('医生给他___了。', 'The doctor gave him an injection.'),
    '咳嗽': ('他感冒了，一直在___。', 'He has a cold and keeps coughing.'),
    '皮肤': ('她的___很好。', 'Her skin is very good.'),
    '大夫': ('她去看___了。', 'She went to see the doctor.'),
    '护士': ('那位___很有耐心。', 'That nurse is very patient.'),
    '肚子': ('我___不舒服。', 'My stomach is uncomfortable.'),
    '汗': ('他跑步以后流了很多___。', 'He sweated a lot after running.'),
    '温度': ('今天的___很高。', 'The temperature today is very high.'),
    '危险': ('这里很___，要注意安全。', 'It is dangerous here; pay attention to safety.'),
    '减肥': ('她在___，不吃零食。', "She is dieting and doesn't eat snacks."),
    '坚持': ('要___每天锻炼。', 'Persist in exercising every day.'),
    '耐心': ('学习要有___。', 'You need patience when learning.'),

    # L9 — Lifestyle & Habits
    '积极': ('他的态度很___。', 'His attitude is very positive.'),
    '积累': ('知识需要慢慢___。', 'Knowledge needs to be accumulated gradually.'),
    '养成': ('你___好习惯了吗？', 'Have you formed good habits?'),
    # 坚持 already defined in L8
    '散步': ('我每天晚上出去___。', 'I go for a walk every evening.'),
    '活动': ('周末有什么___？', 'What activities are there on the weekend?'),
    '活泼': ('她的性格很___。', 'Her personality is very lively.'),
    '偶尔': ('我___去喝咖啡。', 'I occasionally go for coffee.'),
    '往往': ('他___工作到很晚。', 'He often ends up working until very late.'),
    '平时': ('我___六点起床。', 'I usually get up at six.'),
    '减少': ('我需要___糖的摄入。', 'I need to reduce my sugar intake.'),
    '改变': ('他___了自己的想法。', 'He changed his mind.'),

    # L10 — Nature & Environment
    '海洋': ('地球上大部分是___。', 'Most of the Earth is ocean.'),
    '森林': ('我们要保护___。', 'We must protect the forests.'),
    '地球': ('___只有一个，要保护它。', 'There is only one Earth; we must protect it.'),
    '植物': ('这种___很难养。', 'This type of plant is hard to grow.'),
    '叶子': ('秋天树上的___变黄了。', 'In autumn the leaves on the trees turn yellow.'),
    '云': ('天上有很多___。', 'There are many clouds in the sky.'),
    '阳光': ('今天___很好。', 'The sunshine is very good today.'),
    '气候': ('这里的___很温和。', 'The climate here is very mild.'),
    '污染': ('空气___越来越严重了。', 'Air pollution is getting more and more serious.'),
    # 温度 already defined in L8
    '自然': ('我们要保护___环境。', 'We must protect the natural environment.'),
    '深': ('这条河很___。', 'This river is very deep.'),

    # L11 — Weather & Change
    '降低': ('今天气温___了。', 'The temperature has dropped today.'),
    '降落': ('飞机准备___了。', 'The plane is preparing to land.'),
    '出现': ('一个新问题___了。', 'A new problem has appeared.'),
    '增加': ('公司的收入___了。', "The company's income has increased."),
    # 减少 already defined in L9
    '发展': ('这个城市___得很快。', 'This city is developing very quickly.'),
    '发生': ('昨天___了一件大事。', 'A big thing happened yesterday.'),
    # 危险 already defined in L8
    '暖和': ('今天天气很___。', 'The weather today is very warm.'),
    '凉快': ('山上比城市___。', 'The mountains are cooler than the city.'),
    '仍然': ('他___很努力。', 'He is still very hardworking.'),
    '担心': ('妈妈___我一个人在家。', 'Mom worries about me being home alone.'),

    # L12 — Perseverance & Achievement
    # 坚持 already defined in L8
    '勇敢': ('她很___，不害怕困难。', 'She is very brave and not afraid of difficulties.'),
    '获得': ('他___了第一名。', 'He obtained first place.'),
    '赢': ('我们___了比赛。', 'We won the competition.'),
    '失败': ('虽然___了，但我学到了很多。', 'Although I failed, I learned a lot.'),
    # 成功 defined in L4 (not in this script — need to include here as L12 uses it)
    '成功': ('他的努力让他___了。', 'His hard work led to his success.'),
    '竟然': ('他___忘了我们的约定。', 'He unexpectedly forgot our agreement.'),
    '重视': ('我们要___这个问题。', 'We must take this issue seriously.'),
    # 积极 already defined in L9
    '进行': ('会议正在___中。', 'The meeting is in progress.'),
    '结果': ('考试的___怎么样？', 'How were the exam results?'),
    '目的': ('你来这里的___是什么？', 'What is your purpose in coming here?'),
    '目标': ('我的___是学好汉语。', 'My goal is to learn Chinese well.'),

    # L13 — Happiness & Well-being
    '幸福': ('家人在一起很___。', 'Being with family is very happiness.'),
    '愉快': ('这是一次___的旅行。', 'This was a pleasant trip.'),
    '开心': ('见到你我很___。', 'I am very happy to see you.'),
    '满': ('这杯水___了。', 'This cup of water is full.'),
    '梦': ('我做了一个好___。', 'I had a good dream.'),
    '理想': ('他的___是当老师。', 'His ideal is to be a teacher.'),
    '永远': ('我___爱你。', 'I will love you forever.'),
    '关键': ('___是要坚持。', 'The key is to persevere.'),
    '总结': ('请___一下今天的内容。', "Please summarize today's content."),
    '原来': ('他___是一名老师。', 'It turns out he is a teacher.'),
    '原因': ('你知道___吗？', 'Do you know the reason?'),
    '感谢': ('我___你的帮助。', 'I thank you for your help.'),
    '轻松': ('周末过得很___。', 'The weekend was very relaxing.'),

    # L14 — Society & Knowledge
    '社会': ('我们生活在___中。', 'We live in society.'),
    '责任': ('他有___帮助别人。', 'He has a responsibility to help others.'),
    '法律': ('___面前人人平等。', 'Everyone is equal before the law.'),
    '教育': ('___非常重要。', 'Education is very important.'),
    '科学': ('___让生活更美好。', 'Science makes life better.'),
    '知识': ('学习___很重要。', 'Learning knowledge is very important.'),
    '语言': ('汉语是一种美丽的___。', 'Chinese is a beautiful language.'),
    '艺术': ('她很喜欢___。', 'She likes art very much.'),
    '民族': ('中国有五十六个___。', 'China has 56 ethnic groups.'),
    '国际': ('这是一个___会议。', 'This is an international conference.'),
    # 发展 already defined in L11
    # 重视 already defined in L12

    # L15 — Culture & Performance
    '京剧': ('她喜欢看___。', 'She likes watching Peking Opera.'),
    '演员': ('她是一位有名的___。', 'She is a famous actress.'),
    '演出': ('今晚有一场___。', 'There is a performance tonight.'),
    '表演': ('他的___很精彩。', 'His performance was wonderful.'),
    '功夫': ('他学了很多年___。', 'He has studied kung fu for many years.'),
    # 艺术 already defined in L14
    '著名': ('这是一家___的餐厅。', 'This is a famous restaurant.'),
    '阅读': ('她每天___半小时。', 'She reads for half an hour every day.'),
    '小说': ('这本___很有意思。', 'This novel is very interesting.'),
    '杂志': ('他喜欢看___。', 'He likes reading magazines.'),
    '吸引': ('这部电影___了很多观众。', 'This movie attracted many viewers.'),
    '精彩': ('这场比赛非常___。', 'This game was very exciting.'),
}

# ── handcrafted grammar mini exercises ───────────────────────────────────────

GRAMMAR_MINI = {

    # ── L6 ────────────────────────────────────────────────────────────────────
    'hsk4_l6_g1': [  # 值得 — Worth doing / Worthy of
        {
            "type": "multiple_choice",
            "question": "值得 + Verb means...",
            "correct": "Worth doing / Worthy of (the action is worth the effort)",
            "options": [
                "Worth doing / Worthy of (the action is worth the effort)",
                "Must do (obligation)",
                "Able to do (ability or permission)",
                "Finished doing (completion)"
            ],
            "option_pinyin": ["zhí de + V", "bì xū + V", "néng + V", "V + wán le"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: This book is worth reading.",
            "correct": "值得",
            "options": ["值得", "需要", "可以", "必须"],
            "option_pinyin": ["zhí de", "xū yào", "kě yǐ", "bì xū"],
            "question_chinese": "这本书___读。",
            "question_pinyin": "这本书___读。",
            "question_english": "This book is worth reading."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 值得?",
            "correct": "这家餐厅的菜值得一试。",
            "options": [
                "这家餐厅的菜值得一试。",
                "这家餐厅的菜一试值得。",
                "值得这家餐厅的菜一试。",
                "这家餐厅值得菜一试。"
            ],
            "option_pinyin": [
                "zhè jiā cān tīng de cài zhí de yī shì",
                "zhè jiā cān tīng de cài yī shì zhí de",
                "zhí de zhè jiā cān tīng de cài yī shì",
                "zhè jiā cān tīng zhí de cài yī shì"
            ]
        },
    ],

    'hsk4_l6_g2': [  # 尤其 — Especially / In particular
        {
            "type": "multiple_choice",
            "question": "尤其 is used to...",
            "correct": "Single out one item from a group as most notable: 'especially / in particular'",
            "options": [
                "Single out one item from a group as most notable: 'especially / in particular'",
                "List two equal items: 'both A and B'",
                "Contrast two opposites: 'A rather than B'",
                "Add a new unrelated point: 'besides / in addition'"
            ],
            "option_pinyin": ["yóu qí", "jì...yě...", "A ér fēi B", "lìng wài"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: He likes sports, especially swimming.",
            "correct": "尤其",
            "options": ["尤其", "另外", "而且", "虽然"],
            "option_pinyin": ["yóu qí", "lìng wài", "ér qiě", "suī rán"],
            "question_chinese": "他喜欢运动，___喜欢游泳。",
            "question_pinyin": "他喜欢运动，___喜欢游泳。",
            "question_english": "He likes sports, especially swimming."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 尤其?",
            "correct": "我喜欢中国食物，尤其是饺子。",
            "options": [
                "我喜欢中国食物，尤其是饺子。",
                "尤其我喜欢中国食物，是饺子。",
                "我尤其喜欢，中国食物是饺子。",
                "我喜欢尤其中国食物，是饺子。"
            ],
            "option_pinyin": [
                "wǒ xǐ huān zhōng guó shí wù yóu qí shì jiǎo zi",
                "yóu qí wǒ xǐ huān zhōng guó shí wù shì jiǎo zi",
                "wǒ yóu qí xǐ huān zhōng guó shí wù shì jiǎo zi",
                "wǒ xǐ huān yóu qí zhōng guó shí wù shì jiǎo zi"
            ]
        },
    ],

    'hsk4_l6_g3': [  # 另外 — Besides / In addition
        {
            "type": "multiple_choice",
            "question": "另外 expresses...",
            "correct": "In addition / Besides — introduces a separate, extra piece of information",
            "options": [
                "In addition / Besides — introduces a separate, extra piece of information",
                "On the contrary — introduces an opposing point",
                "As a result — introduces a consequence",
                "For example — introduces an illustration"
            ],
            "option_pinyin": ["lìng wài", "xiāng fǎn", "yīn cǐ", "bǐ rú"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: You need to bring your passport; besides, you also need your phone.",
            "correct": "另外",
            "options": ["另外", "而且", "但是", "所以"],
            "option_pinyin": ["lìng wài", "ér qiě", "dàn shì", "suǒ yǐ"],
            "question_chinese": "你需要带护照，___还要带手机。",
            "question_pinyin": "你需要带护照，___还要带手机。",
            "question_english": "You need to bring your passport; besides, you also need your phone."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 另外?",
            "correct": "这家店有折扣，另外还有免费赠品。",
            "options": [
                "这家店有折扣，另外还有免费赠品。",
                "这家店另外有折扣，还有免费赠品。",
                "另外这家店，有折扣还有免费赠品。",
                "这家店有折扣还有，另外免费赠品。"
            ],
            "option_pinyin": [
                "zhè jiā diàn yǒu zhé kòu lìng wài hái yǒu miǎn fèi zèng pǐn",
                "zhè jiā diàn lìng wài yǒu zhé kòu hái yǒu miǎn fèi zèng pǐn",
                "lìng wài zhè jiā diàn yǒu zhé kòu hái yǒu miǎn fèi zèng pǐn",
                "zhè jiā diàn yǒu zhé kòu hái yǒu lìng wài miǎn fèi zèng pǐn"
            ]
        },
    ],

    # ── L7 ────────────────────────────────────────────────────────────────────
    'hsk4_l7_g1': [  # 不管...都... — No matter...still...
        {
            "type": "multiple_choice",
            "question": "不管...都 expresses...",
            "correct": "No matter what X is, Y always applies (unconditional result)",
            "options": [
                "No matter what X is, Y always applies (unconditional result)",
                "As long as X, then Y (a condition)",
                "Although X, still Y (a concession)",
                "If X, then Y (a hypothesis)"
            ],
            "option_pinyin": ["bù guǎn...dōu...", "zhǐ yào...jiù...", "suī rán...dàn shì...", "rú guǒ...jiù..."]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: No matter whether it rains or is sunny, he will come.",
            "correct": "不管",
            "options": ["不管", "虽然", "只要", "如果"],
            "option_pinyin": ["bù guǎn", "suī rán", "zhǐ yào", "rú guǒ"],
            "question_chinese": "___下雨还是晴天，他都会来。",
            "question_pinyin": "___下雨还是晴天，他都会来。",
            "question_english": "No matter whether it rains or is sunny, he will come."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 不管...都?",
            "correct": "不管多难，他都不放弃。",
            "options": [
                "不管多难，他都不放弃。",
                "不管他多难，不放弃都。",
                "他不管都，多难不放弃。",
                "多难不管，都他不放弃。"
            ],
            "option_pinyin": [
                "bù guǎn duō nán tā dōu bù fàng qì",
                "bù guǎn tā duō nán bù fàng qì dōu",
                "tā bù guǎn dōu duō nán bù fàng qì",
                "duō nán bù guǎn dōu tā bù fàng qì"
            ]
        },
    ],

    'hsk4_l7_g2': [  # 只好 — Have no choice but to
        {
            "type": "multiple_choice",
            "question": "只好 means...",
            "correct": "Have no choice but to / can only do X (a reluctant necessity)",
            "options": [
                "Have no choice but to / can only do X (a reluctant necessity)",
                "Had better do X (advice or recommendation)",
                "Would like to do X (a wish or preference)",
                "Must do X by rule or regulation (obligation)"
            ],
            "option_pinyin": ["zhǐ hǎo", "zuì hǎo", "xiǎng yào", "bì xū"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: There are no more buses, so I have no choice but to walk home.",
            "correct": "只好",
            "options": ["只好", "必须", "最好", "应该"],
            "option_pinyin": ["zhǐ hǎo", "bì xū", "zuì hǎo", "yīng gāi"],
            "question_chinese": "没有公交车了，我___走路回家。",
            "question_pinyin": "没有公交车了，我___走路回家。",
            "question_english": "There are no more buses, so I have no choice but to walk home."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 只好?",
            "correct": "下雨了，她只好留在家里。",
            "options": [
                "下雨了，她只好留在家里。",
                "她只好下雨了，留在家里。",
                "只好下雨了，她留在家里。",
                "她留在家里只好，下雨了。"
            ],
            "option_pinyin": [
                "xià yǔ le tā zhǐ hǎo liú zài jiā lǐ",
                "tā zhǐ hǎo xià yǔ le liú zài jiā lǐ",
                "zhǐ hǎo xià yǔ le tā liú zài jiā lǐ",
                "tā liú zài jiā lǐ zhǐ hǎo xià yǔ le"
            ]
        },
    ],

    'hsk4_l7_g3': [  # 相比之下 — By comparison
        {
            "type": "multiple_choice",
            "question": "相比之下 is used to...",
            "correct": "Compare two things and highlight a difference: 'by comparison / compared to that'",
            "options": [
                "Compare two things and highlight a difference: 'by comparison / compared to that'",
                "Express agreement with what was just said",
                "Introduce an example to support a point",
                "Summarize the main ideas of a text"
            ],
            "option_pinyin": ["xiāng bǐ zhī xià", "biǎo shì tóng yì", "jǔ lì shuō míng", "zǒng jié"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: By comparison, this method is simpler.",
            "correct": "相比之下",
            "options": ["相比之下", "总的来说", "事实上", "另外"],
            "option_pinyin": ["xiāng bǐ zhī xià", "zǒng de lái shuō", "shì shí shàng", "lìng wài"],
            "question_chinese": "___，这个方法更简单。",
            "question_pinyin": "___，这个方法更简单。",
            "question_english": "By comparison, this method is simpler."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 相比之下?",
            "correct": "相比之下，这里的质量更好。",
            "options": [
                "相比之下，这里的质量更好。",
                "这里的质量相比之下，更好。",
                "相比这里的质量，之下更好。",
                "这里的更好，相比之下质量。"
            ],
            "option_pinyin": [
                "xiāng bǐ zhī xià zhè lǐ de zhì liàng gèng hǎo",
                "zhè lǐ de zhì liàng xiāng bǐ zhī xià gèng hǎo",
                "xiāng bǐ zhè lǐ de zhì liàng zhī xià gèng hǎo",
                "zhè lǐ de gèng hǎo xiāng bǐ zhī xià zhì liàng"
            ]
        },
    ],

    # ── L8 ────────────────────────────────────────────────────────────────────
    'hsk4_l8_g1': [  # 如果...就... — If...then... (advanced usage)
        {
            "type": "multiple_choice",
            "question": "如果...就 expresses...",
            "correct": "A conditional relationship: if condition A holds, then consequence B follows",
            "options": [
                "A conditional relationship: if condition A holds, then consequence B follows",
                "A concessive relationship: although A, still B",
                "A sequential relationship: first A, then B",
                "A causal relationship: because of A, B happened"
            ],
            "option_pinyin": ["rú guǒ...jiù...", "suī rán...dàn shì...", "xiān...rán hòu...", "yīn wèi...suǒ yǐ..."]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: If you have a fever, you should see a doctor.",
            "correct": "如果",
            "options": ["如果", "虽然", "因为", "既然"],
            "option_pinyin": ["rú guǒ", "suī rán", "yīn wèi", "jì rán"],
            "question_chinese": "___你发烧，就要去看医生。",
            "question_pinyin": "___你发烧，就要去看医生。",
            "question_english": "If you have a fever, you should see a doctor."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 如果...就?",
            "correct": "如果你坚持，就会成功。",
            "options": [
                "如果你坚持，就会成功。",
                "你如果就，坚持会成功。",
                "如果就你坚持，会成功。",
                "你坚持如果，就会成功。"
            ],
            "option_pinyin": [
                "rú guǒ nǐ jiān chí jiù huì chéng gōng",
                "nǐ rú guǒ jiù jiān chí huì chéng gōng",
                "rú guǒ jiù nǐ jiān chí huì chéng gōng",
                "nǐ jiān chí rú guǒ jiù huì chéng gōng"
            ]
        },
    ],

    'hsk4_l8_g2': [  # 来不及 / 来得及 — Not enough time / Still have time
        {
            "type": "multiple_choice",
            "question": "来不及 and 来得及 express...",
            "correct": "Whether there is enough time to do something (来得及 = still have time; 来不及 = no time left)",
            "options": [
                "Whether there is enough time to do something (来得及 = still have time; 来不及 = no time left)",
                "Whether someone is able to come (来得了 = can come; 来不了 = can't come)",
                "Whether an action is completed (完得了 = can finish; 完不了 = can't finish)",
                "Whether someone is willing to come (愿意来 = willing; 不愿意来 = unwilling)"
            ],
            "option_pinyin": ["lái de jí / lái bu jí", "lái de liǎo / lái bu liǎo", "wán de liǎo / wán bu liǎo", "yuàn yì lái / bù yuàn yì"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: If I leave now, I should still have time.",
            "correct": "来得及",
            "options": ["来得及", "来不及", "可以", "必须"],
            "option_pinyin": ["lái de jí", "lái bu jí", "kě yǐ", "bì xū"],
            "question_chinese": "我现在出发，应该___。",
            "question_pinyin": "我现在出发，应该___。",
            "question_english": "If I leave now, I should still have time."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 来不及?",
            "correct": "已经八点了，我们来不及了。",
            "options": [
                "已经八点了，我们来不及了。",
                "我们已经来不及八点了。",
                "八点来不及，已经我们了。",
                "我们来不及，八点已经了。"
            ],
            "option_pinyin": [
                "yǐ jīng bā diǎn le wǒ men lái bu jí le",
                "wǒ men yǐ jīng lái bu jí bā diǎn le",
                "bā diǎn lái bu jí yǐ jīng wǒ men le",
                "wǒ men lái bu jí bā diǎn yǐ jīng le"
            ]
        },
    ],

    'hsk4_l8_g3': [  # 受不了 — Cannot bear / Cannot stand
        {
            "type": "multiple_choice",
            "question": "受不了 means...",
            "correct": "Cannot stand / cannot bear (a situation is too much to endure)",
            "options": [
                "Cannot stand / cannot bear (a situation is too much to endure)",
                "Cannot receive something (unable to accept a delivery)",
                "Cannot be allowed (a prohibition)",
                "Cannot understand (a comprehension failure)"
            ],
            "option_pinyin": ["shòu bu liǎo", "jiē bu dào", "bù yǔn xǔ", "tīng bu dǒng"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: It is too hot today; I can't stand it.",
            "correct": "受不了",
            "options": ["受不了", "来不及", "来得及", "忍不住"],
            "option_pinyin": ["shòu bu liǎo", "lái bu jí", "lái de jí", "rěn bu zhù"],
            "question_chinese": "今天太热了，我___。",
            "question_pinyin": "今天太热了，我___。",
            "question_english": "It is too hot today; I can't stand it."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 受不了?",
            "correct": "他的咳嗽声太响了，我受不了。",
            "options": [
                "他的咳嗽声太响了，我受不了。",
                "我受不了，他的咳嗽声太响了。",
                "受不了我，他的咳嗽声太响了。",
                "他受不了咳嗽，声太响了我。"
            ],
            "option_pinyin": [
                "tā de ké sou shēng tài xiǎng le wǒ shòu bu liǎo",
                "wǒ shòu bu liǎo tā de ké sou shēng tài xiǎng le",
                "shòu bu liǎo wǒ tā de ké sou shēng tài xiǎng le",
                "tā shòu bu liǎo ké sou shēng tài xiǎng le wǒ"
            ]
        },
    ],

    # ── L9 ────────────────────────────────────────────────────────────────────
    'hsk4_l9_g1': [  # 养成 — To cultivate / To form a habit
        {
            "type": "multiple_choice",
            "question": "养成 most commonly collocates with...",
            "correct": "习惯 (habit): 养成习惯 = to form / develop a habit",
            "options": [
                "习惯 (habit): 养成习惯 = to form / develop a habit",
                "成绩 (grades): 养成成绩 = to build grades",
                "工作 (work): 养成工作 = to cultivate work",
                "时间 (time): 养成时间 = to develop time"
            ],
            "option_pinyin": ["yǎng chéng xí guàn", "yǎng chéng chéng jì", "yǎng chéng gōng zuò", "yǎng chéng shí jiān"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: You should cultivate good habits.",
            "correct": "养成",
            "options": ["养成", "形成", "完成", "达成"],
            "option_pinyin": ["yǎng chéng", "xíng chéng", "wán chéng", "dá chéng"],
            "question_chinese": "你应该___好习惯。",
            "question_pinyin": "你应该___好习惯。",
            "question_english": "You should cultivate good habits."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 养成?",
            "correct": "他养成了每天读书的习惯。",
            "options": [
                "他养成了每天读书的习惯。",
                "他习惯了养成每天读书的。",
                "养成他了每天读书的习惯。",
                "他每天读书养成了，习惯。"
            ],
            "option_pinyin": [
                "tā yǎng chéng le měi tiān dú shū de xí guàn",
                "tā xí guàn le yǎng chéng měi tiān dú shū de",
                "yǎng chéng tā le měi tiān dú shū de xí guàn",
                "tā měi tiān dú shū yǎng chéng le xí guàn"
            ]
        },
    ],

    'hsk4_l9_g2': [  # 积累 — To accumulate gradually
        {
            "type": "multiple_choice",
            "question": "积累 expresses...",
            "correct": "Gradual accumulation over time — of experience, vocabulary, savings, etc.",
            "options": [
                "Gradual accumulation over time — of experience, vocabulary, savings, etc.",
                "Sudden increase in a short period",
                "Loss or decrease of something over time",
                "Exchange of one thing for another"
            ],
            "option_pinyin": ["màn màn jī lèi", "tū rán zēng jiā", "jiǎn shǎo", "jiāo huàn"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Learning requires gradual accumulation.",
            "correct": "积累",
            "options": ["积累", "积极", "养成", "增加"],
            "option_pinyin": ["jī lèi", "jī jí", "yǎng chéng", "zēng jiā"],
            "question_chinese": "学习需要慢慢___。",
            "question_pinyin": "学习需要慢慢___。",
            "question_english": "Learning requires gradual accumulation."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 积累?",
            "correct": "知识是一点一点积累起来的。",
            "options": [
                "知识是一点一点积累起来的。",
                "知识积累是一点一点起来的。",
                "一点一点知识是积累起来的。",
                "知识是积累一点一点起来的。"
            ],
            "option_pinyin": [
                "zhī shi shì yī diǎn yī diǎn jī lèi qǐ lái de",
                "zhī shi jī lèi shì yī diǎn yī diǎn qǐ lái de",
                "yī diǎn yī diǎn zhī shi shì jī lèi qǐ lái de",
                "zhī shi shì jī lèi yī diǎn yī diǎn qǐ lái de"
            ]
        },
    ],

    'hsk4_l9_g3': [  # 往往 — Often / Frequently (habitual tendency)
        {
            "type": "multiple_choice",
            "question": "往往 differs from 经常 in that...",
            "correct": "往往 describes a tendency or pattern observed from experience; 经常 is neutral 'often' and can describe future plans too",
            "options": [
                "往往 describes a tendency or pattern observed from experience; 经常 is neutral 'often' and can describe future plans too",
                "往往 is only used in negative sentences; 经常 is only positive",
                "往往 refers to the future; 经常 only to the past",
                "They are completely interchangeable in all contexts"
            ],
            "option_pinyin": ["wǎng wǎng = guī lǜ", "fǒu dìng / kěn dìng", "wèi lái / guò qù", "wán quán xiāng tóng"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: He often ends up working until very late.",
            "correct": "往往",
            "options": ["往往", "偶尔", "从来", "已经"],
            "option_pinyin": ["wǎng wǎng", "ǒu ěr", "cóng lái", "yǐ jīng"],
            "question_chinese": "他___工作到很晚。",
            "question_pinyin": "他___工作到很晚。",
            "question_english": "He often ends up working until very late."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 往往?",
            "correct": "这种问题往往很难解决。",
            "options": [
                "这种问题往往很难解决。",
                "往往这种问题，很难解决。",
                "这种问题很难解决往往。",
                "很难解决往往这种问题。"
            ],
            "option_pinyin": [
                "zhè zhǒng wèn tí wǎng wǎng hěn nán jiě jué",
                "wǎng wǎng zhè zhǒng wèn tí hěn nán jiě jué",
                "zhè zhǒng wèn tí hěn nán jiě jué wǎng wǎng",
                "hěn nán jiě jué wǎng wǎng zhè zhǒng wèn tí"
            ]
        },
    ],

    # ── L10 ───────────────────────────────────────────────────────────────────
    'hsk4_l10_g1': [  # 随着 — Along with / As...increases
        {
            "type": "multiple_choice",
            "question": "随着 expresses...",
            "correct": "As X changes/grows, Y follows accordingly — two things change together",
            "options": [
                "As X changes/grows, Y follows accordingly — two things change together",
                "Despite X happening, Y does not change",
                "Because X happened in the past, Y happened later",
                "If X happens, then Y will happen (hypothetical)"
            ],
            "option_pinyin": ["suí zhe + biàn huà", "jǐn guǎn...bú biàn", "yīn wèi...suǒ yǐ...", "rú guǒ...jiù..."]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: As technology develops, life becomes more convenient.",
            "correct": "随着",
            "options": ["随着", "由于", "因此", "虽然"],
            "option_pinyin": ["suí zhe", "yóu yú", "yīn cǐ", "suī rán"],
            "question_chinese": "___科技的发展，生活越来越方便。",
            "question_pinyin": "___科技的发展，生活越来越方便。",
            "question_english": "As technology develops, life becomes more and more convenient."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 随着?",
            "correct": "随着年龄增长，他越来越懂事。",
            "options": [
                "随着年龄增长，他越来越懂事。",
                "他越来越懂事，随着年龄增长。",
                "年龄增长随着，他越来越懂事。",
                "随着他年龄，越来越增长懂事。"
            ],
            "option_pinyin": [
                "suí zhe nián líng zēng zhǎng tā yuè lái yuè dǒng shì",
                "tā yuè lái yuè dǒng shì suí zhe nián líng zēng zhǎng",
                "nián líng zēng zhǎng suí zhe tā yuè lái yuè dǒng shì",
                "suí zhe tā nián líng yuè lái yuè zēng zhǎng dǒng shì"
            ]
        },
    ],

    'hsk4_l10_g2': [  # 到处 — Everywhere
        {
            "type": "multiple_choice",
            "question": "到处 expresses...",
            "correct": "Everywhere / all over the place (no location is excluded)",
            "options": [
                "Everywhere / all over the place (no location is excluded)",
                "Nowhere at all (complete absence)",
                "Somewhere nearby (a vague nearby location)",
                "Here and there (a few scattered places)"
            ],
            "option_pinyin": ["dào chù", "nǎ lǐ yě méi yǒu", "fù jìn", "sǎn luò gè chù"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Spring has come; everywhere there are flowers.",
            "correct": "到处",
            "options": ["到处", "哪里", "这里", "附近"],
            "option_pinyin": ["dào chù", "nǎ lǐ", "zhè lǐ", "fù jìn"],
            "question_chinese": "春天来了，___都是花。",
            "question_pinyin": "春天来了，___都是花。",
            "question_english": "Spring has come; everywhere there are flowers."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 到处?",
            "correct": "他到处找，都找不到。",
            "options": [
                "他到处找，都找不到。",
                "他找到处，都找不到。",
                "到处他找，找不到都。",
                "他都找到处，找不到。"
            ],
            "option_pinyin": [
                "tā dào chù zhǎo dōu zhǎo bu dào",
                "tā zhǎo dào chù dōu zhǎo bu dào",
                "dào chù tā zhǎo zhǎo bu dào dōu",
                "tā dōu zhǎo dào chù zhǎo bu dào"
            ]
        },
    ],

    'hsk4_l10_g3': [  # 由于 — Due to / Because of (formal)
        {
            "type": "multiple_choice",
            "question": "由于 is similar to 因为, but...",
            "correct": "由于 is more formal/written; it often appears at the start of a clause",
            "options": [
                "由于 is more formal/written; it often appears at the start of a clause",
                "由于 is more casual than 因为",
                "由于 introduces a result; 因为 introduces a cause",
                "由于 can only be used in questions"
            ],
            "option_pinyin": ["yóu yú (shū miàn)", "yóu yú (kǒu yǔ)", "jié guǒ / yuán yīn", "wèn jù"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Due to weather reasons, today's event is cancelled.",
            "correct": "由于",
            "options": ["由于", "关于", "对于", "随着"],
            "option_pinyin": ["yóu yú", "guān yú", "duì yú", "suí zhe"],
            "question_chinese": "___天气原因，今天的活动取消了。",
            "question_pinyin": "___天气原因，今天的活动取消了。",
            "question_english": "Due to weather reasons, today's event is cancelled."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 由于?",
            "correct": "由于污染严重，这里的空气不好。",
            "options": [
                "由于污染严重，这里的空气不好。",
                "这里的空气不好，由于污染严重。",
                "污染严重由于，这里的空气不好。",
                "由于这里的空气，污染严重不好。"
            ],
            "option_pinyin": [
                "yóu yú wū rǎn yán zhòng zhè lǐ de kōng qì bù hǎo",
                "zhè lǐ de kōng qì bù hǎo yóu yú wū rǎn yán zhòng",
                "wū rǎn yán zhòng yóu yú zhè lǐ de kōng qì bù hǎo",
                "yóu yú zhè lǐ de kōng qì wū rǎn yán zhòng bù hǎo"
            ]
        },
    ],

    # ── L11 ───────────────────────────────────────────────────────────────────
    'hsk4_l11_g1': [  # 只要...就... — As long as...then...
        {
            "type": "multiple_choice",
            "question": "只要...就 expresses...",
            "correct": "As long as condition X is met, result Y will follow (sufficient condition)",
            "options": [
                "As long as condition X is met, result Y will follow (sufficient condition)",
                "No matter what X is, Y happens anyway (unconditional)",
                "Even if X, Y still holds (concessive)",
                "Unless X, Y will not happen (necessary condition)"
            ],
            "option_pinyin": ["zhǐ yào...jiù...", "bù guǎn...dōu...", "jí shǐ...yě...", "chú fēi...cái..."]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: As long as you persist, you can succeed.",
            "correct": "只要",
            "options": ["只要", "不管", "虽然", "即使"],
            "option_pinyin": ["zhǐ yào", "bù guǎn", "suī rán", "jí shǐ"],
            "question_chinese": "___坚持，就能成功。",
            "question_pinyin": "___坚持，就能成功。",
            "question_english": "As long as you persist, you can succeed."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 只要...就?",
            "correct": "只要努力，就有希望。",
            "options": [
                "只要努力，就有希望。",
                "只要就努力，有希望。",
                "努力只要，就有希望。",
                "有希望只要努力，就。"
            ],
            "option_pinyin": [
                "zhǐ yào nǔ lì jiù yǒu xī wàng",
                "zhǐ yào jiù nǔ lì yǒu xī wàng",
                "nǔ lì zhǐ yào jiù yǒu xī wàng",
                "yǒu xī wàng zhǐ yào nǔ lì jiù"
            ]
        },
    ],

    'hsk4_l11_g2': [  # 增加 vs 减少 — Increase vs decrease
        {
            "type": "multiple_choice",
            "question": "Which word means 'to decrease / reduce'?",
            "correct": "减少 (jiǎn shǎo)",
            "options": ["减少 (jiǎn shǎo)", "增加 (zēng jiā)", "降落 (jiàng luò)", "发展 (fā zhǎn)"],
            "option_pinyin": ["jiǎn shǎo", "zēng jiā", "jiàng luò", "fā zhǎn"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: The company's income has increased.",
            "correct": "增加",
            "options": ["增加", "减少", "降低", "改变"],
            "option_pinyin": ["zēng jiā", "jiǎn shǎo", "jiàng dī", "gǎi biàn"],
            "question_chinese": "公司的收入___了。",
            "question_pinyin": "公司的收入___了。",
            "question_english": "The company's income has increased."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence expresses a REDUCTION?",
            "correct": "我每天的运动时间减少了。",
            "options": [
                "我每天的运动时间减少了。",
                "我每天的运动时间增加了。",
                "我每天的运动时间发展了。",
                "我每天的运动时间出现了。"
            ],
            "option_pinyin": [
                "wǒ měi tiān de yùn dòng shí jiān jiǎn shǎo le",
                "wǒ měi tiān de yùn dòng shí jiān zēng jiā le",
                "wǒ měi tiān de yùn dòng shí jiān fā zhǎn le",
                "wǒ měi tiān de yùn dòng shí jiān chū xiàn le"
            ]
        },
    ],

    'hsk4_l11_g3': [  # 担心 — To worry (common expression patterns)
        {
            "type": "multiple_choice",
            "question": "担心 + Object means...",
            "correct": "To worry about something / someone (an emotional concern)",
            "options": [
                "To worry about something / someone (an emotional concern)",
                "To be in charge of something / someone",
                "To think highly of something / someone",
                "To be interested in something / someone"
            ],
            "option_pinyin": ["dān xīn + duì xiàng", "fù zé", "zhòng shì", "gǎn xìng qù"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Mom worries about me being home alone.",
            "correct": "担心",
            "options": ["担心", "关心", "负责", "注意"],
            "option_pinyin": ["dān xīn", "guān xīn", "fù zé", "zhù yì"],
            "question_chinese": "妈妈___我一个人在家。",
            "question_pinyin": "妈妈___我一个人在家。",
            "question_english": "Mom worries about me being home alone."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 担心?",
            "correct": "你不用担心，一切都会好的。",
            "options": [
                "你不用担心，一切都会好的。",
                "你担心不用，一切都会好的。",
                "不用你担心，一切好的都会。",
                "担心你不用，都会好的一切。"
            ],
            "option_pinyin": [
                "nǐ bù yòng dān xīn yī qiē dōu huì hǎo de",
                "nǐ dān xīn bù yòng yī qiē dōu huì hǎo de",
                "bù yòng nǐ dān xīn yī qiē hǎo de dōu huì",
                "dān xīn nǐ bù yòng dōu huì hǎo de yī qiē"
            ]
        },
    ],

    # ── L12 ───────────────────────────────────────────────────────────────────
    'hsk4_l12_g1': [  # 即使...也... — Even if...still...
        {
            "type": "multiple_choice",
            "question": "即使...也 expresses...",
            "correct": "Even if X (a hypothetical or extreme condition), Y still holds true",
            "options": [
                "Even if X (a hypothetical or extreme condition), Y still holds true",
                "As long as X, then Y (a sufficient condition)",
                "Because X, therefore Y (a cause-effect)",
                "Although X is true, B is also true (parallel facts)"
            ],
            "option_pinyin": ["jí shǐ...yě...", "zhǐ yào...jiù...", "yīn wèi...suǒ yǐ...", "suī rán...dàn shì..."]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Even if it rains, he will still come.",
            "correct": "即使",
            "options": ["即使", "只要", "虽然", "不管"],
            "option_pinyin": ["jí shǐ", "zhǐ yào", "suī rán", "bù guǎn"],
            "question_chinese": "___下雨，他也会来。",
            "question_pinyin": "___下雨，他也会来。",
            "question_english": "Even if it rains, he will still come."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 即使...也?",
            "correct": "即使很难，他也不放弃。",
            "options": [
                "即使很难，他也不放弃。",
                "即使他很难，不放弃也。",
                "他即使很难，也不放弃。",
                "很难即使，也他不放弃。"
            ],
            "option_pinyin": [
                "jí shǐ hěn nán tā yě bù fàng qì",
                "jí shǐ tā hěn nán bù fàng qì yě",
                "tā jí shǐ hěn nán yě bù fàng qì",
                "hěn nán jí shǐ yě tā bù fàng qì"
            ]
        },
    ],

    'hsk4_l12_g2': [  # 竟然 — Unexpectedly / To one's surprise
        {
            "type": "multiple_choice",
            "question": "竟然 expresses...",
            "correct": "Something that is surprising or against expectation: 'unexpectedly / to one's surprise'",
            "options": [
                "Something that is surprising or against expectation: 'unexpectedly / to one's surprise'",
                "Something that happens gradually over time",
                "Something that is very ordinary and expected",
                "Something that is forbidden or not allowed"
            ],
            "option_pinyin": ["jìng rán (chū hū yì liào)", "màn màn", "pǔ tōng", "bù xǔ"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: He unexpectedly forgot our agreement.",
            "correct": "竟然",
            "options": ["竟然", "果然", "仍然", "当然"],
            "option_pinyin": ["jìng rán", "guǒ rán", "réng rán", "dāng rán"],
            "question_chinese": "他___忘了我们的约定。",
            "question_pinyin": "他___忘了我们的约定。",
            "question_english": "He unexpectedly forgot our agreement."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 竟然?",
            "correct": "她竟然赢了第一名！",
            "options": [
                "她竟然赢了第一名！",
                "竟然她赢了第一名！",
                "她赢了竟然第一名！",
                "她赢竟然了第一名！"
            ],
            "option_pinyin": [
                "tā jìng rán yíng le dì yī míng",
                "jìng rán tā yíng le dì yī míng",
                "tā yíng le jìng rán dì yī míng",
                "tā yíng jìng rán le dì yī míng"
            ]
        },
    ],

    'hsk4_l12_g3': [  # 获得 — To obtain / To achieve
        {
            "type": "multiple_choice",
            "question": "获得 is typically used with...",
            "correct": "Abstract achievements: 获得成功, 获得奖励, 获得机会, 获得支持, etc.",
            "options": [
                "Abstract achievements: 获得成功, 获得奖励, 获得机会, 获得支持, etc.",
                "Physical objects only: 获得苹果, 获得书, etc.",
                "Time expressions: 获得三天, 获得两小时, etc.",
                "People: 获得朋友, 获得同事, etc."
            ],
            "option_pinyin": ["chōu xiàng chéng jiù", "shí wù", "shí jiān", "rén wù"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: She obtained the Best Actress award.",
            "correct": "获得",
            "options": ["获得", "得到", "拿到", "完成"],
            "option_pinyin": ["huò dé", "dé dào", "ná dào", "wán chéng"],
            "question_chinese": "她___了最佳演员奖。",
            "question_pinyin": "她___了最佳演员奖。",
            "question_english": "She obtained the Best Actress award."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 获得?",
            "correct": "他努力工作，获得了成功。",
            "options": [
                "他努力工作，获得了成功。",
                "他获得努力，工作了成功。",
                "获得他努力，工作了成功。",
                "他成功获得了，努力工作。"
            ],
            "option_pinyin": [
                "tā nǔ lì gōng zuò huò dé le chéng gōng",
                "tā huò dé nǔ lì gōng zuò le chéng gōng",
                "huò dé tā nǔ lì gōng zuò le chéng gōng",
                "tā chéng gōng huò dé le nǔ lì gōng zuò"
            ]
        },
    ],

    # ── L13 ───────────────────────────────────────────────────────────────────
    'hsk4_l13_g1': [  # 对...来说 — For... / From the perspective of...
        {
            "type": "multiple_choice",
            "question": "对...来说 expresses...",
            "correct": "From the perspective of / For X — a subjective evaluation or opinion",
            "options": [
                "From the perspective of / For X — a subjective evaluation or opinion",
                "Toward X — the direction of an action",
                "Due to X — the cause of a result",
                "Compared to X — a direct comparison of two things"
            ],
            "option_pinyin": ["duì...lái shuō", "xiàng X", "yóu yú X", "bǐ X"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: For him, this matter is not difficult.",
            "correct": "对",
            "options": ["对", "为", "给", "向"],
            "option_pinyin": ["duì", "wèi", "gěi", "xiàng"],
            "question_chinese": "___他来说，这件事不难。",
            "question_pinyin": "___他来说，这件事不难。",
            "question_english": "For him, this matter is not difficult."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 对...来说?",
            "correct": "对孩子来说，学习要有趣。",
            "options": [
                "对孩子来说，学习要有趣。",
                "孩子对来说，学习要有趣。",
                "来说对孩子，学习要有趣。",
                "学习对孩子，来说要有趣。"
            ],
            "option_pinyin": [
                "duì hái zi lái shuō xué xí yào yǒu qù",
                "hái zi duì lái shuō xué xí yào yǒu qù",
                "lái shuō duì hái zi xué xí yào yǒu qù",
                "xué xí duì hái zi lái shuō yào yǒu qù"
            ]
        },
    ],

    'hsk4_l13_g2': [  # 其实 — Actually / In fact
        {
            "type": "multiple_choice",
            "question": "其实 is used to...",
            "correct": "Reveal the true situation, often correcting a mistaken impression: 'actually / in fact'",
            "options": [
                "Reveal the true situation, often correcting a mistaken impression: 'actually / in fact'",
                "Introduce a new unrelated topic: 'by the way'",
                "Summarize what was said: 'in short'",
                "Express uncertainty: 'maybe / perhaps'"
            ],
            "option_pinyin": ["qí shí (jiē lù zhēn xiàng)", "shùn biàn shuō", "zǒng zhī", "yě xǔ"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Everyone thought he couldn't, but actually he can do it very well.",
            "correct": "其实",
            "options": ["其实", "原来", "竟然", "仍然"],
            "option_pinyin": ["qí shí", "yuán lái", "jìng rán", "réng rán"],
            "question_chinese": "大家以为他不会，___他会得很好。",
            "question_pinyin": "大家以为他不会，___他会得很好。",
            "question_english": "Everyone thought he couldn't, but actually he can do it very well."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 其实?",
            "correct": "他看起来很严格，其实很温柔。",
            "options": [
                "他看起来很严格，其实很温柔。",
                "其实他看起来，很严格很温柔。",
                "他很严格其实，看起来很温柔。",
                "其实很温柔，他看起来很严格。"
            ],
            "option_pinyin": [
                "tā kàn qǐ lái hěn yán gé qí shí hěn wēn róu",
                "qí shí tā kàn qǐ lái hěn yán gé hěn wēn róu",
                "tā hěn yán gé qí shí kàn qǐ lái hěn wēn róu",
                "qí shí hěn wēn róu tā kàn qǐ lái hěn yán gé"
            ]
        },
    ],

    'hsk4_l13_g3': [  # 总结 — To summarize / In summary
        {
            "type": "multiple_choice",
            "question": "总结 as a verb means...",
            "correct": "To summarize / wrap up — pulling together the key points of something",
            "options": [
                "To summarize / wrap up — pulling together the key points of something",
                "To memorize — learning something word for word",
                "To analyze — breaking something into parts",
                "To translate — converting between languages"
            ],
            "option_pinyin": ["zǒng jié (guī nà zhòng diǎn)", "bèi sòng", "fēn xī", "fān yì"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Please summarize today's content.",
            "correct": "总结",
            "options": ["总结", "翻译", "解释", "说明"],
            "option_pinyin": ["zǒng jié", "fān yì", "jiě shì", "shuō míng"],
            "question_chinese": "请___一下今天的内容。",
            "question_pinyin": "请___一下今天的内容。",
            "question_english": "Please summarize today's content."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 总结?",
            "correct": "老师总结了这节课的重点。",
            "options": [
                "老师总结了这节课的重点。",
                "老师这节课总结了，重点。",
                "总结老师了这节课的重点。",
                "这节课老师重点，总结了。"
            ],
            "option_pinyin": [
                "lǎo shī zǒng jié le zhè jié kè de zhòng diǎn",
                "lǎo shī zhè jié kè zǒng jié le zhòng diǎn",
                "zǒng jié lǎo shī le zhè jié kè de zhòng diǎn",
                "zhè jié kè lǎo shī zhòng diǎn zǒng jié le"
            ]
        },
    ],

    # ── L14 ───────────────────────────────────────────────────────────────────
    'hsk4_l14_g1': [  # 无论...都... — No matter what / Regardless
        {
            "type": "multiple_choice",
            "question": "无论...都 expresses...",
            "correct": "Regardless of X (all possibilities covered), Y always applies",
            "options": [
                "Regardless of X (all possibilities covered), Y always applies",
                "As long as X, then Y (a sufficient condition)",
                "Even if X, still Y (a hypothetical concession)",
                "Since X, therefore Y (a logical deduction)"
            ],
            "option_pinyin": ["wú lùn...dōu...", "zhǐ yào...jiù...", "jí shǐ...yě...", "jì rán...jiù..."]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: No matter what the situation, I will support you.",
            "correct": "无论",
            "options": ["无论", "不管", "虽然", "只要"],
            "option_pinyin": ["wú lùn", "bù guǎn", "suī rán", "zhǐ yào"],
            "question_chinese": "___什么情况，我都支持你。",
            "question_pinyin": "___什么情况，我都支持你。",
            "question_english": "No matter what the situation, I will support you."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 无论...都?",
            "correct": "无论如何，我们都要坚持。",
            "options": [
                "无论如何，我们都要坚持。",
                "我们无论如何，坚持都要。",
                "如何无论，我们都坚持要。",
                "我们都要坚持，无论如何。"
            ],
            "option_pinyin": [
                "wú lùn rú hé wǒ men dōu yào jiān chí",
                "wǒ men wú lùn rú hé jiān chí dōu yào",
                "rú hé wú lùn wǒ men dōu jiān chí yào",
                "wǒ men dōu yào jiān chí wú lùn rú hé"
            ]
        },
    ],

    'hsk4_l14_g2': [  # 由 — From / By (indicating agent or origin)
        {
            "type": "multiple_choice",
            "question": "由 in formal/written Chinese indicates...",
            "correct": "The agent performing the action (by whom) or the origin (from where)",
            "options": [
                "The agent performing the action (by whom) or the origin (from where)",
                "The purpose of the action (in order to)",
                "The result of the action (therefore)",
                "The time of the action (at the time when)"
            ],
            "option_pinyin": ["yóu + zhǔ dòng zhě / qǐ yuán", "wèi le mù dì", "suǒ yǐ jié guǒ", "zài nǎ gè shí jiān"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: This task is handled by him.",
            "correct": "由",
            "options": ["由", "被", "让", "给"],
            "option_pinyin": ["yóu", "bèi", "ràng", "gěi"],
            "question_chinese": "这项工作___他负责。",
            "question_pinyin": "这项工作___他负责。",
            "question_english": "This task is handled by him."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 由?",
            "correct": "会议由校长主持。",
            "options": [
                "会议由校长主持。",
                "校长由会议主持。",
                "由主持会议，校长。",
                "会议主持由校长。"
            ],
            "option_pinyin": [
                "huì yì yóu xiào zhǎng zhǔ chí",
                "xiào zhǎng yóu huì yì zhǔ chí",
                "yóu zhǔ chí huì yì xiào zhǎng",
                "huì yì zhǔ chí yóu xiào zhǎng"
            ]
        },
    ],

    'hsk4_l14_g3': [  # 任何 — Any / Whichever
        {
            "type": "multiple_choice",
            "question": "任何 means...",
            "correct": "Any / every — indicating no exception exists (used with 都 or 也)",
            "options": [
                "Any / every — indicating no exception exists (used with 都 or 也)",
                "Some — indicating a limited, unspecified amount",
                "Several — indicating more than one but not all",
                "Most — indicating the majority but not all"
            ],
            "option_pinyin": ["rèn hé + dōu/yě", "yī xiē", "jǐ gè", "dà duō shù"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: In any situation, you must be honest.",
            "correct": "任何",
            "options": ["任何", "某些", "所有", "很多"],
            "option_pinyin": ["rèn hé", "mǒu xiē", "suǒ yǒu", "hěn duō"],
            "question_chinese": "在___情况下，都要诚实。",
            "question_pinyin": "在___情况下，都要诚实。",
            "question_english": "In any situation, you must be honest."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 任何?",
            "correct": "任何问题都有解决的方法。",
            "options": [
                "任何问题都有解决的方法。",
                "问题任何有都解决的方法。",
                "任何都问题，有解决的方法。",
                "有解决的方法，问题任何都。"
            ],
            "option_pinyin": [
                "rèn hé wèn tí dōu yǒu jiě jué de fāng fǎ",
                "wèn tí rèn hé yǒu dōu jiě jué de fāng fǎ",
                "rèn hé dōu wèn tí yǒu jiě jué de fāng fǎ",
                "yǒu jiě jué de fāng fǎ wèn tí rèn hé dōu"
            ]
        },
    ],

    # ── L15 ───────────────────────────────────────────────────────────────────
    'hsk4_l15_g1': [  # 著名 vs 有名 — Two ways to say 'famous'
        {
            "type": "multiple_choice",
            "question": "著名 and 有名 both mean 'famous', but 著名...",
            "correct": "Is more formal/literary, often used attributively before nouns; 有名 is more colloquial",
            "options": [
                "Is more formal/literary, often used attributively before nouns; 有名 is more colloquial",
                "Is less formal than 有名; 有名 is used in writing only",
                "Means world-famous; 有名 only means locally famous",
                "Is only used for places; 有名 is only used for people"
            ],
            "option_pinyin": ["zhù míng (shū miàn)", "zhù míng (kǒu yǔ)", "shì jiè / dì fāng", "dì diǎn / rén"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Beijing has many famous tourist attractions.",
            "correct": "著名",
            "options": ["著名", "有名", "精彩", "特别"],
            "option_pinyin": ["zhù míng", "yǒu míng", "jīng cǎi", "tè bié"],
            "question_chinese": "北京有很多___的景点。",
            "question_pinyin": "北京有很多___的景点。",
            "question_english": "Beijing has many famous tourist attractions."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence uses 著名 correctly?",
            "correct": "他是一位著名的画家。",
            "options": [
                "他是一位著名的画家。",
                "他著名是一位画家。",
                "著名他是一位画家。",
                "他是一位画家著名。"
            ],
            "option_pinyin": [
                "tā shì yī wèi zhù míng de huà jiā",
                "tā zhù míng shì yī wèi huà jiā",
                "zhù míng tā shì yī wèi huà jiā",
                "tā shì yī wèi huà jiā zhù míng"
            ]
        },
    ],

    'hsk4_l15_g2': [  # 尤其 — Especially (different exercises from L6)
        {
            "type": "multiple_choice",
            "question": "尤其 is similar to 特别, but 尤其...",
            "correct": "More strongly singles out one item from a group; often appears in more formal or written contexts",
            "options": [
                "More strongly singles out one item from a group; often appears in more formal or written contexts",
                "Is only used in negative sentences",
                "Comes after the verb, not before",
                "Only applies to people, not things or places"
            ],
            "option_pinyin": ["yóu qí (zhèng shì)", "fǒu dìng jù", "V + hòu", "rén wù"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: He likes watching performances, especially Peking Opera.",
            "correct": "尤其",
            "options": ["尤其", "另外", "虽然", "因此"],
            "option_pinyin": ["yóu qí", "lìng wài", "suī rán", "yīn cǐ"],
            "question_chinese": "他喜欢看演出，___喜欢看京剧。",
            "question_pinyin": "他喜欢看演出，___喜欢看京剧。",
            "question_english": "He likes watching performances, especially Peking Opera."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 尤其?",
            "correct": "她喜欢艺术，尤其是音乐。",
            "options": [
                "她喜欢艺术，尤其是音乐。",
                "尤其她喜欢，艺术是音乐。",
                "她尤其，喜欢艺术是音乐。",
                "艺术她喜欢，尤其音乐是。"
            ],
            "option_pinyin": [
                "tā xǐ huān yì shù yóu qí shì yīn yuè",
                "yóu qí tā xǐ huān yì shù shì yīn yuè",
                "tā yóu qí xǐ huān yì shù shì yīn yuè",
                "yì shù tā xǐ huān yóu qí yīn yuè shì"
            ]
        },
    ],

    'hsk4_l15_g3': [  # 吸引 + object patterns — To attract
        {
            "type": "multiple_choice",
            "question": "吸引 is commonly used as...",
            "correct": "A transitive verb: 吸引 + object (to attract someone or something)",
            "options": [
                "A transitive verb: 吸引 + object (to attract someone or something)",
                "An adjective: placed after 很 or 非常",
                "An intransitive verb: used without any object",
                "A noun: placed after 的 as a modifier"
            ],
            "option_pinyin": ["xī yǐn + bīn yǔ", "hěn + xī yǐn", "bù dài bīn yǔ", "de + xī yǐn"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: This Peking Opera attracted many viewers.",
            "correct": "吸引",
            "options": ["吸引", "影响", "感动", "鼓励"],
            "option_pinyin": ["xī yǐn", "yǐng xiǎng", "gǎn dòng", "gǔ lì"],
            "question_chinese": "这部京剧___了很多观众。",
            "question_pinyin": "这部京剧___了很多观众。",
            "question_english": "This Peking Opera attracted many viewers."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 吸引?",
            "correct": "精彩的表演吸引了大家的注意力。",
            "options": [
                "精彩的表演吸引了大家的注意力。",
                "精彩的表演大家吸引了，注意力。",
                "吸引精彩的表演，大家注意力了。",
                "大家的注意力，精彩吸引了表演。"
            ],
            "option_pinyin": [
                "jīng cǎi de biǎo yǎn xī yǐn le dà jiā de zhù yì lì",
                "jīng cǎi de biǎo yǎn dà jiā xī yǐn le zhù yì lì",
                "xī yǐn jīng cǎi de biǎo yǎn dà jiā zhù yì lì le",
                "dà jiā de zhù yì lì jīng cǎi xī yǐn le biǎo yǎn"
            ]
        },
    ],
}

# ── grammar key mapping (lesson number → list of GRAMMAR_MINI keys) ──────────

GRAMMAR_KEYS = {
    6:  ['hsk4_l6_g1',  'hsk4_l6_g2',  'hsk4_l6_g3'],
    7:  ['hsk4_l7_g1',  'hsk4_l7_g2',  'hsk4_l7_g3'],
    8:  ['hsk4_l8_g1',  'hsk4_l8_g2',  'hsk4_l8_g3'],
    9:  ['hsk4_l9_g1',  'hsk4_l9_g2',  'hsk4_l9_g3'],
    10: ['hsk4_l10_g1', 'hsk4_l10_g2', 'hsk4_l10_g3'],
    11: ['hsk4_l11_g1', 'hsk4_l11_g2', 'hsk4_l11_g3'],
    12: ['hsk4_l12_g1', 'hsk4_l12_g2', 'hsk4_l12_g3'],
    13: ['hsk4_l13_g1', 'hsk4_l13_g2', 'hsk4_l13_g3'],
    14: ['hsk4_l14_g1', 'hsk4_l14_g2', 'hsk4_l14_g3'],
    15: ['hsk4_l15_g1', 'hsk4_l15_g2', 'hsk4_l15_g3'],
}

# ── main processing ───────────────────────────────────────────────────────────

random.seed(42)
DATA_DIR = os.path.dirname(os.path.abspath(__file__))

for lesson_num in range(6, 16):
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
