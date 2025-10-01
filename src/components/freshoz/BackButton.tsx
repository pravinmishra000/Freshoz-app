
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export function BackButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => router.back()}
      className="glass-card rounded-full border-primary/20 text-primary hover:bg-primary/10 transition-all duration-300"
    >
      <ChevronLeft className="h-6 w-6" />
      <span className="sr-only">Go back</span>
    </Button>
  );
}
