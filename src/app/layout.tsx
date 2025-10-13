import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/lib/firebase/auth-context';
import { CartProvider } from '@/lib/cart/cart-context';
import SplashScreen from '@/components/freshoz/splash-screen';
import Script from 'next/script';
import React from 'react';

// ✅ Font optimization
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

// ✅ Metadata setup
export const metadata: Metadata = {
  title: 'Freshoz — Fresh & Fast Grocery Delivery',
  description: 'Fresh groceries delivered fast to your doorstep with Freshoz.',
  keywords: ['Freshoz', 'groceries', 'delivery', 'Blinkit alternative', 'Sultanganj', 'Bhagalpur'],
  authors: [{ name: 'Revin Industries' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <html lang="en">
      <head>
        {/* ✅ Favicon & Fonts */}
        <link
          rel="icon"
          href="https://firebasestorage.googleapis.com/v0/b/freshoz-fresh-fast.firebasestorage.app/o/brand%2FPNG%2Flogo-all-size%2Flogo-transparent-128x128.png?alt=media&token=06ed7ff4-43d2-418b-9472-21d8ff33bab8"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* ✅ Google Maps API Script — safe & async load */}
        {googleMapsApiKey && (
          <Script
            id="google-maps-script"
            src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`}
            async
            defer
            strategy="afterInteractive"
          />
        )}
      </head>

      <body className={`${inter.variable} ${poppins.variable} font-body antialiased bg-white text-gray-900`}>
        <SplashScreen />
        
        {/* ✅ Recaptcha container for Firebase or OTP auth */}
        <div id="recaptcha-container"></div>

        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
