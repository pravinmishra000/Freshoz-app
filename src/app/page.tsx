
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // After the splash screen (which is in layout.tsx), redirect to the pre-home page.
    // A timeout can make the transition feel smoother if the splash screen is very fast.
    const timer = setTimeout(() => {
      router.replace('/pre-home');
    }, 500); // Adjust delay as needed, or remove if splash is long enough

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading Freshoz...</p>
      </div>
    </div>
  );
}
