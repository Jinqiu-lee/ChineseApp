"""
Replace 告诉 → 通知 in HSK2 L8 vocabulary (slot hsk2_l8_02).
Adds a grammar note comparing 告诉 (informal) vs 通知 (formal).
Keeps the phrase '再告诉你' (hsk2_l8_p07) untouched.
Regenerates mini_exercises for all non-phrase vocab.
"""
import json, random, re
from pypinyin import lazy_pinyin, Style

PATH = '/Users/irisvitalee/ChineseApp/data/hsk2/hsk2_lesson_8.json'
CJK_RE = re.compile(r'[一-鿿]')
random.seed(42)

def text_to_pinyin(text):
    syllables = lazy_pinyin(text, style=Style.TONE)
    return ' '.join(syllables[i] for i, ch in enumerate(text)
                    if CJK_RE.match(ch) and i < len(syllables))

def shuffled4(correct_val, distractors):
    pool = distractors[:3]
    pos = random.randint(0, 3)
    return pool[:pos] + [correct_val] + pool[pos:]

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
    zh_opts = shuffled4(word['chinese'], [d['chinese'] for d in d2])
    zp = {word['chinese']: word['pinyin'], **{d['chinese']: d['pinyin'] for d in d2}}
    fb = {
        "type": "fill_blank",
        "question": f"Fill in: {word['english']}",
        "correct": word['chinese'],
        "options": zh_opts,
        "option_pinyin": [zp.get(o, '') for o in zh_opts],
        "question_chinese": word['_sent_zh'],
        "question_pinyin": word['_sent_zh'],
        "question_english": word['_sent_en']
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

with open(PATH, encoding='utf-8') as f:
    data = json.load(f)

# ── Step 1: replace 告诉 → 通知 in vocabulary ──────────────────────────────
NEW = dict(
    chinese='通知',
    pinyin='tōng zhī',
    english='To notify / To inform (formal)',
    part_of_speech='verb',
    example='老师通知大家明天不上课。',
    translation='The teacher notified everyone that there is no class tomorrow.',
    _sent_zh='老师___大家明天不上课。',
    _sent_en='The teacher notified everyone that there is no class tomorrow.',
)

for v in data['vocabulary']:
    if v['chinese'] == '告诉':
        v['chinese']        = NEW['chinese']
        v['pinyin']         = NEW['pinyin']
        v['english']        = NEW['english']
        v['part_of_speech'] = NEW['part_of_speech']
        v['example']        = NEW['example']
        v['translation']    = NEW['translation']
        v['example_pinyin'] = text_to_pinyin(NEW['example'])
        v['_sent_zh']       = NEW['_sent_zh']
        v['_sent_en']       = NEW['_sent_en']
        print(f"Replaced 告诉 → {v['chinese']}")

# ── Step 2: add 告诉 vs 通知 grammar note ──────────────────────────────────
GRAMMAR_NOTE = {
    "number": len(data['grammar_points']) + 1,
    "title": "告诉 vs 通知 — Informal vs Formal 'To Tell'",
    "explanation": (
        "Both 告诉(gào su) and 通知(tōng zhī) mean 'to tell / to inform', "
        "but they differ in register and context.\n\n"
        "告诉 (informal): used in everyday conversation between people who know each other. "
        "It carries a personal, casual tone.\n"
        "• 你告诉我他去哪儿了。(Tell me where he went.)\n"
        "• 我告诉你一个秘密。(I'll tell you a secret.)\n\n"
        "通知 (formal): used in official or public settings — schools, workplaces, organisations. "
        "The information is typically announced to a group.\n"
        "• 老师通知大家明天不上课。(The teacher notified everyone there is no class tomorrow.)\n"
        "• 公司通知员工下午开会。(The company notified employees of a meeting this afternoon.)\n\n"
        "Quick tip: if you can replace the verb with '告诉朋友', it's casual → 告诉. "
        "If it sounds like an official announcement, use 通知."
    ),
    "examples": [
        {
            "chinese": "你告诉他我来了吗？",
            "pinyin": text_to_pinyin("你告诉他我来了吗"),
            "english": "Did you tell him I came? (informal)"
        },
        {
            "chinese": "老师通知大家明天不上课。",
            "pinyin": text_to_pinyin("老师通知大家明天不上课"),
            "english": "The teacher notified everyone there is no class tomorrow. (formal)"
        },
        {
            "chinese": "妈妈告诉我要好好学习。",
            "pinyin": text_to_pinyin("妈妈告诉我要好好学习"),
            "english": "Mum told me to study hard. (informal)"
        },
        {
            "chinese": "公司通知员工下午开会。",
            "pinyin": text_to_pinyin("公司通知员工下午开会"),
            "english": "The company notified employees of a meeting this afternoon. (formal)"
        }
    ]
}

data['grammar_points'].append(GRAMMAR_NOTE)
print(f"Added grammar note: {GRAMMAR_NOTE['title']}")

# ── Step 3: attach _sent_zh/_sent_en to words that don't have them ─────────
for v in data['vocabulary']:
    if '_sent_zh' not in v:
        ex = v.get('example', '')
        if v['chinese'] in ex:
            v['_sent_zh'] = ex.replace(v['chinese'], '___', 1)
            v['_sent_en'] = v.get('translation', v['english'])
        else:
            v['_sent_zh'] = '___。'
            v['_sent_en'] = v['english']

# ── Step 4: regenerate mini_exercises for all non-phrase vocab ─────────────
pool = [v for v in data['vocabulary'] if v.get('part_of_speech') != 'phrase']
for v in pool:
    v['mini_exercises'] = make_mini(v, pool)
    print(f"  mini_exercises regenerated: {v['chinese']}")

# ── Step 5: clean temp keys and save ──────────────────────────────────────
for v in data['vocabulary']:
    v.pop('_sent_zh', None)
    v.pop('_sent_en', None)

with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print('\nSaved hsk2_lesson_8.json')
