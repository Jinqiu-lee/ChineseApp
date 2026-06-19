import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WARM_ORANGE, CARD_WHITE } from '../constants/colors';

const TABS = [
  { key: 'home',         icon: '🏠' },
  { key: 'learn',        icon: '📚' },
  { key: 'practice',     icon: '🎬' },
  { key: 'achievements', icon: '🏆' },
  { key: 'profile',      icon: '👤' },
];

export default function TabBar({ activeTab, onTabPress }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TABS.map(tab => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.icon, isActive && styles.iconActive]}>{tab.icon}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: CARD_WHITE,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  icon:        { fontSize: 20, marginBottom: 3, opacity: 1 },
  iconActive:  { opacity: 1 },
});
