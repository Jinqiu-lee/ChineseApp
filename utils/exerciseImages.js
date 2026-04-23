// ── Local Exercise Images ─────────────────────────────────────────────────────
// Maps image IDs (from hsk1_images.json) → bundled local asset.
// Drop an image into assets/exercise_images/ then add a require() entry here.
// The stageGenerator checks this map after picking an image from the JSON;
// if a match is found, the local asset takes priority over the emoji fallback
// and any remote URL.
//
// HOW TO ADD MORE:
//   1. Copy your image into:  assets/exercise_images/<filename>
//   2. Find the image's id in hsk1_images.json (e.g. "ni_3")
//   3. Add one line here:     'ni_3': require('../assets/exercise_images/<filename>'),
//
// NOTE: Animated GIFs work on Android automatically. On iOS they display as
// a still frame unless you add the @expo/config-plugins GIF plugin to app.json.
// ─────────────────────────────────────────────────────────────────────────────

const EXERCISE_IMAGES = {
  // ── 四月 ──────────────────────────────────────────────────────────────────
  'apr_1': require('../assets/exercise_images/四月.jpg'),          // 四月

  // ── 爸爸 ──────────────────────────────────────────────────────────────────
  'baba_2': require('../assets/exercise_images/爸爸和女儿.jpg'),   // 爸爸和女儿
  'baba_3': require('../assets/exercise_images/爸爸和儿子.png'),   // 爸爸和儿子

  // ── 杯 ────────────────────────────────────────────────────────────────────
  'bei_4': require('../assets/exercise_images/一杯水.jpeg'),       // 一杯水

  // ── 本 ────────────────────────────────────────────────────────────────────
  'ben_4': require('../assets/exercise_images/两本书.png'),        // 两本书

  // ── 菜 ────────────────────────────────────────────────────────────────────
  'cai_1': require('../assets/exercise_images/蔬菜.png'),          // 蔬菜
  'cai_3': require('../assets/exercise_images/炒菜.jpg'),          // 炒菜
  'cai_4': require('../assets/exercise_images/吃菜.jpeg'),         // 吃菜

  // ── 茶 ────────────────────────────────────────────────────────────────────
  'cha_2': require('../assets/exercise_images/泡茶.png'),          // 泡茶
  'cha_3': require('../assets/exercise_images/喝茶.png'),          // 喝茶
  'cha_4': require('../assets/exercise_images/绿茶.jpg'),          // 绿茶

  // ── 吃 ────────────────────────────────────────────────────────────────────
  'chi_3': require('../assets/exercise_images/吃菜.jpeg'),         // 吃菜
  'chi_4': require('../assets/exercise_images/吃苹果.png'),        // 吃苹果

  // ── 大 ────────────────────────────────────────────────────────────────────
  'da_3': require('../assets/exercise_images/你多大？.jpg'),       // 你多大？

  // ── 点 ────────────────────────────────────────────────────────────────────
  'dian_2': require('../assets/exercise_images/几点了？.jpg'),     // 几点了？
  'dian_4': require('../assets/exercise_images/十点半.png'),       // 十点半

  // ── 电视 / 电影 ───────────────────────────────────────────────────────────
  'dianshi_2': require('../assets/exercise_images/看电视.jpg'),    // 看电视
  'dianying_2': require('../assets/exercise_images/看电影.png'),   // 看电影

  // ── 多 ────────────────────────────────────────────────────────────────────
  'duo_1': require('../assets/exercise_images/很多书.jpg'),        // 很多书
  'duo_2': require('../assets/exercise_images/很多人.jpg'),        // 很多人
  'duo_3': require('../assets/exercise_images/很多星星.jpg'),      // 很多星星
  'duo_4': require('../assets/exercise_images/多少钱？.png'),      // 多少钱？

  // ── 多少 ──────────────────────────────────────────────────────────────────
  'duoshao_1': require('../assets/exercise_images/多少钱？.png'),  // 多少钱？

  // ── 个 ────────────────────────────────────────────────────────────────────
  'ge_1': require('../assets/exercise_images/三个.png'),           // 三个
  'ge_2': require('../assets/exercise_images/两个苹果.jpg'),       // 两个苹果
  'ge_3': require('../assets/exercise_images/几个人.jpg'),         // 几个人

  // ── 汉字 ──────────────────────────────────────────────────────────────────
  'hanzi_2': require('../assets/exercise_images/写汉字.png'),      // 写汉字
  'hanzi_3': require('../assets/exercise_images/汉字书法.jpg'),    // 汉字书法

  // ── 好 ────────────────────────────────────────────────────────────────────
  'hao_4': require('../assets/exercise_images/好人.png'),          // 好人

  // ── 喝 ────────────────────────────────────────────────────────────────────
  'he_1': require('../assets/exercise_images/喝茶.png'),           // 喝茶
  'he_2': require('../assets/exercise_images/喝水.jpg'),           // 喝水

  // ── 喝茶 ──────────────────────────────────────────────────────────────────
  'hecha_1': require('../assets/exercise_images/喝茶.png'),        // 喝茶
  'hecha_4': require('../assets/exercise_images/茶叶.png'),        // 茶叶

  // ── 喝水 ──────────────────────────────────────────────────────────────────
  'heshui_1': require('../assets/exercise_images/喝水.jpg'),       // 喝水
  'heshui_2': require('../assets/exercise_images/一杯水.jpeg'),    // 一杯水
  'heshui_3': require('../assets/exercise_images/喝水.jpg'),       // 喝水
  'heshui_4': require('../assets/exercise_images/冰水.jpeg'),      // 冰水

  // ── 一月 ──────────────────────────────────────────────────────────────────
  'jan_1': require('../assets/exercise_images/一月.png'),          // 一月
  'jan_4': require('../assets/exercise_images/一月一号.png'),      // 一月一号

  // ── 几 ────────────────────────────────────────────────────────────────────
  'ji_3': require('../assets/exercise_images/几点了？.jpg'),       // 几点了？
  'ji_4': require('../assets/exercise_images/几号？.jpeg'),        // 几号？

  // ── 叫 ────────────────────────────────────────────────────────────────────
  'jiao_1': require('../assets/exercise_images/叫.png'),            // 叫
  'jiao_2': require('../assets/exercise_images/你叫什么？.jpeg'),  // 你叫什么？

  // ── 今天 ──────────────────────────────────────────────────────────────────
  'jintian_1': require('../assets/exercise_images/今天.png'),      // 今天

  // ── 七月 ──────────────────────────────────────────────────────────────────
  'jul_1': require('../assets/exercise_images/七月.png'),          // 七月

  // ── 咖啡 ──────────────────────────────────────────────────────────────────
  'kafei_3': require('../assets/exercise_images/咖啡豆.jpg'),      // 咖啡豆
  'kafei_4': require('../assets/exercise_images/咖啡店.jpg'),      // 咖啡店

  // ── 看 ────────────────────────────────────────────────────────────────────
  'kan_2': require('../assets/exercise_images/看电视.jpg'),        // 看电视
  'kan_3': require('../assets/exercise_images/看书.jpg'),          // 看书
  'kan_4': require('../assets/exercise_images/看电影.png'),        // 看电影

  // ── 里 ────────────────────────────────────────────────────────────────────
  'li_1': require('../assets/exercise_images/里面.png'),           // 里面

  // ── 两 ────────────────────────────────────────────────────────────────────
  'liang_1': require('../assets/exercise_images/两个.png'),        // 两个
  'liang_2': require('../assets/exercise_images/两个足球.jpg'),    // 两个足球
  'liang_3': require('../assets/exercise_images/两个苹果.jpg'),    // 两个苹果

  // ── 零 ────────────────────────────────────────────────────────────────────
  'ling_3': require('../assets/exercise_images/零度.png'),         // 零度
  'ling_4': require('../assets/exercise_images/零分.jpeg'),        // 零分

  // ── 吗 ────────────────────────────────────────────────────────────────────
  'ma_1': require('../assets/exercise_images/你好吗？.png'),       // 你好吗？
  'ma_3': require('../assets/exercise_images/是他吗？.png'),       // 是他吗？
  'ma_4': require('../assets/exercise_images/你喝吗？.png'),       // 你喝吗？

  // ── 买 ────────────────────────────────────────────────────────────────────
  'mai_3': require('../assets/exercise_images/买书.png'),          // 买书
  'mai_4': require('../assets/exercise_images/买衣服.png'),        // 买衣服

  // ── 妈妈 ──────────────────────────────────────────────────────────────────
  'mama_2': require('../assets/exercise_images/妈妈和女儿.jpg'),   // 妈妈和女儿
  'mama_3': require('../assets/exercise_images/妈妈和儿子.jpeg'),  // 妈妈和儿子

  // ── 名字 ──────────────────────────────────────────────────────────────────
  'mingzi_3': require('../assets/exercise_images/写名字.jpeg'),    // 写名字

  // ── 你 ────────────────────────────────────────────────────────────────────
  'ni_3': require('../assets/exercise_images/你是谁？.gif'),       // 你是谁？
  'ni_4': require('../assets/exercise_images/你好吗？.png'),       // 你好吗？

  // ── 年 ────────────────────────────────────────────────────────────────────
  'nian_1': require('../assets/exercise_images/今年.jpg'),         // 今年
  'nian_3': require('../assets/exercise_images/一年.png'),         // 一年
  'nian_4': require('../assets/exercise_images/明年.jpg'),         // 明年

  // ── 十月 ──────────────────────────────────────────────────────────────────
  'oct_1': require('../assets/exercise_images/十月.png'),          // 十月

  // ── 苹果 ──────────────────────────────────────────────────────────────────
  'pingguo_3': require('../assets/exercise_images/吃苹果.png'),    // 吃苹果
  'pingguo_4': require('../assets/exercise_images/一篮苹果.jpg'),  // 一篮苹果

  // ── 七 ────────────────────────────────────────────────────────────────────
  'qi_3': require('../assets/exercise_images/一星期七天.jpg'),     // 一星期七天

  // ── 人 ────────────────────────────────────────────────────────────────────
  'ren_1': require('../assets/exercise_images/一个人.png'),        // 一个人
  'ren_2': require('../assets/exercise_images/很多人.jpg'),        // 很多人
  'ren_4': require('../assets/exercise_images/好人.png'),          // 好人

  // ── 三 ────────────────────────────────────────────────────────────────────
  'san_2': require('../assets/exercise_images/三个.png'),          // 三个

  // ── 上 ────────────────────────────────────────────────────────────────────
  'shang_2': require('../assets/exercise_images/桌子上.png'),      // 桌子上
  'shang_3': require('../assets/exercise_images/山上.png'),        // 山上
  'shang_4': require('../assets/exercise_images/楼上.png'),        // 楼上

  // ── 上午 ──────────────────────────────────────────────────────────────────
  'shangwu_1': require('../assets/exercise_images/早上.jpeg'),     // 早上

  // ── 谁 ────────────────────────────────────────────────────────────────────
  'shei_2': require('../assets/exercise_images/他是谁？.png'),     // 他是谁？
  'shei_3': require('../assets/exercise_images/她是谁？.jpg'),     // 她是谁？
  'shei_4': require('../assets/exercise_images/那是谁？.png'),     // 那是谁？

  // ── 什么 ──────────────────────────────────────────────────────────────────
  'shenme_4': require('../assets/exercise_images/你叫什么？.jpeg'), // 你叫什么？

  // ── 书 ────────────────────────────────────────────────────────────────────
  'shu_2': require('../assets/exercise_images/很多书.jpg'),        // 很多书
  'shu_3': require('../assets/exercise_images/买书.png'),          // 买书
  'shu_4': require('../assets/exercise_images/看书.jpg'),          // 看书

  // ── 水 ────────────────────────────────────────────────────────────────────
  'shui_2': require('../assets/exercise_images/喝水.jpg'),         // 喝水
  'shui_3': require('../assets/exercise_images/一杯水.jpeg'),      // 一杯水
  'shui_4': require('../assets/exercise_images/冰水.jpeg'),        // 冰水

  // ── 岁 ────────────────────────────────────────────────────────────────────
  'sui_2': require('../assets/exercise_images/十岁.png'),          // 十岁
  'sui_3': require('../assets/exercise_images/你多大？.jpg'),      // 你多大？

  // ── 五 ────────────────────────────────────────────────────────────────────
  'wu_2': require('../assets/exercise_images/五根手指.jpg'),       // 五根手指

  // ── 下 ────────────────────────────────────────────────────────────────────
  'xia_2': require('../assets/exercise_images/桌子下.jpg'),        // 桌子下
  'xia_3': require('../assets/exercise_images/水下.png'),          // 水下
  'xia_4': require('../assets/exercise_images/楼下.png'),          // 楼下

  // ── 下午 ──────────────────────────────────────────────────────────────────
  'xiawu_3': require('../assets/exercise_images/下午茶.jpg'),      // 下午茶

  // ── 写 ────────────────────────────────────────────────────────────────────
  'xie_2': require('../assets/exercise_images/写汉字.png'),        // 写汉字
  'xie_4': require('../assets/exercise_images/写名字.jpeg'),       // 写名字

  // ── 一 ────────────────────────────────────────────────────────────────────
  'yi_4': require('../assets/exercise_images/第一.jpg'),           // 第一

  // ── 衣服 ──────────────────────────────────────────────────────────────────
  'yifu_2': require('../assets/exercise_images/买衣服.png'),       // 买衣服
  'yifu_4': require('../assets/exercise_images/服装店.jpg'),       // 服装店

  // ── 有 ────────────────────────────────────────────────────────────────────
  'you_1': require('../assets/exercise_images/有.jpeg'),           // 有

  // ── 月 ────────────────────────────────────────────────────────────────────
  'yue_2': require('../assets/exercise_images/一月.png'),          // 一月
  'yue_3': require('../assets/exercise_images/每个月.jpeg'),       // 每个月
  'yue_4': require('../assets/exercise_images/一个月.gif'),        // 一个月
};

module.exports = { EXERCISE_IMAGES };
