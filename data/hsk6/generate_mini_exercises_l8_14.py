"""
Generate mini_exercises for HSK6 lessons 8-14.
Same pattern as L1-7 script: 3 per vocab word (non-phrase), 3 per grammar point.

Duplicates within L8-14:
  Vocab: 依赖 (L8+L12), 平台/交流/功能/便利 (L9+L10) — one SENTENCES entry each
  Grammar: 与其…不如 (L8G2, different from L4G2), 从而 (L9G2, different from L7G3),
           宁可…也不 (L12G3, different from L3G2)
"""
import json, random, copy, os

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
    # L8 — Better Sleep Habits (依赖 shared with L12)
    '科技':   ('现代___改变了人们的睡眠方式。', 'Modern technology has changed the way people sleep.'),
    '依赖':   ('很多人太___闹钟，反而失去了自然醒来的能力。', 'Many people rely too much on alarm clocks, and end up losing the ability to wake up naturally.'),
    '醒来':   ('如果能自然___，人的状态会好得多。', 'If you can wake up naturally, you will feel much better.'),
    '温和':   ('用___的音乐代替刺耳的闹铃，起床会更舒服。', 'Using gentle music instead of a harsh alarm makes getting up more comfortable.'),
    '光线':   ('早晨的自然___能帮助调节人体的生物钟。', 'Morning natural light helps regulate the body\'s biological clock.'),
    '刺激':   ('突然的噪音是对大脑的强烈___，会引起应激反应。', 'Sudden noise is a strong stimulus to the brain and triggers a stress response.'),
    '代替':   ('有人尝试用光照闹钟___传统的声音闹钟。', 'Some people try using light-based alarm clocks to replace traditional sound alarms.'),
    '改善':   ('养成规律的作息习惯可以有效___睡眠质量。', 'Developing regular sleep habits can effectively improve sleep quality.'),
    '方式':   ('每个人可以根据自己的情况找到最适合的起床___。', 'Everyone can find the most suitable way to wake up based on their own situation.'),
    '建议':   ('专家___，尽量在同一时间入睡和起床。', 'Experts suggest going to sleep and waking up at the same time every day.'),
    '压力':   ('减少早晨的___，有助于开始愉快的一天。', 'Reducing morning pressure helps start the day pleasantly.'),
    '逐步':   ('改变睡眠习惯需要时间，应该___调整，不能操之过急。', 'Changing sleep habits takes time; adjustments should be made step by step.'),
    '质量':   ('睡眠___比睡眠时间更重要。', 'Sleep quality is more important than sleep duration.'),
    '反而':   ('他以为多睡会解决疲劳，但___让他整天昏昏沉沉。', 'He thought sleeping more would fix his fatigue, but it instead left him groggy all day.'),
    '及时':   ('感到疲劳时，应该___休息，不要硬撑。', 'When you feel tired, you should rest promptly instead of pushing through.'),
    '精神':   ('早晨自然醒来，___状态往往比被闹钟惊醒好得多。', 'Waking up naturally in the morning usually results in much better mental energy than being jolted awake by an alarm.'),

    # L9 — Social Apps & Digital Communication (平台/交流/功能/便利 shared with L10)
    '海外':   ('许多在___生活的中国人都靠微信与家人保持联系。', 'Many Chinese people living overseas rely on WeChat to stay in touch with family.'),
    '用户':   ('微信在全球的___数量已经超过十亿。', 'The number of WeChat users worldwide has already exceeded one billion.'),
    '传播':   ('这款应用通过口耳相传迅速在全球___开来。', 'This app spread rapidly around the world through word of mouth.'),
    '软件':   ('智能手机上安装了各种各样的___，方便人们的生活。', 'Smartphones have all kinds of software installed, making people\'s lives more convenient.'),
    '功能':   ('微信拥有通话、支付、购物等多种___，深受用户喜爱。', 'WeChat has many functions such as calling, payment, and shopping, and is loved by users.'),
    '便利':   ('即时通讯工具让远距离沟通变得更加___。', 'Instant messaging tools make long-distance communication much more convenient.'),
    '社交':   ('很多人每天都要花大量时间使用___软件。', 'Many people spend a lot of time every day using social apps.'),
    '联系':   ('出国后，他每周都通过视频通话与父母___。', 'After going abroad, he keeps in contact with his parents via video call every week.'),
    '平台':   ('微博和微信是中国最受欢迎的两个社交___。', 'Weibo and WeChat are China\'s two most popular social platforms.'),
    '流行':   ('这款应用在年轻人中非常___，几乎人手一个。', 'This app is very popular among young people — almost everyone has it.'),
    '账号':   ('要使用这个软件，首先需要注册一个___。', 'To use this app, you first need to register an account.'),
    '交流':   ('微信为不同国家的用户提供了跨文化___的机会。', 'WeChat provides users from different countries with opportunities for cross-cultural communication.'),
    '随时':   ('有了手机，我们可以___随地与朋友联系。', 'With a phone, we can contact friends at any time and from anywhere.'),
    '普及':   ('智能手机的___让移动应用的使用变得十分广泛。', 'The widespread adoption of smartphones has made mobile app usage very common.'),
    '方便':   ('与打电话相比，发消息更加___，也不会打扰对方。', 'Compared to calling, sending messages is more convenient and does not disturb the other person.'),
    '小程序': ('微信___不需要下载安装，打开即用，非常方便。', 'WeChat mini-programs do not need to be downloaded or installed — just open and use.'),
    '邮寄':   ('她把家乡的特产___给了在海外留学的女儿。', 'She mailed local specialties from her hometown to her daughter studying abroad.'),

    # L10 — Digital Economy (平台/交流/功能/便利 shared above)
    '影响':   ('微信的出现深刻地___了人们的日常沟通方式。', 'The emergence of WeChat has profoundly influenced how people communicate daily.'),
    '内容':   ('优质的___是吸引用户的关键。', 'High-quality content is key to attracting users.'),
    '分享':   ('她喜欢在朋友圈___自己在海外的生活。', 'She likes to share her life abroad on Moments.'),
    '商业':   ('不少中小___都开始使用微信进行营销。', 'Many small and medium businesses have started using WeChat for marketing.'),
    '支付':   ('在中国，扫码___已经成为最常见的消费方式之一。', 'In China, scan-to-pay has become one of the most common ways to make purchases.'),
    '全球':   ('中国的数字经济在___范围内具有重要影响力。', 'China\'s digital economy has significant influence on a global scale.'),
    '推广':   ('政府积极___数字经济，以促进社会发展。', 'The government actively promotes the digital economy to advance social development.'),
    '认同':   ('海外华人通过微信寻找文化___感。', 'Overseas Chinese seek a sense of cultural identity through WeChat.'),
    '数据':   ('根据最新___，微信每天的活跃用户超过十亿。', 'According to the latest data, WeChat has over one billion daily active users.'),
    '创新':   ('技术___是推动数字经济发展的核心动力。', 'Technological innovation is the core driving force behind the development of the digital economy.'),
    '趋势':   ('数字化已经成为全球经济发展的重要___。', 'Digitalization has become an important trend in global economic development.'),

    # L11 — Healthy Weight Management
    '体重':   ('他每天早上起床后都会量一下___。', 'He weighs himself every morning after getting up.'),
    '节食':   ('医生建议她通过合理___和适量运动来改善健康状况。', 'The doctor recommended she improve her health through sensible dieting and moderate exercise.'),
    '减肥':   ('她一直努力___，但医生提醒她不能操之过急。', 'She has been working hard to lose weight, but the doctor reminded her not to rush.'),
    '营养':   ('孩子成长阶段需要充足的___，家长应该注意饮食的多样性。', 'Children need adequate nutrition during growth; parents should pay attention to dietary variety.'),
    '均衡':   ('营养师建议她保持___的饮食，不要偏食某一类食物。', 'The nutritionist advised her to maintain a balanced diet and not favor any one type of food.'),
    '摄入':   ('减肥期间应该控制热量的___，但不能完全不吃碳水化合物。', 'During weight loss, caloric intake should be controlled, but carbohydrates cannot be cut out completely.'),
    '代谢':   ('年纪越大，身体的___速度往往会逐渐变慢。', 'The older you get, the slower your body\'s metabolism tends to become.'),
    '能量':   ('食物中的碳水化合物是人体最主要的___来源之一。', 'Carbohydrates in food are one of the body\'s most important sources of energy.'),
    '合理':   ('只要饮食习惯___，不需要刻意节食也能维持健康的体重。', 'As long as your eating habits are reasonable, you can maintain a healthy weight without deliberate dieting.'),
    '标准':   ('BMI是目前国际上评估体重是否健康的常用___之一。', 'BMI is one of the commonly used standards internationally for assessing whether body weight is healthy.'),
    '过度':   ('___减肥不仅无法持续，还可能对身体造成不可逆的伤害。', 'Excessive weight loss is not only unsustainable but may also cause irreversible damage to the body.'),
    '危险':   ('极端节食对身体存在很大的___，尤其是对正在发育的青少年。', 'Extreme dieting poses great risks to the body, especially for adolescents who are still developing.'),
    '科学':   ('采用___的方法减肥，比盲目跟风节食要安全有效得多。', 'Using scientific methods to lose weight is much safer and more effective than blindly following diet trends.'),
    '保持':   ('她通过规律运动和合理饮食，多年来一直___着健康的体重。', 'Through regular exercise and a sensible diet, she has maintained a healthy weight for many years.'),
    '适量':   ('每餐___进食，既能满足身体所需，又不会造成热量过剩。', 'Eating in appropriate amounts at each meal satisfies the body\'s needs without excess calories.'),

    # L12 — Nutrition Science (依赖 shared with L8)
    '消化':   ('细嚼慢咽有助于食物的___和吸收。', 'Chewing slowly and carefully helps with the digestion and absorption of food.'),
    '蛋白质': ('豆腐和鸡蛋都是优质___的来源。', 'Tofu and eggs are both excellent sources of protein.'),
    '脂肪':   ('人体需要一定量的___来维持正常的生理功能。', 'The body needs a certain amount of fat to maintain normal physiological functions.'),
    '维生素': ('多吃蔬菜水果可以补充人体所需的___。', 'Eating more vegetables and fruit can replenish the vitamins the body needs.'),
    '热量':   ('很多人不了解食物的___，导致不经意间摄入过多。', 'Many people do not know the caloric content of food, leading them to unknowingly consume too much.'),
    '搭配':   ('合理的食物___能够提高营养的吸收效率。', 'Reasonable food combinations can improve the efficiency of nutrient absorption.'),
    '慢性病': ('不健康的饮食习惯是导致多种___的重要原因。', 'Unhealthy eating habits are a major cause of many chronic diseases.'),
    '预防':   ('合理饮食是___慢性病的最自然的方法之一。', 'A sensible diet is one of the most natural ways to prevent chronic disease.'),
    '规律':   ('___的饮食习惯对维持血糖稳定非常重要。', 'Regular eating habits are very important for maintaining stable blood sugar.'),
    '糖分':   ('很多加工食品含有大量隐藏的___，长期摄入不利于健康。', 'Many processed foods contain large amounts of hidden sugar, and long-term intake is harmful to health.'),
    '矿物质': ('牛奶和绿叶蔬菜是补充钙等___的良好来源。', 'Milk and leafy greens are good sources of minerals such as calcium.'),
    '纤维':   ('多吃富含___的食物有助于消化和预防便秘。', 'Eating foods rich in fiber helps with digestion and preventing constipation.'),
    '谷物':   ('全___含有丰富的膳食纤维和微量元素。', 'Whole grains are rich in dietary fiber and trace elements.'),

    # L13 — Understanding Abstract Art
    '抽象':   ('___艺术不直接描绘现实，而是通过形状和色彩传达情感。', 'Abstract art does not depict reality directly; instead it conveys emotion through shape and color.'),
    '具体':   ('与抽象艺术相对，___艺术描绘真实可见的形象。', 'In contrast to abstract art, concrete art depicts real and visible images.'),
    '形式':   ('艺术的___多种多样，从绘画到雕塑，各有其美。', 'Art takes many forms, from painting to sculpture, each with its own beauty.'),
    '感受':   ('每个人对同一幅抽象画的___都可能不同。', 'Each person may have a different feeling when looking at the same abstract painting.'),
    '理解':   ('对抽象艺术的___往往需要一定的文化背景和艺术知识。', 'Understanding abstract art often requires a certain cultural background and knowledge of art.'),
    '欣赏':   ('学会___不同风格的艺术，可以拓宽一个人的视野。', 'Learning to appreciate art of different styles can broaden one\'s horizons.'),
    '表达':   ('艺术是人类情感和思想的重要___方式。', 'Art is an important way for humans to express emotions and ideas.'),
    '色彩':   ('这幅画的___非常丰富，给人温暖的感受。', 'The colors of this painting are very rich, giving people a warm feeling.'),
    '线条':   ('简洁的___往往能传达出丰富的情感内容。', 'Simple lines can often convey rich emotional content.'),
    '创作':   ('艺术___需要想象力，也需要技巧。', 'Artistic creation requires both imagination and skill.'),
    '审美':   ('不同文化背景的人，___观念也会有所不同。', 'People from different cultural backgrounds may have different aesthetic concepts.'),
    '意义':   ('抽象艺术的___往往由观者自己来赋予。', 'The meaning of abstract art is often assigned by the viewer themselves.'),
    '象征':   ('白色在西方文化中___纯洁，在东亚文化中则常与哀悼相关。', 'White symbolizes purity in Western culture, while in East Asian cultures it is often associated with mourning.'),
    '风格':   ('这位艺术家的___独特，一眼就能辨认出。', 'This artist\'s style is unique and recognizable at a glance.'),
    '主观':   ('艺术欣赏带有很强的___性，没有绝对的对错之分。', 'Art appreciation is highly subjective — there is no absolute right or wrong.'),

    # L14 — The Deeper Experience of Art
    '感知':   ('人类通过感官___世界，形成对美的独特理解。', 'Humans perceive the world through their senses, forming a unique understanding of beauty.'),
    '情感':   ('优秀的艺术作品往往能够触动人深处的___。', 'Outstanding works of art can often touch the deepest emotions of a person.'),
    '传达':   ('艺术家通过色彩和线条___自己内心的情感。', 'Artists convey their inner emotions through color and line.'),
    '观念':   ('随着时代的发展，人们的审美___也在不断变化。', 'As the times change, people\'s aesthetic concepts continue to evolve.'),
    '独特':   ('每位艺术家都有自己___的创作风格和表达方式。', 'Every artist has their own unique creative style and means of expression.'),
    '共鸣':   ('这首歌引发了很多听众的___，大家都深有感触。', 'This song resonated with many listeners, who all felt deeply moved.'),
    '直觉':   ('欣赏艺术有时候靠的是___，而不是逻辑分析。', 'Appreciating art sometimes relies on intuition rather than logical analysis.'),
    '背景':   ('了解作品的历史___有助于更深入地理解其艺术价值。', 'Understanding the historical background of a work helps one appreciate its artistic value more deeply.'),
    '境界':   ('真正的艺术欣赏能够将人带入一种超越日常的精神___。', 'True art appreciation can take a person into a spiritual realm that transcends everyday life.'),
    '联想':   ('看到这幅画，我会自然___到童年时的夏天。', 'Looking at this painting, I naturally associate it with summer in my childhood.'),
    '视角':   ('从不同的___欣赏同一件艺术品，会得到完全不同的体验。', 'Appreciating the same artwork from different perspectives yields completely different experiences.'),
    '启发':   ('好的艺术作品能够___人们思考生命的意义。', 'Good works of art can inspire people to think about the meaning of life.'),
    '超越':   ('伟大的艺术作品往往能够___时代和文化的限制。', 'Great works of art can often transcend the boundaries of time and culture.'),
    '沉浸':   ('她完全___在音乐里，忘记了时间的流逝。', 'She was completely immersed in the music, forgetting the passage of time.'),
    '诠释':   ('每位表演者都以自己的方式___了这首作品的意境。', 'Each performer interpreted the mood of this piece in their own way.'),
}

# ── handcrafted grammar mini exercises ───────────────────────────────────────

GRAMMAR_MINI = {

    # ── L8 ────────────────────────────────────────────────────────────────────
    'hsk6_l8_g1': [  # 反而 — On the contrary; unexpectedly the opposite
        {
            "type": "multiple_choice",
            "question": "反而 in a sentence expresses...",
            "correct": "An outcome that is the opposite of what was expected or intended",
            "options": [
                "An outcome that is the opposite of what was expected or intended",
                "A gradual and natural change over time",
                "A logical result that follows directly from a cause",
                "An additional point that goes beyond what was already stated"
            ],
            "option_pinyin": ["fǎn ér", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: He thought sleeping more would help, but it instead made him more tired.",
            "correct": "反而",
            "options": ["反而", "逐步", "及时", "因此"],
            "option_pinyin": ["fǎn ér", "zhú bù", "jí shí", "yīn cǐ"],
            "question_chinese": "他以为多睡会有帮助，___让他更疲惫了。",
            "question_pinyin": "他以为多睡会有帮助，___让他更疲惫了。",
            "question_english": "He thought sleeping more would help, but it instead made him more tired."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 反而?",
            "correct": "减少压力之后，他的睡眠质量反而提高了。",
            "options": [
                "减少压力之后，他的睡眠质量反而提高了。",
                "反而减少压力之后，他的睡眠质量提高了。",
                "他的睡眠质量提高了，减少压力之后反而。",
                "他减少了反而压力，睡眠质量提高了。"
            ],
            "option_pinyin": [
                "jiǎn shǎo yā lì zhī hòu tā de shuì mián zhì liàng fǎn ér tí gāo le",
                "fǎn ér jiǎn shǎo yā lì zhī hòu tā de shuì mián zhì liàng tí gāo le",
                "tā de shuì mián zhì liàng tí gāo le jiǎn shǎo yā lì zhī hòu fǎn ér",
                "tā jiǎn shǎo le fǎn ér yā lì shuì mián zhì liàng tí gāo le"
            ]
        },
    ],

    'hsk6_l8_g2': [  # 与其…不如… — Rather than…better to (different exercises from L4G2)
        {
            "type": "multiple_choice",
            "question": "与其...不如... shows...",
            "correct": "A preference for the second option over the first — 'rather than doing A, it is better to do B'",
            "options": [
                "A preference for the second option over the first — 'rather than doing A, it is better to do B'",
                "A concession: even though A is true, B is still the case",
                "A condition that must be met before the result can happen",
                "A sequence: first A happens, then B naturally follows"
            ],
            "option_pinyin": ["yǔ qí...bù rú...", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Rather than scrolling on your phone late at night, it is better to sleep early.",
            "correct": "与其",
            "options": ["与其", "虽然", "如果", "既然"],
            "option_pinyin": ["yǔ qí", "suī rán", "rú guǒ", "jì rán"],
            "question_chinese": "___半夜刷手机，不如早睡保证充足的休息。",
            "question_pinyin": "___半夜刷手机，不如早睡保证充足的休息。",
            "question_english": "Rather than scrolling on your phone late at night, it is better to sleep early."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 与其…不如?",
            "correct": "与其依赖药物助眠，不如改善作息习惯。",
            "options": [
                "与其依赖药物助眠，不如改善作息习惯。",
                "不如与其依赖药物助眠，改善作息习惯。",
                "与其不如依赖药物助眠，改善作息习惯。",
                "依赖药物助眠与其，不如改善作息习惯。"
            ],
            "option_pinyin": [
                "yǔ qí yī lài yào wù zhù mián bù rú gǎi shàn zuò xī xí guàn",
                "bù rú yǔ qí yī lài yào wù zhù mián gǎi shàn zuò xī xí guàn",
                "yǔ qí bù rú yī lài yào wù zhù mián gǎi shàn zuò xī xí guàn",
                "yī lài yào wù zhù mián yǔ qí bù rú gǎi shàn zuò xī xí guàn"
            ]
        },
    ],

    'hsk6_l8_g3': [  # 逐步 vs 逐渐
        {
            "type": "multiple_choice",
            "question": "The key difference between 逐步 and 逐渐 is...",
            "correct": "逐步 means step-by-step and implies a planned, deliberate progression; 逐渐 means gradually and describes a natural, unplanned change",
            "options": [
                "逐步 means step-by-step and implies a planned, deliberate progression; 逐渐 means gradually and describes a natural, unplanned change",
                "They are interchangeable with no difference in meaning",
                "逐步 is used for negative changes; 逐渐 is used for positive changes",
                "逐步 is used with people; 逐渐 is used to describe things or objects"
            ],
            "option_pinyin": ["zhú bù vs zhú jiàn", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: They adjusted the company's management step by step, with a clear goal at each stage.",
            "correct": "逐步",
            "options": ["逐步", "逐渐", "反而", "及时"],
            "option_pinyin": ["zhú bù", "zhú jiàn", "fǎn ér", "jí shí"],
            "question_chinese": "他们___调整了管理模式，每一阶段都有明确目标。",
            "question_pinyin": "他们___调整了管理模式，每一阶段都有明确目标。",
            "question_english": "They adjusted the management model step by step, with a clear goal at each stage."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 逐步 (deliberate, planned change)?",
            "correct": "他按照计划逐步掌握了新技术，每周都有明确的学习目标。",
            "options": [
                "他按照计划逐步掌握了新技术，每周都有明确的学习目标。",
                "天气逐步变凉了，秋天悄悄到了。",
                "她的心情逐步好了，没有刻意做任何调整。",
                "他逐步爱上了这座城市，没有特别的原因。"
            ],
            "option_pinyin": [
                "tā àn zhào jì huà zhú bù zhǎng wò le xīn jì shù měi zhōu dōu yǒu míng què de xué xí mù biāo",
                "tiān qì zhú bù biàn liáng le qiū tiān qiāo qiāo dào le",
                "tā de xīn qíng zhú bù hǎo le méi yǒu kè yì zuò rèn hé tiáo zhěng",
                "tā zhú bù ài shàng le zhè zuò chéng shì méi yǒu tè bié de yuán yīn"
            ]
        },
    ],

    # ── L9 ────────────────────────────────────────────────────────────────────
    'hsk6_l9_g1': [  # 以及 — As well as; and (formal listing)
        {
            "type": "multiple_choice",
            "question": "以及 is used to...",
            "correct": "List additional items in a formal context — equivalent to 'as well as' or 'and also'; more formal than 和 or 还有",
            "options": [
                "List additional items in a formal context — equivalent to 'as well as' or 'and also'; more formal than 和 or 还有",
                "Connect two contrasting clauses: 'however' or 'but'",
                "Introduce the result or consequence of a preceding action",
                "Indicate a time sequence: first A, then B"
            ],
            "option_pinyin": ["yǐ jí", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: This app supports sending text, images, videos, as well as voice messages.",
            "correct": "以及",
            "options": ["以及", "从而", "对于", "因此"],
            "option_pinyin": ["yǐ jí", "cóng ér", "duì yú", "yīn cǐ"],
            "question_chinese": "这款软件支持发送文字、图片、视频___语音消息。",
            "question_pinyin": "这款软件支持发送文字、图片、视频___语音消息。",
            "question_english": "This app supports sending text, images, videos, as well as voice messages."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 以及?",
            "correct": "她负责内容策划以及用户运营两个方向。",
            "options": [
                "她负责内容策划以及用户运营两个方向。",
                "以及她负责内容策划，用户运营两个方向。",
                "她负责内容策划，用户运营以及两个方向。",
                "她以及负责内容策划，用户运营两个方向。"
            ],
            "option_pinyin": [
                "tā fù zé nèi róng cè huà yǐ jí yòng hù yùn yíng liǎng gè fāng xiàng",
                "yǐ jí tā fù zé nèi róng cè huà yòng hù yùn yíng liǎng gè fāng xiàng",
                "tā fù zé nèi róng cè huà yòng hù yùn yíng yǐ jí liǎng gè fāng xiàng",
                "tā yǐ jí fù zé nèi róng cè huà yòng hù yùn yíng liǎng gè fāng xiàng"
            ]
        },
    ],

    'hsk6_l9_g2': [  # 从而 — Thus; thereby (different exercises from L7G3)
        {
            "type": "multiple_choice",
            "question": "从而 in a sentence indicates...",
            "correct": "A result or consequence that directly follows from the preceding action — 'thereby' or 'thus'; links cause and effect formally",
            "options": [
                "A result or consequence that directly follows from the preceding action — 'thereby' or 'thus'; links cause and effect formally",
                "A contrast with what was expected — 'on the contrary'",
                "A reason or cause for what follows in the sentence",
                "Two concurrent actions happening at the same time"
            ],
            "option_pinyin": ["cóng ér", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: This app lets users stay connected at any time, thereby breaking geographical distance barriers.",
            "correct": "从而",
            "options": ["从而", "以及", "对于", "虽然"],
            "option_pinyin": ["cóng ér", "yǐ jí", "duì yú", "suī rán"],
            "question_chinese": "这款软件让用户随时保持联系，___打破了地理的距离限制。",
            "question_pinyin": "这款软件让用户随时保持联系，___打破了地理的距离限制。",
            "question_english": "This app lets users stay connected at any time, thereby breaking geographical distance barriers."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 从而?",
            "correct": "社交媒体降低了沟通成本，从而让全球用户都能互相交流。",
            "options": [
                "社交媒体降低了沟通成本，从而让全球用户都能互相交流。",
                "从而社交媒体降低了沟通成本，让全球用户都能互相交流。",
                "社交媒体从而，降低了沟通成本，让全球用户都能互相交流。",
                "社交媒体降低了沟通成本，让全球用户都能互相从而交流。"
            ],
            "option_pinyin": [
                "shè jiāo méi tǐ jiàng dī le gōu tōng chéng běn cóng ér ràng quán qiú yòng hù dōu néng hù xiāng jiāo liú",
                "cóng ér shè jiāo méi tǐ jiàng dī le gōu tōng chéng běn ràng quán qiú yòng hù dōu néng hù xiāng jiāo liú",
                "shè jiāo méi tǐ cóng ér jiàng dī le gōu tōng chéng běn ràng quán qiú yòng hù dōu néng hù xiāng jiāo liú",
                "shè jiāo méi tǐ jiàng dī le gōu tōng chéng běn ràng quán qiú yòng hù dōu néng hù xiāng cóng ér jiāo liú"
            ]
        },
    ],

    'hsk6_l9_g3': [  # 对于 — Regarding; for; as for
        {
            "type": "multiple_choice",
            "question": "对于 is used to...",
            "correct": "Introduce the topic, person, or thing being discussed — 'regarding', 'as for', 'for'; often placed before the subject or at the start of a clause",
            "options": [
                "Introduce the topic, person, or thing being discussed — 'regarding', 'as for', 'for'; often placed before the subject or at the start of a clause",
                "Indicate a cause or reason for what follows in the sentence",
                "Introduce a result that follows from the previous clause",
                "Indicate that two things are happening at the same time"
            ],
            "option_pinyin": ["duì yú", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: For elderly people who are not familiar with smartphones, this app is somewhat complicated.",
            "correct": "对于",
            "options": ["对于", "以及", "从而", "由于"],
            "option_pinyin": ["duì yú", "yǐ jí", "cóng ér", "yóu yú"],
            "question_chinese": "___不太会用智能手机的老人来说，这款软件有些复杂。",
            "question_pinyin": "___不太会用智能手机的老人来说，这款软件有些复杂。",
            "question_english": "For elderly people who are not familiar with smartphones, this app is somewhat complicated."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 对于?",
            "correct": "对于这款应用的功能，很多用户表示非常满意。",
            "options": [
                "对于这款应用的功能，很多用户表示非常满意。",
                "这款应用的功能对于，很多用户表示非常满意。",
                "很多用户表示对于非常满意，这款应用的功能。",
                "这款应用对于的功能，很多用户表示非常满意。"
            ],
            "option_pinyin": [
                "duì yú zhè kuǎn yìng yòng de gōng néng hěn duō yòng hù biǎo shì fēi cháng mǎn yì",
                "zhè kuǎn yìng yòng de gōng néng duì yú hěn duō yòng hù biǎo shì fēi cháng mǎn yì",
                "hěn duō yòng hù biǎo shì duì yú fēi cháng mǎn yì zhè kuǎn yìng yòng de gōng néng",
                "zhè kuǎn yìng yòng duì yú de gōng néng hěn duō yòng hù biǎo shì fēi cháng mǎn yì"
            ]
        },
    ],

    # ── L10 ───────────────────────────────────────────────────────────────────
    'hsk6_l10_g1': [  # 不仅…而且… — Not only…but also
        {
            "type": "multiple_choice",
            "question": "不仅…而且… is used to...",
            "correct": "Connect two parallel clauses where the second extends or intensifies the first — 'not only…but also…'",
            "options": [
                "Connect two parallel clauses where the second extends or intensifies the first — 'not only…but also…'",
                "Present an unexpected contrast: even though A is true, B is still the case",
                "Give a reason or cause for the result that follows",
                "Indicate that only one specific condition matters"
            ],
            "option_pinyin": ["bù jǐn...ér qiě...", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: This app not only provides communication functions, but also supports online payment.",
            "correct": "不仅",
            "options": ["不仅", "由于", "究竟", "虽然"],
            "option_pinyin": ["bù jǐn", "yóu yú", "jiū jìng", "suī rán"],
            "question_chinese": "这款软件___提供了通讯功能，而且支持在线支付。",
            "question_pinyin": "这款软件___提供了通讯功能，而且支持在线支付。",
            "question_english": "This app not only provides communication functions, but also supports online payment."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 不仅…而且?",
            "correct": "微信不仅改变了通讯方式，而且重塑了商业模式。",
            "options": [
                "微信不仅改变了通讯方式，而且重塑了商业模式。",
                "微信改变了通讯方式不仅，而且重塑了商业模式。",
                "不仅微信，而且改变了通讯方式，重塑了商业模式。",
                "微信不仅改变了通讯方式，重塑了商业而且模式。"
            ],
            "option_pinyin": [
                "wēi xìn bù jǐn gǎi biàn le tōng xùn fāng shì ér qiě chóng sù le shāng yè mó shì",
                "wēi xìn gǎi biàn le tōng xùn fāng shì bù jǐn ér qiě chóng sù le shāng yè mó shì",
                "bù jǐn wēi xìn ér qiě gǎi biàn le tōng xùn fāng shì chóng sù le shāng yè mó shì",
                "wēi xìn bù jǐn gǎi biàn le tōng xùn fāng shì chóng sù le shāng yè ér qiě mó shì"
            ]
        },
    ],

    'hsk6_l10_g2': [  # 由于 — Due to; owing to; because of
        {
            "type": "multiple_choice",
            "question": "由于 introduces...",
            "correct": "A cause or reason — 'due to' or 'because of'; more formal than 因为 and often appears at the start of the sentence",
            "options": [
                "A cause or reason — 'due to' or 'because of'; more formal than 因为 and often appears at the start of the sentence",
                "A result that follows naturally from the previous action",
                "An unexpected contrast with the previous statement",
                "A hypothetical condition that has not yet occurred"
            ],
            "option_pinyin": ["yóu yú", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Due to the rapid development of the digital economy, China's electronic payment has gone global.",
            "correct": "由于",
            "options": ["由于", "不仅", "究竟", "对于"],
            "option_pinyin": ["yóu yú", "bù jǐn", "jiū jìng", "duì yú"],
            "question_chinese": "___数字经济的快速发展，中国的电子支付已走向全球。",
            "question_pinyin": "___数字经济的快速发展，中国的电子支付已走向全球。",
            "question_english": "Due to the rapid development of the digital economy, China's electronic payment has gone global."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 由于?",
            "correct": "由于网络覆盖不断扩大，偏远地区也能使用移动支付了。",
            "options": [
                "由于网络覆盖不断扩大，偏远地区也能使用移动支付了。",
                "网络覆盖由于不断扩大，偏远地区也能使用移动支付了。",
                "偏远地区由于也能使用移动支付了，网络覆盖不断扩大。",
                "由于偏远地区也能使用移动支付了，网络覆盖不断扩大。"
            ],
            "option_pinyin": [
                "yóu yú wǎng luò fù gài bù duàn kuò dà piān yuǎn dì qū yě néng shǐ yòng yí dòng zhī fù le",
                "wǎng luò fù gài yóu yú bù duàn kuò dà piān yuǎn dì qū yě néng shǐ yòng yí dòng zhī fù le",
                "piān yuǎn dì qū yóu yú yě néng shǐ yòng yí dòng zhī fù le wǎng luò fù gài bù duàn kuò dà",
                "yóu yú piān yuǎn dì qū yě néng shǐ yòng yí dòng zhī fù le wǎng luò fù gài bù duàn kuò dà"
            ]
        },
    ],

    'hsk6_l10_g3': [  # 究竟 — Exactly; after all; in the end
        {
            "type": "multiple_choice",
            "question": "究竟 has two main uses:",
            "correct": "In questions it adds emphasis demanding a clear answer ('exactly what…?'); in statements it means 'after all' to acknowledge a fundamental truth",
            "options": [
                "In questions it adds emphasis demanding a clear answer ('exactly what…?'); in statements it means 'after all' to acknowledge a fundamental truth",
                "It is used only in questions to politely express uncertainty",
                "It always introduces a surprising or unexpected result",
                "It indicates that something is happening gradually over time"
            ],
            "option_pinyin": ["jiū jìng", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Exactly what value can this platform bring to users?",
            "correct": "究竟",
            "options": ["究竟", "不仅", "由于", "以及"],
            "option_pinyin": ["jiū jìng", "bù jǐn", "yóu yú", "yǐ jí"],
            "question_chinese": "这个平台___能为用户带来什么价值？",
            "question_pinyin": "这个平台___能为用户带来什么价值？",
            "question_english": "Exactly what value can this platform bring to users?"
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 究竟?",
            "correct": "数字经济究竟对传统商业有多大的冲击？",
            "options": [
                "数字经济究竟对传统商业有多大的冲击？",
                "数字经济对传统商业有多大的冲击，究竟？",
                "究竟数字经济对传统商业，有多大的冲击？",
                "数字经济对究竟传统商业有多大的冲击？"
            ],
            "option_pinyin": [
                "shù zì jīng jì jiū jìng duì chuán tǒng shāng yè yǒu duō dà de chōng jī",
                "shù zì jīng jì duì chuán tǒng shāng yè yǒu duō dà de chōng jī jiū jìng",
                "jiū jìng shù zì jīng jì duì chuán tǒng shāng yè yǒu duō dà de chōng jī",
                "shù zì jīng jì duì jiū jìng chuán tǒng shāng yè yǒu duō dà de chōng jī"
            ]
        },
    ],

    # ── L11 ───────────────────────────────────────────────────────────────────
    'hsk6_l11_g1': [  # 尽量 — As much as possible
        {
            "type": "multiple_choice",
            "question": "尽量 + VP means...",
            "correct": "To do something as much as possible — expresses effort to reach the maximum degree within one's ability",
            "options": [
                "To do something as much as possible — expresses effort to reach the maximum degree within one's ability",
                "To do something in a moderate and balanced way",
                "To do something step by step in a deliberate sequence",
                "To be forced to do something due to circumstances"
            ],
            "option_pinyin": ["jǐn liàng", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: The doctor advised him to avoid high-calorie foods as much as possible.",
            "correct": "尽量",
            "options": ["尽量", "适当", "适量", "一方面"],
            "option_pinyin": ["jǐn liàng", "shì dāng", "shì liàng", "yī fāng miàn"],
            "question_chinese": "医生建议他___避免高热量食物。",
            "question_pinyin": "医生建议他___避免高热量食物。",
            "question_english": "The doctor advised him to avoid high-calorie foods as much as possible."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 尽量?",
            "correct": "为了保持体重，他尽量少吃甜食。",
            "options": [
                "为了保持体重，他尽量少吃甜食。",
                "为了保持体重，尽量他少吃甜食。",
                "他少吃甜食，为了保持体重尽量。",
                "为了保持体重，他少尽量吃甜食。"
            ],
            "option_pinyin": [
                "wèi le bǎo chí tǐ zhòng tā jǐn liàng shǎo chī tián shí",
                "wèi le bǎo chí tǐ zhòng jǐn liàng tā shǎo chī tián shí",
                "tā shǎo chī tián shí wèi le bǎo chí tǐ zhòng jǐn liàng",
                "wèi le bǎo chí tǐ zhòng tā shǎo jǐn liàng chī tián shí"
            ]
        },
    ],

    'hsk6_l11_g2': [  # 适当 — Appropriate; suitable; in moderation
        {
            "type": "multiple_choice",
            "question": "适当 in a sentence expresses...",
            "correct": "An appropriate, balanced, or moderate degree — not excessive, not too little; fitting the situation",
            "options": [
                "An appropriate, balanced, or moderate degree — not excessive, not too little; fitting the situation",
                "Doing something as much as possible to reach the highest degree",
                "A deliberate step-by-step progression toward a goal",
                "Two aspects of a topic presented side by side"
            ],
            "option_pinyin": ["shì dāng", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Appropriately reducing carbohydrate intake during weight loss is beneficial.",
            "correct": "适当",
            "options": ["适当", "尽量", "均衡", "过度"],
            "option_pinyin": ["shì dāng", "jǐn liàng", "jūn héng", "guò dù"],
            "question_chinese": "减肥期间，___减少碳水化合物的摄入是有益的。",
            "question_pinyin": "减肥期间，___减少碳水化合物的摄入是有益的。",
            "question_english": "Appropriately reducing carbohydrate intake during weight loss is beneficial."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 适当?",
            "correct": "每天适当运动有助于维持健康的体重。",
            "options": [
                "每天适当运动有助于维持健康的体重。",
                "每天适当有助于维持健康的体重，运动。",
                "每天运动有助于适当维持健康的体重。",
                "适当每天运动有助于维持健康的体重。"
            ],
            "option_pinyin": [
                "měi tiān shì dāng yùn dòng yǒu zhù yú wéi chí jiàn kāng de tǐ zhòng",
                "měi tiān shì dāng yǒu zhù yú wéi chí jiàn kāng de tǐ zhòng yùn dòng",
                "měi tiān yùn dòng yǒu zhù yú shì dāng wéi chí jiàn kāng de tǐ zhòng",
                "shì dāng měi tiān yùn dòng yǒu zhù yú wéi chí jiàn kāng de tǐ zhòng"
            ]
        },
    ],

    'hsk6_l11_g3': [  # 一方面…另一方面… — On one hand…on the other hand
        {
            "type": "multiple_choice",
            "question": "一方面…另一方面… is used to...",
            "correct": "Present two aspects of the same topic simultaneously — 'on one hand…on the other hand'; acknowledges both sides",
            "options": [
                "Present two aspects of the same topic simultaneously — 'on one hand…on the other hand'; acknowledges both sides",
                "Show that one action leads directly to a result",
                "Compare two options and indicate one is preferred over the other",
                "Introduce a surprising outcome that is opposite to what was expected"
            ],
            "option_pinyin": ["yī fāng miàn...lìng yī fāng miàn...", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: On one hand, reducing caloric intake is important; on the other hand, nutritional balance must also be ensured.",
            "correct": "一方面",
            "options": ["一方面", "尽量", "适当", "虽然"],
            "option_pinyin": ["yī fāng miàn", "jǐn liàng", "shì dāng", "suī rán"],
            "question_chinese": "___减少热量摄入很重要，另一方面也要保证营养均衡。",
            "question_pinyin": "___减少热量摄入很重要，另一方面也要保证营养均衡。",
            "question_english": "On one hand, reducing caloric intake is important; on the other hand, nutritional balance must also be ensured."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 一方面…另一方面?",
            "correct": "一方面要节制饮食，另一方面也不能完全不吃碳水化合物。",
            "options": [
                "一方面要节制饮食，另一方面也不能完全不吃碳水化合物。",
                "另一方面要节制饮食，一方面也不能完全不吃碳水化合物。",
                "一方面要节制饮食，一方面也不能完全不吃碳水化合物。",
                "要节制饮食一方面，另一方面也不能完全不吃碳水化合物。"
            ],
            "option_pinyin": [
                "yī fāng miàn yào jié zhì yǐn shí lìng yī fāng miàn yě bù néng wán quán bù chī tàn shuǐ huà hé wù",
                "lìng yī fāng miàn yào jié zhì yǐn shí yī fāng miàn yě bù néng wán quán bù chī tàn shuǐ huà hé wù",
                "yī fāng miàn yào jié zhì yǐn shí yī fāng miàn yě bù néng wán quán bù chī tàn shuǐ huà hé wù",
                "yào jié zhì yǐn shí yī fāng miàn lìng yī fāng miàn yě bù néng wán quán bù chī tàn shuǐ huà hé wù"
            ]
        },
    ],

    # ── L12 ───────────────────────────────────────────────────────────────────
    'hsk6_l12_g1': [  # 关键在于 — The key lies in
        {
            "type": "multiple_choice",
            "question": "关键在于 + VP/NP highlights...",
            "correct": "The most important or essential factor — 'the key lies in'; followed by the crucial point or condition for success",
            "options": [
                "The most important or essential factor — 'the key lies in'; followed by the crucial point or condition for success",
                "An additional point that goes beyond what was already stated",
                "A firm preference for one option over another",
                "An outcome that is the opposite of what was expected"
            ],
            "option_pinyin": ["guān jiàn zài yú", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: The key to healthy eating lies in developing long-term regular habits.",
            "correct": "关键在于",
            "options": ["关键在于", "宁可", "不仅如此", "由于"],
            "option_pinyin": ["guān jiàn zài yú", "nìng kě", "bù jǐn rú cǐ", "yóu yú"],
            "question_chinese": "健康饮食的成功，___养成长期规律的生活习惯。",
            "question_pinyin": "健康饮食的成功，___养成长期规律的生活习惯。",
            "question_english": "The key to successful healthy eating lies in developing long-term regular habits."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 关键在于?",
            "correct": "减肥成功的关键在于坚持规律的运动和饮食习惯。",
            "options": [
                "减肥成功的关键在于坚持规律的运动和饮食习惯。",
                "关键在于减肥成功，坚持规律的运动和饮食习惯。",
                "坚持规律的运动和饮食习惯，减肥成功关键在于。",
                "减肥成功，关键在于坚持，规律的运动和饮食习惯。"
            ],
            "option_pinyin": [
                "jiǎn féi chéng gōng de guān jiàn zài yú jiān chí guī lǜ de yùn dòng hé yǐn shí xí guàn",
                "guān jiàn zài yú jiǎn féi chéng gōng jiān chí guī lǜ de yùn dòng hé yǐn shí xí guàn",
                "jiān chí guī lǜ de yùn dòng hé yǐn shí xí guàn jiǎn féi chéng gōng guān jiàn zài yú",
                "jiǎn féi chéng gōng guān jiàn zài yú jiān chí guī lǜ de yùn dòng hé yǐn shí xí guàn"
            ]
        },
    ],

    'hsk6_l12_g2': [  # 不仅如此 — Moreover; not only that
        {
            "type": "multiple_choice",
            "question": "不仅如此 connects...",
            "correct": "A new clause that adds a further point beyond what was just said — 'not only that, moreover'; used to expand on the previous statement",
            "options": [
                "A new clause that adds a further point beyond what was just said — 'not only that, moreover'; used to expand on the previous statement",
                "A result that follows from the preceding cause",
                "A concession: even though A is true, B is still the case",
                "The most important condition for achieving a result"
            ],
            "option_pinyin": ["bù jǐn rú cǐ", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: A sensible diet helps prevent chronic diseases. Moreover, it can also improve skin condition.",
            "correct": "不仅如此",
            "options": ["不仅如此", "关键在于", "宁可", "虽然"],
            "option_pinyin": ["bù jǐn rú cǐ", "guān jiàn zài yú", "nìng kě", "suī rán"],
            "question_chinese": "合理饮食有助于预防慢性病。___，还能改善皮肤状况。",
            "question_pinyin": "合理饮食有助于预防慢性病。___，还能改善皮肤状况。",
            "question_english": "A sensible diet helps prevent chronic diseases. Moreover, it can also improve skin condition."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 不仅如此?",
            "correct": "膳食纤维可以促进消化。不仅如此，它还有助于预防肠癌。",
            "options": [
                "膳食纤维可以促进消化。不仅如此，它还有助于预防肠癌。",
                "膳食纤维不仅如此可以促进消化，它还有助于预防肠癌。",
                "不仅如此膳食纤维可以促进消化，它还有助于预防肠癌。",
                "膳食纤维可以促进消化，它不仅如此还有助于预防肠癌。"
            ],
            "option_pinyin": [
                "shàn shí xiān wéi kě yǐ cù jìn xiāo huà bù jǐn rú cǐ tā hái yǒu zhù yú yù fáng cháng ái",
                "shàn shí xiān wéi bù jǐn rú cǐ kě yǐ cù jìn xiāo huà tā hái yǒu zhù yú yù fáng cháng ái",
                "bù jǐn rú cǐ shàn shí xiān wéi kě yǐ cù jìn xiāo huà tā hái yǒu zhù yú yù fáng cháng ái",
                "shàn shí xiān wéi kě yǐ cù jìn xiāo huà tā bù jǐn rú cǐ hái yǒu zhù yú yù fáng cháng ái"
            ]
        },
    ],

    'hsk6_l12_g3': [  # 宁可…也不… — Would rather…than (different exercises from L3G2)
        {
            "type": "multiple_choice",
            "question": "宁可…也不… expresses...",
            "correct": "A firm preference: 'would rather do A than do B' — even if A involves sacrifice, it is preferred over B",
            "options": [
                "A firm preference: 'would rather do A than do B' — even if A involves sacrifice, it is preferred over B",
                "Not only A, but also B — two positive things happening together",
                "The most important condition that determines the outcome",
                "An additional point that goes beyond what was already stated"
            ],
            "option_pinyin": ["nìng kě...yě bù...", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: For the sake of health, she would rather skip a meal than eat junk food.",
            "correct": "宁可",
            "options": ["宁可", "关键在于", "不仅如此", "虽然"],
            "option_pinyin": ["nìng kě", "guān jiàn zài yú", "bù jǐn rú cǐ", "suī rán"],
            "question_chinese": "为了健康，她___少吃一顿，也不吃垃圾食品。",
            "question_pinyin": "为了健康，她___少吃一顿，也不吃垃圾食品。",
            "question_english": "For the sake of health, she would rather skip a meal than eat junk food."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 宁可…也不?",
            "correct": "他宁可每天多走一段路，也不愿意放弃锻炼的习惯。",
            "options": [
                "他宁可每天多走一段路，也不愿意放弃锻炼的习惯。",
                "也不他宁可每天多走一段路，愿意放弃锻炼的习惯。",
                "他宁可也不每天多走一段路，愿意放弃锻炼的习惯。",
                "他每天多走一段路宁可，也不愿意放弃锻炼的习惯。"
            ],
            "option_pinyin": [
                "tā nìng kě měi tiān duō zǒu yī duàn lù yě bù yuàn yì fàng qì duàn liàn de xí guàn",
                "yě bù tā nìng kě měi tiān duō zǒu yī duàn lù yuàn yì fàng qì duàn liàn de xí guàn",
                "tā nìng kě yě bù měi tiān duō zǒu yī duàn lù yuàn yì fàng qì duàn liàn de xí guàn",
                "tā měi tiān duō zǒu yī duàn lù nìng kě yě bù yuàn yì fàng qì duàn liàn de xí guàn"
            ]
        },
    ],

    # ── L13 ───────────────────────────────────────────────────────────────────
    'hsk6_l13_g1': [  # 在于 — Lies in; depends on
        {
            "type": "multiple_choice",
            "question": "在于 + VP/NP means...",
            "correct": "The essential nature, key, or purpose of something 'lies in' or 'depends on' what follows — it defines where the true importance resides",
            "options": [
                "The essential nature, key, or purpose of something 'lies in' or 'depends on' what follows — it defines where the true importance resides",
                "A result or consequence that follows from the preceding action",
                "A time sequence: once this happens, that will follow",
                "A preference for one option over another"
            ],
            "option_pinyin": ["zài yú", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: The charm of abstract art lies in the fact that each viewer can have a different interpretation.",
            "correct": "在于",
            "options": ["在于", "所谓", "不过", "如何"],
            "option_pinyin": ["zài yú", "suǒ wèi", "bù guò", "rú hé"],
            "question_chinese": "抽象艺术的魅力___每个观者都能有不同的解读。",
            "question_pinyin": "抽象艺术的魅力___每个观者都能有不同的解读。",
            "question_english": "The charm of abstract art lies in the fact that each viewer can have a different interpretation."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 在于?",
            "correct": "艺术创作的核心在于真实表达创作者的内心感受。",
            "options": [
                "艺术创作的核心在于真实表达创作者的内心感受。",
                "在于艺术创作的核心，真实表达创作者的内心感受。",
                "艺术创作的核心真实表达在于创作者的内心感受。",
                "艺术创作在于的核心，真实表达创作者的内心感受。"
            ],
            "option_pinyin": [
                "yì shù chuàng zuò de hé xīn zài yú zhēn shí biǎo dá chuàng zuò zhě de nèi xīn gǎn shòu",
                "zài yú yì shù chuàng zuò de hé xīn zhēn shí biǎo dá chuàng zuò zhě de nèi xīn gǎn shòu",
                "yì shù chuàng zuò de hé xīn zhēn shí biǎo dá zài yú chuàng zuò zhě de nèi xīn gǎn shòu",
                "yì shù chuàng zuò zài yú de hé xīn zhēn shí biǎo dá chuàng zuò zhě de nèi xīn gǎn shòu"
            ]
        },
    ],

    'hsk6_l13_g2': [  # 所谓 — The so-called
        {
            "type": "multiple_choice",
            "question": "所谓 + N is used to...",
            "correct": "Introduce a term or concept that is about to be defined or examined — 'the so-called'; can also express skepticism or a need to question the term",
            "options": [
                "Introduce a term or concept that is about to be defined or examined — 'the so-called'; can also express skepticism or a need to question the term",
                "Express surprise or disbelief about an unexpected event",
                "Indicate that a result follows from a preceding action",
                "Highlight the most important condition for achieving a result"
            ],
            "option_pinyin": ["suǒ wèi", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: The so-called 'aesthetics' actually varies from person to person — there is no absolute standard.",
            "correct": "所谓",
            "options": ["所谓", "在于", "不过", "究竟"],
            "option_pinyin": ["suǒ wèi", "zài yú", "bù guò", "jiū jìng"],
            "question_chinese": '___"审美"，其实因人而异，没有绝对的标准。',
            "question_pinyin": '___"审美"，其实因人而异，没有绝对的标准。',
            "question_english": "The so-called 'aesthetics' actually varies from person to person — there is no absolute standard."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 所谓?",
            "correct": "所谓风格，不过是艺术家内心世界的外在表达。",
            "options": [
                "所谓风格，不过是艺术家内心世界的外在表达。",
                "风格所谓，不过是艺术家内心世界的外在表达。",
                "风格，不过是所谓艺术家内心世界的外在表达。",
                "不过是所谓，风格艺术家内心世界的外在表达。"
            ],
            "option_pinyin": [
                "suǒ wèi fēng gé bù guò shì yì shù jiā nèi xīn shì jiè de wài zài biǎo dá",
                "fēng gé suǒ wèi bù guò shì yì shù jiā nèi xīn shì jiè de wài zài biǎo dá",
                "fēng gé bù guò shì suǒ wèi yì shù jiā nèi xīn shì jiè de wài zài biǎo dá",
                "bù guò shì suǒ wèi fēng gé yì shù jiā nèi xīn shì jiè de wài zài biǎo dá"
            ]
        },
    ],

    'hsk6_l13_g3': [  # 不过 — However; but; only; merely
        {
            "type": "multiple_choice",
            "question": "不过 has two main meanings:",
            "correct": "As a conjunction it means 'however' or 'but' (softening a contrast); combined with 是/而已 it means 'merely' or 'only' (downplaying importance)",
            "options": [
                "As a conjunction it means 'however' or 'but' (softening a contrast); combined with 是/而已 it means 'merely' or 'only' (downplaying importance)",
                "It always introduces an unexpected result that contradicts expectations",
                "It introduces a definition or explanation of a concept",
                "It is used only as a question word meaning 'how exactly'"
            ],
            "option_pinyin": ["bù guò", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: This painting is quite good; however, the colors are a little monotonous.",
            "correct": "不过",
            "options": ["不过", "在于", "所谓", "因此"],
            "option_pinyin": ["bù guò", "zài yú", "suǒ wèi", "yīn cǐ"],
            "question_chinese": "这幅画画得还不错，___颜色有些单调。",
            "question_pinyin": "这幅画画得还不错，___颜色有些单调。",
            "question_english": "This painting is quite good; however, the colors are a little monotonous."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 不过 to mean 'however'?",
            "correct": "他很欣赏这幅画，不过觉得线条有些粗糙。",
            "options": [
                "他很欣赏这幅画，不过觉得线条有些粗糙。",
                "他很欣赏这幅画，他觉得不过有些粗糙线条。",
                "他很欣赏，不过这幅画觉得线条有些粗糙。",
                "他不过欣赏这幅画，很觉得线条有些粗糙。"
            ],
            "option_pinyin": [
                "tā hěn xīn shǎng zhè fú huà bù guò jué de xiàn tiáo yǒu xiē cū cāo",
                "tā hěn xīn shǎng zhè fú huà tā jué de bù guò yǒu xiē cū cāo xiàn tiáo",
                "tā hěn xīn shǎng bù guò zhè fú huà jué de xiàn tiáo yǒu xiē cū cāo",
                "tā bù guò xīn shǎng zhè fú huà hěn jué de xiàn tiáo yǒu xiē cū cāo"
            ]
        },
    ],

    # ── L14 ───────────────────────────────────────────────────────────────────
    'hsk6_l14_g1': [  # 以…为… — To take…as…
        {
            "type": "multiple_choice",
            "question": "以A为B means...",
            "correct": "To take A as B (a standard, goal, or basis) — 'with A as B'; used formally to indicate what something is based on or oriented toward",
            "options": [
                "To take A as B (a standard, goal, or basis) — 'with A as B'; used formally to indicate what something is based on or oriented toward",
                "To emphasize that something is precisely or exactly as described",
                "To analyze something from the angle of a specific perspective",
                "A cause-and-result structure: because of A, the result is B"
            ],
            "option_pinyin": ["yǐ...wéi...", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: Based on her personal experience, she created this moving work.",
            "correct": "以",
            "options": ["以", "正是", "从", "对于"],
            "option_pinyin": ["yǐ", "zhèng shì", "cóng", "duì yú"],
            "question_chinese": "___个人经历为基础，她创作了这部感人的作品。",
            "question_pinyin": "___个人经历为基础，她创作了这部感人的作品。",
            "question_english": "Based on her personal experience, she created this moving work."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 以…为?",
            "correct": "他以色彩为表达手段，创作了一批充满情感的作品。",
            "options": [
                "他以色彩为表达手段，创作了一批充满情感的作品。",
                "他为色彩以表达手段，创作了一批充满情感的作品。",
                "以他色彩为表达手段，创作了一批充满情感的作品。",
                "他色彩以为表达手段，创作了一批充满情感的作品。"
            ],
            "option_pinyin": [
                "tā yǐ sè cǎi wéi biǎo dá shǒu duàn chuàng zuò le yī pī chōng mǎn qíng gǎn de zuò pǐn",
                "tā wéi sè cǎi yǐ biǎo dá shǒu duàn chuàng zuò le yī pī chōng mǎn qíng gǎn de zuò pǐn",
                "yǐ tā sè cǎi wéi biǎo dá shǒu duàn chuàng zuò le yī pī chōng mǎn qíng gǎn de zuò pǐn",
                "tā sè cǎi yǐ wéi biǎo dá shǒu duàn chuàng zuò le yī pī chōng mǎn qíng gǎn de zuò pǐn"
            ]
        },
    ],

    'hsk6_l14_g2': [  # 从…角度（来看/来说） — From the perspective/angle of
        {
            "type": "multiple_choice",
            "question": "从…角度来看/来说 is used to...",
            "correct": "Introduce a specific viewpoint or standpoint from which an analysis is made — 'from the perspective of'; changes the frame of interpretation",
            "options": [
                "Introduce a specific viewpoint or standpoint from which an analysis is made — 'from the perspective of'; changes the frame of interpretation",
                "Emphasize that something is precisely or exactly as described",
                "Indicate that something has no choice but to happen due to circumstances",
                "Take something as a standard or basis for evaluation"
            ],
            "option_pinyin": ["cóng...jiǎo dù lái kàn", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: From a historical perspective, this work has deep cultural significance.",
            "correct": "从",
            "options": ["从", "以", "正是", "对于"],
            "option_pinyin": ["cóng", "yǐ", "zhèng shì", "duì yú"],
            "question_chinese": "___历史的角度来看，这幅作品有重要的文化意义。",
            "question_pinyin": "___历史的角度来看，这幅作品有重要的文化意义。",
            "question_english": "From a historical perspective, this work has deep cultural significance."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 从…角度来看?",
            "correct": "从观众的角度来看，这幅作品传达了强烈的情感。",
            "options": [
                "从观众的角度来看，这幅作品传达了强烈的情感。",
                "观众的角度从来看，这幅作品传达了强烈的情感。",
                "从观众的来看角度，这幅作品传达了强烈的情感。",
                "这幅作品从角度观众来看，传达了强烈的情感。"
            ],
            "option_pinyin": [
                "cóng guān zhòng de jiǎo dù lái kàn zhè fú zuò pǐn chuán dá le qiáng liè de qíng gǎn",
                "guān zhòng de jiǎo dù cóng lái kàn zhè fú zuò pǐn chuán dá le qiáng liè de qíng gǎn",
                "cóng guān zhòng de lái kàn jiǎo dù zhè fú zuò pǐn chuán dá le qiáng liè de qíng gǎn",
                "zhè fú zuò pǐn cóng jiǎo dù guān zhòng lái kàn chuán dá le qiáng liè de qíng gǎn"
            ]
        },
    ],

    'hsk6_l14_g3': [  # 正是 — It is precisely; exactly
        {
            "type": "multiple_choice",
            "question": "正是 is used to...",
            "correct": "Emphasize that something is precisely or exactly as described — 'it is precisely this that…'; highlights the specific element causing or defining a result",
            "options": [
                "Emphasize that something is precisely or exactly as described — 'it is precisely this that…'; highlights the specific element causing or defining a result",
                "Introduce a term or concept that is about to be defined or questioned",
                "Present a key condition that must be met for a result to occur",
                "Introduce a concession: even though A is true, B is still the case"
            ],
            "option_pinyin": ["zhèng shì", "", "", ""]
        },
        {
            "type": "fill_blank",
            "question": "Fill in: It is precisely this unique creative style that made her stand out in the art world.",
            "correct": "正是",
            "options": ["正是", "从", "以", "究竟"],
            "option_pinyin": ["zhèng shì", "cóng", "yǐ", "jiū jìng"],
            "question_chinese": "___这种独特的创作风格，让她在艺术界脱颖而出。",
            "question_pinyin": "___这种独特的创作风格，让她在艺术界脱颖而出。",
            "question_english": "It is precisely this unique creative style that made her stand out in the art world."
        },
        {
            "type": "multiple_choice",
            "question": "Which sentence correctly uses 正是?",
            "correct": "正是这种对色彩的敏感，成就了他作为画家的独特风格。",
            "options": [
                "正是这种对色彩的敏感，成就了他作为画家的独特风格。",
                "这种对色彩的敏感正是，成就了他作为画家的独特风格。",
                "这种对正是色彩的敏感，成就了他作为画家的独特风格。",
                "这种对色彩的敏感，成就正是了他作为画家的独特风格。"
            ],
            "option_pinyin": [
                "zhèng shì zhè zhǒng duì sè cǎi de mǐn gǎn chéng jiù le tā zuò wéi huà jiā de dú tè fēng gé",
                "zhè zhǒng duì sè cǎi de mǐn gǎn zhèng shì chéng jiù le tā zuò wéi huà jiā de dú tè fēng gé",
                "zhè zhǒng duì zhèng shì sè cǎi de mǐn gǎn chéng jiù le tā zuò wéi huà jiā de dú tè fēng gé",
                "zhè zhǒng duì sè cǎi de mǐn gǎn chéng jiù zhèng shì le tā zuò wéi huà jiā de dú tè fēng gé"
            ]
        },
    ],
}

# ── grammar key mapping ────────────────────────────────────────────────────────

GRAMMAR_KEYS = {
    8:  ['hsk6_l8_g1',  'hsk6_l8_g2',  'hsk6_l8_g3'],
    9:  ['hsk6_l9_g1',  'hsk6_l9_g2',  'hsk6_l9_g3'],
    10: ['hsk6_l10_g1', 'hsk6_l10_g2', 'hsk6_l10_g3'],
    11: ['hsk6_l11_g1', 'hsk6_l11_g2', 'hsk6_l11_g3'],
    12: ['hsk6_l12_g1', 'hsk6_l12_g2', 'hsk6_l12_g3'],
    13: ['hsk6_l13_g1', 'hsk6_l13_g2', 'hsk6_l13_g3'],
    14: ['hsk6_l14_g1', 'hsk6_l14_g2', 'hsk6_l14_g3'],
}

# ── main processing ───────────────────────────────────────────────────────────

random.seed(42)
DATA_DIR = os.path.dirname(os.path.abspath(__file__))

for lesson_num in range(8, 15):
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
    for gp, key in zip(gps, keys):
        gp['mini_exercises'] = GRAMMAR_MINI[key]
        gp_count += 1

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f'L{lesson_num}: {vocab_count} vocab words, {gp_count} grammar points — done.')

print('\nAll done!')
