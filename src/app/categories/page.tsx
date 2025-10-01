
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CATEGORIES } from '@/lib/data';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/types';

const categoryStyles: { [key: string]: { emoji: string; color: string } } = {
  'fresh-vegetables': { emoji: '🥦', color: 'bg-green-100' },
  'fresh-fruits': { emoji: '🍎', color: 'bg-red-100' },
  'dairy-bakery': { emoji: '🥛', color: 'bg-blue-100' },
  'staples-grocery': { emoji: '🛍️', color: 'bg-yellow-100' },
  'non-veg': { emoji: '🍗', color: 'bg-rose-100' },
  'snacks-beverages': { emoji: '☕', color: 'bg-orange-100' },
};

function CategoryCard({ category }: { category: Category }) {
    const style = categoryStyles[category.slug] || { emoji: '🛒', color: 'bg-gray-100' };

    return (
        <Link href={`/products/category/${category.slug}`} className="block group">
            <Card className={cn(
                "h-full overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-xl",
                style.color
            )}>
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-6xl mb-4">{style.emoji}</p>
                    <h3 className="font-bold text-primary text-base">{category.name_en}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{category.description}</p>
                </CardContent>
            </Card>
        </Link>
    );
}


export default function AllCategoriesPage() {
  return (
    <AppShell>
       <div className="container mx-auto py-8">
            <Card className="mb-8 border-0 bg-transparent shadow-none">
                <CardHeader>
                    <CardTitle className="font-headline text-4xl font-bold text-primary">All Categories</CardTitle>
                    <CardDescription>
                        Explore our wide range of fresh products.
                    </CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {CATEGORIES.map((category) => (
                    <CategoryCard key={category.id} category={category} />
                ))}
            </div>
       </div>
    </AppShell>
  );
}
