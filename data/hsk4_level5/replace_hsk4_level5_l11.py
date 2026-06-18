"""
Update HSK4 Level 5 Lesson 11 (Arts & Culture):
- Replace 艺术 → 擅长
- Replace 表演 → 传承
- Add 并且 (hsk5_l11_13)
- Replace GP1 值得 → 并且
- Replace GP2 不但…而且… → 再…也…
- Replace GP3 通过 → 对于
All sentences use existing lesson vocabulary.
"""
import json, random, re
from pypinyin import lazy_pinyin, Style

PATH = '/Users/irisvitalee/ChineseApp/data/hsk4_level5/hsk5_lesson_11.json'
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

# ── Vocabulary replacements ───────────────────────────────────────────────────
REPLACEMENTS = {
    '艺术': dict(
        chinese='擅长', pinyin='shàn cháng',
        english='To be skilled in / To be good at / To excel at',
        part_of_speech='verb',
        example='她擅长创作民间风格的作品，每一件都受到了观众的欣赏。',
        translation='She excels at creating works in a folk style, and each piece is appreciated by the audience.',
        _sent_zh='她___创作民间风格的作品，每一件都受到了观众的欣赏。',
        _sent_en='She excels at creating works in a folk style, and each piece is appreciated by the audience.',
    ),
    '表演': dict(
        chinese='传承', pinyin='chuán chéng',
        english='To pass down / To inherit / To transmit; inheritance',
        part_of_speech='verb/noun',
        example='博物馆举办展览，帮助人们传承珍贵的文化遗产。',
        translation='Museums hold exhibitions to help people pass down precious cultural heritage.',
        _sent_zh='博物馆举办展览，帮助人们___珍贵的文化遗产。',
        _sent_en='Museums hold exhibitions to help people pass down precious cultural heritage.',
    ),
}

EXTRA = [
    dict(id='hsk5_l11_13', chinese='并且', pinyin='bìng qiě',
         english='Moreover / And also / Furthermore',
         part_of_speech='conjunction',
         example='他擅长传统绘画，并且对雕塑创作也很感兴趣。',
         translation='He excels at traditional painting and is also very interested in sculpture.',
         _sent_zh='他擅长传统绘画，___对雕塑创作也很感兴趣。',
         _sent_en='He excels at traditional painting and is also very interested in sculpture.'),
]

# ── Grammar Point 1: 并且 ──────────────────────────────────────────────────────
GP1 = {
    'number': 1,
    'title': '并且 — Moreover; and also; furthermore',
    'explanation': (
        '并且 is a conjunction meaning "moreover", "and also", or "furthermore". '
        'It connects two clauses or elements to add information, showing that both '
        'points are true simultaneously. Unlike 但是 (contrast) or 因为 (cause), '
        '并且 is purely additive.\n\n'
        'Structures:\n'
        '• Subject + clause 1 + 并且 + clause 2\n'
        '• Clause 1 + 并且 + clause 2 (different or same subjects)\n\n'
        '• 他擅长传统绘画，并且在雕塑创作方面也有很高的造诣。\n'
        '  (He excels at traditional painting and is also highly accomplished in sculpture.)\n'
        '• 民间文化遗产需要传承，并且要让更多年轻人了解和欣赏。\n'
        '  (Folk cultural heritage needs to be passed down, and moreover, more young people need to appreciate it.)\n\n'
        'Notes:\n'
        '• 并且 is more formal than 也 and slightly more emphatic than 而且\n'
        '• The second clause introduced by 并且 often carries additional weight or importance\n'
        '• Both clauses share a common direction — they reinforce, not contradict, each other'
    ),
    'examples': [
        {
            'chinese': '他擅长传统绘画，并且在雕塑创作方面也有很高的造诣。',
            'pinyin': py('他擅长传统绘画并且在雕塑创作方面也有很高的造诣'),
            'english': 'He excels at traditional painting and is also highly accomplished in sculpture.'
        },
        {
            'chinese': '博物馆的展览内容丰富，并且吸引了许多热爱文化遗产的观众。',
            'pinyin': py('博物馆的展览内容丰富并且吸引了许多热爱文化遗产的观众'),
            'english': "The museum's exhibition is rich in content and has also attracted many audiences who love cultural heritage."
        },
        {
            'chinese': '这位艺术家的作品风格独特，并且受到了广大观众的欣赏。',
            'pinyin': py('这位艺术家的作品风格独特并且受到了广大观众的欣赏'),
            'english': "This artist's works have a unique style and have also been appreciated by a wide audience."
        },
    ],
    'exercises': [
        {
            'question': '这次博物馆展览内容精彩，___吸引了很多民间文化爱好者。',
            'type': 'multiple_choice',
            'correct': '并且',
            'options': ['并且', '但是', '虽然', '因为'],
            'option_pinyin': ['bìng qiě', 'dàn shì', 'suī rán', 'yīn wèi'],
            'word_hints': {'博物馆': 'bó wù guǎn', '展览': 'zhǎn lǎn'}
        },
        {
            'question': 'Which sentence correctly uses 并且?',
            'type': 'multiple_choice',
            'correct': '他的作品风格独特，并且每一件都受到了观众的高度欣赏。',
            'options': [
                '他的作品风格独特，并且每一件都受到了观众的高度欣赏。',
                '并且他的作品风格独特，每一件都受到了观众高度欣赏。',
                '他的作品风格独特并且，每一件都高度欣赏观众了。',
                '观众高度欣赏并且，他的作品风格独特每一件。'
            ],
            'option_pinyin': [
                py('他的作品风格独特并且每一件都受到了观众的高度欣赏'),
                '', '', ''
            ],
            'word_hints': {'作品': 'zuò pǐn', '欣赏': 'xīn shǎng'}
        },
        {
            'question': 'What does 并且 express?',
            'type': 'multiple_choice',
            'correct': 'Moreover; and also — adds a second fact or quality to the first (additive, not contrasting)',
            'options': [
                'Moreover; and also — adds a second fact or quality to the first (additive, not contrasting)',
                'Although; even though — introduces a concession',
                'Because; therefore — introduces a cause and result',
                'No matter how — introduces a condition that cannot change the result'
            ],
            'option_pinyin': ['', '', '', ''],
            'word_hints': {}
        },
    ],
    'mini_exercises': [
        {
            'type': 'multiple_choice',
            'question': '并且 means...',
            'correct': 'Moreover; and also — adds a second point that reinforces the first (additive relationship)',
            'options': [
                'Moreover; and also — adds a second point that reinforces the first (additive relationship)',
                'However; but — introduces a contrast to the first point',
                'Because — introduces the reason for the first point',
                'No matter — introduces a condition regardless of the result'
            ],
            'option_pinyin': ['bìng qiě', '', '', '']
        },
        {
            'type': 'fill_blank',
            'question': "Fill in: The museum's exhibition is wonderful and has also attracted many visitors.",
            'correct': '并且',
            'options': ['并且', '但是', '虽然', '所以'],
            'option_pinyin': ['bìng qiě', 'dàn shì', 'suī rán', 'suǒ yǐ'],
            'question_chinese': '博物馆的展览内容精彩，___吸引了很多热爱文化遗产的观众。',
            'question_pinyin': '博物馆的展览内容精彩，___吸引了很多热爱文化遗产的观众。',
            'question_english': "The museum's exhibition is wonderful and has also attracted many visitors who love cultural heritage."
        },
        {
            'type': 'multiple_choice',
            'question': 'Which sentence correctly uses 并且?',
            'correct': '她擅长创作传统风格的作品，并且对文化遗产的传承也很有热情。',
            'options': [
                '她擅长创作传统风格的作品，并且对文化遗产的传承也很有热情。',
                '并且她擅长，创作传统风格的作品文化遗产传承热情。',
                '文化遗产传承并且，她擅长创作传统风格作品热情。',
                '她创作传统风格并且，作品文化遗产传承擅长热情。'
            ],
            'option_pinyin': [
                py('她擅长创作传统风格的作品并且对文化遗产的传承也很有热情'),
                '', '', ''
            ]
        }
    ]
}

# ── Grammar Point 2: 再…也… ────────────────────────────────────────────────────
GP2 = {
    'number': 2,
    'title': '再…也… — No matter how… still…',
    'explanation': (
        '再…也… expresses that even under an extreme degree or condition, the result in the '
        'main clause remains unchanged. 再 introduces the degree (how adj/adv something is), '
        'and 也 introduces the result that holds regardless.\n\n'
        'Structures:\n'
        '• 再 + adjective + 也 + verb phrase\n'
        '• 再 + adverb + verb + 也 + verb phrase\n'
        '• 再 + adjective + 的 + noun + 也 + verb phrase\n\n'
        '• 再有才华的艺术家，也需要长期创作才能形成独特的风格。\n'
        '  (No matter how talented an artist is, they still need long-term creative work to develop their unique style.)\n'
        '• 这件雕塑再精美，也需要认真传承才能流传后世。\n'
        '  (No matter how exquisite this sculpture is, it still needs to be carefully passed on.)\n\n'
        'Notes:\n'
        '• 再 here is not the adverb "again" — it means "no matter how"\n'
        '• The 也 clause often contains a negative verb (不, 没) or an emphasis on inevitability\n'
        '• This pattern is stronger and more emphatic than 无论…也…'
    ),
    'examples': [
        {
            'chinese': '再有才华的艺术家，也需要长期创作才能形成独特的风格。',
            'pinyin': py('再有才华的艺术家也需要长期创作才能形成独特的风格'),
            'english': 'No matter how talented an artist is, they still need long-term creative work to develop their unique style.'
        },
        {
            'chinese': '这件雕塑再精美，也需要认真传承才能流传后世。',
            'pinyin': py('这件雕塑再精美也需要认真传承才能流传后世'),
            'english': 'No matter how exquisite this sculpture is, it still needs to be carefully passed on to future generations.'
        },
        {
            'chinese': '博物馆的展览再精彩，也只是暂时的，文化遗产的传承才是根本。',
            'pinyin': py('博物馆的展览再精彩也只是暂时的文化遗产的传承才是根本'),
            'english': "No matter how wonderful the museum's exhibition is, it's only temporary; the inheritance of cultural heritage is what matters most."
        },
    ],
    'exercises': [
        {
            'question': '民间艺术___古老，___需要我们认真传承下去。',
            'type': 'multiple_choice',
            'correct': '再…也…',
            'options': ['再…也…', '虽然…但是…', '因为…所以…', '不但…而且…'],
            'option_pinyin': ['zài … yě …', 'suī rán … dàn shì …', 'yīn wèi … suǒ yǐ …', 'bú dàn … ér qiě …'],
            'word_hints': {'民间': 'mín jiān', '传承': 'chuán chéng'}
        },
        {
            'question': 'Which sentence correctly uses 再…也…?',
            'type': 'multiple_choice',
            'correct': '这次展览再精彩，也只有一周，要好好欣赏每一件作品。',
            'options': [
                '这次展览再精彩，也只有一周，要好好欣赏每一件作品。',
                '这次展览也精彩，再只有一周，要好好欣赏每一件作品。',
                '再这次展览精彩，也只有一周好好欣赏每一件作品。',
                '这次展览精彩再，好好欣赏也只有一周每一件作品。'
            ],
            'option_pinyin': [
                py('这次展览再精彩也只有一周要好好欣赏每一件作品'),
                '', '', ''
            ],
            'word_hints': {'展览': 'zhǎn lǎn', '欣赏': 'xīn shǎng', '作品': 'zuò pǐn'}
        },
        {
            'question': 'What does 再…也… express?',
            'type': 'multiple_choice',
            'correct': '"No matter how [adj/adv]… still…" — the result holds even under an extreme degree or condition',
            'options': [
                '"No matter how [adj/adv]… still…" — the result holds even under an extreme degree or condition',
                '"Both… and…" — two positive qualities exist together',
                '"Although… still…" — acknowledges a concession, then states the result',
                '"Because… therefore…" — introduces a cause and its effect'
            ],
            'option_pinyin': ['', '', '', ''],
            'word_hints': {}
        },
    ],
    'mini_exercises': [
        {
            'type': 'multiple_choice',
            'question': '再…也… means...',
            'correct': '"No matter how [adj/adv]… still [result]" — emphasises that the result holds even under extreme conditions',
            'options': [
                '"No matter how [adj/adv]… still [result]" — emphasises that the result holds even under extreme conditions',
                '"Not only… but also…" — accumulates two positive qualities',
                '"Although… still…" — concedes a fact and states a contrasting result',
                '"If… then…" — introduces a conditional relationship'
            ],
            'option_pinyin': ['zài … yě …', '', '', '']
        },
        {
            'type': 'fill_blank',
            'question': 'Fill in: No matter how unique this work is, it still needs to be carefully preserved.',
            'correct': '再',
            'options': ['再', '很', '更', '非常'],
            'option_pinyin': ['zài', 'hěn', 'gèng', 'fēi cháng'],
            'question_chinese': '这件作品___独特，也需要认真传承，让更多人欣赏到。',
            'question_pinyin': '这件作品___独特，也需要认真传承，让更多人欣赏到。',
            'question_english': 'No matter how unique this work is, it still needs to be carefully preserved so more people can appreciate it.'
        },
        {
            'type': 'multiple_choice',
            'question': 'Which sentence correctly uses 再…也…?',
            'correct': '再有名的艺术家，也需要不断创作才能保持自己独特的风格。',
            'options': [
                '再有名的艺术家，也需要不断创作才能保持自己独特的风格。',
                '有名的艺术家再，也需要不断创作才能保持独特风格。',
                '艺术家再有名，需要不断创作也才能保持风格独特。',
                '也有名的艺术家，再需要不断创作才能保持独特风格。'
            ],
            'option_pinyin': [
                py('再有名的艺术家也需要不断创作才能保持自己独特的风格'),
                '', '', ''
            ]
        }
    ]
}

# ── Grammar Point 3: 对于 ──────────────────────────────────────────────────────
GP3 = {
    'number': 3,
    'title': '对于 — Regarding; as for; with regard to',
    'explanation': (
        '对于 is a preposition meaning "regarding", "as for", "with regard to", or '
        '"in relation to". It introduces the topic or object that the main clause '
        'discusses or evaluates.\n\n'
        'Structures:\n'
        '• 对于 + topic noun/phrase + (subject) + predicate\n'
        '• Subject + 对于 + topic + predicate\n\n'
        '• 对于民间文化遗产的传承，我们每个人都有责任。\n'
        '  (As for the inheritance of folk cultural heritage, each of us has a responsibility.)\n'
        '• 对于这次博物馆展览，观众的反响非常热烈。\n'
        '  (Regarding this museum exhibition, the audience\'s response was very enthusiastic.)\n\n'
        'Notes:\n'
        '• 对于 is more formal than 对 and specifically introduces a topic for discussion\n'
        '• 对于 can appear at the start of the sentence (most common) or after the subject\n'
        '• Do not confuse with 对 (toward/to) — 对于 always introduces a topic, '
        'not a direction of action'
    ),
    'examples': [
        {
            'chinese': '对于民间文化遗产的传承，我们每个人都有责任。',
            'pinyin': py('对于民间文化遗产的传承我们每个人都有责任'),
            'english': 'Regarding the inheritance of folk cultural heritage, each of us has a responsibility.'
        },
        {
            'chinese': '对于雕塑创作，他有着独特的风格和深厚的才华。',
            'pinyin': py('对于雕塑创作他有着独特的风格和深厚的才华'),
            'english': 'With regard to sculpture, he has a unique style and deep talent.'
        },
        {
            'chinese': '对于这次博物馆展览，观众的反响非常热烈。',
            'pinyin': py('对于这次博物馆展览观众的反响非常热烈'),
            'english': "As for this museum exhibition, the audience's response was very enthusiastic."
        },
    ],
    'exercises': [
        {
            'question': '___民间文化遗产的传承，年轻一代应该积极参与。',
            'type': 'multiple_choice',
            'correct': '对于',
            'options': ['对于', '虽然', '并且', '随着'],
            'option_pinyin': ['duì yú', 'suī rán', 'bìng qiě', 'suí zhe'],
            'word_hints': {'民间': 'mín jiān', '传承': 'chuán chéng'}
        },
        {
            'question': 'Which sentence correctly uses 对于?',
            'type': 'multiple_choice',
            'correct': '对于民间艺术的欣赏，每个人都有不同的感受。',
            'options': [
                '对于民间艺术的欣赏，每个人都有不同的感受。',
                '民间艺术对于的欣赏，每个人都有不同的感受。',
                '每个人对于，民间艺术欣赏都有不同的感受。',
                '欣赏对于民间，艺术每个人都有不同的感受。'
            ],
            'option_pinyin': [
                py('对于民间艺术的欣赏每个人都有不同的感受'),
                '', '', ''
            ],
            'word_hints': {'民间': 'mín jiān', '欣赏': 'xīn shǎng'}
        },
        {
            'question': 'What does 对于 express?',
            'type': 'multiple_choice',
            'correct': 'Regarding; as for — introduces the topic or object under discussion',
            'options': [
                'Regarding; as for — introduces the topic or object under discussion',
                'By means of — introduces the method by which something is achieved',
                'Although; even though — introduces a concession',
                'Because of — introduces a cause or reason'
            ],
            'option_pinyin': ['', '', '', ''],
            'word_hints': {}
        },
    ],
    'mini_exercises': [
        {
            'type': 'multiple_choice',
            'question': '对于 means...',
            'correct': 'Regarding; as for — introduces the topic or person that the statement is about',
            'options': [
                'Regarding; as for — introduces the topic or person that the statement is about',
                'By means of; through — introduces the method used',
                'Although — introduces a concession before the main point',
                'And also; moreover — adds a second point to the first'
            ],
            'option_pinyin': ['duì yú', '', '', '']
        },
        {
            'type': 'fill_blank',
            'question': 'Fill in: Regarding the artworks at this exhibition, the audience all expressed great appreciation.',
            'correct': '对于',
            'options': ['对于', '通过', '因为', '虽然'],
            'option_pinyin': ['duì yú', 'tōng guò', 'yīn wèi', 'suī rán'],
            'question_chinese': '___这次展览的作品，观众们都表示非常欣赏。',
            'question_pinyin': '___这次展览的作品，观众们都表示非常欣赏。',
            'question_english': 'Regarding the artworks at this exhibition, the audience all expressed great appreciation.'
        },
        {
            'type': 'multiple_choice',
            'question': 'Which sentence correctly uses 对于?',
            'correct': '对于传统文化的传承，博物馆和民间社团都在积极推广。',
            'options': [
                '对于传统文化的传承，博物馆和民间社团都在积极推广。',
                '传统文化对于，博物馆传承民间社团都在积极推广。',
                '博物馆对于，传统文化的传承民间社团推广积极。',
                '传承对于传统文化的，博物馆和民间社团积极都在推广。'
            ],
            'option_pinyin': [
                py('对于传统文化的传承博物馆和民间社团都在积极推广'),
                '', '', ''
            ]
        }
    ]
}

# ── Main processing ───────────────────────────────────────────────────────────
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

# Step 3: replace all 3 grammar points
data['grammar_points'] = [GP1, GP2, GP3]
print('  Replaced all 3 grammar points: 并且 / 再…也… / 对于')

# Step 4: attach _sent_zh/_sent_en to existing words missing them
for v in data['vocabulary']:
    if '_sent_zh' not in v:
        ex = v.get('example', '')
        if v['chinese'] in ex:
            v['_sent_zh'] = ex.replace(v['chinese'], '___', 1)
            v['_sent_en'] = v.get('translation', v['english'])
        else:
            v['_sent_zh'] = '___。'
            v['_sent_en'] = v['english']

# Step 5: regenerate mini_exercises for all non-phrase vocab
pool = [v for v in data['vocabulary'] if v.get('part_of_speech') != 'phrase']
for v in pool:
    v['mini_exercises'] = make_mini(v, pool)

# Step 6: clean temp keys and save
for v in data['vocabulary']:
    v.pop('_sent_zh', None)
    v.pop('_sent_en', None)

with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'\nL11 saved ({len(pool)} non-phrase vocab, {len(data["grammar_points"])} grammar pts)')
for v in pool:
    print(f'  [{v["id"]}] {v["chinese"]} — {v["english"]}')
for gp in data['grammar_points']:
    print(f'  GP{gp["number"]}: {gp["title"]}')
