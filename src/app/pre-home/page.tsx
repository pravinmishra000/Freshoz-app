
import { Phone, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function PreHomeScreen() {
  return (
    <div className="flex flex-col min-h-screen vibrant-gradient">
      <header className="glass-app-bar sticky top-0 z-10 p-4">
        <h1 className="text-center text-2xl font-black text-positive uppercase">Freshoz</h1>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-4 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">Welcome!</h2>
        <p className="text-muted-foreground text-lg mb-12 max-w-md">
          Your one-stop shop for the freshest vegetable, fruits, groceries, etc. delivered right to your door.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-lg">
          <a href="tel:9097882555" className="glass-button flex flex-col items-center justify-center">
            <Phone className="h-10 w-10 text-positive mb-3" />
            <span className="text-primary font-semibold">Call Us</span>
          </a>

          <Link href="/products" className="glass-button flex flex-col items-center justify-center">
            <ShoppingCart className="h-10 w-10 text-positive mb-3" />
            <span className="text-primary font-semibold">Shop Now</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
