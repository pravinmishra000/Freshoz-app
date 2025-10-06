
'use client';

import { useCart } from '@/lib/cart/cart-context';
import { useAuth } from '@/lib/firebase/auth-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { Loader2, CreditCard, LogIn, CheckCircle, XCircle, Smartphone } from 'lucide-react';
import { placeOrder } from '@/app/actions/orderActions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import React from 'react';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

const addressSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  phone: z.string().min(10, 'A valid phone number is required.'),
  address: z.string().min(3, 'Street address is required.'),
  city: z.string().min(2, 'City is required.'),
  district: z.string().min(2, 'District is required.'),
  state: z.string().min(2, 'State is required.'),
  pincode: z.string().min(6, 'A valid 6-digit Pincode is required.').max(6),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export function CheckoutFlow() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { authUser, appUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState('cod');
  const [upiId, setUpiId] = React.useState('');
  const [isVerifyingUpi, setIsVerifyingUpi] = React.useState(false);
  const [isUpiVerified, setIsUpiVerified] = React.useState(false);
  const [upiError, setUpiError] = React.useState('');

  const deliveryFee = cartTotal > 0 ? 5.0 : 0;
  const totalAmount = cartTotal + deliveryFee;

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: appUser?.displayName || '',
      phone: appUser?.phoneNumber || '',
      address: appUser?.address?.address || '',
      city: appUser?.address?.city || '',
      district: appUser?.address?.district || 'Bhagalpur',
      state: 'Bihar',
      pincode: appUser?.address?.pincode || '',
    },
  });

  React.useEffect(() => {
    if (appUser) {
        form.reset({
            name: appUser.displayName || '',
            phone: appUser.phoneNumber || '',
            address: appUser.address?.address || '',
            city: appUser.address?.city || '',
            district: appUser.address?.district || 'Bhagalpur',
            state: 'Bihar',
            pincode: appUser.address?.pincode || '',
        });
    }
  }, [appUser, form]);

  const handleUpiIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpiId(e.target.value);
    setIsUpiVerified(false);
    setUpiError('');
  };

  const handleVerifyUpi = async () => {
    if (!upiId || !upiId.includes('@')) {
      setUpiError('Please enter a valid UPI ID (e.g., yourname@okbank).');
      return;
    }
    setIsVerifyingUpi(true);
    setUpiError('');
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
    
    if (upiId.length > 5) {
      setIsUpiVerified(true);
      setUpiError('');
    } else {
      setIsUpiVerified(false);
      setUpiError('Could not verify UPI ID. Please check and try again.');
    }
    setIsVerifyingUpi(false);
  };

  const onSubmit: SubmitHandler<AddressFormValues> = async (data) => {
    if (!authUser || cartItems.length === 0) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to place an order.' });
        router.push('/login?redirect=/checkout');
        return;
    }

    if (paymentMethod === 'upi' && !isUpiVerified) {
        toast({ variant: 'destructive', title: 'UPI Not Verified', description: 'Please verify your UPI ID before placing the order.' });
        return;
    }
    
    setIsLoading(true);
    
    try {
        await placeOrder({
            userId: authUser.uid,
            deliveryAddress: data,
            items: cartItems.map(item => ({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
            })),
            totalAmount: totalAmount,
            paymentMethod: paymentMethod,
        });

        toast({
            title: 'Order Placed!',
            description: "Thank you for your purchase. We've received your order.",
        });

        clearCart();
        router.push('/orders');

    } catch (error) {
        console.error('Failed to place order:', error);
        toast({ variant: 'destructive', title: 'Order Failed', description: 'There was a problem placing your order. Please try again.' });
    } finally {
        setIsLoading(false);
    }
  };

  if (cartItems.length === 0 && !isLoading) {
    return (
        <Card className="glass-card text-center">
            <CardContent className="p-10">
                <h3 className="font-headline text-xl font-semibold">Your cart is empty!</h3>
                <p className="text-muted-foreground mt-2">Add some items to your cart before you can checkout.</p>
                <Button onClick={() => router.push('/products')} className="mt-6 neon-button">Continue Shopping</Button>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      <div className="md:col-span-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="font-headline text-xl">Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="type your full name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl><Input placeholder="+91 123456789.." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Station Road, Ghat Road..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Sultanganj" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="district" render={({ field }) => (
                    <FormItem><FormLabel>District</FormLabel><FormControl><Input placeholder="Bhagalpur" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="state" render={({ field }) => (
                    <FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} disabled /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="pincode" render={({ field }) => (
                    <FormItem><FormLabel>Pincode</FormLabel><FormControl><Input placeholder="813213" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="font-headline text-xl">Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                  <Label htmlFor="cod" className={cn("flex items-center rounded-md border p-4 cursor-pointer", paymentMethod === 'cod' && 'border-primary bg-primary/10')}>
                     <RadioGroupItem value="cod" id="cod" className="mr-4"/>
                     <CreditCard className="mr-4 h-6 w-6 text-positive" />
                      <div>
                        <p className="font-semibold">Cash on Delivery (COD)</p>
                        <p className="text-sm text-muted-foreground">Pay with cash when your order arrives.</p>
                      </div>
                  </Label>
                  <Label htmlFor="upi" className={cn("flex items-center rounded-md border p-4 cursor-pointer", paymentMethod === 'upi' && 'border-primary bg-primary/10')}>
                     <RadioGroupItem value="upi" id="upi" className="mr-4"/>
                     <Smartphone className="mr-4 h-6 w-6 text-positive" />
                      <div>
                        <p className="font-semibold">UPI</p>
                        <p className="text-sm text-muted-foreground">Pay with any UPI app.</p>
                      </div>
                  </Label>
                   {paymentMethod === 'upi' && (
                     <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <Label htmlFor="upiId" className="text-sm font-medium text-gray-700">
                        Your UPI ID
                      </Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="upiId"
                          placeholder="yourname@upi"
                          value={upiId}
                          onChange={handleUpiIdChange}
                          disabled={isUpiVerified || isVerifyingUpi}
                        />
                        {!isUpiVerified && (
                          <Button
                            type="button"
                            onClick={handleVerifyUpi}
                            disabled={isVerifyingUpi || !upiId}
                            className="w-28"
                          >
                            {isVerifyingUpi ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Verify'}
                          </Button>
                        )}
                      </div>
                      {isUpiVerified && (
                        <div className="mt-2 text-sm flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span>Verified!</span>
                        </div>
                      )}
                       {upiError && (
                        <div className="mt-2 text-sm flex items-center text-red-600">
                          <XCircle className="h-4 w-4 mr-1" />
                          <span>{upiError}</span>
                        </div>
                      )}
                    </div>
                   )}
                </RadioGroup>
              </CardContent>
            </Card>

            {authUser ? (
                 <Button type="submit" className="w-full text-lg py-6 neon-button" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    Place Order
                 </Button>
            ) : (
                <Button asChild className="w-full text-lg py-6 neon-button">
                    <Link href="/login?redirect=/checkout">
                        <>
                            <LogIn className="mr-2 h-5 w-5" />
                            Login to Place Order
                        </>
                    </Link>
                </Button>
            )}

          </form>
        </Form>
      </div>

      <div className="md:col-span-1">
        <Card className="glass-card sticky top-24">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-64 space-y-4 overflow-y-auto pr-2">
                {cartItems.map(item => (
                    <div key={item.id} className="flex items-center gap-4">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border">
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                             <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{item.quantity}</span>
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-sm">{item.name}</p>
                        </div>
                        <p className="font-semibold text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                ))}
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <p className="text-muted-foreground">Subtotal</p>
                    <p>₹{cartTotal.toFixed(2)}</p>
                </div>
                 <div className="flex justify-between">
                    <p className="text-muted-foreground">Delivery Fee</p>
                    <p>₹{deliveryFee.toFixed(2)}</p>
                </div>
            </div>
             <Separator />
             <div className="flex justify-between font-bold text-lg">
                <p>Total</p>
                <p>₹{totalAmount.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
