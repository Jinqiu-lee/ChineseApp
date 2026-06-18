"""
Update HSK6 Lesson 12 (Nutrition & Food):
- Replace 预防 → 荤
- Replace 依赖 → 素
- Add new words: 非, 即, 个别
- Remove ALL existing grammar points
- Add three new grammar points: 即, 个别, 非
All sentences use existing lesson vocabulary where possible.
"""
import json, random, re
from pypinyin import lazy_pinyin, Style

PATH = '/Users/irisvitalee/ChineseApp/data/hsk6/hsk6_lesson_12.json'
CJK_RE = re.compile(r'[一-鿿]')
random.seed(42)

def py(text):
    syls = lazy_pinyin(text, style=Style.TONE)
    return ' '.join(syls[i] for i, ch in enumerate(text)
                    if CJK_RE.match(ch) and i < len(syls))

def shuffled4(correct, distractors):
    pool = distractors[:3]
    pos = random.randint(0, 3)
    return pool[:pos] + [correct] + pool[pos:]

def make_mini(word, pool):
    others = [w for w in pool if w['chinese'] != word['chinese']]
    random.shuffle(others); d1 = others[:3]
    eng_opts = shuffled4(word['english'], [d['english'] for d in d1])
    ep = {word['english']: word['pinyin'], **{d['english']: d['pinyin'] for d in d1}}
    mcq_eng = {
        "type": "multiple_choice",
        "question": f"What does {word['chinese']} mean?",
        "correct": word['english'],
        "options": eng_opts,
        "option_pinyin": [ep.get(o, '') for o in eng_opts]
    }
    random.shuffle(others); d2 = others[:3]
    sz = word.get('_sent_zh', '___。')
    se = word.get('_sent_en', word['english'])
    zh_opts = shuffled4(word['chinese'], [d['chinese'] for d in d2])
    zp = {word['chinese']: word['pinyin'], **{d['chinese']: d['pinyin'] for d in d2}}
    fb = {
        "type": "fill_blank",
        "question": f"Fill in: {word['english']}",
        "correct": word['chinese'],
        "options": zh_opts,
        "option_pinyin": [zp.get(o, '') for o in zh_opts],
        "question_chinese": sz, "question_pinyin": sz, "question_english": se
    }
    random.shuffle(others); d3 = others[:3]
    ch_opts = shuffled4(word['chinese'], [d['chinese'] for d in d3])
    cp = {word['chinese']: word['pinyin'], **{d['chinese']: d['pinyin'] for d in d3}}
    mcq_zh = {
        "type": "multiple_choice",
        "question": f"Which word means '{word['english']}'?",
        "correct": word['chinese'],
        "options": ch_opts,
        "option_pinyin": [cp.get(o, '') for o in ch_opts]
    }
    return [mcq_eng, fb, mcq_zh]

REPLACEMENTS = {
    '预防': dict(
        chinese='荤', pinyin='hūn',
        english='Meat / Non-vegetarian food / Meat-based',
        part_of_speech='noun/adjective',
        example='荤素搭配是保持均衡饮食的基本原则之一。',
        translation='Combining meat and vegetarian foods is one of the basic principles of maintaining a balanced diet.',
        _sent_zh='___素搭配是保持均衡饮食的基本原则之一。',
        _sent_en='Combining meat and vegetarian foods is one of the basic principles of maintaining a balanced diet.',
    ),
    '依赖': dict(
        chinese='素', pinyin='sù',
        english='Vegetarian / Plant-based / Meat-free',
        part_of_speech='noun/adjective',
        example='他不吃荤，只吃素，认为这样对身体更健康。',
        translation='He does not eat meat — only vegetarian food — believing it to be healthier for the body.',
        _sent_zh='他不吃荤，只吃___，认为这样对身体更健康。',
        _sent_en='He does not eat meat — only vegetarian food — believing it to be healthier for the body.',
    ),
}

EXTRA = [
    dict(id='hsk6_l12_20', chinese='非', pinyin='fēi',
         english='Not / Non- / Must (formal/literary)',
         part_of_speech='adverb/prefix',
         example='均衡饮食并非难事，只需注意荤素搭配和热量的合理摄入。',
         translation='Maintaining a balanced diet is by no means difficult — it simply requires balancing meat and vegetables and managing calorie intake.',
         _sent_zh='均衡饮食并___难事，只需注意荤素搭配和热量的合理摄入。',
         _sent_en='Maintaining a balanced diet is by no means difficult — it simply requires balancing meat and vegetables and managing calorie intake.'),
    dict(id='hsk6_l12_21', chinese='即', pinyin='jí',
         english='That is / Namely / Which is (formal)',
         part_of_speech='conjunction/adverb',
         example='良好的饮食习惯，即荤素搭配、控制糖分，是预防慢性病的基础。',
         translation='Good dietary habits — namely, balancing meat and vegetables and controlling sugar — form the basis for preventing chronic diseases.',
         _sent_zh='良好的饮食习惯，___荤素搭配、控制糖分，是预防慢性病的基础。',
         _sent_en='Good dietary habits — namely, balancing meat and vegetables and controlling sugar — form the basis for preventing chronic diseases.'),
    dict(id='hsk6_l12_22', chinese='个别', pinyin='gè bié',
         english='Individual / Particular / Isolated (case)',
         part_of_speech='adjective',
         example='个别人群对某些食物过敏，需要特别注意饮食搭配。',
         translation='Certain individuals are allergic to some foods and need to pay special attention to dietary combinations.',
         _sent_zh='___人群对某些食物过敏，需要特别注意饮食搭配。',
         _sent_en='Certain individuals are allergic to some foods and need to pay special attention to dietary combinations.'),
]

GP1 = {
    "number": 1,
    "title": "即 — That is / Namely / Which is (formal)",
    "explanation": "即 is a formal/literary conjunction meaning 'that is,' 'namely,' or 'which is.' It introduces a definition or clarification of what was just mentioned. Structure: [term] + 即 + [explanation or equivalent]. 即 is more literary than 就是 and appears mainly in written Chinese, academic texts, and formal speech. It can also mean 'immediately' in other contexts (即刻 = right away, 即将 = about to).",
    "examples": [
        {
            "chinese": "良好的饮食习惯，即荤素搭配、控制糖分，是预防慢性病的基础。",
            "pinyin": "Liáng hǎo de yǐn shí xí guàn, jí hūn sù dā pèi、kòng zhì táng fēn, shì yù fáng màn xìng bìng de jī chǔ.",
            "english": "Good dietary habits — namely, balancing meat and vegetables and controlling sugar — form the basis for preventing chronic diseases."
        },
        {
            "chinese": "体内多余的热量，即未被消耗的能量，最终会转化为脂肪储存。",
            "pinyin": "Tǐ nèi duō yú de rè liàng, jí wèi bèi xiāo hào de néng liàng, zuì zhōng huì zhuǎn huà wéi zhī fáng chǔ cún.",
            "english": "Excess calories in the body — that is, energy that has not been consumed — are ultimately converted and stored as fat."
        }
    ],
    "exercises": [
        {
            "question": "合理的饮食，___荤素搭配、控制热量，是维持健康的基本原则。",
            "type": "multiple_choice",
            "correct": "即",
            "options": ["即", "因", "故", "则"],
            "option_pinyin": ["jí", "yīn", "gù", "zé"],
            "word_hints": {"维持": "to maintain"}
        },
        {
            "question": "脂肪，___人体储存能量的方式之一，在均衡饮食中也占有一定比例。",
            "type": "multiple_choice",
            "correct": "即",
            "options": ["即", "或", "但", "而"],
            "option_pinyin": ["jí", "huò", "dàn", "ér"],
            "word_hints": {}
        },
        {
            "question": "个别人群的特殊需求，___对某些营养素有较高的摄入需求，应当得到关注。",
            "type": "multiple_choice",
            "correct": "即",
            "options": ["即", "虽", "尽", "但"],
            "option_pinyin": ["jí", "suī", "jǐn", "dàn"],
            "word_hints": {"营养素": "nutrient"}
        },
        {
            "question": "Which sentence uses 即 correctly to mean 'that is / namely'?",
            "type": "multiple_choice",
            "correct": "非荤食品，即不含动物成分的食品，在素食者中非常受欢迎。",
            "options": [
                "非荤食品，即不含动物成分的食品，在素食者中非常受欢迎。",
                "他即吃荤，也吃素，饮食很均衡。",
                "即糖分过多会导致慢性病，要注意控制。",
                "这种食品即是健康的，就是不好吃。"
            ],
            "option_pinyin": ["", "", "", ""],
            "word_hints": {"动物成分": "animal ingredients", "素食者": "vegetarian"}
        },
        {
            "question": "消化系统，___负责分解食物和吸收营养的器官系统，是维持生命的关键。",
            "type": "multiple_choice",
            "correct": "即",
            "options": ["即", "却", "而", "便"],
            "option_pinyin": ["jí", "què", "ér", "biàn"],
            "word_hints": {"器官": "organ; organ system"}
        }
    ],
    "mini_exercises": [
        {
            "type": "multiple_choice",
            "question": "即 (in the sense of 'that is / namely') is best described as...",
            "correct": "A formal connector that introduces a definition or clarification of something just mentioned",
            "options": [
                "A formal connector that introduces a definition or clarification of something just mentioned",
                "A conjunction that introduces a contrast or unexpected result",
                "An adverb expressing immediacy or urgency",
                "A particle that indicates a condition being met"
            ],
            "option_pinyin": ["jí", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Good dietary habits — namely, balancing meat and vegetables — are the basis of health.",
            "correct": "即",
            "options": ["即", "既", "就", "则"],
            "option_pinyin": ["jí", "jì", "jiù", "zé"],
            "question_chinese": "良好的饮食习惯，___荤素搭配、控制热量，是健康的基础。",
            "question_pinyin": "良好的饮食习惯，___荤素搭配、控制热量，是健康的基础。",
            "question_english": "Good dietary habits — namely, balancing meat and vegetables and controlling calories — are the foundation of health."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 即 to mean 'that is / namely'?",
            "correct": "纤维，即膳食中难以消化的成分，有助于促进消化。",
            "options": [
                "纤维，即膳食中难以消化的成分，有助于促进消化。",
                "即纤维很多，所以健康。",
                "他即吃素，也喜欢吃荤。",
                "纤维即是一种维生素，非常重要。"
            ],
            "option_pinyin": [
                "xiān wéi jí shàn shí zhōng nán yǐ xiāo huà de chéng fèn yǒu zhù yú cù jìn xiāo huà",
                "jí xiān wéi hěn duō suǒ yǐ jiàn kāng",
                "tā jí chī sù yě xǐ huān chī hūn",
                "xiān wéi jí shì yī zhǒng wéi shēng sù fēi cháng zhòng yào"
            ]
        }
    ]
}

GP2 = {
    "number": 2,
    "title": "个别 — Individual / Particular / Isolated (case)",
    "explanation": "个别 is an adjective meaning 'individual,' 'particular,' or 'isolated.' It describes a single case or a small minority that differs from the general pattern. Structure: 个别 + Noun (+ predicate). 个别 highlights exceptional or isolated cases rather than the norm. It is often used in contrast with 一般 (generally) or 普遍 (universally). Unlike 各自 (each person separately), 个别 means 'only a few exceptional cases.'",
    "examples": [
        {
            "chinese": "个别人群对某些食物过敏，需要特别注意饮食搭配。",
            "pinyin": "Gè bié rén qún duì mǒu xiē shí wù guò mǐn, xū yào tè bié zhù yì yǐn shí dā pèi.",
            "english": "Certain individuals are allergic to some foods and need to pay special attention to dietary combinations."
        },
        {
            "chinese": "个别食品中含有过量的糖分，消费者购买时应仔细查看成分表。",
            "pinyin": "Gè bié shí pǐn zhōng hán yǒu guò liàng de táng fēn, xiāo fèi zhě gòu mǎi shí yīng zǐ xì chá kàn chéng fèn biǎo.",
            "english": "Some individual food products contain excessive amounts of sugar; consumers should carefully check the ingredient list when purchasing."
        }
    ],
    "exercises": [
        {
            "question": "_____人对荤食完全不耐受，必须坚持纯素饮食，这种情况比较少见。",
            "type": "multiple_choice",
            "correct": "个别",
            "options": ["个别", "各自", "全部", "普遍"],
            "option_pinyin": ["gè bié", "gè zì", "quán bù", "pǔ biàn"],
            "word_hints": {"不耐受": "intolerant; unable to tolerate", "纯素": "purely vegetarian; vegan"}
        },
        {
            "question": "_____食品的热量极高，消费者应非常谨慎，不宜长期大量食用。",
            "type": "multiple_choice",
            "correct": "个别",
            "options": ["个别", "一般", "整体", "统一"],
            "option_pinyin": ["gè bié", "yī bān", "zhěng tǐ", "tǒng yī"],
            "word_hints": {"谨慎": "cautious; careful"}
        },
        {
            "question": "虽然_____情况需要特殊饮食，但大多数人只需均衡摄入荤素即可。",
            "type": "multiple_choice",
            "correct": "个别",
            "options": ["个别", "全体", "共同", "随机"],
            "option_pinyin": ["gè bié", "quán tǐ", "gòng tóng", "suí jī"],
            "word_hints": {}
        },
        {
            "question": "Which sentence uses 个别 correctly?",
            "type": "multiple_choice",
            "correct": "个别食物中的脂肪含量极高，非健康人群不宜多食。",
            "options": [
                "个别食物中的脂肪含量极高，非健康人群不宜多食。",
                "个别所有的食品都含糖分。",
                "个别均衡饮食对每个人都适用。",
                "他们个别了自己的饮食计划。"
            ],
            "option_pinyin": ["", "", "", ""],
            "word_hints": {}
        },
        {
            "question": "这种饮食方案适合大多数人，但_____患有特殊慢性病的人需要遵医嘱调整。",
            "type": "multiple_choice",
            "correct": "个别",
            "options": ["个别", "一切", "全部", "各类"],
            "option_pinyin": ["gè bié", "yī qiē", "quán bù", "gè lèi"],
            "word_hints": {"遵医嘱": "to follow doctor's orders", "调整": "to adjust"}
        }
    ],
    "mini_exercises": [
        {
            "type": "multiple_choice",
            "question": "个别 is used to describe...",
            "correct": "A small minority or isolated exception — a case that differs from the general pattern",
            "options": [
                "A small minority or isolated exception — a case that differs from the general pattern",
                "Every single item or person considered one by one",
                "The general rule that applies to most cases",
                "Items that are grouped together by category"
            ],
            "option_pinyin": ["gè bié", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Some individuals are allergic to certain foods and need special dietary attention.",
            "correct": "个别",
            "options": ["个别", "各自", "一般", "全体"],
            "option_pinyin": ["gè bié", "gè zì", "yī bān", "quán tǐ"],
            "question_chinese": "___人群对某些食物过敏，需要特别注意饮食搭配。",
            "question_pinyin": "___人群对某些食物过敏，需要特别注意饮食搭配。",
            "question_english": "Certain individuals are allergic to some foods and need to pay special attention to dietary combinations."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 个别?",
            "correct": "个别食品中的糖分超标，消费者应注意查看成分表。",
            "options": [
                "个别食品中的糖分超标，消费者应注意查看成分表。",
                "个别所有的食品都含糖分。",
                "他们个别地吃了同一道菜。",
                "饮食个别地影响了所有人的健康。"
            ],
            "option_pinyin": [
                "gè bié shí pǐn zhōng de táng fēn chāo biāo xiāo fèi zhě yīng zhù yì chá kàn chéng fèn biǎo",
                "gè bié suǒ yǒu de shí pǐn dōu hán táng fēn",
                "tā men gè bié de chī le tóng yī dào cài",
                "yǐn shí gè bié de yǐng xiǎng le suǒ yǒu rén de jiàn kāng"
            ]
        }
    ]
}

GP3 = {
    "number": 3,
    "title": "非 — Not / Non- / Must (formal/literary)",
    "explanation": "非 is a classical Chinese particle with several uses in modern formal Chinese: (1) 非 + Noun/Adjective — formal negation, equivalent of 不是 (e.g., 非荤食品 = non-meat products); (2) 并非 — 'is not; is by no means' (emphatic denial); (3) 非…不可 — 'must; have no choice but to' (strong necessity). 非 appears mainly in formal writing, academic texts, notices, and set phrases, giving a more authoritative tone than 不是 or 不.",
    "examples": [
        {
            "chinese": "均衡饮食并非难事，只需注意荤素搭配和热量的合理摄入。",
            "pinyin": "Jūn héng yǐn shí bìng fēi nán shì, zhǐ xū zhù yì hūn sù dā pèi hé rè liàng de hé lǐ shè rù.",
            "english": "Maintaining a balanced diet is by no means difficult — it simply requires attention to balancing meat and vegetables and managing calorie intake."
        },
        {
            "chinese": "要彻底改变个别人群的不良饮食习惯，非长期坚持不可。",
            "pinyin": "Yào chè dǐ gǎi biàn gè bié rén qún de bù liáng yǐn shí xí guàn, fēi cháng qī jiān chí bù kě.",
            "english": "To completely change the unhealthy dietary habits of certain individuals, one must persist for a long time without fail."
        }
    ],
    "exercises": [
        {
            "question": "均衡饮食并___难事，任何人只要注意荤素搭配即可做到。",
            "type": "multiple_choice",
            "correct": "非",
            "options": ["非", "不", "没", "无"],
            "option_pinyin": ["fēi", "bù", "méi", "wú"],
            "word_hints": {}
        },
        {
            "question": "这种食品属于___荤食品，适合素食者食用。",
            "type": "multiple_choice",
            "correct": "非",
            "options": ["非", "不", "别", "少"],
            "option_pinyin": ["fēi", "bù", "bié", "shǎo"],
            "word_hints": {"素食者": "vegetarian"}
        },
        {
            "question": "要真正改善饮食习惯，___持之以恒不可，个别人更需要专业指导。",
            "type": "multiple_choice",
            "correct": "非",
            "options": ["非", "除", "只", "才"],
            "option_pinyin": ["fēi", "chú", "zhǐ", "cái"],
            "word_hints": {"持之以恒": "to persist consistently"}
        },
        {
            "question": "Which sentence uses 非 correctly?",
            "type": "multiple_choice",
            "correct": "这道菜并非荤食，不含任何动物成分。",
            "options": [
                "这道菜并非荤食，不含任何动物成分。",
                "他非常喜欢吃素，所以他非健康。",
                "非个别人都喜欢荤素搭配。",
                "她非常吃素，也吃荤。"
            ],
            "option_pinyin": ["", "", "", ""],
            "word_hints": {"动物成分": "animal ingredients"}
        },
        {
            "question": "要控制体内糖分，___减少加工食品的摄入不可，这是个别专家的共同建议。",
            "type": "multiple_choice",
            "correct": "非",
            "options": ["非", "还", "也", "更"],
            "option_pinyin": ["fēi", "hái", "yě", "gèng"],
            "word_hints": {"加工食品": "processed food"}
        }
    ],
    "mini_exercises": [
        {
            "type": "multiple_choice",
            "question": "非 has multiple uses. Which use does 并非 represent?",
            "correct": "Formal negation: 'is not; is by no means' — a stronger, more emphatic denial than 不是",
            "options": [
                "Formal negation: 'is not; is by no means' — a stronger, more emphatic denial than 不是",
                "A strong necessity: 'must; have no choice but to'",
                "A prefix meaning 'super-' or 'very'",
                "A conjunction meaning 'unless; except'"
            ],
            "option_pinyin": ["bìng fēi", "fēi...bù kě", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Maintaining a balanced diet is by no means difficult.",
            "correct": "非",
            "options": ["非", "不", "别", "无"],
            "option_pinyin": ["fēi", "bù", "bié", "wú"],
            "question_chinese": "均衡饮食并___难事，只需注意荤素搭配即可。",
            "question_pinyin": "均衡饮食并___难事，只需注意荤素搭配即可。",
            "question_english": "Maintaining a balanced diet is by no means difficult — just pay attention to balancing meat and vegetables."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 非…不可?",
            "correct": "要养成健康的饮食习惯，非坚持不可。",
            "options": [
                "要养成健康的饮食习惯，非坚持不可。",
                "非他吃了素食不可。",
                "他非是个别情况，不可以吃荤。",
                "非荤食不可以吃，只能吃素。"
            ],
            "option_pinyin": [
                "yào yǎng chéng jiàn kāng de yǐn shí xí guàn fēi jiān chí bù kě",
                "fēi tā chī le sù shí bù kě",
                "tā fēi shì gè bié qíng kuàng bù kě yǐ chī hūn",
                "fēi hūn shí bù kě yǐ chī zhǐ néng chī sù"
            ]
        }
    ]
}

with open(PATH, encoding='utf-8') as f:
    data = json.load(f)

# Step 1: apply vocab replacements in-place
for v in data['vocabulary']:
    if v['chinese'] in REPLACEMENTS:
        r = REPLACEMENTS[v['chinese']]
        old = v['chinese']
        v['chinese']        = r['chinese']
        v['pinyin']         = r['pinyin']
        v['english']        = r['english']
        v['part_of_speech'] = r['part_of_speech']
        v['example']        = r['example']
        v['translation']    = r['translation']
        v['example_pinyin'] = py(r['example'])
        v['_sent_zh']       = r['_sent_zh']
        v['_sent_en']       = r['_sent_en']
        print(f'  {old} → {r["chinese"]}')

# Step 2: add new words after last non-phrase
last_np = max(i for i, v in enumerate(data['vocabulary'])
              if v.get('part_of_speech') != 'phrase')
for offset, e in enumerate(EXTRA):
    entry = {k: e[k] for k in ('id','chinese','pinyin','english','part_of_speech','example','translation')}
    entry['example_pinyin'] = py(e['example'])
    entry['_sent_zh'] = e['_sent_zh']
    entry['_sent_en'] = e['_sent_en']
    data['vocabulary'].insert(last_np + 1 + offset, entry)
    print(f'  Added {e["chinese"]} as {e["id"]}')

# Step 3: attach _sent_zh/_sent_en to existing words missing them
for v in data['vocabulary']:
    if '_sent_zh' not in v:
        ex = v.get('example', '')
        if v['chinese'] in ex:
            v['_sent_zh'] = ex.replace(v['chinese'], '___', 1)
            v['_sent_en'] = v.get('translation', v['english'])
        else:
            v['_sent_zh'] = '___。'
            v['_sent_en'] = v['english']

# Step 4: regenerate mini_exercises for all non-phrase vocab
pool = [v for v in data['vocabulary'] if v.get('part_of_speech') != 'phrase']
for v in pool:
    v['mini_exercises'] = make_mini(v, pool)

# Step 5: replace all grammar points
data['grammar_points'] = [GP1, GP2, GP3]
print(f'  Replaced all grammar points with: 即, 个别, 非')

# Step 6: clean temp keys and save
for v in data['vocabulary']:
    v.pop('_sent_zh', None)
    v.pop('_sent_en', None)

with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'\nL12 saved ({len(pool)} non-phrase vocab, {len(data["grammar_points"])} grammar points)')
for v in pool:
    print(f'  [{v["id"]}] {v["chinese"]} — {v["english"]}')
print('Grammar:')
for gp in data['grammar_points']:
    print(f'  [{gp["number"]}] {gp["title"]}')
