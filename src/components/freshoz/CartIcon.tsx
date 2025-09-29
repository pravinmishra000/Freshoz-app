'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart/cart-context';

export default function CartIcon() {
  const { cartItems } = useCart();
  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity ?? 0), 0);

  return (
    <Link href="/cart">
      <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/30 text-white rounded-full h-10 w-10 relative">
        <ShoppingCart className="h-5 w-5" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {totalItems}
          </span>
        )}
      </Button>
    </Link>
  );
}
