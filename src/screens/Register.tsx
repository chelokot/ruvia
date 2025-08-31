import { View, Text, Pressable, TextInput, Animated, Easing, Image } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import LogoTitle from '@/components/LogoTitle';
import { Ionicons } from '@expo/vector-icons';

// Local image sets: 10 squares per row
const row1 = [
  require('../../assets/register/row1/img01.webp'),
  require('../../assets/register/row1/img02.webp'),
  require('../../assets/register/row1/img03.webp'),
  require('../../assets/register/row1/img04.webp'),
  require('../../assets/register/row1/img05.webp'),
  require('../../assets/register/row1/img06.webp'),
  require('../../assets/register/row1/img07.webp'),
  require('../../assets/register/row1/img08.webp'),
  require('../../assets/register/row1/img09.webp'),
  require('../../assets/register/row1/img10.webp'),
];

const row2 = [
  require('../../assets/register/row2/img01.webp'),
  require('../../assets/register/row2/img02.webp'),
  require('../../assets/register/row2/img03.webp'),
  require('../../assets/register/row2/img04.webp'),
  require('../../assets/register/row2/img05.webp'),
  require('../../assets/register/row2/img06.webp'),
  require('../../assets/register/row2/img07.webp'),
  require('../../assets/register/row2/img08.webp'),
  require('../../assets/register/row2/img09.webp'),
  require('../../assets/register/row2/img10.webp'),
];

const row3 = [
  require('../../assets/register/row3/img01.webp'),
  require('../../assets/register/row3/img02.webp'),
  require('../../assets/register/row3/img03.webp'),
  require('../../assets/register/row3/img04.webp'),
  require('../../assets/register/row3/img05.webp'),
  require('../../assets/register/row3/img06.webp'),
  require('../../assets/register/row3/img07.webp'),
  require('../../assets/register/row3/img08.webp'),
  require('../../assets/register/row3/img09.webp'),
  require('../../assets/register/row3/img10.webp'),
];

type MarqueeRowProps = {
  images: ImageSourcePropType[];
  direction?: 'rtl' | 'ltr';
  itemSize?: number; // square size in px
  gap?: number;
  speed?: number; // px per second
  borderRadius?: number;
};

function MarqueeRow({
  images,
  direction = 'rtl',
  itemSize = 80,
  gap = 8,
  speed = 40,
  borderRadius = 10,
}: MarqueeRowProps) {
  const items = images.length;
  const rowWidth = items > 0 ? items * itemSize + Math.max(0, items - 1) * gap : 0;

  const translateX = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (items === 0 || rowWidth === 0) return;
    const distance = rowWidth + gap; // include gap between duplicates
    const duration = Math.max(3000, Math.round((distance / speed) * 1000));

    const start = () => {
      translateX.stopAnimation();
      translateX.setValue(direction === 'rtl' ? 0 : -distance);
      const anim = Animated.timing(translateX, {
        toValue: direction === 'rtl' ? -distance : 0,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      });
      animRef.current = anim;
      anim.start(({ finished }) => {
        if (finished) start(); // seamless restart
      });
    };

    start();

    return () => {
      animRef.current?.stop?.();
    };
  }, [direction, gap, items, rowWidth, speed, translateX]);

  if (items === 0) return <View style={{ height: itemSize }} />;

  return (
    <View style={{ height: itemSize, overflow: 'hidden' }}>
      <Animated.View
        style={{
          flexDirection: 'row',
          gap,
          transform: [{ translateX }],
        }}
      >
        {[0, 1].map((dup) => (
          <View key={dup} style={{ flexDirection: 'row', gap }}>
            {images.map((src, i) => (
              <Image
                key={`${dup}-${i}`}
                source={src}
                style={{ width: itemSize, height: itemSize, borderRadius }}
                resizeMode="cover"
              />
            ))}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

export default function Register() {
  const router = useRouter();
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
      <View style={{ alignItems: 'center', marginBottom: 36 }}>
        <LogoTitle />
        <Text style={{ color: '#bbb', marginTop: 8 }}>Welcome! Get ready for your AI profile pictures</Text>
      </View>
      <View style={{ gap: 8, marginBottom: 24 }}>
        <MarqueeRow direction="rtl" images={row1} itemSize={90} speed={48} />
        <MarqueeRow direction="ltr" images={row2} itemSize={90} speed={52} />
        <MarqueeRow direction="rtl" images={row3} itemSize={90} speed={50} />
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
          <Text style={{ color: '#00e5ff', textAlign: 'center', textDecorationLine: 'underline' }}>
            {mode === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </Text>
        </Pressable>

        <View style={{ alignItems: 'center', marginTop: 12 }}>
          <Text style={{ color: '#666', fontSize: 12 }}>
            By continuing you agree to our
            {' '}
            <Text style={{ color: '#00e5ff', textDecorationLine: 'underline' }} onPress={() => router.push('/terms')}>Terms of Use</Text>
            {' '}and{' '}
            <Text style={{ color: '#00e5ff', textDecorationLine: 'underline' }} onPress={() => router.push('/privacy')}>Privacy Policy</Text>
            .
          </Text>
        </View>
      </View>
    </View>
  );
}
