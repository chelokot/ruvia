// Expo Metro config with an explicit web alias for react-native
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver = config.resolver || {};
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  'react-native': path.resolve(__dirname, 'node_modules/react-native-web'),
};

module.exports = config;
