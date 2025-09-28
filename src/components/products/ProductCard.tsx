
'use client';

import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/cart/cart-context';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name_en,
      price: product.price,
      quantity: 1,
      image: product.image,
    });
    toast({
      title: 'Added to Cart',
      description: `${product.name_en} has been added to your cart.`,
    });
  };

  return (
    <div className="glass-card group flex flex-col overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
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
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold text-white">
          - {Math.round(((product.mrp - product.price) / product.mrp) * 100)}%
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-base md:text-lg flex-1 text-primary">{product.name_en}</h3>
        <div className="mt-2 flex items-baseline gap-2">
            <p className="text-lg md:text-xl font-bold text-positive">
              ₹{product.price.toFixed(2)}
            </p>
             <p className="text-sm text-destructive line-through">
              ₹{product.mrp.toFixed(2)}
            </p>
        </div>
        <Button className="bg-positive text-white hover:bg-positive/90 mt-4 w-full font-bold text-sm md:text-base" onClick={handleAddToCart}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
