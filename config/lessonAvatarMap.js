// Maps lesson topics to avatar characters based on keyword matching.
// Each rule lists keywords to match against the combined lesson title + category string.
// Rules are checked in order — first match wins.

const AVATAR_RULES = [
  // Elena Ferrante — intimate personal stories, identity, growing up, writing
  {
    avatar: 'elena',
    keywords: [
      'narrative', 'story', 'storytell', 'memoir', 'diary', 'novel',
      'intimate', 'introspect', 'self', 'identity', 'grow up', 'growing',
      'coming of age', 'neighbourhood', 'community', 'women', 'girlhood',
    ],
  },
  // Liu Cixin — science, technology, space, universe, future
  {
    avatar: 'liucixin',
    keywords: [
      'science', 'technology', 'universe', 'space', 'cosmos', 'physics',
      'invention', 'discover', 'research', 'experiment', 'future', 'robot',
      'digital', 'computer', 'engineer', 'astronomy', 'planet', 'galaxy',
    ],
  },
  // Jane Austen — social situations, greetings, etiquette, friends
  {
    avatar: 'jane',
    keywords: [
      'greet', 'introduction', 'social', 'etiquette', 'friend', 'polite',
      'meeting', 'acquaint', 'manners', 'party', 'invitation', 'visit',
      'making friends', 'leisure time', 'new year',
    ],
  },
  // Eileen Chang — emotions, relationships, family, shopping, home
  {
    avatar: 'eileen',
    keywords: [
      'family', 'emotion', 'relationship', 'love', 'romance', 'feeling',
      'home', 'house', 'shopping', 'money', 'shop', 'buy', 'happiness',
      'contentment', 'personality', 'psychology', 'character', 'mood',
      'marry', 'wedding', 'parent', 'child', 'mother', 'father',
    ],
  },
  // Li Bai — poetry, nature, classical literature, travel, food
  {
    avatar: 'libai',
    keywords: [
      'travel', 'food', 'nature', 'weather', 'season', 'poem', 'poetry',
      'classical', 'literature', 'drink', 'eat', 'cuisine', 'taste',
      'mountain', 'river', 'scenery', 'animal', 'hobby', 'free time',
      'leisure', 'transport', 'trip',
    ],
  },
  // Lu Xun — society, school, daily life, work, serious topics
  {
    avatar: 'luxun',
    keywords: [
      'work', 'job', 'career', 'society', 'school', 'study', 'education',
      'daily', 'routine', 'commut', 'traffic', 'pressure', 'problem',
      'real', 'life', 'activity', 'direction', 'location', 'number',
      'time', 'date', 'age', 'ability', 'action', 'completed',
    ],
  },
  // Camus — philosophy, health, time, reflection, abstract topics
  {
    avatar: 'camus',
    keywords: [
      'health', 'medicine', 'habit', 'lifestyle', 'value', 'freedom',
      'reflect', 'philosophy', 'abstract', 'technology', 'media',
      'law', 'right', 'business', 'economy', 'environment', 'urban',
      'language', 'communication', 'persever', 'achievement', 'success',
    ],
  },
  // Dante — adventure, history, challenges, mystery
  {
    avatar: 'dante',
    keywords: [
      'adventure', 'history', 'challenge', 'mystery', 'legend', 'quest',
      'culture', 'art', 'idiom', 'classic', 'sport', 'fitness',
      'condition', 'decision', 'comparison', 'compliment', 'complement',
      'possibility', 'doubt', 'bǎ', 'bei', 'grammar', 'advanced',
    ],
  },
];

/**
 * Returns an avatarId string for a given lesson title and optional category.
 * Matching is case-insensitive and checks if any keyword appears as a substring.
 * Defaults to 'eileen' if no rule matches.
 *
 * @param {string} lessonTitle - e.g. "Greetings and Basic Introductions"
 * @param {string} [lessonCategory] - optional extra category string
 * @returns {string} avatarId
 */
export function getAvatarForLesson(lessonTitle = '', lessonCategory = '') {
  const combined = `${lessonTitle} ${lessonCategory}`.toLowerCase();
  for (const rule of AVATAR_RULES) {
    if (rule.keywords.some(kw => combined.includes(kw))) {
      return rule.avatar;
    }
  }
  return 'eileen'; // default
}
