
'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, Timestamp, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
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
        
        const dishesRef = collection(db, 'daily_dishes');
        const q = query(dishesRef, where('isActive', '==', true), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            setDish({ id: doc.id, ...doc.data() } as DailyDish);
            setIsVisible(true);
        } else {
            console.log("No active daily dish found.");
        }
        
      } catch (error) {
        console.error('Error fetching daily dish:', error);
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
      <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm md:hidden">
        <Card className="bg-orange-100 border-orange-200 p-4">
          <p className="text-orange-700 text-sm">Daily special unavailable.</p>
        </Card>
      </div>
    );
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
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/30 text-white hover:bg-black/50 z-10"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="relative h-64 w-full">
            <Image
              src={dish.imageUrl}
              alt={dish.dishName}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 384px"
              data-ai-hint="indian thali"
            />
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
