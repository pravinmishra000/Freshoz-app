
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
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
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

  const fetchAppUser = useCallback(async (user: FirebaseUser | null) => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setAppUser({ id: user.uid, ...userDoc.data() } as AppUser);
      } else {
        // This can happen if user exists in Auth but not Firestore (e.g., during registration)
        // The registration functions should handle creating this doc.
        setAppUser(null);
      }
    } else {
      setAppUser(null);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setAuthUser(user);
      await fetchAppUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchAppUser]);
  
  const signInWithPhoneNumber = async (phone: string, role: UserRole, appVerifier: RecaptchaVerifier): Promise<ConfirmationResult> => {
    sessionStorage.setItem('pendingUserRole', role);
    return firebaseSignInWithPhoneNumber(auth, phone, appVerifier);
  };

  const confirmOtp = async (confirmationResult: ConfirmationResult, otp: string): Promise<void> => {
    const userCredential = await confirmationResult.confirm(otp);
    const user = userCredential.user;
    
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const role = sessionStorage.getItem('pendingUserRole') as UserRole || 'customer';
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
       setAppUser({ id: user.uid, ...userDoc.data() } as AppUser);
    }
     setAuthUser(user);
  };
  
  const registerWithEmail = async (email: string, password: string, name: string): Promise<void> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
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
    // After successful registration, explicitly set the auth and app user states
    setAuthUser(user);
    setAppUser({ id: user.uid, ...newUser } as AppUser);
  };
  
  const signInWithEmail = async (email: string, password: string): Promise<void> => {
      // onAuthStateChanged will handle the state update after this succeeds
      await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
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
