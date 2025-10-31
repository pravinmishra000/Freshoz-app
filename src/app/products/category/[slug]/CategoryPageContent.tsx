
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Product, Category } from '@/lib/types';
import { ProductCard } from '@/components/products/ProductCard';
import { products as allProductsData, CATEGORIES } from '@/lib/data';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { CategorySidebar } from '@/components/products/CategorySidebar';
import { cn } from '@/lib/utils';
import { MobileCategorySelector } from '@/components/products/MobileCategorySelector';

const DEFAULT_CATEGORY_SLUG = 'fresh-vegetables';

export function CategoryPageContent({ slug: initialSlug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightProductName = searchParams.get('highlight');

  const slug = initialSlug || DEFAULT_CATEGORY_SLUG;

  const [category, setCategory] = useState<Category | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const currentCategory = CATEGORIES.find(cat => cat.slug === slug);
    if (currentCategory) {
      setCategory(currentCategory);
      const products = allProductsData.filter(
        (product) => product.category_id === currentCategory.id
      );
      setFilteredProducts(products);
    } else {
      router.replace(`/products/category/${DEFAULT_CATEGORY_SLUG}`);
      return;
    }
    setIsLoading(false);
  }, [slug, router]);

  useEffect(() => {
    if (highlightProductName) {
      const el = document.getElementById(highlightProductName);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightProductName]);

  if (isLoading || !category) {
    return (
      <AppShell>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-positive" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container mx-auto py-4 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
          {/* Left Side: Category List (Hidden on mobile) */}
          <aside className="hidden md:block">
            <div className="sticky top-24">
              <h3 className="text-lg font-semibold text-primary mb-4">All Categories</h3>
              <CategorySidebar categories={CATEGORIES} activeSlug={slug} />
            </div>
          </aside>

          {/* Right Side: Product Grid */}
          <main>
            <Card className="mb-6 border-0 bg-transparent shadow-none">
              <CardHeader className="p-0">
                <div className="flex items-center justify-between gap-4 mb-2">
                    <CardTitle className="font-headline text-2xl md:text-4xl font-bold text-primary">{category.name_en}</CardTitle>
                    <div className="md:hidden">
                        <MobileCategorySelector categories={CATEGORIES} activeSlug={slug} />
                    </div>
                </div>
                <CardDescription className="hidden md:block">{category.description}</CardDescription>
              </CardHeader>
            </Card>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {filteredProducts.map((product) => {
                  const isHighlighted = highlightProductName && product.name_en === highlightProductName;
                  return (
                    <div
                      key={product.id}
                      id={product.name_en}
                      className={cn(
                        "transition-transform duration-300",
                        isHighlighted
                          ? "ring-2 ring-offset-2 ring-primary rounded-lg"
                          : "hover:scale-105"
                      )}
                    >
                      <ProductCard product={product} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 glass-card">
                <p className="text-muted-foreground">No products found in this category.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </AppShell>
  );
}
