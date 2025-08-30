import AsyncStorage from '@react-native-async-storage/async-storage';

const MODE_KEY = 'ruvia:prefs:mode';
const SECONDARY_KEY = 'ruvia:prefs:secondary';

export type Mode = 'single' | 'dual';

let cachedMode: Mode | null = null;
let cachedSecondary: string | null = null;

export async function initPrefs(): Promise<void> {
  const m = await getMode();
  const s = await getSecondary();
  if (m) cachedMode = m; else cachedMode = 'single';
  if (s) cachedSecondary = s; else cachedSecondary = 'female';
}

export async function getMode(): Promise<Mode | null> {
  const v = await AsyncStorage.getItem(MODE_KEY);
  return (v === 'single' || v === 'dual') ? v : null;
}

export async function setMode(mode: Mode): Promise<void> {
  await AsyncStorage.setItem(MODE_KEY, mode);
  cachedMode = mode;
}

export async function getSecondary(): Promise<string | null> {
  const v = await AsyncStorage.getItem(SECONDARY_KEY);
  return v ?? null;
}

export async function setSecondary(value: string): Promise<void> {
  await AsyncStorage.setItem(SECONDARY_KEY, value);
  cachedSecondary = value;
}

export function getCachedMode(): Mode | null { return cachedMode; }
export function getCachedSecondary(): string | null { return cachedSecondary; }
