'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Product, Category } from '@/lib/types';
import { ProductCard } from '@/components/products/ProductCard';
import { products as allProductsData, CATEGORIES } from '@/lib/data';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Menu, X } from 'lucide-react';
import { CategorySidebar } from '@/components/products/CategorySidebar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';

const DEFAULT_CATEGORY_SLUG = 'fresh-vegetables';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  
  const slug = params.slug as string || DEFAULT_CATEGORY_SLUG;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

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
        {/* Mobile Category Button - Only visible on mobile */}
        <div className="block md:hidden mb-4">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Menu className="h-4 w-4" />
                Categories
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
              <SheetTitle className="sr-only">Categories</SheetTitle>
              <SheetDescription className="sr-only">
                Browse product categories
              </SheetDescription>
              <div className="p-4 border-b bg-primary/5">
                <h3 className="text-lg font-semibold text-primary">All Categories</h3>
              </div>
              <div className="p-4 h-[calc(100vh-80px)] overflow-y-auto">
                <CategorySidebar categories={CATEGORIES} activeSlug={slug} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          
          {/* Left Side: Category List - Hidden on mobile */}
          <aside className="hidden md:block w-1/4 md:w-1/5 lg:w-1/6">
             <div className="sticky top-24">
                <CategorySidebar 
                    categories={CATEGORIES} 
                    activeSlug={slug}
                />
             </div>
          </aside>
          
          {/* Right Side: Product Grid */}
          <main className="w-full md:w-3/4 md:w-4/5 lg:w-5/6">
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
          </main>
        </div>
      </div>
    </AppShell>
  );
}