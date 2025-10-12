import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, Info } from 'lucide-react';

interface PreOrderData {
  dishId: string;
  dishName: string;
  scheduledDate: string;
  scheduledTime: string;
  quantity: number;
  specialInstructions?: string;
}

interface DailyDish {
  id: string;
  dishName: string;
  description: string;
  imageUrl: string;
  price: number;
  cuisineType: string;
}

interface PreOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dish: DailyDish;
  preOrderData: PreOrderData;
  setPreOrderData: (data: PreOrderData) => void;
  timeSlots: Array<{ value: string; label: string }>;
  getTodayReadable: () => string;
  getTomorrowReadable: () => string;
  onSubmit: () => void;
}

export default function PreOrderDialog({
  open,
  onOpenChange,
  dish,
  preOrderData,
  setPreOrderData,
  timeSlots,
  getTodayReadable,
  getTomorrowReadable,
  onSubmit
}: PreOrderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-5 w-5 text-green-600" />
            Schedule Your Pre-order
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
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
            <Label className="text-sm font-medium">Delivery Date</Label>
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
            <Label className="text-sm font-medium">Preferred Delivery Time</Label>
            <Select 
              value={preOrderData.scheduledTime} 
              onValueChange={(value) => setPreOrderData({...preOrderData, scheduledTime: value})}
            >
              <SelectTrigger className="w-full">
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
            <Label className="text-sm font-medium">Quantity</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreOrderData({...preOrderData, quantity: Math.max(1, preOrderData.quantity - 1)})}
                disabled={preOrderData.quantity <= 1}
                className="h-8 w-8"
              >
                -
              </Button>
              <span className="font-medium w-8 text-center">{preOrderData.quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreOrderData({...preOrderData, quantity: preOrderData.quantity + 1})}
                className="h-8 w-8"
              >
                +
              </Button>
            </div>
          </div>

          {/* Special Instructions */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Special Instructions (Optional)</Label>
            <textarea
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

        <DialogFooter className="flex flex-col gap-2 sm:flex-col pt-4">
          <div className="flex items-center justify-between w-full gap-4">
            <div className="flex-shrink-0">
              <p className="text-xs text-gray-500">Total Amount</p>
              <p className="text-lg font-bold text-green-600">₹{dish.price * preOrderData.quantity}</p>
            </div>
            <Button 
              onClick={onSubmit}
              className="bg-green-600 hover:bg-green-700 flex-shrink-0"
              size="sm"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Confirm Pre-order
            </Button>
          </div>
          <p className="text-xs text-gray-500 text-center">
            🎉 You saved ₹{(399 - dish.price) * preOrderData.quantity}!
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}