'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { User, Wallet, Phone, MessageSquare, ShoppingCart, Search, Menu, Mic, MapPin, X } from 'lucide-react';

interface HeaderProps {
  cartItemsCount?: number;
  showCategories?: boolean;
}

export function Header({
  cartItemsCount = 0,
  showCategories = true,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('Sultanganj, Bhagalpur');

  const categories = ['Vegetables', 'Fruits', 'Dairy', 'Groceries', 'Snacks', 'Beverages', 'Non-Veg'];

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  const startVoiceSearch = () => {
    setIsListening(true);
    // Voice search implementation would go here
    setTimeout(() => setIsListening(false), 3000); // Simulate voice search
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-b from-green-500 to-yellow-300/100 border-b border-yellow-300 border-orange-90/-300/30">
      {/* Top Bar - Delivery Location & Quick Actions */}
      <div className="bg-green-500/90 text-white text-xs py-1 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span className="truncate max-w-[140px]">Delivering to: {deliveryLocation}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>🚚 Free delivery above ₹199</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo Section - FIXED */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="relative">
            {/* ✅ White background circle */}
            <div className="absolute inset-0 bg-white rounded-full shadow-lg"></div>
            <Image
              src="https://firebasestorage.googleapis.com/v0/b/freshoz-fresh-fast.firebasestorage.app/o/brand%2FPNG%2Flogo-1800x1800-transparent.png?alt=media&token=c0768076-9cd1-4269-9b65-7ab12b48ea57"
              alt="Freshoz Logo"
              width={60}
              height={60}
              className="relative z-10 rounded-full" // ✅ z-index for layering
            />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-xl drop-shadow-md">FRESHOZ</span>
            <span className="text-white/100 text-xs font-medium">{'Fresh & Fast'}</span>
          </div>
        </Link>
        
        {/* Desktop Search Bar with Voice */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-500" />
            <input
              type="text"
              placeholder="Search products... (Say 'Search for banana')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-20 py-2 rounded-full border border-black-300/50 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
            <Button
              variant="ghost"
              size="icon"
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 ${isListening ? 'text-red-500 animate-pulse' : 'text-orange-500'}`}
              onClick={startVoiceSearch}
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation Icons */}
        <div className="flex items-center gap-1">
          {/* Mobile Search Toggle */}
          <Button variant="ghost" size="icon" className="md:hidden text-white/90 hover:text-white hover:bg-orange-500/20" onClick={toggleSearch}>
            {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>

          {/* Mobile Menu Toggle */}
          <Button variant="ghost" size="icon" className="md:hidden text-white/90 hover:text-white hover:bg-orange-500/20" onClick={toggleMobileMenu}>
            <Menu className="h-6 w-6" />
          </Button>

          {/* Cart */}
          <Button variant="ghost" size="icon" className="text-white/90 hover:text-white hover:bg-orange-500/20 relative">
            <ShoppingCart className="h-5 w-5" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemsCount > 9 ? '9+' : cartItemsCount}
              </span>
            )}
          </Button>

          {/* Phone */}
          <a href="tel:9097882555">
            <Button variant="ghost" size="icon" className="text-white/90 hover:text-white hover:bg-orange-500/20 hidden sm:flex">
              <Phone className="h-5 w-5" />
            </Button>
          </a>

          {/* WhatsApp */}
          <a href="https://wa.me/9097882555" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" className="text-white/90 hover:text-white hover:bg-orange-500/20 hidden sm:flex">
              <MessageSquare className="h-5 w-5" />
            </Button>
          </a>

          {/* Wallet */}
          <Link href="/wallet">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/90 hover:text-white hover:bg-orange-500/20 hidden sm:flex"
            >
              <Wallet className="h-5 w-5" />
            </Button>
          </Link>

          {/* Profile */}
          <Button asChild variant="ghost" size="icon" className="text-white/90 hover:text-white hover:bg-orange-500/20">
            <Link href="/profile">
              <User className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-sm border-t border-orange-200/50 px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-16 py-2 rounded-full border border-dark-green-300/50 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <Button
              variant="ghost"
              size="icon"
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 ${isListening ? 'text-red-500 animate-pulse' : 'text-orange-500'}`}
              onClick={startVoiceSearch}
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Category Menu */}
      {isMobileMenuOpen && showCategories && (
        <div className="md:hidden bg-white/95 backdrop-blur-sm border-t border-orange-200/50">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-orange-800">Categories</span>
              <Button variant="ghost" size="sm" onClick={toggleMobileMenu}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/category/${category.toLowerCase()}`}
                  className="px-3 py-2 text-sm font-medium text-orange-800 hover:text-orange-600 hover:bg-orange-50/80 rounded-full transition-colors text-center"
                  onClick={toggleMobileMenu}
                >
                  {category}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Category Navigation - Pill-shaped tabs */}
      {showCategories && (
        <div className="hidden md:block bg-white/90 backdrop-blur-sm border-t border-orange-200/50">
          <div className="container mx-auto px-4 py-2">
            <nav className="flex overflow-x-auto scrollbar-hide space-x-2 pb-1">
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/category/${category.toLowerCase()}`}
                  className="whitespace-nowrap px-4 py-1.5 text-sm font-medium text-orange-800 hover:text-orange-600 hover:bg-orange-50/70 rounded-full transition-colors border border-orange-200/50 shadow-sm"
                >
                  {category}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
