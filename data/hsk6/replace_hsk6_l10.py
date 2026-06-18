"""
Update HSK6 Lesson 10 (Digital Economy & WeChat):
- Replace 交流 → 企业
- Replace 便利 → 高级
- Replace 平台 → 应用
- Replace 支付 → 开发
- Replace 影响 → 业务
Grammar points unchanged (none defined for L10).
All sentences use existing lesson vocabulary where possible.
"""
import json, random, re
from pypinyin import lazy_pinyin, Style

PATH = '/Users/irisvitalee/ChineseApp/data/hsk6/hsk6_lesson_10.json'
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
    '交流': dict(
        chinese='企业', pinyin='qǐ yè',
        english='Enterprise / Company / Business',
        part_of_speech='noun',
        example='越来越多的企业利用社交媒体推广自己的产品，开拓全球市场。',
        translation='More and more companies use social media to promote their products and expand into global markets.',
        _sent_zh='越来越多的___利用社交媒体推广自己的产品，开拓全球市场。',
        _sent_en='More and more companies use social media to promote their products and expand into global markets.',
    ),
    '便利': dict(
        chinese='高级', pinyin='gāo jí',
        english='Advanced / High-level / Senior',
        part_of_speech='adjective',
        example='这款应用的高级功能需要付费开通，普通用户只能使用基本功能。',
        translation='The advanced features of this application require payment to activate; regular users can only access basic functions.',
        _sent_zh='这款应用的___功能需要付费开通，普通用户只能使用基本功能。',
        _sent_en='The advanced features of this application require payment to activate; regular users can only access basic functions.',
    ),
    '平台': dict(
        chinese='应用', pinyin='yìng yòng',
        english='Application / App / To apply',
        part_of_speech='noun/verb',
        example='这款应用整合了多种高级功能，企业用户可以直接通过它开展业务。',
        translation='This application integrates multiple advanced features, allowing enterprise users to conduct business directly through it.',
        _sent_zh='这款___整合了多种高级功能，企业用户可以直接通过它开展业务。',
        _sent_en='This application integrates multiple advanced features, allowing enterprise users to conduct business directly through it.',
    ),
    '支付': dict(
        chinese='开发', pinyin='kāi fā',
        english='To develop / Development / To build (software)',
        part_of_speech='verb/noun',
        example='这家企业花费数年时间开发了一款专注于全球业务的应用。',
        translation='This company spent several years developing an application focused on global business.',
        _sent_zh='这家企业花费数年时间___了一款专注于全球业务的应用。',
        _sent_en='This company spent several years developing an application focused on global business.',
    ),
    '影响': dict(
        chinese='业务', pinyin='yè wù',
        english='Business operations / Work / Services',
        part_of_speech='noun',
        example='企业通过开发新的应用功能，不断拓展自己的全球业务。',
        translation='Companies continuously expand their global business by developing new application features.',
        _sent_zh='企业通过开发新的应用功能，不断拓展自己的全球___。',
        _sent_en='Companies continuously expand their global business by developing new application features.',
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

print(f'\nL10 saved ({len(pool)} non-phrase vocab)')
for v in pool:
    print(f'  [{v["id"]}] {v["chinese"]} — {v["english"]}')
