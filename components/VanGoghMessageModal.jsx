import React, { useEffect, useRef } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  Image, Animated, TouchableWithoutFeedback,
} from 'react-native';
import { DEEP_NAVY, WARM_ORANGE, WARM_BROWN, CARD_WHITE } from '../constants/colors';

const VG_PORTRAIT = require('../assets/avatar/Van_Gogh_梵高/Van_Gogh_portrait_in_fields.png');

/**
 * VanGoghMessageModal
 *
 * A bottom-sheet-style modal with Van Gogh's portrait and a poetic message.
 *
 * Props:
 *   visible    – bool
 *   message    – { text: string, painting?: string } | null
 *   buttonLabel – string  (default: "I understand →")
 *   onContinue – fn()   called when the button is tapped (should dismiss + act)
 *   onDismiss  – fn()   called when backdrop is tapped (just dismiss)
 */
export default function VanGoghMessageModal({
  visible,
  message,
  buttonLabel = 'I understand →',
  onContinue,
  onDismiss,
}) {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 10, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 300, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!message) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onDismiss}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      {/* Card */}
      <Animated.View style={[styles.card, { transform: [{ translateY: slideAnim }] }]}>

        {/* Portrait + quote row */}
        <View style={styles.portraitRow}>
          <Image source={VG_PORTRAIT} style={styles.portrait} resizeMode="cover" />
          <View style={styles.quoteBlock}>
            <Text style={styles.quoteOpen}>"</Text>
            <Text style={styles.quoteText}>{message.text}</Text>
            {message.painting && (
              <Text style={styles.attribution}>— Vincent, on {message.painting}</Text>
            )}
            {!message.painting && (
              <Text style={styles.attribution}>— Vincent van Gogh</Text>
            )}
          </View>
        </View>

        {/* Action button */}
        <TouchableOpacity style={styles.button} onPress={onContinue} activeOpacity={0.85}>
          <Text style={styles.buttonText}>{buttonLabel}</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.52)',
  },

  card: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: CARD_WHITE,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 36,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },

  portraitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 14,
  },

  portrait: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: WARM_BROWN,
  },

  quoteBlock: {
    flex: 1,
  },

  quoteOpen: {
    fontSize: 36,
    color: WARM_ORANGE,
    lineHeight: 30,
    fontWeight: '900',
    marginBottom: -4,
  },

  quoteText: {
    fontSize: 15,
    color: DEEP_NAVY,
    lineHeight: 23,
    fontStyle: 'italic',
    fontWeight: '500',
  },

  attribution: {
    marginTop: 10,
    fontSize: 12,
    color: WARM_BROWN,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  button: {
    backgroundColor: DEEP_NAVY,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
