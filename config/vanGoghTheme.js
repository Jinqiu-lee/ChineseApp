// ── Van Gogh Design System ────────────────────────────────────────────────────
// Blue (night sky) + Yellow (lantern/sunlight) = the core visual signature.
// Keep UI elements sharp and flat. Backgrounds carry the painterly mood.

export const VG = {
  // ── Backgrounds ─────────────────────────────────────────────────────────────
  bg:           '#1C2A44',   // deep night-sky blue — safe area / screen bg
  card:         '#243454',   // card surface — slightly lighter
  cardElevated: '#2C3F62',   // elevated card / selected state
  cardInset:    '#1A2E4A',   // inset / pressed feel

  // ── Accent — warmth & light ─────────────────────────────────────────────────
  yellow:       '#F4C542',   // sunflower / lantern — primary accent
  gold:         '#E0B04B',   // soft gold — secondary accent
  orange:       '#D98C2B',   // amber — CTA / strong action

  // ── Text ────────────────────────────────────────────────────────────────────
  cream:        '#F7F3E9',   // warm white — primary text
  creamMid:     '#C5B99A',   // warm grey — secondary text
  creamMuted:   '#8A7E6E',   // muted — placeholder / disabled

  // ── Semantic ────────────────────────────────────────────────────────────────
  success:      '#7DC47A',   // warm sage green
  successBg:    'rgba(125,196,122,0.12)',
  error:        '#D9634E',   // terracotta red
  errorBg:      'rgba(217,99,78,0.12)',

  // ── Borders & overlays ──────────────────────────────────────────────────────
  border:        'rgba(244,197,66,0.13)',   // barely-there gold border
  borderMid:     'rgba(244,197,66,0.28)',   // visible gold border
  borderStrong:  'rgba(244,197,66,0.50)',   // strong gold border
  overlay:       'rgba(20,32,56,0.88)',     // modal backdrop
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
