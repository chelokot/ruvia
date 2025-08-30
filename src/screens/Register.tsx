import { View, Text, Pressable, TextInput, Animated, Easing, Image } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import LogoTitle from '@/components/LogoTitle';
import { Ionicons } from '@expo/vector-icons';

// Local image sets: 10 squares per row
const row1 = [
  require('../../../assets/register/row1/1.jpg'),
  require('../../../assets/register/row1/2.jpg'),
  require('../../../assets/register/row1/3.jpg'),
  require('../../../assets/register/row1/4.jpg'),
  require('../../../assets/register/row1/5.jpg'),
  require('../../../assets/register/row1/6.jpg'),
  require('../../../assets/register/row1/7.jpg'),
  require('../../../assets/register/row1/8.jpg'),
  require('../../../assets/register/row1/9.jpg'),
  require('../../../assets/register/row1/10.jpg'),
];

const row2 = [
  require('../../../assets/register/row2/11.jpg'),
  require('../../../assets/register/row2/12.jpg'),
  require('../../../assets/register/row2/13.jpg'),
  require('../../../assets/register/row2/14.jpg'),
  require('../../../assets/register/row2/15.jpg'),
  require('../../../assets/register/row2/16.jpg'),
  require('../../../assets/register/row2/17.jpg'),
  require('../../../assets/register/row2/18.jpg'),
  require('../../../assets/register/row2/19.jpg'),
  require('../../../assets/register/row2/20.jpg'),
];

const row3 = [
  require('../../../assets/register/row3/21.jpg'),
  require('../../../assets/register/row3/22.jpg'),
  require('../../../assets/register/row3/23.jpg'),
  require('../../../assets/register/row3/24.jpg'),
  require('../../../assets/register/row3/25.jpg'),
  require('../../../assets/register/row3/26.jpg'),
  require('../../../assets/register/row3/27.jpg'),
  require('../../../assets/register/row3/28.jpg'),
  require('../../../assets/register/row3/29.jpg'),
  require('../../../assets/register/row3/30.jpg'),
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
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (items === 0 || rowWidth === 0) return;
    const distance = rowWidth + gap; // include gap between duplicates
    const duration = Math.max(3000, Math.round((distance / speed) * 1000));

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
        <MarqueeRow direction="rtl" images={row1} itemSize={80} />
        <MarqueeRow direction="ltr" images={row2} itemSize={80} />
        <MarqueeRow direction="rtl" images={row3} itemSize={80} />
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
