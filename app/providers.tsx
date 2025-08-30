import { Slot } from "expo-router";
import { AuthProvider } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { initPrefs } from "@/lib/prefs";

export default function Providers() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    (async () => {
      try { await initPrefs(); } catch {}
      setReady(true);
    })();
  }, []);

  if (!ready) return null;

  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
