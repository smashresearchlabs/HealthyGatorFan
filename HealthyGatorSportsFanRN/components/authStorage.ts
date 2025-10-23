import AsyncStorage from '@react-native-async-storage/async-storage';
import User from "@/components/user";

const KEY = 'HealthyGatorFan.currentUser';

export async function saveUser(user: User) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(user));
  } catch {}
}

export async function loadUser(): Promise<User | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function clearUser() {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {}
}
