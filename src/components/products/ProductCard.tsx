
'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Product, ProductVariant } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '@/lib/cart/cart-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  const { toast } = useToast();
  
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );

  const currentPrice = selectedVariant?.price ?? product.price;
  const currentMrp = selectedVariant?.mrp ?? product.mrp;
  const currentPackSize = selectedVariant?.pack_size ?? product.pack_size;
  const currentVariantId = selectedVariant?.id ?? 'default';

  const cartItemId = `${product.id}-${currentVariantId}`;
  const itemInCart = cartItems.find(item => item.id === cartItemId);

  const handleAddToCart = () => {
    if (!currentPackSize) return;
    addToCart({
      productId: product.id,
      variantId: currentVariantId,
      id: cartItemId,
      name: product.name_en,
      price: currentPrice,
      mrp: currentMrp,
      quantity: 1,
      image: product.image,
      pack_size: currentPackSize,
    });
    toast({
      title: 'Added to Cart',
      description: `${product.name_en} (${currentPackSize}) has been added.`,
    });
  };

  const handleIncrement = () => {
    if (itemInCart) {
      updateQuantity(cartItemId, itemInCart.quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (itemInCart && itemInCart.quantity > 1) {
      updateQuantity(cartItemId, itemInCart.quantity - 1);
    } else if (itemInCart) {
      removeFromCart(cartItemId);
    }
  };

  const discount = currentMrp > currentPrice 
    ? Math.round(((currentMrp - currentPrice) / currentMrp) * 100)
    : 0;

  return (
    <div className="glass-card group flex h-full flex-col overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="light-ray"></div>
      <div className="relative aspect-square w-full overflow-hidden">
        <Image
          src={product.image}
          alt={product.name_en}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          data-ai-hint={product.imageHint}
        />
        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold text-white">
            - {discount}%
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="font-semibold text-sm md:text-base flex-grow text-primary">{product.name_en}</h3>

        {/* Variant Selector */}
        {product.variants && product.variants.length > 1 && (
            <div className="mt-2 flex flex-wrap gap-2">
                {product.variants.map(variant => (
                    <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={cn(
                            'px-3 py-1 text-xs font-medium rounded-full border transition-colors',
                            selectedVariant?.id === variant.id
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-transparent text-muted-foreground hover:bg-accent/50 border-input'
                        )}
                    >
                        {variant.pack_size}
                    </button>
                ))}
            </div>
        )}

        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <p className="text-lg md:text-xl font-bold text-positive">
              ₹{currentPrice.toFixed(2)}
            </p>
            {currentMrp > currentPrice && (
              <p className="text-sm text-destructive line-through">
                ₹{currentMrp.toFixed(2)}
              </p>
            )}
        </div>
        
        <div className="mt-3 w-full">
          {itemInCart ? (
            <div className="flex items-center justify-between gap-2 rounded-lg bg-positive text-white font-bold">
               <Button size="icon" variant="ghost" onClick={handleDecrement} className="text-white hover:bg-white/20">
                  {itemInCart.quantity === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
               </Button>
               <span className="text-lg tabular-nums">{itemInCart.quantity}</span>
               <Button size="icon" variant="ghost" onClick={handleIncrement} className="text-white hover:bg-white/20">
                  <Plus className="h-4 w-4" />
               </Button>
            </div>
          ) : (
            <Button 
              className="bg-positive text-white hover:bg-positive/90 w-full font-bold" 
              onClick={handleAddToCart}
              size="lg"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              <span>Add to Cart</span>
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
