import React from 'react';
import { ImageBackground, View, StyleSheet } from 'react-native';
import { getLevelBackground } from '../config/vanGoghTheme';

/**
 * Full-screen painting background.
 * Pass `levelId` to use the Van Gogh painting for that HSK level.
 * Falls back to the warm canvas texture when levelId is omitted or unknown.
 */
export default function ScreenBackground({ children, levelId, style }) {
  const source = getLevelBackground(levelId);
  return (
    <ImageBackground
      source={source}
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
