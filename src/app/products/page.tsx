
'use client';

import { useState, useEffect } from 'react';
import type { Product, Category, Promotion } from '@/lib/types';
import { ProductCard } from '@/components/products/ProductCard';
import { HelpCircle, Carrot, Apple, Milk, Coffee, ShoppingCart, Drumstick, Phone } from 'lucide-react';
import { products as allProductsData, promotions, CATEGORIES } from '@/lib/data';
import { Card } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";
import Image from 'next/image';
import { AppShell } from '@/components/layout/AppShell';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [bestDeals, setBestDeals] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('fresh-vegetables');

  useEffect(() => {
    setProducts(allProductsData);
    // Best deals sorted by discount
    const sortedDeals = [...allProductsData]
      .sort((a, b) => (b.mrp - b.price) - (a.mrp - a.price))
      .slice(0, 12); // Get top 12 deals
    setBestDeals(sortedDeals);
  }, []);

  const categoryIcons: { [key: string]: React.ElementType } = {
    'fresh-vegetables': Carrot,
    'fresh-fruits': Apple,
    'dairy-bakery': Milk,
    'snacks-beverages': Coffee,
    'staples-grocery': ShoppingCart,
    'non-veg': Drumstick,
  };

  return (
    <AppShell>
      <main className="container mx-auto pb-24">
        {/* Promotions Carousel */}
        <section className="my-6">
          <Carousel opts={{ loop: true }} plugins={[Autoplay({ delay: 5000 })]}>
            <CarouselContent>
              {promotions.map((promo) => (
                <CarouselItem key={promo.id}>
                  <div className="relative aspect-[2/1] w-full overflow-hidden rounded-2xl shadow-lg">
                    <Image src={promo.imageUrl} alt={promo.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-6">
                      <h3 className="text-white text-2xl font-bold">{promo.title}</h3>
                      <p className="text-white/90">{promo.description}</p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </section>

        {/* Category Section */}
        <section className="my-8 bg-primary rounded-t-2xl p-4 relative">
          <h2 className="text-xl font-bold text-primary-foreground mb-4 px-2">Shop by Category</h2>
          <div className="flex overflow-x-auto space-x-2 pb-4 no-scrollbar">
            {CATEGORIES.map((category) => {
              const Icon = categoryIcons[category.slug] || ShoppingCart;
              const isActive = activeCategory === category.slug;
              return (
                <Link
                  key={category.id}
                  href={`/products/category/${category.slug}`}
                  onClick={() => setActiveCategory(category.slug)}
                  className={cn(
                    "category-tab-item relative flex flex-col items-center justify-center space-y-2 p-3 flex-shrink-0 w-24 rounded-t-xl transition-all duration-300",
                    isActive ? "active-category-tab bg-background" : "text-primary-foreground/80 hover:bg-primary-foreground/10"
                  )}
                >
                  <Icon className={cn("h-6 w-6", isActive ? "text-primary" : "text-primary-foreground")} />
                  <span className={cn("text-xs font-medium text-center", isActive ? "text-primary" : "text-primary-foreground")}>
                    {category.name_en}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Best Deals Section */}
        <section className="my-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Best Deals</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {bestDeals.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Popular Products Grid */}
        <section className="my-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Popular Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.slice(0, 10).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>

      {/* Fixed Call & Help Buttons */}
      <a href="tel:9097882555" className="bg-positive text-white fixed bottom-40 right-6 md:bottom-20 z-40 h-14 w-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
        <Phone className="h-7 w-7" />
        <span className="sr-only">Call to Order</span>
      </a>

      <button className="glass-icon-button fixed bottom-24 right-6 md:bottom-6">
        <HelpCircle className="h-7 w-7 text-primary" />
        <span className="sr-only">Help & Support</span>
      </button>
    </AppShell>
  );
}
