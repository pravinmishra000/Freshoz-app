'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Truck, Clock, ArrowLeft, Home, Package } from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import Link from 'next/link';

interface Order {
  id: string;
  userId: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  deliveryAddress: any;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  createdAt: any;
  deliverySlot: string;
  substitution: string;
  deliveryTip: number;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const { appUser } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderDoc = await getDoc(doc(db, 'orders', params.orderId as string));
        if (orderDoc.exists()) {
          setOrder({ id: orderDoc.id, ...orderDoc.data() } as Order);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.orderId) {
      fetchOrder();
    }
  }, [params.orderId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="border-0 bg-transparent shadow-none">
          <CardHeader>
            <div className="flex items-center gap-4 mb-2">
              <div>
                <CardTitle className="font-headline text-4xl font-bold text-primary">Order Details</CardTitle>
                <CardDescription>Loading your order information...</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <Card className="border-0 bg-transparent shadow-none">
          <CardHeader>
            <div className="flex items-center gap-4 mb-2">
              <div>
                <CardTitle className="font-headline text-4xl font-bold text-primary">Order Not Found</CardTitle>
                <CardDescription>The order you're looking for doesn't exist.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/orders')}>View All Orders</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const deliverySlots = {
    morning: '7 AM - 10 AM',
    afternoon: '12 PM - 3 PM', 
    evening: '5 PM - 8 PM'
  };

  const substitutionLabels = {
    call: 'Call me for substitutes',
    best: 'Choose best substitute for me', 
    none: 'Do not substitute'
  };

  return (
    <div className="space-y-6">
      {/* Header - Aapke Design Pattern Ke According */}
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader>
          <div className="flex items-center gap-4 mb-2">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <div>
              <CardTitle className="font-headline text-4xl font-bold text-primary">Order Confirmed!</CardTitle>
              <CardDescription>
                Thank you for your purchase. Your order #{order.id} has been received.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline">
                <Truck className="h-5 w-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Delivery Address</h3>
                <div className="text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">{order.deliveryAddress.name}</p>
                  <p>{order.deliveryAddress.address}</p>
                  <p>{order.deliveryAddress.city}, {order.deliveryAddress.district}</p>
                  <p>{order.deliveryAddress.state} - {order.deliveryAddress.pincode}</p>
                  <p>📞 {order.deliveryAddress.phone}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Delivery Slot
                  </h3>
                  <p className="text-muted-foreground">
                    {deliverySlots[order.deliverySlot as keyof typeof deliverySlots] || order.deliverySlot}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Substitution Preference
                  </h3>
                  <p className="text-muted-foreground">
                    {substitutionLabels[order.substitution as keyof typeof substitutionLabels] || order.substitution}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="font-headline">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-primary">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary - Right Column */}
        <div className="space-y-6">
          <Card className="glass-card sticky top-24">
            <CardHeader>
              <CardTitle className="font-headline">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items Total</span>
                <span>₹{order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="text-green-600 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform Fee</span>
                <span>₹5.00</span>
              </div>
              {order.deliveryTip > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Tip</span>
                  <span className="text-primary">₹{order.deliveryTip.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between font-bold text-lg text-foreground">
                  <span>Grand Total</span>
                  <span>₹{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="font-headline text-lg">Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method:</span>
                <span className="font-medium">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="text-green-600 font-semibold">Confirmed</span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button asChild className="w-full neon-button">
              <Link href="/products">
                <Home className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/orders">
                <ArrowLeft className="mr-2 h-4 w-4" />
                View All Orders
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}