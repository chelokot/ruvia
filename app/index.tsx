import { Redirect } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import Register from "@/screens/Register";

export default function Index() {
  const { user } = useAuth();
  if (user) return <Redirect href="/(tabs)" />;
  return <Register />;
}

