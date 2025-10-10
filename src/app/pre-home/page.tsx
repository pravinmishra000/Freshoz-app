// src/app/pre-home/page.tsx
'use client';

import { Clock, Shield, Truck, Phone } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase/client';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

// Declare recaptchaVerifier in window object
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export default function PreHomeScreen() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  // Setup Recaptcha on component mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': () => {
            console.log('reCAPTCHA solved');
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired');
          }
        });
      }
    } catch (error) {
      console.error('Error setting up recaptcha:', error);
    }
  }, []);

  const handleSendOTP = async () => {
    if (!phone || phone.length !== 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }
    if (!window.recaptchaVerifier) {
      alert('Recaptcha not initialized. Please refresh the page.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Sending OTP to:', phone);
      
      const appVerifier = window.recaptchaVerifier;
      const phoneNumber = `+91${phone}`; // Add country code for India
      
      // Actual Firebase OTP sending
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      
      setConfirmationResult(confirmation);
      setStep('otp');
      alert(`OTP sent to ${phone}. Please check your messages.`);
      
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      
      // Specific error handling
      if (error.code === 'auth/invalid-phone-number') {
        alert('Invalid phone number format. Please enter a valid Indian number.');
      } else if (error.code === 'auth/too-many-requests') {
        alert('Too many attempts. Please try again later.');
      } else if (error.code === 'auth/quota-exceeded') {
        alert('SMS quota exceeded. Please try again later.');
      } else {
        alert(`Failed to send OTP: ${error.message}`);
      }
      
      // Reset recaptcha on error
      try {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
        });
      } catch (recaptchaError) {
        console.error('Error resetting recaptcha:', recaptchaError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      alert('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Verifying OTP:', otp);
      
      // Actual Firebase OTP verification
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      
      console.log('User signed in successfully:', user);
      alert('Login successful! Welcome to Freshoz.');
      
      // Redirect to home page after successful login
      window.location.href = '/products';
      
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      
      if (error.code === 'auth/invalid-verification-code') {
        alert('Invalid OTP. Please check the code and try again.');
      } else if (error.code === 'auth/code-expired') {
        alert('OTP has expired. Please request a new one.');
      } else {
        alert(`OTP verification failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(value);
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-80 to-orange-200">
      {/* Header - Simple Logo */}
      <header className="bg-gradient-to-r from-purple-300 to-purple-400 backdrop-blur-md p-4 border-b border-purple-400">
        <h1 className="text-2xl font-black text-center uppercase relative">
          <span className="text-green-800 drop-shadow-[0_0_15px_rgba(34,197,94,0.8)] relative z-10">
            Freshoz
          </span>
        </h1>
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
              <p className="text-sm font-semibold text-gray-800">
                {step === 'phone' ? 'Login/Sign Up' : 'Enter OTP'}
              </p>
              <p className="text-xs text-muted-foreground">
                {step === 'phone' 
                  ? 'Get personalized offers & faster checkout' 
                  : `We sent a code to ${phone}`
                }
              </p>
            </div>
          </div>
          
          {step === 'phone' ? (
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="Enter phone number"
                value={phone}
                onChange={handlePhoneChange}
                className="flex-1 p-3 border border-gray-300 bg-white text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground"
                maxLength={10}
              />
              <button 
                onClick={handleSendOTP}
                disabled={isLoading || phone.length !== 10}
                className="bg-primary text-white px-4 py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Get OTP'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={handleOtpChange}
                  className="flex-1 p-3 border border-gray-300 bg-white text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground"
                  maxLength={6}
                />
                <button 
                  onClick={handleVerifyOTP}
                  disabled={isLoading || otp.length !== 6}
                  className="bg-primary text-white px-4 py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
              <button 
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                }}
                className="text-xs text-primary hover:underline"
              >
                Change phone number
              </button>
            </div>
          )}

          {/* Hidden reCAPTCHA container - IMPORTANT */}
          <div id="recaptcha-container" className="my-2"></div>
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

