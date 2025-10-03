
'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
  useCallback,
} from 'react';
import {
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithPhoneNumber as firebaseSignInWithPhoneNumber,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  ConfirmationResult,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, Unsubscribe } from 'firebase/firestore';
import { auth, db } from './client';
import type { User as AppUser, UserRole } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  authUser: FirebaseUser | null;
  appUser: AppUser | null;
  setAppUser: Dispatch<SetStateAction<AppUser | null>>;
  loading: boolean;
  signInWithPhoneNumber: (phone: string, role: UserRole, appVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  confirmOtp: (confirmationResult: ConfirmationResult, otp: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchAppUser = useCallback(async (user: FirebaseUser) => {
    console.log("📡 fetchAppUser called with user:", user.uid);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log("✅ Firestore user data found:", data);
        setAppUser({ id: user.uid, ...data } as AppUser);
      } else {
        console.warn("⚠️ Firestore doc not found for user:", user.uid);
        // This case might happen for a newly registered user before the doc is created
        // We will handle doc creation during registration/OTP confirmation
        setAppUser(null);
      }
    } catch (error) {
      console.error("🔥 Firestore fetch error:", error);
      setAppUser(null);
    }
  }, []);

  useEffect(() => {
    console.log("🚀 Setting up onAuthStateChanged listener...");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      console.log("🔥 onAuthStateChanged triggered:", user?.uid || "null user");
      
      if (user) {
        setAuthUser(user);
        await fetchAppUser(user);
      } else {
        setAuthUser(null);
        setAppUser(null);
      }
      
      setLoading(false);
    });

    return () => {
      console.log("🛑 Cleaning up onAuthStateChanged listener...");
      unsubscribe();
    };
  }, [fetchAppUser]);

  const signInWithPhoneNumber = async (phone: string, role: UserRole, appVerifier: RecaptchaVerifier): Promise<ConfirmationResult> => {
    console.log("📲 signInWithPhoneNumber called with:", phone, "role:", role);
    sessionStorage.setItem('pendingUserRole', role);
    return firebaseSignInWithPhoneNumber(auth, phone, appVerifier);
  };

  const confirmOtp = async (confirmationResult: ConfirmationResult, otp: string): Promise<void> => {
    console.log("🔐 confirmOtp called with OTP:", otp);
    const userCredential = await confirmationResult.confirm(otp);
    const user = userCredential.user;
    setAuthUser(user);
    console.log("✅ OTP confirmed. Firebase User:", user.uid);

    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.log("🆕 New user. Creating Firestore doc...");
      const role = (sessionStorage.getItem('pendingUserRole') as UserRole) || 'customer';
      const displayName = user.displayName || `User ${user.uid.substring(0, 5)}`;

      if (!user.displayName) {
        await updateProfile(user, { displayName });
      }

      const newUser: Omit<AppUser, 'id'> = {
        email: user.email,
        phoneNumber: user.phoneNumber,
        displayName: displayName,
        photoURL: user.photoURL,
        role: role,
        createdAt: serverTimestamp(),
        addresses: [],
      };

      await setDoc(userDocRef, newUser);
      setAppUser({ id: user.uid, ...newUser } as AppUser);
      sessionStorage.removeItem('pendingUserRole');
    } else {
      console.log("📄 Existing Firestore user found.");
      setAppUser({ id: user.uid, ...userDoc.data() } as AppUser);
    }
  };

  const registerWithEmail = async (email: string, password: string, name: string): Promise<void> => {
    console.log("✉️ registerWithEmail called with:", email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    setAuthUser(user);

    await updateProfile(user, { displayName: name });

    const newUser: Omit<AppUser, 'id'> = {
      displayName: name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      photoURL: user.photoURL,
      role: 'customer',
      createdAt: serverTimestamp(),
      addresses: [],
    };

    await setDoc(doc(db, 'users', user.uid), newUser);
    setAppUser({ id: user.uid, ...newUser } as AppUser);
    console.log("✅ User registered and Firestore doc created.");
  };

  const signInWithEmail = async (email: string, password: string): Promise<void> => {
    console.log("🔑 signInWithEmail called with:", email);
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will handle setting the user state
  };

  const logout = async () => {
    console.log("🚪 Logging out...");
    await signOut(auth);
    setAuthUser(null);
    setAppUser(null);
    router.push('/login');
  };

  const value = {
    authUser,
    appUser,
    setAppUser,
    loading,
    signInWithPhoneNumber,
    confirmOtp,
    registerWithEmail,
    signInWithEmail,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}
