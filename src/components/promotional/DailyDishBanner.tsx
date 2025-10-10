'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge'; // ✅ YEH LINE ADD KAREIN
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
        // FIX: Moved date calculations inside useEffect to prevent hydration mismatch
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
        <Card className="glass-card overflow-hidden shadow-2xl border-primary/20">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/20 text-white hover:bg-black/40 z-10"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="relative h-40 w-full">
            <Image
              src={dish.imageUrl}
              alt={dish.dishName}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 384px"
              data-ai-hint={`${dish.cuisineType} food`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
             <div className="absolute bottom-2 left-3">
                <h3 className="font-bold text-xl text-white drop-shadow-md">{dish.dishName}</h3>
                <Badge variant="secondary" className="text-xs bg-white/90 text-primary">{dish.cuisineType}</Badge>
            </div>
          </div>
          
          <CardContent className="p-4">
             <CardDescription className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {dish.description}
             </CardDescription>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-primary">₹{dish.price}</p>
              <Button className="neon-button" onClick={() => alert('Booking modal would open!')}>
                <ChefHat className="mr-2 h-4 w-4" />
                Book Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
