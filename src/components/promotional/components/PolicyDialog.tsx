import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

interface PolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  getTodayReadable: () => string;
  getTomorrowReadable: () => string;
}

export default function PolicyDialog({
  open,
  onOpenChange,
  getTodayReadable,
  getTomorrowReadable
}: PolicyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Info className="h-5 w-5 text-orange-600" />
            Pre-order Cancellation Policy
          </DialogTitle>
          <DialogDescription className="text-sm">
            Understand our cancellation and refund policy for pre-orders.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
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
          <Button onClick={() => onOpenChange(false)} className="w-full">
            I Understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}