import { View, Text, Pressable, Alert, Linking } from 'react-native';
import { useAuth } from '@/hooks/useAuth';

export default function Settings() {
  const { logout } = useAuth();
  return (
    <View style={{ flex: 1, backgroundColor: '#000', paddingTop: 56, paddingHorizontal: 16, gap: 12 }}>
      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>Settings</Text>
      <Pressable onPress={() => Linking.openURL('#')} style={{ backgroundColor: '#111', padding: 14, borderRadius: 12, borderColor: '#222', borderWidth: 1 }}>
        <Text style={{ color: '#fff' }}>Privacy Policy</Text>
      </Pressable>
      <Pressable onPress={() => logout()} style={{ backgroundColor: '#111', padding: 14, borderRadius: 12, borderColor: '#222', borderWidth: 1 }}>
        <Text style={{ color: '#fff' }}>Log out</Text>
      </Pressable>
      <Pressable onPress={() => Alert.alert('Delete account', 'Please contact support to delete your account.')} style={{ backgroundColor: '#111', padding: 14, borderRadius: 12, borderColor: '#222', borderWidth: 1 }}>
        <Text style={{ color: '#f43f5e' }}>Remove account</Text>
      </Pressable>
    </View>
  );
}

