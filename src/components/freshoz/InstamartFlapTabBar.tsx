// components/InstamartFlapTabBar.jsx

'use client';

import { useState } from 'react';
import { ShoppingBag, Home, Star, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

// Custom animation for glow (Ensure this is in your tailwind.config.js)
// @keyframes pulse-slow: { '0%, 100%': { transform: 'scaleX(0.95)', opacity: '0.7' }, '50%': { transform: 'scaleX(1)', opacity: '1' } }

const tabs = [
  { name: 'Home', icon: Home },
  { name: 'Instamart', icon: ShoppingBag },
  { name: 'Favorites', icon: Star },
  { name: 'Profile', icon: User },
  { name: 'Settings', icon: Settings },
];

const InstamartFlapTabBar = () => {
  const [activeTab, setActiveTab] = useState('Instamart');

  return (
    <div className='flex justify-center items-end bg-gray-950 p-4 rounded-xl shadow-2xl overflow-x-auto gap-4 md:gap-8 lg:gap-10'>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;

        return (
          <div
            key={tab.name}
            className='flex flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-105'
            onClick={() => setActiveTab(tab.name)}
          >
            <div className='relative flex flex-col items-center justify-center pt-2'>
              {/* 1. Icon */}
              <tab.icon
                className={cn(
                  'text-3xl transition-colors duration-300 mb-2',
                  isActive ? 'text-green-400 scale-110' : 'text-gray-400',
                )}
              />

              {/* 2. Curved Envelope/Flap Indicator - The Instamart Look */}
              <div
                className={cn(
                  'absolute top-[30px] w-20 h-10 transition-all duration-300',
                  isActive
                    ? 'bg-gray-800 rounded-b-full shadow-lg z-0' // Active state: wide, curved bottom
                    : 'bg-transparent h-0', // Inactive state: hidden
                )}
              >
                {isActive && (
                  <>
                    {/* Feather Effect on Curved Edges */}
                    <div className='absolute inset-x-0 bottom-0 h-full bg-gradient-to-r from-transparent via-green-400/20 to-transparent blur-sm opacity-50 z-10'></div>

                    {/* Animated Glow/Shimmer at the Bottom Curve */}
                    <div className='absolute inset-x-0 bottom-0 h-1 w-full animate-pulse-slow bg-gradient-to-r from-transparent via-green-500/90 to-transparent rounded-full z-20'></div>
                  </>
                )}
              </div>
            </div>

            {/* 3. Tab Name (Below the curve) */}
            <span
              className={cn(
                'mt-10 text-sm font-medium transition-colors duration-300 z-30', // z-30 to keep text above the flap
                isActive ? 'text-green-400' : 'text-gray-400',
              )}
            >
              {tab.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default InstamartFlapTabBar;
