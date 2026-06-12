"""
Replace duplicate words in HSK2 lessons 4-15 as specified.
Keeps dialogues/exercises/grammar_points untouched.
Regenerates mini_exercises for ALL non-phrase vocab in each affected lesson
(pool changes, so distractors need refreshing).

Skipped: L8 告诉 → ??? (replacement not specified by user)
"""
import json, random, re, os
from pypinyin import lazy_pinyin, Style

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
CJK_RE = re.compile(r'[一-鿿]')
random.seed(42)

def text_to_pinyin(text):
    syllables = lazy_pinyin(text, style=Style.TONE)
    return ' '.join(syllables[i] for i, ch in enumerate(text) if CJK_RE.match(ch) and i < len(syllables))

def shuffled4(correct_val, distractors):
    pool = distractors[:3]
    pos = random.randint(0, 3)
    return pool[:pos] + [correct_val] + pool[pos:]

def make_mini(word, pool):
    others = [w for w in pool if w['chinese'] != word['chinese']]
    random.shuffle(others)
    d1 = others[:3]
    eng_opts = shuffled4(word['english'], [d['english'] for d in d1])
    ep = {word['english']: word['pinyin'], **{d['english']: d['pinyin'] for d in d1}}
    mcq_eng = {
        "type": "multiple_choice",
        "question": f"What does {word['chinese']} mean?",
        "correct": word['english'],
        "options": eng_opts,
        "option_pinyin": [ep.get(o, '') for o in eng_opts]
    }

    random.shuffle(others)
    d2 = others[:3]
    sent_zh = word.get('_sent_zh', '___。')
    sent_en = word.get('_sent_en', word['english'])
    zh_opts = shuffled4(word['chinese'], [d['chinese'] for d in d2])
    zp = {word['chinese']: word['pinyin'], **{d['chinese']: d['pinyin'] for d in d2}}
    fb = {
        "type": "fill_blank",
        "question": f"Fill in: {word['english']}",
        "correct": word['chinese'],
        "options": zh_opts,
        "option_pinyin": [zp.get(o, '') for o in zh_opts],
        "question_chinese": sent_zh,
        "question_pinyin": sent_zh,
        "question_english": sent_en
    }

    random.shuffle(others)
    d3 = others[:3]
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

# ── replacement definitions ────────────────────────────────────────────────────
# Key: (lesson_num, old_chinese)
# Value: new vocab fields + _sent_zh / _sent_en for fill_blank template
REPLACEMENTS = {
    (4, '上班'): dict(
        chinese='推荐', pinyin='tuī jiàn',
        english='To recommend / To suggest',
        part_of_speech='verb',
        example='他推荐我来这个公司工作。',
        translation='He recommended me to work at this company.',
        _sent_zh='他___我来这个公司工作。',
        _sent_en='He recommended me to work at this company.',
    ),
    (5, '件'): dict(
        chinese='条', pinyin='tiáo',
        english='[Measure word for long, flexible items e.g. trousers, skirts, fish]',
        part_of_speech='measure word',
        example='她穿了一条裤子。',
        translation='She wore a pair of trousers.',
        _sent_zh='她穿了一___裤子。',
        _sent_en='She wore a pair of trousers.',
    ),
    (5, '颜色'): dict(
        chinese='蓝色', pinyin='lán sè',
        english='Blue',
        part_of_speech='noun',
        example='这件衣服是蓝色的。',
        translation='This piece of clothing is blue.',
        _sent_zh='这件衣服是___的。',
        _sent_en='This piece of clothing is blue.',
    ),
    (6, '再'): dict(
        chinese='好喝', pinyin='hǎo hē',
        english='Delicious (to drink) / Tasty (for drinks)',
        part_of_speech='adjective',
        example='这杯茶真好喝。',
        translation='This cup of tea is really delicious.',
        _sent_zh='这杯茶真___。',
        _sent_en='This cup of tea is really delicious.',
    ),
    (8, '一起'): dict(
        chinese='有意思', pinyin='yǒu yì si',
        english='Interesting / Fun',
        part_of_speech='adjective',
        example='这个故事很有意思。',
        translation='This story is very interesting.',
        _sent_zh='这个故事很___。',
        _sent_en='This story is very interesting.',
    ),
    (9, '非常'): dict(
        chinese='道', pinyin='dào',
        english='[Measure word for questions, dishes, or courses]',
        part_of_speech='measure word',
        example='我做错了两道题。',
        translation='I got two questions wrong.',
        _sent_zh='我做错了两___题。',
        _sent_en='I got two questions wrong.',
    ),
    (9, '已经'): dict(
        chinese='早就', pinyin='zǎo jiù',
        english='Long since / Already (a long time ago)',
        part_of_speech='adverb',
        example='我早就知道这件事了。',
        translation='I already knew about this long ago.',
        _sent_zh='我___知道这件事了。',
        _sent_en='I already knew about this long ago.',
    ),
    (9, '懂'): dict(
        chinese='明白', pinyin='míng bai',
        english='To understand / To be clear about',
        part_of_speech='verb',
        example='你明白了吗？',
        translation='Do you understand?',
        _sent_zh='你___了吗？',
        _sent_en='Do you understand?',
    ),
    (10, '进'): dict(
        chinese='抽屉', pinyin='chōu ti',
        english='Drawer',
        part_of_speech='noun',
        example='手机在桌子的抽屉里。',
        translation='The phone is in the drawer.',
        _sent_zh='手机在桌子的___里。',
        _sent_en='The phone is in the drawer.',
    ),
    (11, '快'): dict(
        chinese='忙', pinyin='máng',
        english='Busy',
        part_of_speech='adjective',
        example='他今天比以前忙。',
        translation='He is busier than before.',
        _sent_zh='他今天比以前___。',
        _sent_en='He is busier than before.',
    ),
    (11, '慢'): dict(
        chinese='闲', pinyin='xián',
        english='Free / Not busy',
        part_of_speech='adjective',
        example='他今天比昨天闲。',
        translation='He is freer than yesterday.',
        _sent_zh='他今天比昨天___。',
        _sent_en='He is freer than yesterday.',
    ),
    (12, '非常'): dict(
        chinese='特别', pinyin='tè bié',
        english='Especially / Particularly',
        part_of_speech='adverb',
        example='今天的天气特别冷。',
        translation='Today the weather is especially cold.',
        _sent_zh='今天的天气___冷。',
        _sent_en='Today the weather is especially cold.',
    ),
    (12, '快'): dict(
        chinese='轻', pinyin='qīng',
        english='Light (in weight)',
        part_of_speech='adjective',
        example='这件衣服很轻。',
        translation='This piece of clothing is very light.',
        _sent_zh='这件衣服很___。',
        _sent_en='This piece of clothing is very light.',
    ),
    (12, '慢'): dict(
        chinese='重', pinyin='zhòng',
        english='Heavy',
        part_of_speech='adjective',
        example='这个箱子很重。',
        translation='This suitcase is very heavy.',
        _sent_zh='这个箱子很___。',
        _sent_en='This suitcase is very heavy.',
    ),
    (13, '门'): dict(
        chinese='空调', pinyin='kōng tiáo',
        english='Air conditioner',
        part_of_speech='noun',
        example='空调开着呢。',
        translation='The air conditioner is on.',
        _sent_zh='___开着呢。',
        _sent_en='The air conditioner is on.',
    ),
    (13, '放'): dict(
        chinese='轻松', pinyin='qīng sōng',
        english='Relaxed / Easy / Carefree',
        part_of_speech='adjective',
        example='休息的时候，他感觉很轻松。',
        translation='When resting, he feels very relaxed.',
        _sent_zh='休息的时候，他感觉很___。',
        _sent_en='When resting, he feels very relaxed.',
    ),
    (14, '非常'): dict(
        chinese='尤其', pinyin='yóu qí',
        english='Especially / Particularly (strong emphasis)',
        part_of_speech='adverb',
        example='他尤其喜欢看电影。',
        translation='He especially likes watching movies.',
        _sent_zh='他___喜欢看电影。',
        _sent_en='He especially likes watching movies.',
    ),
    (14, '觉得'): dict(
        chinese='认为', pinyin='rèn wéi',
        english='To think / To believe / To consider',
        part_of_speech='verb',
        example='我认为这部电影很好看。',
        translation='I think this movie is very good.',
        _sent_zh='我___这部电影很好看。',
        _sent_en='I think this movie is very good.',
    ),
    (15, '一起'): dict(
        chinese='顺利', pinyin='shùn lì',
        english='Smooth / Successful / Going well',
        part_of_speech='adjective',
        example='希望今年一切顺利！',
        translation='I hope everything goes smoothly this year!',
        _sent_zh='希望今年一切___！',
        _sent_en='I hope everything goes smoothly this year!',
    ),
    (15, '再'): dict(
        chinese='庆祝', pinyin='qìng zhù',
        english='To celebrate',
        part_of_speech='verb',
        example='大家一起庆祝新年吧！',
        translation="Let's all celebrate the New Year together!",
        _sent_zh='大家一起___新年吧！',
        _sent_en="Let's all celebrate the New Year together!",
    ),
    (15, '大家'): dict(
        chinese='祝福', pinyin='zhù fú',
        english='To bless / Best wishes / Blessing',
        part_of_speech='noun/verb',
        example='送上我的祝福。',
        translation='I send you my best wishes.',
        _sent_zh='送上我的___。',
        _sent_en='I send you my best wishes.',
    ),
}

# Extra word added to L5 (颜色 → 蓝色 + 绿色, extra entry)
EXTRA_ENTRIES = {
    5: dict(
        id='hsk2_l5_13',
        chinese='绿色', pinyin='lǜ sè',
        english='Green',
        part_of_speech='noun',
        example='我喜欢绿色的衣服。',
        translation='I like green clothes.',
        _sent_zh='我喜欢___的衣服。',
        _sent_en='I like green clothes.',
    ),
}

# ── main processing ────────────────────────────────────────────────────────────

AFFECTED = sorted({k[0] for k in REPLACEMENTS} | set(EXTRA_ENTRIES))

for lesson_num in AFFECTED:
    path = os.path.join(DATA_DIR, f'hsk2_lesson_{lesson_num}.json')
    with open(path, encoding='utf-8') as f:
        data = json.load(f)

    # Step 1: apply replacements to vocab entries
    for v in data['vocabulary']:
        key = (lesson_num, v['chinese'])
        if key in REPLACEMENTS:
            r = REPLACEMENTS[key]
            old = v['chinese']
            v['chinese']          = r['chinese']
            v['pinyin']           = r['pinyin']
            v['english']          = r['english']
            v['part_of_speech']   = r['part_of_speech']
            v['example']          = r['example']
            v['translation']      = r['translation']
            v['example_pinyin']   = text_to_pinyin(r['example'])
            v['_sent_zh']         = r['_sent_zh']
            v['_sent_en']         = r['_sent_en']
            print(f'  L{lesson_num}: {old} → {r["chinese"]}')

    # Step 2: add any extra entries
    if lesson_num in EXTRA_ENTRIES:
        e = EXTRA_ENTRIES[lesson_num]
        # insert before phrases (part_of_speech != 'phrase' entries cluster first)
        new_entry = {
            'id':             e['id'],
            'chinese':        e['chinese'],
            'pinyin':         e['pinyin'],
            'english':        e['english'],
            'part_of_speech': e['part_of_speech'],
            'example':        e['example'],
            'translation':    e['translation'],
            'example_pinyin': text_to_pinyin(e['example']),
            '_sent_zh':       e['_sent_zh'],
            '_sent_en':       e['_sent_en'],
        }
        # find insertion point: after last non-phrase entry
        last_non_phrase = max(i for i, v in enumerate(data['vocabulary'])
                              if v.get('part_of_speech') != 'phrase')
        data['vocabulary'].insert(last_non_phrase + 1, new_entry)
        print(f'  L{lesson_num}: added {e["chinese"]} as {e["id"]}')

    # Step 3: build pool of non-phrase words (includes _sent_zh for existing words)
    # attach _sent_zh/_sent_en to existing words so make_mini can use them
    for v in data['vocabulary']:
        if '_sent_zh' not in v:
            # use existing example sentence, replace the word with ___
            ex = v.get('example', '')
            if v['chinese'] in ex:
                v['_sent_zh'] = ex.replace(v['chinese'], '___', 1)
                v['_sent_en'] = v.get('translation', v['english'])
            else:
                v['_sent_zh'] = f'___。'
                v['_sent_en'] = v['english']

    pool = [v for v in data['vocabulary'] if v.get('part_of_speech') != 'phrase']

    # Step 4: regenerate mini_exercises for all non-phrase vocab
    for v in pool:
        v['mini_exercises'] = make_mini(v, pool)

    # Step 5: clean up temporary keys before saving
    for v in data['vocabulary']:
        v.pop('_sent_zh', None)
        v.pop('_sent_en', None)

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f'L{lesson_num}: saved.')

print('\nDone! (L8 告诉 replacement skipped — target word not specified)')
