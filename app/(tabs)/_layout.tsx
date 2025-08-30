import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#000", borderTopWidth: 0, paddingTop: 8, paddingBottom: 8 },
        tabBarActiveTintColor: "#00e5ff",
        tabBarInactiveTintColor: "#999",
        tabBarItemStyle: { paddingTop: 4, paddingBottom: 2 },
        tabBarLabelStyle: { marginTop: 6 },
        tabBarIconStyle: { marginTop: 6, marginBottom: 6 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Profile Pictures",
          tabBarIcon: ({ color }) => (
            <Ionicons name="images-outline" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="image-editing"
        options={{
          title: "Image Editing",
          tabBarIcon: ({ color }) => (
            <Ionicons name="color-wand-outline" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings-outline" size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
