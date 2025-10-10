'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ChefHat } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

  useEffect(() => {
    // Check if the banner was already closed today
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
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const q = query(
          collection(db, 'daily_dishes'),
          where('isActive', '==', true),
          where('availableDate', '>=', Timestamp.fromDate(startOfDay)),
          where('availableDate', '<=', Timestamp.fromDate(endOfDay))
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setDish({ id: doc.id, ...doc.data() } as DailyDish);
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Error fetching daily dish:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailyDish();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Store the timestamp when the banner was closed
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  };

  if (isLoading || !isVisible || !dish) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm md:hidden"
      >
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white overflow-hidden shadow-2xl border-0">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/20 text-white hover:bg-white/30 z-10"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Image Section */}
          <div className="relative h-32 w-full">
            <Image
              src={dish.imageUrl || '/images/default-dish.jpg'}
              alt={dish.dishName}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 384px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            
            {/* Dish Info Overlay */}
            <div className="absolute bottom-2 left-3 right-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-white drop-shadow-md line-clamp-1">{dish.dishName}</h3>
                  <Badge className="bg-white/20 text-white border-0 text-xs mt-1">
                    {dish.cuisineType}
                  </Badge>
                </div>
                <div className="bg-white/20 rounded-lg px-2 py-1">
                  <span className="text-white font-bold text-sm">₹{dish.price}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content Section */}
          <CardContent className="p-3">
            <p className="text-white/90 text-sm mb-3 line-clamp-2">
              {dish.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-white/80">
                <ChefHat className="h-4 w-4" />
                <span className="text-xs">Today's Special</span>
              </div>
              
              <Button 
                className="bg-white text-green-600 hover:bg-white/90 font-semibold text-sm px-4 py-2 rounded-xl"
                onClick={() => alert('Adding to cart functionality here')}
              >
                Add to Cart
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}