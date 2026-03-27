// ── Van Gogh Design System ────────────────────────────────────────────────────
// Blue (night sky) + Yellow (lantern/sunlight) = the core visual signature.
// Keep UI elements sharp and flat. Backgrounds carry the painterly mood.

// ── Per-level full-screen palettes ───────────────────────────────────────────
// Used by lesson flow screens (LessonDetail, Stages, Quiz, RoundComplete).
// Each level maps to a Van Gogh painting mood.
export const LEVEL_SCREEN_PALETTES = {
  // ── Level 1: Café Terrace at Night ─────────────────────────────────────────
  // Deep night-sky blue + warm parchment lantern glow
  hsk1: {
    bg:          '#1C2A44',   // night sky
    card:        '#F5EDD8',   // warm parchment
    cardDark:    '#243454',   // dark panel
    titleText:   '#1C2A44',   // dark on cream
    onBg:        '#F7F3E9',   // light on dark
    onBgMuted:   '#8A7E6E',
    onCard:      '#1C2A44',
    onCardMuted: '#9A8A6A',
    accent:      '#F4C542',   // warm yellow CTA
    accentText:  '#1C2A44',   // dark on yellow
    altAccent:   '#D98C2B',   // amber secondary
    altAccentText:'#1C2A44',
    gold:        '#E0B04B',
    border:      'rgba(244,197,66,0.18)',
    cardBorder:  'rgba(217,140,43,0.25)',
    shadow:      '#A0700A',
    progressFill:'#F4C542',
    success:     '#5A9E5A',
    error:       '#C4503A',
    statusBar:   'light-content',
    waveEnabled: false,
  },

  // ── Level 2: Sunflowers (1888) ──────────────────────────────────────────────
  // Warm sunlit beige + bold sunflower yellow cards + orange accents
  hsk2: {
    bg:          '#FFF8E7',   // warm sunlit beige
    card:        '#FDE882',   // sunflower yellow
    cardDark:    '#FDEAB0',   // soft amber card
    titleText:   '#5C3A00',   // warm brown on yellow
    onBg:        '#5C3A00',   // dark warm text on beige
    onBgMuted:   '#A07828',   // muted amber-brown
    onCard:      '#5C3A00',
    onCardMuted: '#A07828',
    accent:      '#F5A623',   // warm orange CTA
    accentText:  '#FFFFFF',   // white on orange
    altAccent:   '#F4C542',   // bright yellow secondary
    altAccentText:'#5C3A00',
    gold:        '#E8A020',
    border:      'rgba(245,166,35,0.35)',
    cardBorder:  'rgba(245,166,35,0.4)',
    shadow:      '#B07010',
    progressFill:'#F5A623',
    success:     '#5A9E5A',
    error:       '#C4503A',
    statusBar:   'dark-content',
    waveEnabled: false,
  },

  // ── Level 3: Wheat Fields (1888) ────────────────────────────────────────────
  // Soft sky blue + golden wheat + field green, with wave animation
  hsk3: {
    bg:          '#E8F4FB',   // soft Van Gogh sky blue
    card:        '#F2F9EC',   // light field green-white
    cardDark:    '#D0EAD4',   // soft green card
    titleText:   '#1A3A1A',   // deep forest text
    onBg:        '#1A3A1A',   // dark on sky
    onBgMuted:   '#5A7A5A',   // muted field green
    onCard:      '#1A3A1A',
    onCardMuted: '#5A7A5A',
    accent:      '#4A90D9',   // sky blue CTA
    accentText:  '#FFFFFF',   // white on sky blue
    altAccent:   '#C8A836',   // wheat gold secondary
    altAccentText:'#1A3A1A',
    gold:        '#C8A836',   // wheat gold
    border:      'rgba(74,144,217,0.25)',
    cardBorder:  'rgba(107,181,107,0.3)',
    shadow:      '#2A6A2A',
    progressFill:'#4A90D9',
    success:     '#4A8E4A',
    error:       '#C4503A',
    statusBar:   'dark-content',
    waveEnabled: true,
    waveColors: {
      wave1: 'rgba(200,168,54,0.22)',   // golden wheat
      wave2: 'rgba(107,181,107,0.18)', // field green
      wave3: 'rgba(74,144,217,0.12)',  // sky tint
    },
  },

  // Fallback for hsk4+ (inherits Café Terrace base for now)
  hsk4: { bg:'#1C2A44',card:'#F5EDD8',cardDark:'#243454',titleText:'#1C2A44',onBg:'#F7F3E9',onBgMuted:'#8A7E6E',onCard:'#1C2A44',onCardMuted:'#9A8A6A',accent:'#F4C542',accentText:'#1C2A44',altAccent:'#D98C2B',altAccentText:'#1C2A44',gold:'#E0B04B',border:'rgba(244,197,66,0.18)',cardBorder:'rgba(217,140,43,0.25)',shadow:'#A0700A',progressFill:'#F4C542',success:'#5A9E5A',error:'#C4503A',statusBar:'light-content',waveEnabled:false },
  hsk5: { bg:'#1C2A44',card:'#F5EDD8',cardDark:'#243454',titleText:'#1C2A44',onBg:'#F7F3E9',onBgMuted:'#8A7E6E',onCard:'#1C2A44',onCardMuted:'#9A8A6A',accent:'#7BA7D4',accentText:'#1C2A44',altAccent:'#D98C2B',altAccentText:'#1C2A44',gold:'#7BA7D4',border:'rgba(123,167,212,0.22)',cardBorder:'rgba(123,167,212,0.3)',shadow:'#305070',progressFill:'#7BA7D4',success:'#5A9E5A',error:'#C4503A',statusBar:'light-content',waveEnabled:false },
};

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
