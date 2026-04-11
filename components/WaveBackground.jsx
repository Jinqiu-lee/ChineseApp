import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

/**
 * WaveBackground — subtle animated wave for Level 3 (Wheat Fields).
 * Three semi-transparent ellipses (wheat gold, field green, sky tint)
 * drift gently left/right at the bottom of the screen, evoking
 * Van Gogh's swaying wheat fields under a wide sky.
 */
export default function WaveBackground({ colors }) {
  const w1 = useRef(new Animated.Value(0)).current;
  const w2 = useRef(new Animated.Value(0)).current;
  const w3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const sway = (val, duration, distance) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, {
            toValue: distance,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
          Animated.timing(val, {
            toValue: -distance,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
        ])
      );

    const anim1 = sway(w1, 4200, 22);
    const anim2 = sway(w2, 3100, 18);
    const anim3 = sway(w3, 5400, 14);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Wave 1: golden wheat — lowest, widest */}
      <Animated.View
        style={[
          styles.wave, styles.wave1,
          { backgroundColor: colors?.wave1 ?? 'rgba(200,168,54,0.22)',
            transform: [{ translateX: w1 }] },
        ]}
      />
      {/* Wave 2: field green — middle layer */}
      <Animated.View
        style={[
          styles.wave, styles.wave2,
          { backgroundColor: colors?.wave2 ?? 'rgba(107,181,107,0.18)',
            transform: [{ translateX: w2 }] },
        ]}
      />
      {/* Wave 3: sky tint — upper subtle layer */}
      <Animated.View
        style={[
          styles.wave, styles.wave3,
          { backgroundColor: colors?.wave3 ?? 'rgba(74,144,217,0.12)',
            transform: [{ translateX: w3 }] },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wave: {
    position: 'absolute',
    left: -50,
    right: -50,
    borderRadius: 130,
  },
  wave1: { bottom: -40, height: 230 },  // wheat, lowest
  wave2: { bottom: 50,  height: 190 },  // green, mid
  wave3: { bottom: 130, height: 150 },  // sky, highest
});
