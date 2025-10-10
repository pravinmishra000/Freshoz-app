'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Search, ShoppingCart, Menu, Wallet, Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart/cart-context';
import CartIcon from './CartIcon';

export default function HomeHeader() {
  const deliveryLocation = "Sultanganj, Khagaria, Bhagalpur";

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-b from-green-500 to-yellow-300 border-b-2 border-yellow-400 shadow-lg">
      
      {/* Top Bar - Delivery Info */}
      <div className="bg-green-600/90 text-white text-xs py-2 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3" />
            <span className="truncate max-w-[160px]">Delivering to: {deliveryLocation}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">🚚 Free delivery above ₹199</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-gradient-to-r from-green-500 via-yellow-400 to-green-500 py-3">
        <div className="container mx-auto flex items-center justify-between px-4">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="relative">
              <div className="absolute inset-0 bg-white rounded-full shadow-2xl transform group-hover:scale-110 transition-transform"></div>
              <Image
                src="https://firebasestorage.googleapis.com/v0/b/freshoz-fresh-fast.firebasestorage.app/o/brand%2FPNG%2Flogo-1800x1800-transparent.png?alt=media&token=c0768076-9cd1-4269-9b65-7ab12b48ea57"
                alt="Freshoz Logo"
                width={65}
                height={65}
                className="relative z-10 rounded-full transform group-hover:scale-105 transition-transform"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-primary font-bold text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] uppercase">FRESHOZ</span>
              <span className="text-white/95 text-sm font-semibold drop-shadow-md">{'Fresh & Fast'}</span>
            </div>
          </Link>

          {/* Navigation Actions */}
          <div className="flex items-center gap-4">
            {/* Search Button */}
            <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/30 text-white rounded-full h-10 w-10">
              <Search className="h-5 w-5" />
            </Button>

            {/* Cart Button */}
            <CartIcon />

            {/* Wallet Button */}
            <Link href="/wallet">
              <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/30 text-white rounded-full h-10 w-10">
                <Wallet className="h-5 w-5" />
              </Button>
            </Link>

            {/* WhatsApp Button */}
            <a href="https://wa.me/9097882555" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/30 text-white rounded-full h-10 w-10">
                <MessageSquare className="h-5 w-5" />
              </Button>
            </a>

            {/* Menu Button */}
            <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/30 text-white rounded-full h-10 w-10">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
