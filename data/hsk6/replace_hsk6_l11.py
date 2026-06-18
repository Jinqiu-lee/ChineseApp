"""
Update HSK6 Lesson 11 (Weight & Diet):
- Replace 体重 → 总共
- Replace 节食 → 现象
- Replace 减肥 → 控制
- Replace 均衡 → 采取
- Replace 合理 → 热量
- Replace 营养 → 措施
- Replace 危险 → 极端
- 坚持 not found in L11 vocab — skipped
Grammar points unchanged.
All sentences use existing lesson vocabulary where possible.
"""
import json, random, re
from pypinyin import lazy_pinyin, Style

PATH = '/Users/irisvitalee/ChineseApp/data/hsk6/hsk6_lesson_11.json'
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
    '体重': dict(
        chinese='总共', pinyin='zǒng gòng',
        english='In total / Altogether / In all',
        part_of_speech='adverb',
        example='这套健康计划总共分三个阶段，每个阶段采取不同的控制措施。',
        translation='This health plan is divided into three phases in total, with different control measures adopted at each phase.',
        _sent_zh='这套健康计划___分三个阶段，每个阶段采取不同的控制措施。',
        _sent_en='This health plan is divided into three phases in total, with different control measures adopted at each phase.',
    ),
    '节食': dict(
        chinese='现象', pinyin='xiàn xiàng',
        english='Phenomenon / Occurrence / Situation',
        part_of_speech='noun',
        example='过度节食是一种危险的现象，容易导致身体能量不足，引发极端的健康问题。',
        translation='Excessive dieting is a dangerous phenomenon that easily leads to insufficient body energy and triggers extreme health problems.',
        _sent_zh='过度节食是一种危险的___，容易导致身体能量不足，引发极端的健康问题。',
        _sent_en='Excessive dieting is a dangerous phenomenon that easily leads to insufficient body energy and triggers extreme health problems.',
    ),
    '减肥': dict(
        chinese='控制', pinyin='kòng zhì',
        english='To control / To manage / Control',
        part_of_speech='verb/noun',
        example='科学地控制饮食，并配合适量运动，才是长期保持健康的关键。',
        translation='Scientifically controlling diet combined with moderate exercise is the key to maintaining health long-term.',
        # existing 摄入 sentence naturally contains 控制 — reuse it
        _sent_zh='减肥期间应该___热量的摄入，但不能完全不吃碳水化合物。',
        _sent_en='During weight loss, you should control calorie intake, but you cannot avoid carbohydrates entirely.',
    ),
    '均衡': dict(
        chinese='采取', pinyin='cǎi qǔ',
        english='To adopt / To take (measures) / To employ',
        part_of_speech='verb',
        example='面对极端节食的现象，专家建议采取科学合理的控制措施。',
        translation='Faced with the phenomenon of extreme dieting, experts advise adopting scientifically sound control measures.',
        _sent_zh='面对极端节食的现象，专家建议___科学合理的控制措施。',
        _sent_en='Faced with the phenomenon of extreme dieting, experts advise adopting scientifically sound control measures.',
    ),
    '合理': dict(
        chinese='热量', pinyin='rè liàng',
        english='Calories / Heat energy / Caloric value',
        part_of_speech='noun',
        example='每餐适量进食，既能满足身体所需的热量，又不会导致过剩。',
        translation="Eating moderate amounts at each meal both meets the body's calorie needs and prevents excess.",
        _sent_zh='每餐适量进食，既能满足身体所需的___，又不会导致过剩。',
        _sent_en="Eating moderate amounts at each meal both meets the body's calorie needs and prevents excess.",
    ),
    '营养': dict(
        chinese='措施', pinyin='cuò shī',
        english='Measure / Step / Action (to address a problem)',
        part_of_speech='noun',
        example='为了控制热量过剩的现象，采取科学的饮食措施十分必要。',
        translation='To control the phenomenon of excess calories, adopting scientific dietary measures is very necessary.',
        _sent_zh='为了控制热量过剩的现象，采取科学的饮食___十分必要。',
        _sent_en='To control the phenomenon of excess calories, adopting scientific dietary measures is very necessary.',
    ),
    '危险': dict(
        chinese='极端', pinyin='jí duān',
        english='Extreme / Extremity / Radical',
        part_of_speech='adjective/noun',
        example='极端的节食行为不仅无法持续，还会对身体的代谢和能量平衡造成严重损害。',
        translation="Extreme dieting behaviors are not only unsustainable but also cause serious damage to the body's metabolism and energy balance.",
        # existing 危险 example already uses 极端 as modifier — reuse
        _sent_zh='___节食对身体存在很大的危险，尤其是对正在发育的青少年。',
        _sent_en='Extreme dieting poses serious risks to the body, especially for teenagers who are still developing.',
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

print(f'\nL11 saved ({len(pool)} non-phrase vocab)')
for v in pool:
    print(f'  [{v["id"]}] {v["chinese"]} — {v["english"]}')
