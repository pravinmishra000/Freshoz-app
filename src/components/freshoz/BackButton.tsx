
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export function BackButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      onClick={() => router.back()}
      className="glass-card rounded-2xl border-2 border-white/40 text-white p-3 hover:bg-white/20 transition-all duration-300"
    >
      <ChevronLeft className="w-5 h-5" />
    </Button>
  );
}
