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
            <Text style={[styles.chinese, isSelected && styles.textSelected]}>
              {avatar.chineseName}
            </Text>
            <Text style={[styles.english, isSelected && styles.englishSelected]}>
              {avatar.englishName}
            </Text>
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
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  itemSelected: {
    borderColor: '#a29bfe',
    backgroundColor: 'rgba(162,155,254,0.12)',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 6,
    backgroundColor: 'rgba(162,155,254,0.08)',
  },
  avatarSelected: {
    borderWidth: 2,
    borderColor: '#a29bfe',
  },
  chinese: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b2bec3',
    textAlign: 'center',
  },
  textSelected: {
    color: '#a29bfe',
  },
  english: {
    fontSize: 9,
    color: '#636e72',
    textAlign: 'center',
    marginTop: 2,
  },
  englishSelected: {
    color: '#a29bfe',
  },
});
