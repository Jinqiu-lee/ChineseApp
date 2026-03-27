import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

// Warm golden oil-paint canvas — used as universal screen background.
// Filename has a leading space before .jpeg — must match exactly.
const CANVAS_BG = require('../assets/UI_design_images/abstarct_expressive_yellow_brush_strokes_oncanvas_background .jpeg');

export default function ScreenBackground({ children, style }) {
  return (
    <ImageBackground
      source={CANVAS_BG}
      style={[styles.root, style]}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
