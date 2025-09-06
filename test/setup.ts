try {
  require('@testing-library/jest-native/extend-expect');
} catch {}
// Mock Expo vector icons to avoid native module issues in Jest
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));
// Ensure React Native Modal renders children in tests
jest.mock('react-native/Libraries/Modal/Modal', () => 'Modal');
