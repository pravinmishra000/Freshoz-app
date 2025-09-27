
'use client';

import { FreshozLogo } from './freshoz-logo';
import Link from 'next/link';

export function Footer() {
  const storePhoneNumber = '9097882555';

  return (
    <footer className="glass-card rounded-t-3xl border-t-2 border-white/30 backdrop-blur-lg hidden md:block mt-8">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex-shrink-0">
            <FreshozLogo />
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/80">
            <Link href="/about" className="hover:text-yellow-300 transition-colors">About Us</Link>
            <a href={`tel:${storePhoneNumber}`} className="hover:text-yellow-300 transition-colors">Contact: {storePhoneNumber}</a>
            <Link href="/terms" className="hover:text-yellow-300 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-yellow-300 transition-colors">Privacy Policy</Link>
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-white/60">
          © {new Date().getFullYear()} Freshoz.in. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
