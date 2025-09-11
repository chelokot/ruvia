// metro.config.js
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { resolve } = require("path");
const { resolve: metroResolve } = require("metro-resolver");

const config = getDefaultConfig(__dirname);

// Do NOT alias 'react-native' to 'react-native-web'. Expo handles web.
// Only add a web-only resolver for native-only libraries and a couple of stubborn deep imports.
const baseResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (ctx, moduleName, platform) => {
  if (platform === "web") {
    // Web stubs for native-only libs
    if (moduleName === "react-native-iap") {
      return {
        type: "sourceFile",
        filePath: resolve(__dirname, "stubs/react-native-iap.web.js"),
      };
    }
    if (moduleName === "react-native-purchases") {
      return {
        type: "sourceFile",
        filePath: resolve(__dirname, "stubs/react-native-purchases.web.js"),
      };
    }

    // Rewrite a few deep RN imports some packages still do
    if (moduleName.startsWith("react-native/Libraries/")) {
      const map = {
        "react-native/Libraries/Utilities/Platform": require.resolve(
          "react-native-web/dist/exports/Platform",
        ),
        "react-native/Libraries/StyleSheet/processColor": require.resolve(
          "react-native-web/dist/modules/processColor",
        ),
        "react-native/Libraries/StyleSheet/colorString": require.resolve(
          "react-native-web/dist/vendor/react-native/normalizeColor",
        ),
      };
      if (map[moduleName]) {
        return { type: "sourceFile", filePath: map[moduleName] };
      }
    }
  }

  if (baseResolveRequest) return baseResolveRequest(ctx, moduleName, platform);
  return metroResolve(ctx, moduleName, platform);
};

config.resolver.unstable_enablePackageExports = true;

module.exports = config;
