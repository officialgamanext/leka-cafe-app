import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const AUTH_STATE_KEY = 'auth_state';

export async function SecureStoreSave(key: string, value: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function SecureStoreGet(key: string) {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  let result = await SecureStore.getItemAsync(key);
  return result;
}
