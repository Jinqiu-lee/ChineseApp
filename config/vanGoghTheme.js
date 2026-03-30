// ── Van Gogh Design System ────────────────────────────────────────────────────
// Blue (night sky) + Yellow (lantern/sunlight) = the core visual signature.
// Keep UI elements sharp and flat. Backgrounds carry the painterly mood.
import {
  DEEP_NAVY, WARM_ORANGE, SLATE_TEAL, WARM_BROWN, SOFT_SALMON,
  CARD_WHITE, TEXT_LIGHT, MUTED_LIGHT, SUCCESS, ERROR,
} from '../constants/colors';

// ── Per-level Van Gogh painting backgrounds ───────────────────────────────────
// Each HSK level maps to a specific Van Gogh painting used as the screen bg.
// require() calls must be static strings — no dynamic paths in React Native.
const LEVEL_BACKGROUND_IMAGES = {
  hsk1: require('../assets/UI_design_images/Sunflowers-level1.jpg'),
  hsk2: require('../assets/UI_design_images/The-Cafe-Terrace-at-Night-1888-level2.jpg'),
  hsk3: require('../assets/UI_design_images/Wheat-Field_level3.webp'),
  hsk4: require('../assets/UI_design_images/villiages_homes_level4.avif'),
  hsk5: require('../assets/UI_design_images/Starry_Night_level5.webp'),
  hsk6: require('../assets/UI_design_images/images_level6.avif'),
  pinyin: require('../assets/UI_design_images/Avenue-with-flowering_Pinyin.jpg'),
  default: require('../assets/UI_design_images/abstarct_expressive_yellow_brush_strokes_oncanvas_background .jpeg'),
};

/**
 * Returns the ImageBackground source for the given HSK level.
 * Falls back to the warm canvas texture if levelId is unknown.
 */
export function getLevelBackground(levelId) {
  return LEVEL_BACKGROUND_IMAGES[levelId] ?? LEVEL_BACKGROUND_IMAGES.default;
}

// ── Shared palette bases ───────────────────────────────────────────────────────
const _CARD_BASE = {
  bg:          'transparent',
  card:        CARD_WHITE,
  cardDark:    'rgba(255,255,255,0.92)',
  onCard:      DEEP_NAVY,
  onCardMuted: WARM_BROWN,
  cardBorder:  `rgba(155,104,70,0.14)`,
  shadow:      `rgba(28,42,68,0.18)`,
  success:     SUCCESS,
  error:       ERROR,
  waveEnabled: false,
};

// Bright painting levels — dark text on warm canvas
const _BRIGHT = {
  ..._CARD_BASE,
  titleText:    DEEP_NAVY,
  onBg:         DEEP_NAVY,
  onBgMuted:    SLATE_TEAL,
  gold:         WARM_BROWN,
  border:       `rgba(155,104,70,0.20)`,
  progressFill: SLATE_TEAL,
  statusBar:    'dark-content',
};

// Dark painting levels — light text on dark canvas
const _DARK = {
  ..._CARD_BASE,
  titleText:    TEXT_LIGHT,
  onBg:         TEXT_LIGHT,
  onBgMuted:    MUTED_LIGHT,
  gold:         MUTED_LIGHT,
  border:       `rgba(197,184,168,0.30)`,
  progressFill: WARM_ORANGE,
  statusBar:    'light-content',
};

// ── Per-level full-screen palettes ───────────────────────────────────────────
// bg is 'transparent' so the painting image shows through SafeAreaView.
// Cards are clean white. Text contrasts against the painting mood.
export const LEVEL_SCREEN_PALETTES = {
  // hsk1: Sunflowers — bright warm canvas, dark navy text
  hsk1: {
    ..._BRIGHT,
    accent:       SLATE_TEAL,
    accentText:   CARD_WHITE,
    altAccent:    WARM_ORANGE,
    altAccentText: CARD_WHITE,
  },

  // hsk2: Café Terrace at Night — dark painting, light text, orange CTA
  hsk2: {
    ..._DARK,
    accent:       WARM_ORANGE,
    accentText:   CARD_WHITE,
    altAccent:    WARM_BROWN,
    altAccentText: CARD_WHITE,
  },

  // hsk3: Wheat Fields — bright painting, dark text, teal CTA, wave animation
  hsk3: {
    ..._BRIGHT,
    accent:       SLATE_TEAL,
    accentText:   CARD_WHITE,
    altAccent:    WARM_ORANGE,
    altAccentText: CARD_WHITE,
    waveEnabled:  true,
    waveColors: {
      wave1: 'rgba(200,168,54,0.35)',
      wave2: 'rgba(80,150,80,0.22)',
      wave3: 'rgba(74,144,217,0.15)',
    },
  },

  // hsk4: Homes/Farmhouse — bright warm painting, dark text, deep navy CTA
  hsk4: {
    ..._BRIGHT,
    accent:       DEEP_NAVY,
    accentText:   CARD_WHITE,
    altAccent:    WARM_ORANGE,
    altAccentText: CARD_WHITE,
  },

  // hsk5: Starry Night — dark blue painting, light text, orange CTA
  hsk5: {
    ..._DARK,
    accent:       WARM_ORANGE,
    accentText:   CARD_WHITE,
    altAccent:    SOFT_SALMON,
    altAccentText: CARD_WHITE,
  },
};

export const VG = {
  // ── Backgrounds ─────────────────────────────────────────────────────────────
  bg:           DEEP_NAVY,
  card:         CARD_WHITE,
  cardElevated: CARD_WHITE,
  cardInset:    CARD_WHITE,

  // ── Accent — warmth & light ─────────────────────────────────────────────────
  yellow:       WARM_ORANGE,
  gold:         WARM_BROWN,
  orange:       WARM_ORANGE,

  // ── Text ────────────────────────────────────────────────────────────────────
  cream:        TEXT_LIGHT,
  creamMid:     MUTED_LIGHT,
  creamMuted:   SLATE_TEAL,

  // ── Semantic ────────────────────────────────────────────────────────────────
  success:      SUCCESS,
  successBg:    'rgba(45,122,74,0.12)',
  error:        ERROR,
  errorBg:      'rgba(196,80,58,0.12)',

  // ── Borders & overlays ──────────────────────────────────────────────────────
  border:        'rgba(155,104,70,0.18)',
  borderMid:     'rgba(155,104,70,0.32)',
  borderStrong:  'rgba(155,104,70,0.55)',
  overlay:       'rgba(28,42,68,0.88)',
};

// ── Level-specific palettes ──────────────────────────────────────────────────
// Each level corresponds to a Van Gogh painting mood.
export const VG_LEVELS = {
  hsk1: {
    emoji:   '🌻',
    color:   '#F4C542',    // Sunflowers — warm vivid yellow
    bg:      'rgba(244,197,66,0.12)',
    border:  'rgba(244,197,66,0.32)',
    // Painting reference: Sunflowers (1888) — warm amber+yellow on cream
  },
  hsk2: {
    emoji:   '☕',
    color:   '#E8B84B',    // Café Terrace — lantern gold against deep night blue
    bg:      'rgba(232,184,75,0.12)',
    border:  'rgba(232,184,75,0.32)',
    // Painting reference: Café Terrace at Night (1888) — gold warmth vs. blue dark
  },
  hsk3: {
    emoji:   '🌾',
    color:   '#8DBF6E',    // Wheat Fields — sun-baked green-gold
    bg:      'rgba(141,191,110,0.12)',
    border:  'rgba(141,191,110,0.30)',
    // Painting reference: Wheat Field (1888) — golden wheat, sky-blue horizon
  },
  hsk4: {
    emoji:   '🏡',
    color:   '#C4703A',    // Farmhouse — terracotta & warm earth
    bg:      'rgba(196,112,58,0.12)',
    border:  'rgba(196,112,58,0.30)',
    // Painting reference: Farmhouse in Provence — red roofs, ochre stone
  },
  hsk5: {
    emoji:   '🌌',
    color:   '#7BA7D4',    // Starry Night — luminous blue-white
    bg:      'rgba(123,167,212,0.12)',
    border:  'rgba(123,167,212,0.30)',
    // Painting reference: The Starry Night (1889) — swirling indigo, glowing stars
  },
  hsk6: {
    emoji:   '🌼',
    color:   '#A87DC8',    // Irises — soft violet bloom
    bg:      'rgba(168,125,200,0.12)',
    border:  'rgba(168,125,200,0.30)',
    // Painting reference: Irises (1889) — purple petals on warm soil
  },
};

// ── Foundation track palettes ────────────────────────────────────────────────
export const VG_TRACKS = {
  pinyin: {
    emoji:  '🏞️',
    color:  '#A8C97A',    // Avenue with Flowering Trees — dappled sunlit path
    bg:     'rgba(168,201,122,0.10)',
    border: 'rgba(168,201,122,0.28)',
  },
  characters: {
    emoji:  '🏕️',
    color:  '#C49A3A',    // Les Alyscamps — amber autumn avenue
    bg:     'rgba(196,154,58,0.10)',
    border: 'rgba(196,154,58,0.28)',
  },
};

// ── Reusable style objects (spread into StyleSheet) ──────────────────────────
export const VGS = {
  // Screen wrapper
  safe: {
    flex: 1,
    backgroundColor: VG.bg,
  },

  // Standard card
  card: {
    backgroundColor: VG.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: VG.border,
  },

  // Primary CTA button
  primaryBtn: {
    backgroundColor: VG.yellow,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: VG.bg,           // dark blue text on yellow — max contrast
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  // Ghost / outline button
  ghostBtn: {
    borderWidth: 1.5,
    borderColor: VG.borderMid,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  ghostBtnText: {
    color: VG.gold,
    fontSize: 15,
    fontWeight: '700',
  },

  // Section heading
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: VG.cream,
    letterSpacing: 0.2,
    marginBottom: 14,
  },

  // Standard header bar
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: VG.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: VG.cream,
    letterSpacing: 0.3,
  },
  backBtn: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  backText: {
    fontSize: 15,
    color: VG.gold,
    fontWeight: '700',
  },
};
