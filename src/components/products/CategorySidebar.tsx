
'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Category } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface CategorySidebarProps {
  categories: Category[];
  activeSlug?: string;
}

export function CategorySidebar({ categories, activeSlug }: CategorySidebarProps) {
  return (
    <Card className="glass-card p-4 sticky top-24">
      <h2 className="text-lg font-semibold mb-4 text-primary font-headline">Categories</h2>
      <nav className="space-y-2">
        {categories.map((category) => {
          const isActive = category.slug === activeSlug;
          return (
            <Link
              key={category.id}
              href={`/products/category/${category.slug}`}
              className={cn(
                'flex items-center gap-3 rounded-lg p-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/90 text-primary-foreground shadow-md'
                  : 'text-foreground hover:bg-primary/10'
              )}
            >
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-white p-1">
                <Image
                    src={category.image || 'https://picsum.photos/seed/placeholder/100/100'}
                    alt={category.name_en}
                    fill
                    className="object-contain"
                />
              </div>
              <span>{category.name_en}</span>
            </Link>
          );
        })}
      </nav>
    </Card>
  );
}
