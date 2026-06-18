"""
Replace duplicate words and update grammar points in HSK4 Level 4 lessons 1-15.
Keeps dialogues/key_sentences unchanged.
Regenerates mini_exercises for ALL non-phrase vocab in each affected lesson.
"""
import json, random, re, os
from pypinyin import lazy_pinyin, Style

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
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
        "question_english": sent_en
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

# ── Vocabulary replacements ──────────────────────────────────────────────────
# Key: (lesson_num, old_chinese); value: new vocab fields + _sent_zh/_sent_en
REPLACEMENTS = {
    (2, '互相'): dict(
        chinese='谅解', pinyin='liàng jiě',
        english='To forgive / To pardon / Understanding',
        part_of_speech='verb/noun',
        example='希望你能谅解我这次的错误。',
        translation='I hope you can forgive my mistake this time.',
        _sent_zh='希望你能___我这次的错误。',
        _sent_en='I hope you can forgive my mistake this time.',
    ),
    (2, '鼓励'): dict(
        chinese='信任', pinyin='xìn rèn',
        english='To trust / Trust / Confidence',
        part_of_speech='verb/noun',
        example='真正的友谊需要互相信任。',
        translation='True friendship requires mutual trust.',
        _sent_zh='真正的友谊需要互相___。',
        _sent_en='True friendship requires mutual trust.',
    ),
    (2, '支持'): dict(
        chinese='说谎', pinyin='shuō huǎng',
        english='To lie / To tell a lie',
        part_of_speech='verb',
        example='他从来不说谎，总是说实话。',
        translation='He never lies and always tells the truth.',
        _sent_zh='他从来不___，总是说实话。',
        _sent_en='He never lies and always tells the truth.',
    ),
    (5, '浪费'): dict(
        chinese='节省', pinyin='jié shěng',
        english='To save / To economize / Frugal',
        part_of_speech='verb/adjective',
        example='我们应该节省用水，保护环境。',
        translation='We should save water to protect the environment.',
        _sent_zh='我们应该___用水，保护环境。',
        _sent_en='We should save water to protect the environment.',
    ),
    (6, '优点'): dict(
        chinese='试', pinyin='shì',
        english='To try / To test / To taste',
        part_of_speech='verb',
        example='你可以先试一下，看合不合适。',
        translation='You can try it first to see if it is suitable.',
        _sent_zh='你可以先___一下，看合不合适。',
        _sent_en='You can try it first to see if it is suitable.',
    ),
    (7, '质量'): dict(
        chinese='流程', pinyin='liú chéng',
        english='Process / Procedure / Workflow',
        part_of_speech='noun',
        example='公司的工作流程非常严格。',
        translation="The company's work process is very strict.",
        _sent_zh='公司的工作___非常严格。',
        _sent_en="The company's work process is very strict.",
    ),
    (8, '减肥'): dict(
        chinese='疼', pinyin='téng',
        english='Painful / To hurt / To ache',
        part_of_speech='adjective/verb',
        example='我头很疼，需要去医院。',
        translation='My head hurts a lot, I need to go to the hospital.',
        _sent_zh='我头很___，需要去医院。',
        _sent_en='My head hurts a lot, I need to go to the hospital.',
    ),
    (8, '温度'): dict(
        chinese='体温', pinyin='tǐ wēn',
        english='Body temperature',
        part_of_speech='noun',
        example='护士帮我量了体温。',
        translation='The nurse took my temperature.',
        _sent_zh='护士帮我量了___。',
        _sent_en='The nurse took my temperature.',
    ),
    (9, '坚持'): dict(
        chinese='保持', pinyin='bǎo chí',
        english='To maintain / To keep / To preserve',
        part_of_speech='verb',
        example='我们要保持健康的生活方式。',
        translation='We should maintain a healthy lifestyle.',
        _sent_zh='我们要___健康的生活方式。',
        _sent_en='We should maintain a healthy lifestyle.',
    ),
    (10, '云'): dict(
        chinese='上升', pinyin='shàng shēng',
        english='To rise / To go up / To ascend',
        part_of_speech='verb',
        example='近年来气温不断上升。',
        translation='In recent years, temperatures have been rising continuously.',
        _sent_zh='近年来气温不断___。',
        _sent_en='In recent years, temperatures have been rising continuously.',
    ),
    (11, '减少'): dict(
        chinese='下降', pinyin='xià jiàng',
        english='To fall / To drop / To decline',
        part_of_speech='verb',
        example='今年冬天气温下降得很快。',
        translation='This winter, temperatures dropped very quickly.',
        _sent_zh='今年冬天气温___得很快。',
        _sent_en='This winter, temperatures dropped very quickly.',
    ),
    (11, '发展'): dict(
        chinese='防止', pinyin='fáng zhǐ',
        english='To prevent / To guard against',
        part_of_speech='verb',
        example='我们要采取措施防止环境污染。',
        translation='We need to take measures to prevent environmental pollution.',
        _sent_zh='我们要采取措施___环境污染。',
        _sent_en='We need to take measures to prevent environmental pollution.',
    ),
    (11, '危险'): dict(
        chinese='着凉', pinyin='zháo liáng',
        english='To catch a cold / To catch a chill',
        part_of_speech='verb',
        example='天气变冷了，小心着凉。',
        translation='The weather has turned cold, be careful not to catch a chill.',
        _sent_zh='天气变冷了，小心___。',
        _sent_en='The weather has turned cold, be careful not to catch a chill.',
    ),
    (11, '担心'): dict(
        chinese='放心', pinyin='fàng xīn',
        english="To feel relieved / Rest assured / Don't worry",
        part_of_speech='verb/adjective',
        example='你放心，我会照顾好自己的。',
        translation="Don't worry, I'll take good care of myself.",
        _sent_zh='你___，我会照顾好自己的。',
        _sent_en="Don't worry, I'll take good care of myself.",
    ),
    (12, '成功'): dict(
        chinese='胜利', pinyin='shèng lì',
        english='Victory / Success / To win',
        part_of_speech='noun/verb',
        example='经过努力，队伍终于取得了胜利。',
        translation='After hard work, the team finally achieved victory.',
        _sent_zh='经过努力，队伍终于取得了___。',
        _sent_en='After hard work, the team finally achieved victory.',
    ),
    (12, '坚持'): dict(
        chinese='放弃', pinyin='fàng qì',
        english='To give up / To abandon / To quit',
        part_of_speech='verb',
        example='不要轻易放弃自己的梦想。',
        translation="Don't easily give up on your dreams.",
        _sent_zh='不要轻易___自己的梦想。',
        _sent_en="Don't easily give up on your dreams.",
    ),
    (12, '积极'): dict(
        chinese='挑战', pinyin='tiǎo zhàn',
        english='Challenge / To challenge',
        part_of_speech='noun/verb',
        example='面对挑战，要保持勇敢的态度。',
        translation='When facing challenges, maintain a brave attitude.',
        _sent_zh='面对___，要保持勇敢的态度。',
        _sent_en='When facing challenges, maintain a brave attitude.',
    ),
    (13, '幸福'): dict(
        chinese='时刻', pinyin='shí kè',
        english='Moment / At all times / Always',
        part_of_speech='noun/adverb',
        example='我时刻都记得家人的关心。',
        translation='I always remember the care of my family.',
        _sent_zh='我___都记得家人的关心。',
        _sent_en='I always remember the care of my family.',
    ),
    (13, '愉快'): dict(
        chinese='自在', pinyin='zì zài',
        english='Free and easy / Comfortable / At ease',
        part_of_speech='adjective',
        example='在大自然中，她感到非常自在。',
        translation='In nature, she feels very at ease.',
        _sent_zh='在大自然中，她感到非常___。',
        _sent_en='In nature, she feels very at ease.',
    ),
    (13, '开心'): dict(
        chinese='知足常乐', pinyin='zhī zú cháng lè',
        english='Content people are always happy / Satisfaction brings happiness',
        part_of_speech='idiom',
        example='知足常乐，不要总是追求更多。',
        translation='Be content and always happy; do not always chase more.',
        _sent_zh='___，不要总是追求更多。',
        _sent_en='Be content and always happy; do not always chase more.',
    ),
    (14, '重视'): dict(
        chinese='承担', pinyin='chéng dān',
        english='To bear / To take on / To shoulder (responsibility)',
        part_of_speech='verb',
        example='每个人都要承担自己的社会责任。',
        translation='Everyone must shoulder their own social responsibilities.',
        _sent_zh='每个人都要___自己的社会责任。',
        _sent_en='Everyone must shoulder their own social responsibilities.',
    ),
    (15, '艺术'): dict(
        chinese='脸谱', pinyin='liǎn pǔ',
        english='Painted face / Face mask (in Chinese opera)',
        part_of_speech='noun',
        example='京剧的脸谱非常有特色，代表不同的人物性格。',
        translation='The painted faces in Peking opera are very distinctive.',
        _sent_zh='京剧的___非常有特色，代表不同的人物性格。',
        _sent_en='The painted faces in Peking opera are very distinctive.',
    ),
    (15, '小说'): dict(
        chinese='订阅', pinyin='dìng yuè',
        english='To subscribe / Subscription',
        part_of_speech='verb/noun',
        example='我订阅了这本杂志，每月都能收到。',
        translation='I subscribed to this magazine and receive it every month.',
        _sent_zh='我___了这本杂志，每月都能收到。',
        _sent_en='I subscribed to this magazine and receive it every month.',
    ),
}

# ── Vocabulary removals (delete entire entry) ─────────────────────────────────
# L14: 发展 is duplicate with L11; its intended replacement (国际) already exists in L14
REMOVALS = {
    14: ['发展'],
}

# ── New vocabulary entries (inserted after last non-phrase) ───────────────────
EXTRA_ENTRIES = {
    1: [
        dict(id='hsk4_l1_13', chinese='体贴', pinyin='tǐ tiē',
             english='Considerate / Thoughtful / Attentive',
             part_of_speech='adjective',
             example='他对朋友非常体贴，经常主动帮助别人。',
             translation='He is very considerate to his friends and often takes the initiative to help others.',
             _sent_zh='他对朋友非常___，经常主动帮助别人。',
             _sent_en='He is very considerate to his friends.'),
        dict(id='hsk4_l1_14', chinese='温柔', pinyin='wēn róu',
             english='Gentle / Tender / Soft',
             part_of_speech='adjective',
             example='她说话很温柔，让人感到舒服。',
             translation='She speaks very gently, making people feel comfortable.',
             _sent_zh='她说话很___，让人感到舒服。',
             _sent_en='She speaks very gently, making people feel comfortable.'),
        dict(id='hsk4_l1_15', chinese='优点', pinyin='yōu diǎn',
             english='Strong point / Advantage / Merit',
             part_of_speech='noun',
             example='每个人都有自己的优点和缺点。',
             translation='Everyone has their own strengths and weaknesses.',
             _sent_zh='每个人都有自己的___和缺点。',
             _sent_en='Everyone has their own strengths and weaknesses.'),
    ],
    2: [
        dict(id='hsk4_l2_13', chinese='中断', pinyin='zhōng duàn',
             english='To interrupt / To break off / To suspend',
             part_of_speech='verb',
             example='联系中断了，我不知道他现在怎么样。',
             translation='Contact was broken off, and I do not know how he is now.',
             _sent_zh='联系___了，我不知道他现在怎么样。',
             _sent_en='Contact was broken off.'),
        dict(id='hsk4_l2_14', chinese='消失', pinyin='xiāo shī',
             english='To disappear / To vanish',
             part_of_speech='verb',
             example='朋友突然消失了，让我很担心。',
             translation='My friend suddenly disappeared, which made me very worried.',
             _sent_zh='朋友突然___了，让我很担心。',
             _sent_en='My friend suddenly disappeared.'),
        dict(id='hsk4_l2_15', chinese='长久', pinyin='cháng jiǔ',
             english='Lasting / Long-term / For a long time',
             part_of_speech='adjective/adverb',
             example='他们的友谊非常长久。',
             translation='Their friendship is very lasting.',
             _sent_zh='他们的友谊非常___。',
             _sent_en='Their friendship is very lasting.'),
        dict(id='hsk4_l2_16', chinese='段', pinyin='duàn',
             english='[Measure word for sections, periods, or segments]',
             part_of_speech='measure word',
             example='我们已经认识了一段时间了。',
             translation='We have known each other for a period of time.',
             _sent_zh='我们已经认识了一___时间了。',
             _sent_en='We have known each other for a period of time.'),
    ],
    3: [
        dict(id='hsk4_l3_13', chinese='客户', pinyin='kè hù',
             english='Client / Customer',
             part_of_speech='noun',
             example='他负责和客户保持联系。',
             translation='He is responsible for maintaining contact with clients.',
             _sent_zh='他负责和___保持联系。',
             _sent_en='He is responsible for maintaining contact with clients.'),
        dict(id='hsk4_l3_14', chinese='清楚', pinyin='qīng chǔ',
             english='Clear / Clearly / To understand clearly',
             part_of_speech='adjective/adverb',
             example='请你说清楚一点，我没听懂。',
             translation='Please speak more clearly, I did not understand.',
             _sent_zh='请你说___一点，我没听懂。',
             _sent_en='Please speak more clearly.'),
    ],
    4: [
        dict(id='hsk4_l4_16', chinese='宣传', pinyin='xuān chuán',
             english='To publicize / Publicity / Promotion',
             part_of_speech='verb/noun',
             example='公司需要做好宣传工作来吸引更多客户。',
             translation='The company needs to do good publicity work to attract more clients.',
             _sent_zh='公司需要做好___工作来吸引更多客户。',
             _sent_en='The company needs to do good publicity work.'),
        dict(id='hsk4_l4_17', chinese='态度', pinyin='tài dù',
             english='Attitude / Manner / Stance',
             part_of_speech='noun',
             example='工作态度非常重要，影响工作结果。',
             translation='Work attitude is very important and affects work results.',
             _sent_zh='工作___非常重要，影响工作结果。',
             _sent_en='Work attitude is very important.'),
    ],
    5: [
        dict(id='hsk4_l5_13', chinese='支付', pinyin='zhī fù',
             english='To pay / To make a payment',
             part_of_speech='verb',
             example='你可以用手机支付，非常方便。',
             translation='You can pay with your phone, it is very convenient.',
             _sent_zh='你可以用手机___，非常方便。',
             _sent_en='You can pay with your phone.'),
        dict(id='hsk4_l5_14', chinese='消费', pinyin='xiāo fèi',
             english='To consume / Consumption / Spending',
             part_of_speech='verb/noun',
             example='我们要理性消费，不能乱花钱。',
             translation='We should consume rationally and not spend money carelessly.',
             _sent_zh='我们要理性___，不能乱花钱。',
             _sent_en='We should consume rationally.'),
        dict(id='hsk4_l5_15', chinese='财务', pinyin='cái wù',
             english='Finance / Financial / Accounting',
             part_of_speech='noun',
             example='他在公司负责财务工作。',
             translation='He is responsible for financial work at the company.',
             _sent_zh='他在公司负责___工作。',
             _sent_en='He is responsible for financial work.'),
        dict(id='hsk4_l5_16', chinese='块', pinyin='kuài',
             english='[Measure word for yuan / pieces of something]',
             part_of_speech='measure word',
             example='这本书只要二十块钱。',
             translation='This book only costs twenty yuan.',
             _sent_zh='这本书只要二十___钱。',
             _sent_en='This book only costs twenty yuan.'),
        dict(id='hsk4_l5_17', chinese='笔', pinyin='bǐ',
             english='[Measure word for sums of money or written items]',
             part_of_speech='measure word',
             example='他赚了一大笔钱，买了新房子。',
             translation='He earned a large sum of money and bought a new house.',
             _sent_zh='他赚了一大___钱，买了新房子。',
             _sent_en='He earned a large sum of money.'),
        dict(id='hsk4_l5_18', chinese='套', pinyin='tào',
             english='[Measure word for sets, suites, or complete collections]',
             part_of_speech='measure word',
             example='他们买了一套新房子。',
             translation='They bought a new apartment.',
             _sent_zh='他们买了一___新房子。',
             _sent_en='They bought a new apartment.'),
    ],
    6: [
        # 免费 already exists at hsk4_l6_05 — skip it
        dict(id='hsk4_l6_13', chinese='优惠', pinyin='yōu huì',
             english='Preferential / Discount / Special offer',
             part_of_speech='adjective/noun',
             example='今天有优惠活动，买两件打八折。',
             translation='There is a special offer today, buy two items at 80% off.',
             _sent_zh='今天有___活动，买两件打八折。',
             _sent_en='There is a special offer today.'),
        dict(id='hsk4_l6_14', chinese='退货', pinyin='tuì huò',
             english='To return goods / Return / Refund',
             part_of_speech='verb/noun',
             example='这件衣服有问题，我想退货。',
             translation='There is a problem with this piece of clothing, I would like to return it.',
             _sent_zh='这件衣服有问题，我想___。',
             _sent_en='I would like to return this item.'),
    ],
    7: [
        dict(id='hsk4_l7_13', chinese='出售', pinyin='chū shòu',
             english='To sell / To be on sale / For sale',
             part_of_speech='verb',
             example='这家店正在出售打折商品。',
             translation='This store is selling discounted goods.',
             _sent_zh='这家店正在___打折商品。',
             _sent_en='This store is selling discounted goods.'),
        dict(id='hsk4_l7_14', chinese='调整', pinyin='tiáo zhěng',
             english='To adjust / To regulate / Adjustment',
             part_of_speech='verb/noun',
             example='公司调整了工作计划，提高了效率。',
             translation='The company adjusted the work plan and improved efficiency.',
             _sent_zh='公司___了工作计划，提高了效率。',
             _sent_en='The company adjusted the work plan.'),
        dict(id='hsk4_l7_15', chinese='执行', pinyin='zhí xíng',
             english='To execute / To implement / To carry out',
             part_of_speech='verb',
             example='我们需要认真执行这个计划。',
             translation='We need to implement this plan carefully.',
             _sent_zh='我们需要认真___这个计划。',
             _sent_en='We need to implement this plan carefully.'),
    ],
    8: [
        dict(id='hsk4_l8_13', chinese='量', pinyin='liáng',
             english='To measure / To take a measurement',
             part_of_speech='verb',
             example='护士每天给病人量体温。',
             translation="The nurse takes the patient's temperature every day.",
             _sent_zh='护士每天给病人___体温。',
             _sent_en="The nurse takes the patient's temperature every day."),
        dict(id='hsk4_l8_14', chinese='严重', pinyin='yán zhòng',
             english='Serious / Severe / Grave',
             part_of_speech='adjective',
             example='他的病情很严重，需要立刻住院。',
             translation='His condition is very serious; he needs to be hospitalized immediately.',
             _sent_zh='他的病情很___，需要立刻住院。',
             _sent_en='His condition is very serious.'),
        dict(id='hsk4_l8_15', chinese='诊所', pinyin='zhěn suǒ',
             english='Clinic / Doctor\'s office',
             part_of_speech='noun',
             example='我去附近的诊所看病。',
             translation='I go to the nearby clinic to see a doctor.',
             _sent_zh='我去附近的___看病。',
             _sent_en='I go to the nearby clinic to see a doctor.'),
        dict(id='hsk4_l8_16', chinese='检查', pinyin='jiǎn chá',
             english='To examine / To check / Examination',
             part_of_speech='verb/noun',
             example='医生给我做了全面检查。',
             translation='The doctor gave me a thorough examination.',
             _sent_zh='医生给我做了全面___。',
             _sent_en='The doctor gave me a thorough examination.'),
    ],
    9: [
        dict(id='hsk4_l9_13', chinese='参加', pinyin='cān jiā',
             english='To participate / To join / To take part in',
             part_of_speech='verb',
             example='我每周都参加运动比赛。',
             translation='I participate in sports competitions every week.',
             _sent_zh='我每周都___运动比赛。',
             _sent_en='I participate in sports competitions every week.'),
        dict(id='hsk4_l9_14', chinese='参与', pinyin='cān yù',
             english='To participate / To be involved in (more formal)',
             part_of_speech='verb',
             example='希望更多人参与这项健康活动。',
             translation='I hope more people will get involved in this health activity.',
             _sent_zh='希望更多人___这项健康活动。',
             _sent_en='I hope more people will get involved in this health activity.'),
        dict(id='hsk4_l9_15', chinese='熬夜', pinyin='áo yè',
             english='To stay up late / To burn the midnight oil',
             part_of_speech='verb',
             example='经常熬夜对身体非常不好。',
             translation='Staying up late regularly is very bad for your health.',
             _sent_zh='经常___对身体非常不好。',
             _sent_en='Staying up late regularly is very bad for your health.'),
    ],
    10: [
        dict(id='hsk4_l10_13', chinese='逐渐', pinyin='zhú jiàn',
             english='Gradually / Little by little',
             part_of_speech='adverb',
             example='天气逐渐变暖，春天来了。',
             translation='The weather is gradually getting warmer; spring has arrived.',
             _sent_zh='天气___变暖，春天来了。',
             _sent_en='The weather is gradually getting warmer.'),
        dict(id='hsk4_l10_14', chinese='改善', pinyin='gǎi shàn',
             english='To improve / Improvement',
             part_of_speech='verb/noun',
             example='我们要努力改善环境，减少污染。',
             translation='We need to work hard to improve the environment and reduce pollution.',
             _sent_zh='我们要努力___环境，减少污染。',
             _sent_en='We need to work hard to improve the environment.'),
        dict(id='hsk4_l10_15', chinese='可惜', pinyin='kě xī',
             english='What a pity / Unfortunately / It\'s a shame',
             part_of_speech='adjective/adverb',
             example='可惜今天下雨，我们不能出去玩了。',
             translation='Unfortunately, it is raining today so we cannot go out to play.',
             _sent_zh='___今天下雨，我们不能出去玩了。',
             _sent_en='Unfortunately, it is raining today.'),
    ],
    12: [
        dict(id='hsk4_l12_14', chinese='连续', pinyin='lián xù',
             english='Continuous / Consecutive / In succession',
             part_of_speech='adjective/adverb',
             example='他连续工作了三天，非常疲惫。',
             translation='He worked continuously for three days and was very exhausted.',
             _sent_zh='他___工作了三天，非常疲惫。',
             _sent_en='He worked continuously for three days.'),
        dict(id='hsk4_l12_15', chinese='最终', pinyin='zuì zhōng',
             english='Finally / Ultimately / In the end',
             part_of_speech='adverb/adjective',
             example='经过多年努力，他最终实现了自己的目标。',
             translation='After years of hard work, he ultimately achieved his goal.',
             _sent_zh='经过多年努力，他___实现了自己的目标。',
             _sent_en='After years of hard work, he ultimately achieved his goal.'),
        dict(id='hsk4_l12_16', chinese='即使', pinyin='jí shǐ',
             english='Even if / Even though',
             part_of_speech='conjunction',
             example='即使遇到困难，也要坚持下去。',
             translation='Even if you encounter difficulties, you must keep going.',
             _sent_zh='___遇到困难，也要坚持下去。',
             _sent_en='Even if you encounter difficulties, you must keep going.'),
    ],
    13: [
        dict(id='hsk4_l13_13', chinese='根本', pinyin='gēn běn',
             english='Fundamental / Basically / Not at all',
             part_of_speech='adjective/adverb',
             example='他根本不明白这个道理。',
             translation='He does not understand this principle at all.',
             _sent_zh='他___不明白这个道理。',
             _sent_en='He does not understand this principle at all.'),
        dict(id='hsk4_l13_14', chinese='含义', pinyin='hán yì',
             english='Meaning / Implication / Connotation',
             part_of_speech='noun',
             example='这句话的含义很深，需要仔细思考。',
             translation='The meaning of this sentence is very deep and requires careful thought.',
             _sent_zh='这句话的___很深，需要仔细思考。',
             _sent_en='The meaning of this sentence is very deep.'),
        dict(id='hsk4_l13_15', chinese='道理', pinyin='dào lǐ',
             english='Reason / Logic / Principle / Truth',
             part_of_speech='noun',
             example='他说的道理我都明白，但做起来很难。',
             translation='I understand the points he is making, but it is hard to put them into practice.',
             _sent_zh='他说的___我都明白，但做起来很难。',
             _sent_en='I understand the points he is making.'),
    ],
    14: [
        # 法律 already exists at hsk4_l14_03 — skip it
        dict(id='hsk4_l14_13', chinese='职业', pinyin='zhí yè',
             english='Career / Occupation / Profession',
             part_of_speech='noun',
             example='选择一个好的职业非常重要。',
             translation='Choosing a good career is very important.',
             _sent_zh='选择一个好的___非常重要。',
             _sent_en='Choosing a good career is very important.'),
        dict(id='hsk4_l14_14', chinese='公民', pinyin='gōng mín',
             english='Citizen',
             part_of_speech='noun',
             example='每个公民都应该遵守法律。',
             translation='Every citizen should abide by the law.',
             _sent_zh='每个___都应该遵守法律。',
             _sent_en='Every citizen should abide by the law.'),
        dict(id='hsk4_l14_15', chinese='优秀', pinyin='yōu xiù',
             english='Excellent / Outstanding / Exceptional',
             part_of_speech='adjective',
             example='她是一位非常优秀的教育工作者。',
             translation='She is a very outstanding educator.',
             _sent_zh='她是一位非常___的教育工作者。',
             _sent_en='She is a very outstanding educator.'),
        dict(id='hsk4_l14_16', chinese='丰富', pinyin='fēng fù',
             english='Rich / Abundant / To enrich',
             part_of_speech='adjective/verb',
             example='中国有着丰富的文化传统。',
             translation='China has rich cultural traditions.',
             _sent_zh='中国有着___的文化传统。',
             _sent_en='China has rich cultural traditions.'),
    ],
    15: [
        dict(id='hsk4_l15_13', chinese='场', pinyin='chǎng',
             english='[Measure word for performances, events, or games]',
             part_of_speech='measure word',
             example='我们一起去看了一场精彩的演出。',
             translation='We went together to watch a wonderful performance.',
             _sent_zh='我们一起去看了一___精彩的演出。',
             _sent_en='We went together to watch a wonderful performance.'),
        dict(id='hsk4_l15_14', chinese='位', pinyin='wèi',
             english='[Respectful measure word for people]',
             part_of_speech='measure word',
             example='今天来了一位著名的京剧演员。',
             translation='A famous Peking opera performer came today.',
             _sent_zh='今天来了一___著名的京剧演员。',
             _sent_en='A famous Peking opera performer came today.'),
        dict(id='hsk4_l15_15', chinese='价值观', pinyin='jià zhí guān',
             english='Values / Value system / Worldview',
             part_of_speech='noun',
             example='艺术作品可以影响人的价值观。',
             translation="Works of art can influence people's values.",
             _sent_zh='艺术作品可以影响人的___。',
             _sent_en="Works of art can influence people's values."),
        dict(id='hsk4_l15_16', chinese='魅力', pinyin='mèi lì',
             english='Charm / Charisma / Appeal',
             part_of_speech='noun',
             example='京剧有着独特的魅力，吸引了很多外国人。',
             translation='Peking opera has a unique charm that attracts many foreigners.',
             _sent_zh='京剧有着独特的___，吸引了很多外国人。',
             _sent_en='Peking opera has a unique charm.'),
    ],
}

# ── New phrases (part_of_speech='phrase') ────────────────────────────────────
EXTRA_PHRASES = {
    14: [
        dict(id='hsk4_l14_p07', chinese='集体主义', pinyin='jí tǐ zhǔ yì',
             english='Collectivism', part_of_speech='phrase'),
        dict(id='hsk4_l14_p08', chinese='个人主义', pinyin='gè rén zhǔ yì',
             english='Individualism', part_of_speech='phrase'),
    ],
}

# ── Grammar point changes ─────────────────────────────────────────────────────
def gp_mini_bujin_shenzhi():
    return [
        {
            "type": "multiple_choice",
            "question": "不仅...甚至... expresses...",
            "correct": "Not only A, but even B (B is surprising or goes beyond A)",
            "options": [
                "Not only A, but even B (B is surprising or goes beyond A)",
                "Either A or B (a choice between two options)",
                "A because of B (a cause-and-effect relationship)",
                "Neither A nor B (complete negation of both)"
            ],
            "option_pinyin": ["bù jǐn...shèn zhì...", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: She not only learned Chinese, but even learned Japanese.",
            "correct": "甚至",
            "options": ["甚至", "而且", "但是", "所以"],
            "option_pinyin": ["shèn zhì", "ér qiě", "dàn shì", "suǒ yǐ"],
            "question_chinese": "她不仅学了汉语，___还学了日语。",
            "question_pinyin": "她不仅学了汉语，___还学了日语。",
            "question_english": "She not only learned Chinese, but even learned Japanese."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 不仅...甚至...?",
            "correct": "他们不仅赢了比赛，甚至还破了世界纪录。",
            "options": [
                "他们不仅赢了比赛，甚至还破了世界纪录。",
                "他们甚至赢了，不仅破了纪录。",
                "他们不仅，甚至赢了比赛。",
                "他们赢了比赛，不仅甚至破了纪录。"
            ],
            "option_pinyin": [
                text_to_pinyin("他们不仅赢了比赛甚至还破了世界纪录"),
                text_to_pinyin("他们甚至赢了不仅破了纪录"),
                "", ""
            ]
        }
    ]

def gp_mini_yidianr():
    return [
        {
            "type": "multiple_choice",
            "question": "一点儿 + 都/也 + 不/没 expresses...",
            "correct": "Complete negation — not even a tiny bit",
            "options": [
                "Complete negation — not even a tiny bit",
                "Partial negation — a little bit less than expected",
                "Emphasis that something is very much the case",
                "A contrast between two situations"
            ],
            "option_pinyin": ["yī diǎnr dōu bù / méi", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: He hasn't changed at all, still so young.",
            "correct": "一点儿",
            "options": ["一点儿", "非常", "有点儿", "很多"],
            "option_pinyin": ["yī diǎnr", "fēi cháng", "yǒu diǎnr", "hěn duō"],
            "question_chinese": "他___都没变，还是那么年轻。",
            "question_pinyin": "他___都没变，还是那么年轻。",
            "question_english": "He hasn't changed at all, still so young."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 一点儿...都/也...不/没?",
            "correct": "今天一点儿都不冷，穿一件衣服就行了。",
            "options": [
                "今天一点儿都不冷，穿一件衣服就行了。",
                "今天一点儿不都冷，穿一件衣服。",
                "今天都一点儿不冷，就穿一件。",
                "今天不一点儿都冷，衣服一件。"
            ],
            "option_pinyin": [
                text_to_pinyin("今天一点儿都不冷穿一件衣服就行了"),
                "", "", ""
            ]
        }
    ]

def gp_mini_liangcizi():
    return [
        {
            "type": "multiple_choice",
            "question": "名量词 (nominal measure words) are used with...",
            "correct": "Nouns — to count people, objects, or amounts",
            "options": [
                "Nouns — to count people, objects, or amounts",
                "Verbs — to count how many times an action occurs",
                "Adjectives — to show degrees of comparison",
                "Time expressions — to measure duration"
            ],
            "option_pinyin": ["míng liàng cí", "dòng liàng cí", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: He earned a large sum of money.",
            "correct": "笔",
            "options": ["笔", "块", "套", "件"],
            "option_pinyin": ["bǐ", "kuài", "tào", "jiàn"],
            "question_chinese": "他赚了一大___钱，买了新房子。",
            "question_pinyin": "他赚了一大___钱，买了新房子。",
            "question_english": "He earned a large sum of money and bought a new house."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses a 动量词 (verbal measure word)?",
            "correct": "我看了这本书两遍，记住了所有内容。",
            "options": [
                "我看了这本书两遍，记住了所有内容。",
                "我看了两本书遍，记住了内容。",
                "我遍看了这本书两，记住了内容。",
                "两遍我看了这本书，记住了。"
            ],
            "option_pinyin": [
                text_to_pinyin("我看了这本书两遍记住了所有内容"),
                "", "", ""
            ]
        }
    ]

def gp_mini_yikouqi():
    return [
        {
            "type": "multiple_choice",
            "question": "一口气 means...",
            "correct": "In one breath — to do something non-stop or continuously",
            "options": [
                "In one breath — to do something non-stop or continuously",
                "To take a deep breath before doing something",
                "To do something very slowly and carefully",
                "To pause in the middle of doing something"
            ],
            "option_pinyin": ["yī kǒu qì", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: She finished all her homework in one go.",
            "correct": "一口气",
            "options": ["一口气", "每次", "偶尔", "渐渐"],
            "option_pinyin": ["yī kǒu qì", "měi cì", "ǒu ěr", "jiàn jiàn"],
            "question_chinese": "她___把作业全做完了。",
            "question_pinyin": "她___把作业全做完了。",
            "question_english": "She finished all her homework in one go."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 一口气?",
            "correct": "他一口气读完了整本书，一页都没跳过。",
            "options": [
                "他一口气读完了整本书，一页都没跳过。",
                "他读了一口气书，整本。",
                "他一口气，读完书整本了。",
                "整本书他气一口读完了。"
            ],
            "option_pinyin": [
                text_to_pinyin("他一口气读完了整本书一页都没跳过"),
                "", "", ""
            ]
        }
    ]

GRAMMAR_CHANGES = {
    1: [
        {
            'action': 'add',
            'grammar': {
                'number': 4,
                'title': '不仅...甚至... — Not only...but even...',
                'explanation': (
                    '不仅...甚至... is an intensified version of 不仅...而且..., '
                    'used when the second element (甚至) is surprising, extreme, or goes well beyond '
                    'what was expected from the first.\n\n'
                    '• 不仅 introduces the first quality (already notable)\n'
                    '• 甚至 introduces something even more extreme or unexpected\n\n'
                    'Example: 他不仅会弹钢琴，甚至还会演奏小提琴。\n'
                    '(He not only plays the piano, but can even play the violin.)\n\n'
                    'Compare:\n'
                    '• 不仅...而且 — "not only...but also" (adding a similar quality)\n'
                    '• 不仅...甚至 — "not only...but even" (escalating to something surprising)'
                ),
                'examples': [
                    {
                        'chinese': '她不仅学了汉语，甚至还学了日语和韩语。',
                        'pinyin': text_to_pinyin('她不仅学了汉语甚至还学了日语和韩语'),
                        'english': 'She not only learned Chinese, but even learned Japanese and Korean.'
                    },
                    {
                        'chinese': '他们不仅赢了比赛，甚至还破了世界纪录。',
                        'pinyin': text_to_pinyin('他们不仅赢了比赛甚至还破了世界纪录'),
                        'english': 'They not only won the competition, but even broke the world record.'
                    },
                    {
                        'chinese': '这里的冬天不仅很冷，甚至会下很大的雪。',
                        'pinyin': text_to_pinyin('这里的冬天不仅很冷甚至会下很大的雪'),
                        'english': "The winter here is not only very cold, but it can even snow heavily."
                    }
                ],
                'exercises': [
                    {
                        'question': 'Choose the correct sentence using 不仅...甚至...',
                        'type': 'multiple_choice',
                        'correct': '他不仅完成了任务，甚至还提前交了。',
                        'options': [
                            '他不仅完成了任务，甚至还提前交了。',
                            '他甚至完成了，不仅提前交了任务。',
                            '他不仅，甚至完成任务提前交了。',
                            '他完成任务不仅，甚至提前了。'
                        ],
                        'option_pinyin': [
                            text_to_pinyin('他不仅完成了任务甚至还提前交了'),
                            '', '', ''
                        ],
                        'word_hints': {'任务': 'rèn wù', '提前': 'tí qián'}
                    },
                    {
                        'question': '这道菜___好吃，___有营养。',
                        'type': 'multiple_choice',
                        'correct': '不仅...甚至还...',
                        'options': [
                            '不仅...甚至还...',
                            '虽然...但是...',
                            '因为...所以...',
                            '如果...就...'
                        ],
                        'option_pinyin': ['bù jǐn...shèn zhì hái...', 'suī rán...dàn shì...', 'yīn wèi...suǒ yǐ...', 'rú guǒ...jiù...'],
                        'word_hints': {'营养': 'yíng yǎng'}
                    }
                ],
                'mini_exercises': gp_mini_bujin_shenzhi()
            }
        }
    ],
    2: [
        {
            'action': 'replace',
            'target_number': 1,
            'grammar': {
                'number': 1,
                'title': '一点儿 + 都/也 + 不/没 — Not even a little bit',
                'explanation': (
                    'This pattern expresses complete negation — not even the smallest amount. '
                    'There are two main structures based on tense:\n\n'
                    '1. 一点儿 + 都/也 + 不 + adjective/verb (present/habitual negation)\n'
                    '• 今天一点儿都不冷。(It is not cold at all today.)\n'
                    '• 我一点儿也不累。(I am not tired at all.)\n\n'
                    '2. 一点儿 + 都/也 + 没 + verb (past/completed action negation)\n'
                    '• 她一点儿都没变。(She has not changed at all.)\n'
                    '• 我一点儿也没吃。(I did not eat anything at all.)\n\n'
                    'Note: 都 and 也 are interchangeable here. '
                    '一点儿 adds emotional emphasis compared to just 不/没.'
                ),
                'examples': [
                    {
                        'chinese': '今天一点儿都不冷，穿一件衣服就可以了。',
                        'pinyin': text_to_pinyin('今天一点儿都不冷穿一件衣服就可以了'),
                        'english': 'It is not cold at all today; one piece of clothing is enough.'
                    },
                    {
                        'chinese': '他一点儿也没变，还是那么年轻。',
                        'pinyin': text_to_pinyin('他一点儿也没变还是那么年轻'),
                        'english': 'He has not changed at all; still so young.'
                    },
                    {
                        'chinese': '我一点儿都不喜欢这种食物。',
                        'pinyin': text_to_pinyin('我一点儿都不喜欢这种食物'),
                        'english': 'I do not like this kind of food at all.'
                    }
                ],
                'exercises': [
                    {
                        'question': 'Choose the correct sentence using 一点儿 + 都/也 + 不/没',
                        'type': 'multiple_choice',
                        'correct': '我一点儿都不觉得累。',
                        'options': [
                            '我一点儿都不觉得累。',
                            '我都一点儿不觉得累。',
                            '我不一点儿都觉得累。',
                            '一点儿我都不累觉得。'
                        ],
                        'option_pinyin': [
                            text_to_pinyin('我一点儿都不觉得累'),
                            '', '', ''
                        ],
                        'word_hints': {'觉得': 'jué de'}
                    },
                    {
                        'question': '这部电影___有意思，我中途就离开了。',
                        'type': 'multiple_choice',
                        'correct': '一点儿都不',
                        'options': ['一点儿都不', '非常', '有一点儿', '特别'],
                        'option_pinyin': ['yī diǎnr dōu bù', 'fēi cháng', 'yǒu yī diǎnr', 'tè bié'],
                        'word_hints': {'中途': 'zhōng tú'}
                    }
                ],
                'mini_exercises': gp_mini_yidianr()
            }
        }
    ],
    5: [
        {
            'action': 'replace',
            'target_number': 1,
            'grammar': {
                'number': 1,
                'title': '名量词 and 动量词 — Nominal and Verbal Measure Words',
                'explanation': (
                    'Chinese uses specific measure words with both nouns and verbs.\n\n'
                    '名量词 (Nominal Measure Words) — used with nouns to count things:\n'
                    '• 块 (kuài) — for yuan or informal chunks: 一块钱 (one yuan)\n'
                    '• 笔 (bǐ) — for sums of money or written items: 一笔收入 (a sum of income)\n'
                    '• 套 (tào) — for complete sets/suites: 一套房子 (an apartment)\n'
                    '• 件 (jiàn) — for clothing or matters: 一件衣服 (a piece of clothing)\n\n'
                    '动量词 (Verbal Measure Words) — placed after the verb to count actions:\n'
                    '• 遍 (biàn) — complete once through: 看了三遍 (read three times through)\n'
                    '• 次 (cì) — general times: 去了两次 (went twice)\n'
                    '• 口 (kǒu) — bites or mouthfuls: 吃了几口 (ate a few bites)\n\n'
                    'Structure: Verb + Number + 动量词 (e.g., 看了两遍 / 吃了三口)'
                ),
                'examples': [
                    {
                        'chinese': '他赚了一大笔钱，准备买房。',
                        'pinyin': text_to_pinyin('他赚了一大笔钱准备买房'),
                        'english': 'He earned a large sum of money and plans to buy a house.'
                    },
                    {
                        'chinese': '他们买了一套新房子。',
                        'pinyin': text_to_pinyin('他们买了一套新房子'),
                        'english': 'They bought a new apartment.'
                    },
                    {
                        'chinese': '我把这道题做了两遍，终于明白了。',
                        'pinyin': text_to_pinyin('我把这道题做了两遍终于明白了'),
                        'english': 'I worked through this problem twice and finally understood it.'
                    }
                ],
                'exercises': [
                    {
                        'question': 'Choose the correct measure word: 他买了一___新房子。',
                        'type': 'multiple_choice',
                        'correct': '套',
                        'options': ['套', '条', '颗', '张'],
                        'option_pinyin': ['tào', 'tiáo', 'kē', 'zhāng'],
                        'word_hints': {}
                    },
                    {
                        'question': 'Which sentence correctly uses a 动量词?',
                        'type': 'multiple_choice',
                        'correct': '我看了这本书两遍，记住了所有内容。',
                        'options': [
                            '我看了这本书两遍，记住了所有内容。',
                            '我看了两本遍书，记住了内容。',
                            '遍两我看了这本书，记住了。',
                            '我看遍了这本书两，记住了。'
                        ],
                        'option_pinyin': [
                            text_to_pinyin('我看了这本书两遍记住了所有内容'),
                            '', '', ''
                        ],
                        'word_hints': {}
                    }
                ],
                'mini_exercises': gp_mini_liangcizi()
            }
        }
    ],
    15: [
        {
            'action': 'replace',
            'target_number': 2,
            'grammar': {
                'number': 2,
                'title': '一口气 — In one breath / Non-stop',
                'explanation': (
                    '一口气 literally means "one breath". Used as an adverb before a verb, '
                    'it expresses doing something continuously from start to finish without stopping.\n\n'
                    'Structure: Subject + 一口气 + Verb + (Object)\n\n'
                    '• 他一口气读完了整本书。(He read the whole book in one go.)\n'
                    '• 她一口气爬上了山顶。(She climbed to the top of the mountain without stopping.)\n'
                    '• 我一口气喝完了一整瓶水。(I drank a whole bottle of water in one go.)\n\n'
                    'Tone: 一口气 often implies impressive effort or intensity. '
                    'It is commonly used to describe reading, eating, running, or speaking without pause.'
                ),
                'examples': [
                    {
                        'chinese': '他一口气读完了整本书，一页都没跳过。',
                        'pinyin': text_to_pinyin('他一口气读完了整本书一页都没跳过'),
                        'english': 'He read the whole book in one go, without skipping a single page.'
                    },
                    {
                        'chinese': '她一口气把所有作业做完了。',
                        'pinyin': text_to_pinyin('她一口气把所有作业做完了'),
                        'english': 'She finished all her homework in one go.'
                    },
                    {
                        'chinese': '他一口气说了很多话，让大家都很惊讶。',
                        'pinyin': text_to_pinyin('他一口气说了很多话让大家都很惊讶'),
                        'english': 'He spoke a great deal in one go, surprising everyone.'
                    }
                ],
                'exercises': [
                    {
                        'question': 'Choose the correct sentence using 一口气',
                        'type': 'multiple_choice',
                        'correct': '她一口气跑完了全程，非常厉害。',
                        'options': [
                            '她一口气跑完了全程，非常厉害。',
                            '她跑完了一口气全程，厉害非常。',
                            '一口气她全程跑完了，非常厉害。',
                            '她全程一口跑完了气，厉害。'
                        ],
                        'option_pinyin': [
                            text_to_pinyin('她一口气跑完了全程非常厉害'),
                            '', '', ''
                        ],
                        'word_hints': {'全程': 'quán chéng', '厉害': 'lì hai'}
                    },
                    {
                        'question': '他___把三道菜全吃完了，一点儿都没剩。',
                        'type': 'multiple_choice',
                        'correct': '一口气',
                        'options': ['一口气', '每次', '偶尔', '渐渐'],
                        'option_pinyin': ['yī kǒu qì', 'měi cì', 'ǒu ěr', 'jiàn jiàn'],
                        'word_hints': {}
                    }
                ],
                'mini_exercises': gp_mini_yikouqi()
            }
        }
    ],
}

# ── Main processing ────────────────────────────────────────────────────────────
AFFECTED = sorted(
    {k[0] for k in REPLACEMENTS}
    | set(REMOVALS)
    | set(EXTRA_ENTRIES)
    | set(EXTRA_PHRASES)
    | set(GRAMMAR_CHANGES)
)

for lesson_num in AFFECTED:
    path = os.path.join(DATA_DIR, f'hsk4_lesson_{lesson_num}.json')
    with open(path, encoding='utf-8') as f:
        data = json.load(f)

    # Step 1: remove marked entries
    removals = REMOVALS.get(lesson_num, [])
    before = len(data['vocabulary'])
    data['vocabulary'] = [v for v in data['vocabulary']
                          if v['chinese'] not in removals]
    for r in removals:
        print(f'  L{lesson_num}: removed {r}')

    # Step 2: apply replacements in-place
    for v in data['vocabulary']:
        key = (lesson_num, v['chinese'])
        if key in REPLACEMENTS:
            r = REPLACEMENTS[key]
            old = v['chinese']
            v['chinese']          = r['chinese']
            v['pinyin']           = r['pinyin']
            v['english']          = r['english']
            v['part_of_speech']   = r['part_of_speech']
            v['example']          = r['example']
            v['translation']      = r['translation']
            v['example_pinyin']   = text_to_pinyin(r['example'])
            v['_sent_zh']         = r['_sent_zh']
            v['_sent_en']         = r['_sent_en']
            print(f'  L{lesson_num}: {old} → {r["chinese"]}')

    # Step 3: insert new non-phrase entries after last non-phrase
    extras = EXTRA_ENTRIES.get(lesson_num, [])
    if extras:
        last_non_phrase = max(
            i for i, v in enumerate(data['vocabulary'])
            if v.get('part_of_speech') != 'phrase'
        )
        for offset, e in enumerate(extras):
            entry = {
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
            data['vocabulary'].insert(last_non_phrase + 1 + offset, entry)
            print(f'  L{lesson_num}: added {e["chinese"]} as {e["id"]}')

    # Step 4: insert new phrases at end
    for ph in EXTRA_PHRASES.get(lesson_num, []):
        data['vocabulary'].append({
            'id':             ph['id'],
            'chinese':        ph['chinese'],
            'pinyin':         ph['pinyin'],
            'english':        ph['english'],
            'part_of_speech': ph['part_of_speech'],
        })
        print(f'  L{lesson_num}: added phrase {ph["chinese"]}')

    # Step 5: apply grammar changes
    for change in GRAMMAR_CHANGES.get(lesson_num, []):
        if change['action'] == 'add':
            data['grammar_points'].append(change['grammar'])
            print(f'  L{lesson_num}: added GP{change["grammar"]["number"]}: {change["grammar"]["title"]}')
        elif change['action'] == 'replace':
            target_num = change['target_number']
            for i, gp in enumerate(data['grammar_points']):
                if gp['number'] == target_num:
                    data['grammar_points'][i] = change['grammar']
                    print(f'  L{lesson_num}: replaced GP{target_num} → {change["grammar"]["title"]}')
                    break

    # Step 6: attach _sent_zh/_sent_en to existing words missing them
    for v in data['vocabulary']:
        if '_sent_zh' not in v:
            ex = v.get('example', '')
            if v['chinese'] in ex:
                v['_sent_zh'] = ex.replace(v['chinese'], '___', 1)
                v['_sent_en'] = v.get('translation', v['english'])
            else:
                v['_sent_zh'] = '___。'
                v['_sent_en'] = v['english']

    # Step 7: regenerate mini_exercises for all non-phrase vocab
    pool = [v for v in data['vocabulary'] if v.get('part_of_speech') != 'phrase']
    for v in pool:
        v['mini_exercises'] = make_mini(v, pool)

    # Step 8: clean temp keys and save
    for v in data['vocabulary']:
        v.pop('_sent_zh', None)
        v.pop('_sent_en', None)

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f'L{lesson_num}: saved ({len(pool)} non-phrase vocab, '
          f'{len(data["grammar_points"])} grammar points)')

print('\nDone!')
