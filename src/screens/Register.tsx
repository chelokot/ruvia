import { View, Text, Pressable, TextInput, Animated, Easing } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import LogoTitle from '@/components/LogoTitle';
import { Ionicons } from '@expo/vector-icons';

function MarqueeRow({ direction = 'rtl' as 'rtl' | 'ltr' }) {
  // Placeholder blocks (replace with images later if needed)
  const colors = useMemo(() => ['#a78bfa', '#f59e0b', '#10b981', '#ef4444', '#3b82f6'], []);
  const items = 12;
  const itemWidth = 80;
  const gap = 8;
  const rowWidth = items * itemWidth + (items - 1) * gap;

  const translateX = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    // Compute duration to keep constant speed (px/sec)
    const speed = 40; // px per second
    const distance = rowWidth + gap; // account for spacing between duplicates
    const duration = Math.max(3000, Math.round((distance / speed) * 1000));

    // Reset starting position per direction
    translateX.stopAnimation();
    translateX.setValue(direction === 'rtl' ? 0 : -distance);

    const anim = Animated.loop(
      Animated.timing(translateX, {
        toValue: direction === 'rtl' ? -distance : 0,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loopRef.current = anim;
    anim.start();

    return () => {
      loopRef.current?.stop?.();
    };
  }, [direction, rowWidth, translateX]);

  return (
    <View style={{ height: 60, overflow: 'hidden' }}>
      <Animated.View
        style={{
          flexDirection: 'row',
          gap,
          transform: [{ translateX }],
        }}
      >
        {/* duplicate content twice for seamless loop */}
        {[0, 1].map((dup) => (
          <View key={dup} style={{ flexDirection: 'row', gap }}>
            {Array.from({ length: items }).map((_, i) => (
              <View key={`${dup}-${i}`}>
                <View
                  style={{
                    width: itemWidth,
                    height: 60,
                    borderRadius: 10,
                    backgroundColor: colors[i % colors.length],
                  }}
                />
              </View>
            ))}
          </View>
        ))}
      </Animated.View>
    </View>
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
        <MarqueeRow direction="rtl" />
        <MarqueeRow direction="ltr" />
        <MarqueeRow direction="rtl" />
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
