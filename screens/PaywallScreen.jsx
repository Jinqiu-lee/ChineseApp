import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import ScreenBackground from '../components/ScreenBackground';
import { purchaseSubscription, restorePurchases } from '../services/RevenueCatService';
import { WARM_ORANGE, DEEP_NAVY, CARD_WHITE, WARM_BROWN } from '../constants/colors';

const BULLETS = [
  '✦ All level 1–6 lessons',
  '✦ Full exercise library',
  '✦ All literary avatars & dialogues',
];

export default function PaywallScreen({ onDismiss, onSubscribed }) {
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const success = await purchaseSubscription();
      if (success) onSubscribed?.();
    } catch {
      Alert.alert('Purchase failed', 'Please try again or restore purchases.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const success = await restorePurchases();
      if (success) {
        onSubscribed?.();
      } else {
        Alert.alert('No purchases found', 'No active subscription found for this account.');
      }
    } catch {
      Alert.alert('Restore failed', 'Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <ScreenBackground levelId="hsk6">
      {/* Maybe Later */}
      <TouchableOpacity style={styles.dismissBtn} onPress={onDismiss} activeOpacity={0.7}>
        <Text style={styles.dismissText}>Maybe Later</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.headerBlock}>
          <Text style={styles.title}>Continue Your Journey</Text>
          <Text style={styles.titleChinese}>继续你的旅程</Text>
          <Text style={styles.subtitle}>Unlock all lessons and features</Text>
        </View>

        {/* Value bullets */}
        <View style={styles.bulletCard}>
          {BULLETS.map((b) => (
            <Text key={b} style={styles.bullet}>{b}</Text>
          ))}
        </View>

        {/* Price */}
        <View style={styles.priceBlock}>
          <Text style={styles.price}>$5.99</Text>
          <Text style={styles.pricePeriod}>/ month</Text>
        </View>
        <Text style={styles.priceNote}>Cancel anytime · 7-day free trial</Text>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.ctaBtn, loading && styles.ctaBtnDisabled]}
          onPress={handlePurchase}
          activeOpacity={0.88}
          disabled={loading || restoring}
        >
          {loading
            ? <ActivityIndicator color={CARD_WHITE} />
            : <Text style={styles.ctaBtnText}>Start Learning Now  →</Text>
          }
        </TouchableOpacity>

        {/* Restore */}
        <TouchableOpacity onPress={handleRestore} disabled={loading || restoring} activeOpacity={0.7}>
          {restoring
            ? <ActivityIndicator color="rgba(255,255,255,0.5)" style={{ marginTop: 16 }} />
            : <Text style={styles.restoreText}>Restore Purchases</Text>
          }
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  dismissBtn: {
    position: 'absolute',
    top: 56,
    right: 20,
    zIndex: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  dismissText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 48,
  },

  headerBlock: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: CARD_WHITE,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  titleChinese: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },

  bulletCard: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 24,
    width: '100%',
    gap: 12,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  bullet: {
    fontSize: 16,
    color: CARD_WHITE,
    fontWeight: '600',
  },

  priceBlock: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    marginBottom: 6,
  },
  price: {
    fontSize: 52,
    fontWeight: '900',
    color: CARD_WHITE,
    lineHeight: 56,
  },
  pricePeriod: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 8,
  },
  priceNote: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 28,
  },

  ctaBtn: {
    width: '100%',
    backgroundColor: WARM_ORANGE,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaBtnDisabled: {
    opacity: 0.6,
  },
  ctaBtnText: {
    fontSize: 18,
    fontWeight: '900',
    color: CARD_WHITE,
    letterSpacing: 0.3,
  },

  restoreText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
    textDecorationLine: 'underline',
    marginTop: 4,
  },
});
