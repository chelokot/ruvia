import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithPopup, signInWithCredential, GoogleAuthProvider, User } from 'firebase/auth';
import { auth, db, googleProvider } from '@/lib/firebase';
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { ensureSession, getSessionCredits } from '@/lib/api';
import * as WebBrowser from 'expo-web-browser';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
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
GoogleSignin.configure({
  webClientId: "199411765365-rva49rmlkka0drkcs2cfco24dmo741i3.apps.googleusercontent.com",
  offlineAccess: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const token = await u.getIdToken();
          await ensureSession(token);
          // Proactively reflect server-side initial credits for brand new users
          if (!userDoc) {
            const credits = await getSessionCredits(token);
            setUserDoc((prev) => prev ?? { credits, generationCount: 0, name: u.displayName ?? undefined });
          }
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
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const token = await cred.user.getIdToken();
    await ensureSession(token);
  }

  async function signinEmail(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const token = await cred.user.getIdToken();
    await ensureSession(token);
  }

  async function signinGoogle() {
    if (Platform.OS === 'web') {
      const cred = await signInWithPopup(auth, googleProvider);
      const token = await cred.user.getIdToken();
      await ensureSession(token);
      return;
    }

    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    const userInfo = await GoogleSignin.signIn()
    if (userInfo.type == 'cancelled') {
      throw new Error('Google sign-in cancelled');
    }
    const googleCred = GoogleAuthProvider.credential(userInfo.data.idToken);
    const cred = await signInWithCredential(auth, googleCred);
    const token = await cred.user.getIdToken();
    await ensureSession(token);
  }

  async function logout() {
    try { await GoogleSignin.signOut(); } catch { }
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
