import { Slot } from "expo-router";
import { AuthProvider } from "@/hooks/useAuth";

export default function Providers() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}

