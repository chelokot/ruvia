import { Stack } from "expo-router";
import Providers from "./providers";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";
import { Platform, StatusBar } from "react-native";
import "react-native-reanimated";

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === "web") {
      document.body.style.backgroundColor = "#000";
    }
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar barStyle="light-content" />
      <Providers />
    </GestureHandlerRootView>
  );
}
