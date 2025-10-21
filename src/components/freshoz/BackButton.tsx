
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    // Check if there is a history to go back to
    if (window.history.length > 1) {
      router.back();
    } else {
      // Fallback to a default route if no history
      router.push('/products');
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleBack}
      className="glass-icon-button h-12 w-12"
    >
      <ChevronLeft className="h-6 w-6 text-primary" />
      <span className="sr-only">Go back</span>
    </Button>
  );
}
