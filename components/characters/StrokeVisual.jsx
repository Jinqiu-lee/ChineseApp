import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'react-native';
import StrokeAnimator from './StrokeAnimator';
import { getStrokeVisual } from '../../data/characters/strokeAssets';

// Shows a stroke as its actual shape rather than its Chinese name:
// a GIF when one exists, otherwise drawn from strokeData.
// Shared by the lesson screen and the recall screen so both look the same.
export default function StrokeVisual({ stroke, size = 60, loop = false }) {
  const v = getStrokeVisual(stroke);

  if (v.kind === 'gif') {
    return <Image source={v.asset} style={{ width: size, height: size }} resizeMode="contain" />;
  }
  if (v.kind === 'draw') {
    return <StrokeAnimator char={v.char} size={size} loop={loop} />;
  }
  return <Text style={[styles.glyph, { fontSize: size * 0.6 }]}>{stroke}</Text>;
}

// A stroke, or a combination written "撇 + 捺", rendered entirely as shapes.
export function StrokeCombo({ value, size = 60, loop = false }) {
  const parts = value.split('+').map(p => p.trim()).filter(Boolean);
  if (parts.length === 1) return <StrokeVisual stroke={parts[0]} size={size} loop={loop} />;

  const sub = size * 0.72;
  return (
    <View style={styles.row}>
      {parts.map((p, i) => (
        <React.Fragment key={`${p}-${i}`}>
          {i > 0 && <Text style={styles.plus}>+</Text>}
          <StrokeVisual stroke={p} size={sub} loop={loop} />
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  glyph: { fontWeight: '900', color: '#1C2A44' },
  row:   { flexDirection: 'row', alignItems: 'center' },
  plus:  { fontSize: 16, fontWeight: '800', color: '#374950', marginHorizontal: 2 },
});
