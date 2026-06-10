#!/usr/bin/env python3
"""Generate mini_exercises for HSK2 lessons 1-5."""
import json, random, os

BASE = os.path.dirname(__file__)

# ── helpers ──────────────────────────────────────────────────────────────────

def shuffle(lst):
    lst = list(lst)
    random.shuffle(lst)
    return lst

def make_options(correct_ch, correct_py, wrong_pairs, target_len=4):
    """Build options/option_pinyin lists with correct answer shuffled in."""
    pool_ch = [w[0] for w in wrong_pairs]
    pool_py = [w[1] for w in wrong_pairs]
    chosen_ch = pool_ch[:target_len-1]
    chosen_py = pool_py[:target_len-1]
    combined = list(zip([correct_ch]+chosen_ch, [correct_py]+chosen_py))
    random.shuffle(combined)
    opts = [c[0] for c in combined]
    pys  = [c[1] for c in combined]
    return opts, pys

def make_eng_options(correct_eng, wrong_engs):
    opts = [correct_eng] + wrong_engs[:3]
    random.shuffle(opts)
    return opts

# ── vocab mini_exercises generator ───────────────────────────────────────────

def gen_vocab_mini(word, all_vocab):
    """3 mini_exercises for a vocab word."""
    ch   = word['chinese']
    py   = word['pinyin']
    eng  = word['english']
    ex_ch   = word.get('example', f"我{ch}。")
    ex_py   = ''
    ex_eng  = word.get('translation', '')

    # pick 3 distractor words (different Chinese)
    others = [v for v in all_vocab if v['chinese'] != ch and v.get('part_of_speech') != 'phrase']
    random.shuffle(others)
    distractors = others[:6]  # grab extras

    # distractor english meanings
    wrong_engs = [d['english'] for d in distractors[:3]]
    # distractor chinese/pinyin pairs
    wrong_ch_py = [(d['chinese'], d['pinyin']) for d in distractors[3:6] if d] or [(d['chinese'], d['pinyin']) for d in distractors[:3]]

    # pad if needed
    fallback = [('什么', 'shén me'), ('很好', 'hěn hǎo'), ('朋友', 'péng yǒu'), ('学习', 'xué xí')]
    while len(wrong_ch_py) < 3:
        wrong_ch_py.append(fallback[len(wrong_ch_py) % len(fallback)])
    while len(wrong_engs) < 3:
        wrong_engs.append('—')

    # Exercise 1: meaning (eng)
    eng_opts = make_eng_options(eng, wrong_engs)
    ex1 = {
        "type": "multiple_choice",
        "question": f"What does {ch} mean?",
        "correct": eng,
        "options": eng_opts,
        "option_pinyin": [py if o == eng else distractors[i % len(distractors)]['pinyin'] for i, o in enumerate(eng_opts)]
    }
    # rebuild option_pinyin cleanly
    py_map = {d['english']: d['pinyin'] for d in distractors[:3]}
    py_map[eng] = py
    ex1['option_pinyin'] = [py_map.get(o, py) for o in eng_opts]

    # Exercise 2: fill_blank using example sentence
    # Find a blank position in the example (replace the target word)
    if ch in ex_ch:
        blank_ch = ex_ch.replace(ch, '___', 1)
    else:
        blank_ch = f"___..."
    # Build pinyin blank sentence (approximate)
    blank_py = blank_ch.replace('___', '___')

    opts2, pys2 = make_options(ch, py, wrong_ch_py[:3])

    ex2 = {
        "type": "fill_blank",
        "question": f"Fill in: {eng}",
        "correct": ch,
        "options": opts2,
        "option_pinyin": pys2,
        "question_chinese": blank_ch,
        "question_pinyin": blank_py,
        "question_english": ex_eng
    }

    # Exercise 3: which word means... (choose Chinese)
    opts3, pys3 = make_options(ch, py, wrong_ch_py[:3])
    ex3 = {
        "type": "multiple_choice",
        "question": f"Which word means '{eng}'?",
        "correct": ch,
        "options": opts3,
        "option_pinyin": pys3
    }

    return [ex1, ex2, ex3]


# ── grammar mini_exercises: handcrafted per lesson/grammar ───────────────────

GRAMMAR_MINI = {
    # Lesson 1
    "hsk2_l1_g1": [  # 最
        {
            "type": "multiple_choice",
            "question": "What does 最 mean?",
            "correct": "Most / -est (superlative)",
            "options": ["Most / -est (superlative)", "Very", "Also", "Going to"],
            "option_pinyin": ["zuì", "hěn", "yě", "yào"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in the superlative: I like sports the most.",
            "correct": "最",
            "options": ["最", "很", "也", "要"],
            "option_pinyin": ["zuì", "hěn", "yě", "yào"],
            "question_chinese": "我___喜欢运动。",
            "question_pinyin": "Wǒ ___ xǐ huān yùn dòng.",
            "question_english": "I like sports the most."
        },
        {
            "type": "multiple_choice",
            "question": "Where does 最 go in a sentence?",
            "correct": "Before an adjective or verb",
            "options": ["Before an adjective or verb", "After the verb", "At the end", "After the subject"],
            "option_pinyin": ["zuì + adj/verb", "verb + zuì", "sentence + zuì", "subj + zuì"]
        }
    ],
    "hsk2_l1_g2": [  # approximate numbers
        {
            "type": "multiple_choice",
            "question": "Which word means 'several / a few' (under 10)?",
            "correct": "几",
            "options": ["几", "多", "来", "最"],
            "option_pinyin": ["jǐ", "duō", "lái", "zuì"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: more than ten days.",
            "correct": "多",
            "options": ["多", "几", "来", "最"],
            "option_pinyin": ["duō", "jǐ", "lái", "zuì"],
            "question_chinese": "他去了十___天。",
            "question_pinyin": "Tā qù le shí ___ tiān.",
            "question_english": "He went for more than ten days."
        },
        {
            "type": "multiple_choice",
            "question": "How do you say 'about twenty people'?",
            "correct": "二十来个人",
            "options": ["二十来个人", "二十多个人", "二十几个人", "最二十个人"],
            "option_pinyin": ["èr shí lái gè rén", "èr shí duō gè rén", "èr shí jǐ gè rén", "zuì èr shí gè rén"]
        }
    ],
    "hsk2_l1_g3": [  # 要
        {
            "type": "multiple_choice",
            "question": "What does 要 express before a verb?",
            "correct": "Want to / going to (intention)",
            "options": ["Want to / going to (intention)", "Already did", "Cannot", "Must not"],
            "option_pinyin": ["yào + verb", "le", "bù néng", "bù kě yǐ"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: I want to go to Beijing.",
            "correct": "要",
            "options": ["要", "最", "也", "它"],
            "option_pinyin": ["yào", "zuì", "yě", "tā"],
            "question_chinese": "我___去北京。",
            "question_pinyin": "Wǒ ___ qù Běijīng.",
            "question_english": "I want to go to Beijing."
        },
        {
            "type": "multiple_choice",
            "question": "Choose the correct sentence: 'She also wants to go travelling.'",
            "correct": "她也要去旅游。",
            "options": ["她也要去旅游。", "她最去旅游。", "她去旅游也。", "她旅游要去。"],
            "option_pinyin": ["Tā yě yào qù lǚ yóu.", "Tā zuì qù lǚ yóu.", "Tā qù lǚ yóu yě.", "Tā lǚ yóu yào qù."]
        }
    ],
    # Lesson 2
    "hsk2_l2_g1": [  # 还是
        {
            "type": "multiple_choice",
            "question": "What is 还是 used for?",
            "correct": "Alternative questions (A or B?)",
            "options": ["Alternative questions (A or B?)", "Statements with 'or'", "Agreeing with someone", "Adding information"],
            "option_pinyin": ["hái shì", "huò zhě", "duì", "ér qiě"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Are you going in the morning or afternoon?",
            "correct": "还是",
            "options": ["还是", "或者", "也", "再"],
            "option_pinyin": ["hái shì", "huò zhě", "yě", "zài"],
            "question_chinese": "你是上午___下午去？",
            "question_pinyin": "Nǐ shì shàng wǔ ___ xià wǔ qù?",
            "question_english": "Are you going in the morning or in the afternoon?"
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence is a correct alternative question?",
            "correct": "你喝茶还是咖啡？",
            "options": ["你喝茶还是咖啡？", "你喝茶或者咖啡。", "你茶还是咖啡喝？", "你喝茶也咖啡？"],
            "option_pinyin": ["Nǐ hē chá hái shì kā fēi?", "Nǐ hē chá huò zhě kā fēi.", "Nǐ chá hái shì kā fēi hē?", "Nǐ hē chá yě kā fēi?"]
        }
    ],
    "hsk2_l2_g2": [  # interrogative pronouns
        {
            "type": "multiple_choice",
            "question": "Which interrogative pronoun means 'when'?",
            "correct": "什么时候",
            "options": ["什么时候", "为什么", "怎么", "哪里"],
            "option_pinyin": ["shén me shí hou", "wèi shén me", "zěn me", "nǎ lǐ"]
        },
        {
            "type": "fill_blank",
            "question": "Ask: When do you get up?",
            "correct": "什么时候",
            "options": ["什么时候", "为什么", "怎么样", "多少"],
            "option_pinyin": ["shén me shí hou", "wèi shén me", "zěn me yàng", "duō shǎo"],
            "question_chinese": "你___起床？",
            "question_pinyin": "Nǐ ___ qǐ chuáng?",
            "question_english": "When do you get up?"
        },
        {
            "type": "multiple_choice",
            "question": "In Chinese, where do interrogative pronouns go?",
            "correct": "In the same position as the answer would be",
            "options": ["In the same position as the answer would be", "Always at the beginning", "Always at the end", "After the verb"],
            "option_pinyin": ["same position", "beginning", "end", "after verb"]
        }
    ],
    "hsk2_l2_g3": [  # 再
        {
            "type": "multiple_choice",
            "question": "What does 再 express?",
            "correct": "Future repetition or sequence (then/again)",
            "options": ["Future repetition or sequence (then/again)", "Past repetition", "Simultaneous actions", "Negation"],
            "option_pinyin": ["zài", "yòu", "yī qǐ", "bù"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: I'll eat first, then go to work.",
            "correct": "再",
            "options": ["再", "又", "也", "每"],
            "option_pinyin": ["zài", "yòu", "yě", "měi"],
            "question_chinese": "我先吃饭，___去上班。",
            "question_pinyin": "Wǒ xiān chī fàn, ___ qù shàng bān.",
            "question_english": "I'll eat first, then go to work."
        },
        {
            "type": "multiple_choice",
            "question": "What is the difference between 再 and 又?",
            "correct": "再 is for future actions; 又 is for past repetitions",
            "options": ["再 is for future actions; 又 is for past repetitions", "They mean the same thing", "再 is past; 又 is future", "再 means 'also'"],
            "option_pinyin": ["zài=future, yòu=past", "same", "zài=past, yòu=future", "zài=also"]
        }
    ],
    # Lesson 3
    "hsk2_l3_g1": [  # 的-phrase nominalisation
        {
            "type": "multiple_choice",
            "question": "What does adding 的 after an adjective do?",
            "correct": "Turns it into a noun phrase (e.g. 大的 = the big one)",
            "options": ["Turns it into a noun phrase (e.g. 大的 = the big one)", "Makes it an adverb", "Negates the adjective", "Makes a question"],
            "option_pinyin": ["adj+de=noun", "adverb", "negation", "question"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Give the big one to him.",
            "correct": "大",
            "options": ["大", "小", "红", "黑"],
            "option_pinyin": ["dà", "xiǎo", "hóng", "hēi"],
            "question_chinese": "___的给他。",
            "question_pinyin": "___ de gěi tā.",
            "question_english": "Give the big one to him."
        },
        {
            "type": "multiple_choice",
            "question": "Which phrase means 'the white one on the right'?",
            "correct": "右边的白色",
            "options": ["右边的白色", "左边的黑色", "旁边的红色", "左边的白色"],
            "option_pinyin": ["yòu bian de bái sè", "zuǒ bian de hēi sè", "páng biān de hóng sè", "zuǒ bian de bái sè"]
        }
    ],
    "hsk2_l3_g2": [  # 着
        {
            "type": "multiple_choice",
            "question": "What does 着 indicate after a verb?",
            "correct": "An ongoing state or action (continuous/static)",
            "options": ["An ongoing state or action (continuous/static)", "A completed action", "A future action", "A negative action"],
            "option_pinyin": ["zhe=ongoing", "le=completed", "future", "negative"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: The door is open (ongoing state).",
            "correct": "着",
            "options": ["着", "了", "过", "在"],
            "option_pinyin": ["zhe", "le", "guò", "zài"],
            "question_chinese": "门开___。",
            "question_pinyin": "Mén kāi ___.",
            "question_english": "The door is open."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence shows an ongoing state?",
            "correct": "门开着，请进来。",
            "options": ["门开着，请进来。", "门开了。", "门要开。", "门不开。"],
            "option_pinyin": ["Mén kāi zhe, qǐng jìn lái.", "Mén kāi le.", "Mén yào kāi.", "Mén bù kāi."]
        }
    ],
    "hsk2_l3_g3": [  # nominal predicate
        {
            "type": "multiple_choice",
            "question": "What is a nominal predicate in Chinese?",
            "correct": "Using a noun/noun phrase directly as the predicate (no 是 needed)",
            "options": ["Using a noun/noun phrase directly as the predicate (no 是 needed)", "Using 是 with every noun", "Putting the noun at the end", "Adding 的 after every noun"],
            "option_pinyin": ["noun as predicate", "shì+noun", "noun at end", "noun+de"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: What colour is it? (using 颜色)",
            "correct": "颜色",
            "options": ["颜色", "大小", "左边", "旁边"],
            "option_pinyin": ["yán sè", "dà xiǎo", "zuǒ bian", "páng biān"],
            "question_chinese": "这件衣服是什么___？",
            "question_pinyin": "Zhè jiàn yī fu shì shén me ___?",
            "question_english": "What colour is this item of clothing?"
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence uses a nominal predicate correctly?",
            "correct": "今天星期三。",
            "options": ["今天星期三。", "今天是很星期三。", "今天了星期三。", "今天星期三是。"],
            "option_pinyin": ["Jīn tiān xīng qī sān.", "Jīn tiān shì hěn xīng qī sān.", "Jīn tiān le xīng qī sān.", "Jīn tiān xīng qī sān shì."]
        }
    ],
    # Lesson 4
    "hsk2_l4_g1": [  # 是...的
        {
            "type": "multiple_choice",
            "question": "What does the 是…的 structure emphasise?",
            "correct": "The time, place, or manner of a past action",
            "options": ["The time, place, or manner of a past action", "Future plans", "Ongoing actions", "Hypothetical situations"],
            "option_pinyin": ["shì...de=past context", "future", "ongoing", "hypothetical"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: He joined the company yesterday (emphasis on time).",
            "correct": "是",
            "options": ["是", "有", "在", "要"],
            "option_pinyin": ["shì", "yǒu", "zài", "yào"],
            "question_chinese": "他昨天___进公司的。",
            "question_pinyin": "Tā zuó tiān ___ jìn gōng sī de.",
            "question_english": "He joined the company yesterday."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence uses 是…的 correctly?",
            "correct": "他是昨天来的。",
            "options": ["他是昨天来的。", "他昨天来。", "他是来昨天。", "他的昨天来是。"],
            "option_pinyin": ["Tā shì zuó tiān lái de.", "Tā zuó tiān lái.", "Tā shì lái zuó tiān.", "Tā de zuó tiān lái shì."]
        }
    ],
    "hsk2_l4_g2": [  # 也
        {
            "type": "multiple_choice",
            "question": "Where does 也 go in a sentence?",
            "correct": "Before the verb (after the subject)",
            "options": ["Before the verb (after the subject)", "After the verb", "At the end of the sentence", "Before the subject"],
            "option_pinyin": ["subj+也+verb", "verb+也", "sent+也", "也+subj"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: He also wants to meet tomorrow.",
            "correct": "也",
            "options": ["也", "都", "就", "再"],
            "option_pinyin": ["yě", "dōu", "jiù", "zài"],
            "question_chinese": "他___要明天见面。",
            "question_pinyin": "Tā ___ yào míng tiān jiàn miàn.",
            "question_english": "He also wants to meet tomorrow."
        },
        {
            "type": "multiple_choice",
            "question": "Choose the correct sentence: 'She also works at the company.'",
            "correct": "她也在公司上班。",
            "options": ["她也在公司上班。", "她在也公司上班。", "她在公司也上班。", "也她在公司上班。"],
            "option_pinyin": ["Tā yě zài gōng sī shàng bān.", "Tā zài yě gōng sī shàng bān.", "Tā zài gōng sī yě shàng bān.", "Yě tā zài gōng sī shàng bān."]
        }
    ],
    "hsk2_l4_g3": [  # 正在
        {
            "type": "multiple_choice",
            "question": "What does 正在 indicate?",
            "correct": "An action happening right now (progressive)",
            "options": ["An action happening right now (progressive)", "A completed action", "A future plan", "A habitual action"],
            "option_pinyin": ["zhèng zài=now", "completed", "future", "habitual"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: He is currently introducing his colleague.",
            "correct": "正在",
            "options": ["正在", "已经", "以后", "再"],
            "option_pinyin": ["zhèng zài", "yǐ jīng", "yǐ hòu", "zài"],
            "question_chinese": "他___介绍同事。",
            "question_pinyin": "Tā ___ jiè shào tóng shì.",
            "question_english": "He is currently introducing his colleague."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence means 'I am currently working'?",
            "correct": "我正在上班。",
            "options": ["我正在上班。", "我上班了。", "我要上班。", "我上班以前。"],
            "option_pinyin": ["Wǒ zhèng zài shàng bān.", "Wǒ shàng bān le.", "Wǒ yào shàng bān.", "Wǒ shàng bān yǐ qián."]
        }
    ],
    # Lesson 5
    "hsk2_l5_g1": [  # 吧
        {
            "type": "multiple_choice",
            "question": "What does 吧 at the end of a sentence do?",
            "correct": "Softens suggestions or seeks agreement (right? / let's...)",
            "options": ["Softens suggestions or seeks agreement (right? / let's...)", "Makes a strong command", "Expresses surprise", "Marks a completed action"],
            "option_pinyin": ["ba=suggestion", "command", "surprise", "le=completed"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Buy this one, it's cheap (suggestion).",
            "correct": "吧",
            "options": ["吧", "啊", "呢", "了"],
            "option_pinyin": ["ba", "a", "ne", "le"],
            "question_chinese": "买这件___，很便宜。",
            "question_pinyin": "Mǎi zhè jiàn ___, hěn pián yi.",
            "question_english": "Buy this one; it's cheap."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence uses 吧 as a suggestion?",
            "correct": "穿这件吧。",
            "options": ["穿这件吧。", "穿这件了。", "穿这件呢？", "穿这件吗？"],
            "option_pinyin": ["Chuān zhè jiàn ba.", "Chuān zhè jiàn le.", "Chuān zhè jiàn ne?", "Chuān zhè jiàn ma?"]
        }
    ],
    "hsk2_l5_g2": [  # 一下
        {
            "type": "multiple_choice",
            "question": "What does 一下 do after a verb?",
            "correct": "Softens the action (give it a try / just a moment)",
            "options": ["Softens the action (give it a try / just a moment)", "Marks repetition", "Indicates completion", "Makes it negative"],
            "option_pinyin": ["yí xià=soften", "repetition", "completed", "negative"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Let me have a look (soften the action).",
            "correct": "一下",
            "options": ["一下", "一次", "一点儿", "一起"],
            "option_pinyin": ["yí xià", "yí cì", "yì diǎnr", "yì qǐ"],
            "question_chinese": "给我看___这件衣服。",
            "question_pinyin": "Gěi wǒ kàn ___ zhè jiàn yī fu.",
            "question_english": "Let me have a look at this item of clothing."
        },
        {
            "type": "multiple_choice",
            "question": "Which phrase means 'try it out'?",
            "correct": "试一下",
            "options": ["试一下", "看一次", "买一件", "送一个"],
            "option_pinyin": ["shì yí xià", "kàn yí cì", "mǎi yí jiàn", "sòng yí gè"]
        }
    ],
    "hsk2_l5_g3": [  # 给 as preposition
        {
            "type": "multiple_choice",
            "question": "When 给 is used as a preposition, what does it mean?",
            "correct": "For / To (beneficiary marker)",
            "options": ["For / To (beneficiary marker)", "From", "With", "About"],
            "option_pinyin": ["gěi=for/to", "from", "with", "about"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: I bought this for my friend.",
            "correct": "给",
            "options": ["给", "从", "在", "对"],
            "option_pinyin": ["gěi", "cóng", "zài", "duì"],
            "question_chinese": "我___朋友买了一件衣服。",
            "question_pinyin": "Wǒ ___ péng you mǎi le yí jiàn yī fu.",
            "question_english": "I bought a piece of clothing for my friend."
        },
        {
            "type": "multiple_choice",
            "question": "Choose the correct sentence: 'He gave me a piece of clothing.'",
            "correct": "他给我一件衣服。",
            "options": ["他给我一件衣服。", "他我给一件衣服。", "他一件衣服给我。", "给他我一件衣服。"],
            "option_pinyin": ["Tā gěi wǒ yí jiàn yī fu.", "Tā wǒ gěi yí jiàn yī fu.", "Tā yí jiàn yī fu gěi wǒ.", "Gěi tā wǒ yí jiàn yī fu."]
        }
    ]
}

GRAMMAR_KEY_MAP = {
    # lesson_number, grammar_number -> key
    (1, 1): "hsk2_l1_g1",
    (1, 2): "hsk2_l1_g2",
    (1, 3): "hsk2_l1_g3",
    (2, 1): "hsk2_l2_g1",
    (2, 2): "hsk2_l2_g2",
    (2, 3): "hsk2_l2_g3",
    (3, 1): "hsk2_l3_g1",
    (3, 2): "hsk2_l3_g2",
    (3, 3): "hsk2_l3_g3",
    (4, 1): "hsk2_l4_g1",
    (4, 2): "hsk2_l4_g2",
    (4, 3): "hsk2_l4_g3",
    (5, 1): "hsk2_l5_g1",
    (5, 2): "hsk2_l5_g2",
    (5, 3): "hsk2_l5_g3",
}

# ── main ──────────────────────────────────────────────────────────────────────

random.seed(42)

for lesson_num in range(1, 6):
    path = os.path.join(BASE, f"hsk2_lesson_{lesson_num}.json")
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    all_vocab = data['vocabulary']

    # Add mini_exercises to each vocabulary word (non-phrase)
    for word in data['vocabulary']:
        if word.get('part_of_speech') == 'phrase':
            continue
        if 'mini_exercises' in word:
            continue  # already has them
        word['mini_exercises'] = gen_vocab_mini(word, all_vocab)

    # Add mini_exercises to each grammar point
    for gp in data.get('grammar_points', []):
        gnum = gp['number']
        key = GRAMMAR_KEY_MAP.get((lesson_num, gnum))
        if key and key in GRAMMAR_MINI:
            if 'mini_exercises' not in gp:
                gp['mini_exercises'] = GRAMMAR_MINI[key]

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    vocab_count = sum(1 for v in data['vocabulary'] if v.get('part_of_speech') != 'phrase' and 'mini_exercises' in v)
    gp_count = sum(1 for g in data.get('grammar_points', []) if 'mini_exercises' in g)
    print(f"Lesson {lesson_num}: {vocab_count} vocab words + {gp_count} grammar points updated")

print("Done.")
