
'use client';

import { useCart } from '@/lib/cart/cart-context';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, X, Info } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const FREE_DELIVERY_THRESHOLD = 199;

export function CartToast() {
  const { cartCount, cartTotal } = useCart();
  const [isVisible, setIsVisible] = useState(true);

  const amountForFreeDelivery = FREE_DELIVERY_THRESHOLD - cartTotal;
  const showFreeDeliveryToast = cartTotal > 0 && amountForFreeDelivery > 0;

  useEffect(() => {
    // When cart becomes empty, prepare the toast to be shown again for the next item
    if (cartCount === 0) {
      setIsVisible(true);
    }
  }, [cartCount]);

  if (cartCount === 0 || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '150%' }}
        animate={{ y: 0 }}
        exit={{ y: '150%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        className="fixed bottom-28 md:bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-50 space-y-2"
      >
        {/* Free Delivery Sub-Toast */}
        {showFreeDeliveryToast && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-primary/90 backdrop-blur-md text-primary-foreground p-3 rounded-xl shadow-lg text-center text-sm"
            >
                <div className="flex items-center justify-center gap-2">
                    <Info className="h-4 w-4" />
                    <span>Add <span className="font-bold">₹{amountForFreeDelivery.toFixed(2)}</span> more for FREE delivery!</span>
                </div>
            </motion.div>
        )}

        {/* Main Cart Toast Bar */}
        <div className="glass-card flex items-center justify-between p-3 rounded-2xl shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-positive/20 text-positive rounded-full h-10 w-10 flex items-center justify-center font-bold">
              {cartCount}
            </div>
            <div>
              <p className="font-bold text-lg text-primary">₹{cartTotal.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground -mt-1">Total</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link href="/checkout" passHref>
                <button className="flex items-center gap-2 bg-positive text-white px-4 py-2 rounded-full font-semibold hover:bg-positive/90 transition-colors">
                    <span>View Cart</span>
                    <ArrowRight className="h-4 w-4" />
                </button>
            </Link>
            <button 
                onClick={() => setIsVisible(false)}
                className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-black/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
