
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
  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="space-y-3 pr-2">
            {categories.map((category) => {
            const isActive = category.slug === activeSlug;
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
                    <div className="relative aspect-square w-full mb-2">
                    <Image
                        src={category.image || 'https://picsum.photos/seed/placeholder/100/100'}
                        alt={category.name_en}
                        fill
                        className="object-contain rounded-md"
                    />
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
