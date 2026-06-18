"""
Update HSK4 Level 5 Lesson 7 (Business & Economy):
- Replace 竞争 → 激烈
- Replace 合同 → 签
- Replace GP2 相比之下 → 一(量词)比一(量词)
All sentences use existing lesson vocab.
"""
import json, random, re, os
from pypinyin import lazy_pinyin, Style

PATH = '/Users/irisvitalee/ChineseApp/data/hsk4_level5/hsk5_lesson_7.json'
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
    '竞争': dict(
        chinese='激烈', pinyin='jī liè',
        english='Intense / Fierce / Vigorous',
        part_of_speech='adjective',
        example='市场竞争十分激烈，企业必须不断调整策略才能生存。',
        translation='Market competition is extremely fierce; enterprises must constantly adjust strategies to survive.',
        _sent_zh='市场竞争十分___，企业必须不断调整策略才能生存。',
        _sent_en='Market competition is extremely fierce; enterprises must constantly adjust strategies to survive.',
    ),
    '合同': dict(
        chinese='签', pinyin='qiān',
        english='To sign / To put one\'s signature',
        part_of_speech='verb',
        example='经过漫长的谈判，双方终于签了合作协议。',
        translation='After lengthy negotiations, both sides finally signed a cooperation agreement.',
        _sent_zh='经过漫长的谈判，双方终于___了合作协议。',
        _sent_en='After lengthy negotiations, both sides finally signed a cooperation agreement.',
    ),
}

# ── New grammar GP2: 一(量词)比一(量词) ──────────────────────────────────────
NEW_GP2 = {
    'number': 2,
    'title': '一(量词)比一(量词) — Each one more than the last',
    'explanation': (
        '一(量词)比一(量词) uses a repeated measure word with 比 between them to express '
        'a progressive increase in degree. It emphasizes that something keeps getting '
        'more and more so over time or across items.\n\n'
        'Structure: 一 + 量词 + 比 + 一 + 量词 + adjective/verb\n\n'
        '• 市场竞争一年比一年激烈。\n'
        '  (Market competition gets more fierce each year.)\n'
        '• 企业的利润一季度比一季度高。\n'
        '  (Company profits are higher each quarter than the last.)\n'
        '• 品牌的知名度一天比一天高。\n'
        '  (The brand\'s recognition grows higher day by day.)\n\n'
        'Common measure words used:\n'
        '• 年 (year): 一年比一年… — getting more so year by year\n'
        '• 天 (day): 一天比一天… — getting more so day by day\n'
        '• 次 (time): 一次比一次… — getting more so each time\n'
        '• 个 (item): 一个比一个… — each one more so than the previous\n\n'
        'Note: The adjective or verb at the end describes the direction of change, '
        'always implying an upward or intensifying trend.'
    ),
    'examples': [
        {
            'chinese': '市场竞争一年比一年激烈，企业必须不断调整销售策略。',
            'pinyin': py('市场竞争一年比一年激烈企业必须不断调整销售策略'),
            'english': 'Market competition gets more fierce year by year; enterprises must keep adjusting their sales strategies.'
        },
        {
            'chinese': '这家企业的利润一季度比一季度高，投资者非常满意。',
            'pinyin': py('这家企业的利润一季度比一季度高投资者非常满意'),
            'english': "This company's profit is higher each quarter than the last, and investors are very satisfied."
        },
        {
            'chinese': '谈判的条件一次比一次严格，双方都感到了压力。',
            'pinyin': py('谈判的条件一次比一次严格双方都感到了压力'),
            'english': 'The negotiation conditions get stricter each time, and both sides feel the pressure.'
        },
    ],
    'exercises': [
        {
            'question': '这个品牌的市场销售额一年___一年高，发展非常好。',
            'type': 'multiple_choice',
            'correct': '比',
            'options': ['比', '和', '跟', '与'],
            'option_pinyin': ['bǐ', 'hé', 'gēn', 'yǔ'],
            'word_hints': {'销售额': 'xiāo shòu é', '品牌': 'pǐn pái'}
        },
        {
            'question': 'Which sentence correctly uses 一(量词)比一(量词)?',
            'type': 'multiple_choice',
            'correct': '企业的投资回报一年比一年高，利润不断增加。',
            'options': [
                '企业的投资回报一年比一年高，利润不断增加。',
                '企业投资比一年一年高，利润增加。',
                '一年企业的比一年投资回报高，利润增加不断。',
                '企业一年高比一年投资回报，利润不断。'
            ],
            'option_pinyin': [
                py('企业的投资回报一年比一年高利润不断增加'),
                '', '', ''
            ],
            'word_hints': {'回报': 'huí bào', '利润': 'lì rùn'}
        },
        {
            'question': '谈判进行了很多轮，条件___，双方的压力也越来越大。',
            'type': 'multiple_choice',
            'correct': '一次比一次严格',
            'options': [
                '一次比一次严格',
                '比一次一次好',
                '严格比一次',
                '一次都比严格'
            ],
            'option_pinyin': [
                py('一次比一次严格'), '', '', ''
            ],
            'word_hints': {'谈判': 'tán pàn', '严格': 'yán gé'}
        },
    ],
    'mini_exercises': [
        {
            'type': 'multiple_choice',
            'question': '一年比一年激烈 means...',
            'correct': 'Getting more intense year by year (progressive increase)',
            'options': [
                'Getting more intense year by year (progressive increase)',
                'Exactly as intense as last year (no change)',
                'Less intense than before (decreasing)',
                'Intense for one year, then stops'
            ],
            'option_pinyin': ['yī nián bǐ yī nián', '', '', '']
        },
        {
            'type': 'fill_blank',
            'question': "Fill in: This company's sales are higher each year than the last.",
            'correct': '比',
            'options': ['比', '和', '跟', '让'],
            'option_pinyin': ['bǐ', 'hé', 'gēn', 'ràng'],
            'question_chinese': '这家企业的销售额一年___一年高，发展势头非常好。',
            'question_pinyin': '这家企业的销售额一年___一年高，发展势头非常好。',
            'question_english': "This company's sales are higher each year than the last, showing great momentum."
        },
        {
            'type': 'multiple_choice',
            'question': 'Which sentence correctly uses 一(量词)比一(量词)?',
            'correct': '市场竞争一年比一年激烈，企业必须不断调整策略。',
            'options': [
                '市场竞争一年比一年激烈，企业必须不断调整策略。',
                '市场一年激烈比一年，策略企业调整。',
                '竞争一年比激烈一年，企业调整策略不断。',
                '企业一年比一年调整策略，市场竞争激烈。'
            ],
            'option_pinyin': [
                py('市场竞争一年比一年激烈企业必须不断调整策略'),
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

# Step 2: replace GP2 (相比之下)
for i, gp in enumerate(data['grammar_points']):
    if gp['number'] == 2:
        data['grammar_points'][i] = NEW_GP2
        print(f'  GP2 replaced → {NEW_GP2["title"]}')
        break

# Step 3: attach _sent_zh/_sent_en to words missing them
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

# Step 5: clean temp keys and save
for v in data['vocabulary']:
    v.pop('_sent_zh', None)
    v.pop('_sent_en', None)

with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'\nL7 saved ({len(pool)} non-phrase vocab, {len(data["grammar_points"])} grammar pts)')
for gp in data['grammar_points']:
    print(f'  GP{gp["number"]}: {gp["title"]}')
