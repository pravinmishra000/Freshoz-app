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
import { auth, db } from "@/lib/firebase/client";
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

// ✅ NEW: Recaptcha Site Key को environment से load करें
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

// Global Window Declaration for Recaptcha and ConfirmationResult
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult; // हालांकि इसे use नहीं किया जा रहा है, इसे यहाँ रहने दें
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

// ----------------------------------------------------
// ✅ RECAPTCHA INITIALIZATION LOGIC (FULLY FIXED)
// ----------------------------------------------------
useEffect(() => {
    // केवल क्लाइंट साइड पर चलाएँ और सुनिश्चित करें कि Site Key उपलब्ध है
    if (typeof window === 'undefined' || !RECAPTCHA_SITE_KEY) return;
  
    const containerId = 'recaptcha-container';
    const recaptchaContainer = document.getElementById(containerId);
  
    // यदि पहले से initialized है, या कंटेनर HTML में मौजूद नहीं है, तो कुछ न करें।
    if ((window as any).recaptchaVerifier || !recaptchaContainer) {
      return;
    }
  
    try {
      // ✅ Correct argument order: (containerId, config, auth)
      const verifier = new RecaptchaVerifier(
        containerId,
        {
          size: 'invisible',
          sitekey: RECAPTCHA_SITE_KEY,
          callback: () => {
            console.log("✅ reCAPTCHA solved in context!");
          },
          'expired-callback': () => {
            console.warn("⚠️ reCAPTCHA expired. Re-rendering...");
            const v = (window as any).recaptchaVerifier;
            if (v) v.render().catch(console.error);
          },
        },
        auth // ✅ Pass auth as 3rd argument (not 1st)
      );
  
      verifier
        .render()
        .then(() => {
          (window as any).recaptchaVerifier = verifier;
          console.log("✅ Recaptcha Verifier initialized successfully.");
        })
        .catch((error: any) => {
          if (!error.message.includes("already been rendered")) {
            console.error("❌ Recaptcha render failed:", error);
          }
        });
  
    } catch (error) {
      console.error("❌ Recaptcha Initialization Failed:", error);
    }
  
    // Cleanup logic
    return () => {
      const v = (window as any).recaptchaVerifier;
      if (v) {
        try {
          console.log("🧹 Clearing reCAPTCHA verifier...");
          v.clear();
          (window as any).recaptchaVerifier = undefined;
        } catch (err) {
          console.warn("⚠️ Failed to clear reCAPTCHA verifier:", err);
        }
      }
    };
  }, []);  
  
  // ----------------------------------------------------

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
    
    // window.recaptchaVerifier का उपयोग करें
    const verifier = window.recaptchaVerifier; 
    
    if (!verifier) {
        console.error("Recaptcha Verifier not initialized. Throwing error.");
        throw new Error("Security verification failed. Please refresh the page.");
    }
    
    sessionStorage.setItem('pendingUserRole', role);
    
    try {
        const confirmation = await firebaseSignInWithPhoneNumber(auth, phone, verifier);
        return confirmation;
    } catch (error) {
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
        email: user.email || null, // email can be null for phone users
        phoneNumber: user.phoneNumber || null,
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
      phoneNumber: user.phoneNumber || null,
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
