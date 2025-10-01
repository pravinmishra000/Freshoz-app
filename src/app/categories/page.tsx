
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CATEGORIES } from '@/lib/data';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/types';

function CategoryCard({ category }: { category: Category }) {
    return (
        <Link href={`/products/category/${category.slug}`} className="block group">
            <Card className="glass-card h-full overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
                <div className="relative aspect-video w-full">
                    <Image
                        src={category.image || 'https://picsum.photos/seed/placeholder/200/150'}
                        alt={category.name_en}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                </div>
                <CardContent className="p-4">
                    <h3 className="font-bold text-primary text-base">{category.name_en}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{category.description}</p>
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
