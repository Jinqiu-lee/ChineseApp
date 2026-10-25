// Tap-to-reveal English, the way Duolingo underlines a word you can look up.
//
// THE UNDERLINE IS AN SVG LINE, NOT A BORDER — on purpose. React Native's
// border engine cannot draw this reliably, and two separate limitations bite:
//
//   1. `borderStyle` is ignored unless EVERY side has a width, so the obvious
//      `borderBottomWidth` + `borderStyle: 'dashed'` renders nothing at all.
//   2. Giving all four sides a width and hiding three with the `borderColor`
//      shorthand fails too: flattened into one style, the shorthand is applied
//      after `borderBottomColor` and repaints the bottom transparent.
//
// Setting the three sides transparent individually was still invisible on
// device, so this draws the rule with react-native-svg instead — already a
// dependency here, used by the stroke animations. strokeDasharray gives exact
// control over dash and gap, and renders the same on both platforms.
//
// Only English is revealed. Pinyin is shown where a card already shows it and
// is never added by this component.
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { getCharacterMeaning, segmentForGloss } from '../../data/characters';
import { DEEP_NAVY, WARM_ORANGE } from '../../constants/colors';

const hasHan = (t) => /[一-鿿]/.test(t || '');

/** How far the line sits below the glyph, and how thick it is. */
export const GLOSS_GAP = 4;
const RULE_W = 2;

/** The line takes the text's own colour, so it works on navy and on white. */
function inkOf(style) {
  return StyleSheet.flatten(style)?.color || DEEP_NAVY;
}

/**
 * The dashed rule. Needs a measured width — a percentage width inside an
 * auto-width parent resolves to nothing, which is its own class of bug.
 */
function DashedRule({ color, width }) {
  if (!width) return null;
  return (
    <Svg width={width} height={RULE_W} style={{ marginTop: GLOSS_GAP }}>
      <Line
        x1={0} y1={RULE_W / 2} x2={width} y2={RULE_W / 2}
        stroke={color} strokeWidth={RULE_W} strokeDasharray="5,3"
      />
    </Svg>
  );
}

/** Measures its child and draws the rule under it. */
export function Underlined({ children, color }) {
  const [w, setW] = useState(0);
  return (
    <View>
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>{children}</View>
      <DashedRule color={color} width={w} />
    </View>
  );
}

/**
 * One glossable unit — a prompt character, an answer, the character being
 * written. Falls back to plain text when the course has no gloss for it, so a
 * radical shape never shows a dead underline.
 *
 * `onPress` lets a caller keep whatever the tap already did — playing the
 * audio, usually — while the gloss opens alongside it.
 */
export function Gloss({ text, meaning, style, glossStyle, onPress, align = 'center', disabled }) {
  const [open, setOpen] = useState(false);
  const en = meaning ?? getCharacterMeaning(text);
  const can = !disabled && !!en && hasHan(text);

  if (!can) return <Text style={style}>{text}</Text>;

  return (
    <View style={{ alignItems: align === 'left' ? 'flex-start' : 'center' }}>
      <TouchableOpacity
        onPress={() => { setOpen(o => !o); onPress?.(); }}
        activeOpacity={0.7}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Underlined color={inkOf(style)}><Text style={style}>{text}</Text></Underlined>
      </TouchableOpacity>
      {open && <Text style={[s.gloss, glossStyle]}>{en}</Text>}
    </View>
  );
}

/**
 * A sentence whose individual words can be looked up. Each unit the course can
 * gloss is underlined; tapping one shows its meaning on a line beneath the
 * sentence rather than reflowing the text under the finger.
 */
export function GlossSentence({ text, style, glossStyle }) {
  const [shown, setShown] = useState(null);
  const units = segmentForGloss(text || '');
  const ink = inkOf(style);

  return (
    <View>
      <View style={s.row}>
        {units.map((u, i) =>
          u.meaning ? (
            <TouchableOpacity
              key={i}
              onPress={() => setShown(sh => (sh && sh.i === i ? null : { ...u, i }))}
              activeOpacity={0.7}
            >
              <Underlined color={ink}><Text style={style}>{u.text}</Text></Underlined>
            </TouchableOpacity>
          ) : (
            // Punctuation and anything untaught: no rule, but the same height
            // below it so every unit sits on one baseline.
            <View key={i} style={s.plain}><Text style={style}>{u.text}</Text></View>
          ),
        )}
      </View>
      {shown && (
        <Text style={[s.gloss, s.glossLeft, glossStyle]}>
          {shown.text} — {shown.meaning}
        </Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  row:   { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' },
  plain: { marginBottom: GLOSS_GAP + RULE_W },
  gloss: { fontSize: 13, fontWeight: '700', color: WARM_ORANGE, marginTop: 4, textAlign: 'center' },
  glossLeft: { textAlign: 'left', marginTop: 6 },
});

export default Gloss;
