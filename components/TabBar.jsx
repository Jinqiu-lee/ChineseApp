import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WARM_ORANGE, CARD_WHITE } from '../constants/colors';
import Svg, { Path, Circle, Rect, Polygon } from 'react-native-svg';

const GOLD   = '#f9ca24';
const MUTED  = '#c8a84b';

const HomeIcon = ({ active }) => (
  <Svg width={26} height={26} viewBox="0 0 26 26" fill="none">
    <Path d="M3 11L13 3L23 11V22H17V16H9V22H3V11Z"
      stroke={active ? GOLD : MUTED}
      strokeWidth={active ? 2 : 1.5}
      strokeLinejoin="round" />
  </Svg>
);

const LearnIcon = ({ active }) => (
  <Svg width={26} height={26} viewBox="0 0 26 26" fill="none">
    <Rect x="4" y="5" width="18" height="14" rx="2"
      stroke={active ? GOLD : MUTED} strokeWidth={active ? 2 : 1.5} />
    <Path d="M8 9H18M8 13H15"
      stroke={active ? GOLD : MUTED} strokeWidth={1.5} strokeLinecap="round" />
  </Svg>
);

const PracticeIcon = ({ active }) => (
  <Svg width={26} height={26} viewBox="0 0 26 26" fill="none">
    <Rect x="3" y="5" width="20" height="16" rx="2"
      stroke={active ? GOLD : MUTED} strokeWidth={active ? 2 : 1.5} />
    <Polygon points="10,9 10,17 18,13"
      fill={active ? GOLD : MUTED} />
  </Svg>
);

const AwardsIcon = ({ active }) => (
  <Svg width={26} height={26} viewBox="0 0 26 26" fill="none">
    <Path d="M13 3L15.5 9H22L17 13L19 20L13 16L7 20L9 13L4 9H10.5L13 3Z"
      stroke={active ? GOLD : MUTED}
      strokeWidth={active ? 2 : 1.5}
      strokeLinejoin="round" />
  </Svg>
);

const ProfileIcon = ({ active }) => (
  <Svg width={26} height={26} viewBox="0 0 26 26" fill="none">
    <Circle cx="13" cy="9" r="4"
      stroke={active ? GOLD : MUTED} strokeWidth={active ? 2 : 1.5} />
    <Path d="M5 22C5 18 8.5 15 13 15C17.5 15 21 18 21 22"
      stroke={active ? GOLD : MUTED} strokeWidth={active ? 2 : 1.5} strokeLinecap="round" />
  </Svg>
);

// REPLACE your TABS array
const TABS = [
  { key: 'home',         icon: (active) => <HomeIcon active={active} /> },
  { key: 'learn',        icon: (active) => <LearnIcon active={active} /> },
  { key: 'practice',     icon: (active) => <PracticeIcon active={active} /> },
  { key: 'achievements', icon: (active) => <AwardsIcon active={active} /> },
  { key: 'profile',      icon: (active) => <ProfileIcon active={active} /> },
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
            {tab.icon(isActive)}
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
});
