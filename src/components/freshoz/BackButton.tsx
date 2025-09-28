
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useState, useEffect } from 'react';

export function BackButton() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
        <div className="glass-card rounded-2xl border-2 border-primary/20 p-3 h-10 w-10">
            <ChevronLeft className="w-5 h-5 text-primary/50" />
        </div>
    );
  }

  return (
    <Button
      variant="ghost"
      onClick={() => router.back()}
      className="glass-card rounded-2xl border-2 border-primary/20 text-primary p-3 hover:bg-primary/10 transition-all duration-300"
    >
      <ChevronLeft className="w-5 h-5" />
    </Button>
  );
}
