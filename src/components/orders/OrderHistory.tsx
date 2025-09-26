'use client';

import { useAuth } from '@/lib/firebase/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Order, OrderStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check, Package, Bike, Home, XCircle, Loader2 } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { getOrdersForUser } from '@/app/actions/orderActions';
import Link from 'next/link';

const statusMap: { [key in OrderStatus]: { label: string; icon: React.ElementType; color: string } } = {
    placed: { label: 'Placed', icon: Check, color: 'bg-blue-500' },
    preparing: { label: 'Preparing', icon: Package, color: 'bg-yellow-500' },
    'out for delivery': { label: 'Out for Delivery', icon: Bike, color: 'bg-orange-500' },
    delivered: { label: 'Delivered', icon: Home, color: 'bg-primary' },
    cancelled: { label: 'Cancelled', icon: XCircle, color: 'bg-destructive' },
};


function OrderItem({ order }: { order: Order }) {
    const StatusIcon = statusMap[order.status].icon;
    const createdAtDate = order.createdAt instanceof Date 
        ? order.createdAt 
        : new Date((order.createdAt as any).seconds * 1000);

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline text-lg">Order #{order.id}</CardTitle>
                <CardDescription>Placed on {createdAtDate.toLocaleDateString()}</CardDescription>
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
            <p>Total: ${order.totalAmount.toFixed(2)}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline">View Details</Button>
      </CardFooter>
    </Card>
  );
}

export function OrderHistory() {
  const { authUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (authUser?.uid) {
      startTransition(async () => {
        setIsLoading(true);
        const userOrders = await getOrdersForUser(authUser.uid);
        setOrders(userOrders as Order[]);
        setIsLoading(false);
      });
    } else {
        setIsLoading(false);
    }
  }, [authUser]);


  if (isLoading) {
      return (
          <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      )
  }

  if (!authUser) {
    return (
      <Card className="glass-card text-center">
        <CardContent className="p-10 space-y-4">
          <p>Please log in to view your order history.</p>
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (orders.length === 0) {
      return (
        <Card className="glass-card text-center">
            <CardContent className="p-10 space-y-4">
            <p>You haven't placed any orders yet.</p>
             <Button asChild>
                <Link href="/">Start Shopping</Link>
            </Button>
            </CardContent>
        </Card>
      )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderItem key={order.id} order={order} />
      ))}
    </div>
  );
}
