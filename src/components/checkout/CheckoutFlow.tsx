
'use client';

import { useCart } from '@/lib/cart/cart-context';
import { useAuth } from '@/lib/firebase/auth-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { Loader2, CreditCard, LogIn, CheckCircle, XCircle, Smartphone, Trash2, Plus, Minus, Sun, Sunset, Moon, Leaf, Phone, Bot, Check, AlertTriangle, Edit } from 'lucide-react';
import { placeOrder } from '@/app/actions/orderActions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import React from 'react';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '../ui/skeleton';

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

const deliverySlots = [
    { id: 'morning', label: 'Morning', time: '7 AM - 10 AM', icon: Sun },
    { id: 'afternoon', label: 'Afternoon', time: '12 PM - 3 PM', icon: Sunset },
    { id: 'evening', label: 'Evening', time: '5 PM - 8 PM', icon: Moon },
];

const substitutionOptions = [
    { id: 'call', label: 'Call me for substitutes', icon: Phone },
    { id: 'best', label: 'Choose best substitute for me', icon: Bot },
    { id: 'none', label: 'Do not substitute', icon: XCircle },
];

const tipOptions = [0, 10, 20, 50];

function CheckoutSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
      <div className="lg:col-span-1">
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  )
}

export function CheckoutFlow() {
  const { cartItems, cartTotal, clearCart, updateQuantity, removeFromCart } = useCart();
  const { authUser, appUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState('cod');
  const [deliverySlot, setDeliverySlot] = React.useState('morning');
  const [substitution, setSubstitution] = React.useState('best');
  const [deliveryTip, setDeliveryTip] = React.useState(0);
  const [openAccordion, setOpenAccordion] = React.useState("step1");

  const freeDeliveryThreshold = 120;
  const deliveryFeeAmount = 30;
  const platformFee = 5;

  const deliveryFee = cartTotal > 0 && cartTotal < freeDeliveryThreshold ? deliveryFeeAmount : 0;
  const totalAmount = cartTotal + deliveryFee + platformFee + deliveryTip;

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    mode: 'onTouched',
    defaultValues: {
      name: appUser?.displayName || '',
      phone: appUser?.phoneNumber || '',
      address: appUser?.addresses?.[0]?.address || '',
      city: appUser?.addresses?.[0]?.city || '',
      district: appUser?.addresses?.[0]?.district || 'Bhagalpur',
      state: appUser?.addresses?.[0]?.state || 'Bihar',
      pincode: appUser?.addresses?.[0]?.pincode || '',
    },
  });
  
  const formState = form.formState;

  React.useEffect(() => {
    if (appUser) {
        const defaultAddress = appUser.addresses?.find(a => a.isDefault) || appUser.addresses?.[0];
        form.reset({
            name: appUser.displayName || '',
            phone: defaultAddress?.phone || appUser.phoneNumber || '',
            address: defaultAddress?.address || '',
            city: defaultAddress?.city || '',
            district: defaultAddress?.district || 'Bhagalpur',
            state: defaultAddress?.state || 'Bihar',
            pincode: defaultAddress?.pincode || '',
        });
    }
  }, [appUser, form]);

  const onSubmit: SubmitHandler<AddressFormValues> = async (data) => {
    if (!authUser || cartItems.length === 0) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to place an order.' });
        router.push('/login?redirect=/checkout');
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

  const progress = React.useMemo(() => {
    let value = 10; // Start with 10% for being on the page
    if (deliverySlot) value += 15;
    if(form.formState.isValid) value += 45;
    if(paymentMethod) value += 15;
    if(openAccordion === "complete") value = 100;
    return value;
  }, [deliverySlot, paymentMethod, form.formState.isValid, openAccordion]);

  if (authLoading) {
    return <CheckoutSkeleton />;
  }

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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        <div className="lg:col-span-2 space-y-6">
          <Progress value={progress} className="w-full h-2" />
          <Accordion type="single" collapsible value={openAccordion} onValueChange={setOpenAccordion} className="w-full space-y-4">

            {/* Step 1: Delivery Slot & Preferences */}
            <AccordionItem value="step1" className="glass-card rounded-xl border-none">
              <AccordionTrigger className="p-6 text-xl font-semibold hover:no-underline">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">1</span>
                  Delivery & Preferences
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-0">
                <div className="space-y-6">
                   <div>
                        <Label className="text-base font-semibold text-foreground">When should we deliver?</Label>
                        <p className="text-sm text-muted-foreground mb-3">Choose a convenient time slot for your delivery.</p>
                        <RadioGroup value={deliverySlot} onValueChange={setDeliverySlot} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {deliverySlots.map((slot) => (
                            <div key={slot.id}>
                            <RadioGroupItem value={slot.id} id={slot.id} className="peer sr-only" />
                            <Label
                                htmlFor={slot.id}
                                className="flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:shadow-inner transition-all hover:bg-accent/50"
                            >
                                <slot.icon className="mb-2 h-6 w-6 text-primary" />
                                <span className="font-semibold text-sm">{slot.label}</span>
                                <span className="text-xs text-muted-foreground">{slot.time}</span>
                            </Label>
                            </div>
                        ))}
                        </RadioGroup>
                    </div>
                     <div>
                        <Label className="text-base font-semibold text-foreground">Out of stock items?</Label>
                        <p className="text-sm text-muted-foreground mb-3">Choose how we should handle items that are not available.</p>
                        <RadioGroup value={substitution} onValueChange={setSubstitution} className="space-y-2">
                            {substitutionOptions.map(opt => (
                                <Label key={opt.id} htmlFor={opt.id} className="flex items-center rounded-md border p-3 cursor-pointer hover:bg-accent/50 transition has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                                    <RadioGroupItem value={opt.id} id={opt.id} className="mr-3"/>
                                    <opt.icon className="mr-3 h-5 w-5 text-primary" />
                                    <span>{opt.label}</span>
                                </Label>
                            ))}
                        </RadioGroup>
                        </div>
                        <div>
                        <Label htmlFor="instructions" className="text-base font-semibold text-foreground">Delivery & Packing Instructions</Label>
                        <p className="text-sm text-muted-foreground mb-3">Any special requests? e.g., "Keep frozen items separate" or "Don't ring bell".</p>
                        <Textarea id="instructions" placeholder="Type your instructions here..."/>
                        </div>
                        <Button onClick={() => setOpenAccordion("step2")} className="w-full neon-button">Continue</Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Step 2: Shipping Address */}
             <AccordionItem value="step2" className="glass-card rounded-xl border-none">
              <AccordionTrigger className="p-6 text-xl font-semibold hover:no-underline">
                 <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">2</span>
                  Shipping Address
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-0">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField control={form.control} name="name" render={({ field }) => ( <FormItem className="sm:col-span-2"><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="type your full name" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem className="sm:col-span-2"><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="+91 123456789.." {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="address" render={({ field }) => ( <FormItem className="sm:col-span-2"><FormLabel>Street Address, House No.</FormLabel><FormControl><Input placeholder="e.g. Station Road, Ghat Road..." {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="city" render={({ field }) => ( <FormItem><FormLabel>City / Town</FormLabel><FormControl><Input placeholder="e.g. Sultanganj" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="district" render={({ field }) => ( <FormItem><FormLabel>District</FormLabel><FormControl><Input placeholder="e.g. Bhagalpur" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="state" render={({ field }) => ( <FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} disabled /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="pincode" render={({ field }) => ( <FormItem><FormLabel>Pincode</FormLabel><FormControl><Input placeholder="e.g. 813213" {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
                <Button onClick={() => setOpenAccordion("step3")} className="w-full neon-button mt-6" disabled={!form.formState.isValid}>Confirm Address & Continue</Button>
              </AccordionContent>
            </AccordionItem>

            {/* Step 3: Payment */}
             <AccordionItem value="step3" className="glass-card rounded-xl border-none">
              <AccordionTrigger className="p-6 text-xl font-semibold hover:no-underline">
                 <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">3</span>
                  Payment
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-0">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                    <Label htmlFor="cod" className={cn("flex items-center rounded-lg border-2 p-4 cursor-pointer transition-all duration-300", paymentMethod === 'cod' ? 'border-primary bg-primary/10 shadow-lg scale-105' : 'border-transparent hover:bg-muted/50')}>
                        <RadioGroupItem value="cod" id="cod" className="mr-4 h-5 w-5"/>
                        <CreditCard className="mr-4 h-6 w-6 text-primary" />
                        <div>
                        <p className="font-semibold">Cash on Delivery (COD)</p>
                        <p className="text-sm text-muted-foreground">Pay with cash when your order arrives.</p>
                        </div>
                    </Label>
                    <Label htmlFor="online" className={cn("flex items-center rounded-lg border-2 p-4 cursor-pointer transition-all duration-300", paymentMethod === 'online' ? 'border-primary bg-primary/10 shadow-lg scale-105' : 'border-transparent hover:bg-muted/50')}>
                        <RadioGroupItem value="online" id="online" className="mr-4 h-5 w-5"/>
                        <Smartphone className="mr-4 h-6 w-6 text-primary" />
                        <div>
                        <p className="font-semibold">UPI / Cards / NetBanking</p>
                        <p className="text-sm text-muted-foreground">Pay securely online (Coming Soon).</p>
                        </div>
                    </Label>
                  </RadioGroup>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="lg:col-span-1">
          <Card className="glass-card sticky top-24">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-60 pr-4 -mr-4">
                <div className="space-y-4">
                  {cartItems.map(item => (
                      <div key={item.id} className="flex items-center gap-3 group">
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border">
                              <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-300" />
                              {item.is_veg === false && <AlertTriangle className="absolute top-0 right-0 h-4 w-4 text-red-500 bg-white rounded-full p-0.5" />}
                          </div>
                          <div className="flex-1">
                              <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                              <p className="font-semibold text-sm text-primary">₹{item.price.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center gap-1 rounded-lg border bg-background">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                <Minus className="h-3 w-3"/>
                              </Button>
                              <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                <Plus className="h-3 w-3"/>
                              </Button>
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.id)}>
                            <Trash2 className="h-4 w-4"/>
                          </Button>
                      </div>
                  ))}
                </div>
              </ScrollArea>
              <Separator className="my-4"/>
              <div className="space-y-2 text-sm">
                  <p className="font-semibold">Tip for the delivery person</p>
                  <div className="flex gap-2">
                      {tipOptions.map(tip => (
                          <Button key={tip} type="button" variant={deliveryTip === tip ? "default" : "outline"} onClick={() => setDeliveryTip(tip)} className="flex-1">₹{tip}</Button>
                      ))}
                      <Input type="number" placeholder="Custom" className="w-24" onChange={(e) => setDeliveryTip(Number(e.target.value) || 0)} />
                  </div>
              </div>
              <Separator className="my-4"/>
              <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                      <p className="text-muted-foreground">Subtotal</p>
                      <p>₹{cartTotal.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                      <p className="text-muted-foreground">Delivery Fee</p>
                      <p className={cn(deliveryFee === 0 && "text-primary font-semibold")}>{deliveryFee > 0 ? `₹${deliveryFee.toFixed(2)}` : 'Free'}</p>
                  </div>
                   <div className="flex justify-between">
                      <p className="text-muted-foreground">Platform Fee</p>
                      <p>₹{platformFee.toFixed(2)}</p>
                  </div>
                  {deliveryTip > 0 && (
                     <div className="flex justify-between text-primary">
                        <p className="font-medium">Delivery Tip</p>
                        <p className="font-medium">₹{deliveryTip.toFixed(2)}</p>
                    </div>
                  )}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between font-bold text-lg text-foreground bg-primary/10 p-3 rounded-lg">
                  <p>Grand Total</p>
                  <p>₹{totalAmount.toFixed(2)}</p>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              {authUser ? (
                  <Button type="submit" className="w-full text-lg py-6 neon-button" disabled={isLoading || !formState.isValid}>
                      {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                      Place Order
                  </Button>
              ) : (
                  <Button asChild className="w-full text-lg py-6 neon-button">
                      <Link href="/login?redirect=/checkout">
                          <LogIn className="mr-2 h-5 w-5" />
                          Login to Place Order
                      </Link>
                  </Button>
              )}
               <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Check className="h-3 w-3 text-primary"/> Freshness & Quality Guaranteed
               </p>
            </CardFooter>
          </Card>
        </div>

      </form>
    </Form>
  );
}
