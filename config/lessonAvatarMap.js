// Explicit avatar-per-lesson map, keyed by levelId → lessonNumber.
// Each avatar is chosen to match the lesson topic against the avatar's personality.
// getAvatarForLesson() tries this map first, then falls back to keyword rules
// so future lessons without an entry still get a reasonable match.
//
// Level IDs: hsk1 · hsk2 · hsk3 · hsk4 (level 4) · hsk5 (level 5) · hsk6

const LESSON_AVATAR_MAP = {
  hsk1: {
    1:  'jane',      // Greetings & Basic Introductions — social grace
    2:  'liucixin',  // Numbers and Age — logical, analytical
    3:  'liucixin',  // Time and Date — analytical, time concepts
    4:  'elena',     // Family Members — family, emotional depth
    5:  'libai',     // Food and Drinks — famous for wine & food culture
    6:  'jane',      // Shopping and Money — commerce, social interaction
    7:  'libai',     // Locations and Directions — travel, adventure
    8:  'eileen',    // Daily Activities — urban routine, observation
    9:  'jane',      // Making Friends — social connections, wit
    10: 'libai',     // Weather — nature poetry, seasons
    11: 'liucixin',  // What Time Is It? — time, precision
    12: 'libai',     // Ability & Animals — nature, animals in poetry
    13: 'eileen',    // Home & Things — domesticity, aesthetics
    14: 'luxun',     // Completed Actions — deliberate, grammatical precision
    15: 'libai',     // Getting Around — travel, movement
  },
  hsk2: {
    1:  'libai',     // Travel & Activities 1 — travel, adventure
    2:  'eileen',    // Daily Routines — urban life, routine
    3:  'libai',     // Directions — navigation, travel
    4:  'luxun',     // Work — diligence, society
    5:  'jane',      // Shopping & Activities 2 — social activities, commerce
    6:  'libai',     // Food & Health — food culture
    7:  'liucixin',  // Commuting & Transportation — technology, modern life
    8:  'jane',      // Social Life 1 — social interactions
    9:  'libai',     // Hobby & Free Time — leisure, poetry
    10: 'elena',     // Family Time — family relationships
    11: 'eileen',    // Leisure Time 1 — urban leisure, aesthetics
    12: 'libai',     // Weather & Social 2 — nature, seasons
    13: 'eileen',    // Appearances & Emotions — aesthetics, emotions
    14: 'eileen',    // Movie & Leisure 2 — arts, culture
    15: 'libai',     // New Year! — celebration, festivity
  },
  hsk3: {
    1:  'jane',      // Plans & Weekend — social planning
    2:  'liucixin',  // Timing & Return — time, precision
    3:  'luxun',     // Location & Things — grounded, precise
    4:  'jane',      // Social Behaviour — social norms, manners
    5:  'elena',     // Health & Lifestyle — personal health, lifestyle
    6:  'camus',     // Possibility & Doubt — existential uncertainty
    7:  'elena',     // Time & Relationships — relationships, time
    8:  'camus',     // Conditions & Decisions — decision-making
    9:  'eileen',    // Comparison & Compliments — aesthetic judgement, social observation
    10: 'luxun',     // Study & Subjects — education, knowledge
    11: 'eileen',    // Home & Reminders — domesticity, detail
    12: 'luxun',     // The Bǎ & Bèi Sentences — grammar precision
    13: 'liucixin',  // Transport & 是...的 — technology, transport
    14: 'libai',     // Directional Complements — movement, direction
    15: 'jane',      // General Expressions — social expressions
  },
  hsk4: {
    1:  'eileen',    // Love & Romance — relationships, love, her expertise
    2:  'jane',      // Friendship & Trust — friendship, social bonds
    3:  'luxun',     // Communication & Expressions — language, rhetoric
    4:  'luxun',     // Work & Career — diligence, society
    5:  'liucixin',  // Money & Finance — analytical, logical
    6:  'jane',      // Smart Shopping — commerce, social savvy
    7:  'eileen',    // Quality & Standards — aesthetics, quality
    8:  'elena',     // Health & Medicine — personal wellbeing
    9:  'eileen',    // Lifestyle & Habits — urban lifestyle
    10: 'libai',     // Nature & Environment — nature poetry
    11: 'libai',     // Weather & Change — weather, seasons
    12: 'camus',     // Perseverance & Achievement — absurdist perseverance
    13: 'libai',     // Happiness & Contentment — joy, poetry
    14: 'luxun',     // Society & Values — social critique
    15: 'eileen',    // Culture, Arts & Idioms — culture, arts
  },
  hsk5: {
    1:  'libai',     // Travel & Transportation — travel
    2:  'luxun',     // Education & Learning — education, knowledge
    3:  'liucixin',  // Media & Technology — technology, media
    4:  'libai',     // Food & Cuisine — food culture
    5:  'camus',     // Sports & Fitness — endurance, perseverance
    6:  'luxun',     // Law & Rights — justice, society
    7:  'liucixin',  // Business & Economy — analytical
    8:  'elena',     // Family & Relationships — family, deep relationships
    9:  'luxun',     // Language & Communication — language master
    10: 'eileen',    // Urban Life — Shanghai urban life
    11: 'eileen',    // Arts & Culture — arts, culture
    12: 'eileen',    // Character & Personality — character observation
    13: 'elena',     // Health & Medicine — personal health
    14: 'dante',     // Time & Life Stages — life journey, moral stages
    15: 'camus',     // Achievement & Success — perseverance, achievement
  },
  hsk6: {
    1:  'eileen',    // Love's Small Gestures — love, romance
    2:  'eileen',    // The Language of Love — love, language
    3:  'camus',     // Facing Life's Choices — existential choices
    4:  'camus',     // Everything Can Change — change, existential themes
    5:  'luxun',     // The Art of Debate — debate, social critic
    6:  'luxun',     // The Power of Words in Debate — language, rhetoric
    7:  'liucixin',  // Sleep and the Biological Clock — science, biology
    8:  'liucixin',  // Technology and Wellbeing — technology
    9:  'liucixin',  // WeChat Goes Global — digital technology
    10: 'liucixin',  // Digital China — digital China
    11: 'elena',     // Body Weight and Diet — body image, health
    12: 'elena',     // The Science of Healthy Eating — health, personal
    13: 'dante',     // What Is Abstract Art? — philosophy, aesthetics
    14: 'eileen',    // Beauty and Aesthetic Perception — aesthetics
  },
};

// Keyword-based fallback rules for lessons not in the explicit map above.
// Checked in order — first match wins.
const AVATAR_RULES = [
  { avatar: 'liucixin', keywords: ['science', 'technology', 'digital', 'computer', 'engineer', 'future', 'robot', 'media', 'internet'] },
  { avatar: 'elena',    keywords: ['family', 'health', 'medicine', 'body', 'diet', 'lifestyle', 'identity', 'growing'] },
  { avatar: 'jane',     keywords: ['greet', 'social', 'friend', 'manners', 'party', 'leisure', 'new year', 'shopping'] },
  { avatar: 'libai',    keywords: ['travel', 'food', 'nature', 'weather', 'season', 'poem', 'drink', 'cuisine', 'animal', 'transport'] },
  { avatar: 'luxun',    keywords: ['work', 'career', 'society', 'school', 'study', 'education', 'law', 'right', 'debate', 'language'] },
  { avatar: 'eileen',   keywords: ['love', 'romance', 'emotion', 'art', 'culture', 'urban', 'aesthetic', 'beauty', 'personality'] },
  { avatar: 'camus',    keywords: ['persever', 'achieve', 'success', 'choice', 'change', 'doubt', 'condition', 'decision', 'value'] },
  { avatar: 'dante',    keywords: ['life stage', 'abstract', 'philosophy', 'history', 'challenge', 'time', 'idiom'] },
];

/**
 * Returns an avatarId for a given lesson.
 * Checks the explicit map first (levelId + lessonNumber), then falls back to keyword rules.
 *
 * @param {string} levelId       - e.g. 'hsk1', 'hsk5'
 * @param {number} lessonNumber  - e.g. 3
 * @param {string} lessonTitle   - e.g. 'Sports & Fitness'  (used for fallback)
 * @param {string} lessonCategory - optional extra string    (used for fallback)
 * @returns {string} avatarId
 */
export function getAvatarForLesson(levelId = '', lessonNumber = 0, lessonTitle = '', lessonCategory = '') {
  const explicit = LESSON_AVATAR_MAP[levelId]?.[lessonNumber];
  if (explicit) return explicit;

  const combined = `${lessonTitle} ${lessonCategory}`.toLowerCase();
  for (const rule of AVATAR_RULES) {
    if (rule.keywords.some(kw => combined.includes(kw))) return rule.avatar;
  }
  return 'eileen';
}
