import AsyncStorage from '@react-native-async-storage/async-storage';
import { initPrefs, getCachedMode, getCachedSecondary, setMode, setSecondary } from '@/lib/prefs';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => {}),
  },
}));

describe('prefs', () => {
  it('initializes cached values with defaults', async () => {
    await initPrefs();
    expect(getCachedMode()).toBe('single');
    expect(getCachedSecondary()).toBe('female');
  });

  it('sets and updates cached values', async () => {
    await setMode('dual');
    await setSecondary('male');
    expect(getCachedMode()).toBe('dual');
    expect(getCachedSecondary()).toBe('male');
  });
});

