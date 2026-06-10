#!/usr/bin/env python3
"""Generate mini_exercises for HSK2 lessons 6-10."""
import json, random, os

BASE = os.path.dirname(__file__)

# ── helpers ──────────────────────────────────────────────────────────────────

def shuffle(lst):
    lst = list(lst)
    random.shuffle(lst)
    return lst

def make_options(correct_ch, correct_py, wrong_pairs, target_len=4):
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
    ch   = word['chinese']
    py   = word['pinyin']
    eng  = word['english']
    ex_ch   = word.get('example', f"我{ch}。")
    ex_eng  = word.get('translation', '')

    others = [v for v in all_vocab if v['chinese'] != ch and v.get('part_of_speech') != 'phrase']
    random.shuffle(others)
    distractors = others[:6]

    wrong_engs = [d['english'] for d in distractors[:3]]
    wrong_ch_py = [(d['chinese'], d['pinyin']) for d in distractors[3:6] if d] or [(d['chinese'], d['pinyin']) for d in distractors[:3]]

    fallback = [('什么', 'shén me'), ('很好', 'hěn hǎo'), ('朋友', 'péng yǒu'), ('学习', 'xué xí')]
    while len(wrong_ch_py) < 3:
        wrong_ch_py.append(fallback[len(wrong_ch_py) % len(fallback)])
    while len(wrong_engs) < 3:
        wrong_engs.append('—')

    # Exercise 1: meaning (English options)
    eng_opts = make_eng_options(eng, wrong_engs)
    py_map = {d['english']: d['pinyin'] for d in distractors[:3]}
    py_map[eng] = py
    ex1 = {
        "type": "multiple_choice",
        "question": f"What does {ch} mean?",
        "correct": eng,
        "options": eng_opts,
        "option_pinyin": [py_map.get(o, py) for o in eng_opts]
    }

    # Exercise 2: fill_blank
    blank_ch = ex_ch.replace(ch, '___', 1) if ch in ex_ch else f"___..."
    opts2, pys2 = make_options(ch, py, wrong_ch_py[:3])
    ex2 = {
        "type": "fill_blank",
        "question": f"Fill in: {eng}",
        "correct": ch,
        "options": opts2,
        "option_pinyin": pys2,
        "question_chinese": blank_ch,
        "question_pinyin": blank_ch,
        "question_english": ex_eng
    }

    # Exercise 3: which Chinese word means... (Chinese options)
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
    # ── Lesson 6: Food & Health ───────────────────────────────────────────────
    "hsk2_l6_g1": [  # 虽然...但是...
        {
            "type": "multiple_choice",
            "question": "What does 虽然...但是... connect?",
            "correct": "Concession: 'Although X, but Y'",
            "options": ["Concession: 'Although X, but Y'", "Cause and effect: 'Because X, so Y'", "Condition: 'If X, then Y'", "Sequence: 'First X, then Y'"],
            "option_pinyin": ["suī rán...dàn shì...", "yīn wèi...suǒ yǐ...", "rú guǒ...jiù...", "xiān...zài..."]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Although it's delicious, I'm already full.",
            "correct": "虽然",
            "options": ["虽然", "因为", "如果", "所以"],
            "option_pinyin": ["suī rán", "yīn wèi", "rú guǒ", "suǒ yǐ"],
            "question_chinese": "___好吃，但是我已经饱了。",
            "question_pinyin": "___ hǎo chī, dàn shì wǒ yǐ jīng bǎo le.",
            "question_english": "Although it's delicious, I'm already full."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 虽然...但是...?",
            "correct": "虽然他忙，但是他来了。",
            "options": ["虽然他忙，但是他来了。", "因为他忙，但是他来了。", "虽然他忙，所以他来了。", "虽然他忙，他来了。"],
            "option_pinyin": ["suī rán tā máng, dàn shì tā lái le.", "yīn wèi tā máng, dàn shì tā lái le.", "suī rán tā máng, suǒ yǐ tā lái le.", "suī rán tā máng, tā lái le."]
        }
    ],
    "hsk2_l6_g2": [  # 因为...所以...
        {
            "type": "multiple_choice",
            "question": "What does 因为 mean?",
            "correct": "Because",
            "options": ["Because", "Although", "Therefore", "But"],
            "option_pinyin": ["yīn wèi", "suī rán", "suǒ yǐ", "dàn shì"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Because I'm too full, I won't eat anymore.",
            "correct": "所以",
            "options": ["所以", "但是", "虽然", "还是"],
            "option_pinyin": ["suǒ yǐ", "dàn shì", "suī rán", "hái shì"],
            "question_chinese": "因为太饱了，___不吃了。",
            "question_pinyin": "Yīn wèi tài bǎo le, ___ bù chī le.",
            "question_english": "Because I'm too full, I won't eat anymore."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 因为...所以...?",
            "correct": "因为好吃，所以我多吃了一碗。",
            "options": ["因为好吃，所以我多吃了一碗。", "虽然好吃，所以我多吃了一碗。", "因为好吃，但是我多吃了一碗。", "所以好吃，因为我多吃了一碗。"],
            "option_pinyin": ["yīn wèi hǎo chī, suǒ yǐ wǒ duō chī le yì wǎn.", "suī rán hǎo chī, suǒ yǐ wǒ duō chī le yì wǎn.", "yīn wèi hǎo chī, dàn shì wǒ duō chī le yì wǎn.", "suǒ yǐ hǎo chī, yīn wèi wǒ duō chī le yì wǎn."]
        }
    ],
    "hsk2_l6_g3": [  # 了 change of state
        {
            "type": "multiple_choice",
            "question": "What does sentence-final 了 indicate?",
            "correct": "A change of state or new situation",
            "options": ["A change of state or new situation", "A completed past action", "A future plan", "A question"],
            "option_pinyin": ["change of state", "completed past", "future", "question"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: I'm full now (change of state).",
            "correct": "了",
            "options": ["了", "过", "着", "呢"],
            "option_pinyin": ["le", "guò", "zhe", "ne"],
            "question_chinese": "我已经饱___。",
            "question_pinyin": "Wǒ yǐ jīng bǎo ___.",
            "question_english": "I'm already full now."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence uses 了 to mark a change of state?",
            "correct": "天气热了。",
            "options": ["天气热了。", "我吃了饭。", "他来了一次。", "她买了一件。"],
            "option_pinyin": ["Tiān qì rè le.", "Wǒ chī le fàn.", "Tā lái le yí cì.", "Tā mǎi le yì jiàn."]
        }
    ],
    # ── Lesson 7: Commuting & Transportation ──────────────────────────────────
    "hsk2_l7_g1": [  # 离 — Expressing Distance
        {
            "type": "multiple_choice",
            "question": "What does 离 express in a sentence?",
            "correct": "Distance between two places",
            "options": ["Distance between two places", "Direction of movement", "Starting point of a journey", "Destination"],
            "option_pinyin": ["lí=distance", "direction", "starting point", "destination"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: My home is very close to school.",
            "correct": "离",
            "options": ["离", "从", "到", "往"],
            "option_pinyin": ["lí", "cóng", "dào", "wǎng"],
            "question_chinese": "我家___学校很近。",
            "question_pinyin": "Wǒ jiā ___ xué xiào hěn jìn.",
            "question_english": "My home is very close to school."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 离 to express distance?",
            "correct": "学校离我家很近。",
            "options": ["学校离我家很近。", "学校从我家很近。", "学校到我家很近。", "学校在我家很近。"],
            "option_pinyin": ["Xué xiào lí wǒ jiā hěn jìn.", "Xué xiào cóng wǒ jiā hěn jìn.", "Xué xiào dào wǒ jiā hěn jìn.", "Xué xiào zài wǒ jiā hěn jìn."]
        }
    ],
    "hsk2_l7_g2": [  # 从...到...
        {
            "type": "multiple_choice",
            "question": "What does 从...到... express?",
            "correct": "A range from start to end (place or time)",
            "options": ["A range from start to end (place or time)", "Distance between two places", "Direction of movement", "The reason for an action"],
            "option_pinyin": ["cóng...dào...=range", "distance", "direction", "reason"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: From here to the company, how do you walk?",
            "correct": "从",
            "options": ["从", "离", "往", "在"],
            "option_pinyin": ["cóng", "lí", "wǎng", "zài"],
            "question_chinese": "___这里到公司怎么走？",
            "question_pinyin": "___ zhè lǐ dào gōng sī zěn me zǒu?",
            "question_english": "From here to the company, how do you walk?"
        },
        {
            "type": "multiple_choice",
            "question": "How do you say 'from home to school'?",
            "correct": "从家到学校",
            "options": ["从家到学校", "离家到学校", "往家到学校", "在家到学校"],
            "option_pinyin": ["cóng jiā dào xué xiào", "lí jiā dào xué xiào", "wǎng jiā dào xué xiào", "zài jiā dào xué xiào"]
        }
    ],
    "hsk2_l7_g3": [  # 就 — The Adverb jiù
        {
            "type": "multiple_choice",
            "question": "What does 就 mean in '往右边走，就到了'?",
            "correct": "Then / And you'll be there (result)",
            "options": ["Then / And you'll be there (result)", "Again", "Still", "Already"],
            "option_pinyin": ["jiù=then/result", "zài=again", "hái=still", "yǐ jīng=already"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: I'll go right away.",
            "correct": "就",
            "options": ["就", "还", "再", "也"],
            "option_pinyin": ["jiù", "hái", "zài", "yě"],
            "question_chinese": "我___去。",
            "question_pinyin": "Wǒ ___ qù.",
            "question_english": "I'll go right away."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence uses 就 to mean 'simply / just'?",
            "correct": "我就坐公共汽车来。",
            "options": ["我就坐公共汽车来。", "我都坐公共汽车来。", "我也坐公共汽车来。", "我还坐公共汽车来。"],
            "option_pinyin": ["Wǒ jiù zuò gōng gòng qì chē lái.", "Wǒ dōu zuò gōng gòng qì chē lái.", "Wǒ yě zuò gōng gòng qì chē lái.", "Wǒ hái zuò gōng gòng qì chē lái."]
        }
    ],
    # ── Lesson 8: Social Life 1 ───────────────────────────────────────────────
    "hsk2_l8_g1": [  # 让 — Causative Verb
        {
            "type": "multiple_choice",
            "question": "What does 让 mean as a causative verb?",
            "correct": "To let / allow / make someone do something",
            "options": ["To let / allow / make someone do something", "To want to do something", "To hope for something", "To think about something"],
            "option_pinyin": ["ràng=causative", "xiǎng=want", "xī wàng=hope", "juéde=think"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Let me think about it.",
            "correct": "让",
            "options": ["让", "要", "想", "叫"],
            "option_pinyin": ["ràng", "yào", "xiǎng", "jiào"],
            "question_chinese": "___我想想再告诉你。",
            "question_pinyin": "___ wǒ xiǎng xiǎng zài gào su nǐ.",
            "question_english": "Let me think about it and tell you later."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 让?",
            "correct": "妈妈让我等一下。",
            "options": ["妈妈让我等一下。", "妈妈我让等一下。", "我让妈妈等一下我。", "让妈妈我等一下。"],
            "option_pinyin": ["Māma ràng wǒ děng yí xià.", "Māma wǒ ràng děng yí xià.", "Wǒ ràng māma děng yí xià wǒ.", "Ràng māma wǒ děng yí xià."]
        }
    ],
    "hsk2_l8_g2": [  # 呢 — Questions with ne
        {
            "type": "multiple_choice",
            "question": "What does 呢 do in '我很好，你呢？'",
            "correct": "Asks a follow-up question ('And you?')",
            "options": ["Asks a follow-up question ('And you?')", "Marks a completed action", "Shows surprise", "Indicates uncertainty"],
            "option_pinyin": ["ne=follow-up", "le=completed", "surprise", "uncertainty"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: I'm going to school; and you?",
            "correct": "呢",
            "options": ["呢", "吗", "吧", "了"],
            "option_pinyin": ["ne", "ma", "ba", "le"],
            "question_chinese": "我去学校，你___？",
            "question_pinyin": "Wǒ qù xué xiào, nǐ ___?",
            "question_english": "I'm going to school; and you?"
        },
        {
            "type": "multiple_choice",
            "question": "How do you ask 'What are you doing right now?' using 呢?",
            "correct": "你在做什么呢？",
            "options": ["你在做什么呢？", "你做什么了吗？", "你做什么吧？", "你在做什么吗？"],
            "option_pinyin": ["Nǐ zài zuò shén me ne?", "Nǐ zuò shén me le ma?", "Nǐ zuò shén me ba?", "Nǐ zài zuò shén me ma?"]
        }
    ],
    "hsk2_l8_g3": [  # Verb Reduplication
        {
            "type": "multiple_choice",
            "question": "What does verb reduplication indicate?",
            "correct": "A brief, casual, or softened action",
            "options": ["A brief, casual, or softened action", "A completed action", "A repeated action many times", "A negative action"],
            "option_pinyin": ["brief/softened", "completed", "repeated many times", "negative"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Wait a moment (reduplicated form of 等).",
            "correct": "等等",
            "options": ["等等", "等了", "等着", "等过"],
            "option_pinyin": ["děng děng", "děng le", "děng zhe", "děng guò"],
            "question_chinese": "你___，我去问一下。",
            "question_pinyin": "Nǐ ___, wǒ qù wèn yí xià.",
            "question_english": "Wait a moment; I'll go ask."
        },
        {
            "type": "multiple_choice",
            "question": "Which is correct verb reduplication of 说?",
            "correct": "说说 / 说一说",
            "options": ["说说 / 说一说", "说了说", "说着说", "说过说"],
            "option_pinyin": ["shuō shuō / shuō yi shuō", "shuō le shuō", "shuō zhe shuō", "shuō guò shuō"]
        }
    ],
    # ── Lesson 9: Hobby & Free Time (Exams topic) ────────────────────────────
    "hsk2_l9_g1": [  # 疑问代词任指 — Interrogative Pronouns as Indefinites
        {
            "type": "multiple_choice",
            "question": "What does 什么都 mean in '他什么都不知道'?",
            "correct": "Doesn't know anything (universal negative)",
            "options": ["Doesn't know anything (universal negative)", "What does he know", "He knows something", "He knows everything"],
            "option_pinyin": ["shén me dōu bù=nothing", "what does he know", "knows something", "knows everything"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: She understands everything; very smart.",
            "correct": "什么",
            "options": ["什么", "怎么", "哪里", "为什么"],
            "option_pinyin": ["shén me", "zěn me", "nǎ lǐ", "wèi shén me"],
            "question_chinese": "她___都懂，非常聪明。",
            "question_pinyin": "Tā ___ dōu dǒng, fēi cháng cōng míng.",
            "question_english": "She understands everything; very smart."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence means 'Everyone is going'?",
            "correct": "谁都会去。",
            "options": ["谁都会去。", "谁都不去。", "谁去了？", "谁要去？"],
            "option_pinyin": ["Shéi dōu huì qù.", "Shéi dōu bù qù.", "Shéi qù le?", "Shéi yào qù?"]
        }
    ],
    "hsk2_l9_g2": [  # 连动句 — Serial Verb Sentences
        {
            "type": "multiple_choice",
            "question": "What is a serial verb sentence?",
            "correct": "A sentence with two or more verbs sharing one subject",
            "options": ["A sentence with two or more verbs sharing one subject", "A sentence asking two questions", "A sentence with two subjects", "A sentence using 和 to connect verbs"],
            "option_pinyin": ["serial verbs", "two questions", "two subjects", "using 和"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: I go to school to take the exam. (second verb)",
            "correct": "考试",
            "options": ["考试", "看书", "吃饭", "学习"],
            "option_pinyin": ["kǎo shì", "kàn shū", "chī fàn", "xué xí"],
            "question_chinese": "我去学校___。",
            "question_pinyin": "Wǒ qù xué xiào ___.",
            "question_english": "I go to school to take the exam."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence is a serial verb sentence?",
            "correct": "她去图书馆借书。",
            "options": ["她去图书馆借书。", "她去图书馆，也借书。", "她去了图书馆，又借了书。", "她去了图书馆，借书了。"],
            "option_pinyin": ["Tā qù túshūguǎn jiè shū.", "Tā qù túshūguǎn, yě jiè shū.", "Tā qù le túshūguǎn, yòu jiè le shū.", "Tā qù le túshūguǎn, jiè shū le."]
        }
    ],
    "hsk2_l9_g3": [  # 把字句 — The bǎ Sentence
        {
            "type": "multiple_choice",
            "question": "When is the 把 sentence used?",
            "correct": "When the action has a specific effect on a definite object",
            "options": ["When the action has a specific effect on a definite object", "For any sentence with an object", "For past actions only", "For negative sentences"],
            "option_pinyin": ["bǎ=specific effect", "any object", "past only", "negative only"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: He corrected that wrong question.",
            "correct": "把",
            "options": ["把", "让", "被", "给"],
            "option_pinyin": ["bǎ", "ràng", "bèi", "gěi"],
            "question_chinese": "他___那道错题改对了。",
            "question_pinyin": "Tā ___ nà dào cuò tí gǎi duì le.",
            "question_english": "He corrected that wrong question."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence is a correct 把 sentence?",
            "correct": "她把作业做完了。",
            "options": ["她把作业做完了。", "她做完作业把了。", "把她作业做完了。", "她做把作业完了。"],
            "option_pinyin": ["Tā bǎ zuò yè zuò wán le.", "Tā zuò wán zuò yè bǎ le.", "Bǎ tā zuò yè zuò wán le.", "Tā zuò bǎ zuò yè wán le."]
        }
    ],
    # ── Lesson 10: Family Time ────────────────────────────────────────────────
    "hsk2_l10_g1": [  # 祈使句 — Imperative Sentences
        {
            "type": "multiple_choice",
            "question": "What makes a Chinese imperative sentence polite?",
            "correct": "Adding 请 before the verb",
            "options": ["Adding 请 before the verb", "Adding 了 at the end", "Using the full subject", "Adding 吗 at the end"],
            "option_pinyin": ["qǐng+verb", "verb+le", "full subject", "verb+ma"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Please wait outside the door (polite imperative).",
            "correct": "请",
            "options": ["请", "让", "别", "不"],
            "option_pinyin": ["qǐng", "ràng", "bié", "bù"],
            "question_chinese": "___在门外等一下。",
            "question_pinyin": "___ zài mén wài děng yí xià.",
            "question_english": "Please wait outside the door for a moment."
        },
        {
            "type": "multiple_choice",
            "question": "How do you say 'Don't use the phone' as an imperative?",
            "correct": "别用手机。",
            "options": ["别用手机。", "你不用手机。", "你不要用手机了。", "没有手机用。"],
            "option_pinyin": ["Bié yòng shǒu jī.", "Nǐ bù yòng shǒu jī.", "Nǐ bú yào yòng shǒu jī le.", "Méi yǒu shǒu jī yòng."]
        }
    ],
    "hsk2_l10_g2": [  # 存现句 — Existential Sentences
        {
            "type": "multiple_choice",
            "question": "What is the word order in a Chinese existential sentence?",
            "correct": "Location + 有 + Thing",
            "options": ["Location + 有 + Thing", "Thing + 有 + Location", "Subject + 在 + Location", "有 + Thing + Location"],
            "option_pinyin": ["location+yǒu+thing", "thing+yǒu+location", "subj+zài+location", "yǒu+thing+location"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Inside the room there is a large table. (location word)",
            "correct": "里",
            "options": ["里", "上", "外", "旁边"],
            "option_pinyin": ["lǐ", "shàng", "wài", "páng biān"],
            "question_chinese": "房间___有一张大桌子。",
            "question_pinyin": "Fáng jiān ___ yǒu yì zhāng dà zhuō zi.",
            "question_english": "Inside the room there is a large table."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly describes something existing at a location?",
            "correct": "桌子上有手机。",
            "options": ["桌子上有手机。", "手机有桌子上。", "有手机桌子上。", "在桌子上手机有。"],
            "option_pinyin": ["Zhuō zi shàng yǒu shǒu jī.", "Shǒu jī yǒu zhuō zi shàng.", "Yǒu shǒu jī zhuō zi shàng.", "Zài zhuō zi shàng shǒu jī yǒu."]
        }
    ],
    "hsk2_l10_g3": [  # 在 — The Preposition zài
        {
            "type": "multiple_choice",
            "question": "What does 在 mean as a preposition?",
            "correct": "At / In / On (a location)",
            "options": ["At / In / On (a location)", "From", "To", "Near"],
            "option_pinyin": ["zài=at/in/on", "cóng=from", "dào=to", "near"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: The phone is next to the table.",
            "correct": "在",
            "options": ["在", "是", "有", "放"],
            "option_pinyin": ["zài", "shì", "yǒu", "fàng"],
            "question_chinese": "手机___桌子旁边。",
            "question_pinyin": "Shǒu jī ___ zhuō zi páng biān.",
            "question_english": "The phone is next to the table."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 在 as a preposition?",
            "correct": "他在图书馆看书。",
            "options": ["他在图书馆看书。", "他图书馆在看书。", "他看书在图书馆。", "在他图书馆看书。"],
            "option_pinyin": ["Tā zài túshūguǎn kàn shū.", "Tā túshūguǎn zài kàn shū.", "Tā kàn shū zài túshūguǎn.", "Zài tā túshūguǎn kàn shū."]
        }
    ]
}

GRAMMAR_KEY_MAP = {
    (6, 1): "hsk2_l6_g1",
    (6, 2): "hsk2_l6_g2",
    (6, 3): "hsk2_l6_g3",
    (7, 1): "hsk2_l7_g1",
    (7, 2): "hsk2_l7_g2",
    (7, 3): "hsk2_l7_g3",
    (8, 1): "hsk2_l8_g1",
    (8, 2): "hsk2_l8_g2",
    (8, 3): "hsk2_l8_g3",
    (9, 1): "hsk2_l9_g1",
    (9, 2): "hsk2_l9_g2",
    (9, 3): "hsk2_l9_g3",
    (10, 1): "hsk2_l10_g1",
    (10, 2): "hsk2_l10_g2",
    (10, 3): "hsk2_l10_g3",
}

# ── main ──────────────────────────────────────────────────────────────────────

random.seed(99)

for lesson_num in range(6, 11):
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
