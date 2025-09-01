import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithPopup, signInWithCredential, GoogleAuthProvider, User } from 'firebase/auth';
import { auth, db, googleProvider } from '@/lib/firebase';
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { ensureSession } from '@/lib/api';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Platform } from 'react-native';

type UserDoc = {
  credits: number;
  generationCount: number;
  name?: string;
  createdAt?: any;
};

type AuthContextValue = {
  user: User | null;
  userDoc: UserDoc | null;
  loading: boolean;
  signupEmail: (email: string, password: string) => Promise<void>;
  signinEmail: (email: string, password: string) => Promise<void>;
  signinGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUserDoc: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

WebBrowser.maybeCompleteAuthSession();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const token = await u.getIdToken();
          await ensureSession(token);
        } catch {}
        const ref = doc(db, 'users', u.uid);
        const off = onSnapshot(ref, (snap) => {
          if (snap.exists()) setUserDoc(snap.data() as UserDoc);
        });
        return () => off();
      } else {
        setUserDoc(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function refreshUserDoc() {
    // no-op; Firestore subscription keeps userDoc fresh
  }

  async function signupEmail(email: string, password: string) {
    await createUserWithEmailAndPassword(auth, email, password);
  }

  async function signinEmail(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signinGoogle() {
    if (Platform.OS === 'web') {
      await signInWithPopup(auth, googleProvider);
      return;
    }
    // Native via AuthSession
    const res = await promptAsync();
    if (res?.type === 'success' && res.authentication?.idToken) {
      const credential = GoogleAuthProvider.credential(res.authentication.idToken);
      await signInWithCredential(auth, credential);
    } else {
      throw new Error('Google sign-in cancelled');
    }
  }

  async function logout() {
    await signOut(auth);
  }

  const value = useMemo(() => ({ user, userDoc, loading, signupEmail, signinEmail, signinGoogle, logout, refreshUserDoc }), [user, userDoc, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
