'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithPhoneNumber as firebaseSignInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './client';
import type { User as AppUser, UserRole } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  authUser: FirebaseUser | null;
  appUser: AppUser | null;
  loading: boolean;
  signInWithPhoneNumber: (phone: string, role: UserRole) => Promise<ConfirmationResult>;
  confirmOtp: (confirmationResult: ConfirmationResult, otp: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setAuthUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setAppUser({ id: user.uid, ...userDoc.data() } as AppUser);
        } else {
           console.log("User document doesn't exist for new or existing auth user.");
           setAppUser(null);
        }
      } else {
        setAuthUser(null);
        setAppUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setupRecaptcha = () => {
    if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response: any) => {
          // reCAPTCHA solved, you can now send OTP
        },
        'expired-callback': () => {
          // Response expired. Ask user to solve reCAPTCHA again.
        },
      });
    }
  };

  const signInWithPhoneNumber = async (phone: string, role: UserRole): Promise<ConfirmationResult> => {
    setupRecaptcha();
    const appVerifier = window.recaptchaVerifier;
    // Store role temporarily to associate it after OTP confirmation
    sessionStorage.setItem('pendingUserRole', role);
    return firebaseSignInWithPhoneNumber(auth, phone, appVerifier);
  };

  const confirmOtp = async (confirmationResult: ConfirmationResult, otp: string): Promise<void> => {
    const userCredential = await confirmationResult.confirm(otp);
    const user = userCredential.user;
    
    // Check if user document already exists
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // New user, create their document in Firestore
      const role = sessionStorage.getItem('pendingUserRole') as UserRole || 'customer';
      
      const newUser: Omit<AppUser, 'id'> = {
        email: user.email, // phone auth users might not have email
        phoneNumber: user.phoneNumber,
        displayName: user.displayName || `User ${user.uid.substring(0,5)}`,
        photoURL: user.photoURL,
        role: role,
        createdAt: serverTimestamp(),
      };
      
      await setDoc(userDocRef, newUser);
      setAppUser({ id: user.uid, ...newUser } as AppUser);
      
      // Cleanup session storage
      sessionStorage.removeItem('pendingUserRole');
    }
    // If user exists, their data is loaded by onAuthStateChanged
  };

  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const value = {
    authUser,
    appUser,
    loading,
    signInWithPhoneNumber,
    confirmOtp,
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

// Extend window type for recaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}
