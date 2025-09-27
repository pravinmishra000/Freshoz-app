
'use client';

import Link from 'next/link';
import type { Category } from '@/lib/types';

interface CategoryCardProps {
    category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
    return (
        <Link href={`/category/${category.slug}`} className="block">
            <div className="glass-card p-4 text-center h-full flex flex-col justify-center items-center">
                {/* Placeholder for an icon or image */}
                <div className="text-4xl mb-2">🛒</div>
                <h3 className="font-semibold text-foreground">{category.name_en}</h3>
            </div>
        </Link>
    );
}
