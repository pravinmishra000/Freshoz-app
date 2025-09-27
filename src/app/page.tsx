
import { Button } from '@/components/ui/button';
import { Phone, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/icons/Logo';

export default function PreHomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-4">
        <div className="mb-12">
            <Logo width={200} height={50} />
            <p className="mt-2 text-lg text-muted-foreground">Freshness Delivered, Just a Tap Away.</p>
        </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-md">
        <a href="tel:+91909788255">
          <div className="glass-card p-8 rounded-xl h-full flex flex-col items-center justify-center hover:bg-accent/10 transition-colors cursor-pointer">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
                    <Phone className="h-8 w-8 text-primary-foreground" />
                </div>
            </div>
            <h2 className="font-headline text-2xl font-semibold">Call to Order</h2>
            <p className="text-muted-foreground mt-1">Prefer to order via phone? Call us directly!</p>
          </div>
        </a>

        <Link href="/products" passHref>
          <div className="glass-card p-8 rounded-xl h-full flex flex-col items-center justify-center hover:bg-accent/10 transition-colors cursor-pointer ring-2 ring-primary/50 neon-button">
            <ShoppingBag className="h-12 w-12 text-primary mb-4" />
            <h2 className="font-headline text-2xl font-semibold">Shop Now</h2>
            <p className="text-muted-foreground mt-1">Browse our fresh selection online.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
