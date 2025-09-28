
'use client';

import { useState, useEffect } from 'react';
import { products, CATEGORIES } from '@/lib/data';
import type { Product, Category } from '@/lib/types';
import { ProductCard } from '@/components/products/ProductCard';
import { HelpCircle, Search } from 'lucide-react';
import { Logo } from '@/components/icons/Logo';
import { Input } from '@/components/ui/input';

export default function HomePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    // In a real app, you would fetch products from an API
    setAllProducts(products);
  }, []);

  return (
    <div className="vibrant-gradient min-h-screen">
      <header className="glass-app-bar sticky top-0 z-10 py-3 px-4">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="w-32">
            <Logo width={120} height={40}/>
          </div>
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search for anything..."
              className="w-full pl-12 pr-4 py-2 rounded-full bg-white/80 border-2 border-transparent focus:border-primary focus:bg-white transition-all"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {/* Category Section */}
        <section className="my-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((category) => (
              <div key={category.id} className="glass-card p-4 text-center hover:scale-105 transition-transform cursor-pointer h-40 flex flex-col justify-center items-center">
                 <div className="text-4xl mb-2">
                  {category.name_en.includes('Vegetable') ? '🥦' :
                   category.name_en.includes('Dairy') ? '🥛' :
                   category.name_en.includes('Snacks') ? '🍿' : '🛒'}
                </div>
                <h3 className="font-semibold text-foreground">{category.name_en}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="my-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Featured Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {allProducts.slice(0, 10).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>

      <button className="glass-icon-button fixed bottom-6 right-6">
        <HelpCircle className="h-7 w-7 text-primary" />
        <span className="sr-only">Help & Support</span>
      </button>
    </div>
  );
}

