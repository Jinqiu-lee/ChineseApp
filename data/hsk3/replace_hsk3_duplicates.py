"""
Replace duplicate / unwanted words in HSK3 lessons 3, 4, 5, 6, 8, 9, 10, 11, 12, 14, 15.
Keeps dialogues / exercises / grammar_points untouched.
Regenerates mini_exercises for ALL non-phrase vocab in each affected lesson.
"""
import json, random, re, os
from pypinyin import lazy_pinyin, Style

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
CJK_RE = re.compile(r'[一-鿿]')
random.seed(42)


def text_to_pinyin(text):
    syllables = lazy_pinyin(text, style=Style.TONE)
    return ' '.join(
        syllables[i] for i, ch in enumerate(text)
        if CJK_RE.match(ch) and i < len(syllables)
    )


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
        "option_pinyin": [ep.get(o, '') for o in eng_opts],
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
        "question_english": sent_en,
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
        "option_pinyin": [cp.get(o, '') for o in ch_opts],
    }
    return [mcq_eng, fb, mcq_zh]


# ── Replacements ────────────────────────────────────────────────────────────────
# Key: (lesson_num, old_chinese)
REPLACEMENTS = {
    (3, '放'): dict(
        chinese='摆', pinyin='bǎi',
        english='To arrange / To display / To place',
        part_of_speech='verb',
        example='把书摆在书架上。',
        translation='Put the books on the shelf.',
        _sent_zh='把书___在书架上。',
        _sent_en='Put the books on the shelf.',
    ),
    (3, '旁边'): dict(
        chinese='挨着', pinyin='āi zhe',
        english='Right next to / Adjacent to',
        part_of_speech='verb',
        example='图书馆挨着咖啡厅。',
        translation='The library is right next to the coffee shop.',
        _sent_zh='图书馆___咖啡厅。',
        _sent_en='The library is right next to the coffee shop.',
    ),
    (4, '借'): dict(
        chinese='八卦', pinyin='bā guà',
        english='Gossip / To gossip',
        part_of_speech='noun/verb',
        example='他喜欢八卦，总是说别人的事。',
        translation='He likes to gossip and always talks about others.',
        _sent_zh='他喜欢___，总是说别人的事。',
        _sent_en='He likes to gossip and always talks about others.',
    ),
    (6, '肯定'): dict(
        chinese='确定', pinyin='què dìng',
        english='To confirm / Certain / Sure',
        part_of_speech='adjective/verb',
        example='好像在那里，但我不确定。',
        translation="It seems to be there, but I'm not sure.",
        _sent_zh='好像在那里，但我不___。',
        _sent_en="It seems to be there, but I'm not sure.",
    ),
    (10, '难'): dict(
        chinese='困难', pinyin='kùn nán',
        english='Difficult / Difficulty',
        part_of_speech='adjective',
        example='这道题对我来说很困难。',
        translation='This question is very difficult for me.',
        _sent_zh='这道题对我来说很___。',
        _sent_en='This question is very difficult for me.',
    ),
    (10, '进步'): dict(
        chinese='提升', pinyin='tí shēng',
        english='To improve / To enhance / To raise',
        part_of_speech='verb',
        example='他的成绩提升了很多。',
        translation='His grades improved a lot.',
        _sent_zh='他的成绩___了很多。',
        _sent_en='His grades improved a lot.',
    ),
    (11, '顺便'): dict(
        chinese='正好', pinyin='zhèng hǎo',
        english='Happen to / Just right / Exactly',
        part_of_speech='adverb',
        example='我正好在附近，可以帮你。',
        translation='I happen to be nearby and can help you.',
        _sent_zh='我___在附近，可以帮你。',
        _sent_en='I happen to be nearby and can help you.',
    ),
    (11, '帮'): dict(
        chinese='帮助', pinyin='bāng zhù',
        english='To help / Help / Assistance',
        part_of_speech='verb/noun',
        example='谢谢你的帮助！',
        translation='Thank you for your help!',
        _sent_zh='谢谢你的___！',
        _sent_en='Thank you for your help!',
    ),
    (11, '窗户'): dict(
        chinese='冰箱', pinyin='bīng xiāng',
        english='Refrigerator / Fridge',
        part_of_speech='noun',
        example='请把食物放进冰箱里。',
        translation='Please put the food in the fridge.',
        _sent_zh='请把食物放进___里。',
        _sent_en='Please put the food in the fridge.',
    ),
    (11, '灯'): dict(
        chinese='厨房', pinyin='chú fáng',
        english='Kitchen',
        part_of_speech='noun',
        example='妈妈在厨房做饭。',
        translation='Mum is cooking in the kitchen.',
        _sent_zh='妈妈在___做饭。',
        _sent_en='Mum is cooking in the kitchen.',
    ),
    (11, '开'): dict(
        chinese='打开', pinyin='dǎ kāi',
        english='To open / To turn on',
        part_of_speech='verb',
        example='他把窗户打开了。',
        translation='He opened the window.',
        _sent_zh='他把窗户___了。',
        _sent_en='He opened the window.',
    ),
    (11, '关'): dict(
        chinese='关上', pinyin='guān shàng',
        english='To close / To shut',
        part_of_speech='verb',
        example='请把窗户关上。',
        translation='Please close the window.',
        _sent_zh='请把窗户___。',
        _sent_en='Please close the window.',
    ),
    (12, '放'): dict(
        chinese='放心', pinyin='fàng xīn',
        english='To stop worrying / To be at ease',
        part_of_speech='verb',
        example='放心吧，我会保管好的。',
        translation='Don\'t worry, I will keep it safe.',
        _sent_zh='___吧，我会保管好的。',
        _sent_en="Don't worry, I will keep it safe.",
    ),
    (12, '丢'): dict(
        chinese='丢失', pinyin='diū shī',
        english='To lose / To misplace permanently',
        part_of_speech='verb',
        example='他的手机丢失了，找不到了。',
        translation='He lost his phone and can\'t find it.',
        _sent_zh='他的手机___了，找不到了。',
        _sent_en="He lost his phone and can't find it.",
    ),
    (14, '进来'): dict(
        chinese='行李', pinyin='xíng li',
        english='Luggage / Baggage',
        part_of_speech='noun',
        example='他把行李搬上来了。',
        translation='He brought the luggage up.',
        _sent_zh='他把___搬上来了。',
        _sent_en='He brought the luggage up.',
    ),
    (14, '出去'): dict(
        chinese='书架', pinyin='shū jià',
        english='Bookshelf / Bookcase',
        part_of_speech='noun',
        example='请把书放在书架上。',
        translation='Please put the books on the shelf.',
        _sent_zh='请把书放在___上。',
        _sent_en='Please put the books on the shelf.',
    ),
    (14, '带来'): dict(
        chinese='带', pinyin='dài',
        english='To bring / To take / To carry',
        part_of_speech='verb',
        example='那本书也要带过来吗？',
        translation='Does that book also need to be brought over?',
        _sent_zh='那本书也要___过来吗？',
        _sent_en='Does that book also need to be brought over?',
    ),
    (15, '差不多'): dict(
        chinese='挺', pinyin='tǐng',
        english='Quite / Pretty / Rather (colloquial)',
        part_of_speech='adverb',
        example='这个景点挺有意思的！',
        translation='This scenic spot is quite interesting!',
        _sent_zh='这个景点___有意思的！',
        _sent_en='This scenic spot is quite interesting!',
    ),
    (15, '不但'): dict(
        chinese='不仅', pinyin='bù jǐn',
        english='Not only',
        part_of_speech='conjunction',
        example='故宫不仅很有名，门票也不贵。',
        translation='The Forbidden City is not only very famous, the tickets are also cheap.',
        _sent_zh='故宫___很有名，门票也不贵。',
        _sent_en='The Forbidden City is not only very famous, the tickets are also cheap.',
    ),
    (15, '而且'): dict(
        chinese='甚至', pinyin='shèn zhì',
        english='Even / Even to the point of',
        part_of_speech='adverb/conjunction',
        example='她学得很快，甚至比老师还流利。',
        translation='She learns fast, she is even more fluent than the teacher.',
        _sent_zh='她学得很快，___比老师还流利。',
        _sent_en='She learns fast, she is even more fluent than the teacher.',
    ),
}

# ── Removals ────────────────────────────────────────────────────────────────────
# (lesson_num, chinese) pairs to delete from vocabulary
REMOVALS = {
    (5, '胖'),
    (9, '还'),
    (15, '反正'),
}

# ── Extra entries ────────────────────────────────────────────────────────────────
# lesson_num -> list of new vocab entries (in order of insertion)
EXTRA_ENTRIES = {
    3: [
        dict(id='hsk3_l3_13', chinese='小说', pinyin='xiǎo shuō',
             english='Novel / Fiction', part_of_speech='noun',
             example='这部小说很有意思。', translation='This novel is very interesting.',
             _sent_zh='这部___很有意思。', _sent_en='This novel is very interesting.'),
        dict(id='hsk3_l3_14', chinese='部', pinyin='bù',
             english='[Measure word for phones, movies, novels, TV shows]',
             part_of_speech='measure word',
             example='他买了一部新手机。', translation='He bought a new mobile phone.',
             _sent_zh='他买了一___新手机。', _sent_en='He bought a new mobile phone.'),
    ],
    4: [
        dict(id='hsk3_l4_13', chinese='调', pinyin='tiáo',
             english='To adjust / To tune / To regulate', part_of_speech='verb',
             example='叫她把声音调小一点。', translation='Ask her to turn the volume down a bit.',
             _sent_zh='叫她把声音___小一点。', _sent_en='Ask her to turn the volume down a bit.'),
        dict(id='hsk3_l4_14', chinese='在意', pinyin='zài yì',
             english='To care about / To mind', part_of_speech='verb',
             example='你别在意她说的话。', translation="Don't take what she says to heart.",
             _sent_zh='你别___她说的话。', _sent_en="Don't take what she says to heart."),
        dict(id='hsk3_l4_15', chinese='尊重', pinyin='zūn zhòng',
             english='To respect / Respect', part_of_speech='verb/noun',
             example='我们应该互相尊重。', translation='We should respect each other.',
             _sent_zh='我们应该互相___。', _sent_en='We should respect each other.'),
        dict(id='hsk3_l4_16', chinese='烦人', pinyin='fán rén',
             english='Annoying / To be a nuisance', part_of_speech='adjective',
             example='邻居总是说别人的闲话，真烦人。',
             translation='The neighbour always gossips about others — so annoying.',
             _sent_zh='邻居总是说别人的闲话，真___。',
             _sent_en='The neighbour always gossips about others — so annoying.'),
    ],
    5: [
        dict(id='hsk3_l5_13', chinese='油腻', pinyin='yóu nì',
             english='Greasy / Oily', part_of_speech='adjective',
             example='这道菜太油腻了，不健康。', translation='This dish is too greasy, not healthy.',
             _sent_zh='这道菜太___了，不健康。', _sent_en='This dish is too greasy, not healthy.'),
        dict(id='hsk3_l5_14', chinese='注意', pinyin='zhù yì',
             english='To pay attention to / To be careful', part_of_speech='verb',
             example='她最近比较注意饮食，也坚持锻炼。',
             translation='She has been paying attention to her diet and persisting with exercise.',
             _sent_zh='她___饮食，也坚持锻炼。',
             _sent_en='She has been paying attention to her diet and persisting with exercise.'),
        dict(id='hsk3_l5_15', chinese='懒', pinyin='lǎn',
             english='Lazy', part_of_speech='adjective',
             example='他最近很懒，不想锻炼。',
             translation="He has been very lazy lately and doesn't want to exercise.",
             _sent_zh='他最近很___，不想锻炼。',
             _sent_en="He has been very lazy lately and doesn't want to exercise."),
        dict(id='hsk3_l5_16', chinese='营养', pinyin='yíng yǎng',
             english='Nutrition / Nutrients / Nutritious', part_of_speech='noun',
             example='均衡饮食很重要，要注意营养。',
             translation='A balanced diet is important; you need to pay attention to nutrition.',
             _sent_zh='均衡饮食很重要，要注意___。',
             _sent_en='A balanced diet is important; you need to pay attention to nutrition.'),
    ],
    6: [
        dict(id='hsk3_l6_13', chinese='遍', pinyin='biàn',
             english='[Measure word for complete passes through an action]',
             part_of_speech='measure word',
             example='我把这篇文章读了三遍。',
             translation='I read this article three times through.',
             _sent_zh='我把这篇文章读了三___。', _sent_en='I read this article three times through.'),
        dict(id='hsk3_l6_14', chinese='钱包', pinyin='qián bāo',
             english='Wallet / Purse', part_of_speech='noun',
             example='我的钱包忽然不见了，怎么办？',
             translation='My wallet suddenly disappeared — what should I do?',
             _sent_zh='我的___忽然不见了，怎么办？',
             _sent_en='My wallet suddenly disappeared — what should I do?'),
        dict(id='hsk3_l6_15', chinese='沙发', pinyin='shā fā',
             english='Sofa / Couch', part_of_speech='noun',
             example='手机可能在沙发下面。', translation='The phone might be under the sofa.',
             _sent_zh='手机可能在___下面。', _sent_en='The phone might be under the sofa.'),
        dict(id='hsk3_l6_16', chinese='餐厅', pinyin='cān tīng',
             english='Restaurant / Dining room', part_of_speech='noun',
             example='你好像刚才在餐厅吃饭。',
             translation='It seems you were eating at the restaurant just now.',
             _sent_zh='你好像刚才在___吃饭。',
             _sent_en='It seems you were eating at the restaurant just now.'),
        dict(id='hsk3_l6_17', chinese='垫子', pinyin='diàn zi',
             english='Cushion / Pad / Mat', part_of_speech='noun',
             example='钱包在沙发垫子下面。', translation='The wallet is under the sofa cushion.',
             _sent_zh='钱包在沙发___下面。', _sent_en='The wallet is under the sofa cushion.'),
    ],
    8: [
        dict(id='hsk3_l8_13', chinese='支持', pinyin='zhī chí',
             english='To support / Support', part_of_speech='verb',
             example='不管你做什么选择，我都支持你。',
             translation='No matter what choice you make, I support you.',
             _sent_zh='不管你做什么选择，我都___你。',
             _sent_en='No matter what choice you make, I support you.'),
        dict(id='hsk3_l8_14', chinese='相信', pinyin='xiāng xìn',
             english='To believe / To trust', part_of_speech='verb',
             example='我相信你一定能做到。', translation='I believe you can definitely do it.',
             _sent_zh='我___你一定能做到。', _sent_en='I believe you can definitely do it.'),
    ],
    9: [
        dict(id='hsk3_l9_13', chinese='语言', pinyin='yǔ yán',
             english='Language', part_of_speech='noun',
             example='汉语是一门有趣的语言。', translation='Mandarin is an interesting language.',
             _sent_zh='汉语是一门有趣的___。', _sent_en='Mandarin is an interesting language.'),
        dict(id='hsk3_l9_14', chinese='口语', pinyin='kǒu yǔ',
             english='Spoken language / Oral Chinese', part_of_speech='noun',
             example='他的汉语口语非常流利。', translation='His spoken Chinese is very fluent.',
             _sent_zh='他的汉语___非常流利。', _sent_en='His spoken Chinese is very fluent.'),
        dict(id='hsk3_l9_15', chinese='鼓励', pinyin='gǔ lì',
             english='To encourage / Encouragement', part_of_speech='verb/noun',
             example='你的鼓励让我很开心。', translation='Your encouragement makes me very happy.',
             _sent_zh='你的___让我很开心。', _sent_en='Your encouragement makes me very happy.'),
        dict(id='hsk3_l9_16', chinese='诗', pinyin='shī',
             english='Poem / Poetry', part_of_speech='noun',
             example='她写的句子像诗一样美。',
             translation='The sentences she writes are as beautiful as poetry.',
             _sent_zh='她写的句子像___一样美。',
             _sent_en='The sentences she writes are as beautiful as poetry.'),
        dict(id='hsk3_l9_17', chinese='启发', pinyin='qǐ fā',
             english='To inspire / To enlighten / Inspiration', part_of_speech='verb/noun',
             example='这本书让我很受启发。', translation='This book is very inspiring for me.',
             _sent_zh='这本书让我很受___。', _sent_en='This book is very inspiring for me.'),
    ],
    10: [
        dict(id='hsk3_l10_13', chinese='练习', pinyin='liàn xí',
             english='To practice / Practice', part_of_speech='verb/noun',
             example='老师给了我们一些练习题。',
             translation='The teacher gave us some practice questions.',
             _sent_zh='老师给了我们一些___题。',
             _sent_en='The teacher gave us some practice questions.'),
        dict(id='hsk3_l10_14', chinese='写作', pinyin='xiě zuò',
             english='Writing / To write / Composition', part_of_speech='noun/verb',
             example='写作需要多练习。', translation='Writing requires a lot of practice.',
             _sent_zh='___需要多练习。', _sent_en='Writing requires a lot of practice.'),
        dict(id='hsk3_l10_15', chinese='内容', pinyin='nèi róng',
             english='Content / Subject matter', part_of_speech='noun',
             example='再认真复习这些科目的内容。',
             translation='Carefully revise the content of these subjects again.',
             _sent_zh='再认真复习这些科目的___。',
             _sent_en='Carefully revise the content of these subjects again.'),
    ],
    11: [
        dict(id='hsk3_l11_13', chinese='帮忙', pinyin='bāng máng',
             english='To help out / To do a favor', part_of_speech='verb',
             example='你能帮我一个忙吗？', translation='Can you do me a favor?',
             _sent_zh='你能___我吗？', _sent_en='Can you do me a favor?'),
    ],
    12: [
        dict(id='hsk3_l12_13', chinese='钥匙', pinyin='yào shi',
             english='Key', part_of_speech='noun',
             example='请把钥匙放在门口。', translation='Please put the key by the door.',
             _sent_zh='请把___放在门口。', _sent_en='Please put the key by the door.'),
        dict(id='hsk3_l12_14', chinese='乱', pinyin='luàn',
             english='Messy / Chaotic / Disorderly', part_of_speech='adjective',
             example='他的房间很乱，找不到东西。',
             translation="His room is very messy and he can't find anything.",
             _sent_zh='他的房间很___，找不到东西。',
             _sent_en="His room is very messy and he can't find anything."),
    ],
    14: [
        dict(id='hsk3_l14_13', chinese='箱子', pinyin='xiāng zi',
             english='Suitcase / Box / Trunk', part_of_speech='noun',
             example='你能帮我把这些箱子搬进去吗？',
             translation='Can you help me carry these suitcases in?',
             _sent_zh='你能帮我把这些___搬进去吗？',
             _sent_en='Can you help me carry these suitcases in?'),
        dict(id='hsk3_l14_14', chinese='书房', pinyin='shū fáng',
             english='Study room / Study', part_of_speech='noun',
             example='把它们搬到楼上，放在书房里。',
             translation='Move them upstairs and put them in the study.',
             _sent_zh='把它们搬到楼上，放在___里。',
             _sent_en='Move them upstairs and put them in the study.'),
        dict(id='hsk3_l14_15', chinese='会议室', pinyin='huì yì shì',
             english='Conference room / Meeting room', part_of_speech='noun',
             example='会议室在哪儿？我找不到。',
             translation="Where is the conference room? I can't find it.",
             _sent_zh='___在哪儿？我找不到。',
             _sent_en="Where is the conference room? I can't find it."),
    ],
    15: [
        dict(id='hsk3_l15_11', chinese='订', pinyin='dìng',
             english='To book / To reserve / To order', part_of_speech='verb',
             example='机票和酒店都订好了。', translation='The flights and hotel are all booked.',
             _sent_zh='机票和酒店都___好了。', _sent_en='The flights and hotel are all booked.'),
        dict(id='hsk3_l15_12', chinese='行程', pinyin='xíng chéng',
             english='Itinerary / Travel plan / Schedule', part_of_speech='noun',
             example='我已经安排好了行程。', translation='I have already arranged the itinerary.',
             _sent_zh='我已经安排好了___。', _sent_en='I have already arranged the itinerary.'),
        dict(id='hsk3_l15_13', chinese='故宫', pinyin='gù gōng',
             english='The Forbidden City / The Palace Museum', part_of_speech='proper noun',
             example='故宫不仅很有名，门票也不贵。',
             translation='The Forbidden City is not only very famous, but the tickets are also affordable.',
             _sent_zh='___不仅很有名，门票也不贵。',
             _sent_en='The Forbidden City is not only very famous, but the tickets are also affordable.'),
        dict(id='hsk3_l15_14', chinese='景点', pinyin='jǐng diǎn',
             english='Scenic spot / Tourist attraction', part_of_speech='noun',
             example='我们几乎每天都安排了一个景点。',
             translation='We arranged almost one tourist attraction per day.',
             _sent_zh='我们几乎每天都安排了一个___。',
             _sent_en='We arranged almost one tourist attraction per day.'),
        dict(id='hsk3_l15_15', chinese='细节', pinyin='xì jié',
             english='Detail / Particulars', part_of_speech='noun',
             example='还有一些小细节需要确认。',
             translation='There are still some small details to confirm.',
             _sent_zh='还有一些小___需要确认。',
             _sent_en='There are still some small details to confirm.'),
    ],
}

# ── L15 special: 没问题 and 总的来说 need to stay as phrases, but 订/行程 should
#    be inserted BEFORE them (they will be the last non-phrase entries numbered
#    hsk3_l15_11 and hsk3_l15_12 — but currently slots 11/12 hold 没问题 /
#    总的来说 which are phrases; the extra entries just go after last non-phrase).

AFFECTED = sorted(
    {k[0] for k in REPLACEMENTS}
    | {lesson for lesson, _ in REMOVALS}
    | set(EXTRA_ENTRIES)
)

for lesson_num in AFFECTED:
    path = os.path.join(DATA_DIR, f'hsk3_lesson_{lesson_num}.json')
    with open(path, encoding='utf-8') as f:
        data = json.load(f)

    # Step 1: apply replacements in-place
    for v in data['vocabulary']:
        key = (lesson_num, v['chinese'])
        if key in REPLACEMENTS:
            r = REPLACEMENTS[key]
            old = v['chinese']
            v['chinese']        = r['chinese']
            v['pinyin']         = r['pinyin']
            v['english']        = r['english']
            v['part_of_speech'] = r['part_of_speech']
            v['example']        = r['example']
            v['translation']    = r['translation']
            v['example_pinyin'] = text_to_pinyin(r['example'])
            v['_sent_zh']       = r['_sent_zh']
            v['_sent_en']       = r['_sent_en']
            print(f'  L{lesson_num}: {old} → {r["chinese"]}')

    # Step 2: remove words in REMOVALS
    before_count = len(data['vocabulary'])
    data['vocabulary'] = [
        v for v in data['vocabulary']
        if (lesson_num, v['chinese']) not in REMOVALS
    ]
    removed = before_count - len(data['vocabulary'])
    if removed:
        print(f'  L{lesson_num}: removed {removed} entry/entries')

    # Step 3: insert extra entries after last non-phrase word
    if lesson_num in EXTRA_ENTRIES:
        for e in EXTRA_ENTRIES[lesson_num]:
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
            last_non_phrase = max(
                i for i, v in enumerate(data['vocabulary'])
                if v.get('part_of_speech') != 'phrase'
            )
            data['vocabulary'].insert(last_non_phrase + 1, new_entry)
            print(f'  L{lesson_num}: added {e["chinese"]} as {e["id"]}')

    # Step 4: attach _sent_zh / _sent_en to all entries that don't have them yet
    for v in data['vocabulary']:
        if '_sent_zh' not in v:
            ex = v.get('example', '')
            if v['chinese'] in ex:
                v['_sent_zh'] = ex.replace(v['chinese'], '___', 1)
                v['_sent_en'] = v.get('translation', v['english'])
            else:
                v['_sent_zh'] = '___。'
                v['_sent_en'] = v['english']

    # Step 5: build pool and regenerate mini_exercises for all non-phrase words
    pool = [v for v in data['vocabulary'] if v.get('part_of_speech') != 'phrase']
    for v in pool:
        v['mini_exercises'] = make_mini(v, pool)

    # Step 6: clean up temp keys before saving
    for v in data['vocabulary']:
        v.pop('_sent_zh', None)
        v.pop('_sent_en', None)

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f'L{lesson_num}: saved.')

print('\nDone!')
