
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';
import { db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { Product } from '@/lib/types';
import { products as allProducts } from '@/lib/data';
import { ProductCard } from '@/components/products/ProductCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Heart } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
  const { appUser, loading: authLoading } = useAuth();
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (appUser) {
        setIsLoading(true);
        try {
          const userRef = doc(db, 'users', appUser.id);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const wishlistIds = userData.wishlist || [];
            const wishlisted = allProducts.filter(p => wishlistIds.includes(p.id));
            setWishlistProducts(wishlisted);
          }
        } catch (error) {
          console.error("Error fetching wishlist:", error);
        } finally {
          setIsLoading(false);
        }
      } else if (!authLoading) {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, [appUser, authLoading]);

  if (isLoading || authLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!appUser) {
    return (
        <Card className="glass-card text-center">
            <CardContent className="p-10 space-y-4">
                <h3 className="font-headline text-xl font-semibold">Login to see your wishlist</h3>
                <p className="text-muted-foreground">Log in to add items to your wishlist and view them here.</p>
                <Button asChild className="mt-6 neon-button">
                    <Link href="/login?redirect=/wishlist">Login</Link>
                </Button>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader>
           <div className="flex items-center gap-4 mb-2">
            <Heart className="h-10 w-10 text-destructive" />
            <div>
                <CardTitle className="font-headline text-4xl font-bold text-primary">Your Wishlist</CardTitle>
                <CardDescription>
                  Your collection of favorite items.
                </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {wishlistProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlistProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <Card className="glass-card text-center">
            <CardContent className="p-10 space-y-4">
                <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="font-headline text-xl font-semibold">Your wishlist is empty</h3>
                <p className="text-muted-foreground">Tap the heart on any product to save it here.</p>
                <Button asChild className="mt-6 neon-button">
                    <Link href="/products">Start Shopping</Link>
                </Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
