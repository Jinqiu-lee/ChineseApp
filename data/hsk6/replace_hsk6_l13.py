"""
Update HSK6 Lesson 13 (Art Appreciation):
- Replace 风格 → 技巧
- Replace 理解 → 理念
- Replace 欣赏 → 涂鸦
- Replace 创作 → 想象力
- Replace 感受 → 解读
- Replace 表达 → 空白
Grammar points unchanged.
Note: existing 创作 example "艺术创作需要想象力，也需要技巧" is reused for
      both 技巧 and 想象力 fill_blank questions.
All sentences use existing lesson vocabulary where possible.
"""
import json, random, re
from pypinyin import lazy_pinyin, Style

PATH = '/Users/irisvitalee/ChineseApp/data/hsk6/hsk6_lesson_13.json'
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
    '风格': dict(
        chinese='技巧', pinyin='jì qiǎo',
        english='Technique / Skill / Craft',
        part_of_speech='noun',
        example='掌握一定的绘画技巧，有助于更自由地表达自己的想象力和审美理念。',
        translation='Mastering certain painting techniques helps one more freely express their imagination and aesthetic concepts.',
        # reuse existing 创作 sentence that contains both 技巧 and 想象力
        _sent_zh='艺术创作需要想象力，也需要___。',
        _sent_en='Artistic creation requires imagination as well as technique.',
    ),
    '理解': dict(
        chinese='理念', pinyin='lǐ niàn',
        english='Concept / Philosophy / Guiding idea',
        part_of_speech='noun',
        example='不同艺术家的创作理念各不相同，正是这种差异造就了艺术的多样性。',
        translation="The creative concepts of different artists vary greatly, and it is precisely this difference that creates art's diversity.",
        _sent_zh='不同艺术家的创作___各不相同，正是这种差异造就了艺术的多样性。',
        _sent_en="The creative concepts of different artists vary greatly, and it is precisely this difference that creates art's diversity.",
    ),
    '欣赏': dict(
        chinese='涂鸦', pinyin='tú yā',
        english='Graffiti / To doodle / Street art',
        part_of_speech='noun/verb',
        example='街头涂鸦是一种充满想象力的艺术形式，能够传达艺术家独特的审美理念。',
        translation="Street graffiti is an imaginative art form that can convey the artist's unique aesthetic concepts.",
        _sent_zh='街头___是一种充满想象力的艺术形式，能够传达艺术家独特的审美理念。',
        _sent_en="Street graffiti is an imaginative art form that can convey the artist's unique aesthetic concepts.",
    ),
    '创作': dict(
        chinese='想象力', pinyin='xiǎng xiàng lì',
        english='Imagination / Creative imagination',
        part_of_speech='noun',
        example='丰富的想象力是艺术创作的核心，能让作品超越现实的限制。',
        translation='Rich imagination is the core of artistic creation, allowing works to transcend the limitations of reality.',
        # reuse existing sentence, blanking 想象力
        _sent_zh='艺术创作需要___，也需要技巧。',
        _sent_en='Artistic creation requires imagination as well as technique.',
    ),
    '感受': dict(
        chinese='解读', pinyin='jiě dú',
        english='Interpretation / To interpret / To read (meaning)',
        part_of_speech='verb/noun',
        example='每个人对同一件艺术品的解读都不同，这正是艺术的魅力所在。',
        translation="Each person's interpretation of the same work of art is different — this is precisely where the charm of art lies.",
        _sent_zh='每个人对同一件艺术品的___都不同，这正是艺术的魅力所在。',
        _sent_en="Each person's interpretation of the same work of art is different — this is precisely where the charm of art lies.",
    ),
    '表达': dict(
        chinese='空白', pinyin='kōng bái',
        english='Blank space / Empty space / White space',
        part_of_speech='noun/adjective',
        example='画面中的空白并非无意义，而是艺术家刻意留下的想象空间。',
        translation='The blank space in a painting is not meaningless — it is the imaginative space deliberately left by the artist.',
        _sent_zh='画面中的___并非无意义，而是艺术家刻意留下的想象空间。',
        _sent_en='The blank space in a painting is not meaningless — it is the imaginative space deliberately left by the artist.',
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

print(f'\nL13 saved ({len(pool)} non-phrase vocab)')
for v in pool:
    print(f'  [{v["id"]}] {v["chinese"]} — {v["english"]}')
