
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const [products, setProducts] = useState<Product[]>([]);
  const [bestDeals, setBestDeals] = useState<Product[]>([]);
  
  const activeCategory = pathname.includes('/products/category/')
    ? pathname.split('/').pop()
    : 'fresh-vegetables';

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
  
  const categoryStyles: { [key: string]: string } = {
    'fresh-vegetables': 'bg-gradient-to-br from-green-400 to-lime-500 text-white',
    'fresh-fruits': 'bg-gradient-to-br from-orange-400 to-yellow-500 text-white',
    'dairy-bakery': 'bg-gradient-to-br from-blue-100 to-blue-200 text-primary',
    'staples-grocery': 'bg-gradient-to-br from-amber-200 to-white text-primary',
    'non-veg': 'bg-gradient-to-br from-red-400 to-yellow-400 text-white',
    'snacks-beverages': 'bg-gradient-to-br from-sky-500 to-indigo-600 text-white',
  };


  return (
    <AppShell>
      <main className="container mx-auto">
        {/* Promotions Carousel */}
        <section className="my-6">
          <Carousel opts={{ loop: true }} plugins={[Autoplay({ delay: 5000 })]}>
            <CarouselContent>
              {promotions.map((promo) => (
                <CarouselItem key={promo.id}>
                  <div className="relative h-48 md:h-auto md:aspect-[2/1] w-full overflow-hidden rounded-2xl shadow-lg">
                    <Image src={promo.imageUrl} alt={promo.title} fill className="object-cover" data-ai-hint={promo.imageHint}/>
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

        {/* New Category Section Design */}
        <section className="my-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Shop by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {CATEGORIES.map((category) => {
                    const Icon = categoryIcons[category.slug] || ShoppingCart;
                    const style = categoryStyles[category.slug] || 'bg-gray-200';
                    return (
                        <Link
                            key={category.id}
                            href={`/products/category/${category.slug}`}
                            className={cn(
                                "rounded-xl flex flex-col items-center justify-center p-4 text-center group transition-transform duration-300 ease-out hover:scale-105 active:scale-95 shadow-md hover:shadow-xl",
                                style
                            )}
                        >
                             <div className={cn(
                                "p-3 rounded-full bg-white/30 mb-2 transition-all duration-300"
                            )}>
                                <Icon className="h-7 w-7" />
                            </div>
                            <span className="text-sm font-semibold">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
            {bestDeals.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Popular Products Grid */}
        <section className="my-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Popular Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
            {products.slice(0, 10).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>

      {/* Fixed Call & Help Buttons */}
      <a href="tel:9097882555" className="glass-icon-button fixed bottom-24 left-4 z-40 h-14 w-14 md:left-6 md:bottom-6">
        <Phone className="h-7 w-7 text-positive" />
        <span className="sr-only">Call to Order</span>
      </a>
    </AppShell>
  );
}
