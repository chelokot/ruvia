import { View, Text, Pressable, TextInput, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import LogoTitle from '@/components/LogoTitle';
import { Ionicons } from '@expo/vector-icons';

function CarouselRow({ direction = 'left' as 'left' | 'right' }) {
  // Placeholder row using colored blocks
  const colors = ['#a78bfa', '#f59e0b', '#10b981', '#ef4444', '#3b82f6'];
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 8 }}
      style={{ transform: [{ scaleX: direction === 'left' ? 1 : -1 }] }}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <View key={i} style={{ transform: [{ scaleX: direction === 'left' ? 1 : -1 }] }}>
          <View style={{ width: 80, height: 60, borderRadius: 10, backgroundColor: colors[i % colors.length] }} />
        </View>
      ))}
    </ScrollView>
  );
}

export default function Register() {
  const { signupEmail, signinGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [error, setError] = useState<string | null>(null);

  async function handleEmail() {
    setError(null);
    try {
      if (mode === 'signup') await signupEmail(email, password);
      else await useAuth().signinEmail(email, password);
    } catch (e: any) {
      setError(e.message ?? 'Failed');
    }
  }

  async function handleGoogle() {
    setError(null);
    try {
      await signinGoogle();
    } catch (e: any) {
      setError(e.message ?? 'Failed');
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000', paddingTop: 80, paddingHorizontal: 16 }}>
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <LogoTitle />
        <Text style={{ color: '#bbb', marginTop: 8 }}>Welcome! Create AI profile pictures</Text>
      </View>
      <View style={{ gap: 8, marginBottom: 16 }}>
        <CarouselRow direction="left" />
        <CarouselRow direction="right" />
        <CarouselRow direction="left" />
      </View>

      <View style={{ gap: 12, marginTop: 16 }}>
        <Pressable
          accessibilityRole="button"
          onPress={handleGoogle}
          style={{ backgroundColor: '#111', borderColor: '#222', borderWidth: 1, padding: 14, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', gap: 8 }}
        >
          <Ionicons name="logo-google" size={18} color="#00e5ff" />
          <Text style={{ color: '#fff' }}>{mode === 'signup' ? 'Sign up' : 'Sign in'} with Google</Text>
        </Pressable>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: '#222' }} />
          <Text style={{ color: '#555' }}>or</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: '#222' }} />
        </View>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#666"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={{ backgroundColor: '#111', color: '#fff', padding: 12, borderRadius: 10, borderColor: '#222', borderWidth: 1 }}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#666"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={{ backgroundColor: '#111', color: '#fff', padding: 12, borderRadius: 10, borderColor: '#222', borderWidth: 1 }}
        />
        <Pressable
          accessibilityRole="button"
          onPress={handleEmail}
          style={{ backgroundColor: '#00e5ff', padding: 14, borderRadius: 12, alignItems: 'center' }}
        >
          <Text style={{ color: '#000', fontWeight: '700' }}>{mode === 'signup' ? 'Sign up' : 'Sign in'} with Email</Text>
        </Pressable>
        {error && <Text style={{ color: '#f43f5e' }}>{error}</Text>}
        <Pressable onPress={() => setMode(mode === 'signup' ? 'signin' : 'signup')}>
          <Text style={{ color: '#bbb', textAlign: 'center' }}>
            {mode === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

