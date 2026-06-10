#!/usr/bin/env python3
"""Generate mini_exercises for HSK2 lessons 11-15.
Pinyin note: option_pinyin is only displayed when options contain Chinese
characters (optionsAreChinese guard in MultipleChoicePanel). English-answer
MCQs carry placeholder pinyin values that are never rendered.
"""
import json, random, os

BASE = os.path.dirname(__file__)

# ── helpers ──────────────────────────────────────────────────────────────────

def shuffle(lst):
    lst = list(lst)
    random.shuffle(lst)
    return lst

def make_options(correct_ch, correct_py, wrong_pairs, target_len=4):
    """Build Chinese-option MCQ lists with correct answer shuffled in."""
    pool_ch = [w[0] for w in wrong_pairs]
    pool_py = [w[1] for w in wrong_pairs]
    chosen_ch = pool_ch[:target_len - 1]
    chosen_py = pool_py[:target_len - 1]
    combined = list(zip([correct_ch] + chosen_ch, [correct_py] + chosen_py))
    random.shuffle(combined)
    return [c[0] for c in combined], [c[1] for c in combined]

def make_eng_options(correct_eng, wrong_engs):
    """Build English-option MCQ list."""
    opts = [correct_eng] + wrong_engs[:3]
    random.shuffle(opts)
    return opts

# ── vocab mini_exercises generator ───────────────────────────────────────────

def gen_vocab_mini(word, all_vocab):
    """3 mini_exercises per non-phrase vocab word."""
    ch  = word['chinese']
    py  = word['pinyin']
    eng = word['english']
    ex_ch  = word.get('example', f'我{ch}。')
    ex_eng = word.get('translation', '')

    others = [v for v in all_vocab
              if v['chinese'] != ch and v.get('part_of_speech') != 'phrase']
    random.shuffle(others)
    distractors = others[:6]

    wrong_engs   = [d['english'] for d in distractors[:3]]
    wrong_ch_py  = [(d['chinese'], d['pinyin']) for d in distractors[3:6]]
    if not wrong_ch_py:
        wrong_ch_py = [(d['chinese'], d['pinyin']) for d in distractors[:3]]

    fallback = [('什么', 'shén me'), ('很好', 'hěn hǎo'),
                ('朋友', 'péng yǒu'), ('学习', 'xué xí')]
    while len(wrong_ch_py) < 3:
        wrong_ch_py.append(fallback[len(wrong_ch_py) % len(fallback)])
    while len(wrong_engs) < 3:
        wrong_engs.append('—')

    # Ex 1 — "What does X mean?" → English options (pinyin NOT shown)
    eng_opts = make_eng_options(eng, wrong_engs)
    py_map   = {d['english']: d['pinyin'] for d in distractors[:3]}
    py_map[eng] = py
    ex1 = {
        "type": "multiple_choice",
        "question": f"What does {ch} mean?",
        "correct": eng,
        "options": eng_opts,
        "option_pinyin": [py_map.get(o, py) for o in eng_opts]
    }

    # Ex 2 — fill_blank → Chinese options (pinyin IS shown)
    blank_ch = ex_ch.replace(ch, '___', 1) if ch in ex_ch else '___...'
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

    # Ex 3 — "Which word means Y?" → Chinese options (pinyin IS shown)
    opts3, pys3 = make_options(ch, py, wrong_ch_py[:3])
    ex3 = {
        "type": "multiple_choice",
        "question": f"Which word means '{eng}'?",
        "correct": ch,
        "options": opts3,
        "option_pinyin": pys3
    }

    return [ex1, ex2, ex3]


# ── handcrafted grammar mini_exercises ───────────────────────────────────────
# Pinyin rule applied:
#   - English-option MCQs: option_pinyin holds descriptive labels (never shown)
#   - Chinese-option MCQs / fill_blank: option_pinyin holds correct toned pinyin

GRAMMAR_MINI = {

    # ── Lesson 11: Leisure Time 1 ─────────────────────────────────────────────
    "hsk2_l11_g1": [  # 比字句(2) — Comparative sentences
        {
            "type": "multiple_choice",
            "question": "What is the structure of a 比 comparison sentence?",
            "correct": "A + 比 + B + Adjective (+ degree/amount)",
            "options": [
                "A + 比 + B + Adjective (+ degree/amount)",
                "A + 是 + B + Adjective",
                "A + 有 + B + Adjective",
                "A + 比 + Adjective + B"
            ],
            "option_pinyin": ["A+bǐ+B+adj", "A+shì+B+adj", "A+yǒu+B+adj", "A+bǐ+adj+B"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: He is three years older than you.",
            "correct": "比",
            "options": ["比", "有", "是", "从"],
            "option_pinyin": ["bǐ", "yǒu", "shì", "cóng"],
            "question_chinese": "他___你大三岁。",
            "question_pinyin": "Tā ___ nǐ dà sān suì.",
            "question_english": "He is three years older than you."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 比?",
            "correct": "她比我高一点儿。",
            "options": [
                "她比我高一点儿。",
                "她有我高一点儿。",
                "她是我高一点儿。",
                "她比高我一点儿。"
            ],
            "option_pinyin": [
                "Tā bǐ wǒ gāo yì diǎnr.",
                "Tā yǒu wǒ gāo yì diǎnr.",
                "Tā shì wǒ gāo yì diǎnr.",
                "Tā bǐ gāo wǒ yì diǎnr."
            ]
        }
    ],
    "hsk2_l11_g2": [  # 时量补语 — Time-Measure Complement
        {
            "type": "multiple_choice",
            "question": "What does the time-measure complement express?",
            "correct": "The duration of an action",
            "options": [
                "The duration of an action",
                "The frequency of an action",
                "The result of an action",
                "The starting time of an action"
            ],
            "option_pinyin": ["duration", "frequency", "result", "start time"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: I waited for two hours.",
            "correct": "两个",
            "options": ["两个", "两次", "两遍", "很多"],
            "option_pinyin": ["liǎng gè", "liǎng cì", "liǎng biàn", "hěn duō"],
            "question_chinese": "我等了___小时。",
            "question_pinyin": "Wǒ děng le ___ xiǎo shí.",
            "question_english": "I waited for two hours."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses the time-measure complement?",
            "correct": "他学了三个小时的汉语。",
            "options": [
                "他学了三个小时的汉语。",
                "他学汉语三个小时了。",
                "他汉语学三个小时。",
                "他学三次汉语了。"
            ],
            "option_pinyin": [
                "Tā xué le sān gè xiǎo shí de Hàn yǔ.",
                "Tā xué Hàn yǔ sān gè xiǎo shí le.",
                "Tā Hàn yǔ xué sān gè xiǎo shí.",
                "Tā xué sān cì Hàn yǔ le."
            ]
        }
    ],
    "hsk2_l11_g3": [  # 动量补语 — Action-Measure Complement
        {
            "type": "multiple_choice",
            "question": "What does the action-measure complement express?",
            "correct": "How many times an action occurred",
            "options": [
                "How many times an action occurred",
                "The duration of an action",
                "The result of an action",
                "The order of actions"
            ],
            "option_pinyin": ["how many times", "duration", "result", "order"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: I have been to Beijing twice.",
            "correct": "次",
            "options": ["次", "遍", "个", "天"],
            "option_pinyin": ["cì", "biàn", "gè", "tiān"],
            "question_chinese": "我去过北京两___。",
            "question_pinyin": "Wǒ qù guò Běijīng liǎng ___.",
            "question_english": "I have been to Beijing twice."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly expresses 'He went three times'?",
            "correct": "他去了三次。",
            "options": [
                "他去了三次。",
                "他去三次了。",
                "他三次去了。",
                "他去了三个。"
            ],
            "option_pinyin": [
                "Tā qù le sān cì.",
                "Tā qù sān cì le.",
                "Tā sān cì qù le.",
                "Tā qù le sān gè."
            ]
        }
    ],

    # ── Lesson 12: Weather & Social 2 ────────────────────────────────────────
    "hsk2_l12_g1": [  # 程度补语 — Degree Complement V+得+complement
        {
            "type": "multiple_choice",
            "question": "What does the degree complement (V+得+adj) describe?",
            "correct": "The degree or manner of an action",
            "options": [
                "The degree or manner of an action",
                "The time when an action happened",
                "The frequency of an action",
                "The reason for an action"
            ],
            "option_pinyin": ["degree/manner", "time", "frequency", "reason"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: He runs extremely fast. (degree complement marker)",
            "correct": "得",
            "options": ["得", "了", "着", "过"],
            "option_pinyin": ["de", "le", "zhe", "guò"],
            "question_chinese": "他跑___非常快。",
            "question_pinyin": "Tā pǎo ___ fēi cháng kuài.",
            "question_english": "He runs extremely fast."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses V+得+complement?",
            "correct": "她说得很慢。",
            "options": [
                "她说得很慢。",
                "她说很慢得。",
                "她得说很慢。",
                "她说慢得很。"
            ],
            "option_pinyin": [
                "Tā shuō de hěn màn.",
                "Tā shuō hěn màn de.",
                "Tā de shuō hěn màn.",
                "Tā shuō màn de hěn."
            ]
        }
    ],
    "hsk2_l12_g2": [  # 太...了 — Too / Excessively
        {
            "type": "multiple_choice",
            "question": "What does 太...了 express?",
            "correct": "Something is excessive (too much)",
            "options": [
                "Something is excessive (too much)",
                "Something is very good",
                "A change of state",
                "A completed action"
            ],
            "option_pinyin": ["tài...le=excessive", "very good", "change of state", "completed"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Today is too hot!",
            "correct": "太",
            "options": ["太", "非常", "很", "最"],
            "option_pinyin": ["tài", "fēi cháng", "hěn", "zuì"],
            "question_chinese": "今天___热了！",
            "question_pinyin": "Jīn tiān ___ rè le!",
            "question_english": "Today is too hot!"
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 太...了?",
            "correct": "他跑得太快了！",
            "options": [
                "他跑得太快了！",
                "他跑得非常快！",
                "他跑太快得了！",
                "他太跑得快了！"
            ],
            "option_pinyin": [
                "Tā pǎo de tài kuài le!",
                "Tā pǎo de fēi cháng kuài!",
                "Tā pǎo tài kuài de le!",
                "Tā tài pǎo de kuài le!"
            ]
        }
    ],
    "hsk2_l12_g3": [  # 了 indicating change of state
        {
            "type": "multiple_choice",
            "question": "In '天气冷了', what does the final 了 indicate?",
            "correct": "The weather has become cold (change of state)",
            "options": [
                "The weather has become cold (change of state)",
                "The weather was cold in the past",
                "The weather will become cold",
                "The weather is currently cold"
            ],
            "option_pinyin": ["change: became cold", "past", "future", "currently"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: She has gotten sick (change of state).",
            "correct": "了",
            "options": ["了", "过", "着", "呢"],
            "option_pinyin": ["le", "guò", "zhe", "ne"],
            "question_chinese": "她生病___。",
            "question_pinyin": "Tā shēng bìng ___.",
            "question_english": "She has gotten sick."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence uses 了 to mark a change of state?",
            "correct": "我累了。",
            "options": [
                "我累了。",
                "我吃了饭。",
                "我去了一次。",
                "我看了书。"
            ],
            "option_pinyin": [
                "Wǒ lèi le.",
                "Wǒ chī le fàn.",
                "Wǒ qù le yí cì.",
                "Wǒ kàn le shū."
            ]
        }
    ],

    # ── Lesson 13: Appearances & Emotions ────────────────────────────────────
    "hsk2_l13_g1": [  # 动态助词「着」— Aspect Particle zhe
        {
            "type": "multiple_choice",
            "question": "What does 着 indicate after a verb?",
            "correct": "An ongoing state or condition",
            "options": [
                "An ongoing state or condition",
                "A completed action",
                "A future action",
                "A past experience"
            ],
            "option_pinyin": ["zhe=ongoing state", "completed", "future", "past experience"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: The light is on. (ongoing state)",
            "correct": "着",
            "options": ["着", "了", "过", "在"],
            "option_pinyin": ["zhe", "le", "guò", "zài"],
            "question_chinese": "灯开___。",
            "question_pinyin": "Dēng kāi ___.",
            "question_english": "The light is on."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence shows an ongoing state with 着?",
            "correct": "她站着等。",
            "options": [
                "她站着等。",
                "她站了等。",
                "她站过等。",
                "她等着站。"
            ],
            "option_pinyin": [
                "Tā zhàn zhe děng.",
                "Tā zhàn le děng.",
                "Tā zhàn guò děng.",
                "Tā děng zhe zhàn."
            ]
        }
    ],
    "hsk2_l13_g2": [  # 反问句 — Rhetorical Questions
        {
            "type": "multiple_choice",
            "question": "What is the purpose of a rhetorical question (反问句) in Chinese?",
            "correct": "To make a strong statement through a question form",
            "options": [
                "To make a strong statement through a question form",
                "To ask for new information",
                "To show politeness",
                "To express uncertainty"
            ],
            "option_pinyin": ["strong statement", "ask info", "polite", "uncertain"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Isn't the door open? (rhetorical — 不...吗?)",
            "correct": "不",
            "options": ["不", "没", "很", "太"],
            "option_pinyin": ["bù", "méi", "hěn", "tài"],
            "question_chinese": "门___是开着的吗？",
            "question_pinyin": "Mén ___ shì kāi zhe de ma?",
            "question_english": "Isn't the door open?"
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence is a rhetorical question meaning 'Everyone knows this, right?'",
            "correct": "这个大家都知道，不是吗？",
            "options": [
                "这个大家都知道，不是吗？",
                "这个大家都知道吗？",
                "这个大家都不知道。",
                "这个大家知道了。"
            ],
            "option_pinyin": [
                "Zhè ge dà jiā dōu zhī dào, bú shì ma?",
                "Zhè ge dà jiā dōu zhī dào ma?",
                "Zhè ge dà jiā dōu bù zhī dào.",
                "Zhè ge dà jiā zhī dào le."
            ]
        }
    ],
    "hsk2_l13_g3": [  # 连词「还是」— Conjunction haishi (or)
        {
            "type": "multiple_choice",
            "question": "When is 还是 used in a question?",
            "correct": "To ask a choice between two alternatives (A or B?)",
            "options": [
                "To ask a choice between two alternatives (A or B?)",
                "To express concession",
                "To express cause and effect",
                "To add more information"
            ],
            "option_pinyin": ["hái shì=A or B?", "concession", "cause-effect", "addition"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Is the door open or closed?",
            "correct": "还是",
            "options": ["还是", "或者", "也", "但是"],
            "option_pinyin": ["hái shì", "huò zhě", "yě", "dàn shì"],
            "question_chinese": "门是开着___关着？",
            "question_pinyin": "Mén shì kāi zhe ___ guān zhe?",
            "question_english": "Is the door open or closed?"
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence uses 还是 correctly as a question?",
            "correct": "你喝茶还是咖啡？",
            "options": [
                "你喝茶还是咖啡？",
                "你喝茶或者咖啡。",
                "你喝茶也咖啡？",
                "你还是喝茶不咖啡？"
            ],
            "option_pinyin": [
                "Nǐ hē chá hái shì kā fēi?",
                "Nǐ hē chá huò zhě kā fēi.",
                "Nǐ hē chá yě kā fēi?",
                "Nǐ hái shì hē chá bù kā fēi?"
            ]
        }
    ],

    # ── Lesson 14: Movie & Leisure 2 ─────────────────────────────────────────
    "hsk2_l14_g1": [  # 动态助词「过」— Aspect Particle guò (past experience)
        {
            "type": "multiple_choice",
            "question": "What does 过 indicate after a verb?",
            "correct": "A past experience (done at least once before)",
            "options": [
                "A past experience (done at least once before)",
                "A completed action just now",
                "An ongoing state",
                "A future plan"
            ],
            "option_pinyin": ["guò=past experience", "just completed", "ongoing", "future"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: I have seen that movie before.",
            "correct": "过",
            "options": ["过", "了", "着", "在"],
            "option_pinyin": ["guò", "le", "zhe", "zài"],
            "question_chinese": "我看___那部电影。",
            "question_pinyin": "Wǒ kàn ___ nà bù diàn yǐng.",
            "question_english": "I have seen that movie before."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence uses 过 correctly for past experience?",
            "correct": "我以前看过这部电影。",
            "options": [
                "我以前看过这部电影。",
                "我以前看了这部电影。",
                "我以前看着这部电影。",
                "我看过这部电影吗？"
            ],
            "option_pinyin": [
                "Wǒ yǐ qián kàn guò zhè bù diàn yǐng.",
                "Wǒ yǐ qián kàn le zhè bù diàn yǐng.",
                "Wǒ yǐ qián kàn zhe zhè bù diàn yǐng.",
                "Wǒ kàn guò zhè bù diàn yǐng ma?"
            ]
        }
    ],
    "hsk2_l14_g2": [  # 不管...都/也... — No matter...
        {
            "type": "multiple_choice",
            "question": "What does 不管...都... express?",
            "correct": "No matter the condition, the result is always the same",
            "options": [
                "No matter the condition, the result is always the same",
                "Either...or... (choice)",
                "Although...but... (concession)",
                "If...then... (condition)"
            ],
            "option_pinyin": ["bù guǎn...dōu...", "either-or", "although-but", "if-then"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: No matter how hard it is, I'll still do it.",
            "correct": "不管",
            "options": ["不管", "虽然", "因为", "如果"],
            "option_pinyin": ["bù guǎn", "suī rán", "yīn wèi", "rú guǒ"],
            "question_chinese": "___多难，我都要做。",
            "question_pinyin": "___ duō nán, wǒ dōu yào zuò.",
            "question_english": "No matter how hard it is, I'll still do it."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 不管...都...?",
            "correct": "不管天气怎么样，他都去跑步。",
            "options": [
                "不管天气怎么样，他都去跑步。",
                "虽然天气怎么样，他都去跑步。",
                "因为天气怎么样，他都去跑步。",
                "不管天气怎么样，他去跑步了。"
            ],
            "option_pinyin": [
                "Bù guǎn tiān qì zěn me yàng, tā dōu qù pǎo bù.",
                "Suī rán tiān qì zěn me yàng, tā dōu qù pǎo bù.",
                "Yīn wèi tiān qì zěn me yàng, tā dōu qù pǎo bù.",
                "Bù guǎn tiān qì zěn me yàng, tā qù pǎo bù le."
            ]
        }
    ],
    "hsk2_l14_g3": [  # 动量补语「次」— Frequency Complement ci
        {
            "type": "multiple_choice",
            "question": "What does 次 measure after a verb?",
            "correct": "The number of times an action occurred",
            "options": [
                "The number of times an action occurred",
                "The duration of an action",
                "The result of an action",
                "The order of actions"
            ],
            "option_pinyin": ["cì=times/occurrences", "duration", "result", "order"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: I watched it twice.",
            "correct": "次",
            "options": ["次", "遍", "个", "天"],
            "option_pinyin": ["cì", "biàn", "gè", "tiān"],
            "question_chinese": "我看了两___。",
            "question_pinyin": "Wǒ kàn le liǎng ___.",
            "question_english": "I watched it twice."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 次 as a frequency complement?",
            "correct": "他来过两次。",
            "options": [
                "他来过两次。",
                "他两次来过。",
                "他来两次了。",
                "他次来两了。"
            ],
            "option_pinyin": [
                "Tā lái guò liǎng cì.",
                "Tā liǎng cì lái guò.",
                "Tā lái liǎng cì le.",
                "Tā cì lái liǎng le."
            ]
        }
    ],

    # ── Lesson 15: New Year! ──────────────────────────────────────────────────
    "hsk2_l15_g1": [  # 副词「还」(2) — still / also / in addition
        {
            "type": "multiple_choice",
            "question": "What does 还 mean in '她还在等'?",
            "correct": "Still (an action continues)",
            "options": [
                "Still (an action continues)",
                "Again (repeated action)",
                "Already",
                "Together"
            ],
            "option_pinyin": ["hái=still", "again", "already", "together"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: He still hasn't come.",
            "correct": "还",
            "options": ["还", "已经", "再", "也"],
            "option_pinyin": ["hái", "yǐ jīng", "zài", "yě"],
            "question_chinese": "他___没来。",
            "question_pinyin": "Tā ___ méi lái.",
            "question_english": "He still hasn't come."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence uses 还 to mean 'in addition / also'?",
            "correct": "他还送了一份礼物。",
            "options": [
                "他还送了一份礼物。",
                "他已经送了一份礼物。",
                "他再送了一份礼物。",
                "他又送了一份礼物。"
            ],
            "option_pinyin": [
                "Tā hái sòng le yī fèn lǐ wù.",
                "Tā yǐ jīng sòng le yī fèn lǐ wù.",
                "Tā zài sòng le yī fèn lǐ wù.",
                "Tā yòu sòng le yī fèn lǐ wù."
            ]
        }
    ],
    "hsk2_l15_g2": [  # 了的用法小结(2) — Summary of le Part 2
        {
            "type": "multiple_choice",
            "question": "When does 了 appear after a verb?",
            "correct": "To mark a completed action",
            "options": [
                "To mark a completed action",
                "To mark an ongoing state",
                "To mark a past experience",
                "To mark future intention"
            ],
            "option_pinyin": ["verb+le=completed", "ongoing", "past experience", "future"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: I've already bought the ticket. (completed action)",
            "correct": "了",
            "options": ["了", "过", "着", "呢"],
            "option_pinyin": ["le", "guò", "zhe", "ne"],
            "question_chinese": "我已经买票___。",
            "question_pinyin": "Wǒ yǐ jīng mǎi piào ___.",
            "question_english": "I've already bought the ticket."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence uses 了 correctly for a completed action?",
            "correct": "我买票了。",
            "options": [
                "我买票了。",
                "我买票着。",
                "我买票过。",
                "我买票呢。"
            ],
            "option_pinyin": [
                "Wǒ mǎi piào le.",
                "Wǒ mǎi piào zhe.",
                "Wǒ mǎi piào guò.",
                "Wǒ mǎi piào ne."
            ]
        }
    ],
    "hsk2_l15_g3": [  # 能愿动词「得」— Modal Verb děi (must / have to)
        {
            "type": "multiple_choice",
            "question": "What does 得 (děi) express?",
            "correct": "Obligation — must / have to",
            "options": [
                "Obligation — must / have to",
                "Ability — can / be able to",
                "Permission — may / allowed to",
                "Willingness — want to"
            ],
            "option_pinyin": ["děi=must/have to", "néng=can", "kě yǐ=may", "xiǎng=want"]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: I have to go to school tomorrow.",
            "correct": "得",
            "options": ["得", "要", "能", "可以"],
            "option_pinyin": ["děi", "yào", "néng", "kě yǐ"],
            "question_chinese": "我明天___去学校。",
            "question_pinyin": "Wǒ míng tiān ___ qù xué xiào.",
            "question_english": "I have to go to school tomorrow."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 得 (děi) for obligation?",
            "correct": "你得好好休息。",
            "options": [
                "你得好好休息。",
                "你能好好休息。",
                "你可以好好休息。",
                "你想好好休息。"
            ],
            "option_pinyin": [
                "Nǐ děi hǎo hao xiū xi.",
                "Nǐ néng hǎo hao xiū xi.",
                "Nǐ kě yǐ hǎo hao xiū xi.",
                "Nǐ xiǎng hǎo hao xiū xi."
            ]
        }
    ]
}

GRAMMAR_KEY_MAP = {
    (11, 1): "hsk2_l11_g1",
    (11, 2): "hsk2_l11_g2",
    (11, 3): "hsk2_l11_g3",
    (12, 1): "hsk2_l12_g1",
    (12, 2): "hsk2_l12_g2",
    (12, 3): "hsk2_l12_g3",
    (13, 1): "hsk2_l13_g1",
    (13, 2): "hsk2_l13_g2",
    (13, 3): "hsk2_l13_g3",
    (14, 1): "hsk2_l14_g1",
    (14, 2): "hsk2_l14_g2",
    (14, 3): "hsk2_l14_g3",
    (15, 1): "hsk2_l15_g1",
    (15, 2): "hsk2_l15_g2",
    (15, 3): "hsk2_l15_g3",
}

# ── main ──────────────────────────────────────────────────────────────────────

random.seed(77)

for lesson_num in range(11, 16):
    path = os.path.join(BASE, f"hsk2_lesson_{lesson_num}.json")
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    all_vocab = data['vocabulary']

    for word in data['vocabulary']:
        if word.get('part_of_speech') == 'phrase':
            continue
        if 'mini_exercises' in word:
            continue
        word['mini_exercises'] = gen_vocab_mini(word, all_vocab)

    for gp in data.get('grammar_points', []):
        gnum = gp['number']
        key  = GRAMMAR_KEY_MAP.get((lesson_num, gnum))
        if key and key in GRAMMAR_MINI:
            if 'mini_exercises' not in gp:
                gp['mini_exercises'] = GRAMMAR_MINI[key]

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    vocab_count = sum(1 for v in data['vocabulary']
                      if v.get('part_of_speech') != 'phrase' and 'mini_exercises' in v)
    gp_count    = sum(1 for g in data.get('grammar_points', []) if 'mini_exercises' in g)
    print(f"Lesson {lesson_num}: {vocab_count} vocab words + {gp_count} grammar points updated")

print("Done.")
