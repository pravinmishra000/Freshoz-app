import { OrderTracker } from '@/components/tracking/OrderTracker';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function TrackOrderPage() {
  return (
    <div className="space-y-6">
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader>
          <CardTitle className="font-headline text-4xl font-bold text-primary">Track Your Order</CardTitle>
          <CardDescription>
            Enter your order ID to see real-time updates on your delivery. For now, here's a sample order.
          </CardDescription>
        </CardHeader>
      </Card>
      <OrderTracker />
    </div>
  );
}
