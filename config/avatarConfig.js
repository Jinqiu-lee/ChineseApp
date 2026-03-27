// Avatar character configuration
// videos: used for 'idle' and 'happy' expressions (played via expo-av)
// images: used for all other expressions (rendered via Image)

const AVATARS = [
  {
    id: 'eileen',
    chineseName: '张爱玲',
    englishName: 'Eileen Chang',
    gender: 'female',
    videos: {
      idle:  require('../assets/avatar/EILEEN_CHANG_张爱玲/Eileen_relaxed.mp4'),
      happy: require('../assets/avatar/EILEEN_CHANG_张爱玲/Eileen_happy_content.mp4'),
    },
    images: {
      sad:      require('../assets/avatar/EILEEN_CHANG_张爱玲/张爱玲- sad.png'),
      think:    require('../assets/avatar/EILEEN_CHANG_张爱玲/张爱玲- happy.png'),
      encourage:require('../assets/avatar/EILEEN_CHANG_张爱玲/张爱玲-encourage.png'),
      surprised:require('../assets/avatar/EILEEN_CHANG_张爱玲/张爱玲- happy.png'),
      neutral:  require('../assets/avatar/EILEEN_CHANG_张爱玲/张爱玲- happy.png'),
    },
  },
  {
    id: 'libai',
    chineseName: '李白',
    englishName: 'Li Bai',
    gender: 'male',
    videos: {
      idle:  require('../assets/avatar/Libai_李白/Video-李白Libai.mp4'),
      happy: require('../assets/avatar/Libai_李白/libai_content_happy.mp4'),
    },
    images: {
      sad:      require('../assets/avatar/Libai_李白/李白- sad.png'),
      think:    require('../assets/avatar/Libai_李白/李白-think.png'),
      encourage:require('../assets/avatar/Libai_李白/李白- happy- satisfy.png'),
      surprised:require('../assets/avatar/Libai_李白/Libai-surprised.png'),
      neutral:  require('../assets/avatar/Libai_李白/李白- happy- satisfy.png'),
    },
  },
  {
    id: 'luxun',
    chineseName: '鲁迅',
    englishName: 'Lu Xun',
    gender: 'male',
    videos: {
      idle:  require('../assets/avatar/Luxun_鲁迅/luxun_happy.mp4'),
      happy: require('../assets/avatar/Luxun_鲁迅/luxun_praise_excited.mp4'),
    },
    images: {
      sad:      require('../assets/avatar/Luxun_鲁迅/luxun_question.png'),
      think:    require('../assets/avatar/Luxun_鲁迅/luxun_question.png'),
      encourage:require('../assets/avatar/Luxun_鲁迅/luxun_encourage.png'),
      surprised:require('../assets/avatar/Luxun_鲁迅/luxun_suprised.png'),
      neutral:  require('../assets/avatar/Luxun_鲁迅/luxun_happy.png'),
    },
  },
  {
    id: 'dante',
    chineseName: '但丁',
    englishName: 'Dante Alighieri',
    gender: 'male',
    videos: {
      idle:  require('../assets/avatar/DANTE_ALIGHIERI_但丁/Dante_reading.mp4'),
      happy: require('../assets/avatar/DANTE_ALIGHIERI_但丁/Dante_happy.mp4'),
    },
    images: {
      sad:      require('../assets/avatar/DANTE_ALIGHIERI_但丁/DANTE_confused.png'),
      think:    require('../assets/avatar/DANTE_ALIGHIERI_但丁/dante_reading_think.png'),
      encourage:require('../assets/avatar/DANTE_ALIGHIERI_但丁/DANTE_ALIGHIERI.png'),
      surprised:require('../assets/avatar/DANTE_ALIGHIERI_但丁/DANTE_confused.png'),
      neutral:  require('../assets/avatar/DANTE_ALIGHIERI_但丁/DANTE_ALIGHIERI.png'),
    },
  },
  {
    id: 'camus',
    chineseName: '加缪',
    englishName: 'Albert Camus',
    gender: 'male',
    videos: {
      idle:  require('../assets/avatar/Alert_Camus_加缪/camus_content.mp4'),
      happy: require('../assets/avatar/Alert_Camus_加缪/camus_happy.mp4'),
    },
    images: {
      sad:      require('../assets/avatar/Alert_Camus_加缪/camus_think.png'),
      think:    require('../assets/avatar/Alert_Camus_加缪/camus_think.png'),
      encourage:require('../assets/avatar/Alert_Camus_加缪/camus_encourage.png'),
      surprised:require('../assets/avatar/Alert_Camus_加缪/camus_insist_supportive.png'),
      neutral:  require('../assets/avatar/Alert_Camus_加缪/camus_happy_satisfied.png'),
    },
  },
  {
    id: 'jane',
    chineseName: '简奥斯汀',
    englishName: 'Jane Austen',
    gender: 'female',
    videos: {
      idle:  require('../assets/avatar/Jane_Austin_简奥斯汀/Jane_relaxed.mp4'),
      happy: require('../assets/avatar/Jane_Austin_简奥斯汀/JANE_happy_surprise.mp4'),
    },
    images: {
      sad:      require('../assets/avatar/Jane_Austin_简奥斯汀/简奥斯汀- worried.png'),
      think:    require('../assets/avatar/Jane_Austin_简奥斯汀/简奥斯汀- questioning.png'),
      encourage:require('../assets/avatar/Jane_Austin_简奥斯汀/简奥斯汀- encouraging.png'),
      surprised:require('../assets/avatar/Jane_Austin_简奥斯汀/简奥斯汀- surprise.png'),
      neutral:  require('../assets/avatar/Jane_Austin_简奥斯汀/简奥斯汀- happy.png'),
    },
  },
  {
    id: 'elena',
    chineseName: '费兰特',
    englishName: 'Elena Ferrante',
    gender: 'female',
    videos: {
      idle:  require('../assets/avatar/Elena_Ferrante/Elena_content.mp4'),
      happy: require('../assets/avatar/Elena_Ferrante/Elena_happy.mp4'),
    },
    images: {
      sad:      require('../assets/avatar/Elena_Ferrante/Elena_Ferrate_Sad.png'),
      think:    require('../assets/avatar/Elena_Ferrante/Elena_Ferrate_thinking.png'),
      encourage:require('../assets/avatar/Elena_Ferrante/Elena_Ferrate_Smile_happy.png'),
      surprised:require('../assets/avatar/Elena_Ferrante/Elena_Ferrate_questions_surprised.png'),
      neutral:  require('../assets/avatar/Elena_Ferrante/Elena_Ferrate_Smile_happy.png'),
    },
  },
  {
    id: 'liucixin',
    chineseName: '刘慈欣',
    englishName: 'Liu Cixin',
    gender: 'male',
    videos: {
      idle:  require('../assets/avatar/Liucixin_刘慈欣/liucixin_content.mp4'),
      happy: require('../assets/avatar/Liucixin_刘慈欣/liucixin_think.mp4'),
    },
    images: {
      sad:      require('../assets/avatar/Liucixin_刘慈欣/刘慈欣_calm.png'),
      think:    require('../assets/avatar/Liucixin_刘慈欣/Liucixin刘慈欣_expecting.png'),
      encourage:require('../assets/avatar/Liucixin_刘慈欣/liucixin_content_happy.png'),
      surprised:require('../assets/avatar/Liucixin_刘慈欣/Liucixin刘慈欣_expecting.png'),
      neutral:  require('../assets/avatar/Liucixin_刘慈欣/liucixin_content_happy.png'),
    },
  },
];

export default AVATARS;

export function getAvatar(avatarId) {
  return AVATARS.find(a => a.id === avatarId) || AVATARS[0];
}
