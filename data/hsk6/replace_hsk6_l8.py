"""
Update HSK6 Lesson 8 (Waking Up & Sleep Quality):
- Replace 压力 → 享受
- Replace 质量 → 失眠
- Replace 方式 → 情绪
- Replace 依赖 → 刺耳
- REMOVE 改善 (精神 already exists at hsk6_l8_16)
Grammar points unchanged.
All sentences use existing lesson vocabulary where possible.
"""
import json, random, re
from pypinyin import lazy_pinyin, Style

PATH = '/Users/irisvitalee/ChineseApp/data/hsk6/hsk6_lesson_8.json'
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
    '压力': dict(
        chinese='享受', pinyin='xiǎng shòu',
        english='To enjoy / Enjoyment / To savour',
        part_of_speech='verb/noun',
        example='自然醒来的早晨，让人真正享受一天的开始，精神状态也更好。',
        translation='Waking up naturally allows you to truly enjoy the start of the day, and your mental state is much better too.',
        _sent_zh='自然醒来的早晨，让人真正___一天的开始，精神状态也更好。',
        _sent_en='Waking up naturally allows you to truly enjoy the start of the day, and your mental state is much better too.',
    ),
    '质量': dict(
        chinese='失眠', pinyin='shī mián',
        english='Insomnia / To have insomnia / Sleeplessness',
        part_of_speech='noun/verb',
        example='长期情绪低落会导致失眠，严重影响第二天的精神状态。',
        translation="Prolonged low mood can lead to insomnia, severely affecting the next day's mental energy.",
        _sent_zh='长期情绪低落会导致___，严重影响第二天的精神状态。',
        _sent_en="Prolonged low mood can lead to insomnia, severely affecting the next day's mental energy.",
    ),
    '方式': dict(
        chinese='情绪', pinyin='qíng xù',
        english='Emotion / Mood / Feelings',
        part_of_speech='noun',
        example='睡眠不足容易引起情绪波动，也会影响白天的精神状态。',
        translation="Insufficient sleep easily causes emotional fluctuations and affects one's mental energy during the day.",
        _sent_zh='睡眠不足容易引起___波动，也会影响白天的精神状态。',
        _sent_en="Insufficient sleep easily causes emotional fluctuations and affects one's mental energy during the day.",
    ),
    '依赖': dict(
        chinese='刺耳', pinyin='cì ěr',
        english='Harsh-sounding / Grating / Jarring to the ears',
        part_of_speech='adjective',
        # reuse existing 温和 sentence which naturally contrasts 刺耳
        example='刺耳的闹铃声会让人从深度睡眠中突然惊醒，引起强烈的刺激反应。',
        translation='A harsh alarm sound can jolt a person awake from deep sleep, triggering a strong stress response.',
        _sent_zh='用温和的音乐代替___的闹铃，起床会更舒服。',
        _sent_en='Using gentle music instead of a harsh alarm makes waking up more comfortable.',
    ),
}

with open(PATH, encoding='utf-8') as f:
    data = json.load(f)

# Step 1: remove 改善 (精神 already at hsk6_l8_16)
data['vocabulary'] = [v for v in data['vocabulary'] if v['chinese'] != '改善']
print('  Removed 改善 (精神 already present at hsk6_l8_16)')

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

print(f'\nL8 saved ({len(pool)} non-phrase vocab)')
for v in pool:
    print(f'  [{v["id"]}] {v["chinese"]} — {v["english"]}')
