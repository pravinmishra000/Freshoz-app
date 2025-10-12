
// /home/user/studio/src/lib/firebase/auth-context.tsx

'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
  useCallback,
} from 'react';
import {
  onAuthStateChanged,
  type User as FirebaseUser,
  signInWithPhoneNumber as firebaseSignInWithPhoneNumber,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  type ConfirmationResult,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from "./client"; // Corrected Path
import type { User as AppUser, UserRole } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  authUser: FirebaseUser | null;
  appUser: AppUser | null;
  setAppUser: Dispatch<SetStateAction<AppUser | null>>;
  loading: boolean;
  signInWithPhoneNumber: (phone: string, role: UserRole) => Promise<ConfirmationResult>;
  confirmOtp: (confirmationResult: ConfirmationResult, otp: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

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
        setAppUser(null);
      }
    } catch (error) {
      console.error("🔥 Firestore fetch error:", error);
      setAppUser(null);
    }
  }, []);

   useEffect(() => {
    if (typeof window === 'undefined') return;

    // Ensure auth is initialized before setting up reCAPTCHA
    if (!auth) {
        console.warn("Auth not initialized, delaying reCAPTCHA setup.");
        return;
    }

    const containerId = 'recaptcha-container';
    let recaptchaContainer = document.getElementById(containerId);

    // If container doesn't exist, create it.
    if (!recaptchaContainer) {
        recaptchaContainer = document.createElement('div');
        recaptchaContainer.id = containerId;
        document.body.appendChild(recaptchaContainer);
    }

    // Initialize reCAPTCHA only if it hasn't been initialized yet.
    if (!window.recaptchaVerifier) {
        try {
            console.log("🔄 Setting up new Recaptcha Verifier...");
            window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
                'size': 'invisible',
                'callback': () => {
                    console.log("✅ reCAPTCHA solved!");
                },
                'expired-callback': () => {
                    console.warn("⚠️ reCAPTCHA expired, re-initializing...");
                    // Clear and re-initialize
                    window.recaptchaVerifier?.clear();
                    window.recaptchaVerifier = undefined;
                    // Optionally re-trigger initialization
                }
            });
            window.recaptchaVerifier.render(); // Explicitly render the verifier
            console.log("✅ Recaptcha Verifier setup and rendered.");
        } catch (error) {
            console.error("❌ Recaptcha Setup Failed:", error);
        }
    } else {
        console.log("✅ Recaptcha already initialized.");
    }
    
    // No cleanup needed that would destroy the verifier on every navigation
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

  const signInWithPhoneNumber = async (phone: string, role: UserRole): Promise<ConfirmationResult> => {
    console.log("📲 signInWithPhoneNumber called with:", phone, "role:", role);
    
    const verifier = window.recaptchaVerifier; 
    
    if (!verifier) {
        console.error("Recaptcha Verifier not initialized. Throwing error.");
        throw new Error("Security verification is not ready. Please refresh and try again.");
    }
    
    sessionStorage.setItem('pendingUserRole', role);
    
    try {
        const confirmation = await firebaseSignInWithPhoneNumber(auth, phone, verifier);
        return confirmation;
    } catch (error) {
        // If there's an error, try to reset the verifier for the next attempt.
        window.recaptchaVerifier?.render().catch(err => console.error("Failed to re-render reCAPTCHA", err));
        throw error;
    }
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
        email: user.email || null,
        phoneNumber: user.phoneNumber || null,
        displayName: displayName,
        photoURL: user.photoURL || null,
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
      phoneNumber: user.phoneNumber || null,
      photoURL: user.photoURL || null,
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
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
        if (error.code === 'auth/network-request-failed' || error.message.includes('403')) {
            console.error("🚨 CRITICAL: Firebase authentication failed with 403 Forbidden. This is likely an API Key restriction issue. Check your Google Cloud Console settings for your API key and ensure your app's domain is in the allowed HTTP referrers list.");
        }
        // Re-throw the error so the UI can handle it
        throw error;
    }
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
