
'use client';

import { ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { useCart } from '@/lib/cart/cart-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { Input } from '../ui/input';
import { useAuth } from '@/lib/firebase/auth-context';
import Link from 'next/link';

export function CartSheet() {
  const { cartItems, cartCount, cartTotal, updateQuantity, removeFromCart } = useCart();
  const { authUser } = useAuth();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {cartCount}
            </span>
          )}
          <span className="sr-only">Open Cart</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="font-headline text-2xl">Shopping Cart</SheetTitle>
        </SheetHeader>
        <Separator />
        {cartItems.length > 0 ? (
          <>
            <ScrollArea className="flex-1 -mx-6">
                <div className="px-6 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-2">
                  <div className="relative h-16 w-16 overflow-hidden rounded-md">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10))}
                      className="h-9 w-16 text-center"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Remove item</span>
                    </Button>
                  </div>
                </div>
              ))}
              </div>
            </ScrollArea>
            <Separator />
            <SheetFooter className="mt-auto space-y-4">
              <div className="flex w-full justify-between text-lg font-semibold">
                <span>Subtotal</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              {authUser ? (
                 <SheetClose asChild>
                    <Button asChild className="w-full neon-button text-lg py-6">
                        <Link href="/checkout">Proceed to Checkout</Link>
                    </Button>
                 </SheetClose>
              ) : (
                <Button asChild className="w-full neon-button text-lg py-6">
                  <Link href="/login">Login to Checkout</Link>
                </Button>
              )}
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            <h3 className="font-headline text-xl font-semibold">Your cart is empty</h3>
            <p className="text-muted-foreground">Add some fresh groceries to get started!</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
