
'use client';

import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="glass-card group flex flex-col overflow-hidden hover:scale-105 p-0">
      <CardHeader className="p-0">
        <div className="relative aspect-square w-full overflow-hidden rounded-t-3xl">
          <Image
            src={product.image}
            alt={product.name_en}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            data-ai-hint={product.imageHint}
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-4">
        <div className="flex-1">
          <CardTitle className="font-headline text-lg">{product.name_en}</CardTitle>
          <p className="mt-2 text-2xl font-semibold text-primary">
            ₹{product.price.toFixed(2)}
          </p>
        </div>
        <Button className="neon-button mt-4 w-full" onClick={handleAddToCart}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
}
