"""
Generate mini_exercises for HSK6 lessons 1-7.
Same pattern as Level 4 and Level 5 scripts: 3 per vocab word (non-phrase), 3 per grammar point.
Does NOT modify any other content in the JSON files.

Duplicates within L1-7:
  Vocab: 自然 (L2+L7), 态度 (L4+L6) — handled with one shared SENTENCES entry each
  Grammar: 既然…就 (L1GP3+L3GP1), 不得不 (L4GP3+L7GP2) — different exercises per occurrence
"""
import json, random, copy, os

# ── helpers (identical to Level 5 scripts) ────────────────────────────────────

def shuffled4(correct_val, distractors):
    pool = distractors[:3]
    pos = random.randint(0, 3)
    return pool[:pos] + [correct_val] + pool[pos:]

def mcq_english(word, pool):
    others = [w for w in pool if w['chinese'] != word['chinese']]
    random.shuffle(others)
    distractors = others[:3]
    opts = shuffled4(word['english'], [d['english'] for d in distractors])
    eng_to_py = {word['english']: word['pinyin']}
    for d in distractors:
        eng_to_py[d['english']] = d['pinyin']
    return {
        "type": "multiple_choice",
        "question": f"What does {word['chinese']} mean?",
        "correct": word['english'],
        "options": opts,
        "option_pinyin": [eng_to_py.get(o, '') for o in opts]
    }

def mcq_chinese(word, pool):
    others = [w for w in pool if w['chinese'] != word['chinese']]
    random.shuffle(others)
    distractors = others[:3]
    opts = shuffled4(word['chinese'], [d['chinese'] for d in distractors])
    py_map = {word['chinese']: word['pinyin']}
    for d in distractors:
        py_map[d['chinese']] = d['pinyin']
    return {
        "type": "multiple_choice",
        "question": f"Which word means '{word['english']}'?",
        "correct": word['chinese'],
        "options": opts,
        "option_pinyin": [py_map.get(o, '') for o in opts]
    }

def fill_blank(word, pool, sentence_zh, sentence_en):
    others = [w for w in pool if w['chinese'] != word['chinese']]
    random.shuffle(others)
    distractors = others[:3]
    opts = shuffled4(word['chinese'], [d['chinese'] for d in distractors])
    py_map = {word['chinese']: word['pinyin']}
    for d in distractors:
        py_map[d['chinese']] = d['pinyin']
    return {
        "type": "fill_blank",
        "question": f"Fill in: {word['english']}",
        "correct": word['chinese'],
        "options": opts,
        "option_pinyin": [py_map.get(o, '') for o in opts],
        "question_chinese": sentence_zh,
        "question_pinyin": sentence_zh,
        "question_english": sentence_en
    }

def gen_vocab_mini(word, pool):
    zh = word['chinese']
    sent_zh, sent_en = SENTENCES.get(zh, ('___。', zh))
    return [
        mcq_english(word, pool),
        fill_blank(word, pool, sent_zh, sent_en),
        mcq_chinese(word, pool),
    ]

# ── example sentences per word ────────────────────────────────────────────────

SENTENCES = {
    # L1 — Love's Small Gestures
    '细节': ('他很注意生活中的小___。', 'He pays close attention to the small details of life.'),
    '电台': ('她喜欢在开车时听___。', 'She likes listening to the radio station while driving.'),
    '恩爱': ('他们是一对很___的夫妻。', 'They are a very loving couple.'),
    '居然': ('他___忘记了我们的纪念日。', 'He surprisingly forgot our anniversary.'),
    '如何': ('你知道___才能让对方感动？', 'Do you know how to move the other person?'),
    '夫妻': ('他们已经是___了二十年了。', 'They have been a married couple for twenty years.'),
    '感受': ('她分享了自己内心的___。', 'She shared her inner feelings.'),
    '表达': ('他不善于___自己的情感。', 'He is not good at expressing his emotions.'),
    '温馨': ('这个家庭的氛围非常___。', 'The atmosphere of this family is very heartwarming.'),
    '陪伴': ('他的___让她感到安心。', 'His companionship made her feel at ease.'),
    '倾听': ('他总是认真地___她的心事。', 'He always listens attentively to her worries.'),
    '默契': ('他们两人之间有很好的___。', 'There is a great tacit understanding between the two of them.'),
    '偶尔': ('他们___会一起去散步。', 'They occasionally go for a walk together.'),
    '珍惜': ('我们要___彼此相处的时间。', 'We should cherish the time we spend together.'),
    '体贴': ('他对妻子非常___。', 'He is very considerate of his wife.'),

    # L2 — The Language of Love (自然 shared with L7)
    '靠': ('她___在他的肩膀上。', 'She leaned on his shoulder.'),
    '原来': ('___他一直在等我。', 'As it turns out, he had been waiting for me all along.'),
    '竟然': ('他___哭了。', 'He actually cried.'),
    '平静': ('她让自己保持___。', 'She kept herself calm.'),
    '关心': ('他很___她的健康。', 'He cares a lot about her health.'),
    '心情': ('今天她的___很好。', 'She is in a very good mood today.'),
    '自然': ('他们之间的对话很___。', 'The conversation between them is very natural.'),
    '浪漫': ('他为她做了一件___的事。', 'He did something romantic for her.'),
    '沉默': ('他选择了___，没有回答。', 'He chose silence and did not respond.'),
    '安慰': ('她的话___了他。', 'Her words comforted him.'),
    '依赖': ('她太___他了。', 'She relies on him too much.'),
    '感激': ('他对她的帮助感到很___。', 'He feels very grateful for her help.'),
    '真诚': ('他对她非常___。', 'He is very sincere toward her.'),
    '摩擦': ('他们之间有一些___。', 'There is some friction between them.'),
    '包容': ('爱需要彼此___。', 'Love requires mutual tolerance.'),

    # L3 — Facing Life's Choices
    '选择': ('人生中有很多___需要做。', 'There are many choices to make in life.'),
    '人生': ('每个人的___都不一样。', "Everyone's life is different."),
    '稳定': ('他更喜欢___的工作。', 'He prefers a stable job.'),
    '待遇': ('这份工作___很好。', 'This job has very good pay and benefits.'),
    '发愁': ('他为未来的工作___。', 'He worries about his future career.'),
    '机会': ('他抓住了这个___。', 'He seized this opportunity.'),
    '勇气': ('做出改变需要___。', 'Making a change requires courage.'),
    '理想': ('她的___是成为一名医生。', 'Her ideal is to become a doctor.'),
    '现实': ('他必须面对___。', 'He must face reality.'),
    '放弃': ('她不想___自己的梦想。', "She doesn't want to give up her dream."),
    '坚持': ('他___了自己的选择。', 'He persisted in his choice.'),
    '后悔': ('他___当初没有努力。', 'He regrets not working hard back then.'),
    '犹豫': ('她___了很久才做决定。', 'She hesitated for a long time before making a decision.'),
    '成功': ('只要坚持，就能___。', 'As long as you persist, you can succeed.'),
    '目标': ('他设定了明确的___。', 'He set a clear goal.'),

    # L4 — Everything Can Change (态度 shared with L6)
    '改变': ('他的___让大家都很惊讶。', 'His change surprised everyone.'),
    '态度': ('他对工作的___非常认真。', 'His attitude toward work is very serious.'),
    '环境': ('改变___有助于提高效率。', 'Changing the environment helps improve efficiency.'),
    '适应': ('他很快___了新的生活节奏。', 'He quickly adapted to the new pace of life.'),
    '习惯': ('他养成了早起的___。', 'He developed the habit of getting up early.'),
    '主动': ('他___地提出了解决方案。', 'He proactively put forward a solution.'),
    '被动': ('太___不利于个人成长。', 'Being too passive is not good for personal growth.'),
    '突破': ('他终于___了自己的局限。', 'He finally broke through his limitations.'),
    '转变': ('她的___让大家刮目相看。', 'Her transformation made everyone look at her with new eyes.'),
    '成长': ('失败也是___的机会。', 'Failure is also an opportunity for growth.'),
    '经历': ('这段___让他受益匪浅。', 'This experience benefited him greatly.'),
    '关键': ('___在于坚持不放弃。', 'The key lies in persisting and not giving up.'),
    '潜力': ('他有很大的___。', 'He has great potential.'),
    '一旦': ('___做出决定，就要坚持。', 'Once a decision is made, stick to it.'),
    '不断': ('他___努力，终于成功了。', 'He worked continuously and finally succeeded.'),

    # L5 — The Art of Debate
    '争论': ('他们就这个问题展开了___。', 'They launched into a debate about this issue.'),
    '奇迹': ('他的康复简直是个___。', 'His recovery is simply a miracle.'),
    '毕竟': ('他___是个孩子，要多包容。', 'After all, he is just a child; you should be more tolerant.'),
    '逐渐': ('他的观点___改变了。', 'His viewpoint gradually changed.'),
    '或许': ('___他只是不好意思说出来。', 'Perhaps he was just too embarrassed to say it.'),
    '观点': ('他的___很有说服力。', 'His viewpoint is very persuasive.'),
    '沟通': ('我们需要更好的___方式。', 'We need better ways of communicating.'),
    '理解': ('她很难___他的立场。', 'She finds it hard to understand his position.'),
    '立场': ('他的___非常坚定。', 'His position is very firm.'),
    '承认': ('他终于___了自己的错误。', 'He finally admitted his mistake.'),
    '说服': ('他试图___对方改变主意。', 'He tried to persuade the other party to change their mind.'),
    '思维': ('批判性___非常重要。', 'Critical thinking is very important.'),
    '荒诞': ('这个想法听起来很___。', 'This idea sounds very absurd.'),
    '冷漠': ('他对社会问题持___态度。', 'He holds an indifferent attitude toward social issues.'),
    '反抗': ('他们对不公正的规定进行了___。', 'They resisted the unjust rules.'),

    # L6 — The Power of Words in Debate (态度 shared with L4)
    '显示': ('数据___这个方法效果很好。', 'The data shows that this method works very well.'),
    '显得': ('他___非常自信。', 'He appears very confident.'),
    '围绕': ('讨论___这个核心问题展开。', 'The discussion revolves around this core issue.'),
    '效果': ('这个方法的___很明显。', 'The effect of this method is very obvious.'),
    '逻辑': ('他的论点缺乏___。', "His argument lacks logic."),
    '反驳': ('他用证据___了对方的观点。', "He refuted the other side's viewpoint with evidence."),
    '提出': ('她___了一个新的方案。', 'She put forward a new proposal.'),
    '针对': ('他___这个问题提出了解决方案。', 'He proposed a solution targeting this problem.'),
    '证明': ('他用事实___了自己的观点。', 'He proved his viewpoint with facts.'),
    '合理': ('这个安排非常___。', 'This arrangement is very reasonable.'),
    '有效': ('这种沟通方式很___。', 'This communication method is very effective.'),
    '实际': ('我们要从___出发解决问题。', 'We should solve problems starting from reality.'),
    '原则': ('他始终坚持自己的___。', 'He always sticks to his principles.'),
    '解决': ('他们终于___了这个问题。', 'They finally resolved this issue.'),
    '论点': ('他的___很有力。', 'His argument is very powerful.'),
    '证据': ('警察找到了重要的___。', 'The police found important evidence.'),

    # L7 — Sleep and the Biological Clock (自然 shared with L2)
    '闹钟': ('他每天用___叫醒自己。', 'He uses an alarm clock to wake himself up every day.'),
    '危害': ('睡眠不足对身体有___。', 'Insufficient sleep is harmful to the body.'),
    '生物钟': ('长期熬夜会打乱你的___。', 'Staying up late regularly will disrupt your biological clock.'),
    '睡眠': ('充足的___对健康很重要。', 'Adequate sleep is very important for health.'),
    '规律': ('保持___的作息时间有助于健康。', 'Maintaining a regular schedule is good for health.'),
    '突然': ('他___从睡梦中醒来。', 'He suddenly woke up from his sleep.'),
    '影响': ('手机使用过多会___睡眠。', 'Excessive phone use will affect sleep.'),
    '机制': ('大脑有控制睡眠的___。', 'The brain has a mechanism that controls sleep.'),
    '激素': ('___的变化会影响睡眠质量。', 'Changes in hormones can affect sleep quality.'),
    '疲劳': ('长时间工作容易导致___。', 'Working for long hours easily leads to fatigue.'),
    '充足': ('___的睡眠可以提高工作效率。', 'Adequate sleep can improve work efficiency.'),
    '必要': ('小睡有时候是___的。', 'Napping is sometimes necessary.'),
    '实验': ('科学家做了很多睡眠___。', 'Scientists have conducted many sleep experiments.'),
    '过渡': ('换时区需要___期来调整。', 'Crossing time zones requires a transition period to adjust.'),
}

# ── handcrafted grammar mini exercises ───────────────────────────────────────

GRAMMAR_MINI = {

    # ── L1 ────────────────────────────────────────────────────────────────────
    'hsk6_l1_g1': [  # 居然 — Surprisingly / Unexpectedly
        {
            "type": "multiple_choice",
            "question": "居然 expresses...",
            "correct": "Surprise or disbelief that an unexpected outcome occurred — placed before the verb",
            "options": [
                "Surprise or disbelief that an unexpected outcome occurred — placed before the verb",
                "A gradual change over time",
                "A logical result following a condition",
                "An occasional or rare action"
            ],
            "option_pinyin": ["jū rán", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: He surprisingly told everyone my secret!",
            "correct": "居然",
            "options": ["居然", "偶尔", "因此", "虽然"],
            "option_pinyin": ["jū rán", "ǒu ěr", "yīn cǐ", "suī rán"],
            "question_chinese": "他___把我的秘密告诉了所有人！",
            "question_pinyin": "他___把我的秘密告诉了所有人！",
            "question_english": "He surprisingly told everyone my secret!"
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 居然?",
            "correct": "他居然忘记了我们的结婚纪念日！",
            "options": [
                "他居然忘记了我们的结婚纪念日！",
                "居然他了忘记，我们的结婚纪念日！",
                "他忘记了居然，我们的结婚纪念日。",
                "他忘记了我们的结婚纪念日，居然！"
            ],
            "option_pinyin": [
                "tā jū rán wàng jì le wǒ men de jié hūn jì niàn rì",
                "jū rán tā le wàng jì wǒ men de jié hūn jì niàn rì",
                "tā wàng jì le jū rán wǒ men de jié hūn jì niàn rì",
                "tā wàng jì le wǒ men de jié hūn jì niàn rì jū rán"
            ]
        },
    ],

    'hsk6_l1_g2': [  # 如何 — How / In what way (formal)
        {
            "type": "multiple_choice",
            "question": "如何 in a sentence is used to...",
            "correct": "Ask or describe how something is done or what something is like — formal register",
            "options": [
                "Ask or describe how something is done or what something is like — formal register",
                "Express surprise at an unexpected result",
                "Introduce a condition for something to happen",
                "Show that something happens occasionally"
            ],
            "option_pinyin": ["rú hé", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Do you know how to express love to your partner?",
            "correct": "如何",
            "options": ["如何", "居然", "偶尔", "既然"],
            "option_pinyin": ["rú hé", "jū rán", "ǒu ěr", "jì rán"],
            "question_chinese": "你知道___向对方表达爱意吗？",
            "question_pinyin": "你知道___向对方表达爱意吗？",
            "question_english": "Do you know how to express love to your partner?"
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 如何?",
            "correct": "请告诉我如何改善夫妻之间的沟通。",
            "options": [
                "请告诉我如何改善夫妻之间的沟通。",
                "请如何告诉我，改善夫妻之间的沟通。",
                "如何请告诉我改善夫妻之间的沟通。",
                "请告诉我改善夫妻之间的沟通如何。"
            ],
            "option_pinyin": [
                "qǐng gào sù wǒ rú hé gǎi shàn fū qī zhī jiān de gōu tōng",
                "qǐng rú hé gào sù wǒ gǎi shàn fū qī zhī jiān de gōu tōng",
                "rú hé qǐng gào sù wǒ gǎi shàn fū qī zhī jiān de gōu tōng",
                "qǐng gào sù wǒ gǎi shàn fū qī zhī jiān de gōu tōng rú hé"
            ]
        },
    ],

    'hsk6_l1_g3': [  # 既然…就 — Since…then
        {
            "type": "multiple_choice",
            "question": "既然...就... expresses...",
            "correct": "A logical deduction from an accepted fact: 'since X is the case, then Y naturally follows'",
            "options": [
                "A logical deduction from an accepted fact: 'since X is the case, then Y naturally follows'",
                "A hypothetical condition: 'if X were true, then Y'",
                "A concession: 'even though X, Y still happens'",
                "A sequence: 'first X, then Y'"
            ],
            "option_pinyin": ["jì rán...jiù...", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Since you have already decided, don't regret it.",
            "correct": "既然",
            "options": ["既然", "虽然", "如果", "偶尔"],
            "option_pinyin": ["jì rán", "suī rán", "rú guǒ", "ǒu ěr"],
            "question_chinese": "___你已经决定了，就不要后悔。",
            "question_pinyin": "___你已经决定了，就不要后悔。",
            "question_english": "Since you have already decided, don't regret it."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 既然…就?",
            "correct": "既然你喜欢她，就应该勇敢地表达。",
            "options": [
                "既然你喜欢她，就应该勇敢地表达。",
                "你既然就喜欢她，应该勇敢地表达。",
                "就既然你喜欢她，应该勇敢地表达。",
                "你喜欢她既然，就应该勇敢地表达。"
            ],
            "option_pinyin": [
                "jì rán nǐ xǐ huān tā jiù yīng gāi yǒng gǎn de biǎo dá",
                "nǐ jì rán jiù xǐ huān tā yīng gāi yǒng gǎn de biǎo dá",
                "jiù jì rán nǐ xǐ huān tā yīng gāi yǒng gǎn de biǎo dá",
                "nǐ xǐ huān tā jì rán jiù yīng gāi yǒng gǎn de biǎo dá"
            ]
        },
    ],

    # ── L2 ────────────────────────────────────────────────────────────────────
    'hsk6_l2_g1': [  # 靠 — To lean on / To rely on
        {
            "type": "multiple_choice",
            "question": "靠 + N/VP can mean...",
            "correct": "Both physical leaning (靠着墙 — leaning against the wall) and reliance/dependence (靠努力 — relying on effort)",
            "options": [
                "Both physical leaning (靠着墙 — leaning against the wall) and reliance/dependence (靠努力 — relying on effort)",
                "Only physical contact between two objects",
                "Only emotional dependence on another person",
                "A direction of movement (toward / near)"
            ],
            "option_pinyin": ["kào", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: She relied on his support to get through the difficult period.",
            "correct": "靠",
            "options": ["靠", "依赖", "感激", "安慰"],
            "option_pinyin": ["kào", "yī lài", "gǎn jī", "ān wèi"],
            "question_chinese": "她___他的支持，度过了困难的时期。",
            "question_pinyin": "她___他的支持，度过了困难的时期。",
            "question_english": "She relied on his support to get through the difficult period."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 靠?",
            "correct": "他靠着窗户，静静地思考。",
            "options": [
                "他靠着窗户，静静地思考。",
                "他窗户靠着，静静地思考。",
                "靠他着窗户，静静地思考。",
                "他静静地思考，靠着了窗户。"
            ],
            "option_pinyin": [
                "tā kào zhe chuāng hu jìng jìng de sī kǎo",
                "tā chuāng hu kào zhe jìng jìng de sī kǎo",
                "kào tā zhe chuāng hu jìng jìng de sī kǎo",
                "tā jìng jìng de sī kǎo kào zhe le chuāng hu"
            ]
        },
    ],

    'hsk6_l2_g2': [  # 倒是 — Actually; on the contrary; surprisingly
        {
            "type": "multiple_choice",
            "question": "倒是 in a sentence means...",
            "correct": "Actually / On the contrary — introduces a fact that contradicts or is surprising given the context",
            "options": [
                "Actually / On the contrary — introduces a fact that contradicts or is surprising given the context",
                "Therefore — introduces the logical result of the previous statement",
                "Although — introduces a concession",
                "Suddenly — introduces an abrupt change"
            ],
            "option_pinyin": ["dào shì", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: He is usually not talkative, but today he actually said a lot.",
            "correct": "倒是",
            "options": ["倒是", "虽然", "因此", "所以"],
            "option_pinyin": ["dào shì", "suī rán", "yīn cǐ", "suǒ yǐ"],
            "question_chinese": "他平时不善言辞，今天___说了很多。",
            "question_pinyin": "他平时不善言辞，今天___说了很多。",
            "question_english": "He is usually not talkative, but today he actually said a lot."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 倒是?",
            "correct": "他平时话不多，倒是今天非常健谈。",
            "options": [
                "他平时话不多，倒是今天非常健谈。",
                "倒是他平时话不多，今天非常健谈。",
                "他平时话倒是不多，今天非常健谈。",
                "他今天非常健谈，平时倒是话不多。"
            ],
            "option_pinyin": [
                "tā píng shí huà bù duō dào shì jīn tiān fēi cháng jiàn tán",
                "dào shì tā píng shí huà bù duō jīn tiān fēi cháng jiàn tán",
                "tā píng shí huà dào shì bù duō jīn tiān fēi cháng jiàn tán",
                "tā jīn tiān fēi cháng jiàn tán píng shí dào shì huà bù duō"
            ]
        },
    ],

    'hsk6_l2_g3': [  # 不知不觉 — Without realizing; unconsciously
        {
            "type": "multiple_choice",
            "question": "不知不觉 expresses...",
            "correct": "Without noticing; gradually and imperceptibly — something happens without one's awareness",
            "options": [
                "Without noticing; gradually and imperceptibly — something happens without one's awareness",
                "Suddenly and unexpectedly — something happens in a moment",
                "Deliberately and consciously — something is done on purpose",
                "Occasionally — something happens from time to time"
            ],
            "option_pinyin": ["bù zhī bù jué", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: They chatted for a long time; without realizing it, night had fallen.",
            "correct": "不知不觉",
            "options": ["不知不觉", "竟然", "偶尔", "突然"],
            "option_pinyin": ["bù zhī bù jué", "jìng rán", "ǒu ěr", "tū rán"],
            "question_chinese": "他们聊了很久，___天黑了。",
            "question_pinyin": "他们聊了很久，___天黑了。",
            "question_english": "They chatted for a long time; without realizing it, night had fallen."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 不知不觉?",
            "correct": "不知不觉中，一年过去了。",
            "options": [
                "不知不觉中，一年过去了。",
                "一年不知不觉，过去了中。",
                "中不知不觉，一年过去了。",
                "一年过去了，中不知不觉。"
            ],
            "option_pinyin": [
                "bù zhī bù jué zhōng yī nián guò qù le",
                "yī nián bù zhī bù jué guò qù le zhōng",
                "zhōng bù zhī bù jué yī nián guò qù le",
                "yī nián guò qù le zhōng bù zhī bù jué"
            ]
        },
    ],

    # ── L3 ────────────────────────────────────────────────────────────────────
    'hsk6_l3_g1': [  # 既然…就 — Since (different exercises from L1 GP3)
        {
            "type": "multiple_choice",
            "question": "既然...就... differs from 如果...就... in that...",
            "correct": "既然 refers to a fact already established or accepted; 如果 introduces a hypothetical condition",
            "options": [
                "既然 refers to a fact already established or accepted; 如果 introduces a hypothetical condition",
                "They are completely interchangeable in all contexts",
                "既然 is only used in formal writing; 如果 is informal",
                "既然 expresses surprise; 如果 expresses a condition"
            ],
            "option_pinyin": ["jì rán vs rú guǒ", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Since you don't like this job, you should bravely resign.",
            "correct": "既然",
            "options": ["既然", "如果", "虽然", "因为"],
            "option_pinyin": ["jì rán", "rú guǒ", "suī rán", "yīn wèi"],
            "question_chinese": "___你不喜欢这份工作，就应该勇敢辞职。",
            "question_pinyin": "___你不喜欢这份工作，就应该勇敢辞职。",
            "question_english": "Since you don't like this job, you should bravely resign."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 既然…就?",
            "correct": "既然选择了这条路，就要坚持走下去。",
            "options": [
                "既然选择了这条路，就要坚持走下去。",
                "选择了这条路既然，就要坚持走下去。",
                "既然就选择了这条路，要坚持走下去。",
                "就既然选择了，这条路要坚持走下去。"
            ],
            "option_pinyin": [
                "jì rán xuǎn zé le zhè tiáo lù jiù yào jiān chí zǒu xià qù",
                "xuǎn zé le zhè tiáo lù jì rán jiù yào jiān chí zǒu xià qù",
                "jì rán jiù xuǎn zé le zhè tiáo lù yào jiān chí zǒu xià qù",
                "jiù jì rán xuǎn zé le zhè tiáo lù yào jiān chí zǒu xià qù"
            ]
        },
    ],

    'hsk6_l3_g2': [  # 宁可…也不 — Would rather…than
        {
            "type": "multiple_choice",
            "question": "宁可...也不... expresses...",
            "correct": "A strong preference: 'would rather do A than do B' — A may be difficult but is preferred over B",
            "options": [
                "A strong preference: 'would rather do A than do B' — A may be difficult but is preferred over B",
                "A concession: even though A is true, B still happens",
                "A condition: only if A, then B is possible",
                "A sequence: A happens, and then B follows"
            ],
            "option_pinyin": ["nìng kě...yě bù...", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: She would rather give up the high-paying job than betray her ideals.",
            "correct": "宁可",
            "options": ["宁可", "虽然", "既然", "不断"],
            "option_pinyin": ["nìng kě", "suī rán", "jì rán", "bù duàn"],
            "question_chinese": "她___放弃高薪工作，也不违背自己的理想。",
            "question_pinyin": "她___放弃高薪工作，也不违背自己的理想。",
            "question_english": "She would rather give up the high-paying job than betray her ideals."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 宁可…也不?",
            "correct": "他宁可一个人奋斗，也不愿意放弃目标。",
            "options": [
                "他宁可一个人奋斗，也不愿意放弃目标。",
                "他也不宁可一个人奋斗，愿意放弃目标。",
                "宁可他一个人奋斗，也不愿意放弃目标。",
                "他一个人奋斗宁可，也不愿意放弃目标。"
            ],
            "option_pinyin": [
                "tā nìng kě yī gè rén fèn dòu yě bù yuàn yì fàng qì mù biāo",
                "tā yě bù nìng kě yī gè rén fèn dòu yuàn yì fàng qì mù biāo",
                "nìng kě tā yī gè rén fèn dòu yě bù yuàn yì fàng qì mù biāo",
                "tā yī gè rén fèn dòu nìng kě yě bù yuàn yì fàng qì mù biāo"
            ]
        },
    ],

    'hsk6_l3_g3': [  # 尽管…还是/仍然 — Even though…still
        {
            "type": "multiple_choice",
            "question": "尽管...还是/仍然... expresses...",
            "correct": "A concession: even though A is true, B still happens — the result is not changed by the condition",
            "options": [
                "A concession: even though A is true, B still happens — the result is not changed by the condition",
                "A cause: because of A, B happens",
                "A condition: only if A, then B follows",
                "A sequence: A happens first, and then B follows"
            ],
            "option_pinyin": ["jǐn guǎn...hái shì...", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Even though he failed many times, he still did not give up.",
            "correct": "尽管",
            "options": ["尽管", "因为", "只要", "一旦"],
            "option_pinyin": ["jǐn guǎn", "yīn wèi", "zhǐ yào", "yí dàn"],
            "question_chinese": "___失败了很多次，他仍然没有放弃。",
            "question_pinyin": "___失败了很多次，他仍然没有放弃。",
            "question_english": "Even though he failed many times, he still did not give up."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 尽管…还是?",
            "correct": "尽管现实很残酷，他还是坚持追求理想。",
            "options": [
                "尽管现实很残酷，他还是坚持追求理想。",
                "现实尽管很残酷，还是他坚持追求理想。",
                "还是尽管现实很残酷，他坚持追求理想。",
                "他还是坚持，尽管现实很残酷追求理想。"
            ],
            "option_pinyin": [
                "jǐn guǎn xiàn shí hěn cán kù tā hái shì jiān chí zhuī qiú lǐ xiǎng",
                "xiàn shí jǐn guǎn hěn cán kù hái shì tā jiān chí zhuī qiú lǐ xiǎng",
                "hái shì jǐn guǎn xiàn shí hěn cán kù tā jiān chí zhuī qiú lǐ xiǎng",
                "tā hái shì jiān chí jǐn guǎn xiàn shí hěn cán kù zhuī qiú lǐ xiǎng"
            ]
        },
    ],

    # ── L4 ────────────────────────────────────────────────────────────────────
    'hsk6_l4_g1': [  # 一旦 — Once (a condition is met)
        {
            "type": "multiple_choice",
            "question": "一旦 + condition expresses...",
            "correct": "Once X happens (if and when it does), then a certain result follows — emphasises the significance of the trigger event",
            "options": [
                "Once X happens (if and when it does), then a certain result follows — emphasises the significance of the trigger event",
                "Although X happened, the result is not what was expected",
                "Since X is already the case, the result naturally follows",
                "As long as X keeps happening, the result continues"
            ],
            "option_pinyin": ["yí dàn", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Once a decision is made, one must bear the consequences.",
            "correct": "一旦",
            "options": ["一旦", "虽然", "由于", "不断"],
            "option_pinyin": ["yí dàn", "suī rán", "yóu yú", "bù duàn"],
            "question_chinese": "___做出了决定，就要承担后果。",
            "question_pinyin": "___做出了决定，就要承担后果。",
            "question_english": "Once a decision is made, one must bear the consequences."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 一旦?",
            "correct": "一旦养成了好习惯，就会终身受益。",
            "options": [
                "一旦养成了好习惯，就会终身受益。",
                "养成了好习惯一旦，就会终身受益。",
                "就一旦养成了好习惯，会终身受益。",
                "一旦就养成了好习惯，会终身受益。"
            ],
            "option_pinyin": [
                "yí dàn yǎng chéng le hǎo xí guàn jiù huì zhōng shēn shòu yì",
                "yǎng chéng le hǎo xí guàn yí dàn jiù huì zhōng shēn shòu yì",
                "jiù yí dàn yǎng chéng le hǎo xí guàn huì zhōng shēn shòu yì",
                "yí dàn jiù yǎng chéng le hǎo xí guàn huì zhōng shēn shòu yì"
            ]
        },
    ],

    'hsk6_l4_g2': [  # 与其…不如 — Rather than…better to
        {
            "type": "multiple_choice",
            "question": "与其...不如... expresses...",
            "correct": "A comparison of two options where the second is preferred: 'rather than doing A, it is better to do B'",
            "options": [
                "A comparison of two options where the second is preferred: 'rather than doing A, it is better to do B'",
                "A concession: even though A is the case, B is still true",
                "A condition: if A is met, then B will happen",
                "A sequence: A happens, and then B follows"
            ],
            "option_pinyin": ["yǔ qí...bù rú...", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Rather than always complaining, it is better to actively make changes.",
            "correct": "与其",
            "options": ["与其", "宁可", "虽然", "不断"],
            "option_pinyin": ["yǔ qí", "nìng kě", "suī rán", "bù duàn"],
            "question_chinese": "___总是抱怨，不如主动去改变。",
            "question_pinyin": "___总是抱怨，不如主动去改变。",
            "question_english": "Rather than always complaining, it is better to actively make changes."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 与其…不如?",
            "correct": "与其等待机会，不如主动创造机会。",
            "options": [
                "与其等待机会，不如主动创造机会。",
                "不如与其等待机会，主动创造机会。",
                "与其不如等待机会，主动创造机会。",
                "等待机会与其，不如主动创造机会。"
            ],
            "option_pinyin": [
                "yǔ qí děng dài jī huì bù rú zhǔ dòng chuàng zào jī huì",
                "bù rú yǔ qí děng dài jī huì zhǔ dòng chuàng zào jī huì",
                "yǔ qí bù rú děng dài jī huì zhǔ dòng chuàng zào jī huì",
                "děng dài jī huì yǔ qí bù rú zhǔ dòng chuàng zào jī huì"
            ]
        },
    ],

    'hsk6_l4_g3': [  # 不得不 — Have no choice but to
        {
            "type": "multiple_choice",
            "question": "不得不 + VP means...",
            "correct": "To have no choice but to do something — an obligation arising from circumstances, not personal will",
            "options": [
                "To have no choice but to do something — an obligation arising from circumstances, not personal will",
                "To voluntarily decide to do something",
                "To be gradually changing into something",
                "To be unwilling to do something"
            ],
            "option_pinyin": ["bù dé bù", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Due to sudden rain, he had no choice but to cancel his plans.",
            "correct": "不得不",
            "options": ["不得不", "主动", "不断", "一旦"],
            "option_pinyin": ["bù dé bù", "zhǔ dòng", "bù duàn", "yí dàn"],
            "question_chinese": "由于突然下雨，他___取消了计划。",
            "question_pinyin": "由于突然下雨，他___取消了计划。",
            "question_english": "Due to sudden rain, he had no choice but to cancel his plans."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 不得不?",
            "correct": "时间不够了，他不得不放弃部分计划。",
            "options": [
                "时间不够了，他不得不放弃部分计划。",
                "时间不够了，不得不他放弃部分计划。",
                "他不够了时间，不得不放弃部分计划。",
                "不得不时间不够了，他放弃部分计划。"
            ],
            "option_pinyin": [
                "shí jiān bú gòu le tā bù dé bù fàng qì bù fèn jì huà",
                "shí jiān bú gòu le bù dé bù tā fàng qì bù fèn jì huà",
                "tā bú gòu le shí jiān bù dé bù fàng qì bù fèn jì huà",
                "bù dé bù shí jiān bú gòu le tā fàng qì bù fèn jì huà"
            ]
        },
    ],

    # ── L5 ────────────────────────────────────────────────────────────────────
    'hsk6_l5_g1': [  # 毕竟 — After all; in the final analysis
        {
            "type": "multiple_choice",
            "question": "毕竟 in a sentence means...",
            "correct": "After all / In the final analysis — acknowledges a fundamental truth that justifies or explains something",
            "options": [
                "After all / In the final analysis — acknowledges a fundamental truth that justifies or explains something",
                "Gradually — describes a change that happens step by step",
                "Perhaps — expresses uncertainty about a possibility",
                "Surprisingly — describes an unexpected outcome"
            ],
            "option_pinyin": ["bì jìng", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: After all, he is your friend; you should forgive him.",
            "correct": "毕竟",
            "options": ["毕竟", "逐渐", "或许", "因此"],
            "option_pinyin": ["bì jìng", "zhú jiàn", "huò xǔ", "yīn cǐ"],
            "question_chinese": "他___是你的朋友，你应该原谅他。",
            "question_pinyin": "他___是你的朋友，你应该原谅他。",
            "question_english": "After all, he is your friend; you should forgive him."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 毕竟?",
            "correct": "他毕竟只是个初学者，不要要求太高。",
            "options": [
                "他毕竟只是个初学者，不要要求太高。",
                "毕竟他只是个初学者，要求不要太高。",
                "他只是毕竟个初学者，不要要求太高。",
                "他只是个初学者毕竟，不要要求太高。"
            ],
            "option_pinyin": [
                "tā bì jìng zhǐ shì gè chū xué zhě bù yào yāo qiú tài gāo",
                "bì jìng tā zhǐ shì gè chū xué zhě yāo qiú bù yào tài gāo",
                "tā zhǐ shì bì jìng gè chū xué zhě bù yào yāo qiú tài gāo",
                "tā zhǐ shì gè chū xué zhě bì jìng bù yào yāo qiú tài gāo"
            ]
        },
    ],

    'hsk6_l5_g2': [  # 逐渐 — Gradually / Step by step
        {
            "type": "multiple_choice",
            "question": "逐渐 + Verb/Adj expresses...",
            "correct": "A gradual, step-by-step change over time — more formal and deliberate than 慢慢",
            "options": [
                "A gradual, step-by-step change over time — more formal and deliberate than 慢慢",
                "A sudden, one-time change that happens unexpectedly",
                "A change that happens only after a condition is met",
                "An occasional change that happens from time to time"
            ],
            "option_pinyin": ["zhú jiàn", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: His Chinese level gradually improved.",
            "correct": "逐渐",
            "options": ["逐渐", "突然", "毕竟", "或许"],
            "option_pinyin": ["zhú jiàn", "tū rán", "bì jìng", "huò xǔ"],
            "question_chinese": "他的汉语水平___提高了。",
            "question_pinyin": "他的汉语水平___提高了。",
            "question_english": "His Chinese level gradually improved."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 逐渐?",
            "correct": "随着时间推移，他们逐渐接受了这个现实。",
            "options": [
                "随着时间推移，他们逐渐接受了这个现实。",
                "随着时间推移，逐渐他们接受了这个现实。",
                "他们随着时间推移，这个现实逐渐接受了。",
                "逐渐随着时间推移，他们接受了这个现实。"
            ],
            "option_pinyin": [
                "suí zhe shí jiān tuī yí tā men zhú jiàn jiē shòu le zhè gè xiàn shí",
                "suí zhe shí jiān tuī yí zhú jiàn tā men jiē shòu le zhè gè xiàn shí",
                "tā men suí zhe shí jiān tuī yí zhè gè xiàn shí zhú jiàn jiē shòu le",
                "zhú jiàn suí zhe shí jiān tuī yí tā men jiē shòu le zhè gè xiàn shí"
            ]
        },
    ],

    'hsk6_l5_g3': [  # 或许 — Perhaps / Maybe (formal)
        {
            "type": "multiple_choice",
            "question": "或许 in a sentence means...",
            "correct": "Perhaps / Maybe — expresses uncertainty about a possibility (more formal and literary than 也许)",
            "options": [
                "Perhaps / Maybe — expresses uncertainty about a possibility (more formal and literary than 也许)",
                "After all — acknowledges a fundamental truth",
                "Gradually — describes a slow change over time",
                "Actually — introduces a surprising or contrasting fact"
            ],
            "option_pinyin": ["huò xǔ", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Perhaps he is just too embarrassed to admit his mistake.",
            "correct": "或许",
            "options": ["或许", "毕竟", "逐渐", "因此"],
            "option_pinyin": ["huò xǔ", "bì jìng", "zhú jiàn", "yīn cǐ"],
            "question_chinese": "___他只是不好意思承认自己的错误。",
            "question_pinyin": "___他只是不好意思承认自己的错误。",
            "question_english": "Perhaps he is just too embarrassed to admit his mistake."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 或许?",
            "correct": "他或许是对的，但我们需要更多证据。",
            "options": [
                "他或许是对的，但我们需要更多证据。",
                "或许他是，对的但我们需要更多证据。",
                "他是或许对的，但我们需要更多证据。",
                "我们需要更多证据，或许他是对的。"
            ],
            "option_pinyin": [
                "tā huò xǔ shì duì de dàn wǒ men xū yào gèng duō zhèng jù",
                "huò xǔ tā shì duì de dàn wǒ men xū yào gèng duō zhèng jù",
                "tā shì huò xǔ duì de dàn wǒ men xū yào gèng duō zhèng jù",
                "wǒ men xū yào gèng duō zhèng jù huò xǔ tā shì duì de"
            ]
        },
    ],

    # ── L6 ────────────────────────────────────────────────────────────────────
    'hsk6_l6_g1': [  # 显示 vs 显得 — objective vs subjective
        {
            "type": "multiple_choice",
            "question": "The key difference between 显示 and 显得 is...",
            "correct": "显示 is objective (data or facts demonstrate something); 显得 is subjective (a person seems or appears to be a certain way)",
            "options": [
                "显示 is objective (data or facts demonstrate something); 显得 is subjective (a person seems or appears to be a certain way)",
                "显示 is used for people; 显得 is used for data and facts",
                "They are interchangeable with no difference in meaning",
                "显示 is formal; 显得 is informal and only used in speech"
            ],
            "option_pinyin": ["xiǎn shì vs xiǎn de", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: The data shows that this method works very well.",
            "correct": "显示",
            "options": ["显示", "显得", "证明", "提出"],
            "option_pinyin": ["xiǎn shì", "xiǎn de", "zhèng míng", "tí chū"],
            "question_chinese": "数据___这个方法效果很好。",
            "question_pinyin": "数据___这个方法效果很好。",
            "question_english": "The data shows that this method works very well."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 显得?",
            "correct": "他说话时显得非常自信。",
            "options": [
                "他说话时显得非常自信。",
                "他说话时显示非常自信。",
                "他显得说话时非常自信。",
                "显得他说话时非常自信。"
            ],
            "option_pinyin": [
                "tā shuō huà shí xiǎn de fēi cháng zì xìn",
                "tā shuō huà shí xiǎn shì fēi cháng zì xìn",
                "tā xiǎn de shuō huà shí fēi cháng zì xìn",
                "xiǎn de tā shuō huà shí fēi cháng zì xìn"
            ]
        },
    ],

    'hsk6_l6_g2': [  # 围绕 — Revolving around / Centering on
        {
            "type": "multiple_choice",
            "question": "围绕 + N/VP means...",
            "correct": "Revolving around / Centering on — the action or discussion is organised around a central topic or point",
            "options": [
                "Revolving around / Centering on — the action or discussion is organised around a central topic or point",
                "In response to — targeting a specific issue with a solution",
                "According to — basing something on a source or rule",
                "By means of — using something as a method to achieve a goal"
            ],
            "option_pinyin": ["wéi rào", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: The discussion revolves around this core issue.",
            "correct": "围绕",
            "options": ["围绕", "针对", "提出", "根据"],
            "option_pinyin": ["wéi rào", "zhēn duì", "tí chū", "gēn jù"],
            "question_chinese": "讨论___这个核心问题展开。",
            "question_pinyin": "讨论___这个核心问题展开。",
            "question_english": "The discussion revolves around this core issue."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 围绕?",
            "correct": "这场辩论围绕一个问题：自由重要还是秩序重要？",
            "options": [
                "这场辩论围绕一个问题：自由重要还是秩序重要？",
                "一个问题围绕这场辩论：自由重要还是秩序重要？",
                "这场辩论一个问题围绕：自由重要还是秩序重要？",
                "围绕这场辩论：一个问题自由重要还是秩序重要？"
            ],
            "option_pinyin": [
                "zhè chǎng biàn lùn wéi rào yī gè wèn tí zì yóu zhòng yào hái shì zhì xù zhòng yào",
                "yī gè wèn tí wéi rào zhè chǎng biàn lùn zì yóu zhòng yào hái shì zhì xù zhòng yào",
                "zhè chǎng biàn lùn yī gè wèn tí wéi rào zì yóu zhòng yào hái shì zhì xù zhòng yào",
                "wéi rào zhè chǎng biàn lùn yī gè wèn tí zì yóu zhòng yào hái shì zhì xù zhòng yào"
            ]
        },
    ],

    'hsk6_l6_g3': [  # 针对 — Targeting / In response to / Regarding
        {
            "type": "multiple_choice",
            "question": "针对 + N/VP means...",
            "correct": "Targeting / In response to / Aimed at — the action is specifically directed at a particular issue or target",
            "options": [
                "Targeting / In response to / Aimed at — the action is specifically directed at a particular issue or target",
                "Revolving around — organising a discussion around a central topic",
                "According to — basing an action on a source or rule",
                "In order to — expressing the purpose of an action"
            ],
            "option_pinyin": ["zhēn duì", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: He proposed a specific solution targeting this problem.",
            "correct": "针对",
            "options": ["针对", "围绕", "根据", "为了"],
            "option_pinyin": ["zhēn duì", "wéi rào", "gēn jù", "wèi le"],
            "question_chinese": "他___这个问题，提出了具体的解决方案。",
            "question_pinyin": "他___这个问题，提出了具体的解决方案。",
            "question_english": "He proposed a specific solution targeting this problem."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 针对?",
            "correct": "他针对对方的论点，进行了有力的反驳。",
            "options": [
                "他针对对方的论点，进行了有力的反驳。",
                "对方的论点他针对，进行了有力的反驳。",
                "针对进行了，他对方的论点有力的反驳。",
                "他进行了有力的反驳，对方的论点针对。"
            ],
            "option_pinyin": [
                "tā zhēn duì duì fāng de lùn diǎn jìn xíng le yǒu lì de fǎn bó",
                "duì fāng de lùn diǎn tā zhēn duì jìn xíng le yǒu lì de fǎn bó",
                "zhēn duì jìn xíng le tā duì fāng de lùn diǎn yǒu lì de fǎn bó",
                "tā jìn xíng le yǒu lì de fǎn bó duì fāng de lùn diǎn zhēn duì"
            ]
        },
    ],

    # ── L7 ────────────────────────────────────────────────────────────────────
    'hsk6_l7_g1': [  # 就算…也 — Even if…still
        {
            "type": "multiple_choice",
            "question": "就算...也... expresses...",
            "correct": "Even if X (a hypothetical or extreme case), Y is still true — a concession to a hypothetical that doesn't change the conclusion",
            "options": [
                "Even if X (a hypothetical or extreme case), Y is still true — a concession to a hypothetical that doesn't change the conclusion",
                "Since X is already the case, Y naturally follows",
                "As long as X is met, Y will happen",
                "Once X happens, Y will immediately follow"
            ],
            "option_pinyin": ["jiù suàn...yě...", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Even if you are very busy, you still need to ensure adequate sleep.",
            "correct": "就算",
            "options": ["就算", "虽然", "如果", "一旦"],
            "option_pinyin": ["jiù suàn", "suī rán", "rú guǒ", "yí dàn"],
            "question_chinese": "___再忙，也要保证充足的睡眠。",
            "question_pinyin": "___再忙，也要保证充足的睡眠。",
            "question_english": "Even if you are very busy, you still need to ensure adequate sleep."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 就算…也?",
            "correct": "就算只睡几个小时，也要保持规律的作息。",
            "options": [
                "就算只睡几个小时，也要保持规律的作息。",
                "只睡几个小时就算，也要保持规律的作息。",
                "也就算只睡几个小时，要保持规律的作息。",
                "保持规律的作息，就算只睡几个小时也。"
            ],
            "option_pinyin": [
                "jiù suàn zhǐ shuì jǐ gè xiǎo shí yě yào bǎo chí guī lǜ de zuò xī",
                "zhǐ shuì jǐ gè xiǎo shí jiù suàn yě yào bǎo chí guī lǜ de zuò xī",
                "yě jiù suàn zhǐ shuì jǐ gè xiǎo shí yào bǎo chí guī lǜ de zuò xī",
                "bǎo chí guī lǜ de zuò xī jiù suàn zhǐ shuì jǐ gè xiǎo shí yě"
            ]
        },
    ],

    'hsk6_l7_g2': [  # 不得不 — Cannot help but (different exercises from L4 GP3)
        {
            "type": "multiple_choice",
            "question": "不得不 differs from 必须 in that...",
            "correct": "不得不 implies reluctant necessity forced by circumstances; 必须 states a required obligation or rule",
            "options": [
                "不得不 implies reluctant necessity forced by circumstances; 必须 states a required obligation or rule",
                "They are completely interchangeable in all contexts",
                "不得不 is used in formal writing only; 必须 is used in speech",
                "不得不 expresses a voluntary choice; 必须 expresses reluctance"
            ],
            "option_pinyin": ["bù dé bù vs bì xū", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Long-term insomnia forced him to go see a doctor.",
            "correct": "不得不",
            "options": ["不得不", "必要", "充足", "突然"],
            "option_pinyin": ["bù dé bù", "bì yào", "chōng zú", "tū rán"],
            "question_chinese": "长期失眠让他___去看医生。",
            "question_pinyin": "长期失眠让他___去看医生。",
            "question_english": "Long-term insomnia forced him to go see a doctor."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 不得不?",
            "correct": "睡眠不足让他不得不降低工作效率。",
            "options": [
                "睡眠不足让他不得不降低工作效率。",
                "不得不睡眠不足让他，降低工作效率。",
                "他睡眠不足，不得不让降低工作效率。",
                "降低工作效率，睡眠不足不得不让他。"
            ],
            "option_pinyin": [
                "shuì mián bù zú ràng tā bù dé bù jiàng dī gōng zuò xiào lǜ",
                "bù dé bù shuì mián bù zú ràng tā jiàng dī gōng zuò xiào lǜ",
                "tā shuì mián bù zú bù dé bù ràng jiàng dī gōng zuò xiào lǜ",
                "jiàng dī gōng zuò xiào lǜ shuì mián bù zú bù dé bù ràng tā"
            ]
        },
    ],

    'hsk6_l7_g3': [  # 从而 — Thus; thereby; and as a result
        {
            "type": "multiple_choice",
            "question": "从而 in a sentence means...",
            "correct": "Thereby / Thus — introduces a natural consequence or further result arising from the preceding action",
            "options": [
                "Thereby / Thus — introduces a natural consequence or further result arising from the preceding action",
                "However — introduces an unexpected contrast to the previous statement",
                "In order to — introduces the purpose behind an action",
                "Unless — introduces the only exception to a statement"
            ],
            "option_pinyin": ["cóng ér", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Adjust your schedule, thereby improving sleep quality.",
            "correct": "从而",
            "options": ["从而", "因此", "所以", "然后"],
            "option_pinyin": ["cóng ér", "yīn cǐ", "suǒ yǐ", "rán hòu"],
            "question_chinese": "调整作息时间，___改善睡眠质量。",
            "question_pinyin": "调整作息时间，___改善睡眠质量。",
            "question_english": "Adjust your schedule, thereby improving sleep quality."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 从而?",
            "correct": "他通过实验，从而发现了睡眠规律的秘密。",
            "options": [
                "他通过实验，从而发现了睡眠规律的秘密。",
                "从而他通过实验，发现了睡眠规律的秘密。",
                "他从而，通过实验发现了睡眠规律的秘密。",
                "发现了睡眠规律的秘密，从而他通过实验。"
            ],
            "option_pinyin": [
                "tā tōng guò shí yàn cóng ér fā xiàn le shuì mián guī lǜ de mì mì",
                "cóng ér tā tōng guò shí yàn fā xiàn le shuì mián guī lǜ de mì mì",
                "tā cóng ér tōng guò shí yàn fā xiàn le shuì mián guī lǜ de mì mì",
                "fā xiàn le shuì mián guī lǜ de mì mì cóng ér tā tōng guò shí yàn"
            ]
        },
    ],
}

# ── grammar key mapping ────────────────────────────────────────────────────────

GRAMMAR_KEYS = {
    1: ['hsk6_l1_g1', 'hsk6_l1_g2', 'hsk6_l1_g3'],
    2: ['hsk6_l2_g1', 'hsk6_l2_g2', 'hsk6_l2_g3'],
    3: ['hsk6_l3_g1', 'hsk6_l3_g2', 'hsk6_l3_g3'],
    4: ['hsk6_l4_g1', 'hsk6_l4_g2', 'hsk6_l4_g3'],
    5: ['hsk6_l5_g1', 'hsk6_l5_g2', 'hsk6_l5_g3'],
    6: ['hsk6_l6_g1', 'hsk6_l6_g2', 'hsk6_l6_g3'],
    7: ['hsk6_l7_g1', 'hsk6_l7_g2', 'hsk6_l7_g3'],
}

# ── main processing ───────────────────────────────────────────────────────────

random.seed(42)
DATA_DIR = os.path.dirname(os.path.abspath(__file__))

for lesson_num in range(1, 8):
    path = os.path.join(DATA_DIR, f'hsk6_lesson_{lesson_num}.json')
    with open(path, encoding='utf-8') as f:
        data = json.load(f)

    pool = [v for v in data['vocabulary'] if v.get('part_of_speech') != 'phrase']

    vocab_count = 0
    for word in data['vocabulary']:
        if word.get('part_of_speech') == 'phrase':
            continue
        word['mini_exercises'] = gen_vocab_mini(word, pool)
        vocab_count += 1

    gp_count = 0
    gps = data.get('grammar_points', [])
    keys = GRAMMAR_KEYS[lesson_num]
    for i, gp in enumerate(gps):
        key = keys[i] if i < len(keys) else None
        if key and key in GRAMMAR_MINI:
            gp['mini_exercises'] = copy.deepcopy(GRAMMAR_MINI[key])
            gp_count += 1

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f'L{lesson_num}: {vocab_count} vocab words, {gp_count} grammar points — done.')

print('\nAll done!')
