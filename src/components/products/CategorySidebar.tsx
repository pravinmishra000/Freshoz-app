
'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Category } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CategorySidebarProps {
  categories: Category[];
  activeSlug?: string;
}

export function CategorySidebar({ categories, activeSlug }: CategorySidebarProps) {
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
    <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="space-y-3 pr-2">
            {categories.map((category) => {
            const isActive = category.slug === activeSlug;
            // Robust check for a valid Firebase Storage image URL
            const hasRealImage = category.image && category.image.includes('firebasestorage.googleapis.com');
            
            return (
                <Link
                key={category.id}
                href={`/products/category/${category.slug}`}
                className="block"
                >
                <Card
                    className={cn(
                    'glass-card p-2 text-center transition-all duration-300 transform hover:scale-105',
                    isActive
                        ? 'border-primary/50 border-2 bg-primary/10 shadow-lg'
                        : 'border-transparent'
                    )}
                >
                    <div className="relative aspect-square w-full mb-2 flex items-center justify-center">
                    {hasRealImage ? (
                        <Image
                            src={category.image!}
                            alt={category.name_en}
                            fill
                            sizes="(max-width: 768px) 20vw, 10vw"
                            className="object-contain rounded-md"
                        />
                    ) : (
                        <span className="text-4xl">
                          {getCategoryEmoji(category.id)}
                        </span>
                    )}
                    </div>
                    <p className={cn(
                        'text-xs font-semibold',
                        isActive ? 'text-primary' : 'text-muted-foreground'
                    )}>
                    {category.name_en}
                    </p>
                </Card>
                </Link>
            );
            })}
        </div>
    </ScrollArea>
  );
}
