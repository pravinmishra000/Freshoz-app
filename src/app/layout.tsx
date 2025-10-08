
import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/lib/firebase/auth-context';
import { CartProvider } from '@/lib/cart/cart-context';
import SplashScreen from '@/components/freshoz/splash-screen';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Freshoz-fresh',
  description: 'Fresh groceries delivered to your door.',
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
        <link rel="icon" href="https://firebasestorage.googleapis.com/v0/b/freshoz-fresh-fast.firebasestorage.app/o/brand%2FPNG%2Flogo-all-size%2Flogo-transparent-128x128.png?alt=media&token=06ed7ff4-43d2-418b-9472-21d8ff33bab8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        
        {/* Google Maps API Script - Global load hoga */}
        {googleMapsApiKey && (
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&loading=async`}
            strategy="lazyOnload"
          />
        )}
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-body antialiased`}>
        <SplashScreen />
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
