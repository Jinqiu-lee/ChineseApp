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
  // ── Animated GIFs ─────────────────────────────────────────────────
  '撇':   { asset: require('./gifs/pie.gif'),     animated: true, format: 'gif', pinyin: 'piě'   },
  '捺':   { asset: require('./gifs/na.gif'),      animated: true, format: 'gif', pinyin: 'nà'    },
  '点':   { asset: require('./gifs/dian.gif'),    animated: true, format: 'gif', pinyin: 'diǎn'  },
  '提':   { asset: require('./gifs/ti.gif'),      animated: true, format: 'gif', pinyin: 'tí'    },
  '弯钩': { asset: require('./gifs/wangou.gif'),  animated: true, format: 'gif', pinyin: 'wāngōu' },
  '斜钩': { asset: require('./gifs/xiegou.gif'),  animated: true, format: 'gif', pinyin: 'xiégōu' },
  '横撇': { asset: require('./gifs/hengpie.gif'), animated: true, format: 'gif', pinyin: 'héngpiě' },
  '撇折': { asset: require('./gifs/piezhe.gif'),  animated: true, format: 'gif', pinyin: 'piězhé' },
  '竖折': { asset: require('./gifs/shuzhe.gif'),  animated: true, format: 'gif', pinyin: 'shùzhé' },

  // ── Static stills (no animation available, but they render correctly) ──
  '撇点':     { asset: require('./gifs/piedian.png'),            animated: false, format: 'png',  pinyin: 'piědiǎn' },
  '横折提':   { asset: require('./gifs/hengzheti.png'),          animated: false, format: 'png',  pinyin: 'héngzhétí' },
  '横撇弯钩': { asset: require('./gifs/hengpiewangou.jpg'),      animated: false, format: 'jpg',  pinyin: 'héngpiěwāngōu' },
  '竖勾':     { asset: require('./gifs/shugou.jpeg'),            animated: false, format: 'jpeg', pinyin: 'shùgōu' },
  '横折折折钩': { asset: require('./gifs/hengzhezhezhegou.png'), animated: false, format: 'png',  pinyin: 'héngzhézhézhégōu' },

  // Deliberately NOT registered (WebP only — would render frozen):
  //   横 竖 横钩 横折 横折钩 横折弯钩 竖提 竖弯钩 竖折折钩
  // 横 and 竖 fall back to StrokeAnimator below. Replace the .webp files with
  // .gif versions and add them here to upgrade any of the others.
};

// Strokes with no usable file: draw them with StrokeAnimator using this glyph.
// These glyphs exist in strokeData.js, so they animate and can loop.
const STROKE_FALLBACK_CHARS = {
  '横': '一',
  '竖': '丨',
  '撇': '丿',
};

// Pinyin for every stroke name, including ones with no asset. Single source of
// truth so answer buttons can be labelled without duplicating it per lesson.
const STROKE_PINYIN = {
  '横': 'héng', '竖': 'shù', '撇': 'piě', '捺': 'nà', '点': 'diǎn', '提': 'tí',
  '弯钩': 'wāngōu', '斜钩': 'xiégōu', '横钩': 'hénggōu', '竖勾': 'shùgōu',
  '横折': 'héngzhé', '横折钩': 'héngzhégōu', '横折弯钩': 'héngzhéwāngōu',
  '横折提': 'héngzhétí', '横撇': 'héngpiě', '横撇弯钩': 'héngpiěwāngōu',
  '横折折折钩': 'héngzhézhézhégōu',
  '竖折': 'shùzhé', '竖弯钩': 'shùwāngōu', '竖提': 'shùtí', '竖折折钩': 'shùzhézhégōu',
  '撇折': 'piězhé', '撇点': 'piědiǎn',
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
  return { kind: 'none' };
}

export function getStrokeAsset(stroke) {
  return STROKE_ASSETS[stroke] || null;
}

export const MISSING_STROKES = [];

export default STROKE_ASSETS;
