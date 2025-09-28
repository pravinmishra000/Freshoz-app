
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import type { Product, Category } from '@/lib/types';
import { ProductCard } from '@/components/products/ProductCard';
import { products as allProductsData, CATEGORIES } from '@/lib/data';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { CategorySidebar } from '@/components/products/CategorySidebar';
import { products } from '@/lib/data';

const DEFAULT_CATEGORY_SLUG = 'fresh-vegetables';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSlug = params.slug || searchParams.get('slug') || DEFAULT_CATEGORY_SLUG;
  
  const [selectedSlug, setSelectedSlug] = useState<string>(initialSlug as string);
  const [category, setCategory] = useState<Category | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const updateCategory = useCallback((slug: string) => {
    setIsLoading(true);
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
    // Update URL without reloading page
    if (params.slug !== slug) {
       router.push(`/products/category/${slug}`, { scroll: false });
    }
    setIsLoading(false);
  }, [router, params.slug]);

  useEffect(() => {
    const slug = params.slug || DEFAULT_CATEGORY_SLUG;
    setSelectedSlug(slug as string);
    updateCategory(slug as string);
  }, [params.slug, updateCategory]);

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
        <div className="flex flex-row gap-4 md:gap-8">
          
          {/* Left Side: Category List */}
          <aside className="w-1/4 md:w-1/5 lg:w-1/6">
             <div className="sticky top-24">
                <CategorySidebar 
                    categories={CATEGORIES} 
                    activeSlug={selectedSlug}
                />
             </div>
          </aside>
          
          {/* Right Side: Product Grid */}
          <main className="w-3/4 md:w-4/5 lg:w-5/6">
            {category ? (
              <>
                <Card className="mb-6 border-0 bg-transparent shadow-none">
                  <CardHeader className="p-0">
                    <CardTitle className="font-headline text-2xl md:text-4xl font-bold text-primary">{category.name_en}</CardTitle>
                    <CardDescription className="hidden md:block">{category.description}</CardDescription>
                  </CardHeader>
                </Card>

                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 glass-card">
                    <p className="text-muted-foreground">No products found in this category.</p>
                  </div>
                )}
              </>
            ) : (
               <div className="text-center py-10 glass-card">
                  <h1 className="text-xl md:text-2xl font-bold">Category not found</h1>
                  <p className="text-muted-foreground mt-2">Please select a valid category.</p>
                </div>
            )}
          </main>
        </div>
      </div>
    </AppShell>
  );
}
