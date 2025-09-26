'use client';

import { useAuth } from '@/lib/firebase/auth-context';
import { orders as mockOrders } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Order, OrderStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check, Package, Bike, Home, XCircle } from 'lucide-react';

const statusMap: { [key in OrderStatus]: { label: string; icon: React.ElementType; color: string } } = {
    placed: { label: 'Placed', icon: Check, color: 'bg-blue-500' },
    preparing: { label: 'Preparing', icon: Package, color: 'bg-yellow-500' },
    'out for delivery': { label: 'Out for Delivery', icon: Bike, color: 'bg-orange-500' },
    delivered: { label: 'Delivered', icon: Home, color: 'bg-primary' },
    cancelled: { label: 'Cancelled', icon: XCircle, color: 'bg-destructive' },
};


function OrderItem({ order }: { order: Omit<Order, 'address'> }) {
    const StatusIcon = statusMap[order.status].icon;
  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline text-lg">Order #{order.id}</CardTitle>
                <CardDescription>Placed on {new Date(order.createdAt).toLocaleDateString()}</CardDescription>
            </div>
            <Badge className={cn("text-white", statusMap[order.status].color)}>
                <StatusIcon className="mr-1 h-4 w-4" />
                {statusMap[order.status].label}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
            {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-4">
                        <div className="relative h-12 w-12 rounded-md overflow-hidden">
                            <Image src={`https://picsum.photos/seed/${item.productId}/100/100`} alt={item.name} fill className="object-cover"/>
                        </div>
                        <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
            ))}
        </div>
        <Separator/>
        <div className="flex justify-end font-bold text-lg">
            <p>Total: ${order.total.toFixed(2)}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline">View Details</Button>
        <Button variant="ghost" className="ml-2">Track Order</Button>
      </CardFooter>
    </Card>
  );
}

export function OrderHistory() {
  const { authUser } = useAuth();

  // For now, using mock data.
  // In a real app, you would fetch this from Firestore based on authUser.uid
  const userOrders = mockOrders.filter(order => order.userId === 'user1');

  if (!authUser) {
    return (
      <Card className="glass-card text-center">
        <CardContent className="p-10">
          <p>Please log in to view your order history.</p>
        </CardContent>
      </Card>
    );
  }
  
  if (userOrders.length === 0) {
      return (
        <Card className="glass-card text-center">
            <CardContent className="p-10">
            <p>You haven't placed any orders yet.</p>
            </CardContent>
        </Card>
      )
  }

  return (
    <div className="space-y-4">
      {userOrders.map((order) => (
        <OrderItem key={order.id} order={order} />
      ))}
    </div>
  );
}
