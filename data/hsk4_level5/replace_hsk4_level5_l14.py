"""
Update HSK4 Level 5 Lesson 14 (Growing Up):
- Replace 经历 → 少年
- Add 遗憾, 迷茫, 内向, 外向
Grammar points unchanged.
All sentences use existing lesson vocabulary.
"""
import json, random, re
from pypinyin import lazy_pinyin, Style

PATH = '/Users/irisvitalee/ChineseApp/data/hsk4_level5/hsk5_lesson_14.json'
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
    '经历': dict(
        chinese='少年', pinyin='shào nián',
        english='Youth / Teenager / Young person / Adolescent',
        part_of_speech='noun',
        example='少年时期是人生中最宝贵的阶段之一，要好好珍惜每一个成长的机会。',
        translation='The teenage years are one of the most precious stages of life; cherish every opportunity to grow.',
        _sent_zh='___时期是人生中最宝贵的阶段之一，要好好珍惜每一个成长的机会。',
        _sent_en='The teenage years are one of the most precious stages of life; cherish every opportunity to grow.',
    ),
}

EXTRA = [
    dict(id='hsk5_l14_13', chinese='遗憾', pinyin='yí hàn',
         english='Regret / To regret / A pity',
         part_of_speech='noun/verb',
         example='趁年轻多把握机会，不要让未来的自己留下遗憾。',
         translation='Seize opportunities while you are young; do not let your future self be left with regrets.',
         _sent_zh='趁年轻多把握机会，不要让未来的自己留下___。',
         _sent_en='Seize opportunities while you are young; do not let your future self be left with regrets.'),
    dict(id='hsk5_l14_14', chinese='迷茫', pinyin='mí máng',
         english='Lost / Confused / At a loss / Bewildered',
         part_of_speech='adjective',
         example='青春时期感到迷茫是正常的，重要的是不放弃，继续成长。',
         translation='Feeling lost during youth is normal; what matters is not giving up and continuing to grow.',
         _sent_zh='青春时期感到___是正常的，重要的是不放弃，继续成长。',
         _sent_en='Feeling lost during youth is normal; what matters is not giving up and continuing to grow.'),
    dict(id='hsk5_l14_15', chinese='内向', pinyin='nèi xiàng',
         english='Introverted / Shy / Reserved',
         part_of_speech='adjective',
         example='他虽然内向，但在成长过程中慢慢变得更加成熟，也更懂得珍惜回忆。',
         translation='Although he is introverted, he gradually became more mature through growing up and learned to cherish his memories.',
         _sent_zh='他虽然___，但在成长过程中慢慢变得更加成熟，也更懂得珍惜回忆。',
         _sent_en='Although he is introverted, he gradually became more mature through growing up and learned to cherish his memories.'),
    dict(id='hsk5_l14_16', chinese='外向', pinyin='wài xiàng',
         english='Extroverted / Outgoing / Sociable',
         part_of_speech='adjective',
         example='外向的少年总是充满活力，善于珍惜每一次与朋友在一起的机会。',
         translation='Outgoing youngsters are always full of energy and good at cherishing every opportunity to be with friends.',
         _sent_zh='___的少年总是充满活力，善于珍惜每一次与朋友在一起的机会。',
         _sent_en='Outgoing youngsters are always full of energy and good at cherishing every opportunity to be with friends.'),
]

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

# Step 5: clean temp keys and save
for v in data['vocabulary']:
    v.pop('_sent_zh', None)
    v.pop('_sent_en', None)

with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'\nL14 saved ({len(pool)} non-phrase vocab)')
for v in pool:
    print(f'  [{v["id"]}] {v["chinese"]} — {v["english"]}')
