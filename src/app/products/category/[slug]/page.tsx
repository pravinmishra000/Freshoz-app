
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import type { Product, Category } from '@/lib/types';
import { ProductCard } from '@/components/products/ProductCard';
import { products as allProductsData, CATEGORIES } from '@/lib/data';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { CategorySidebar } from '@/components/products/CategorySidebar';

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      const currentCategory = CATEGORIES.find(cat => cat.slug === slug);
      if (currentCategory) {
        setCategory(currentCategory);
        const products = allProductsData.filter(
          (product) => product.category_id === currentCategory.id
        );
        setFilteredProducts(products);
      } else {
        setCategory(null);
        setFilteredProducts([]);
      }
      setIsLoading(false);
    }
  }, [slug]);

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-1/4 lg:w-1/5">
            <CategorySidebar categories={CATEGORIES} activeSlug={slug} />
          </aside>
          
          <main className="w-full md:w-3/4 lg:w-4/5">
            {category ? (
              <>
                <Card className="mb-6 border-0 bg-transparent shadow-none">
                  <CardHeader>
                    <CardTitle className="font-headline text-4xl font-bold text-primary">{category.name_en}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                </Card>

                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No products found in this category.</p>
                  </div>
                )}
              </>
            ) : (
               <div className="text-center py-10">
                  <h1 className="text-2xl font-bold">Category not found</h1>
                  <p className="text-muted-foreground mt-2">Please select a category from the list.</p>
                </div>
            )}
          </main>
        </div>
      </div>
    </AppShell>
  );
}
