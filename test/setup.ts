try {
  require('@testing-library/jest-native/extend-expect');
} catch {}
// Mock Expo vector icons to avoid native module issues in Jest
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));
// Ensure React Native Modal renders children in tests
jest.mock('react-native/Libraries/Modal/Modal', () => 'Modal');
jest.mock('sentry-expo', () => ({
  init: jest.fn(),
  Native: {
    setUser: jest.fn(),
    addBreadcrumb: jest.fn(),
    withScope: (callback: (scope: any) => void) => {
      const scope = {
        setTag: jest.fn(),
        setExtra: jest.fn(),
        setContext: jest.fn(),
        setUser: jest.fn(),
      };
      callback(scope);
    },
    captureMessage: jest.fn(),
    captureException: jest.fn(),
  },
}));
jest.mock('expo-constants', () => ({ expoConfig: {} }));
