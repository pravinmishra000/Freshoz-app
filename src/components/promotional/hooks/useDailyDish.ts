import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';

interface DailyDish {
  id: string;
  dishName: string;
  description: string;
  imageUrl: string;
  price: number;
  cuisineType: string;
}

const STORAGE_KEY = 'dailyDishBannerClosed';

export const useDailyDish = () => {
  const { appUser } = useAuth();
  const [dish, setDish] = useState<DailyDish | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReopenHint, setShowReopenHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  // Calculate time until next day 8AM
  const calculateTimeLeft = () => {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);
    
    const difference = tomorrow.getTime() - now.getTime();
    
    if (difference <= 0) {
      return '00:00:00';
    }
    
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setShowReopenHint(true);
  };

  const handleReopen = () => {
    localStorage.removeItem(STORAGE_KEY);
    setShowReopenHint(false);
    setIsVisible(true);
  };

  useEffect(() => {
    if (!appUser) {
        setIsLoading(false);
        return;
      }
  
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    const closedTimestamp = localStorage.getItem(STORAGE_KEY);
    
    if (closedTimestamp) {
      const now = new Date().getTime();
      const closedTime = parseInt(closedTimestamp, 10);
      
      // 1 hour for testing
      if (now - closedTime < 1 * 60 * 60 * 1000) { 
        setIsLoading(false);
        setShowReopenHint(true);
        return () => clearInterval(timer);
      }
    }

    const fetchDailyDish = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const mockDish: DailyDish = {
          id: 'biryani-special-mock',
          dishName: 'Special Biryani',
          description: 'Authentic biryani with tender chicken and aromatic spices',
          imageUrl: 'https://firebasestorage.googleapis.com/v0/b/freshoz-fresh-fast.firebasestorage.app/o/banners%2Fdaily-dishes%2Fmobile%2Fdaily-dish.png?alt=media&token=2a14d382-760e-4fe6-a780-cc43156e2ef7',
          price: 299,
          cuisineType: 'Special'
        };
        
        setDish(mockDish);
        setTimeLeft(calculateTimeLeft());
        setIsVisible(true);
        
      } catch (error) {
        console.error('Error setting up mock daily dish:', error);
        setError('Unable to load daily special');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailyDish();

    return () => clearInterval(timer);
  }, [appUser]);

  return {
    dish,
    isVisible,
    isLoading,
    error,
    showReopenHint,
    timeLeft,
    handleClose,
    handleReopen
  };
};