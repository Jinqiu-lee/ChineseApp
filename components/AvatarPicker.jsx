import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import AVATARS from '../config/avatarConfig';

export default function AvatarPicker({ selectedId = 'eileen', onSelect }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {AVATARS.map((avatar) => {
        const isSelected = avatar.id === selectedId;
        return (
          <TouchableOpacity
            key={avatar.id}
            style={[styles.item, isSelected && styles.itemSelected]}
            onPress={() => onSelect && onSelect(avatar.id)}
            activeOpacity={0.75}
          >
            <Image
              source={avatar.images.neutral}
              style={[styles.avatar, isSelected && styles.avatarSelected]}
              resizeMode="cover"
            />
            <View style={[styles.nameBadge, isSelected && styles.nameBadgeSelected]}>
              <Text
                style={[styles.chinese, isSelected && styles.textSelected]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {avatar.chineseName}
              </Text>
              <View style={styles.divider} />
              <Text
                style={[styles.english, isSelected && styles.englishSelected]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6}
              >
                {avatar.englishName}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 12,
  },
  item: {
    alignItems: 'center',
    width: 80,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  itemSelected: {
    borderColor: '#E8522A',
    backgroundColor: 'rgba(232,82,42,0.08)',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 6,
    backgroundColor: 'rgba(155,104,70,0.10)',
  },
  avatarSelected: {
    borderWidth: 3,
    borderColor: '#E8522A',
  },
  nameBadge: {
    width: 72,
    height: 38,
    backgroundColor: 'rgba(255,255,255,0.93)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(155,104,70,0.18)',
    paddingHorizontal: 5,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  nameBadgeSelected: {
    borderColor: '#E8522A',
    backgroundColor: '#fff',
  },
  divider: {
    width: 28,
    height: 1,
    backgroundColor: 'rgba(155,104,70,0.25)',
  },
  chinese: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    width: '100%',
  },
  textSelected: {
    color: '#E8522A',
  },
  english: {
    fontSize: 8,
    fontWeight: '600',
    color: '#555555',
    textAlign: 'center',
    width: '100%',
  },
  englishSelected: {
    color: '#C4431E',
  },
});
