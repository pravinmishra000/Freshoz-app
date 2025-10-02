
'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
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
           console.log("User document doesn't exist for new or existing auth user. This can happen on first login.");
           // This case is handled in confirmOtp and registerWithEmail
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

  const signInWithPhoneNumber = async (phone: string, role: UserRole, appVerifier: RecaptchaVerifier): Promise<ConfirmationResult> => {
    sessionStorage.setItem('pendingUserRole', role);
    return firebaseSignInWithPhoneNumber(auth, phone, appVerifier);
  };

  const confirmOtp = async (confirmationResult: ConfirmationResult, otp: string): Promise<void> => {
    // For prototype testing: if the number is the test number, bypass Firebase confirmation with a dummy OTP.
    if (confirmationResult.verificationId && confirmationResult.verificationId.startsWith('test-')) {
        console.log("Test confirmation detected. Simulating confirmation...");
        // In a real test setup, you might need to handle this differently.
        // For now, we proceed to user creation, assuming the OTP is correct.
        // The actual user object will be null, so we create it manually.
        const phone = sessionStorage.getItem('pendingTestPhone');
        if (!phone) throw new Error("Test phone number not found in session.");
        
        const pseudoUserId = `test_${phone.replace('+', '')}`;
        const user = { uid: pseudoUserId, phoneNumber: phone, displayName: `Test User ${pseudoUserId.slice(-4)}`, email: null, photoURL: null };

        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          const role = sessionStorage.getItem('pendingUserRole') as UserRole || 'customer';
          const newUser: Omit<AppUser, 'id'> = {
            email: user.email,
            phoneNumber: user.phoneNumber,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: role,
            createdAt: serverTimestamp(),
            addresses: [],
          };
          await setDoc(userDocRef, newUser);
          setAppUser({ id: user.uid, ...newUser } as AppUser);
        } else {
          setAppUser({ id: user.uid, ...userDoc.data() } as AppUser);
        }
        // This won't actually sign the user in with Firebase auth, but will set the app state
        setAuthUser(user as FirebaseUser);
        sessionStorage.removeItem('pendingTestPhone');
        sessionStorage.removeItem('pendingUserRole');
        return;
    }


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
    }
  };
  
  const registerWithEmail = async (email: string, password: string, name: string): Promise<void> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update Firebase Auth profile
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
    // Directly update the state to ensure UI consistency
    const firebaseUserWithProfile = { ...user, displayName: name };
    setAuthUser(firebaseUserWithProfile);
    setAppUser({ id: user.uid, ...newUser } as AppUser);
  };
  
  const signInWithEmail = async (email: string, password: string): Promise<void> => {
      await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
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
    recaptchaVerifier: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}
