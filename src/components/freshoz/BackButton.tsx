
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
      className="glass-icon-button h-14 w-14"
    >
      <ChevronLeft className="h-7 w-7 text-primary" />
      <span className="sr-only">Go back</span>
    </Button>
  );
}
