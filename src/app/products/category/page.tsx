'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ProductCategoryRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // This page is a redirector. The new page for all categories is /categories.
    // This will redirect /products/category to /categories.
    router.replace(`/categories`);
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
