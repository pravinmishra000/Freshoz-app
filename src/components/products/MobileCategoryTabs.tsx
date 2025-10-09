'use client';

import Link from 'next/link';
import { Category } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface MobileCategoryTabsProps {
  categories: Category[];
  activeSlug?: string;
}

export function MobileCategoryTabs({ categories, activeSlug }: MobileCategoryTabsProps) {
  // Hard-coded emoji mapping based on category IDs
  const getCategoryEmoji = (categoryId: string) => {
    const emojiMap: { [key: string]: string } = {
      'cat-1': '🥦', // Fresh Vegetables
      'cat-6': '🍎', // Fresh Fruits  
      'cat-2': '🥛', // Dairy & Bakery
      'cat-4': '🌾', // Staples & Grocery
      'cat-5': '🍗', // Non-Veg
      'cat-3': '☕',  // Beverages
    };
    
    return emojiMap[categoryId] || '🛒';
  };

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex space-x-2 pb-2">
        {categories.map((category) => {
          const isActive = category.slug === activeSlug;
          
          return (
            <Link
              key={category.id}
              href={`/products/category/${category.slug}`}
              className={cn(
                'inline-flex items-center px-3 py-2 rounded-full border text-xs font-medium transition-colors flex-shrink-0',
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-md'
                  : 'bg-background border-border hover:bg-accent'
              )}
            >
              <span className="mr-1 text-base">{getCategoryEmoji(category.id)}</span>
              <span className="max-w-[80px] truncate">{category.name_en}</span>
            </Link>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}