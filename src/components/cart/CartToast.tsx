
'use client';

import { useCart } from '@/lib/cart/cart-context';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '../ui/button';

export function CartToast() {
  const { cartItems, cartCount, cartTotal } = useCart();
  const [isVisible, setIsVisible] = useState(true);

  const freeDeliveryThreshold = 199;
  const amountForFreeDelivery = freeDeliveryThreshold - cartTotal;
  const showFreeDeliveryToast = cartTotal > 0 && cartTotal < freeDeliveryThreshold;

  // Show the main toast if there are items and it hasn't been dismissed
  const showToast = cartCount > 0 && isVisible;

  // When cart becomes empty, reset the visibility so it can appear again
  useEffect(() => {
    if (cartCount === 0) {
      setIsVisible(true);
    }
  }, [cartCount]);

  if (!showToast) {
    return null;
  }

  const displayedItems = cartItems.slice(0, 3);
  const remainingItems = cartCount - displayedItems.length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '150%' }}
        animate={{ y: 0 }}
        exit={{ y: '150%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        className="fixed bottom-24 left-0 right-0 z-40 md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:w-[95%] md:max-w-md"
      >
        <div className="flex flex-col items-center gap-2 px-4 md:px-0">
          {/* Secondary toast for free delivery */}
          {showFreeDeliveryToast && (
            <div className="w-full max-w-md">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-xl bg-green-100 text-center text-xs font-semibold text-green-800 p-2 shadow-lg"
              >
                Add items worth ₹{amountForFreeDelivery.toFixed(2)} more for FREE delivery!
              </motion.div>
            </div>
          )}
          
          {/* Main Cart Toast */}
          <div className="glass-card flex w-full max-w-md items-center justify-between overflow-hidden rounded-xl p-3 shadow-2xl">
            {/* Left side: Layered product images */}
            <div className="flex items-center">
              <div className="flex -space-x-4">
                {displayedItems.map((item, index) => (
                  <div key={item.id} className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white/50 shadow-md" style={{ zIndex: displayedItems.length - index }}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              {remainingItems > 0 && (
                <div className="relative -ml-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/50 bg-primary/80 text-xs font-bold text-white shadow-md">
                  +{remainingItems}
                </div>
              )}
            </div>

            {/* Center: Item count and total */}
            <div className="text-center">
              <p className="text-sm font-bold text-primary">{cartCount} {cartCount > 1 ? 'Items' : 'Item'}</p>
              <p className="-mt-1 text-lg font-extrabold text-primary">₹{cartTotal.toFixed(2)}</p>
            </div>

            {/* Right side: View Cart button */}
            <div className="flex items-center gap-2">
              <Link href="/checkout" passHref>
                <Button className="h-10 rounded-full bg-positive pl-4 pr-3 font-semibold text-white transition-colors hover:bg-positive/90">
                  <span>View Cart</span>
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsVisible(false)}
                className="h-10 w-10 rounded-full text-muted-foreground transition-colors hover:bg-black/10 hover:text-primary"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close cart view</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
