"""
Update HSK4 Level 5 Lesson 8 (Family & Relationships):
- Remove 关系 (duplicate; 和睦 already in this lesson covers family harmony)
- Replace 责任 → 承担
- Replace 尊重 → 牺牲
- Replace 沟通 → 委屈 (collocates with 受委屈)
All example sentences use existing lesson vocabulary.
"""
import json, random, re
from pypinyin import lazy_pinyin, Style

PATH = '/Users/irisvitalee/ChineseApp/data/hsk4_level5/hsk5_lesson_8.json'
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
    '责任': dict(
        chinese='承担', pinyin='chéng dān',
        english='To bear / To take on / To shoulder',
        part_of_speech='verb',
        example='父母愿意承担养育子女的责任，是家庭和睦的重要基础。',
        translation="Parents' willingness to shoulder the responsibility of raising children is an important foundation of family harmony.",
        _sent_zh='父母愿意___养育子女的责任，是家庭和睦的重要基础。',
        _sent_en="Parents' willingness to shoulder the responsibility of raising children is an important foundation of family harmony.",
    ),
    '尊重': dict(
        chinese='牺牲', pinyin='xī shēng',
        english='To sacrifice / To give up for others / Sacrifice',
        part_of_speech='verb/noun',
        example='父母为了养育子女，愿意牺牲自己的时间和精力。',
        translation='Parents are willing to sacrifice their time and energy in order to raise their children.',
        _sent_zh='父母为了养育子女，愿意___自己的时间和精力。',
        _sent_en='Parents are willing to sacrifice their time and energy in order to raise their children.',
    ),
    '沟通': dict(
        chinese='委屈', pinyin='wěi qū',
        english='To feel wronged / Grievance / To be treated unfairly',
        part_of_speech='verb/noun',
        example='家庭矛盾中，有人宁愿受委屈，也不愿意包容地表达自己的想法。',
        translation='In family conflicts, some people would rather feel wronged than tolerantly express their own thoughts.',
        _sent_zh='家庭矛盾中，有人宁愿受___，也不愿意包容地表达自己的想法。',
        _sent_en='In family conflicts, some people would rather feel wronged than tolerantly express their own thoughts.',
    ),
}

with open(PATH, encoding='utf-8') as f:
    data = json.load(f)

# Step 1: remove 关系 (和睦 already in lesson covers family harmony)
before = len(data['vocabulary'])
data['vocabulary'] = [v for v in data['vocabulary'] if v['chinese'] != '关系']
print(f'  Removed 关系 (和睦 already present at hsk5_l8_10)')

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

# Step 5: clean temp keys and save
for v in data['vocabulary']:
    v.pop('_sent_zh', None)
    v.pop('_sent_en', None)

with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'\nL8 saved ({len(pool)} non-phrase vocab)')
for v in pool:
    print(f'  [{v["id"]}] {v["chinese"]} — {v["english"]}')
