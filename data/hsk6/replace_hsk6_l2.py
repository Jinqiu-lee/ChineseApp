"""
Update HSK6 Lesson 2 (Relationships – Support & Conflict):
- Replace 包容 → 肩膀
- Replace 原来 → 吵架
- Replace 竟然 → 轮（到）
- Replace 浪漫 → 尴尬
- Replace 自然 → 香菜
Grammar points unchanged.
All sentences use existing lesson vocabulary where possible.
"""
import json, random, re
from pypinyin import lazy_pinyin, Style

PATH = '/Users/irisvitalee/ChineseApp/data/hsk6/hsk6_lesson_2.json'
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
    '包容': dict(
        chinese='肩膀', pinyin='jiān bǎng',
        english='Shoulder',
        part_of_speech='noun',
        example='她有些委屈，他没说什么，只是悄悄把肩膀靠近她，让她感到无比安慰。',
        translation="She felt a little wronged; he didn't say anything, but quietly leaned his shoulder toward her, making her feel deeply comforted.",
        _sent_zh='她有些委屈，他没说什么，只是悄悄把___靠近她，让她感到无比安慰。',
        _sent_en="She felt a little wronged; he didn't say anything, but quietly leaned his shoulder toward her, making her feel deeply comforted.",
    ),
    '原来': dict(
        chinese='吵架', pinyin='chǎo jià',
        english='To quarrel / To argue / To fight',
        part_of_speech='verb',
        example='两人偶尔会吵架，但每次摩擦之后，他们都会更加真诚地理解彼此。',
        translation='The two would occasionally quarrel, but after each friction, they would understand each other more sincerely.',
        _sent_zh='两人偶尔会___，但每次摩擦之后，他们都会更加真诚地理解彼此。',
        _sent_en='The two would occasionally quarrel, but after each friction, they would understand each other more sincerely.',
    ),
    '竟然': dict(
        chinese='轮（到）', pinyin='lún (dào)',
        english="It's one's turn / To take turns / To rotate",
        part_of_speech='verb',
        example='今天轮到她了，她特意为他准备了一顿心意满满的晚餐，两人都很感激彼此。',
        translation='Today it was her turn, so she specially prepared a heartfelt dinner for him, and both were grateful for each other.',
        _sent_zh='今天___她了，她特意为他准备了一顿心意满满的晚餐，两人都很感激彼此。',
        _sent_en='Today it was her turn, so she specially prepared a heartfelt dinner for him, and both were grateful for each other.',
    ),
    '浪漫': dict(
        chinese='尴尬', pinyin='gān gà',
        english='Awkward / Embarrassed / Embarrassing',
        part_of_speech='adjective',
        example='两人之间出现了一段沉默，气氛有些尴尬，但他真诚地道了歉，心情才慢慢平静下来。',
        translation='There was a moment of silence between them and the atmosphere grew a little awkward, but he sincerely apologized and her mood gradually calmed down.',
        _sent_zh='两人之间出现了一段沉默，气氛有些___，但他真诚地道了歉，心情才慢慢平静下来。',
        _sent_en='There was a moment of silence between them and the atmosphere grew a little awkward, but he sincerely apologized and her mood gradually calmed down.',
    ),
    '自然': dict(
        chinese='香菜', pinyin='xiāng cài',
        english='Cilantro / Coriander / Chinese parsley',
        part_of_speech='noun',
        example='他知道她不喜欢香菜，每次点菜时总会叮嘱一下，这份关心让她感到非常感激。',
        translation="He knew she didn't like cilantro, so every time they ordered food he would remind the staff — this consideration made her feel very grateful.",
        _sent_zh='他知道她不喜欢___，每次点菜时总会叮嘱一下，这份关心让她感到非常感激。',
        _sent_en="He knew she didn't like cilantro, so every time they ordered food he would remind the staff — this consideration made her feel very grateful.",
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

print(f'\nL2 saved ({len(pool)} non-phrase vocab)')
for v in pool:
    print(f'  [{v["id"]}] {v["chinese"]} — {v["english"]}')
