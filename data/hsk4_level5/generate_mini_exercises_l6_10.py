"""
Generate mini_exercises for HSK4 Level 5 (hsk5) lessons 6-10.
Same pattern as lessons 1-5: 3 per vocab word (non-phrase), 3 per grammar point.
Does NOT modify any other content in the JSON files.
"""
import json, random, copy, os

# ── helpers (identical to l1_5 script) ────────────────────────────────────────

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
    # L6 — Law & Rights
    '法律': ('每个人都要遵守___。', 'Everyone must abide by the law.'),
    '权利': ('我们有受教育的___。', 'We have the right to receive education.'),
    '义务': ('纳税是公民的___。', 'Paying taxes is a citizen\'s obligation.'),
    '合同': ('他们签了一份___。', 'They signed a contract.'),
    '违法': ('他的行为是___的。', 'His behaviour is illegal.'),
    '律师': ('他请了一位___帮他打官司。', 'He hired a lawyer to help him with the lawsuit.'),
    '法院': ('案件将在___里审判。', 'The case will be tried in court.'),
    '诉讼': ('他们提起了___。', 'They filed a lawsuit.'),
    '证据': ('警察找到了重要的___。', 'The police found important evidence.'),
    '罚款': ('违章停车要___。', 'Illegal parking will result in a fine.'),
    '保护': ('法律___公民的权利。', 'The law protects citizens\' rights.'),
    '判决': ('法院做出了最终___。', 'The court made a final verdict.'),

    # L7 — Business & Economy (合同 shared with L6)
    '经济': ('这个国家的___发展很快。', 'The economy of this country is developing rapidly.'),
    '市场': ('他们研究了___的竞争情况。', 'They studied the market competition situation.'),
    '竞争': ('这个行业的___非常激烈。', 'Competition in this industry is very fierce.'),
    '投资': ('他决定___这家公司。', 'He decided to invest in this company.'),
    '利润': ('公司今年的___很高。', 'The company\'s profit this year is very high.'),
    '合作': ('两家公司开始___了。', 'The two companies started cooperating.'),
    '谈判': ('双方进行了友好的___。', 'Both sides conducted friendly negotiations.'),
    '企业': ('这是一家大型___。', 'This is a large enterprise.'),
    '策略': ('他们制定了新的市场___。', 'They formulated a new market strategy.'),
    '品牌': ('这个___在全球很有名。', 'This brand is very well-known globally.'),
    '销售': ('这个月的___业绩很好。', 'The sales performance this month is very good.'),

    # L8 — Family & Relationships (理解, 沟通 shared with L9)
    '亲戚': ('过年的时候要拜访___。', 'We visit relatives during the New Year.'),
    '关系': ('他们两个人的___很好。', 'The two of them have a very good relationship.'),
    '责任': ('照顾父母是子女的___。', 'Taking care of parents is the responsibility of children.'),
    '沟通': ('我们需要更好地___。', 'We need to communicate better.'),
    '矛盾': ('他们之间有些___。', 'There are some contradictions between them.'),
    '理解': ('我完全___他的想法。', 'I completely understand his thinking.'),
    '尊重': ('我们要___老人。', 'We should respect the elderly.'),
    '信任': ('朋友之间要相互___。', 'Friends should trust each other.'),
    '代沟': ('父母和孩子之间常常有___。', 'There is often a generation gap between parents and children.'),
    '和睦': ('这个家庭非常___。', 'This family is very harmonious.'),
    '包容': ('我们要学会___别人的缺点。', 'We should learn to be tolerant of others\' flaws.'),
    '养育': ('父母___了我们，我们要感恩。', 'Our parents raised and nurtured us; we should be grateful.'),

    # L9 — Language & Communication (理解, 沟通 shared with L8)
    '表达': ('他善于___自己的想法。', 'He is good at expressing his thoughts.'),
    '交流': ('多___有助于增进了解。', 'More communication helps to enhance understanding.'),
    '翻译': ('她帮我___了这封信。', 'She helped me translate this letter.'),
    '方言': ('他家乡的___很难懂。', 'The dialect of his hometown is very hard to understand.'),
    '词汇': ('学语言要积累___。', 'Learning a language requires building vocabulary.'),
    '语法': ('这句话的___有错误。', 'There is a grammar mistake in this sentence.'),
    '发音': ('她的汉语___很准确。', 'Her Chinese pronunciation is very accurate.'),
    '母语': ('英语是他的___。', 'English is his mother tongue.'),
    '外语': ('她会说三门___。', 'She can speak three foreign languages.'),
    '文化差异': ('不同国家之间存在___。', 'Cultural differences exist between different countries.'),

    # L10 — Urban Life
    '交通': ('早高峰时间___非常拥挤。', 'Traffic is very congested during morning rush hour.'),
    '拥挤': ('地铁里的人很___。', 'The subway is very crowded.'),
    '社区': ('他住在一个安静的___里。', 'He lives in a quiet community.'),
    '设施': ('这个城市的公共___很完善。', 'The public facilities of this city are very well-developed.'),
    '环境': ('这里的居住___很好。', 'The living environment here is very good.'),
    '便利': ('这里交通___，出行很方便。', 'Transportation here is convenient; getting around is easy.'),
    '压力': ('城市生活___很大。', 'Urban life comes with a lot of pressure.'),
    '节奏': ('城市生活的___很快。', 'The pace of urban life is very fast.'),
    '污染': ('工厂造成了严重的___。', 'The factory caused serious pollution.'),
    '绿化': ('这个城市的___做得很好。', 'This city has done a good job with greening.'),
    '规划': ('城市___影响居民的生活。', 'Urban planning affects residents\' lives.'),
    '公共交通': ('多使用___可以减少污染。', 'Using more public transportation can reduce pollution.'),
}

# ── handcrafted grammar mini exercises ───────────────────────────────────────

GRAMMAR_MINI = {

    # ── L6 ────────────────────────────────────────────────────────────────────
    'hsk5_l6_g1': [  # 根据 — According to / Based on
        {
            "type": "multiple_choice",
            "question": "根据 + N/VP means...",
            "correct": "According to / Based on X (a source, rule, or evidence)",
            "options": [
                "According to / Based on X (a source, rule, or evidence)",
                "In spite of X (a concession against evidence)",
                "Because of X (a direct cause)",
                "In order to X (a purpose)"
            ],
            "option_pinyin": ["gēn jù", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: According to the law, he must pay a fine.",
            "correct": "根据",
            "options": ["根据", "由于", "为了", "虽然"],
            "option_pinyin": ["gēn jù", "yóu yú", "wèi le", "suī rán"],
            "question_chinese": "___法律，他必须支付罚款。",
            "question_pinyin": "___法律，他必须支付罚款。",
            "question_english": "According to the law, he must pay a fine."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 根据?",
            "correct": "根据合同，双方必须履行各自的义务。",
            "options": [
                "根据合同，双方必须履行各自的义务。",
                "双方根据，合同必须履行各自的义务。",
                "合同根据双方，必须履行各自的义务。",
                "双方必须履行，根据合同各自的义务。"
            ],
            "option_pinyin": [
                "gēn jù hé tong shuāng fāng bì xū lǚ xíng gè zì de yì wù",
                "shuāng fāng gēn jù hé tong bì xū lǚ xíng gè zì de yì wù",
                "hé tong gēn jù shuāng fāng bì xū lǚ xíng gè zì de yì wù",
                "shuāng fāng bì xū lǚ xíng gēn jù hé tong gè zì de yì wù"
            ]
        },
    ],

    'hsk5_l6_g2': [  # 由于…因此… — Due to… therefore…
        {
            "type": "multiple_choice",
            "question": "由于...因此... expresses...",
            "correct": "A cause-effect relationship: due to A (reason), therefore B (result)",
            "options": [
                "A cause-effect relationship: due to A (reason), therefore B (result)",
                "A concession: although A, B still happens",
                "A condition: only if A, then B",
                "A sequence: first A, then B"
            ],
            "option_pinyin": ["yóu yú...yīn cǐ...", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Due to insufficient evidence, the court cannot pass judgment.",
            "correct": "由于",
            "options": ["由于", "虽然", "不管", "只要"],
            "option_pinyin": ["yóu yú", "suī rán", "bù guǎn", "zhǐ yào"],
            "question_chinese": "___证据不足，法院无法作出判决。",
            "question_pinyin": "___证据不足，法院无法作出判决。",
            "question_english": "Due to insufficient evidence, the court cannot pass judgment."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 由于…因此…?",
            "correct": "由于他违法，因此被罚款了。",
            "options": [
                "由于他违法，因此被罚款了。",
                "他由于违法，被罚款了因此。",
                "因此由于他违法，被罚款了。",
                "他违法由于，因此了被罚款。"
            ],
            "option_pinyin": [
                "yóu yú tā wéi fǎ yīn cǐ bèi fá kuǎn le",
                "tā yóu yú wéi fǎ bèi fá kuǎn le yīn cǐ",
                "yīn cǐ yóu yú tā wéi fǎ bèi fá kuǎn le",
                "tā wéi fǎ yóu yú yīn cǐ le bèi fá kuǎn"
            ]
        },
    ],

    'hsk5_l6_g3': [  # 除非 — Unless; only if
        {
            "type": "multiple_choice",
            "question": "除非 + condition means...",
            "correct": "Unless X (the only exception) — the situation will not change except in this one case",
            "options": [
                "Unless X (the only exception) — the situation will not change except in this one case",
                "Even if X — a hypothetical concession that doesn't change the result",
                "As long as X — a sufficient condition for a result",
                "Because of X — a reason for what follows"
            ],
            "option_pinyin": ["chú fēi", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Unless the lawyer agrees, the contract cannot be changed.",
            "correct": "除非",
            "options": ["除非", "如果", "即使", "因为"],
            "option_pinyin": ["chú fēi", "rú guǒ", "jí shǐ", "yīn wèi"],
            "question_chinese": "___律师同意，否则不能修改合同。",
            "question_pinyin": "___律师同意，否则不能修改合同。",
            "question_english": "Unless the lawyer agrees, the contract cannot be changed."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 除非?",
            "correct": "除非有充分证据，否则法院不会判决。",
            "options": [
                "除非有充分证据，否则法院不会判决。",
                "有充分证据除非，否则法院不会判决。",
                "否则除非有充分证据，法院不会判决。",
                "法院不会判决，除非否则有充分证据。"
            ],
            "option_pinyin": [
                "chú fēi yǒu chōng fèn zhèng jù fǒu zé fǎ yuàn bù huì pàn jué",
                "yǒu chōng fèn zhèng jù chú fēi fǒu zé fǎ yuàn bù huì pàn jué",
                "fǒu zé chú fēi yǒu chōng fèn zhèng jù fǎ yuàn bù huì pàn jué",
                "fǎ yuàn bù huì pàn jué chú fēi fǒu zé yǒu chōng fèn zhèng jù"
            ]
        },
    ],

    # ── L7 ────────────────────────────────────────────────────────────────────
    'hsk5_l7_g1': [  # 尽管…但… — Although… but…
        {
            "type": "multiple_choice",
            "question": "尽管...但... expresses...",
            "correct": "A concession: although A is true, B still occurs (an unexpected or contrasting result)",
            "options": [
                "A concession: although A is true, B still occurs (an unexpected or contrasting result)",
                "A cause: because of A, B happens",
                "A condition: if A, then B",
                "A sequence: first A, and then B"
            ],
            "option_pinyin": ["jǐn guǎn...dàn...", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Although market competition is fierce, the company's profit still increased.",
            "correct": "尽管",
            "options": ["尽管", "因为", "所以", "如果"],
            "option_pinyin": ["jǐn guǎn", "yīn wèi", "suǒ yǐ", "rú guǒ"],
            "question_chinese": "___市场竞争激烈，公司的利润还是增加了。",
            "question_pinyin": "___市场竞争激烈，公司的利润还是增加了。",
            "question_english": "Although market competition is fierce, the company's profit still increased."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 尽管…但…?",
            "correct": "尽管谈判很艰难，但双方最终达成了协议。",
            "options": [
                "尽管谈判很艰难，但双方最终达成了协议。",
                "谈判尽管很艰难，双方但最终达成了协议。",
                "但尽管谈判很艰难，双方最终达成了协议。",
                "双方尽管谈判，但很艰难最终达成了协议。"
            ],
            "option_pinyin": [
                "jǐn guǎn tán pàn hěn jiān nán dàn shuāng fāng zuì zhōng dá chéng le xié yì",
                "tán pàn jǐn guǎn hěn jiān nán shuāng fāng dàn zuì zhōng dá chéng le xié yì",
                "dàn jǐn guǎn tán pàn hěn jiān nán shuāng fāng zuì zhōng dá chéng le xié yì",
                "shuāng fāng jǐn guǎn tán pàn dàn hěn jiān nán zuì zhōng dá chéng le xié yì"
            ]
        },
    ],

    'hsk5_l7_g2': [  # 相比之下 — By comparison; in contrast
        {
            "type": "multiple_choice",
            "question": "相比之下 in a sentence means...",
            "correct": "By comparison / In contrast — introduces a contrasting perspective against something mentioned before",
            "options": [
                "By comparison / In contrast — introduces a contrasting perspective against something mentioned before",
                "Not only that — adds an extra point to the previous statement",
                "As a result — introduces the consequence of the previous statement",
                "On the other hand — contradicts the previous statement completely"
            ],
            "option_pinyin": ["xiāng bǐ zhī xià", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Domestic brands have lower prices; by comparison, imported brands have higher quality.",
            "correct": "相比之下",
            "options": ["相比之下", "不仅如此", "因此", "所以"],
            "option_pinyin": ["xiāng bǐ zhī xià", "bù jǐn rú cǐ", "yīn cǐ", "suǒ yǐ"],
            "question_chinese": "国产品牌价格低；___，进口品牌质量更高。",
            "question_pinyin": "国产品牌价格低；___，进口品牌质量更高。",
            "question_english": "Domestic brands have lower prices; by comparison, imported brands have higher quality."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 相比之下?",
            "correct": "他们公司销售额增长了；相比之下，竞争对手却在下滑。",
            "options": [
                "他们公司销售额增长了；相比之下，竞争对手却在下滑。",
                "相比之下他们公司；销售额增长了，竞争对手却在下滑。",
                "竞争对手却在下滑；相比之下，他们公司销售额增长了。",
                "他们公司销售额增长了，竞争对手相比之下却在下滑；"
            ],
            "option_pinyin": [
                "tā men gōng sī xiāo shòu é zēng zhǎng le xiāng bǐ zhī xià jìng zhēng duì shǒu què zài xià huá",
                "xiāng bǐ zhī xià tā men gōng sī xiāo shòu é zēng zhǎng le jìng zhēng duì shǒu què zài xià huá",
                "jìng zhēng duì shǒu què zài xià huá xiāng bǐ zhī xià tā men gōng sī xiāo shòu é zēng zhǎng le",
                "tā men gōng sī xiāo shòu é zēng zhǎng le jìng zhēng duì shǒu xiāng bǐ zhī xià què zài xià huá"
            ]
        },
    ],

    'hsk5_l7_g3': [  # 以便 — So as to; in order to (formal purpose)
        {
            "type": "multiple_choice",
            "question": "以便 + VP means...",
            "correct": "So as to / In order to (do something) — a formal expression of purpose that enables a smoother outcome",
            "options": [
                "So as to / In order to (do something) — a formal expression of purpose that enables a smoother outcome",
                "Even though — a concession that the following action contradicts",
                "As a result — the consequence of the previous action",
                "No matter what — an unconditional statement"
            ],
            "option_pinyin": ["yǐ biàn", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Please sign the contract in advance so as to allow smooth cooperation.",
            "correct": "以便",
            "options": ["以便", "为了", "因此", "所以"],
            "option_pinyin": ["yǐ biàn", "wèi le", "yīn cǐ", "suǒ yǐ"],
            "question_chinese": "请提前签好合同，___顺利合作。",
            "question_pinyin": "请提前签好合同，___顺利合作。",
            "question_english": "Please sign the contract in advance so as to allow smooth cooperation."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 以便?",
            "correct": "他认真研究了市场策略，以便更好地开展业务。",
            "options": [
                "他认真研究了市场策略，以便更好地开展业务。",
                "以便他认真研究了市场策略，更好地开展业务。",
                "他认真以便研究了，市场策略更好地开展业务。",
                "更好地开展业务，他以便认真研究了市场策略。"
            ],
            "option_pinyin": [
                "tā rèn zhēn yán jiū le shì chǎng cè lüè yǐ biàn gèng hǎo de kāi zhǎn yè wù",
                "yǐ biàn tā rèn zhēn yán jiū le shì chǎng cè lüè gèng hǎo de kāi zhǎn yè wù",
                "tā rèn zhēn yǐ biàn yán jiū le shì chǎng cè lüè gèng hǎo de kāi zhǎn yè wù",
                "gèng hǎo de kāi zhǎn yè wù tā yǐ biàn rèn zhēn yán jiū le shì chǎng cè lüè"
            ]
        },
    ],

    # ── L8 ────────────────────────────────────────────────────────────────────
    'hsk5_l8_g1': [  # 彼此 — Each other; mutually
        {
            "type": "multiple_choice",
            "question": "彼此 expresses...",
            "correct": "Mutuality between two parties: 'each other' — often more formal than 互相",
            "options": [
                "Mutuality between two parties: 'each other' — often more formal than 互相",
                "A one-sided action from one person to another",
                "Something happening at the same time (simultaneously)",
                "A shared quality that belongs to both parties equally"
            ],
            "option_pinyin": ["bǐ cǐ", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: A good relationship requires each other's respect.",
            "correct": "彼此",
            "options": ["彼此", "互相", "共同", "一起"],
            "option_pinyin": ["bǐ cǐ", "hù xiāng", "gòng tóng", "yī qǐ"],
            "question_chinese": "好的关系需要___尊重。",
            "question_pinyin": "好的关系需要___尊重。",
            "question_english": "A good relationship requires each other's respect."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 彼此?",
            "correct": "他们彼此信任，合作非常顺利。",
            "options": [
                "他们彼此信任，合作非常顺利。",
                "彼此他们信任，合作非常顺利。",
                "他们信任彼此了，合作非常顺利。",
                "合作彼此顺利，他们非常信任。"
            ],
            "option_pinyin": [
                "tā men bǐ cǐ xìn rèn hé zuò fēi cháng shùn lì",
                "bǐ cǐ tā men xìn rèn hé zuò fēi cháng shùn lì",
                "tā men xìn rèn bǐ cǐ le hé zuò fēi cháng shùn lì",
                "hé zuò bǐ cǐ shùn lì tā men fēi cháng xìn rèn"
            ]
        },
    ],

    'hsk5_l8_g2': [  # 宁可…也不… — Would rather… than…
        {
            "type": "multiple_choice",
            "question": "宁可...也不... expresses...",
            "correct": "A strong preference: 'would rather do A than do B' — choosing A even though B might seem easier",
            "options": [
                "A strong preference: 'would rather do A than do B' — choosing A even though B might seem easier",
                "A condition: only if A, then B happens",
                "A concession: although A is true, B still happens",
                "A sequence: first A, then B follows immediately"
            ],
            "option_pinyin": ["nìng kě...yě bù...", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: She would rather stay silent than say something that hurts people.",
            "correct": "宁可",
            "options": ["宁可", "虽然", "不管", "只要"],
            "option_pinyin": ["nìng kě", "suī rán", "bù guǎn", "zhǐ yào"],
            "question_chinese": "她___沉默，也不说出让人伤心的话。",
            "question_pinyin": "她___沉默，也不说出让人伤心的话。",
            "question_english": "She would rather stay silent than say something that hurts people."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 宁可…也不…?",
            "correct": "他宁可加班，也不愿意错过这次机会。",
            "options": [
                "他宁可加班，也不愿意错过这次机会。",
                "他也不宁可加班，愿意错过这次机会。",
                "宁可他加班，也不愿意错过这次机会。",
                "他加班宁可，也不错过这次愿意机会。"
            ],
            "option_pinyin": [
                "tā nìng kě jiā bān yě bù yuàn yì cuò guò zhè cì jī huì",
                "tā yě bù nìng kě jiā bān yuàn yì cuò guò zhè cì jī huì",
                "nìng kě tā jiā bān yě bù yuàn yì cuò guò zhè cì jī huì",
                "tā jiā bān nìng kě yě bù cuò guò zhè cì yuàn yì jī huì"
            ]
        },
    ],

    'hsk5_l8_g3': [  # 之所以…是因为… — The reason why… is that…
        {
            "type": "multiple_choice",
            "question": "之所以...是因为... expresses...",
            "correct": "Emphatic explanation of a reason: 'the reason why X is that Y' — 之所以introduces the known fact, 是因为 gives the explanation",
            "options": [
                "Emphatic explanation of a reason: 'the reason why X is that Y' — 之所以introduces the known fact, 是因为 gives the explanation",
                "A condition: if X, then Y will happen",
                "A concession: even though X, Y still happens",
                "A result: X happened, therefore Y follows"
            ],
            "option_pinyin": ["zhī suǒ yǐ...shì yīn wèi...", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: The reason their relationship is good is that they understand each other.",
            "correct": "之所以",
            "options": ["之所以", "因此", "虽然", "即使"],
            "option_pinyin": ["zhī suǒ yǐ", "yīn cǐ", "suī rán", "jí shǐ"],
            "question_chinese": "他们___关系好，是因为彼此理解。",
            "question_pinyin": "他们___关系好，是因为彼此理解。",
            "question_english": "The reason their relationship is good is that they understand each other."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 之所以…是因为…?",
            "correct": "她之所以成功，是因为她从不放弃。",
            "options": [
                "她之所以成功，是因为她从不放弃。",
                "她是因为成功，之所以她从不放弃。",
                "之所以她成功是因为，她从不放弃。",
                "她从不放弃，之所以是因为成功。"
            ],
            "option_pinyin": [
                "tā zhī suǒ yǐ chéng gōng shì yīn wèi tā cóng bù fàng qì",
                "tā shì yīn wèi chéng gōng zhī suǒ yǐ tā cóng bù fàng qì",
                "zhī suǒ yǐ tā chéng gōng shì yīn wèi tā cóng bù fàng qì",
                "tā cóng bù fàng qì zhī suǒ yǐ shì yīn wèi chéng gōng"
            ]
        },
    ],

    # ── L9 ────────────────────────────────────────────────────────────────────
    'hsk5_l9_g1': [  # 无论…都… — No matter… all / always
        {
            "type": "multiple_choice",
            "question": "无论...都... expresses...",
            "correct": "No matter what/how the condition is, the result always remains the same — stronger and more formal than 不管",
            "options": [
                "No matter what/how the condition is, the result always remains the same — stronger and more formal than 不管",
                "Only when the condition is met does the result happen",
                "Because of the condition, the result follows",
                "Although the condition is true, the result is surprising"
            ],
            "option_pinyin": ["wú lùn...dōu...", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: No matter what language you use, you must express the meaning clearly.",
            "correct": "无论",
            "options": ["无论", "不管", "虽然", "如果"],
            "option_pinyin": ["wú lùn", "bù guǎn", "suī rán", "rú guǒ"],
            "question_chinese": "___用什么语言，都要把意思表达清楚。",
            "question_pinyin": "___用什么语言，都要把意思表达清楚。",
            "question_english": "No matter what language you use, you must express the meaning clearly."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 无论…都…?",
            "correct": "无论遇到多大困难，她都坚持学习外语。",
            "options": [
                "无论遇到多大困难，她都坚持学习外语。",
                "她无论遇到多大困难，坚持都学习外语。",
                "都无论遇到多大困难，她坚持学习外语。",
                "她遇到多大困难，无论都坚持学习外语。"
            ],
            "option_pinyin": [
                "wú lùn yù dào duō dà kùn nán tā dōu jiān chí xué xí wài yǔ",
                "tā wú lùn yù dào duō dà kùn nán jiān chí dōu xué xí wài yǔ",
                "dōu wú lùn yù dào duō dà kùn nán tā jiān chí xué xí wài yǔ",
                "tā yù dào duō dà kùn nán wú lùn dōu jiān chí xué xí wài yǔ"
            ]
        },
    ],

    'hsk5_l9_g2': [  # 借助 — With the help of; by means of
        {
            "type": "multiple_choice",
            "question": "借助 + N means...",
            "correct": "With the help of / By means of X (a tool, person, or resource that makes something possible)",
            "options": [
                "With the help of / By means of X (a tool, person, or resource that makes something possible)",
                "Because of X (a cause that makes something happen)",
                "In spite of X (a concession that doesn't stop the result)",
                "According to X (a source or reference)"
            ],
            "option_pinyin": ["jiè zhù", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: With the help of a dictionary, he successfully completed the translation.",
            "correct": "借助",
            "options": ["借助", "通过", "根据", "由于"],
            "option_pinyin": ["jiè zhù", "tōng guò", "gēn jù", "yóu yú"],
            "question_chinese": "他___词典，顺利完成了翻译工作。",
            "question_pinyin": "他___词典，顺利完成了翻译工作。",
            "question_english": "With the help of a dictionary, he successfully completed the translation."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 借助?",
            "correct": "她借助手机应用程序，快速学会了发音。",
            "options": [
                "她借助手机应用程序，快速学会了发音。",
                "手机借助她应用程序，快速学会了发音。",
                "她快速借助，手机应用程序学会了发音。",
                "借助发音，她手机应用程序快速学会了。"
            ],
            "option_pinyin": [
                "tā jiè zhù shǒu jī yìng yòng chéng xù kuài sù xué huì le fā yīn",
                "shǒu jī jiè zhù tā yìng yòng chéng xù kuài sù xué huì le fā yīn",
                "tā kuài sù jiè zhù shǒu jī yìng yòng chéng xù xué huì le fā yīn",
                "jiè zhù fā yīn tā shǒu jī yìng yòng chéng xù kuài sù xué huì le"
            ]
        },
    ],

    'hsk5_l9_g3': [  # 从而 — Thereby; and thus; as a result
        {
            "type": "multiple_choice",
            "question": "从而 in a sentence means...",
            "correct": "Thereby / Thus — introduces a natural result or further consequence arising from the previous action",
            "options": [
                "Thereby / Thus — introduces a natural result or further consequence arising from the previous action",
                "However — introduces an unexpected contrast to the previous statement",
                "In order to — introduces a purpose for the previous action",
                "Unless — introduces an exception to the previous statement"
            ],
            "option_pinyin": ["cóng ér", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Communicate more, thereby enhancing mutual understanding.",
            "correct": "从而",
            "options": ["从而", "因此", "所以", "然后"],
            "option_pinyin": ["cóng ér", "yīn cǐ", "suǒ yǐ", "rán hòu"],
            "question_chinese": "多交流，___增进相互了解。",
            "question_pinyin": "多交流，___增进相互了解。",
            "question_english": "Communicate more, thereby enhancing mutual understanding."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 从而?",
            "correct": "她努力学习语法，从而提高了写作水平。",
            "options": [
                "她努力学习语法，从而提高了写作水平。",
                "从而她努力学习语法，提高了写作水平。",
                "她从而努力，学习语法提高了写作水平。",
                "提高了写作水平，她努力学习语法从而。"
            ],
            "option_pinyin": [
                "tā nǔ lì xué xí yǔ fǎ cóng ér tí gāo le xiě zuò shuǐ píng",
                "cóng ér tā nǔ lì xué xí yǔ fǎ tí gāo le xiě zuò shuǐ píng",
                "tā cóng ér nǔ lì xué xí yǔ fǎ tí gāo le xiě zuò shuǐ píng",
                "tí gāo le xiě zuò shuǐ píng tā nǔ lì xué xí yǔ fǎ cóng ér"
            ]
        },
    ],

    # ── L10 ───────────────────────────────────────────────────────────────────
    'hsk5_l10_g1': [  # 随着 — As; along with (urban context)
        {
            "type": "multiple_choice",
            "question": "随着 + N, the following clause describes...",
            "correct": "A change or development that occurs simultaneously with or as a direct result of the noun phrase",
            "options": [
                "A change or development that occurs simultaneously with or as a direct result of the noun phrase",
                "The reason why something happened",
                "The purpose behind an action",
                "A concession that doesn't change the main result"
            ],
            "option_pinyin": ["suí zhe", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: As the city develops, traffic pressure is increasing.",
            "correct": "随着",
            "options": ["随着", "因为", "虽然", "即使"],
            "option_pinyin": ["suí zhe", "yīn wèi", "suī rán", "jí shǐ"],
            "question_chinese": "___城市的发展，交通压力越来越大。",
            "question_pinyin": "___城市的发展，交通压力越来越大。",
            "question_english": "As the city develops, traffic pressure is increasing."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 随着?",
            "correct": "随着人口增加，城市的交通更加拥挤了。",
            "options": [
                "随着人口增加，城市的交通更加拥挤了。",
                "人口增加随着，城市的交通更加拥挤了。",
                "城市的交通随着，人口增加更加拥挤了。",
                "更加拥挤随着人口增加，城市的交通了。"
            ],
            "option_pinyin": [
                "suí zhe rén kǒu zēng jiā chéng shì de jiāo tōng gèng jiā yōng jǐ le",
                "rén kǒu zēng jiā suí zhe chéng shì de jiāo tōng gèng jiā yōng jǐ le",
                "chéng shì de jiāo tōng suí zhe rén kǒu zēng jiā gèng jiā yōng jǐ le",
                "gèng jiā yōng jǐ suí zhe rén kǒu zēng jiā chéng shì de jiāo tōng le"
            ]
        },
    ],

    'hsk5_l10_g2': [  # 由于 — Due to; because of (standalone)
        {
            "type": "multiple_choice",
            "question": "由于 + cause/reason means...",
            "correct": "Due to / Because of — introduces a cause or reason; more formal than 因为",
            "options": [
                "Due to / Because of — introduces a cause or reason; more formal than 因为",
                "In order to — introduces a purpose or goal",
                "Although — introduces a concession",
                "Unless — introduces the only exception"
            ],
            "option_pinyin": ["yóu yú", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Due to heavy traffic, he is often late for work.",
            "correct": "由于",
            "options": ["由于", "虽然", "既然", "除非"],
            "option_pinyin": ["yóu yú", "suī rán", "jì rán", "chú fēi"],
            "question_chinese": "___交通拥挤，他上班经常迟到。",
            "question_pinyin": "___交通拥挤，他上班经常迟到。",
            "question_english": "Due to heavy traffic, he is often late for work."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 由于?",
            "correct": "由于城市规划合理，这个社区环境非常好。",
            "options": [
                "由于城市规划合理，这个社区环境非常好。",
                "城市规划由于合理，这个社区环境非常好。",
                "这个社区由于，城市规划合理环境非常好。",
                "合理由于城市规划，这个社区环境非常好。"
            ],
            "option_pinyin": [
                "yóu yú chéng shì guī huà hé lǐ zhè gè shè qū huán jìng fēi cháng hǎo",
                "chéng shì guī huà yóu yú hé lǐ zhè gè shè qū huán jìng fēi cháng hǎo",
                "zhè gè shè qū yóu yú chéng shì guī huà hé lǐ huán jìng fēi cháng hǎo",
                "hé lǐ yóu yú chéng shì guī huà zhè gè shè qū huán jìng fēi cháng hǎo"
            ]
        },
    ],

    'hsk5_l10_g3': [  # 尽管 — Although; even though (standalone)
        {
            "type": "multiple_choice",
            "question": "尽管 + clause, the following clause usually expresses...",
            "correct": "A contrast or unexpected result — 尽管 concedes a fact, and the next clause shows a surprising or opposing outcome",
            "options": [
                "A contrast or unexpected result — 尽管 concedes a fact, and the next clause shows a surprising or opposing outcome",
                "A direct cause — because of what 尽管 introduces, the result happens",
                "A sequence — after what 尽管 introduces, the next thing happens",
                "A condition — only when 尽管's clause is true does the result happen"
            ],
            "option_pinyin": ["jǐn guǎn", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Although urban life is stressful, many people still choose to settle in the city.",
            "correct": "尽管",
            "options": ["尽管", "因为", "只要", "既然"],
            "option_pinyin": ["jǐn guǎn", "yīn wèi", "zhǐ yào", "jì rán"],
            "question_chinese": "___城市生活压力大，很多人还是选择在城市定居。",
            "question_pinyin": "___城市生活压力大，很多人还是选择在城市定居。",
            "question_english": "Although urban life is stressful, many people still choose to settle in the city."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 尽管?",
            "correct": "尽管城市节奏很快，他还是习惯了这里的生活。",
            "options": [
                "尽管城市节奏很快，他还是习惯了这里的生活。",
                "城市节奏尽管很快，还是他习惯了这里的生活。",
                "他还是尽管，城市节奏很快习惯了这里的生活。",
                "习惯了这里的生活，尽管城市节奏他还是很快。"
            ],
            "option_pinyin": [
                "jǐn guǎn chéng shì jié zòu hěn kuài tā hái shì xí guàn le zhè lǐ de shēng huó",
                "chéng shì jié zòu jǐn guǎn hěn kuài hái shì tā xí guàn le zhè lǐ de shēng huó",
                "tā hái shì jǐn guǎn chéng shì jié zòu hěn kuài xí guàn le zhè lǐ de shēng huó",
                "xí guàn le zhè lǐ de shēng huó jǐn guǎn chéng shì jié zòu tā hái shì hěn kuài"
            ]
        },
    ],
}

# ── grammar key mapping (lesson number → list of GRAMMAR_MINI keys) ──────────

GRAMMAR_KEYS = {
    6:  ['hsk5_l6_g1',  'hsk5_l6_g2',  'hsk5_l6_g3'],
    7:  ['hsk5_l7_g1',  'hsk5_l7_g2',  'hsk5_l7_g3'],
    8:  ['hsk5_l8_g1',  'hsk5_l8_g2',  'hsk5_l8_g3'],
    9:  ['hsk5_l9_g1',  'hsk5_l9_g2',  'hsk5_l9_g3'],
    10: ['hsk5_l10_g1', 'hsk5_l10_g2', 'hsk5_l10_g3'],
}

# ── main processing ───────────────────────────────────────────────────────────

random.seed(42)
DATA_DIR = os.path.dirname(os.path.abspath(__file__))

for lesson_num in range(6, 11):
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
