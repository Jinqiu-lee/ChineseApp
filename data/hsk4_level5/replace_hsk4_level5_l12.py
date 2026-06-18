"""
Update HSK4 Level 5 Lesson 12 (Character & Personality):
- Replace 诚实 → 品格
- Replace 勇敢 → 品质
- Replace 积极 → 消极 (opposite)
- Add 抱怨, 逃避, 羡慕, 嫉妒
Grammar points unchanged.
All sentences use existing lesson vocabulary.
"""
import json, random, re
from pypinyin import lazy_pinyin, Style

PATH = '/Users/irisvitalee/ChineseApp/data/hsk4_level5/hsk5_lesson_12.json'
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
    '诚实': dict(
        chinese='品格', pinyin='pǐn gé',
        english='Character / Moral character / Personal integrity',
        part_of_speech='noun',
        example='谦虚、善良和负责任，是一个人良好品格的体现。',
        translation='Modesty, kindness, and responsibility are the embodiment of a person\'s good character.',
        _sent_zh='谦虚、善良和负责任，是一个人良好___的体现。',
        _sent_en='Modesty, kindness, and responsibility are the embodiment of a person\'s good character.',
    ),
    '勇敢': dict(
        chinese='品质', pinyin='pǐn zhì',
        english='Quality / Character trait / Virtue',
        part_of_speech='noun',
        example='坚强和自信是面对困难时最重要的品质。',
        translation='Resilience and confidence are the most important qualities when facing difficulties.',
        _sent_zh='坚强和自信是面对困难时最重要的___。',
        _sent_en='Resilience and confidence are the most important qualities when facing difficulties.',
    ),
    '积极': dict(
        chinese='消极', pinyin='xiāo jí',
        english='Negative / Pessimistic / Passive',
        part_of_speech='adjective',
        example='与其保持消极的态度，不如培养乐观和坚强的品质。',
        translation='Rather than maintaining a negative attitude, it is better to cultivate optimistic and resilient qualities.',
        _sent_zh='与其保持___的态度，不如培养乐观和坚强的品质。',
        _sent_en='Rather than maintaining a negative attitude, it is better to cultivate optimistic and resilient qualities.',
    ),
}

EXTRA = [
    dict(id='hsk5_l12_13', chinese='抱怨', pinyin='bào yuàn',
         english='To complain / Complaint',
         part_of_speech='verb/noun',
         example='无论遇到什么困难，都应该避免抱怨，保持乐观和坚强的心态。',
         translation='No matter what difficulties you face, you should avoid complaining and maintain an optimistic and resilient mindset.',
         _sent_zh='无论遇到什么困难，都应该避免___，保持乐观和坚强的心态。',
         _sent_en='No matter what difficulties you face, you should avoid complaining and maintain an optimistic and resilient mindset.'),
    dict(id='hsk5_l12_14', chinese='逃避', pinyin='táo bì',
         english='To evade / To avoid / To run away from',
         part_of_speech='verb',
         example='一个有品格的人，无论如何都不会逃避自己的责任。',
         translation='A person of good character will never evade their responsibilities, no matter what.',
         _sent_zh='一个有品格的人，无论如何都不会___自己的责任。',
         _sent_en='A person of good character will never evade their responsibilities, no matter what.'),
    dict(id='hsk5_l12_15', chinese='羡慕', pinyin='xiàn mù',
         english='To envy / To admire / Envy',
         part_of_speech='verb/noun',
         example='与其羡慕别人的品质，不如努力培养自己的品格。',
         translation='Rather than envying others\' qualities, it is better to work hard to cultivate your own character.',
         _sent_zh='与其___别人的品质，不如努力培养自己的品格。',
         _sent_en='Rather than envying others\' qualities, it is better to work hard to cultivate your own character.'),
    dict(id='hsk5_l12_16', chinese='嫉妒', pinyin='jí dù',
         english='Jealous / To be jealous / Jealousy',
         part_of_speech='verb/noun',
         example='嫉妒和抱怨都是消极的情绪，只会影响自己的心态和品格。',
         translation='Jealousy and complaining are both negative emotions that only affect one\'s own mindset and character.',
         _sent_zh='___和抱怨都是消极的情绪，只会影响自己的心态和品格。',
         _sent_en='Jealousy and complaining are both negative emotions that only affect one\'s own mindset and character.'),
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

print(f'\nL12 saved ({len(pool)} non-phrase vocab)')
for v in pool:
    print(f'  [{v["id"]}] {v["chinese"]} — {v["english"]}')
