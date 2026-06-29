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
  'apr_1': require('../assets/exercise_images/si_yue.jpg'),              // 四月

  // ── 爸爸 ──────────────────────────────────────────────────────────────────
  'baba_2': require('../assets/exercise_images/baba_he_nver.jpg'),       // 爸爸和女儿
  'baba_3': require('../assets/exercise_images/baba_he_erzi.png'),       // 爸爸和儿子

  // ── 杯 ────────────────────────────────────────────────────────────────────
  'bei_4': require('../assets/exercise_images/yi_bei_shui.jpeg'),        // 一杯水

  // ── 本 ────────────────────────────────────────────────────────────────────
  'ben_4': require('../assets/exercise_images/liang_ben_shu.png'),       // 两本书

  // ── 菜 ────────────────────────────────────────────────────────────────────
  'cai_1': require('../assets/exercise_images/shucai.png'),              // 蔬菜
  'cai_3': require('../assets/exercise_images/chao_cai.jpg'),            // 炒菜
  'cai_4': require('../assets/exercise_images/chi_cai.jpeg'),            // 吃菜

  // ── 茶 ────────────────────────────────────────────────────────────────────
  'cha_2': require('../assets/exercise_images/pao_cha.png'),             // 泡茶
  'cha_3': require('../assets/exercise_images/he_cha.png'),              // 喝茶
  'cha_4': require('../assets/exercise_images/lv_cha.jpg'),              // 绿茶

  // ── 吃 ────────────────────────────────────────────────────────────────────
  'chi_3': require('../assets/exercise_images/chi_cai.jpeg'),            // 吃菜
  'chi_4': require('../assets/exercise_images/chi_pingguo.png'),         // 吃苹果

  // ── 大 ────────────────────────────────────────────────────────────────────
  'da_3': require('../assets/exercise_images/ni_duo_da.jpg'),            // 你多大？

  // ── 点 ────────────────────────────────────────────────────────────────────
  'dian_2': require('../assets/exercise_images/ji_dian_le.jpg'),         // 几点了？
  'dian_4': require('../assets/exercise_images/shi_dian_ban.png'),       // 十点半

  // ── 电视 / 电影 ───────────────────────────────────────────────────────────
  'dianshi_2': require('../assets/exercise_images/kan_dianshi.jpg'),     // 看电视
  'dianying_2': require('../assets/exercise_images/kan_dianying.png'),   // 看电影

  // ── 多 ────────────────────────────────────────────────────────────────────
  'duo_1': require('../assets/exercise_images/hen_duo_shu.jpg'),         // 很多书
  'duo_2': require('../assets/exercise_images/hen_duo_ren.jpg'),         // 很多人
  'duo_3': require('../assets/exercise_images/hen_duo_xingxing.jpg'),    // 很多星星
  'duo_4': require('../assets/exercise_images/duoshao_qian.png'),        // 多少钱？

  // ── 多少 ──────────────────────────────────────────────────────────────────
  'duoshao_1': require('../assets/exercise_images/duoshao_qian.png'),    // 多少钱？

  // ── 个 ────────────────────────────────────────────────────────────────────
  'ge_1': require('../assets/exercise_images/san_ge.png'),               // 三个
  'ge_2': require('../assets/exercise_images/liang_ge_pingguo.jpg'),     // 两个苹果
  'ge_3': require('../assets/exercise_images/ji_ge_ren.jpg'),            // 几个人

  // ── 汉字 ──────────────────────────────────────────────────────────────────
  'hanzi_2': require('../assets/exercise_images/xie_hanzi.png'),         // 写汉字
  'hanzi_3': require('../assets/exercise_images/hanzi_shufa.jpg'),       // 汉字书法

  // ── 好 ────────────────────────────────────────────────────────────────────
  'hao_4': require('../assets/exercise_images/hao_ren.png'),             // 好人

  // ── 喝 ────────────────────────────────────────────────────────────────────
  'he_1': require('../assets/exercise_images/he_cha.png'),               // 喝茶
  'he_2': require('../assets/exercise_images/he_shui.jpg'),              // 喝水

  // ── 喝茶 ──────────────────────────────────────────────────────────────────
  'hecha_1': require('../assets/exercise_images/he_cha.png'),            // 喝茶
  'hecha_4': require('../assets/exercise_images/cha_ye.png'),            // 茶叶

  // ── 喝水 ──────────────────────────────────────────────────────────────────
  'heshui_1': require('../assets/exercise_images/he_shui.jpg'),          // 喝水
  'heshui_2': require('../assets/exercise_images/yi_bei_shui.jpeg'),     // 一杯水
  'heshui_3': require('../assets/exercise_images/he_shui.jpg'),          // 喝水
  'heshui_4': require('../assets/exercise_images/bing_shui.jpeg'),       // 冰水

  // ── 一月 ──────────────────────────────────────────────────────────────────
  'jan_1': require('../assets/exercise_images/yi_yue.png'),              // 一月
  'jan_4': require('../assets/exercise_images/yi_yue_yi_hao.png'),       // 一月一号

  // ── 几 ────────────────────────────────────────────────────────────────────
  'ji_3': require('../assets/exercise_images/ji_dian_le.jpg'),           // 几点了？
  'ji_4': require('../assets/exercise_images/ji_hao.jpeg'),              // 几号？

  // ── 叫 ────────────────────────────────────────────────────────────────────
  'jiao_1': require('../assets/exercise_images/jiao.png'),               // 叫
  'jiao_2': require('../assets/exercise_images/ni_jiao_shenme.jpeg'),    // 你叫什么？

  // ── 今天 ──────────────────────────────────────────────────────────────────
  'jintian_1': require('../assets/exercise_images/jintian.png'),         // 今天

  // ── 七月 ──────────────────────────────────────────────────────────────────
  'jul_1': require('../assets/exercise_images/qi_yue.png'),              // 七月

  // ── 咖啡 ──────────────────────────────────────────────────────────────────
  'kafei_3': require('../assets/exercise_images/kafei_dou.jpg'),         // 咖啡豆
  'kafei_4': require('../assets/exercise_images/kafei_dian.jpg'),        // 咖啡店

  // ── 看 ────────────────────────────────────────────────────────────────────
  'kan_2': require('../assets/exercise_images/kan_dianshi.jpg'),         // 看电视
  'kan_3': require('../assets/exercise_images/kan_shu.jpg'),             // 看书
  'kan_4': require('../assets/exercise_images/kan_dianying.png'),        // 看电影

  // ── 里 ────────────────────────────────────────────────────────────────────
  'li_1': require('../assets/exercise_images/li_mian.png'),              // 里面

  // ── 两 ────────────────────────────────────────────────────────────────────
  'liang_1': require('../assets/exercise_images/liang_ge.png'),          // 两个
  'liang_2': require('../assets/exercise_images/liang_ge_zuqiu.jpg'),    // 两个足球
  'liang_3': require('../assets/exercise_images/liang_ge_pingguo.jpg'),  // 两个苹果

  // ── 零 ────────────────────────────────────────────────────────────────────
  'ling_3': require('../assets/exercise_images/ling_du.png'),            // 零度
  'ling_4': require('../assets/exercise_images/ling_fen.jpeg'),          // 零分

  // ── 吗 ────────────────────────────────────────────────────────────────────
  'ma_1': require('../assets/exercise_images/ni_hao_ma.png'),            // 你好吗？
  'ma_3': require('../assets/exercise_images/shi_ta_ma.png'),            // 是他吗？
  'ma_4': require('../assets/exercise_images/ni_he_ma.png'),             // 你喝吗？

  // ── 买 ────────────────────────────────────────────────────────────────────
  'mai_3': require('../assets/exercise_images/mai_shu.png'),             // 买书
  'mai_4': require('../assets/exercise_images/mai_yifu.png'),            // 买衣服

  // ── 妈妈 ──────────────────────────────────────────────────────────────────
  'mama_2': require('../assets/exercise_images/mama_he_nver.jpg'),       // 妈妈和女儿
  'mama_3': require('../assets/exercise_images/mama_he_erzi.jpeg'),      // 妈妈和儿子

  // ── 名字 ──────────────────────────────────────────────────────────────────
  'mingzi_3': require('../assets/exercise_images/xie_mingzi.jpeg'),      // 写名字

  // ── 你 ────────────────────────────────────────────────────────────────────
  'ni_3': require('../assets/exercise_images/ni_shi_shei.gif'),          // 你是谁？
  'ni_4': require('../assets/exercise_images/ni_hao_ma.png'),            // 你好吗？

  // ── 年 ────────────────────────────────────────────────────────────────────
  'nian_1': require('../assets/exercise_images/jinnian.jpg'),            // 今年
  'nian_3': require('../assets/exercise_images/yi_nian.png'),            // 一年
  'nian_4': require('../assets/exercise_images/mingnian.jpg'),           // 明年

  // ── 十月 ──────────────────────────────────────────────────────────────────
  'oct_1': require('../assets/exercise_images/shi_yue.png'),             // 十月

  // ── 苹果 ──────────────────────────────────────────────────────────────────
  'pingguo_3': require('../assets/exercise_images/chi_pingguo.png'),     // 吃苹果
  'pingguo_4': require('../assets/exercise_images/yi_lan_pingguo.jpg'),  // 一篮苹果

  // ── 七 ────────────────────────────────────────────────────────────────────
  'qi_3': require('../assets/exercise_images/yi_xingqi_qi_tian.jpg'),   // 一星期七天

  // ── 人 ────────────────────────────────────────────────────────────────────
  'ren_1': require('../assets/exercise_images/yi_ge_ren.png'),           // 一个人
  'ren_2': require('../assets/exercise_images/hen_duo_ren.jpg'),         // 很多人
  'ren_4': require('../assets/exercise_images/hao_ren.png'),             // 好人

  // ── 三 ────────────────────────────────────────────────────────────────────
  'san_2': require('../assets/exercise_images/san_ge.png'),              // 三个

  // ── 上 ────────────────────────────────────────────────────────────────────
  'shang_2': require('../assets/exercise_images/zhuozi_shang.png'),      // 桌子上
  'shang_3': require('../assets/exercise_images/shan_shang.png'),        // 山上
  'shang_4': require('../assets/exercise_images/lou_shang.png'),         // 楼上

  // ── 上午 ──────────────────────────────────────────────────────────────────
  'shangwu_1': require('../assets/exercise_images/zaoshang.jpeg'),       // 早上

  // ── 谁 ────────────────────────────────────────────────────────────────────
  'shei_2': require('../assets/exercise_images/ta_shi_shei_male.png'),   // 他是谁？
  'shei_3': require('../assets/exercise_images/ta_shi_shei_female.jpg'), // 她是谁？
  'shei_4': require('../assets/exercise_images/na_shi_shei.png'),        // 那是谁？

  // ── 什么 ──────────────────────────────────────────────────────────────────
  'shenme_4': require('../assets/exercise_images/ni_jiao_shenme.jpeg'),  // 你叫什么？

  // ── 书 ────────────────────────────────────────────────────────────────────
  'shu_2': require('../assets/exercise_images/hen_duo_shu.jpg'),         // 很多书
  'shu_3': require('../assets/exercise_images/mai_shu.png'),             // 买书
  'shu_4': require('../assets/exercise_images/kan_shu.jpg'),             // 看书

  // ── 水 ────────────────────────────────────────────────────────────────────
  'shui_2': require('../assets/exercise_images/he_shui.jpg'),            // 喝水
  'shui_3': require('../assets/exercise_images/yi_bei_shui.jpeg'),       // 一杯水
  'shui_4': require('../assets/exercise_images/bing_shui.jpeg'),         // 冰水

  // ── 岁 ────────────────────────────────────────────────────────────────────
  'sui_2': require('../assets/exercise_images/shi_sui.png'),             // 十岁
  'sui_3': require('../assets/exercise_images/ni_duo_da.jpg'),           // 你多大？

  // ── 五 ────────────────────────────────────────────────────────────────────
  'wu_2': require('../assets/exercise_images/wu_gen_shouzhi.jpg'),       // 五根手指

  // ── 下 ────────────────────────────────────────────────────────────────────
  'xia_2': require('../assets/exercise_images/zhuozi_xia.jpg'),          // 桌子下
  'xia_3': require('../assets/exercise_images/shui_xia.png'),            // 水下
  'xia_4': require('../assets/exercise_images/lou_xia.png'),             // 楼下

  // ── 下午 ──────────────────────────────────────────────────────────────────
  'xiawu_3': require('../assets/exercise_images/xiawu_cha.jpg'),         // 下午茶

  // ── 写 ────────────────────────────────────────────────────────────────────
  'xie_2': require('../assets/exercise_images/xie_hanzi.png'),           // 写汉字
  'xie_4': require('../assets/exercise_images/xie_mingzi.jpeg'),         // 写名字

  // ── 一 ────────────────────────────────────────────────────────────────────
  'yi_4': require('../assets/exercise_images/di_yi.jpg'),                // 第一

  // ── 衣服 ──────────────────────────────────────────────────────────────────
  'yifu_2': require('../assets/exercise_images/mai_yifu.png'),           // 买衣服
  'yifu_4': require('../assets/exercise_images/fuzhuang_dian.jpg'),      // 服装店

  // ── 有 ────────────────────────────────────────────────────────────────────
  'you_1': require('../assets/exercise_images/you.jpeg'),                // 有

  // ── 月 ────────────────────────────────────────────────────────────────────
  'yue_2': require('../assets/exercise_images/yi_yue.png'),              // 一月
  'yue_3': require('../assets/exercise_images/mei_ge_yue.jpeg'),         // 每个月
  'yue_4': require('../assets/exercise_images/yi_ge_yue.gif'),           // 一个月
};

module.exports = { EXERCISE_IMAGES };
