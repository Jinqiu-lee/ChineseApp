"""
Update HSK6 Lesson 5 (Debate & Ideas):
- Replace 沟通 → 核心
- Replace 理解 → 辩论
- Replace 逐渐 → 共识
Grammar points unchanged.
All sentences use existing lesson vocabulary where possible.
"""
import json, random, re
from pypinyin import lazy_pinyin, Style

PATH = '/Users/irisvitalee/ChineseApp/data/hsk6/hsk6_lesson_5.json'
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
    '沟通': dict(
        chinese='核心', pinyin='hé xīn',
        english='Core / Central / Key essence',
        part_of_speech='noun/adjective',
        example='找到问题的核心，才能真正解决争论，而不只是各抒己见。',
        translation='Finding the core of the issue is what truly resolves disputes, not just each person expressing their own view.',
        _sent_zh='找到问题的___，才能真正解决争论，而不只是各抒己见。',
        _sent_en='Finding the core of the issue is what truly resolves disputes, not just each person expressing their own view.',
    ),
    '理解': dict(
        chinese='辩论', pinyin='biàn lùn',
        english='To debate / Debate / Argument',
        part_of_speech='verb/noun',
        example='一场好的辩论不是为了争赢，而是帮助双方找到共识，承认各自观点的核心价值。',
        translation="A good debate is not about winning, but about helping both sides find common ground and acknowledge the core value of each other's perspectives.",
        _sent_zh='一场好的___不是为了争赢，而是帮助双方找到共识，承认各自观点的核心价值。',
        _sent_en="A good debate is not about winning, but about helping both sides find common ground and acknowledge the core value of each other's perspectives.",
    ),
    '逐渐': dict(
        chinese='共识', pinyin='gòng shí',
        english='Consensus / Common ground / Agreement',
        part_of_speech='noun',
        # 奇迹 example already contains 共识 — reuse its context
        example='经过多次辩论，双方逐渐形成了共识，承认彼此立场各有道理。',
        translation="After multiple debates, both sides gradually reached a consensus, acknowledging that each other's positions had merit.",
        _sent_zh='谁也没想到，这场激烈的争论最终创造了奇迹——双方达成了___。',
        _sent_en='Nobody expected it — this intense debate ultimately created a miracle: both sides reached a consensus.',
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

print(f'\nL5 saved ({len(pool)} non-phrase vocab)')
for v in pool:
    print(f'  [{v["id"]}] {v["chinese"]} — {v["english"]}')
