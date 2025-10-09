
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
                    <div className="relative aspect-square w-full mb-2 flex items-center justify-center">
                    {category.image ? (
                        <Image
                            src={category.image}
                            alt={category.name_en}
                            fill
                            sizes="(max-width: 768px) 20vw, 10vw"
                            className="object-contain rounded-md"
                        />
                    ) : (
                        <span className="text-4xl">🛒</span>
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
