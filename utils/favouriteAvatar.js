import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'avatarId';

export async function getFavouriteAvatar() {
  try {
    const val = await AsyncStorage.getItem(STORAGE_KEY);
    return val || null;
  } catch {
    return null;
  }
}

// Returns the favourite avatar if one is saved, otherwise returns lessonAvatar unchanged.
export async function applyFavouriteAvatarOverride(lessonAvatar) {
  const favourite = await getFavouriteAvatar();
  return favourite ?? lessonAvatar;
}
