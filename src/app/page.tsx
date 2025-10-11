
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';

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
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading Freshoz...</p>
      </div>
    </div>
  );
}
