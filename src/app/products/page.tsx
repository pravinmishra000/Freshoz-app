
'use client';

import { useState, useEffect } from 'react';
import type { Product, Category, Promotion } from '@/lib/types';
import { ProductCard } from '@/components/products/ProductCard';
import { HelpCircle, Carrot, Apple, Milk, Coffee, ShoppingCart, Drumstick, Phone } from 'lucide-react';
import { products as allProductsData, promotions, CATEGORIES } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";
import Image from 'next/image';
import { AppShell } from '@/components/layout/AppShell';
import Link from 'next/link';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [bestDeals, setBestDeals] = useState<Product[]>([]);

  useEffect(() => {
    setProducts(allProductsData);
    // Filter products for "Best Deals" (e.g., biggest discount)
    const sortedDeals = [...allProductsData]
      .sort((a, b) => (b.mrp - b.price) - (a.mrp - a.price))
      .slice(0, 10);
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
        {/* Offer Banner Section */}
        <section className="my-6">
            <Carousel
                opts={{ loop: true }}
                plugins={[Autoplay({ delay: 5000 })]}
            >
            <CarouselContent>
              {promotions.map((promo) => (
                <CarouselItem key={promo.id}>
                    <div className="relative aspect-[2/1] w-full overflow-hidden rounded-2xl glass-card">
                         <Image
                            src={promo.imageUrl}
                            alt={promo.title}
                            fill
                            className="object-cover"
                            data-ai-hint={promo.imageHint}
                        />
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
        <section className="my-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((category) => {
              const Icon = categoryIcons[category.slug] || ShoppingCart;
              return (
              <Link key={category.id} href={`/products/category/${category.slug}`} className="block">
                <div className="glass-card p-4 text-center hover:scale-105 transition-transform cursor-pointer h-40 flex flex-col justify-center items-center">
                   <div className="text-4xl mb-2 text-primary">
                    <Icon />
                  </div>
                  <h3 className="font-semibold text-foreground text-center text-sm">{category.name_en}</h3>
                </div>
              </Link>
            )})}
          </div>
        </section>

        {/* Best Deals Section */}
        <section className="my-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Best Deals</h2>
            <div className="flex space-x-4 overflow-x-auto pb-4">
                {bestDeals.map((product) => (
                    <div key={product.id} className="min-w-[200px] sm:min-w-[240px]">
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
        </section>

        {/* Popular Products Section */}
        <section className="my-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Popular Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.slice(0, 10).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>

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

    
