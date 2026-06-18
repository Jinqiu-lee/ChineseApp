"""
Update HSK4 Level 5 lessons 1-5:
L1: Add 5 words; replace GP1 顺便→马上, replace GP2 来不及/来得及→安排
L2: Replace 努力→压力, 成绩→功课, 考试→选修, 复习→必修; remove GP2 越来越
L3: Remove GP1 随着 (renumber)
L4: Remove 营养; add 炒煎煮炖; remove GP2 越...越 & GP3 把字句; add GP2 在……上/下/中
L5: Remove 坚持; replace 比赛→良性, 成绩→恶性; remove GP1 只要...就... & GP3 一...就...; add GP2 看来
All sentences use existing lesson vocab where possible.
"""
import json, random, re, os
from pypinyin import lazy_pinyin, Style

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
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

# ═══════════════════════════════════════════════════════════════════════════════
# LESSON 1 — Travel & Transportation
# ═══════════════════════════════════════════════════════════════════════════════

L1_EXTRA = [
    dict(id='hsk5_l1_13', chinese='拜访', pinyin='bài fǎng',
         english='To pay a visit / To call on',
         part_of_speech='verb',
         example='出差期间，他拜访了几位重要客户。',
         translation='During the business trip, he visited several important clients.',
         _sent_zh='出差期间，他___了几位重要客户。',
         _sent_en='During the business trip, he visited several important clients.'),
    dict(id='hsk5_l1_14', chinese='参观', pinyin='cān guān',
         english='To visit (a place) / To tour',
         part_of_speech='verb',
         example='我们参观了当地著名的历史博物馆。',
         translation='We visited the famous local history museum.',
         _sent_zh='我们___了当地著名的历史博物馆。',
         _sent_en='We visited the famous local history museum.'),
    dict(id='hsk5_l1_15', chinese='申请', pinyin='shēn qǐng',
         english='To apply for / Application',
         part_of_speech='verb/noun',
         example='出国旅行前，你需要提前申请签证。',
         translation='Before traveling abroad, you need to apply for a visa in advance.',
         _sent_zh='出国旅行前，你需要提前___签证。',
         _sent_en='Before traveling abroad, you need to apply for a visa in advance.'),
    dict(id='hsk5_l1_16', chinese='手续', pinyin='shǒu xù',
         english='Procedures / Formalities / Paperwork',
         part_of_speech='noun',
         example='出发前要在机场办理登机手续。',
         translation='You need to complete check-in procedures at the airport before departure.',
         _sent_zh='出发前要在机场办理登机___。',
         _sent_en='You need to complete check-in procedures at the airport before departure.'),
    dict(id='hsk5_l1_17', chinese='托运', pinyin='tuō yùn',
         english='To check in luggage / Checked baggage',
         part_of_speech='verb/noun',
         example='行李超重了，需要办理托运手续。',
         translation='The luggage is overweight and needs to be checked in.',
         _sent_zh='行李超重了，需要办理___手续。',
         _sent_en='The luggage is overweight and needs to be checked in.'),
]

def gp_mashang():
    return {
        'number': 1,
        'title': '马上 — Right away / About to happen',
        'explanation': (
            '马上 expresses that something is about to happen very soon or must be done immediately. '
            'Three key patterns:\n\n'
            '1. 马上 + 动词 — An action is imminent\n'
            '• 飞机马上起飞，请坐好。(The plane is about to take off, please be seated.)\n'
            '• 我马上出发。(I am leaving right away.)\n\n'
            '2. 马上就要 + 动词 + 了 — Entering a new state very soon\n'
            '• 航班马上就要降落了。(The flight is about to land.)\n'
            '• 他们马上就要出发了。(They are about to set off.)\n\n'
            '3. 立刻/马上 — Emphasising instant response\n'
            '• 请马上联系导游！(Please contact the tour guide immediately!)\n'
            '• 发现迷路后，要立刻向人问路。(Upon getting lost, ask for directions immediately.)'
        ),
        'examples': [
            {'chinese': '航班马上就要起飞了，请系好安全带。',
             'pinyin': py('航班马上就要起飞了请系好安全带'),
             'english': 'The flight is about to take off; please fasten your seatbelt.'},
            {'chinese': '出发时间到了，我们马上走。',
             'pinyin': py('出发时间到了我们马上走'),
             'english': 'It is time to depart; we are leaving right away.'},
            {'chinese': '发现迷路后，要立刻马上寻求帮助。',
             'pinyin': py('发现迷路后要立刻马上寻求帮助'),
             'english': 'Upon getting lost, seek help immediately.'},
        ],
        'exercises': [
            {'question': '航班___就要降落了，请准备好登机牌。',
             'type': 'multiple_choice',
             'correct': '马上',
             'options': ['马上', '已经', '偶尔', '渐渐'],
             'option_pinyin': ['mǎ shàng', 'yǐ jīng', 'ǒu ěr', 'jiàn jiàn'],
             'word_hints': {'降落': 'jiàng luò', '登机牌': 'dēng jī pái'}},
            {'question': 'Which sentence correctly uses 马上?',
             'type': 'multiple_choice',
             'correct': '我们马上就要出发了，行李都准备好了吗？',
             'options': [
                 '我们马上就要出发了，行李都准备好了吗？',
                 '我们出发马上了，行李准备好吗？',
                 '马上我们了，出发行李准备。',
                 '行李马上出发，我们准备好了。'],
             'option_pinyin': [py('我们马上就要出发了行李都准备好了吗'), '', '', ''],
             'word_hints': {'出发': 'chū fā'}},
        ],
        'mini_exercises': [
            {'type': 'multiple_choice',
             'question': '马上 is used to express...',
             'correct': 'That an action or state change is about to happen immediately',
             'options': [
                 'That an action or state change is about to happen immediately',
                 'That an action happened a long time ago',
                 'That someone has a regular habit',
                 'That two actions happen at exactly the same time'],
             'option_pinyin': ['mǎ shàng', '', '', '']},
            {'type': 'fill_blank',
             'question': 'Fill in: The flight is about to take off; please fasten your seatbelt.',
             'correct': '马上',
             'options': ['马上', '已经', '偶尔', '最终'],
             'option_pinyin': ['mǎ shàng', 'yǐ jīng', 'ǒu ěr', 'zuì zhōng'],
             'question_chinese': '航班___就要起飞了，请系好安全带。',
             'question_pinyin': '航班___就要起飞了，请系好安全带。',
             'question_english': 'The flight is about to take off; please fasten your seatbelt.'},
            {'type': 'multiple_choice',
             'question': "Which sentence correctly uses 马上?",
             'correct': '我们马上就要出发了，行李都准备好了吗？',
             'options': [
                 '我们马上就要出发了，行李都准备好了吗？',
                 '马上我们出发了，准备行李。',
                 '我们出发马上，行李准备。',
                 '行李准备好马上，我们出发。'],
             'option_pinyin': [py('我们马上就要出发了行李都准备好了吗'), '', '', '']},
        ]
    }

def gp_anpai():
    return {
        'number': 2,
        'title': '安排 — To arrange / To schedule (A 安排 B to do sth)',
        'explanation': (
            '安排 means to organise, schedule, or arrange something. '
            'The key structure is:\n\n'
            'A + 安排 + B + 动词 + (something)\n'
            'A arranges for B to do something.\n\n'
            '• 导游安排大家参观了著名景点。\n'
            '  (The tour guide arranged for everyone to visit famous attractions.)\n'
            '• 公司安排他出差去北京。\n'
            '  (The company arranged for him to go on a business trip to Beijing.)\n\n'
            '安排 can also be used with a noun object:\n'
            '• 我们要提前安排旅行计划。\n'
            '  (We need to arrange the travel plan in advance.)\n'
            '• 他安排好了所有的签证手续。\n'
            '  (He arranged all the visa procedures.)'
        ),
        'examples': [
            {'chinese': '导游安排大家参观了当地的著名景点。',
             'pinyin': py('导游安排大家参观了当地的著名景点'),
             'english': 'The tour guide arranged for everyone to visit the local famous attractions.'},
            {'chinese': '公司安排他出差，处理重要业务。',
             'pinyin': py('公司安排他出差处理重要业务'),
             'english': 'The company arranged for him to go on a business trip to handle important business.'},
            {'chinese': '出发前，她安排好了所有的签证和手续。',
             'pinyin': py('出发前她安排好了所有的签证和手续'),
             'english': 'Before departure, she arranged all the visas and formalities.'},
        ],
        'exercises': [
            {'question': '___把大家___好了住宿，非常周到。',
             'type': 'multiple_choice',
             'correct': '导游...安排',
             'options': ['导游...安排', '旅行...做', '签证...准备', '航班...处理'],
             'option_pinyin': ['dǎo yóu...ān pái', '', '', ''],
             'word_hints': {'住宿': 'zhù sù', '周到': 'zhōu dào'}},
            {'question': 'Which sentence correctly uses 安排?',
             'type': 'multiple_choice',
             'correct': '他安排同事去机场接客户。',
             'options': [
                 '他安排同事去机场接客户。',
                 '他同事安排了机场去接客户。',
                 '安排他同事机场去接客户。',
                 '他去机场安排接同事客户。'],
             'option_pinyin': [py('他安排同事去机场接客户'), '', '', ''],
             'word_hints': {'机场': 'jī chǎng'}},
        ],
        'mini_exercises': [
            {'type': 'multiple_choice',
             'question': 'A + 安排 + B + 动词 means...',
             'correct': 'A organises or schedules for B to do something',
             'options': [
                 'A organises or schedules for B to do something',
                 'A asks B to stop doing something',
                 'A and B do something at the same time',
                 'B teaches A how to do something'],
             'option_pinyin': ['ān pái', '', '', '']},
            {'type': 'fill_blank',
             'question': 'Fill in: The tour guide arranged for everyone to visit the museum.',
             'correct': '安排',
             'options': ['安排', '告诉', '让', '帮助'],
             'option_pinyin': ['ān pái', 'gào su', 'ràng', 'bāng zhù'],
             'question_chinese': '导游___大家参观了当地的博物馆。',
             'question_pinyin': '导游___大家参观了当地的博物馆。',
             'question_english': 'The tour guide arranged for everyone to visit the local museum.'},
            {'type': 'multiple_choice',
             'question': "Which sentence correctly uses 安排?",
             'correct': '她出发前安排好了签证和登机手续。',
             'options': [
                 '她出发前安排好了签证和登机手续。',
                 '她签证安排好了出发前登机手续。',
                 '安排她好了出发前签证手续。',
                 '登机手续她安排出发前好了。'],
             'option_pinyin': [py('她出发前安排好了签证和登机手续'), '', '', '']},
        ]
    }

# ═══════════════════════════════════════════════════════════════════════════════
# LESSON 2 — Education & Learning
# ═══════════════════════════════════════════════════════════════════════════════

L2_REPLACEMENTS = {
    '努力': dict(
        chinese='压力', pinyin='yā lì',
        english='Pressure / Stress',
        part_of_speech='noun',
        example='学期末，很多学生都感受到了巨大的压力。',
        translation='At the end of the semester, many students feel enormous pressure.',
        _sent_zh='学期末，很多学生都感受到了巨大的___。',
        _sent_en='At the end of the semester, many students feel enormous pressure.'),
    '成绩': dict(
        chinese='功课', pinyin='gōng kè',
        english='Homework / Schoolwork / Coursework',
        part_of_speech='noun',
        example='他每天认真完成功课，从不拖延。',
        translation='He completes his schoolwork carefully every day and never procrastinates.',
        _sent_zh='他每天认真完成___，从不拖延。',
        _sent_en='He completes his schoolwork carefully every day and never procrastinates.'),
    '考试': dict(
        chinese='选修', pinyin='xuǎn xiū',
        english='Elective course / To take an elective',
        part_of_speech='noun/verb',
        example='她选修了经济学课程，拓展了知识面。',
        translation='She took an elective economics course and broadened her knowledge.',
        _sent_zh='她___了经济学课程，拓展了知识面。',
        _sent_en='She took an elective economics course and broadened her knowledge.'),
    '复习': dict(
        chinese='必修', pinyin='bì xiū',
        english='Compulsory course / Required / Mandatory',
        part_of_speech='noun/adjective',
        example='这门课是必修课，所有专业的学生都要参加。',
        translation='This is a compulsory course; all students regardless of major must attend.',
        _sent_zh='这门课是___课，所有专业的学生都要参加。',
        _sent_en='This is a compulsory course; all students must attend.'),
}

# ═══════════════════════════════════════════════════════════════════════════════
# LESSON 4 — Food & Cuisine
# ═══════════════════════════════════════════════════════════════════════════════

L4_REMOVE = ['营养']

L4_EXTRA = [
    dict(id='hsk5_l4_13', chinese='炒', pinyin='chǎo',
         english='To stir-fry',
         part_of_speech='verb',
         example='厨师把新鲜食材炒得又香又嫩。',
         translation='The chef stir-fried the fresh ingredients until they were fragrant and tender.',
         _sent_zh='厨师把新鲜食材___得又香又嫩。',
         _sent_en='The chef stir-fried the fresh ingredients until they were fragrant and tender.'),
    dict(id='hsk5_l4_14', chinese='煎', pinyin='jiān',
         english='To pan-fry / To fry in shallow oil',
         part_of_speech='verb',
         example='按照食谱，把鱼煎到两面金黄就可以了。',
         translation='According to the recipe, pan-fry the fish until both sides are golden.',
         _sent_zh='按照食谱，把鱼___到两面金黄就可以了。',
         _sent_en='According to the recipe, pan-fry the fish until both sides are golden.'),
    dict(id='hsk5_l4_15', chinese='煮', pinyin='zhǔ',
         english='To boil / To cook (in water)',
         part_of_speech='verb',
         example='妈妈把新鲜食材煮成了一锅美味的汤。',
         translation='Mum boiled the fresh ingredients into a pot of delicious soup.',
         _sent_zh='妈妈把新鲜食材___成了一锅美味的汤。',
         _sent_en='Mum boiled the fresh ingredients into a delicious soup.'),
    dict(id='hsk5_l4_16', chinese='炖', pinyin='dùn',
         english='To stew / To braise / To simmer',
         part_of_speech='verb',
         example='这道特色菜需要用小火慢慢炖两个小时。',
         translation='This signature dish needs to be simmered on low heat for two hours.',
         _sent_zh='这道特色菜需要用小火慢慢___两个小时。',
         _sent_en='This signature dish needs to be simmered on low heat for two hours.'),
]

def gp_zai_shang():
    return {
        'number': 2,
        'title': '在……上/下/中 — In terms of / Under / In the process of',
        'explanation': (
            '在……上/下/中 is a prepositional phrase placed before the main clause. '
            'It expresses the condition, aspect, scope, or circumstance of an action.\n\n'
            '在……上 — focuses on an aspect or domain:\n'
            '• 在饮食上，我们要注重营养均衡。\n'
            '  (In terms of diet, we should focus on balanced nutrition.)\n'
            '• 在烹饪上，厨师有着丰富的经验。\n'
            '  (In terms of cooking, the chef has rich experience.)\n\n'
            '在……下 — under a condition or influence:\n'
            '• 在厨师的指导下，他学会了很多烹饪技巧。\n'
            '  (Under the chef\'s guidance, he learned many cooking techniques.)\n'
            '• 在新鲜食材的基础下，菜肴更加美味。\n'
            '  (With fresh ingredients as a foundation, the dishes are more delicious.)\n\n'
            '在……中 — in the midst of / during a process:\n'
            '• 在烹饪中，食材的处理方式非常关键。\n'
            '  (In the process of cooking, how ingredients are handled is crucial.)\n'
            '• 在品尝美食中，他发现了很多特色口味。\n'
            '  (While enjoying delicious food, he discovered many unique flavours.)'
        ),
        'examples': [
            {'chinese': '在饮食上，厨师建议多吃新鲜食材。',
             'pinyin': py('在饮食上厨师建议多吃新鲜食材'),
             'english': 'In terms of diet, the chef recommends eating more fresh ingredients.'},
            {'chinese': '在厨师的指导下，他学会了多种烹饪方法。',
             'pinyin': py('在厨师的指导下他学会了多种烹饪方法'),
             'english': "Under the chef's guidance, he learned various cooking methods."},
            {'chinese': '在烹饪中，掌握火候是最重要的技巧。',
             'pinyin': py('在烹饪中掌握火候是最重要的技巧'),
             'english': 'In the process of cooking, controlling the heat is the most important skill.'},
        ],
        'exercises': [
            {'question': '___饮食上，我们要选择新鲜的食材来保持健康。',
             'type': 'multiple_choice',
             'correct': '在',
             'options': ['在', '用', '从', '让'],
             'option_pinyin': ['zài', 'yòng', 'cóng', 'ràng'],
             'word_hints': {'食材': 'shí cái'}},
            {'question': 'Which sentence correctly uses 在……上/下/中?',
             'type': 'multiple_choice',
             'correct': '在厨师的指导下，他学会了炒、煎、煮、炖等多种烹饪方式。',
             'options': [
                 '在厨师的指导下，他学会了炒、煎、煮、炖等多种烹饪方式。',
                 '厨师的指导在下，学会了烹饪方式。',
                 '他在了厨师指导下学会烹饪。',
                 '在下厨师指导，烹饪方式学会了。'],
             'option_pinyin': [py('在厨师的指导下他学会了炒煎煮炖等多种烹饪方式'), '', '', ''],
             'word_hints': {'指导': 'zhǐ dǎo'}},
        ],
        'mini_exercises': [
            {'type': 'multiple_choice',
             'question': '在饮食上 is used to mean...',
             'correct': 'In terms of diet / Regarding the aspect of eating',
             'options': [
                 'In terms of diet / Regarding the aspect of eating',
                 'Under the condition of eating',
                 'During the process of eating something',
                 'Because of the food'],
             'option_pinyin': ['zài yǐn shí shàng', '', '', '']},
            {'type': 'fill_blank',
             'question': "Fill in: Under the chef's guidance, he learned many cooking techniques.",
             'correct': '在',
             'options': ['在', '用', '从', '让'],
             'option_pinyin': ['zài', 'yòng', 'cóng', 'ràng'],
             'question_chinese': '___厨师的指导下，他学会了很多烹饪技巧。',
             'question_pinyin': '___厨师的指导下，他学会了很多烹饪技巧。',
             'question_english': "Under the chef's guidance, he learned many cooking techniques."},
            {'type': 'multiple_choice',
             'question': 'Which sentence correctly uses 在……上/下/中?',
             'correct': '在烹饪上，食材的新鲜度非常重要。',
             'options': [
                 '在烹饪上，食材的新鲜度非常重要。',
                 '烹饪在上，食材新鲜度重要。',
                 '食材新鲜度，在烹饪上重要很。',
                 '在上烹饪，食材的新鲜度非常重要。'],
             'option_pinyin': [py('在烹饪上食材的新鲜度非常重要'), '', '', '']},
        ]
    }

# ═══════════════════════════════════════════════════════════════════════════════
# LESSON 5 — Sports & Fitness
# ═══════════════════════════════════════════════════════════════════════════════

L5_REMOVE = ['坚持']  # 坚持 is duplicate; 记录 already exists in this lesson

L5_REPLACEMENTS = {
    '比赛': dict(
        chinese='良性', pinyin='liáng xìng',
        english='Positive / Healthy / Benign',
        part_of_speech='adjective',
        example='良性竞争能激励运动员不断提高体能水平。',
        translation='Healthy competition motivates athletes to keep improving their fitness levels.',
        _sent_zh='___竞争能激励运动员不断提高体能水平。',
        _sent_en='Healthy competition motivates athletes to keep improving their fitness levels.'),
    '成绩': dict(
        chinese='恶性', pinyin='è xìng',
        english='Vicious / Malignant / Negative',
        part_of_speech='adjective',
        example='恶性竞争只会伤害团队精神，影响运动员的发挥。',
        translation='Vicious competition only damages team spirit and affects athletes\' performance.',
        _sent_zh='___竞争只会伤害团队精神，影响运动员的发挥。',
        _sent_en='Vicious competition only damages team spirit and affects athletes\' performance.'),
}

def gp_kanlai():
    return {
        'number': 2,
        'title': '看来 — It seems / It appears (parenthetical 插入语)',
        'explanation': (
            '看来 functions as a parenthetical (插入语) — an inserted comment that expresses '
            'the speaker\'s inference or estimation based on what they can observe. '
            'It is equivalent to "it seems", "it looks as if", or "it appears".\n\n'
            'Three positions in a sentence:\n\n'
            '1. Sentence-initial (most common):\n'
            '• 看来，这次比赛竞争非常激烈。\n'
            '  (It seems this competition is very intense.)\n\n'
            '2. After the subject:\n'
            '• 他，看来，已经是最强的运动员了。\n'
            '  (He, it seems, is already the strongest athlete.)\n\n'
            '3. After an evidence clause:\n'
            '• 他训练那么刻苦，看来冠军非他莫属。\n'
            '  (He trains so hard; it seems the championship belongs to no one but him.)\n\n'
            'Note: 看来 reflects the speaker\'s personal judgment — it is not a fixed fact.'
        ),
        'examples': [
            {'chinese': '他跑得那么快，看来打破纪录不是问题。',
             'pinyin': py('他跑得那么快看来打破纪录不是问题'),
             'english': 'He runs so fast; it seems breaking the record is not a problem.'},
            {'chinese': '看来，良性竞争真的能提高运动员的整体水平。',
             'pinyin': py('看来良性竞争真的能提高运动员的整体水平'),
             'english': "It appears that healthy competition can indeed raise athletes' overall level."},
            {'chinese': '教练这么满意，看来今天的训练非常成功。',
             'pinyin': py('教练这么满意看来今天的训练非常成功'),
             'english': "The coach seems so satisfied; it looks like today's training was very successful."},
        ],
        'exercises': [
            {'question': '他的体能这么好，___训练非常有效果。',
             'type': 'multiple_choice',
             'correct': '看来',
             'options': ['看来', '虽然', '即使', '尽管'],
             'option_pinyin': ['kàn lái', 'suī rán', 'jí shǐ', 'jǐn guǎn'],
             'word_hints': {'体能': 'tǐ néng'}},
            {'question': 'Which sentence correctly uses 看来 as a parenthetical?',
             'type': 'multiple_choice',
             'correct': '他训练那么刻苦，看来冠军非他莫属。',
             'options': [
                 '他训练那么刻苦，看来冠军非他莫属。',
                 '他看来训练了，冠军刻苦非他莫属。',
                 '看来了他训练刻苦，冠军莫属。',
                 '冠军看来非他莫属，训练刻苦。'],
             'option_pinyin': [py('他训练那么刻苦看来冠军非他莫属'), '', '', ''],
             'word_hints': {'刻苦': 'kè kǔ', '莫属': 'mò shǔ'}},
        ],
        'mini_exercises': [
            {'type': 'multiple_choice',
             'question': '看来 as a parenthetical (插入语) expresses...',
             'correct': "The speaker's inference or estimation based on observable evidence",
             'options': [
                 "The speaker's inference or estimation based on observable evidence",
                 'A definite fact that has been confirmed',
                 'A command telling someone what to do',
                 'A wish or hope about the future'],
             'option_pinyin': ['kàn lái', '', '', '']},
            {'type': 'fill_blank',
             'question': 'Fill in: He trains so hard; it seems the championship belongs to him.',
             'correct': '看来',
             'options': ['看来', '虽然', '即使', '尽管'],
             'option_pinyin': ['kàn lái', 'suī rán', 'jí shǐ', 'jǐn guǎn'],
             'question_chinese': '他训练那么刻苦，___冠军非他莫属。',
             'question_pinyin': '他训练那么刻苦，___冠军非他莫属。',
             'question_english': 'He trains so hard; it seems the championship belongs to him.'},
            {'type': 'multiple_choice',
             'question': "Which sentence correctly uses 看来 as a parenthetical?",
             'correct': '他的体能这么好，看来训练很有效果。',
             'options': [
                 '他的体能这么好，看来训练很有效果。',
                 '看来了体能好，训练有效果他。',
                 '他体能看来好，训练有效果。',
                 '训练有效果，体能他看来好。'],
             'option_pinyin': [py('他的体能这么好看来训练很有效果'), '', '', '']},
        ]
    }

# ═══════════════════════════════════════════════════════════════════════════════
# Main processing
# ═══════════════════════════════════════════════════════════════════════════════

def process_lesson(lesson_num, path, mutations):
    with open(path, encoding='utf-8') as f:
        data = json.load(f)

    vocab = data['vocabulary']
    gps   = data['grammar_points']

    # --- vocab removals ---
    for chinese in mutations.get('remove_vocab', []):
        before = len(vocab)
        vocab = [v for v in vocab if v['chinese'] != chinese]
        if len(vocab) < before:
            print(f'  L{lesson_num}: removed vocab {chinese}')
    data['vocabulary'] = vocab

    # --- vocab replacements (in-place) ---
    for v in data['vocabulary']:
        rmap = mutations.get('replace_vocab', {})
        if v['chinese'] in rmap:
            r = rmap[v['chinese']]
            old = v['chinese']
            v['chinese']          = r['chinese']
            v['pinyin']           = r['pinyin']
            v['english']          = r['english']
            v['part_of_speech']   = r['part_of_speech']
            v['example']          = r['example']
            v['translation']      = r['translation']
            v['example_pinyin']   = py(r['example'])
            v['_sent_zh']         = r['_sent_zh']
            v['_sent_en']         = r['_sent_en']
            print(f'  L{lesson_num}: {old} → {r["chinese"]}')

    # --- add new vocab after last non-phrase ---
    extras = mutations.get('add_vocab', [])
    if extras:
        last_np = max(i for i, v in enumerate(data['vocabulary'])
                      if v.get('part_of_speech') != 'phrase')
        for offset, e in enumerate(extras):
            entry = {k: e[k] for k in ('id','chinese','pinyin','english','part_of_speech','example','translation')}
            entry['example_pinyin'] = py(e['example'])
            entry['_sent_zh'] = e['_sent_zh']
            entry['_sent_en'] = e['_sent_en']
            data['vocabulary'].insert(last_np + 1 + offset, entry)
            print(f'  L{lesson_num}: added {e["chinese"]} as {e["id"]}')

    # --- grammar: remove by number ---
    remove_gp_nums = mutations.get('remove_grammar', [])
    if remove_gp_nums:
        data['grammar_points'] = [gp for gp in data['grammar_points']
                                   if gp['number'] not in remove_gp_nums]
        for n in remove_gp_nums:
            print(f'  L{lesson_num}: removed GP{n}')

    # --- grammar: replace by number ---
    for num, new_gp in mutations.get('replace_grammar', {}).items():
        for i, gp in enumerate(data['grammar_points']):
            if gp['number'] == num:
                data['grammar_points'][i] = new_gp
                print(f'  L{lesson_num}: replaced GP{num} → {new_gp["title"]}')
                break

    # --- grammar: add new ---
    for new_gp in mutations.get('add_grammar', []):
        data['grammar_points'].append(new_gp)
        print(f'  L{lesson_num}: added GP{new_gp["number"]}: {new_gp["title"]}')

    # --- renumber grammar points 1,2,3... in order ---
    for idx, gp in enumerate(data['grammar_points'], 1):
        gp['number'] = idx

    # --- attach _sent_zh/_sent_en for existing vocab missing them ---
    for v in data['vocabulary']:
        if '_sent_zh' not in v:
            ex = v.get('example', '')
            if v['chinese'] in ex:
                v['_sent_zh'] = ex.replace(v['chinese'], '___', 1)
                v['_sent_en'] = v.get('translation', v['english'])
            else:
                v['_sent_zh'] = '___。'
                v['_sent_en'] = v['english']

    # --- regenerate mini_exercises for all non-phrase vocab ---
    pool = [v for v in data['vocabulary'] if v.get('part_of_speech') != 'phrase']
    for v in pool:
        v['mini_exercises'] = make_mini(v, pool)

    # --- clean temp keys ---
    for v in data['vocabulary']:
        v.pop('_sent_zh', None)
        v.pop('_sent_en', None)

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f'L{lesson_num}: saved ({len(pool)} non-phrase vocab, '
          f'{len(data["grammar_points"])} grammar pts)')


MUTATIONS = {
    1: {
        'add_vocab':       L1_EXTRA,
        'replace_grammar': {1: gp_mashang(), 2: gp_anpai()},
    },
    2: {
        'replace_vocab':   L2_REPLACEMENTS,
        'remove_grammar':  [2],   # 越来越
    },
    3: {
        'remove_grammar':  [1],   # 随着
    },
    4: {
        'remove_vocab':    L4_REMOVE,
        'add_vocab':       L4_EXTRA,
        'remove_grammar':  [2, 3],   # 越...越 and 把字句
        'add_grammar':     [gp_zai_shang()],
    },
    5: {
        'remove_vocab':    L5_REMOVE,
        'replace_vocab':   L5_REPLACEMENTS,
        'remove_grammar':  [1, 3],   # 只要...就... and 一...就...
        'add_grammar':     [gp_kanlai()],
    },
}

for lesson_num, mutations in MUTATIONS.items():
    path = os.path.join(DATA_DIR, f'hsk5_lesson_{lesson_num}.json')
    print(f'\n--- Processing L{lesson_num} ---')
    process_lesson(lesson_num, path, mutations)

print('\nDone!')
