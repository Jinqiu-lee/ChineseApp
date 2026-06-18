"""
Update HSK6 Lesson 1 (Love & Relationships – Details):
- Replace 细节 → 亲密
- Replace 体贴 → 不耐烦
- Replace 偶尔 → 时不时
- Replace 珍惜 → 爱护
- Replace 感受 → 氛围
- Replace 表达 → 行动
Grammar points unchanged.
All sentences use existing lesson vocabulary where possible.
"""
import json, random, re
from pypinyin import lazy_pinyin, Style

PATH = '/Users/irisvitalee/ChineseApp/data/hsk6/hsk6_lesson_1.json'
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
    '细节': dict(
        chinese='亲密', pinyin='qīn mì',
        english='Close / Intimate / Intimacy',
        part_of_speech='adjective/noun',
        example='多年的相处让他们变得越来越亲密，彼此之间有一种无需言说的默契。',
        translation='Years of being together made them closer and closer, developing an unspoken tacit understanding between them.',
        _sent_zh='多年的相处让他们变得越来越___，彼此之间有一种无需言说的默契。',
        _sent_en='Years of being together made them closer and closer, developing an unspoken tacit understanding between them.',
    ),
    '体贴': dict(
        chinese='不耐烦', pinyin='bù nài fán',
        english='Impatient / Fed up / Exasperated',
        part_of_speech='adjective',
        example='她时不时会有些不耐烦，但他总是温馨地陪伴在身旁，让她感到安心。',
        translation='She would occasionally feel impatient, but he would always warmly stay by her side, making her feel at ease.',
        _sent_zh='她时不时会有些___，但他总是温馨地陪伴在身旁，让她感到安心。',
        _sent_en='She would occasionally feel impatient, but he would always warmly stay by her side, making her feel at ease.',
    ),
    '偶尔': dict(
        chinese='时不时', pinyin='shí bu shí',
        english='From time to time / Now and then / Occasionally',
        part_of_speech='adverb',
        example='他时不时会给她发来一条温馨的消息，让她感到亲密而温暖。',
        translation='From time to time, he would send her a warm message, making her feel close and loved.',
        _sent_zh='他___会给她发来一条温馨的消息，让她感到亲密而温暖。',
        _sent_en='From time to time, he would send her a warm message, making her feel close and loved.',
    ),
    '珍惜': dict(
        chinese='爱护', pinyin='ài hù',
        english='To cherish / To care for / To protect',
        part_of_speech='verb',
        example='他用行动爱护这段感情，让她感到非常温馨。',
        translation='He cherished this relationship through his actions, making her feel very warm.',
        _sent_zh='他用行动___这段感情，让她感到非常温馨。',
        _sent_en='He cherished this relationship through his actions, making her feel very warm.',
    ),
    '感受': dict(
        chinese='氛围', pinyin='fēn wéi',
        english='Atmosphere / Ambience / Mood',
        part_of_speech='noun',
        example='温馨的家庭氛围，让这对夫妻之间更加亲密默契。',
        translation='The warm family atmosphere made this couple even closer and more in sync with each other.',
        _sent_zh='温馨的家庭___，让这对夫妻之间更加亲密默契。',
        _sent_en='The warm family atmosphere made this couple even closer and more in sync with each other.',
    ),
    '表达': dict(
        chinese='行动', pinyin='xíng dòng',
        english='Action / To act / Conduct',
        part_of_speech='noun/verb',
        example='他不善于用语言倾诉，但他的行动总是让她感到亲密与温馨。',
        translation='He is not good at expressing feelings in words, but his actions always make her feel close and warm.',
        _sent_zh='他不善于用语言倾诉，但他的___总是让她感到亲密与温馨。',
        _sent_en='He is not good at expressing feelings in words, but his actions always make her feel close and warm.',
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

print(f'\nL1 saved ({len(pool)} non-phrase vocab)')
for v in pool:
    print(f'  [{v["id"]}] {v["chinese"]} — {v["english"]}')
