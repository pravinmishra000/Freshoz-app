
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
           // This case can happen if the user record exists in Auth but not Firestore.
           // The registration/OTP confirmation logic should handle creating it.
           // For a consistent state, we set appUser to null if the DB record is missing.
           setAppUser(null);
           console.warn(`User with UID ${user.uid} exists in Firebase Auth, but not in Firestore.`);
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
    // This is a test flow bypass for the prototype using a specific OTP.
    if (confirmationResult.verificationId && otp === '123456') {
        const testUserCred = await confirmationResult.confirm(otp).catch(async (e) => {
            // This is a simplified test-only flow. In a real app, handle errors robustly.
             console.log("Attempting test confirmation as actual confirmation failed. This is expected for test numbers.");
             return null;
        });

        // If firebase confirmation worked, use that user. Otherwise, create a mock user for prototype.
        const user = testUserCred ? testUserCred.user : auth.currentUser;
        if (!user) throw new Error("Could not confirm OTP or get current user.");

        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            const role = sessionStorage.getItem('pendingUserRole') as UserRole || 'customer';
            const displayName = user.displayName || `User ${user.uid.substring(0, 5)}`;
            if (!user.displayName) await updateProfile(user, { displayName });

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
            setAppUser({ id: user.uid, ...newUser } as AppUser); // Update state immediately
            sessionStorage.removeItem('pendingUserRole');
        } else {
             setAppUser({ id: user.uid, ...userDoc.data() } as AppUser); // Also update state on login
        }
        setAuthUser(user); // Ensure authUser is set
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
    const firebaseUserWithProfile = { ...user, displayName: name };
    setAuthUser(firebaseUserWithProfile);
    setAppUser({ id: user.uid, ...newUser } as AppUser);
  };
  
  const signInWithEmail = async (email: string, password: string): Promise<void> => {
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
    recaptchaVerifier: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}
