"""
Update HSK6 Lesson 4 (Growth & Change):
- Replace 环境 → 塑造
- Replace 经历 → 价值观
- Replace 习惯 → 独立
- Replace 突破 → 局限
- Replace 关键 → 懒惰
- Replace 成长 → 挫折
Grammar points unchanged.
All sentences use existing lesson vocabulary where possible.
"""
import json, random, re
from pypinyin import lazy_pinyin, Style

PATH = '/Users/irisvitalee/ChineseApp/data/hsk6/hsk6_lesson_4.json'
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
    '环境': dict(
        chinese='塑造', pinyin='sù zào',
        english='To shape / To mold / To form',
        part_of_speech='verb',
        example='在挫折与适应中，人的意志和价值观慢慢被塑造出来。',
        translation="In the course of setbacks and adaptation, a person's willpower and values are gradually shaped.",
        _sent_zh='在挫折与适应中，人的意志和价值观慢慢被___出来。',
        _sent_en="In the course of setbacks and adaptation, a person's willpower and values are gradually shaped.",
    ),
    '经历': dict(
        chinese='价值观', pinyin='jià zhí guān',
        english='Values / Value system / Worldview (moral)',
        part_of_speech='noun',
        example='一个人的价值观往往在不断的挫折与适应中慢慢塑造而成。',
        translation="A person's values are often gradually shaped through continual setbacks and adaptation.",
        _sent_zh='一个人的___往往在不断的挫折与适应中慢慢塑造而成。',
        _sent_en="A person's values are often gradually shaped through continual setbacks and adaptation.",
    ),
    '习惯': dict(
        chinese='独立', pinyin='dú lì',
        english='Independent / Independence / Self-reliant',
        part_of_speech='adjective/verb',
        example='经历了挫折之后，她学会了独立面对困难，主动改变而不是被动等待。',
        translation='After going through setbacks, she learned to face difficulties independently and to actively change rather than passively wait.',
        _sent_zh='经历了挫折之后，她学会了___面对困难，主动改变而不是被动等待。',
        _sent_en='After going through setbacks, she learned to face difficulties independently and to actively change rather than passively wait.',
    ),
    '突破': dict(
        chinese='局限', pinyin='jú xiàn',
        english='Limitation / Constraint / To be limited by',
        part_of_speech='noun/verb',
        example='懒惰是自我提升路上最大的局限，只有主动改变才能不断进步。',
        translation='Laziness is the greatest limitation on the path of self-improvement; only by actively changing can one continuously progress.',
        _sent_zh='懒惰是自我提升路上最大的___，只有主动改变才能不断进步。',
        _sent_en='Laziness is the greatest limitation on the path of self-improvement; only by actively changing can one continuously progress.',
    ),
    '关键': dict(
        chinese='懒惰', pinyin='lǎn duò',
        english='Lazy / Laziness / Idle',
        part_of_speech='adjective/noun',
        example='一旦变得懒惰，就很难再主动独立，也难以克服自己的局限。',
        translation='Once you become lazy, it becomes very difficult to take initiative and be independent, or to overcome your own limitations.',
        _sent_zh='一旦变得___，就很难再主动独立，也难以克服自己的局限。',
        _sent_en='Once you become lazy, it becomes very difficult to take initiative and be independent, or to overcome your own limitations.',
    ),
    '成长': dict(
        chinese='挫折', pinyin='cuò zhé',
        english='Setback / Frustration / Failure',
        part_of_speech='noun',
        example='面对挫折时，保持积极的态度是变得独立、不断进步的关键。',
        translation='When facing setbacks, maintaining a positive attitude is the key to becoming independent and continuously improving.',
        _sent_zh='面对___时，保持积极的态度是变得独立、不断进步的关键。',
        _sent_en='When facing setbacks, maintaining a positive attitude is the key to becoming independent and continuously improving.',
    ),
}

with open(PATH, encoding='utf-8') as f:
    data = json.load(f)

# Apply vocab replacements in-place
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

# Attach _sent_zh/_sent_en to existing words missing them
for v in data['vocabulary']:
    if '_sent_zh' not in v:
        ex = v.get('example', '')
        if v['chinese'] in ex:
            v['_sent_zh'] = ex.replace(v['chinese'], '___', 1)
            v['_sent_en'] = v.get('translation', v['english'])
        else:
            v['_sent_zh'] = '___。'
            v['_sent_en'] = v['english']

# Regenerate mini_exercises for all non-phrase vocab
pool = [v for v in data['vocabulary'] if v.get('part_of_speech') != 'phrase']
for v in pool:
    v['mini_exercises'] = make_mini(v, pool)

# Clean temp keys and save
for v in data['vocabulary']:
    v.pop('_sent_zh', None)
    v.pop('_sent_en', None)

with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'\nL4 saved ({len(pool)} non-phrase vocab)')
for v in pool:
    print(f'  [{v["id"]}] {v["chinese"]} — {v["english"]}')
