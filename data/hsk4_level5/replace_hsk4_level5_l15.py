"""
Update HSK4 Level 5 Lesson 15 (Goals & Achievement):
- Remove 成功 (成就 already at hsk5_l15_01)
- Replace 目标 → 性格
- Replace 努力 → 骄傲
- Replace 坚持 → 坚持不懈
- Replace 挑战 → 局限
- Replace 实现 → 价值
Grammar points unchanged.
All sentences use existing lesson vocabulary.
"""
import json, random, re
from pypinyin import lazy_pinyin, Style

PATH = '/Users/irisvitalee/ChineseApp/data/hsk4_level5/hsk5_lesson_15.json'
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
    '目标': dict(
        chinese='性格', pinyin='xìng gé',
        english='Personality / Character / Temperament',
        part_of_speech='noun',
        example='一个人的性格会影响他如何面对局限，找到突破的方向。',
        translation="A person's personality influences how they face limitations and find the direction for a breakthrough.",
        _sent_zh='一个人的___会影响他如何面对局限，找到突破的方向。',
        _sent_en="A person's personality influences how they face limitations and find the direction for a breakthrough.",
    ),
    '努力': dict(
        chinese='骄傲', pinyin='jiāo ào',
        english='Proud / Pride / Arrogant',
        part_of_speech='adjective/noun',
        example='取得成就时感到骄傲是正常的，但不能因此而忽视自己的局限。',
        translation='Feeling proud when achieving something is normal, but one must not overlook their own limitations because of it.',
        _sent_zh='取得成就时感到___是正常的，但不能因此而忽视自己的局限。',
        _sent_en='Feeling proud when achieving something is normal, but one must not overlook their own limitations because of it.',
    ),
    '坚持': dict(
        chinese='坚持不懈', pinyin='jiān chí bù xiè',
        english='Persevering / Unwavering persistence / Dogged',
        part_of_speech='adjective/verb',
        example='凭借坚持不懈的精神，她终于克服了局限，取得了令人骄傲的成就。',
        translation='With unwavering persistence, she finally overcame her limitations and achieved something truly worth being proud of.',
        _sent_zh='凭借___的精神，她终于克服了局限，取得了令人骄傲的成就。',
        _sent_en='With unwavering persistence, she finally overcame her limitations and achieved something truly worth being proud of.',
    ),
    '挑战': dict(
        chinese='局限', pinyin='jú xiàn',
        english='Limitation / Constraint / To limit',
        part_of_speech='noun/verb',
        example='了解自己的局限，才能找到突破的方向，体现真正的价值。',
        translation="Understanding one's limitations is what allows you to find the direction for a breakthrough and demonstrate true value.",
        _sent_zh='了解自己的___，才能找到突破的方向，体现真正的价值。',
        _sent_en="Understanding one's limitations is what allows you to find the direction for a breakthrough and demonstrate true value.",
    ),
    '实现': dict(
        chinese='价值', pinyin='jià zhí',
        english='Value / Worth / Significance',
        part_of_speech='noun',
        example='不断突破自我的局限，是体现一个人真正价值的方式。',
        translation="Continually breaking through one's own limitations is the way to demonstrate a person's true value.",
        _sent_zh='不断突破自我的局限，是体现一个人真正___的方式。',
        _sent_en="Continually breaking through one's own limitations is the way to demonstrate a person's true value.",
    ),
}

with open(PATH, encoding='utf-8') as f:
    data = json.load(f)

# Step 1: remove 成功 (成就 already at hsk5_l15_01)
data['vocabulary'] = [v for v in data['vocabulary'] if v['chinese'] != '成功']
print('  Removed 成功 (成就 already present at hsk5_l15_01)')

# Step 2: apply vocab replacements in-place
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

print(f'\nL15 saved ({len(pool)} non-phrase vocab)')
for v in pool:
    print(f'  [{v["id"]}] {v["chinese"]} — {v["english"]}')
