// Metro configuration with a shim for expo-in-app-purchases while preserving
// Expo's default Metro settings (required for expo-router, assets, etc.).
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver = config.resolver || {};
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  'expo-in-app-purchases': path.resolve(__dirname, 'shims/expo-in-app-purchases'),
};

module.exports = config;
