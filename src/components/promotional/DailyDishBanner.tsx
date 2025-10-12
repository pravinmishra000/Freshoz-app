'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        
        // Mock data
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
      <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white overflow-hidden shadow-2xl border-0">
        <CardContent className="p-4 relative">
            <Button variant="ghost" size="icon" onClick={handleClose} className="absolute top-2 right-2 h-6 w-6 text-white/70 hover:bg-white/20 hover:text-white rounded-full">
                <X className="h-4 w-4" />
            </Button>
            <div className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-300" />
                    <h3 className="text-lg font-bold">Aaj Ka Special</h3>
                </div>
                <div>
                    <p className="text-xl font-bold mb-1">{dish.dishName}</p>
                    <p className="text-sm text-white/80 mb-3">{dish.description}</p>
                </div>
                <div className="flex justify-between items-center w-full">
                    <Badge variant="secondary" className="bg-yellow-400 text-yellow-900 font-bold">
                        {dish.cuisineType}
                    </Badge>
                    <div className="text-2xl font-black">
                        ₹{dish.price}
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
