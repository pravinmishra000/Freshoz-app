// /src/components/products/MobileCategorySelector.tsx
'use client';

import { useState } from 'react';
import { Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { CategorySidebar } from './CategorySidebar';

interface MobileCategorySelectorProps {
  categories: Category[];
  activeSlug?: string;
}

export function MobileCategorySelector({ categories, activeSlug }: MobileCategorySelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <Menu className="h-4 w-4 mr-2" />
          Categories
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Categories</h3>
          <CategorySidebar categories={categories} activeSlug={activeSlug} />
        </div>
      </SheetContent>
    </Sheet>
  );
}