'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

interface DailyDish {
  id: string;
  dishName: string;
  description: string;
  imageUrl: string;
  price: number;
  cuisineType: string;
}

const STORAGE_KEY = 'dailyDishBannerClosed';

export default function DailyDishBanner() {
  const [dish, setDish] = useState<DailyDish | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const closedTimestamp = localStorage.getItem(STORAGE_KEY);
    if (closedTimestamp) {
      const today = new Date().toDateString();
      const closedDate = new Date(parseInt(closedTimestamp, 10)).toDateString();
      if (today === closedDate) {
        setIsLoading(false);
        return;
      }
    }

    const fetchDailyDish = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Mock data as requested by the user
        const mockDish: DailyDish = {
          id: 'biryani-special-mock',
          dishName: 'Special Biryani',
          description: 'Aromatic and flavorful biryani, a daily delight.',
          imageUrl: 'https://firebasestorage.googleapis.com/v0/b/freshoz-fresh-fast.firebasestorage.app/o/banners%2Fdaily-dishes%2Fmobile%2Fbiryani-special.jpg?alt=media&token=eaa4ec82-a8ef-4e79-8394-c690164c82ee',
          price: 199,
          cuisineType: 'Mughlai'
        };
        
        setDish(mockDish);
        setIsVisible(true);
        
      } catch (error) {
        console.error('Error setting up mock daily dish:', error);
        setError('Unable to load daily special');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailyDish();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  };

  if (isLoading || !isVisible || !dish) {
    return null;
  }

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-xs md:hidden">
        <Card className="bg-orange-100 border-orange-200 p-4">
          <p className="text-orange-700 text-sm">Daily special unavailable.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-xs md:hidden">
      <Card className="overflow-hidden shadow-2xl border-0">
        <div className="relative w-full aspect-[9/16]">
          <Image
            src={dish.imageUrl}
            alt={dish.dishName}
            fill
            className="object-cover"
            sizes="(max-width: 240px) 100vw, 240px"
            priority
          />
        </div>
      </Card>
    </div>
  );
}
