"""
Update HSK6 Lesson 9 (Social Media & Communication Apps):
- Replace 交流 → 经营
- Replace 便利 → 推动
- Replace 平台 → 宣传
- Replace 软件 → 网红
- Replace 方便 → 注册
Grammar points unchanged.
All sentences use existing lesson vocabulary where possible.
"""
import json, random, re
from pypinyin import lazy_pinyin, Style

PATH = '/Users/irisvitalee/ChineseApp/data/hsk6/hsk6_lesson_9.json'
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
        chinese='经营', pinyin='jīng yíng',
        english='To manage / To run / To operate (a business)',
        part_of_speech='verb',
        example='不少海外华人通过微信经营自己的小生意，轻松联系国内用户。',
        translation='Many overseas Chinese manage their small businesses through WeChat, easily connecting with domestic users.',
        _sent_zh='不少海外华人通过微信___自己的小生意，轻松联系国内用户。',
        _sent_en='Many overseas Chinese manage their small businesses through WeChat, easily connecting with domestic users.',
    ),
    '便利': dict(
        chinese='推动', pinyin='tuī dòng',
        english='To drive / To promote / To push forward',
        part_of_speech='verb',
        example='移动互联网的普及推动了各类社交功能的快速发展。',
        translation='The widespread adoption of mobile internet has driven the rapid development of various social features.',
        _sent_zh='移动互联网的普及___了各类社交功能的快速发展。',
        _sent_en='The widespread adoption of mobile internet has driven the rapid development of various social features.',
    ),
    '平台': dict(
        chinese='宣传', pinyin='xuān chuán',
        english='To publicize / To promote / Publicity',
        part_of_speech='verb/noun',
        example='很多网红通过社交媒体宣传自己的内容，吸引大量用户关注。',
        translation='Many internet celebrities use social media to promote their content and attract a large number of followers.',
        _sent_zh='很多网红通过社交媒体___自己的内容，吸引大量用户关注。',
        _sent_en='Many internet celebrities use social media to promote their content and attract a large number of followers.',
    ),
    '软件': dict(
        chinese='网红', pinyin='wǎng hóng',
        english='Internet celebrity / Online influencer',
        part_of_speech='noun',
        example='很多网红依靠社交功能积累用户，通过直播和宣传扩大影响力。',
        translation='Many internet celebrities build up followers through social features and expand their influence through live streaming and promotion.',
        _sent_zh='很多___依靠社交功能积累用户，通过直播和宣传扩大影响力。',
        _sent_en='Many internet celebrities build up followers through social features and expand their influence through live streaming and promotion.',
    ),
    '方便': dict(
        chinese='注册', pinyin='zhù cè',
        english='To register / Registration / To sign up',
        part_of_speech='verb/noun',
        example='注册账号只需要填写基本信息，步骤简单，几分钟就能完成。',
        translation='Registering an account only requires filling in basic information — the steps are simple and can be completed in a few minutes.',
        # reuse existing 账号 sentence which naturally contains 注册
        _sent_zh='要使用这个软件，首先需要___一个账号。',
        _sent_en='To use this software, you first need to register an account.',
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

print(f'\nL9 saved ({len(pool)} non-phrase vocab)')
for v in pool:
    print(f'  [{v["id"]}] {v["chinese"]} — {v["english"]}')
