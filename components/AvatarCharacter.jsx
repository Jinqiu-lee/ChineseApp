import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { getAvatar } from '../config/avatarConfig';

const VIDEO_EXPRESSIONS = ['idle', 'happy'];

export default function AvatarCharacter({ avatarId = 'eileen', expression = 'idle', size = 160 }) {
  const avatar = getAvatar(avatarId);

  // Animations
  const floatAnim  = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const pulseAnim  = useRef(new Animated.Value(1)).current;

  // Gentle float — always running
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 1400, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0,  duration: 1400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Expression-driven animations
  useEffect(() => {
    bounceAnim.setValue(1);
    shakeAnim.setValue(0);
    pulseAnim.setValue(1);

    if (expression === 'happy') {
      Animated.sequence([
        Animated.spring(bounceAnim, { toValue: 1.2, useNativeDriver: true }),
        Animated.spring(bounceAnim, { toValue: 1.0, useNativeDriver: true }),
        Animated.spring(bounceAnim, { toValue: 1.1, useNativeDriver: true }),
        Animated.spring(bounceAnim, { toValue: 1.0, useNativeDriver: true }),
      ]).start();
    } else if (expression === 'sad') {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 8,  duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6,  duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0,  duration: 60, useNativeDriver: true }),
      ]).start();
    } else if (expression === 'think') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0,  duration: 700, useNativeDriver: true }),
        ]),
        { iterations: 4 }
      ).start();
    }
  }, [expression]);

  const isVideo = VIDEO_EXPRESSIONS.includes(expression);
  const source  = isVideo
    ? avatar.videos[expression]
    : (avatar.images[expression] || avatar.images.neutral);

  // Combine scale animations (bounce + pulse both affect scale)
  const scaleAnim = Animated.multiply(bounceAnim, pulseAnim);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { width: size, height: size },
        {
          transform: [
            { translateY: floatAnim },
            { translateX: shakeAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      {isVideo ? (
        <Video
          source={source}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          resizeMode={ResizeMode.COVER}
          isLooping
          shouldPlay
          isMuted
        />
      ) : (
        <Image
          source={source}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          resizeMode="cover"
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    borderRadius: 9999,
    backgroundColor: 'rgba(162,155,254,0.08)',
  },
});
