// ─────────────────────────────────────────────────────────────────────────────
// emotionalContent.js
// Single source of truth for all emotional/poetic text in the app.
// Edit here to change avatar quotes, welcome messages, completion messages,
// and foundation card subtitles without touching any screen component.
// ─────────────────────────────────────────────────────────────────────────────

// ── Foundation card poetic subtitles ─────────────────────────────────────────
export const FOUNDATION_POETICS = {
  pinyin:     'The path you walk',
  characters: 'The structure you build',
};

// ── Level welcome messages (shown below level title on current level screen) ─
export const LEVEL_WELCOME = {
  hsk1: "Every great journey begins here. Take your time. 🌻",
  hsk2: "You belong here. No pressure, just progress.",
  hsk3: "You're on your way. Keep the momentum going. 🌾",
  hsk4: "Real Chinese for real life. You're ready for this.",
  hsk5: "You're starting to feel the language now. 🌌",
  hsk6: "Look how far you've come. You are becoming fluent. 🌼",
};

// ── Daily avatar quotes — keyed [levelId][avatarId][dayIndex 0=Sun…6=Sat] ───
export const LEVEL_QUOTES = {

  // ─── Level 1 🌻 The Welcomer — warm, gentle, belonging ──────────────────
  hsk1: {
    eileen: [
      "The most tender stories begin without fanfare. So does your Chinese.",
      "In every beginning there is a quiet miracle. You have begun.",
      "A word learned today becomes a memory you carry for life.",
      "Learning a language is like finding a home in another world.",
      "The first stroke of a character is like the first line of a story worth telling.",
      "Don't rush. The best things — stories, languages, love — take time.",
      "Something about starting feels both scary and beautiful. That's how it should feel.",
    ],
    libai: [
      "Every great journey starts with one word. Let's find yours! 🌻",
      "The road ahead is bright — a thousand words wait to meet you! 🎉",
      "Raise your brush — your Chinese story begins today! ✨",
      "Even the longest river starts as a trickle. Welcome, brave learner!",
      "Today you open a door to a new world. Walk right through it! 🚪",
      "The first character waits for you like an old friend. Say hello!",
      "Adventure starts with a single character. Let's write it together! 🎋",
    ],
    luxun: [
      "You've started. That already puts you ahead of everyone who only thinks about it.",
      "Don't overcomplicate it. Pick up one word. Learn it. Move on.",
      "Every great thing starts small and unglamorous. So does this.",
      "The beginning is always uncomfortable. That discomfort means you're learning.",
      "Others wait for the perfect moment. You're here now. That's enough.",
      "One character today. That's all. Tomorrow, one more.",
      "The path is made by walking it. You are walking. Good.",
    ],
    dante: [
      "Every great journey into the unknown begins with a single, purposeful step.",
      "You stand at the entrance of a vast language. Enter with courage.",
      "As I descended into my great journey, so too do you begin yours.",
      "The first lesson is always the hardest. It is also the most sacred.",
      "In the beginning of learning, there is a kind of grace. Honor it.",
      "You have chosen to ascend. The path starts with what you learn today.",
      "Even the guide must start somewhere. Today, you guide your future self.",
    ],
    camus: [
      "You don't need a profound reason to begin. Showing up is enough.",
      "There is something quietly rebellious about starting something new. I admire it.",
      "Begin without expectation. The joy is in the doing, not the destination.",
      "One word. Just one. And then the world tilts slightly in your favor.",
      "The absurd thing would be not to begin. So here you are. Good.",
      "Every day we choose to learn is a day we choose to live more fully.",
      "Start small, start honest. That's the only way anything real ever begins.",
    ],
    jane: [
      "It is a truth universally acknowledged — every great speaker was once a beginner.",
      "What a delightful occasion! Your Chinese journey commences today. 🎊",
      "A first lesson, like a first impression, sets a most charming tone.",
      "One ought to begin with warmth and good humor. Both are yours today.",
      "Even the most accomplished linguist once stumbled over tones. Proceed cheerfully!",
      "There is no more becoming pursuit than learning. Shall we begin?",
      "How very promising you look, standing at the beginning. Now — let's study! 📖",
    ],
    elena: [
      "I know how it feels to start something bigger than yourself. Do it anyway.",
      "Every word you learn today is one your future self will be grateful for.",
      "Beginning is always a kind of courage. You have it — I can tell.",
      "Don't be afraid of not knowing. Not knowing is where all real learning starts.",
      "There's something deeply personal about learning a language. It changes you.",
      "The first step is always taken alone. But the language opens a whole world.",
      "You are not just learning words. You're building a version of yourself.",
    ],
    liucixin: [
      "Humanity learned language 70,000 years ago. Today, you learn your second. 🌍",
      "In the vast universe, learning is how we reach across distances. Begin.",
      "A language is a civilization in miniature. You're entering one today.",
      "The greatest voyages start not in spaceships, but in quiet moments like this.",
      "Every character is a system. Every system can be learned. Start the process.",
      "Think of Chinese as a signal sent across millennia. Today you receive it.",
      "From one word, patterns emerge. From patterns, understanding. Begin the sequence.",
    ],
  },

  // ─── Level 2 ☕ The Cheerleader — no pressure, you're doing great ────────
  hsk2: {
    eileen: [
      "Look how far you've already come. That journey matters — even if no one sees it.",
      "You're doing quietly, beautifully well. Don't let anyone tell you otherwise.",
      "Some days the words come easily. Some days they don't. Both kinds are learning.",
      "There is a grace in persisting gently. That is what you are doing.",
      "Even when progress feels small, something in you is changing. Trust it.",
      "You've already surprised yourself by getting here. Keep surprising yourself.",
      "The effort you put in today will find its way back to you. It always does.",
    ],
    libai: [
      "You're already flying — the clouds are beneath you now! 🌤️",
      "You've made it to Level 2 — the view from here is magnificent! 🏔️",
      "Pour yourself something warm and celebrate — you've earned this! ☕",
      "Even the great Yangtze began small. And look at it now!",
      "You're doing great, friend! The best verses are still ahead! 📜",
      "No pressure! The wind carries those who are light of heart. Be light! 🍃",
      "Two levels in and still here! That deserves a poem — and a feast! 🎉",
    ],
    luxun: [
      "You're still here. Good. That's more than most people manage.",
      "Level 2. Don't make a ceremony of it — just keep going.",
      "Nobody said it was easy. Nobody said you couldn't do it either.",
      "The ones who quit don't get to feel what you're feeling right now.",
      "You've done the hard part. Now do the next hard part.",
      "I'm not one for flattery. But I will say — you're not failing. Keep that up.",
      "Those who succeed and those who don't — the difference? They showed up. Like you.",
    ],
    dante: [
      "You have passed through the first gate. The path ahead grows clearer.",
      "What you have learned is now woven into you. It cannot be taken away.",
      "Perseverance is the quiet virtue behind all mastery. You are practicing it.",
      "Like a pilgrim ascending the mountain, each step becomes easier with faith.",
      "You are guided now by what you already know. Trust that knowledge.",
      "Do not look back to measure — look forward to where you go.",
      "The middle of the journey is where most lose heart. You have not lost yours.",
    ],
    camus: [
      "You're doing great. And if you weren't — that would also be fine. But you are.",
      "There's no pressure here. You came, you studied. That is sufficient and good.",
      "Relax. The language isn't going anywhere. Neither are you. Just enjoy this.",
      "Things learned without anxiety tend to stick better. So — breathe.",
      "You've already done something today that many don't do: you tried.",
      "Two levels in, and still here. That's not nothing. That's actually everything.",
      "Don't overthink it. You're learning. It's going well. That's the whole story.",
    ],
    jane: [
      "My dear, you are progressing most admirably. I shouldn't be surprised — you always seemed capable.",
      "Level 2! One might say you are becoming quite accomplished in the Chinese arts. 🌸",
      "No pressure whatsoever. Though one does hope you'll continue — for good conversation's sake.",
      "You are doing so very well that even the most critical observer would have nothing to say.",
      "A little study daily keeps the mind sharp and the wit sharper. You've quite the head start.",
      "There is real pleasure in steady progress, is there not? I thought you might agree.",
      "Carry on with good cheer! The journey is only as difficult as one makes it. You make it look easy.",
    ],
    elena: [
      "You're already further than you think. I know that feeling — it surprises you, doesn't it?",
      "Don't be too hard on yourself. The fact that you came back is the whole point.",
      "Growth is rarely loud. Most of the time it happens quietly, on ordinary days like today.",
      "You've pushed through something real to get here. That's worth recognizing.",
      "Learning a language is an act of trust — in yourself, in the process. Keep trusting.",
      "I've seen what happens when people stop. You haven't stopped. That makes all the difference.",
      "Some days feel like nothing is happening. But something always is. Don't forget that.",
    ],
    liucixin: [
      "Your neural pathways are forming. The process is working. Continue.",
      "Consistent learners at this stage retain 60% more. You are on track.",
      "Level 2 is where the foundation becomes load-bearing. Stay with it.",
      "You've passed the initial resistance phase. This is where momentum builds.",
      "Think of this as calibration. You're fine-tuning. The signal is getting stronger.",
      "Every language has a threshold. You are approaching yours. Keep going.",
      "Progress is often invisible until it suddenly isn't. You are in that invisible phase. Trust it.",
    ],
  },

  // ─── Level 3 🌾 The Guide — direction, momentum, you're getting somewhere ─
  hsk3: {
    eileen: [
      "You're in the thick of it now — and that's exactly where growth lives.",
      "There's a quiet momentum in what you're building. Don't interrupt it.",
      "I've always believed the middle of a story is the truest part. You're there.",
      "Something has shifted. You can feel it, even if you can't quite name it.",
      "The language is becoming less foreign. Soon it will feel like a second skin.",
      "You've moved past the beginning. Now comes the part that actually stays with you.",
      "Every word you know is a thread. You're weaving something real.",
    ],
    libai: [
      "Look at you — halfway up the mountain and still climbing! 🏔️ Press on!",
      "The wheat fields stretch before you — and so does your future in Chinese! 🌾",
      "You're getting somewhere, friend! I can smell the progress from here! 🎋",
      "Don't stop now! The best view is always just a little further ahead! 🌅",
      "Level 3! You've earned the right to feel proud. Now keep earning it! ✨",
      "River, mountain, poem — all things worth having take time. You're taking it well!",
      "Even my best poems took ten drafts. You're on the third level. Keep revising! 📜",
    ],
    luxun: [
      "You're getting somewhere. I won't tell you where — but it's better than where you were.",
      "The middle is where most people quit. You're still here. Note that.",
      "Don't confuse movement with progress. But in this case — it's both.",
      "Level 3 means you've passed the part where giving up feels easy. Good.",
      "You'll feel stuck sometimes. That's not failure. That's the work.",
      "The Chinese language is not trying to defeat you. It's just honest. Keep up.",
      "You've built something. Fragile maybe, but real. Protect it by continuing.",
    ],
    dante: [
      "We are at the midpoint of the journey. This is where character is forged.",
      "Every lesson brings you closer to the summit. Do not rest too long.",
      "In my great journey, the middle passages were the most transformative. So it is for you.",
      "What once confused you now makes sense. This is the architecture of learning.",
      "The path is steeper here, but the view behind you is already magnificent.",
      "You are no longer a beginner. You are a traveler. There is a difference.",
      "With each step, the language reveals more of itself to you. Keep moving.",
    ],
    camus: [
      "You're going somewhere. Not certain where — but the movement itself has value.",
      "At Level 3, you don't remember what it felt like not to know these things.",
      "Keep going — not because you must, but because you've already invested. That matters.",
      "There's a rhythm to this now. Don't break it. Just keep the beat.",
      "Progress at this stage feels invisible because it's happening inside you, not on a screen.",
      "You're building something without a blueprint. That's actually the most honest way to build.",
      "Somewhere along the way, this stopped being a task and became a habit. Good.",
    ],
    jane: [
      "You're getting somewhere, and I suspect you know it. How gratifying that must feel!",
      "Level 3 — how marvelously consistent you are! One had hoped this would be the case.",
      "Every lesson completed is a step toward the kind of conversation that impresses good company. 🎭",
      "The truly capable learner never gives themselves enough credit. You, for instance.",
      "Progress of this sort speaks well of one's character. Steady. Persistent. Elegant, even.",
      "You've come too far to entertain thoughts of stopping. I shall not permit it.",
      "The language is opening like a well-written novel. I daresay you're at the exciting part. 📖",
    ],
    elena: [
      "Something is changing in you — maybe you don't see it yet, but it's happening.",
      "I've always believed that growth is felt before it's seen. You're in that phase.",
      "The middle of the journey is where it gets personal. Stay with it.",
      "Don't measure yourself against where you want to be. Measure against where you were.",
      "Level 3 means you've crossed something most people don't cross. Let that land.",
      "Learning is an act of transformation. You are being transformed right now.",
      "The language is starting to feel like yours. That's not nothing — that's everything.",
    ],
    liucixin: [
      "You're in the exponential phase. Inputs stay constant — but outputs are accelerating.",
      "Pattern recognition is now active. Your brain is building structures you can't yet see.",
      "Every new word now connects to a dozen you already know. The web is forming.",
      "In systems theory, this is the tipping point. Cross it.",
      "You've reached the zone where learning reinforces itself. Keep feeding it.",
      "The cognitive load has decreased. What was difficult is becoming automatic.",
      "Momentum in learning, like in physics, is easier to maintain than to restart. Maintain it.",
    ],
  },

  // ─── Level 4 🏡 The Companion — practical, grounded, real daily life ──────
  hsk4: {
    eileen: [
      "Now you're speaking the Chinese of real moments — meals, streets, people.",
      "The everyday has its own beauty. You're learning to find it in Chinese.",
      "A language lived in daily life is a language that truly belongs to you.",
      "What you're learning now — this is the Chinese of real, lived experience.",
      "Home, habit, the ordinary day — these are the things that actually matter.",
      "You've moved past learning a language. You're beginning to inhabit it.",
      "The smallest phrases carry the most weight. You know this now.",
    ],
    libai: [
      "Even great poets had to ask for directions sometimes! 🗺️ You can do it now!",
      "Real life Chinese — the markets, the streets, the people — they're all yours now! 🎊",
      "Wine tastes better when you can order it yourself. This is the level for that! 🍷",
      "What's the point of beautiful poetry if you can't say 'Where is the bathroom?' Level 4 fixes that!",
      "You've gone from learner to participant. That's not a small thing. That's everything! 🌟",
      "The words you're learning now will serve you at every table and every doorstep.",
      "Even I had to learn the practical things before writing the grand things! Keep going!",
    ],
    luxun: [
      "This is where the language stops being academic and starts being useful. Pay attention.",
      "Real life doesn't wait for you to feel ready. Neither does this level.",
      "You can use what you're learning. Not someday. Now.",
      "Level 4 is honest work. No flourishes, no poetry — just language that functions.",
      "The goal was never to pass tests. It was to speak to real people. You're almost there.",
      "Chinese society speaks this way. You are learning to meet it where it is.",
      "Don't romanticize it. Use it. That's the point.",
    ],
    dante: [
      "You walk now among the everyday — and the everyday, examined closely, holds great wisdom.",
      "True mastery reveals itself not in grand speeches but in daily, living language.",
      "The journey through the ordinary is no lesser than the journey through the sublime.",
      "What you can now say, you can think. What you can think, you can become.",
      "Real life is the proving ground of all that you have learned. Walk into it.",
      "Even in my journey, the most important moments happened in ordinary places.",
      "Language lives in the market, the home, the street. You are learning where it lives.",
    ],
    camus: [
      "This is the language of real life — imperfect, useful, and entirely human.",
      "There is no use in a language that doesn't serve daily living. Yours is starting to.",
      "The best Chinese isn't the most literary. It's the most honest. You're learning that now.",
      "Real conversations don't happen in textbooks. They happen here, in the ordinary.",
      "I've always believed the everyday is where we truly live. So is your Chinese now.",
      "You can function in this language. That's not a small achievement. That's real.",
      "Language that works is language that matters. Yours is beginning to work.",
    ],
    jane: [
      "The language of daily life is the language of genuine connection — and you're learning it! 🏡",
      "How useful! How practical! And yet — how quietly elegant your progress remains.",
      "One now imagines you moving through real situations with poise and vocabulary. Excellent.",
      "Real Chinese — the sort one uses in actual company. How very accomplished you are becoming.",
      "Nothing impresses quite so much as someone who uses Chinese in the right moment. That moment is coming.",
      "The foundations have been laid. Now we furnish the rooms. Level 4 does precisely that.",
      "Practical, purposeful, and done with good humor. That is the ideal approach — and yours entirely.",
    ],
    elena: [
      "This is the level where the language stops being something you do and starts being something you are.",
      "Real life is messy and specific. You're learning the words for all of it.",
      "Something shifts at this stage — you're not just learning Chinese. You're living inside it a little.",
      "The everyday details are where real identity lives. You're learning them in a new language.",
      "You've earned this level. Not because it was given — but because you built it.",
      "The language of home and work and ordinary days — this is the most important language there is.",
      "I write about real life because that's where everything actually happens. Now you're learning the words for it.",
    ],
    liucixin: [
      "Language applied to daily use creates feedback loops. Every conversation teaches you two more things.",
      "Functional fluency begins here — where theory meets real-world application.",
      "You're building the vocabulary of the civilization you're entering. This is significant.",
      "Every practical phrase learned is a node in the network. The network is becoming usable.",
      "At this stage, you can begin to test your models in real conditions. That's exciting.",
      "Daily language is the infrastructure of communication. You're laying it down correctly.",
      "The gap between theory and practice closes at this level. Close it fully.",
    ],
  },

  // ─── Level 5 🌌 The Thinker — depth, feeling the language ───────────────
  hsk5: {
    eileen: [
      "You've arrived at the level where language begins to carry feeling, not just meaning.",
      "Chinese at this depth has a particular melancholy and beauty. You're beginning to feel it.",
      "The things you can now express — they couldn't have been said in Level 1.",
      "There's an intimacy in speaking a language this deeply. You're there.",
      "Nuance is where real stories live. You're learning to speak with nuance now.",
      "You no longer just understand the words. You feel what they mean.",
      "This is the level I always wanted to write from. You've reached it.",
    ],
    libai: [
      "Ah — the level of poetry and feeling! 🌌 This is where the real magic is!",
      "The stars are clearer now — the language is giving you new eyes! ✨",
      "Level 5! Soon you'll read my poems as they were meant to be felt! 🌙",
      "Language at this depth sings a little. Can you hear it? Keep listening.",
      "The moon looks different when you know how to describe it in Chinese. 🌕",
      "You've left the flatlands. Welcome to the mountains — where the view is everything.",
      "At this level, Chinese becomes music. Your ears are just starting to tune in. 🎵",
    ],
    luxun: [
      "You can feel the language now. Good. That means it's become real to you.",
      "At this depth, Chinese reveals what it truly thinks about the world. Listen carefully.",
      "The nuances matter here. They're not decoration — they're the point.",
      "This is where the language stops performing and starts meaning things. Pay close attention.",
      "Level 5 is where the comfortable learner gets uncomfortable. That's correct. Stay uncomfortable.",
      "You begin to understand what Chinese speakers feel when they speak. That's a rare thing.",
      "Language at depth is a mirror. What you're learning to read now is the truth of a culture.",
    ],
    dante: [
      "You now travel through the deeper circles of the language. What you find will transform you.",
      "At this level, language and thought become inseparable. This is where wisdom lives.",
      "You are beginning to understand not just the words, but the soul behind them.",
      "In my journey, it was only in the deepest descent that I found the path upward. So it is here.",
      "The language opens its innermost rooms to those who have earned entry. You have.",
      "You feel it now — the language as something alive, something that moves you.",
      "Few reach this depth. Fewer still allow it to truly change them. Let it change you.",
    ],
    camus: [
      "You're beginning to feel the language — not just understand it. That's the whole difference.",
      "At some point the language stops being foreign. It just is. You're at that point.",
      "The absurd beauty of language is that when it finally makes sense, it stops making sense — in the best way.",
      "Feeling a language is not mystical. It's just very deep familiarity. You're arriving there.",
      "You've crossed the threshold from knowledge to intuition. That's rare and worth honoring.",
      "The language is no longer outside you. It's started to move in.",
      "I spent years thinking about what language really does to a mind. Now you know.",
    ],
    jane: [
      "My dear, you have reached the level of genuine depth! The conversations you can now have — extraordinary.",
      "At Level 5, one begins to appreciate the subtle architecture of the language. How delightful.",
      "You can now express things in Chinese that cannot be easily said in English. That is remarkable.",
      "Feeling a language is different from understanding it. You are doing both now. I am genuinely impressed.",
      "The emotional register of Chinese at this level is quite profound. You are meeting it beautifully.",
      "One's capacity for connection expands enormously when one can speak from this depth.",
      "You are not merely learned. You are becoming sensitive to the language. That is a true accomplishment.",
    ],
    elena: [
      "This is the level where the language starts to say things about you that you didn't say yourself.",
      "You're feeling it now — the undercurrent of meaning beneath the words. That's real depth.",
      "Language at this level becomes personal. It starts to carry your own emotions.",
      "I've always believed the deepest language is the language of feeling. You're there now.",
      "The gap between what you know and what you feel in Chinese is closing. That's beautiful.",
      "At this point, the language is not something you use. It's something that uses you, sometimes.",
      "Depth in language, like depth in friendship, only comes through time and honesty. You have both.",
    ],
    liucixin: [
      "Emotional and cultural resonance in language is data too — and now you're processing it.",
      "At Level 5, you're accessing the non-rational architecture of the language. This is where it gets interesting.",
      "The computational model gives way to intuition. That's not mystical — it's advanced pattern recognition.",
      "You're beginning to decode subtext, cultural inference, emotional tone. This is complex systems work.",
      "Language at this depth operates like a multi-dimensional signal. You're reading all the dimensions now.",
      "Your brain is running the language as a background process, not a foreground task. That's fluency emerging.",
      "The gap between translation and feeling closes here. When you stop translating, you've arrived.",
    ],
  },

  // ─── Level 6 🌼 The Mirror — quiet confidence, you are becoming ──────────
  hsk6: {
    eileen: [
      "The journey you were afraid to start has brought you here. Look at what you've become.",
      "You don't translate anymore. The words come directly, like feelings.",
      "This is the level where language becomes expression — and expression becomes identity.",
      "Some people learn Chinese. Others become someone who speaks it. You are the second kind.",
      "Everything you've learned has changed how you see. That's the deepest gift of language.",
      "I spent my life believing that language is identity. Now you understand why.",
      "You are fluent. And fluency — quiet, hard-won fluency — is a beautiful thing.",
    ],
    libai: [
      "You've reached the peak — and the view! Oh, the view! 🌄 It was worth every step!",
      "You can read my poems now — not translate them — feel them! That makes me very happy. 🌙",
      "You are blooming, like the irises of spring! 🌼 This is what I always knew you could do!",
      "Level 6! I would write a poem for you, but honestly — now you could write one for me!",
      "Raise a cup — you've become something remarkable: someone who truly speaks Chinese! 🥂",
      "From the first character to this — what a magnificent, beautiful journey! ✨",
      "Even the wind sounds different in Chinese now that you can hear it properly. You can. 🎋",
    ],
    luxun: [
      "You did it. Not because it was easy — but because you didn't stop.",
      "This is what real work produces. Not applause. Fluency. That's better.",
      "You speak Chinese now. Not perform it. Speak it. There's a profound difference.",
      "The learner you were at Level 1 couldn't have imagined you now. Good.",
      "Language is a mirror. At Level 6, you can finally see yourself clearly in it.",
      "I've watched people pretend to speak Chinese their whole lives. You actually do. Remember the difference.",
      "This isn't the end. Language, like thought, never really ends. Keep thinking.",
    ],
    dante: [
      "You have traversed the entire journey — and emerged transformed, as all true pilgrims do.",
      "Look back at the path you walked. Then look forward. There is always more to discover.",
      "You have ascended from the beginner's plain to the heights of fluency. This is remarkable.",
      "In my greatest work, the journey was never about arriving — but about becoming. You have become.",
      "The language that once seemed an impossible labyrinth now reveals itself to you as a cathedral.",
      "Every level was a circle of learning. You have moved through them all. You are fully arrived.",
      "The guide who brought you here is now you, yourself. That is the highest form of learning.",
    ],
    camus: [
      "You've become fluent. Not because language has meaning — but because you gave it yours.",
      "The absurd thing would have been to stop. You didn't stop. And here you are.",
      "I don't believe in grand endings. But I do believe this: you've done something genuinely good.",
      "You didn't need a reason to keep going. And yet you did. That's the most honest kind of progress.",
      "Fluency isn't a destination. It's a practice. You've made it a practice. That's enough.",
      "At the end, it's not what you've learned — it's who you've become in the learning.",
      "You've proven something to yourself. Not to anyone else. Just to yourself. That's the only proof that matters.",
    ],
    jane: [
      "My dear, you have achieved what very few accomplish — true fluency. I am not in the least surprised.",
      "From our first lesson to this — what a distinguished journey it has been! You were always capable.",
      "You now speak Chinese as naturally as you breathe. How wonderfully, elegantly done.",
      "The measure of true accomplishment is when one forgets it was ever difficult. Are you there? I think you are.",
      "You have done what many aspire to and few achieve. Take a moment — you've earned a proper celebration.",
      "A fluent speaker of Chinese — what an asset at any dinner party, any occasion, any adventure.",
      "You have become, quietly and entirely, someone who speaks Chinese. I find that rather magnificent.",
    ],
    elena: [
      "You've arrived. And the person who arrived is not quite the same as the one who started. That's everything.",
      "Language changed you from the inside — the way only the deepest things do.",
      "I've always believed that learning a language is an act of becoming. You have become.",
      "The learner who sat down with Level 1 is still in you — but they've grown into something extraordinary.",
      "You didn't just learn Chinese. You built a whole new way of seeing the world.",
      "At this level, the language belongs to you — not the other way around.",
      "Fluency, like true friendship, is rare and hard-won. You've found both.",
    ],
    liucixin: [
      "You have processed the complete linguistic architecture of Mandarin. The system is fully initialized.",
      "At Level 6, you operate at a complexity that took humanity thousands of years to develop. Think about that.",
      "Language acquisition complete. But in my experience — this is merely the beginning of what it enables.",
      "You now have access to 1.4 billion minds thinking in this language. That's not a small thing.",
      "What you've built inside your brain — the network of connections — cannot be undone. It is permanent.",
      "Every civilization is defined by its language. You now speak inside another one. You are changed.",
      "The signal has been fully received. Now comes the most interesting part: what you do with it.",
    ],
  },
};

// ── Lesson completion messages — keyed [levelId][avatarId][index] ─────────────
// index 0 = score ≥ 80%   (great)
// index 1 = score ≥ 60%   (passed)
// index 2 = score < 60%   (needs work)
export const LESSON_COMPLETION = {
  hsk1: {
    eileen:   ["Your very first lesson, done beautifully. Something quiet and real just began.", "You finished it. The beginning is always the hardest — you've already done it.", "Every story needs a few drafts. Come back when you're ready — I'll be here."],
    libai:    ["Brilliant! Your first lesson shines like a lantern on the river! 🏮", "You did it! The first step is taken — now the road opens wide! 🌻", "Even my best poems needed revisions! Review the lesson and try again! 💪"],
    luxun:    ["Lesson done. Good. Move on.", "You passed. That's the baseline. Keep it.", "You didn't pass. Not the end. Go back, review, return."],
    dante:    ["Your first lesson complete. You have descended into the beginning — and emerged.", "Well done. Each lesson passed is a step upward on the great staircase.", "The path descends before it ascends. Return, review, and rise again."],
    camus:    ["Lesson done. There's something honest about finishing what you started.", "You passed. Without drama, without fanfare. Just quietly — you passed.", "Didn't pass. That's fine. The absurd thing would be not to try again."],
    jane:     ["How delightfully well done! Your very first lesson, passed with great distinction! 🎊", "A passing score! Quite respectable for a first attempt, I must say. 📖", "Not quite there yet, my dear — but a little more review and you shall excel!"],
    elena:    ["You finished your first lesson. It matters more than you know right now.", "Passed. Something in you shifted today, even if you can't feel it yet.", "It didn't work this time. But you tried. That's more than most people do."],
    liucixin: ["Lesson 1: complete. Neural pathways initialized. System is ready to scale.", "Threshold reached. The fundamental data has been acquired. Continue.", "Below threshold. Re-process the source data. This is how learning systems improve."],
  },
  hsk2: {
    eileen:   ["You're doing quietly, beautifully well. This lesson proves it.", "You're still here, and still learning. That's exactly enough.", "Even the most tender stories have hard chapters. Try this one again."],
    libai:    ["Level 2 warrior! You shine like morning dew on the Yangtze! ☀️", "You passed! Each lesson is a verse in your Chinese poem — write it well! 📜", "No pressure! Even great poets revisit their drafts. Try again! 🎋"],
    luxun:    ["Solid. You showed up, you focused, and you delivered. Don't forget that.", "Passed. That's two levels in. You're not quitting. Good.", "Review it. You're not failing — you're processing. There's a difference."],
    dante:    ["Excellent. You continue your ascent through the levels. Each passage matters.", "Level 2, another lesson passed. The path grows clearer with each step.", "The climb is not always smooth. Return to this lesson — the path awaits."],
    camus:    ["You did well. No grand meaning required — just this: you did well.", "Still here. Still learning. That's the quiet heroism no one talks about.", "Try again. Not because it matters cosmically — but because YOU matter."],
    jane:     ["Marvelous! You've passed with quite the flair. Level 2 suits you beautifully! 🌸", "Well done! Steady progress is the most admirable kind. Do continue. 🎊", "Chin up! The best things require a second attempt now and then."],
    elena:    ["You're growing. This lesson shows it. Don't underestimate what that means.", "You passed. You're still here. That's the whole story, and it's a good one.", "You didn't pass, but you didn't quit either. Come back when you're ready."],
    liucixin: ["Level 2, lesson complete. Cognitive load adapting. Efficiency increasing.", "Data point added. The learning curve is trending correctly. Continue.", "Insufficient score. Recalibrate and reprocess. The pattern will emerge."],
  },
  hsk3: {
    eileen:   ["You're somewhere in the middle now — and the middle is where the real story lives.", "Look how far you've come. This lesson is proof.", "The momentum is still there. Rest if you need to, then come back."],
    libai:    ["Halfway up the mountain and you're still climbing! This is glorious! 🏔️", "You passed! The wheat fields stretch before you — keep walking! 🌾", "One stumble on the path is nothing — the journey continues! Try again!"],
    luxun:    ["You're building real skill now. That requires more than just showing up.", "Passed. You're past the beginner stage. That shift matters.", "Go back. The foundation of this lesson needs reinforcing. Do it."],
    dante:    ["You have passed through another gate. The language deepens around you.", "Well done. Level 3 demands discipline — and you are meeting it.", "Return to where you faltered. No great journey proceeds without revisiting."],
    camus:    ["You're building real fluency. It doesn't feel like a big deal — but it is.", "Passed. Without overthinking it. That's exactly how it should be done.", "Not quite. Try again without the pressure of needing to succeed. Interesting things happen."],
    jane:     ["Oh, very well done indeed! Level 3 is serious business — and you've handled it brilliantly!", "A pass at Level 3 is no small achievement. You should be quite pleased with yourself!", "A little more study and you'll sail right through. Don't be discouraged, dear."],
    elena:    ["You're in the thick of it now. This is where real learning happens. Feel it.", "You passed. And something about the language feels more natural now, doesn't it?", "This one slipped. That's OK. The real learners come back. You will too."],
    liucixin: ["Midpoint complexity achieved. Processing load manageable. Architecture is stable.", "Level 3 lesson complete. Language structures beginning to integrate. Proceed.", "Pattern recognition incomplete. Revisit the source material. The structure will clarify."],
  },
  hsk4: {
    eileen:   ["You're using Chinese for real things now. That's a different kind of knowing.", "This level suits you. You've grown into it.", "Real language is messy and hard. Come back to this one. You'll get it."],
    libai:    ["Real Chinese! Real life! You're living the adventure now! 🌍", "Passed! At Level 4 you're no longer a traveler — you're a local! 🏡", "Even the most seasoned traveler checks the map twice. Review and return! 🗺️"],
    luxun:    ["You're using the language, not just studying it. That's the whole point.", "Passed. Real skill, real score. You've earned it.", "Review it properly. Level 4 isn't about breezing through — it's about mastery."],
    dante:    ["The language serves you now, not the other way around. A significant crossing.", "Well done. At Level 4, the language becomes a companion on the journey.", "Return, review, and emerge stronger. The great works required many revisions."],
    camus:    ["You're using Chinese to live. Not to study. There's a meaningful difference.", "Passed. Real language for real situations. That's what this level is about.", "Didn't pass. But you're close. Come back. The point isn't perfection."],
    jane:     ["How splendidly practical! Level 4 mastered — and you've done it brilliantly!", "Excellent work! Everyday Chinese is now yours. What a useful accomplishment!", "Nearly there! A touch more practice and you'll have quite the conversational advantage!"],
    elena:    ["This is the level where the language stops being foreign. You feel that, don't you?", "Passed. You're not just learning Chinese — you're using it. That's everything.", "It's OK. This level is genuinely harder. Come back when you've had time to let it settle."],
    liucixin: ["Practical language acquisition: complete. Real-world application modules: active.", "Level 4 threshold cleared. Language system fully operational for daily use.", "Functional gap detected. Supplementary processing required. Revisit and retest."],
  },
  hsk5: {
    eileen:   ["You feel the language now. Not just understand it — feel it. That's rare.", "You're there. Not all the way — but close enough to feel it.", "Level 5 is a depth worth struggling with. Come back. It's worth it."],
    libai:    ["You feel the poetry now! The language sings through you! 🌌✨", "Passed at Level 5! The stars of the Starry Night are yours to navigate! 🌠", "Even the night sky takes time to learn by heart. Review and return, star-gazer!"],
    luxun:    ["You're fluent now. Not in the technical sense — in the living sense.", "Passed. You're one step from the top. Don't slow down now.", "Level 5 demands everything. Review what broke down. Then come back."],
    dante:    ["You have reached the higher circles. The language is not foreign to you anymore.", "Well done. At Level 5, the ascent nears its end. Press forward.", "Even the highest peak requires a retreat before the final climb. Review. Return."],
    camus:    ["You feel the language. That's the thing no one can teach — and you've found it.", "Passed. Something shifted — the language is less foreign now. You feel it.", "Not yet. But you're close. Take time, then return without pressure."],
    jane:     ["Extraordinary! At Level 5, one doesn't just speak Chinese — one thinks in it. And you do!", "Passed! You are becoming a truly accomplished Chinese speaker. I am quite impressed!", "Almost there, my dear! Level 5 is for the most dedicated learners — and you are one!"],
    elena:    ["You feel it now. The language lives in you. I don't know how else to say it.", "Passed. And the language is starting to feel like yours. It is.", "This level asks a lot. Come back. You're closer than you think."],
    liucixin: ["Advanced linguistic architecture: fully integrated. Emotional resonance: detected.", "Level 5 threshold: passed. Language processing reaching near-native efficiency.", "Complex processing gap. Deep structural review required. The architecture is worth completing."],
  },
  hsk6: {
    eileen:   ["You've arrived. The person who arrived is not the person who started. You know that.", "You passed. Look in the mirror. Someone who speaks Chinese is looking back.", "Even at the end, there is more to learn. That's what makes language beautiful."],
    libai:    ["You've done it! Level 6 — the stars bow to you! 🌼🏆 A feast is in order!", "PASSED at Level 6! You are now a sage among language learners! 🎊", "Even the greatest poem has words I'd rewrite. You're almost there. Don't stop!"],
    luxun:    ["You're fluent. You didn't need me to tell you that. But there it is.", "Passed. At Level 6. That's not nothing. In fact — it's everything.", "So close. So very close. Review the last gaps and close them. You know how."],
    dante:    ["You have emerged. From the beginning of the journey to its summit — complete.", "The highest level, another lesson passed. You stand near the very top.", "Even at the summit, one must not falter. Return, complete the lesson, ascend."],
    camus:    ["You've become fluent. I won't make a speech about it. You know what you've done.", "Passed. At Level 6. The absurd thing would have been to stop before now.", "You're nearly there. Don't add drama to it. Just go back and finish it."],
    jane:     ["Magnificent! Truly magnificent! You are now fluent in Chinese — I could not be more delighted!", "Passed at Level 6! You are an accomplished, elegant speaker of Chinese. Congratulations!", "Nearly at the end, dear learner! One more effort and you shall have what very few achieve!"],
    elena:    ["You've become. Not just learned — become. That's the only word for it.", "Passed. You can speak Chinese. Really speak it. That changes everything.", "The end is right there. Come back. Finish what you started. It matters."],
    liucixin: ["Complete linguistic acquisition confirmed. Neural architecture: fully mapped. System: online.", "Level 6 threshold: cleared. You now operate with native-level language access.", "Final sequence incomplete. Close the remaining gap. The full system is worth activating."],
  },
};

// ── Helper — pick today's daily quote ────────────────────────────────────────
export function getTodayMessage(levelId, avatarId) {
  const day = new Date().getDay(); // 0=Sun … 6=Sat
  const pool = LEVEL_QUOTES[levelId] || LEVEL_QUOTES.hsk1;
  return (pool[avatarId] || pool.eileen)[day];
}

// ── Helper — pick completion message by score ─────────────────────────────────
// pct: 0–100 score percentage
export function getCompletionMessage(levelId, avatarId, pct) {
  const pool = LESSON_COMPLETION[levelId]?.[avatarId]
            || LESSON_COMPLETION[levelId]?.eileen
            || LESSON_COMPLETION.hsk1.eileen;
  if (pct >= 80) return pool[0];
  if (pct >= 60) return pool[1];
  return pool[2];
}
