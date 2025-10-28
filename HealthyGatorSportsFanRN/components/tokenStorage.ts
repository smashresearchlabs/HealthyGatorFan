import * as SecureStore from "expo-secure-store";

const ACCESS = "hgfan.access";
const REFRESH = "hgfan.refresh";

function ensureString(name: string, v: any): string {
  if (typeof v === "string" && v.length > 0) return v;
  if (v != null) return String(v);
  throw new Error(`${name} is missing or not a string`);
}

export async function saveTokens(access: string, refresh: string) {
  await SecureStore.setItemAsync(ACCESS, access);
  await SecureStore.setItemAsync(REFRESH, refresh);
}

export async function getAccess() {
  return await SecureStore.getItemAsync(ACCESS);
}

export async function getRefresh() {
  return await SecureStore.getItemAsync(REFRESH);
}

export async function setAccess(token: string) {
  await SecureStore.setItemAsync(ACCESS, token);
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS);
  await SecureStore.deleteItemAsync(REFRESH);
}
