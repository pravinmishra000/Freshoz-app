
import { OrderHistory } from '@/components/orders/OrderHistory';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function OrderHistoryPage() {
  return (
    <div className="space-y-6">
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader>
           <div className="flex items-center gap-4 mb-2">
            <div>
                <CardTitle className="font-headline text-4xl font-bold text-primary">Your Orders</CardTitle>
                <CardDescription>
                  View your past and current orders.
                </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
      <OrderHistory />
    </div>
  );
}
