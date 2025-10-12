import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, X, Calendar, Clock4, Info, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface DailyDish {
  id: string;
  dishName: string;
  description: string;
  imageUrl: string;
  price: number;
  cuisineType: string;
}

interface BannerCardProps {
  dish: DailyDish;
  timeLeft: string;
  onClose: () => void;
  onPreOrderClick: () => void;
  onPolicyClick: () => void;
}

export default function BannerCard({ 
  dish, 
  timeLeft, 
  onClose, 
  onPreOrderClick, 
  onPolicyClick 
}: BannerCardProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-xs md:hidden">
      <Card className="overflow-hidden shadow-2xl border-0 bg-white">
        {/* Close Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="absolute top-2 right-2 h-6 w-6 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-full z-10 bg-white/80 backdrop-blur-sm"
        >
          <X className="h-3 w-3" />
        </Button>

        {/* Image Section - Compact Size */}
        <div className="relative h-20 w-full">
          <Image
            src={dish.imageUrl}
            alt={dish.dishName}
            fill
            className="object-cover"
            sizes="(max-width: 320px) 100vw, 320px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          
          <div className="absolute top-1 left-1">
            <div className="flex items-center gap-1 bg-black/70 text-white px-1.5 py-0.5 rounded-full">
              <Sparkles className="h-2.5 w-2.5 text-yellow-300" />
              <span className="text-[10px] font-bold">TOMORROW'S SPECIAL</span>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="absolute top-1 right-1">
            <div className="flex items-center gap-1 bg-green-600 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold">
              <Clock className="h-2.5 w-2.5" />
              {timeLeft}
            </div>
          </div>
        </div>

        {/* Content Section - Compact Layout */}
        <CardContent className="p-2 space-y-1.5">
          <div>
            <h3 className="font-bold text-gray-800 text-sm line-clamp-1 leading-tight">{dish.dishName}</h3>
            <Badge variant="outline" className="mt-0.5 text-[10px] bg-green-50 text-green-700 border-green-200 px-1.5 py-0">
              {dish.cuisineType}
            </Badge>
          </div>

          <p className="text-gray-600 text-xs line-clamp-2 leading-tight">
            {dish.description}
          </p>

          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-lg font-black text-green-600 leading-none">₹{dish.price}</p>
              <p className="text-[10px] text-gray-500 line-through leading-none">₹399</p>
            </div>
            <Button 
              onClick={onPreOrderClick}
              size="sm" 
              className="bg-green-600 hover:bg-green-700 text-white font-semibold text-xs px-2 py-1 h-7 rounded-lg"
            >
              <Calendar className="h-2.5 w-2.5 mr-1" />
              PRE-ORDER
            </Button>
          </div>

          <div className="text-center pt-1">
            <span className="inline-block bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              🎉 25% OFF
            </span>
          </div>

          {/* Delivery Info */}
          <div className="text-center">
            <p className="text-[10px] text-gray-500 flex items-center justify-center gap-0.5 leading-tight">
              <Clock4 className="h-2.5 w-2.5" />
              Delivery after 11:45 AM
            </p>
          </div>

          {/* Cancellation Policy Hint */}
          <div className="flex items-center justify-center pt-0.5">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onPolicyClick}
              className="text-[10px] text-gray-500 hover:text-gray-700 flex items-center gap-0.5 h-5 px-1"
            >
              <Info className="h-2.5 w-2.5" />
              Cancellation Policy
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}