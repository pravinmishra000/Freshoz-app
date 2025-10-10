
// src/app/pre-home/page.tsx
import { Clock, Shield, Truck, Phone } from 'lucide-react';
import Link from 'next/link';

export default function PreHomeScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50">
      {/* Header - Simple Logo */}
      <header className="bg-white/80 backdrop-blur-md p-4 border-b border-gray-200">
        <h1 className="text-2xl font-black text-primary text-center uppercase">Freshoz</h1>
      </header>

      <main className="p-4">
        {/* Hero Banner with Ongoing Offers */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 text-gray-800 mb-6 border border-white shadow-lg">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2 text-primary">Get 25% OFF 🎉</h2>
              <p className="text-muted-foreground text-sm mb-3">On your first order above ₹299</p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Offer ends in 31st Dec</span>
              </div>
            </div>
            <div className="bg-primary/10 rounded-lg p-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">25%</div>
                <div className="text-xs text-primary">OFF</div>
              </div>
            </div>
          </div>
        </div>

        {/* Login by Phone Number + OTP - 2nd Position */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white shadow-lg mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Phone className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Login/Sign Up</p>
              <p className="text-xs text-muted-foreground">Get personalized offers & faster checkout</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="tel"
              placeholder="Enter phone number"
              className="flex-1 p-3 border border-gray-300 bg-white text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground"
            />
            <button className="bg-primary text-white px-4 py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors">
              Get OTP
            </button>
          </div>
        </div>

        {/* Delivery Time Estimate */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Delivery in 25-35 mins</p>
                <p className="text-xs text-muted-foreground">Fastest in the city</p>
              </div>
            </div>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
              ⚡ Express
            </div>
          </div>
        </div>

        {/* Start Shopping Button - Smaller */}
        <div className="mb-6">
          <Link 
            href="/products" 
            className="block w-full bg-primary text-white hover:bg-primary/90 py-3 px-6 rounded-2xl font-bold text-center shadow-lg hover:shadow-xl transition-all duration-300 mb-2"
          >
            Start Shopping Now
          </Link>

          {/* Guest Checkout Option */}
          <p className="text-center text-muted-foreground text-sm">
            or{' '}
            <Link href="/products" className="text-primary font-semibold hover:underline">
              Continue as Guest
            </Link>
          </p>
        </div>

        {/* Trust Badges - Square Cards for Mobile */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-100/60 backdrop-blur-md rounded-xl p-4 text-center border border-green-200 shadow-lg aspect-square flex flex-col items-center justify-center">
            <Truck className="h-8 w-8 text-primary mb-2" />
            <p className="text-sm font-semibold text-gray-800">Free Delivery</p>
            <p className="text-xs text-muted-foreground mt-1">Above ₹199</p>
          </div>
          <div className="bg-green-100/60 backdrop-blur-md rounded-xl p-4 text-center border border-green-200 shadow-lg aspect-square flex flex-col items-center justify-center">
            <Shield className="h-8 w-8 text-primary mb-2" />
            <p className="text-sm font-semibold text-gray-800">Quality</p>
            <p className="text-xs text-muted-foreground mt-1">Guaranteed</p>
          </div>
          <div className="bg-green-100/60 backdrop-blur-md rounded-xl p-4 text-center border border-green-200 shadow-lg aspect-square flex flex-col items-center justify-center">
            <Clock className="h-8 w-8 text-primary mb-2" />
            <p className="text-sm font-semibold text-gray-800">12/7</p>
            <p className="text-xs text-muted-foreground mt-1">Support</p>
          </div>
          <div className="bg-green-100/60 backdrop-blur-md rounded-xl p-4 text-center border border-green-200 shadow-lg aspect-square flex flex-col items-center justify-center">
            <div className="h-8 w-8 mb-2 flex items-center justify-center text-primary text-2xl font-bold">⭐</div>
            <p className="text-sm font-semibold text-gray-800">Premium</p>
            <p className="text-xs text-muted-foreground mt-1">Quality</p>
          </div>
        </div>
      </main>
    </div>
  );
}
