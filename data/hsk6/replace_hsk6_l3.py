"""
Update HSK6 Lesson 3 (Life Choices & Career):
- Replace 人生 → 一辈子
- Replace 坚持 → 勿
- Replace 成功 → 盼望
- Replace 理想 → 辞职
- Replace 目标 → 冲动
- Replace 放弃 → 全力以赴
- Replace 机会 → 前途
- Remove grammar '尽管…还是/仍然'
- Add grammar '各自' and '勿'
All sentences use existing lesson vocabulary where possible.
"""
import json, random, re
from pypinyin import lazy_pinyin, Style

PATH = '/Users/irisvitalee/ChineseApp/data/hsk6/hsk6_lesson_3.json'
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
    '人生': dict(
        chinese='一辈子', pinyin='yī bèi zi',
        english="One's whole life / Lifelong / All one's life",
        part_of_speech='noun/adverb',
        example='选择一份自己热爱的事业，才能一辈子都不觉得后悔。',
        translation="Choosing a career you truly love is the only way to never feel regret for your whole life.",
        _sent_zh='选择一份自己热爱的事业，才能___都不觉得后悔。',
        _sent_en="Choosing a career you truly love is the only way to never feel regret for your whole life.",
    ),
    '坚持': dict(
        chinese='勿', pinyin='wù',
        english='Do not / Must not (formal/literary)',
        part_of_speech='adverb',
        example='面对艰难的选择，勿因一时冲动做出让自己后悔的决定。',
        translation='When facing a difficult choice, do not let a moment of impulse lead you to a decision you will regret.',
        _sent_zh='面对艰难的选择，___因一时冲动做出让自己后悔的决定。',
        _sent_en='When facing a difficult choice, do not let a moment of impulse lead you to a decision you will regret.',
    ),
    '成功': dict(
        chinese='盼望', pinyin='pàn wàng',
        english='To hope for / To long for / To look forward to',
        part_of_speech='verb',
        example='她盼望着有一天能辞职去做自己真正热爱的事，全力以赴地追求前途。',
        translation='She hopes that one day she can resign and do what she truly loves, going all out to pursue her future.',
        _sent_zh='她___着有一天能辞职去做自己真正热爱的事，全力以赴地追求前途。',
        _sent_en='She hopes that one day she can resign and do what she truly loves, going all out to pursue her future.',
    ),
    '理想': dict(
        chinese='辞职', pinyin='cí zhí',
        english="To resign / To quit one's job",
        part_of_speech='verb',
        example='他犹豫了很久，最终还是决定辞职，去追求更有前途的发展方向。',
        translation='He hesitated for a long time, but ultimately decided to resign and pursue a more promising direction.',
        _sent_zh='他犹豫了很久，最终还是决定___，去追求更有前途的发展方向。',
        _sent_en='He hesitated for a long time, but ultimately decided to resign and pursue a more promising direction.',
    ),
    '目标': dict(
        chinese='冲动', pinyin='chōng dòng',
        english='Impulse / Impulsive / To act impulsively',
        part_of_speech='noun/adjective',
        example='做重大决定时，勿凭一时冲动，要认真权衡稳定与前途。',
        translation='When making major decisions, do not act on impulse — carefully weigh stability and future prospects.',
        _sent_zh='做重大决定时，勿凭一时___，要认真权衡稳定与前途。',
        _sent_en='When making major decisions, do not act on impulse — carefully weigh stability and future prospects.',
    ),
    '放弃': dict(
        chinese='全力以赴', pinyin='quán lì yǐ fù',
        english="To go all out / To give one's all / To spare no effort",
        part_of_speech='verb',
        example='既然已经做出了选择，就应该全力以赴，勿再犹豫不决。',
        translation='Since you have already made your choice, you should go all out and not hesitate any longer.',
        _sent_zh='既然已经做出了选择，就应该___，勿再犹豫不决。',
        _sent_en='Since you have already made your choice, you should go all out and not hesitate any longer.',
    ),
    '机会': dict(
        chinese='前途', pinyin='qián tú',
        english='Future prospects / Future / Outlook',
        part_of_speech='noun',
        example='他盼望着自己的前途能更宽广，为此不惜辞职去积累新的经验。',
        translation='He hopes for a brighter future and is willing to resign to gain new experiences.',
        _sent_zh='他盼望着自己的___能更宽广，为此不惜辞职去积累新的经验。',
        _sent_en='He hopes for a brighter future and is willing to resign to gain new experiences.',
    ),
}

GP3 = {
    "number": 3,
    "title": "各自 — Each; Respectively; On one's own",
    "explanation": "各自 is an adverb meaning 'each one individually' or 'respectively.' Structure: Subject + 各自 + Verb. It emphasizes that different people or parties each perform an action separately or independently, rather than together. Unlike 分别 (which can describe actions done at different times), 各自 highlights that each party has their own distinct path, situation, or responsibility. 他们各自做出了不同的选择 — They each made their own different choices.",
    "examples": [
        {
            "chinese": "毕业后，他们各自走上了不同的前途之路，但都一辈子没有忘记彼此。",
            "pinyin": "Bì yè hòu, tā men gè zì zǒu shàng le bù tóng de qián tú zhī lù, dàn dōu yī bèi zi méi yǒu wàng jì bǐ cǐ.",
            "english": "After graduation, they each went their own way toward their futures, but none of them ever forgot each other their whole lives."
        },
        {
            "chinese": "两人充分讨论之后，各自提出了对前途的盼望和规划。",
            "pinyin": "Liǎng rén chōng fèn tǎo lùn zhī hòu, gè zì tí chū le duì qián tú de pàn wàng hé guī huà.",
            "english": "After thorough discussion, the two each put forward their own hopes and plans for the future."
        }
    ],
    "exercises": [
        {
            "question": "毕业后，他们_____走上了不同的发展道路，各自追求一辈子的盼望。",
            "type": "multiple_choice",
            "correct": "各自",
            "options": ["各自", "一起", "随便", "忽然"],
            "option_pinyin": ["gè zì", "yī qǐ", "suí biàn", "hū rán"],
            "word_hints": {"发展道路": "path of development"}
        },
        {
            "question": "讨论结束后，他们_____回到自己的工作岗位，全力以赴地完成各自的任务。",
            "type": "multiple_choice",
            "correct": "各自",
            "options": ["各自", "共同", "全体", "一齐"],
            "option_pinyin": ["gè zì", "gòng tóng", "quán tǐ", "yī qí"],
            "word_hints": {"岗位": "post; position"}
        },
        {
            "question": "两人对前途的盼望方向不同，因此决定_____去追求各自的选择。",
            "type": "multiple_choice",
            "correct": "各自",
            "options": ["各自", "忽然", "随意", "恰好"],
            "option_pinyin": ["gè zì", "hū rán", "suí yì", "qià hǎo"],
            "word_hints": {}
        },
        {
            "question": "Which sentence uses 各自 correctly?",
            "type": "multiple_choice",
            "correct": "他们各自有不同的前途规划，不需要为对方的选择发愁。",
            "options": [
                "他们各自有不同的前途规划，不需要为对方的选择发愁。",
                "他们各自一起决定了同一件事。",
                "各自他们都选择了同一条路。",
                "他们互相各自帮助对方做出选择。"
            ],
            "option_pinyin": ["", "", "", ""],
            "word_hints": {}
        },
        {
            "question": "面对人生中的重要选择，每个人都需要_____做出判断，勿因他人影响而一辈子后悔。",
            "type": "multiple_choice",
            "correct": "各自",
            "options": ["各自", "一同", "全部", "突然"],
            "option_pinyin": ["gè zì", "yī tóng", "quán bù", "tū rán"],
            "word_hints": {"判断": "judgment; to judge"}
        }
    ],
    "mini_exercises": [
        {
            "type": "multiple_choice",
            "question": "各自 emphasizes that...",
            "correct": "Each person/party does something individually or has their own distinct situation — not together",
            "options": [
                "Each person/party does something individually or has their own distinct situation — not together",
                "Everyone does the same thing at the same time",
                "Actions happen one after another in a sequence",
                "The result is shared equally among all parties"
            ],
            "option_pinyin": ["gè zì", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: After graduation, they each went their own way.",
            "correct": "各自",
            "options": ["各自", "一起", "分外", "总是"],
            "option_pinyin": ["gè zì", "yī qǐ", "fèn wài", "zǒng shì"],
            "question_chinese": "毕业后，他们___走上了不同的前途之路。",
            "question_pinyin": "毕业后，他们___走上了不同的前途之路。",
            "question_english": "After graduation, they each went their own way."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 各自?",
            "correct": "他们各自做出了选择，没有为对方的决定发愁。",
            "options": [
                "他们各自做出了选择，没有为对方的决定发愁。",
                "他们各自一起讨论了同一个问题。",
                "各自就是他们喜欢的方式。",
                "他们各自都犹豫地选择了同一条路。"
            ],
            "option_pinyin": [
                "tā men gè zì zuò chū le xuǎn zé méi yǒu wèi duì fāng de jué dìng fā chóu",
                "tā men gè zì yī qǐ tǎo lùn le tóng yī gè wèn tí",
                "gè zì jiù shì tā men xǐ huān de fāng shì",
                "tā men gè zì dōu yóu yù de xuǎn zé le tóng yī tiáo lù"
            ]
        }
    ]
}

GP4 = {
    "number": 4,
    "title": "勿 — Do not / Must not (formal/literary)",
    "explanation": "勿 is a classical Chinese particle meaning 'do not' or 'must not.' It is the formal, literary equivalent of 不要 and appears in written notices, signage, formal announcements, or elevated spoken Chinese. Structure: 勿 + Verb. It creates a prohibition or strong warning with a more authoritative and concise tone than 不要. Common expressions: 请勿打扰 (Please do not disturb), 勿忘初心 (Never forget your original intention).",
    "examples": [
        {
            "chinese": "面对重大选择时，勿因一时冲动而一辈子后悔。",
            "pinyin": "Miàn duì zhòng dà xuǎn zé shí, wù yīn yī shí chōng dòng ér yī bèi zi hòu huǐ.",
            "english": "When facing a major choice, do not act on a moment of impulse and regret it for a lifetime."
        },
        {
            "chinese": "既然已经盼望多年，就全力以赴，勿在最后一步犹豫退缩。",
            "pinyin": "Jì rán yǐ jīng pàn wàng duō nián, jiù quán lì yǐ fù, wù zài zuì hòu yī bù yóu yù tuì suō.",
            "english": "Since you have hoped for so many years, give it your all — do not waver or back down at the final step."
        }
    ],
    "exercises": [
        {
            "question": "___面对选择时冲动行事，以免一辈子后悔。",
            "type": "multiple_choice",
            "correct": "勿",
            "options": ["勿", "总", "都", "便"],
            "option_pinyin": ["wù", "zǒng", "dōu", "biàn"],
            "word_hints": {"行事": "to act; to handle matters"}
        },
        {
            "question": "既然已经决定辞职，就全力以赴，___再犹豫不前。",
            "type": "multiple_choice",
            "correct": "勿",
            "options": ["勿", "也", "才", "还"],
            "option_pinyin": ["wù", "yě", "cái", "hái"],
            "word_hints": {"犹豫不前": "to hesitate and not move forward"}
        },
        {
            "question": "___因一时冲动辞职，要认真权衡稳定的待遇与个人前途。",
            "type": "multiple_choice",
            "correct": "勿",
            "options": ["勿", "不", "别", "就"],
            "option_pinyin": ["wù", "bù", "bié", "jiù"],
            "word_hints": {"权衡": "to weigh up; to balance"}
        },
        {
            "question": "Which sentence uses 勿 correctly?",
            "type": "multiple_choice",
            "correct": "面对发愁的事，勿轻易冲动，要冷静思考。",
            "options": [
                "面对发愁的事，勿轻易冲动，要冷静思考。",
                "他勿了一个冲动的决定。",
                "勿是他最盼望的状态。",
                "她一辈子都勿愿意辞职。"
            ],
            "option_pinyin": ["", "", "", ""],
            "word_hints": {"冷静": "calm; cool-headed"}
        },
        {
            "question": "她盼望全力以赴，却总是犹豫，旁人劝她：'___再拖延，机不可失。'",
            "type": "multiple_choice",
            "correct": "勿",
            "options": ["勿", "竟", "倒", "还"],
            "option_pinyin": ["wù", "jìng", "dào", "hái"],
            "word_hints": {"机不可失": "don't miss the opportunity; opportunity knocks but once"}
        }
    ],
    "mini_exercises": [
        {
            "type": "multiple_choice",
            "question": "勿 vs 不要: what is the key difference?",
            "correct": "勿 is formal/literary (used in notices, written instructions, elevated speech); 不要 is the everyday spoken equivalent",
            "options": [
                "勿 is formal/literary (used in notices, written instructions, elevated speech); 不要 is the everyday spoken equivalent",
                "勿 only applies to other people; 不要 applies to yourself",
                "勿 negates adjectives; 不要 negates verbs",
                "They are completely identical in meaning and usage"
            ],
            "option_pinyin": ["wù vs bú yào", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Do not act impulsively when facing important choices.",
            "correct": "勿",
            "options": ["勿", "已", "就", "还"],
            "option_pinyin": ["wù", "yǐ", "jiù", "hái"],
            "question_chinese": "面对重要选择时，___因冲动而一辈子后悔。",
            "question_pinyin": "面对重要选择时，___因冲动而一辈子后悔。",
            "question_english": "Do not act impulsively when facing important choices."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 勿?",
            "correct": "既然选择了全力以赴，勿再犹豫。",
            "options": [
                "既然选择了全力以赴，勿再犹豫。",
                "他勿选择了辞职。",
                "勿他一辈子都后悔了。",
                "她的前途勿稳定。"
            ],
            "option_pinyin": [
                "jì rán xuǎn zé le quán lì yǐ fù wù zài yóu yù",
                "tā wù xuǎn zé le cí zhí",
                "wù tā yī bèi zi dōu hòu huǐ le",
                "tā de qián tú wù wěn dìng"
            ]
        }
    ]
}

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

# Step 2: attach _sent_zh/_sent_en to existing words missing them
for v in data['vocabulary']:
    if '_sent_zh' not in v:
        ex = v.get('example', '')
        if v['chinese'] in ex:
            v['_sent_zh'] = ex.replace(v['chinese'], '___', 1)
            v['_sent_en'] = v.get('translation', v['english'])
        else:
            v['_sent_zh'] = '___。'
            v['_sent_en'] = v['english']

# Step 3: regenerate mini_exercises for all non-phrase vocab
pool = [v for v in data['vocabulary'] if v.get('part_of_speech') != 'phrase']
for v in pool:
    v['mini_exercises'] = make_mini(v, pool)

# Step 4: remove '尽管…还是/仍然' grammar point and renumber
data['grammar_points'] = [gp for gp in data['grammar_points'] if '尽管' not in gp['title']]
for idx, gp in enumerate(data['grammar_points'], 1):
    gp['number'] = idx
print(f"  Removed '尽管…还是/仍然' grammar point")

# Step 5: add new grammar points
data['grammar_points'].append(GP3)
data['grammar_points'].append(GP4)
print(f"  Added grammar: '各自' (GP3) and '勿' (GP4)")

# Step 6: clean temp keys and save
for v in data['vocabulary']:
    v.pop('_sent_zh', None)
    v.pop('_sent_en', None)

with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'\nL3 saved ({len(pool)} non-phrase vocab, {len(data["grammar_points"])} grammar points)')
for v in pool:
    print(f'  [{v["id"]}] {v["chinese"]} — {v["english"]}')
print('Grammar:')
for gp in data['grammar_points']:
    print(f'  [{gp["number"]}] {gp["title"]}')
