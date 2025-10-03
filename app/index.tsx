import { Redirect } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import Register from "@/screens/Register";

export default function Index() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Redirect href="/(tabs)" />;
  return <Register />;
}

