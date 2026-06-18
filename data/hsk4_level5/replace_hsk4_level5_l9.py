"""
Update HSK4 Level 5 Lesson 9 (Language & Communication):
- Remove 交流 (cross-level dup; 方言 already in lesson)
- Replace 表达 → 障碍
- Replace 理解 → 差异
- Add 普通话, 克服, 清晰
All sentences use existing lesson vocabulary.
"""
import json, random, re
from pypinyin import lazy_pinyin, Style

PATH = '/Users/irisvitalee/ChineseApp/data/hsk4_level5/hsk5_lesson_9.json'
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
    '表达': dict(
        chinese='障碍', pinyin='zhàng ài',
        english='Obstacle / Barrier / Impediment',
        part_of_speech='noun',
        example='发音不准是学习外语时最常见的障碍之一。',
        translation='Inaccurate pronunciation is one of the most common barriers when learning a foreign language.',
        _sent_zh='发音不准是学习外语时最常见的___之一。',
        _sent_en='Inaccurate pronunciation is one of the most common barriers when learning a foreign language.',
    ),
    '理解': dict(
        chinese='差异', pinyin='chā yì',
        english='Difference / Disparity / Gap',
        part_of_speech='noun',
        example='不同语言之间存在差异，需要借助翻译才能准确沟通。',
        translation='Differences exist between languages; translation is needed to communicate accurately.',
        _sent_zh='不同语言之间存在___，需要借助翻译才能准确沟通。',
        _sent_en='Differences exist between languages; translation is needed to communicate accurately.',
    ),
}

EXTRA = [
    dict(id='hsk5_l9_13', chinese='普通话', pinyin='pǔ tōng huà',
         english='Mandarin / Standard Chinese / Putonghua',
         part_of_speech='noun',
         example='他虽然平时说方言，但也能用普通话和大家沟通。',
         translation='Although he usually speaks in dialect, he can also communicate with everyone in Mandarin.',
         _sent_zh='他虽然平时说方言，但也能用___和大家沟通。',
         _sent_en='Although he usually speaks in dialect, he can also communicate with everyone in Mandarin.'),
    dict(id='hsk5_l9_14', chinese='克服', pinyin='kè fú',
         english='To overcome / To conquer / To surmount',
         part_of_speech='verb',
         example='坚持练习发音，就能克服语言学习中的障碍。',
         translation='By persisting in practising pronunciation, you can overcome the barriers in language learning.',
         _sent_zh='坚持练习发音，就能___语言学习中的障碍。',
         _sent_en='By persisting in practising pronunciation, you can overcome the barriers in language learning.'),
    dict(id='hsk5_l9_15', chinese='清晰', pinyin='qīng xī',
         english='Clear / Distinct / Articulate',
         part_of_speech='adjective/adverb',
         example='语法扎实、发音清晰，是准确翻译的重要基础。',
         translation='Solid grammar and clear pronunciation are important foundations for accurate translation.',
         _sent_zh='语法扎实、发音___，是准确翻译的重要基础。',
         _sent_en='Solid grammar and clear pronunciation are important foundations for accurate translation.'),
]

with open(PATH, encoding='utf-8') as f:
    data = json.load(f)

# Step 1: remove 交流 (方言 already in lesson at hsk5_l9_04)
data['vocabulary'] = [v for v in data['vocabulary'] if v['chinese'] != '交流']
print('  Removed 交流 (方言 already present at hsk5_l9_04)')

# Step 2: apply replacements in-place
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

# Step 3: add new words after last non-phrase
last_np = max(i for i, v in enumerate(data['vocabulary'])
              if v.get('part_of_speech') != 'phrase')
for offset, e in enumerate(EXTRA):
    entry = {k: e[k] for k in ('id','chinese','pinyin','english','part_of_speech','example','translation')}
    entry['example_pinyin'] = py(e['example'])
    entry['_sent_zh'] = e['_sent_zh']
    entry['_sent_en'] = e['_sent_en']
    data['vocabulary'].insert(last_np + 1 + offset, entry)
    print(f'  Added {e["chinese"]} as {e["id"]}')

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

# Step 5: regenerate mini_exercises
pool = [v for v in data['vocabulary'] if v.get('part_of_speech') != 'phrase']
for v in pool:
    v['mini_exercises'] = make_mini(v, pool)

# Step 6: clean temp keys and save
for v in data['vocabulary']:
    v.pop('_sent_zh', None)
    v.pop('_sent_en', None)

with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'\nL9 saved ({len(pool)} non-phrase vocab)')
for v in pool:
    print(f'  [{v["id"]}] {v["chinese"]} — {v["english"]}')
