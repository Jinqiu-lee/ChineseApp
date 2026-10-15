// Stroke-type assets (基本笔画) — each shows the brush motion for ONE stroke type.
//
// These are NOT per-character stroke-order animations. A character's stroke
// order (一 → 二 → 三, 木 = 横+竖+撇+捺, …) is rendered by
// components/characters/StrokeAnimator.jsx from data/characters/strokeData.js.
//
// NO WEBP. React Native's built-in Image renders animated WebP as a frozen
// still frame on Android, so a .webp here would look broken. Only GIF (which
// animates) and plain PNG/JPEG (honestly static) are registered. Any stroke
// without a usable file falls back to STROKE_FALLBACK_CHARS below and is drawn
// — and looped — by StrokeAnimator instead.
//
// Filenames are ASCII pinyin on purpose: Chinese characters and spaces in asset
// filenames break Metro's dev-server URLs and Android's asset packager.

const STROKE_ASSETS = {
  // Built from ./gifs, preferring an animated GIF, then a static image, then a
  // static WebP. An *animated* WebP is deliberately excluded: RN freezes it on
  // frame 1, which for a hooked stroke shows the wrong shape entirely.
  '捺': { asset: require('./gifs/na.gif'), animated: true, format: 'gif', pinyin: 'nà' },
  '提': { asset: require('./gifs/ti.gif'), animated: true, format: 'gif', pinyin: 'tí' },
  '撇': { asset: require('./gifs/pie.gif'), animated: true, format: 'gif', pinyin: 'piě' },
  '横': { asset: require('./gifs/heng.gif'), animated: true, format: 'gif', pinyin: 'héng' },
  '点': { asset: require('./gifs/dian.gif'), animated: true, format: 'gif', pinyin: 'diǎn' },
  '弯钩': { asset: require('./gifs/wangou.gif'), animated: true, format: 'gif', pinyin: 'wāngōu' },
  // Converted frame-for-frame from the uploaded wogou.webp, because RN's Image
  // animates GIF but freezes animated WebP. Same 300×300, same 200ms timing.
  '卧钩': { asset: require('./gifs/wogou.gif'), animated: true, format: 'gif', pinyin: 'wògōu' },
  '撇折': { asset: require('./gifs/piezhe.gif'), animated: true, format: 'gif', pinyin: 'piězhé' },
  '撇点': { asset: require('./gifs/piedian.png'), animated: false, format: 'png', pinyin: 'piědiǎn' },
  '斜钩': { asset: require('./gifs/xiegou.gif'), animated: true, format: 'gif', pinyin: 'xiégōu' },
  '横折': { asset: require('./gifs/hengzhe.gif'), animated: true, format: 'gif', pinyin: 'héngzhé' },
  '横撇': { asset: require('./gifs/hengpie.gif'), animated: true, format: 'gif', pinyin: 'héngpiě' },
  '横钩': { asset: require('./gifs/henggou.gif'), animated: true, format: 'gif', pinyin: 'hénggōu' },
  '竖勾': { asset: require('./gifs/shugou.gif'), animated: true, format: 'gif', pinyin: 'shùgōu' },
  '竖折': { asset: require('./gifs/shuzhe.gif'), animated: true, format: 'gif', pinyin: 'shùzhé' },
  '横折弯': { asset: require('./gifs/hengzhewan.png'), animated: false, format: 'png', pinyin: 'héngzhéwān' },
  '横折提': { asset: require('./gifs/hengzheti.png'), animated: false, format: 'png', pinyin: 'héngzhétí' },
  '横折钩': { asset: require('./gifs/hengzhegou.gif'), animated: true, format: 'gif', pinyin: 'héngzhégōu' },
  '横斜钩': { asset: require('./gifs/hengxiegou.webp'), animated: false, format: 'webp', pinyin: 'héngxiégōu' },
  '竖折撇': { asset: require('./gifs/shuzhepie.png'), animated: false, format: 'png', pinyin: 'shùzhépiě' },
  '横撇弯钩': { asset: require('./gifs/hengpiewangou.png'), animated: false, format: 'png', pinyin: 'héngpiěwāngōu' },
  '竖折折钩': { asset: require('./gifs/shuzhezhegou.gif'), animated: true, format: 'gif', pinyin: 'shùzhézhégōu' },
  '横折折折钩': { asset: require('./gifs/hengzhezhezhegou.png'), animated: false, format: 'png', pinyin: 'héngzhézhézhégōu' },
};

// Strokes with no usable file: draw them with StrokeAnimator using this glyph.
// These glyphs exist in strokeData.js, so they animate and can loop.
const STROKE_FALLBACK_CHARS = {
  '横': '一',
  '竖': '丨',
  '撇': '丿',
  '点': '丶',
};

// Strokes with neither a file nor a glyph of their own: show them inside a
// character that contains them, with that one stroke highlighted.
const STROKE_IN_CHARACTER = {
  '竖弯':     { char: '四', strokeIndex: 3 },
  '竖提':     { char: '以', strokeIndex: 0 },
  '横折弯钩': { char: '九', strokeIndex: 1 },
  // Its only file is an animated WebP, which RN freezes on frame 1 — the bare
  // opening vertical, indistinguishable from 竖弯. Drawing it inside 七 shows
  // the hook. Replace with a .gif and register it above to undo this.
  '竖弯钩': { char: '七', strokeIndex: 1 },
};

// Pinyin for every stroke name, including ones with no asset. Single source of
// truth so answer buttons can be labelled without duplicating it per lesson.
const STROKE_PINYIN = {
  '横': 'héng', '竖': 'shù', '撇': 'piě', '捺': 'nà', '点': 'diǎn', '提': 'tí',
  '弯钩': 'wāngōu', '斜钩': 'xiégōu', '卧钩': 'wògōu', '横钩': 'hénggōu', '竖勾': 'shùgōu',
  '横折': 'héngzhé', '横折钩': 'héngzhégōu', '横折弯钩': 'héngzhéwāngōu',
  '横折提': 'héngzhétí', '横撇': 'héngpiě', '横撇弯钩': 'héngpiěwāngōu',
  '横折折折钩': 'héngzhézhézhégōu',
  '竖折': 'shùzhé', '竖弯钩': 'shùwāngōu', '竖提': 'shùtí', '竖折折钩': 'shùzhézhégōu',
  '撇折': 'piězhé', '撇点': 'piědiǎn',
  '横折弯': 'héngzhéwān', '横斜钩': 'héngxiégōu', '竖折撇': 'shùzhépiě', '竖弯': 'shùwān',
};

export function getStrokePinyin(stroke) {
  return STROKE_PINYIN[stroke] || '';
}

// ── Writing-rule animations (Part 2) ────────────────────────────────────────
// Same idea as the stroke GIFs, keyed by the rule itself. To add one, drop the
// file in ./gifs and uncomment its line — expected names:
//     先横后竖  ->  gifs/xianhenghoushu.gif
//     先撇后捺  ->  gifs/xianpiehouna.gif
// Until a rule has a GIF, getRuleVisual() falls back to drawing the character
// the rule produces (十, 人) with StrokeAnimator, looping.
//
// Do NOT add a require() for a file that is not on disk — a missing asset path
// breaks the whole bundle, not just that image.
const RULE_ASSETS = {
  // '先横后竖': { asset: require('./gifs/xianhenghoushu.gif'), animated: true, format: 'gif' },
  // '先撇后捺': { asset: require('./gifs/xianpiehouna.gif'),   animated: true, format: 'gif' },
};

/**
 * How to show a writing rule:
 *   { kind: 'gif',  asset, ... }   — render with <Image>
 *   { kind: 'draw', char }         — render the resulting character, looping
 */
export function getRuleVisual(rule, resultChar) {
  const entry = RULE_ASSETS[rule];
  if (entry) return { kind: 'gif', ...entry };
  if (resultChar) return { kind: 'draw', char: resultChar };
  return { kind: 'none' };
}

/**
 * How to show a stroke:
 *   { kind: 'gif',  asset, animated, format }  — render with <Image>
 *   { kind: 'draw', char }                     — render with <StrokeAnimator loop>
 *   { kind: 'none' }                           — nothing available
 */
export function getStrokeVisual(stroke) {
  const entry = STROKE_ASSETS[stroke];
  if (entry) return { kind: 'gif', ...entry };
  const char = STROKE_FALLBACK_CHARS[stroke];
  if (char) return { kind: 'draw', char };
  const inChar = STROKE_IN_CHARACTER[stroke];
  if (inChar) return { kind: 'draw', char: inChar.char, highlight: inChar.strokeIndex };
  return { kind: 'none' };
}

export function getStrokeAsset(stroke) {
  return STROKE_ASSETS[stroke] || null;
}

// Strokes still waiting on artwork.
// No usable still of their own — drawn inside a host character instead.
export const MISSING_STROKES = ['竖弯', '竖提', '竖弯钩', '横折弯钩'];

export default STROKE_ASSETS;
