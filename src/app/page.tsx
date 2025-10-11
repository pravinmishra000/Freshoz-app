
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';
import { ChatWidget } from '@/components/chat/ChatWidget';


export default function HomePage() {
  const router = useRouter();
  const { authUser, loading } = useAuth();

  useEffect(() => {
    // We don't want to redirect until we are sure about the auth status.
    if (loading) {
      return;
    }

    // After the splash screen, redirect based on auth status.
    const timer = setTimeout(() => {
      if (authUser) {
        // If user is logged in, go directly to the products page.
        router.replace('/products');
      } else {
        // If user is not logged in, go to the pre-home/login page.
        router.replace('/pre-home');
      }
    }, 500); // A small delay can make the transition feel smoother.

    return () => clearTimeout(timer);
  }, [authUser, loading, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-80 to-orange-200">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-300 to-purple-400 backdrop-blur-md p-4 border-b border-purple-400">
        <h1 className="text-2xl font-black text-center uppercase relative">
          <span className="text-green-800 drop-shadow-[0_0_15px_rgba(34,197,94,0.8)] relative z-10">
            Freshoz
          </span>
        </h1>
      </header>

      {/* Main Content */}
      <main className="p-4">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome to Freshoz! 🎉
          </h2>
          <p className="text-gray-600 mb-8">
            Your quick commerce grocery store with 25-35 mins delivery
          </p>
          
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Get Started
            </h3>
            <p className="text-gray-600 text-sm">
              Use the chat widget in the bottom right to get help with orders, products, or delivery!
            </p>
          </div>
        </div>
      </main>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}
