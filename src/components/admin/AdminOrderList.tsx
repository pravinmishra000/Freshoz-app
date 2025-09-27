
'use client';

import { useEffect, useState, useTransition } from 'react';
import { getAllOrders, updateOrderStatus } from '@/app/actions/adminActions';
import type { Order, OrderStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Loader2, Check, Package, Bike, Home, XCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const statusMap: { [key in OrderStatus]: { label: string; icon: React.ElementType; color: string } } = {
  placed: { label: 'Placed', icon: Check, color: 'bg-blue-500' },
  preparing: { label: 'Preparing', icon: Package, color: 'bg-yellow-500' },
  'out for delivery': { label: 'Out for Delivery', icon: Bike, color: 'bg-orange-500' },
  delivered: { label: 'Delivered', icon: Home, color: 'bg-primary' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'bg-destructive' },
};

function AdminOrderItem({ order, onStatusChange, isUpdating }: { order: Order, onStatusChange: (orderId: string, newStatus: OrderStatus) => void, isUpdating: boolean }) {
  const StatusIcon = statusMap[order.status].icon;
  const createdAtDate = order.createdAt instanceof Date 
        ? order.createdAt 
        : new Date((order.createdAt as any).seconds * 1000);

  return (
    <Card className="glass-card hover:scale-[1.01]">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
            <div>
                <CardTitle className="font-headline text-lg">Order {order.id}</CardTitle>
                <CardDescription>Placed on {createdAtDate.toLocaleString()}</CardDescription>
                <CardDescription>User ID: {order.userId}</CardDescription>
            </div>
            <Badge className={cn("text-white w-fit", statusMap[order.status].color)}>
                <StatusIcon className="mr-1 h-4 w-4" />
                {statusMap[order.status].label}
            </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="font-medium text-sm mb-2">Items:</p>
        <div className="space-y-2">
            {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                    <p>{item.name} <span className="text-muted-foreground">x {item.quantity}</span></p>
                    <p>₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
            ))}
        </div>
        <Separator className="my-4"/>
         <div className="flex justify-end font-bold text-lg">
            <p>Total: ₹{order.totalAmount.toFixed(2)}</p>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <div>
            <p className="font-semibold text-sm">Shipping to:</p>
            <p className="text-sm text-muted-foreground">{order.deliveryAddress.name}, {order.deliveryAddress.address}, {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.pincode}</p>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isUpdating}>
                    {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : 'Update Status'}
                    {!isUpdating && <ChevronDown className="ml-2 h-4 w-4"/>}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {Object.keys(statusMap).map(status => (
                    <DropdownMenuItem 
                        key={status}
                        onSelect={() => onStatusChange(order.firestoreId!, status as OrderStatus)}
                        disabled={order.status === status}
                    >
                        {statusMap[status as OrderStatus].label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}


export function AdminOrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const fetchOrders = () => {
    startTransition(async () => {
        setIsLoading(true);
        const allOrders = await getAllOrders();
        setOrders(allOrders as Order[]);
        setIsLoading(false);
      });
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdating(orderId);
    const result = await updateOrderStatus(orderId, newStatus);
    if (result.success) {
        toast({
            title: 'Status Updated',
            description: `Order status changed to "${statusMap[newStatus].label}".`,
        });
        // Optimistically update UI or refetch
        setOrders(prevOrders => prevOrders.map(o => o.firestoreId === orderId ? {...o, status: newStatus} : o));
    } else {
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: result.message,
        });
    }
    setIsUpdating(null);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (orders.length === 0) {
      return (
        <Card className="glass-card text-center">
            <CardContent className="p-10 space-y-4">
            <p>There are no orders yet.</p>
            </CardContent>
        </Card>
      )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <AdminOrderItem key={order.firestoreId} order={order} onStatusChange={handleStatusChange} isUpdating={isUpdating === order.firestoreId} />
      ))}
    </div>
  );
}
