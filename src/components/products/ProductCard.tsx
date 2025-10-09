'use client';

import { useState } from 'react';
import type { Product, ProductVariant } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Sprout, Wheat, Drumstick, Milk, Coffee, AlertTriangle, Leaf } from 'lucide-react';
import { useCart } from '@/lib/cart/cart-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
}

const categoryStyles: { [key: string]: { emoji: string; color: string; icon: React.ElementType } } = {
  'cat-1': { emoji: '🥦', color: 'bg-green-100', icon: Sprout },
  'cat-6': { emoji: '🍎', color: 'bg-red-100', icon: Sprout },
  'cat-2': { emoji: '🥛', color: 'bg-blue-100', icon: Milk },
  'cat-4': { emoji: '🌾', color: 'bg-yellow-100', icon: Wheat },
  'cat-5': { emoji: '🍗', color: 'bg-rose-100', icon: Drumstick },
  'cat-3': { emoji: '☕', color: 'bg-orange-100', icon: Coffee },
};

export function ProductCard({ product }: ProductCardProps) {
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  const { toast } = useToast();
  
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    (product.variants && product.variants.length > 0) ? product.variants[0] : null
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

  const hasRealImage = product.image && !product.image.includes('firebasestorage') && !product.image.includes('picsum.photos');
  const categoryStyle = categoryStyles[product.category_id || ''] || { emoji: '🛒', color: 'bg-gray-100', icon: Sprout };

  const getProductEmoji = () => {
    const name = product.name_en.toLowerCase();
    if (name.includes('butter')) return '🧈';
    if (name.includes('cheese') || name.includes('paneer')) return '🧀';
    if (name.includes('ghee')) return '🧈';
    return categoryStyle.emoji;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm flex flex-col overflow-hidden h-full">
      <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
        {hasRealImage ? (
          <Image
            src={product.image}
            alt={product.name_en}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className={cn(
            "w-full h-full flex flex-col items-center justify-center text-center p-2",
            categoryStyle.color
          )}>
            <p className="text-5xl mb-2">{getProductEmoji()}</p>
            <p className="text-base font-semibold text-primary">{product.name_en}</p>
          </div>
        )}
       
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-positive text-white px-2 py-1 rounded-md text-xs font-bold">
            {discount}% OFF
          </div>
        )}

        {/* Veg/Non-Veg Badges */}
        {product.is_veg === false && (
          <div className="absolute top-2 right-2 rounded-full bg-red-500 p-1">
            <AlertTriangle className="h-4 w-4 text-white" />
          </div>
        )}
        
        {product.is_veg === true && (
          <div className="absolute top-2 right-2 rounded-full bg-green-500 p-1">
            <Leaf className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-2 md:p-3">
        <div className="flex-grow">
          {product.variants && product.variants.length > 1 ? (
            <select
              value={selectedVariant?.id}
              onChange={(e) => {
                const newVariant = product.variants?.find(v => v.id === e.target.value) || null;
                setSelectedVariant(newVariant);
              }}
              className="w-full text-xs text-muted-foreground border-none p-0 focus:ring-0 mb-1 bg-transparent"
            >
              {product.variants.map(variant => (
                <option key={variant.id} value={variant.id}>
                  {variant.pack_size}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-xs text-muted-foreground mb-1">{currentPackSize}</p>
          )}

          <h3 className="font-semibold text-base md:text-lg text-foreground leading-tight line-clamp-2">{product.name_en}</h3>
        </div>
        
        <div className="mt-2 flex items-center justify-between">
          <div className="flex flex-col items-start">
            {currentMrp > currentPrice && (
              <p className="text-xs text-destructive line-through">
                ₹{currentMrp.toFixed(0)}
              </p>
            )}
            <p className="text-base md:text-lg font-bold text-foreground">
              ₹{currentPrice.toFixed(0)}
            </p>
          </div>
          
          <div>
            {itemInCart ? (
              <div className="flex items-center justify-center rounded-lg border-2 border-destructive text-destructive font-bold bg-destructive/10">
                <Button size="icon" variant="ghost" onClick={handleDecrement} className="h-8 w-8 text-destructive hover:bg-destructive/20">
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-base tabular-nums px-1">{itemInCart.quantity}</span>
                <Button size="icon" variant="ghost" onClick={handleIncrement} className="h-8 w-8 text-destructive hover:bg-destructive/20">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline"
                className="border-2 border-destructive text-destructive bg-transparent hover:bg-destructive/10 hover:text-destructive font-bold text-base px-6 h-9" 
                onClick={handleAddToCart}
              >
                <span>Add</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
