
'use client';

import { ArrowRight, ChevronRight, Search, ShoppingCart, Tag, Ticket, User, Wallet } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FreshozLogo } from '@/components/freshoz/freshoz-logo';
import { ProductCard } from '@/components/products/ProductCard';
import { products, CATEGORIES } from '@/lib/data';
import { useState, useEffect } from 'react';

// Quick Action Button Component
const QuickActionButton = ({ icon: Icon, label, href }: { icon: React.ElementType, label: string, href: string }) => (
  <Link href={href} className="flex flex-col items-center justify-center gap-2 p-3 text-center transition-transform duration-300 ease-out hover:scale-105 active:scale-95">
    <div className="glass-card flex h-16 w-16 items-center justify-center rounded-2xl">
      <div className="light-ray"></div>
      <Icon className="h-8 w-8 text-white" />
    </div>
    <span className="text-sm font-semibold text-white">{label}</span>
  </Link>
);

// Countdown Timer Component
const CountdownTimer = () => {
  const calculateTimeLeft = () => {
    const difference = +new Date("2024-12-31T23:59:59") - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  const timerComponents: any[] = [];
  Object.keys(timeLeft).forEach((interval) => {
    if (!(timeLeft as any)[interval]) {
      return;
    }
    timerComponents.push(
      <div key={interval} className="flex flex-col items-center">
        <span className="text-xl font-bold">{(timeLeft as any)[interval]}</span>
        <span className="text-xs">{interval}</span>
      </div>
    );
  });

  return (
    <div className="flex justify-center gap-4">
      {timerComponents.length ? timerComponents : <span>Time's up!</span>}
    </div>
  );
};


export default function HomePage() {
    const quickActions = [
        { icon: Ticket, label: 'Offers', href: '/offers' },
        { icon: Tag, label: 'My Orders', href: '/orders' },
        { icon: Wallet, label: 'Wallet', href: '/wallet' },
        { icon: User, label: 'Support', href: '/chat' },
    ];

    const featuredProducts = products.filter(p => p.rating && p.rating > 4.5).slice(0, 10);

  return (
    <div className="min-h-screen text-white">
      {/* Top Bar */}
      <header className="glass-app-bar sticky top-0 z-20 p-4">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <FreshozLogo size="sm" />
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full rounded-full border border-transparent bg-white/30 py-2 pl-9 pr-4 text-sm text-white placeholder-white/70 backdrop-blur-sm focus:border-white/50 focus:outline-none focus:ring-1 focus:ring-white/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Link href="/cart" className="glass-icon-button">
              <ShoppingCart className="h-5 w-5 text-white" />
            </Link>
            <Link href="/profile" className="glass-icon-button">
              <User className="h-5 w-5 text-white" />
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto space-y-12 px-4 pb-24 pt-6">
        {/* Quick Actions */}
        <section className="grid grid-cols-4 gap-4">
           <Link href="/products" className="flex flex-col items-center justify-center gap-2 p-3 text-center transition-transform duration-300 ease-out hover:scale-105 active:scale-95">
                <div className="glass-card flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
                    <div className="light-ray"></div>
                    <ChevronRight className="h-8 w-8 text-white" />
                </div>
                <span className="text-sm font-semibold text-white">Shop All</span>
            </Link>
          {quickActions.map(action => (
            <QuickActionButton key={action.label} {...action} />
          ))}
        </section>

        {/* Featured Products */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Featured Products</h2>
            <Link href="/products" className="flex items-center text-sm font-semibold text-white/80 hover:underline">
              <span>See All</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {featuredProducts.map(product => (
              <div key={product.id} className="min-w-[200px] sm:min-w-[240px]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
        
        {/* Category Grid */}
        <section>
            <h2 className="text-2xl font-bold text-white mb-4">Shop by Category</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {CATEGORIES.slice(0, 8).map(category => (
                <Link key={category.id} href={`/products?category=${category.slug}`} className="block">
                    <div className="glass-card group relative h-40 overflow-hidden rounded-2xl p-4 text-center transition-transform hover:scale-105">
                        <div className="light-ray"></div>
                        <Image src={category.image || ''} alt={category.name_en} fill className="object-cover opacity-20 transition-opacity group-hover:opacity-30" data-ai-hint={category.name_en.toLowerCase()}/>
                        <div className="relative z-10 flex h-full flex-col items-center justify-center">
                            <h3 className="text-lg font-bold text-white">{category.name_en}</h3>
                        </div>
                    </div>
                </Link>
                ))}
            </div>
        </section>

        {/* Daily Deals */}
        <section>
            <div className="glass-card flex flex-col items-center justify-between gap-6 rounded-2xl bg-gradient-to-r from-purple-500/30 to-pink-500/30 p-6 text-white sm:flex-row">
                <div className="light-ray"></div>
                <div className="text-center sm:text-left">
                    <h2 className="text-3xl font-extrabold">Daily Deals</h2>
                    <p className="mt-1">Limited time offers, grab them now!</p>
                </div>
                <div className="rounded-2xl bg-white/10 px-6 py-3 text-center">
                    <CountdownTimer />
                </div>
                 <button className="flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-purple-700 transition-transform hover:scale-105">
                    View Deals <ArrowRight className="h-5 w-5" />
                </button>
            </div>
        </section>
      </main>
    </div>
  );
}
