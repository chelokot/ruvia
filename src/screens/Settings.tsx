import { View, Text, Pressable, Alert, Linking } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';

export default function Settings() {
  const router = useRouter();
  const { logout, user } = useAuth();
  return (
    <View style={{ flex: 1, backgroundColor: '#000', paddingTop: 56, paddingHorizontal: 16, gap: 12 }}>
      <View style={{ alignItems: 'center', marginBottom: 8, marginTop: 4 }}>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{user?.displayName ?? 'Account'}</Text>
        <Text style={{ color: '#bbb', marginTop: 2 }}>{user?.email ?? ''}</Text>
      </View>
      <Pressable onPress={() => router.push('/terms')} style={{ backgroundColor: '#111', padding: 14, borderRadius: 12, borderColor: '#222', borderWidth: 1 }}>
        <Text style={{ color: '#fff' }}>Terms of Use</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/privacy')} style={{ backgroundColor: '#111', padding: 14, borderRadius: 12, borderColor: '#222', borderWidth: 1 }}>
        <Text style={{ color: '#fff' }}>Privacy Policy</Text>
      </Pressable>
      <Pressable onPress={() => logout()} style={{ backgroundColor: '#111', padding: 14, borderRadius: 12, borderColor: '#222', borderWidth: 1, marginTop: 16 }}>
        <Text style={{ color: '#fff' }}>Log out</Text>
      </Pressable>
      <Pressable onPress={() => Alert.alert('Delete account', 'Please contact support to delete your account.')} style={{ backgroundColor: '#111', padding: 14, borderRadius: 12, borderColor: '#222', borderWidth: 1 }}>
        <Text style={{ color: '#f43f5e' }}>Remove account</Text>
      </Pressable>
    </View>
  );
}
