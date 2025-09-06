import { Slot } from "expo-router";
import { AuthProvider } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { initPrefs } from "@/lib/prefs";
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";

export default function Providers() {
  const [ready, setReady] = useState(false);
  const [fontsLoaded] = useFonts(Ionicons.font);
  useEffect(() => {
    (async () => {
      try { await initPrefs(); } catch {}
      setReady(true);
    })();
  }, []);

  if (!ready || !fontsLoaded) return null;

  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
