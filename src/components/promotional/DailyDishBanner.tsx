'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, X, Eye, Clock, Calendar, Clock4, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DailyDish {
  id: string;
  dishName: string;
  description: string;
  imageUrl: string;
  price: number;
  cuisineType: string;
}

interface PreOrderData {
  dishId: string;
  dishName: string;
  scheduledDate: string;
  scheduledTime: string;
  quantity: number;
  specialInstructions?: string;
}

const STORAGE_KEY = 'dailyDishBannerClosed';
const DISH_DATE_KEY = 'dailyDishCurrentDate';

export default function DailyDishBanner() {
  const [dish, setDish] = useState<DailyDish | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReopenHint, setShowReopenHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [showPreOrderDialog, setShowPreOrderDialog] = useState(false);
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);
  const [preOrderData, setPreOrderData] = useState<PreOrderData>({
    dishId: '',
    dishName: '',
    scheduledDate: '',
    scheduledTime: '',
    quantity: 1,
    specialInstructions: ''
  });

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

  // Get tomorrow's date in YYYY-MM-DD format
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get today's date in readable format
  const getTodayReadable = () => {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  // Get tomorrow's date in readable format
  const getTomorrowReadable = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  // Generate available time slots (11:45 AM se start)
  const generateTimeSlots = () => {
    const slots = [];
    let hour = 11;
    let minute = 45;
    
    // 11:45 AM to 11:45 PM tak ke slots
    for (let i = 0; i < 49; i++) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour;
      const displayTime = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
      
      slots.push({
        value: timeString,
        label: displayTime
      });
      
      // 30 minutes increment
      minute += 30;
      if (minute >= 60) {
        minute = 0;
        hour += 1;
      }
      if (hour >= 24) {
        hour = 0;
      }
    }
    
    return slots;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    const closedTimestamp = localStorage.getItem(STORAGE_KEY);
    
    if (closedTimestamp) {
      const now = new Date().getTime();
      const closedTime = parseInt(closedTimestamp, 10);
      
      // Changed from 12 hours to 1 hour for easier testing
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
        
        // Pre-order data initialize karein
        setPreOrderData({
          dishId: mockDish.id,
          dishName: mockDish.dishName,
          scheduledDate: getTomorrowDate(),
          scheduledTime: '11:45',
          quantity: 1,
          specialInstructions: ''
        });
        
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
  }, []);

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

  const handlePreOrderClick = () => {
    setShowPreOrderDialog(true);
  };

  const handlePreOrderSubmit = () => {
    // Yahan aap API call kar sakte hain pre-order save karne ke liye
    console.log('Pre-order Data:', preOrderData);
    
    // Success message with cancellation policy
    const successMessage = `✅ ${preOrderData.dishName} pre-ordered successfully!

📅 Delivery Date: ${getTomorrowReadable()}
⏰ Delivery Time: ${generateTimeSlots().find(slot => slot.value === preOrderData.scheduledTime)?.label}
📦 Quantity: ${preOrderData.quantity}

📋 Cancellation Policy:
✓ Cancel today (${getTodayReadable()}) - FULL REFUND
✗ Cancel tomorrow (${getTomorrowReadable()}) - NO REFUND

Thank you for your pre-order!`;

    alert(successMessage);
    
    setShowPreOrderDialog(false);
  };

  const timeSlots = generateTimeSlots();

  if (showReopenHint && !isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={handleReopen}
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg px-3 py-2 text-xs font-semibold"
        >
          <Eye className="h-3 w-3 mr-1" />
          Tomorrow's Special
        </Button>
      </div>
    );
  }

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
    <>
      <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-xs md:hidden">
        <Card className="overflow-hidden shadow-2xl border-0 bg-white">
          {/* Close Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose} 
            className="absolute top-2 right-2 h-6 w-6 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-full z-10 bg-white/80 backdrop-blur-sm"
          >
            <X className="h-3 w-3" />
          </Button>

          {/* Image Section */}
          <div className="relative aspect-[9/16] w-full">
            <Image
              src={dish.imageUrl}
              alt={dish.dishName}
              fill
              className="object-cover"
              sizes="(max-width: 320px) 100vw, 320px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            
            <div className="absolute top-2 left-2">
              <div className="flex items-center gap-1 bg-black/60 text-white px-2 py-1 rounded-full">
                <Sparkles className="h-3 w-3 text-yellow-300" />
                <span className="text-xs font-bold">TOMORROW'S SPECIAL</span>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="absolute top-2 right-2">
              <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                <Clock className="h-3 w-3" />
                {timeLeft}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <CardContent className="p-3">
            <div className="mb-2">
              <h3 className="font-bold text-gray-800 text-sm line-clamp-1">{dish.dishName}</h3>
              <Badge variant="outline" className="mt-1 text-xs bg-green-50 text-green-700 border-green-200">
                {dish.cuisineType}
              </Badge>
            </div>

            <p className="text-gray-600 text-xs mb-3 line-clamp-2">
              {dish.description}
            </p>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-green-600">₹{dish.price}</p>
                <p className="text-xs text-gray-500 line-through">₹399</p>
              </div>
              <Button 
                onClick={handlePreOrderClick}
                size="sm" 
                className="bg-green-600 hover:bg-green-700 text-white font-semibold text-xs px-3 py-2 rounded-lg"
              >
                <Calendar className="h-3 w-3 mr-1" />
                PRE-ORDER
              </Button>
            </div>

            <div className="mt-2 text-center">
              <span className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                🎉 25% OFF TOMORROW ONLY
              </span>
            </div>

            {/* Delivery Info */}
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <Clock4 className="h-3 w-3" />
                Delivery after 11:45 AM tomorrow
              </p>
            </div>

            {/* Cancellation Policy Hint */}
            <div className="mt-2 flex items-center justify-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowPolicyDialog(true)}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <Info className="h-3 w-3" />
                Cancellation Policy
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pre-order Scheduling Dialog */}
      <Dialog open={showPreOrderDialog} onOpenChange={setShowPreOrderDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Schedule Your Pre-order
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Order Summary */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm">{dish.dishName}</h4>
                  <p className="text-xs text-gray-600">₹{dish.price} × {preOrderData.quantity}</p>
                </div>
                <p className="font-bold text-green-600">₹{dish.price * preOrderData.quantity}</p>
              </div>
            </div>

            {/* Delivery Date */}
            <div className="space-y-2">
              <Label htmlFor="delivery-date" className="text-sm font-medium">
                Delivery Date
              </Label>
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  Tomorrow ({getTomorrowReadable()})
                </span>
              </div>
              <p className="text-xs text-gray-500">Pre-orders are for tomorrow only</p>
            </div>

            {/* Delivery Time */}
            <div className="space-y-2">
              <Label htmlFor="delivery-time" className="text-sm font-medium">
                Preferred Delivery Time
              </Label>
              <Select 
                value={preOrderData.scheduledTime} 
                onValueChange={(value) => setPreOrderData({...preOrderData, scheduledTime: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select delivery time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot.value} value={slot.value}>
                      {slot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">Delivery starts from 11:45 AM</p>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium">
                Quantity
              </Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreOrderData({...preOrderData, quantity: Math.max(1, preOrderData.quantity - 1)})}
                  disabled={preOrderData.quantity <= 1}
                >
                  -
                </Button>
                <span className="font-medium w-8 text-center">{preOrderData.quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreOrderData({...preOrderData, quantity: preOrderData.quantity + 1})}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="space-y-2">
              <Label htmlFor="instructions" className="text-sm font-medium">
                Special Instructions (Optional)
              </Label>
              <textarea
                id="instructions"
                placeholder="Any special requests..."
                className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none"
                rows={2}
                value={preOrderData.specialInstructions}
                onChange={(e) => setPreOrderData({...preOrderData, specialInstructions: e.target.value})}
              />
            </div>

            {/* Cancellation Policy Summary */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-orange-600 mt-0.5" />
                <div className="text-xs text-orange-800">
                  <p className="font-semibold">Cancellation Policy:</p>
                  <ul className="mt-1 space-y-1">
                    <li>✅ Cancel today ({getTodayReadable()}) - Full refund</li>
                    <li>❌ Cancel tomorrow ({getTomorrowReadable()}) - No refund</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2">
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-xs text-gray-500">Total Amount</p>
                <p className="text-lg font-bold text-green-600">₹{dish.price * preOrderData.quantity}</p>
              </div>
              <Button 
                onClick={handlePreOrderSubmit}
                className="bg-green-600 hover:bg-green-700"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Confirm Pre-order
              </Button>
            </div>
            <p className="text-xs text-gray-500 text-center">
              🎉 You saved ₹{(399 - dish.price) * preOrderData.quantity} with this pre-order!
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancellation Policy Detail Dialog */}
      <Dialog open={showPolicyDialog} onOpenChange={setShowPolicyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-orange-600" />
              Pre-order Cancellation Policy
            </DialogTitle>
            <DialogDescription>
              Understand our cancellation and refund policy for pre-orders.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Policy Details */}
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-green-800">Cancellation Today</p>
                    <p className="text-xs text-green-700">Full refund available if cancelled today ({getTodayReadable()})</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✗</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-red-800">Cancellation Tomorrow</p>
                    <p className="text-xs text-red-700">No refund available if cancelled tomorrow ({getTomorrowReadable()})</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reason Explanation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>Why this policy?</strong> We prepare ingredients in advance based on pre-orders to ensure freshness and quality. Cancellations on delivery day result in food waste and losses.
              </p>
            </div>

            {/* Contact Information */}
            <div className="text-center">
              <p className="text-xs text-gray-600">
                Need help? Contact us at{" "}
                <a href="tel:+911234567890" className="text-green-600 hover:underline">
                  +91 12345 67890
                </a>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowPolicyDialog(false)} className="w-full">
              I Understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
