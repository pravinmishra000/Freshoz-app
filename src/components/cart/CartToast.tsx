'use client';

import { useCart } from '@/lib/cart/cart-context';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

export function CartToast() {
  const { cartItems, cartCount, cartTotal } = useCart();
  const [isVisible, setIsVisible] = useState(true);

  // Show the toast if there are items and it hasn't been dismissed
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
        className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[95%] max-w-md z-40 md:bottom-6"
      >
        <div className="glass-card flex items-center justify-between p-3 rounded-2xl shadow-2xl overflow-hidden">
          {/* Left side: Layered product images */}
          <div className="flex items-center">
            <div className="flex -space-x-4">
              {displayedItems.map((item, index) => (
                <div key={item.id} className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-white/50 shadow-md" style={{ zIndex: displayedItems.length - index }}>
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
              <div className="relative -ml-4 z-10 h-10 w-10 rounded-full bg-primary/80 flex items-center justify-center text-white text-xs font-bold border-2 border-white/50 shadow-md">
                +{remainingItems}
              </div>
            )}
          </div>

          {/* Center: Item count and total */}
          <div className="text-center">
            <p className="font-bold text-sm text-primary">{cartCount} {cartCount > 1 ? 'Items' : 'Item'}</p>
            <p className="text-lg font-extrabold text-primary -mt-1">₹{cartTotal.toFixed(2)}</p>
          </div>

          {/* Right side: View Cart button */}
          <div className="flex items-center gap-2">
            <Link href="/checkout" passHref>
              <Button className="bg-positive text-white rounded-full font-semibold hover:bg-positive/90 transition-colors h-10 pl-4 pr-3">
                <span>View Cart</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsVisible(false)}
              className="text-muted-foreground hover:text-primary transition-colors h-10 w-10 rounded-full hover:bg-black/10"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close cart view</span>
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
