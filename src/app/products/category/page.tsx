'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES } from '@/lib/data';
import { Loader2 } from 'lucide-react';

export default function ProductCategoryRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the first category by default
    if (CATEGORIES.length > 0) {
      router.replace(`/products/category/${CATEGORIES[0].slug}`);
    }
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading categories...</p>
      </div>
    </div>
  );
}
