"""
Update HSK4 Level 5 Lesson 10 (Urban Life):
- Replace 交通 → 城市化
- Replace 环境 → 生态
- Replace 压力 → 高峰（期）
- Add 完善, 合理, 宜居
- Replace all 3 grammar points:
  GP1: A（Whole）由 B（Parts）组成
  GP2: (自)……以来 + ……
  GP3: 说不定 as parenthesis (插入语)
All sentences use existing lesson vocabulary.
"""
import json, random, re
from pypinyin import lazy_pinyin, Style

PATH = '/Users/irisvitalee/ChineseApp/data/hsk4_level5/hsk5_lesson_10.json'
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

# ── Vocabulary replacements ───────────────────────────────────────────────────
REPLACEMENTS = {
    '交通': dict(
        chinese='城市化', pinyin='chéng shì huà',
        english='Urbanisation / Urbanization',
        part_of_speech='noun',
        example='随着城市化进程不断加快，城市的规划和设施建设变得越来越重要。',
        translation='As the urbanisation process continues to accelerate, urban planning and facility construction have become increasingly important.',
        _sent_zh='随着___进程不断加快，城市的规划和设施建设变得越来越重要。',
        _sent_en='As the urbanisation process continues to accelerate, urban planning and facility construction have become increasingly important.',
    ),
    '环境': dict(
        chinese='生态', pinyin='shēng tài',
        english='Ecology / Ecological environment',
        part_of_speech='noun',
        example='随着绿化面积扩大，这座城市的生态越来越好，也越来越宜居。',
        translation='As green spaces expand, the ecological environment of this city is getting better and better, and it is becoming more and more liveable.',
        _sent_zh='随着绿化面积扩大，这座城市的___越来越好，也越来越宜居。',
        _sent_en='As green spaces expand, the ecological environment of this city is getting better and better, and it is becoming more and more liveable.',
    ),
    '压力': dict(
        chinese='高峰（期）', pinyin='gāo fēng (qī)',
        english='Peak period / Rush hour / Peak time',
        part_of_speech='noun',
        example='早晚高峰（期）地铁里非常拥挤，很多人会提早出发。',
        translation='During morning and evening peak periods, the subway is extremely crowded, and many people leave early.',
        _sent_zh='早晚___地铁里非常拥挤，很多人会提早出发。',
        _sent_en='During morning and evening peak periods, the subway is extremely crowded, and many people leave early.',
    ),
}

EXTRA = [
    dict(id='hsk5_l10_13', chinese='完善', pinyin='wán shàn',
         english='Well-developed / To improve / To perfect',
         part_of_speech='adj/verb',
         example='城市的公共设施越来越完善，居民的生活便利程度大大提高。',
         translation="The city's public facilities are becoming more and more well-developed, greatly improving residents' convenience.",
         _sent_zh='城市的公共设施越来越___，居民的生活便利程度大大提高。',
         _sent_en="The city's public facilities are becoming more and more well-developed, greatly improving residents' convenience."),
    dict(id='hsk5_l10_14', chinese='合理', pinyin='hé lǐ',
         english='Reasonable / Rational / Sensible',
         part_of_speech='adjective',
         example='合理的城市规划能够有效减少高峰（期）的拥挤问题，改善生态环境。',
         translation='Reasonable urban planning can effectively reduce peak-hour congestion and improve the ecological environment.',
         _sent_zh='___的城市规划能够有效减少高峰（期）的拥挤问题，改善生态环境。',
         _sent_en='Reasonable urban planning can effectively reduce peak-hour congestion and improve the ecological environment.'),
    dict(id='hsk5_l10_15', chinese='宜居', pinyin='yí jū',
         english='Liveable / Habitable / Good to live in',
         part_of_speech='adjective',
         example='绿化做得好、设施完善的城市，才是真正宜居的城市。',
         translation='A city with good greening and well-developed facilities is truly a liveable city.',
         _sent_zh='绿化做得好、设施完善的城市，才是真正___的城市。',
         _sent_en='A city with good greening and well-developed facilities is truly a liveable city.'),
]

# ── Grammar Point 1: A由B组成 ────────────────────────────────────────────────
GP1 = {
    'number': 1,
    'title': 'A（Whole）由 B（Parts）组成 — A is composed of B',
    'explanation': (
        'A（Whole）由 B（Parts）组成 describes what something is made up of or composed of. '
        'A is the whole entity, B is the list of parts or components.\n\n'
        'Structure: A + 由 + B（part 1、part 2…）+ 组成\n\n'
        '• 一个宜居的城市由完善的设施、合理的规划和良好的生态环境组成。\n'
        '  (A liveable city is composed of well-developed facilities, reasonable planning, and a good ecological environment.)\n'
        '• 城市的公共交通系统由地铁、公共汽车和自行车道等部分组成。\n'
        '  (The city\'s public transportation system is composed of the subway, buses, and bicycle lanes.)\n\n'
        'Notes:\n'
        '• 由 here means "made up of / consisting of"\n'
        '• 组成 means "to form / to make up" — together, 由…组成 = "is composed of"\n'
        '• B can be a list of nouns or noun phrases separated by 、or 和\n'
        '• This structure is often used to describe cities, systems, teams, or organisations'
    ),
    'examples': [
        {
            'chinese': '一个宜居的城市由完善的设施、合理的规划和良好的生态环境组成。',
            'pinyin': py('一个宜居的城市由完善的设施合理的规划和良好的生态环境组成'),
            'english': 'A liveable city is composed of well-developed facilities, reasonable planning, and a good ecological environment.'
        },
        {
            'chinese': '城市的公共交通系统由地铁、公共汽车和自行车道等部分组成。',
            'pinyin': py('城市的公共交通系统由地铁公共汽车和自行车道等部分组成'),
            'english': "The city's public transportation system is composed of the subway, buses, and bicycle lanes."
        },
        {
            'chinese': '这个社区由若干居民楼、公共设施和绿化区组成，生活非常便利。',
            'pinyin': py('这个社区由若干居民楼公共设施和绿化区组成生活非常便利'),
            'english': 'This community is composed of residential buildings, public facilities, and green areas, making life very convenient.'
        },
    ],
    'exercises': [
        {
            'question': '这个城市的公共交通网络___地铁、公共汽车和出租车等部分___，十分完善。',
            'type': 'multiple_choice',
            'correct': '由…组成',
            'options': ['由…组成', '用…做成', '对…来说', '从…来看'],
            'option_pinyin': ['yóu … zǔ chéng', 'yòng … zuò chéng', 'duì … lái shuō', 'cóng … lái kàn'],
            'word_hints': {'公共交通': 'gōng gòng jiāo tōng', '完善': 'wán shàn'}
        },
        {
            'question': 'Which sentence correctly uses A由B组成?',
            'type': 'multiple_choice',
            'correct': '一个宜居的社区由完善的设施、绿化和合理的规划组成。',
            'options': [
                '一个宜居的社区由完善的设施、绿化和合理的规划组成。',
                '社区宜居由设施绿化规划组成一个。',
                '由设施完善组成宜居社区一个。',
                '一个社区组成宜居由设施、绿化和规划。'
            ],
            'option_pinyin': [
                py('一个宜居的社区由完善的设施绿化和合理的规划组成'),
                '', '', ''
            ],
            'word_hints': {'宜居': 'yí jū', '设施': 'shè shī'}
        },
        {
            'question': 'What does A由B组成 express?',
            'type': 'multiple_choice',
            'correct': 'A is composed of / made up of B — B lists the components of A',
            'options': [
                'A is composed of / made up of B — B lists the components of A',
                'A changes because of B — B is the cause',
                'A happens after B — B is the sequence',
                'A is compared to B — B is the reference point'
            ],
            'option_pinyin': ['', '', '', ''],
            'word_hints': {}
        },
    ],
    'mini_exercises': [
        {
            'type': 'multiple_choice',
            'question': 'A由B组成 means...',
            'correct': 'A is made up of / composed of B (A is the whole, B the parts)',
            'options': [
                'A is made up of / composed of B (A is the whole, B the parts)',
                'A is replaced by B (substitution)',
                'A is bigger than B (comparison)',
                'A happened before B (sequence)'
            ],
            'option_pinyin': ['yóu … zǔ chéng', '', '', '']
        },
        {
            'type': 'fill_blank',
            'question': "Fill in: The city's public transportation system is composed of the subway and buses.",
            'correct': '由',
            'options': ['由', '用', '被', '从'],
            'option_pinyin': ['yóu', 'yòng', 'bèi', 'cóng'],
            'question_chinese': '城市的公共交通系统___地铁和公共汽车等部分组成，非常完善。',
            'question_pinyin': '城市的公共交通系统___地铁和公共汽车等部分组成，非常完善。',
            'question_english': "The city's public transportation system is composed of the subway and buses, and is very well-developed."
        },
        {
            'type': 'multiple_choice',
            'question': 'Which sentence correctly uses A由B组成?',
            'correct': '一个宜居的城市由完善的设施和合理的规划组成。',
            'options': [
                '一个宜居的城市由完善的设施和合理的规划组成。',
                '宜居城市一个由设施合理规划完善组成。',
                '完善的设施由宜居城市一个规划组成。',
                '由宜居城市的完善设施，一个规划组成。'
            ],
            'option_pinyin': [
                py('一个宜居的城市由完善的设施和合理的规划组成'),
                '', '', ''
            ]
        }
    ]
}

# ── Grammar Point 2: (自)……以来 ───────────────────────────────────────────────
GP2 = {
    'number': 2,
    'title': '(自)……以来 — Since (a point in time)',
    'explanation': (
        '(自)……以来 marks a starting point in the past and indicates that a situation has continued '
        'from that point up to now. 自 (since/from) is optional — 以来 alone can follow a time '
        'expression or event clause.\n\n'
        'Structures:\n'
        '• 自 + time/event + 以来, + main clause\n'
        '• time/event + 以来, + main clause (自 omitted)\n\n'
        '• 自城市化进程加快以来，城市对公共交通的需求越来越大。\n'
        '  (Since the urbanisation process accelerated, the demand for public transportation has been growing.)\n'
        '• 自政府推进绿化建设以来，城市的生态环境得到了明显改善。\n'
        '  (Since the government promoted greening construction, the ecological environment has significantly improved.)\n\n'
        'Common time markers used:\n'
        '• 自城市化加速以来 — since urbanisation accelerated\n'
        '• 近年来 — in recent years (以来 alone, no 自)\n'
        '• 自从改革开放以来 — since the Reform and Opening Up\n\n'
        'The main clause often includes 一直, 已经, 越来越, or 不断 to emphasise continuity.'
    ),
    'examples': [
        {
            'chinese': '自城市化进程加快以来，城市对公共交通的需求越来越大。',
            'pinyin': py('自城市化进程加快以来城市对公共交通的需求越来越大'),
            'english': 'Since the urbanisation process accelerated, the demand for public transportation has been growing.'
        },
        {
            'chinese': '自政府推进绿化建设以来，城市的生态环境得到了明显改善。',
            'pinyin': py('自政府推进绿化建设以来城市的生态环境得到了明显改善'),
            'english': 'Since the government promoted greening construction, the ecological environment of cities has been significantly improved.'
        },
        {
            'chinese': '自公共设施不断完善以来，这个社区变得越来越宜居。',
            'pinyin': py('自公共设施不断完善以来这个社区变得越来越宜居'),
            'english': 'Since public facilities have continued to improve, this community has become more and more liveable.'
        },
    ],
    'exercises': [
        {
            'question': '___城市化快速发展以来，城市的设施建设越来越完善。',
            'type': 'multiple_choice',
            'correct': '自',
            'options': ['自', '对', '因', '从'],
            'option_pinyin': ['zì', 'duì', 'yīn', 'cóng'],
            'word_hints': {'城市化': 'chéng shì huà', '完善': 'wán shàn'}
        },
        {
            'question': 'Which sentence correctly uses 自……以来?',
            'type': 'multiple_choice',
            'correct': '自绿化计划实施以来，城市的生态环境明显改善了。',
            'options': [
                '自绿化计划实施以来，城市的生态环境明显改善了。',
                '以来自绿化计划实施，城市的生态环境明显改善了。',
                '绿化计划自以来实施，城市生态环境明显改善了。',
                '城市自绿化计划，生态以来实施明显改善了。'
            ],
            'option_pinyin': [
                py('自绿化计划实施以来城市的生态环境明显改善了'),
                '', '', ''
            ],
            'word_hints': {'绿化': 'lǜ huà', '生态': 'shēng tài'}
        },
        {
            'question': 'What does 以来 in 自……以来 indicate?',
            'type': 'multiple_choice',
            'correct': 'A starting point in the past — the situation began then and has continued to the present',
            'options': [
                'A starting point in the past — the situation began then and has continued to the present',
                'A future goal — what will happen after a condition is met',
                'A contrast — something unexpected given the preceding condition',
                'A cause — the reason why the main clause happened'
            ],
            'option_pinyin': ['', '', '', ''],
            'word_hints': {}
        },
    ],
    'mini_exercises': [
        {
            'type': 'multiple_choice',
            'question': '自……以来 means...',
            'correct': 'Since (a point in the past) — marks the beginning of an ongoing situation that continues to now',
            'options': [
                'Since (a point in the past) — marks the beginning of an ongoing situation that continues to now',
                'As long as — introduces a condition',
                'Although — introduces a concession',
                'Because of — introduces a cause'
            ],
            'option_pinyin': ['zì … yǐ lái', '', '', '']
        },
        {
            'type': 'fill_blank',
            'question': 'Fill in: Since the public transportation system improved, peak-hour congestion has been alleviated.',
            'correct': '自',
            'options': ['自', '因', '虽', '当'],
            'option_pinyin': ['zì', 'yīn', 'suī', 'dāng'],
            'question_chinese': '___公共交通系统完善以来，高峰（期）的拥挤问题有所缓解。',
            'question_pinyin': '___公共交通系统完善以来，高峰（期）的拥挤问题有所缓解。',
            'question_english': 'Since the public transportation system improved, peak-hour congestion has been alleviated.'
        },
        {
            'type': 'multiple_choice',
            'question': 'Which sentence correctly uses 自……以来?',
            'correct': '自城市化加速以来，绿化建设越来越受到重视。',
            'options': [
                '自城市化加速以来，绿化建设越来越受到重视。',
                '城市化加速以来自，绿化建设越来越受到重视。',
                '以来自城市化，绿化建设加速越来越受到重视。',
                '绿化建设自以来城市化加速，越来越受到重视。'
            ],
            'option_pinyin': [
                py('自城市化加速以来绿化建设越来越受到重视'),
                '', '', ''
            ]
        }
    ]
}

# ── Grammar Point 3: 说不定 as parenthesis ────────────────────────────────────
GP3 = {
    'number': 3,
    'title': '说不定 — Perhaps; maybe (as a parenthesis / 插入语)',
    'explanation': (
        '说不定 literally means "hard to say / cannot be determined." When used as a parenthesis '
        '(插入语), it expresses uncertainty or possibility about a situation, similar to '
        '"perhaps", "maybe", or "it could be that".\n\n'
        'As a parenthesis, 说不定 can be placed:\n'
        '• Before the subject: 说不定这个城市以后会变得更宜居。\n'
        '  (Perhaps this city will become more liveable in the future.)\n'
        '• After the subject: 这个城市说不定会变得更宜居。\n'
        '  (This city will perhaps become more liveable.)\n\n'
        'Examples with lesson vocabulary:\n'
        '• 说不定未来的城市会变得更加宜居。\n'
        '  (Perhaps future cities will become even more liveable.)\n'
        '• 这个社区的设施还不完善，说不定政府会重新规划这里。\n'
        '  (The facilities here aren\'t fully developed; the government will perhaps re-plan this area.)\n\n'
        'Notes:\n'
        '• 说不定 is more colloquial than 也许 or 可能\n'
        '• It often implies the speaker thinks something is probable or plausible\n'
        '• Unlike 也许/可能, 说不定 always floats as a sentence-level parenthesis — '
        'it cannot modify a single verb alone'
    ),
    'examples': [
        {
            'chinese': '随着城市化发展，说不定未来的城市会变得更加宜居。',
            'pinyin': py('随着城市化发展说不定未来的城市会变得更加宜居'),
            'english': 'As urbanisation develops, perhaps future cities will become even more liveable.'
        },
        {
            'chinese': '这个社区的设施还不完善，说不定政府会重新规划这里。',
            'pinyin': py('这个社区的设施还不完善说不定政府会重新规划这里'),
            'english': "The facilities in this community are not yet well-developed; the government will perhaps re-plan this area."
        },
        {
            'chinese': '说不定这座城市的生态环境以后会越来越好，绿化也会更多。',
            'pinyin': py('说不定这座城市的生态环境以后会越来越好绿化也会更多'),
            'english': 'Perhaps the ecological environment of this city will get better and better in the future, with more green spaces too.'
        },
    ],
    'exercises': [
        {
            'question': 'What does 说不定 mean in 说不定这个社区以后会变得更加宜居？',
            'type': 'multiple_choice',
            'correct': 'Perhaps; maybe — expressing possibility or uncertainty about the future',
            'options': [
                'Perhaps; maybe — expressing possibility or uncertainty about the future',
                'Definitely — expressing strong certainty',
                'Although — introducing a concession',
                'Because — introducing a reason'
            ],
            'option_pinyin': ['shuō bu dìng', '', '', ''],
            'word_hints': {'宜居': 'yí jū'}
        },
        {
            'question': '随着城市化发展，___未来的高峰（期）拥挤问题会得到解决。',
            'type': 'multiple_choice',
            'correct': '说不定',
            'options': ['说不定', '肯定', '一定', '必然'],
            'option_pinyin': ['shuō bu dìng', 'kěn dìng', 'yí dìng', 'bì rán'],
            'word_hints': {'城市化': 'chéng shì huà', '拥挤': 'yōng jǐ'}
        },
        {
            'question': 'Which sentence uses 说不定 correctly as a parenthesis (插入语)?',
            'type': 'multiple_choice',
            'correct': '这里的生态环境不错，说不定以后会成为最宜居的社区。',
            'options': [
                '这里的生态环境不错，说不定以后会成为最宜居的社区。',
                '说不定生态，这里是环境不错宜居社区。',
                '以后宜居社区会成为说不定，这里生态不错。',
                '说不定宜居，这里的生态环境不错以后会成为。'
            ],
            'option_pinyin': [
                py('这里的生态环境不错说不定以后会成为最宜居的社区'),
                '', '', ''
            ],
            'word_hints': {'生态': 'shēng tài', '宜居': 'yí jū'}
        },
    ],
    'mini_exercises': [
        {
            'type': 'multiple_choice',
            'question': '说不定 as a parenthesis (插入语) expresses...',
            'correct': 'Uncertainty or possibility — "perhaps; maybe; it could be that..."',
            'options': [
                'Uncertainty or possibility — "perhaps; maybe; it could be that..."',
                'Strong certainty — "definitely; certainly; without a doubt"',
                'Contrast — "although; even though; despite"',
                'Cause — "because; due to; as a result of"'
            ],
            'option_pinyin': ['shuō bu dìng', '', '', '']
        },
        {
            'type': 'fill_blank',
            'question': 'Fill in: As green spaces increase, perhaps the ecological environment of this city will get better and better.',
            'correct': '说不定',
            'options': ['说不定', '当然', '肯定', '已经'],
            'option_pinyin': ['shuō bu dìng', 'dāng rán', 'kěn dìng', 'yǐ jīng'],
            'question_chinese': '随着绿化增加，___这座城市的生态会越来越好。',
            'question_pinyin': '随着绿化增加，___这座城市的生态会越来越好。',
            'question_english': 'As green spaces increase, perhaps the ecological environment of this city will get better and better.'
        },
        {
            'type': 'multiple_choice',
            'question': 'Which sentence correctly uses 说不定 as a parenthesis?',
            'correct': '随着绿化不断增加，说不定这个社区的生态环境会越来越宜居。',
            'options': [
                '随着绿化不断增加，说不定这个社区的生态环境会越来越宜居。',
                '绿化增加随着，这个社区说不定生态宜居。',
                '这个社区说不定，绿化生态环境宜居不断增加。',
                '说不定，绿化增加这个宜居社区的生态。'
            ],
            'option_pinyin': [
                py('随着绿化不断增加说不定这个社区的生态环境会越来越宜居'),
                '', '', ''
            ]
        }
    ]
}

# ── Main processing ───────────────────────────────────────────────────────────
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

# Step 3: replace all 3 grammar points
data['grammar_points'] = [GP1, GP2, GP3]
print('  Replaced all 3 grammar points: A由B组成 / (自)…以来 / 说不定')

# Step 4: attach _sent_zh/_sent_en to existing words missing them
for v in data['vocabulary']:
    if '_sent_zh' not in v:
        ex = v.get('example', '')
        if v['chinese'] in ex:
            v['_sent_zh'] = ex.replace(v['chinese'], '___', 1)
            v['_sent_en'] = v.get('translation', v['english'])
        else:
            v['_sent_zh'] = '___。'
            v['_sent_en'] = v['english']

# Step 5: regenerate mini_exercises for all non-phrase vocab
pool = [v for v in data['vocabulary'] if v.get('part_of_speech') != 'phrase']
for v in pool:
    v['mini_exercises'] = make_mini(v, pool)

# Step 6: clean temp keys and save
for v in data['vocabulary']:
    v.pop('_sent_zh', None)
    v.pop('_sent_en', None)

with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'\nL10 saved ({len(pool)} non-phrase vocab, {len(data["grammar_points"])} grammar pts)')
for v in pool:
    print(f'  [{v["id"]}] {v["chinese"]} — {v["english"]}')
for gp in data['grammar_points']:
    print(f'  GP{gp["number"]}: {gp["title"]}')
