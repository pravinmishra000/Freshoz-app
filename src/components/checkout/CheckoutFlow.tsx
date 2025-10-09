
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
import { Loader2, CreditCard, LogIn, CheckCircle, XCircle, Smartphone, Trash2, Plus, Minus, Sun, Sunset, Moon, Leaf, Phone, Bot, Check, AlertTriangle, Edit, ArrowLeft, MapPin } from 'lucide-react';
import { placeOrder } from '@/app/actions/orderActions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '../ui/skeleton';
import { AddressManager } from './AddressManager';
import type { Address } from '@/lib/types';


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
  const prevDeliveryTipRef = useRef(deliveryTip);

  const freeDeliveryThreshold = 120;
  const deliveryFeeAmount = 30;
  const platformFee = 5;

  const deliveryFee = cartTotal > 0 && cartTotal < freeDeliveryThreshold ? deliveryFeeAmount : 0;
  const totalAmount = cartTotal + deliveryFee + platformFee + deliveryTip;
  const [selectedAddress, setSelectedAddress] = React.useState<Address | null>(null);
  const [showAddressManager, setShowAddressManager] = React.useState(false);

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

  useEffect(() => {
    if (appUser && appUser.addresses && appUser.addresses.length > 0) {
      const defaultAddress = appUser.addresses.find(a => a.isDefault) || appUser.addresses[0];
      setSelectedAddress(defaultAddress);
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

  useEffect(() => {
    // Show toast only when a tip is added (and not on initial render or when set to 0)
    if (deliveryTip > 0 && prevDeliveryTipRef.current === 0) {
      toast({
        title: 'Thank you for the tip!',
        description: `₹${deliveryTip} has been added for the delivery person.`,
      });
    }
    // Update the ref to the current value for the next render
    prevDeliveryTipRef.current = deliveryTip;
  }, [deliveryTip, toast]);

  const handleBack = () => {
    if (openAccordion === "step3") {
      setOpenAccordion("step2");
    } else if (openAccordion === "step2") {
      setOpenAccordion("step1");
    } else {
      router.back(); // Ya fir router.push('/cart') agar specific page par jana hai
    }
  };

  const onSubmit: SubmitHandler<AddressFormValues> = async (data) => {
    if (!authUser || cartItems.length === 0) {
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: 'You must be logged in to place an order.' 
      });
      router.push('/login?redirect=/checkout');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const orderData = {
        userId: authUser.uid,
        deliveryAddress: data,
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        deliverySlot: deliverySlot,
        substitution: substitution,
        deliveryTip: deliveryTip,
      };
  
      const result = await placeOrder(orderData);
  
      if (result.success && result.orderId) {
        toast({
          title: 'Order Placed! 🎉',
          description: "Thank you for your purchase. We've received your order.",
        });
  
        clearCart();
        router.push(`/orders/${result.orderId}`);
  
      } else {
        // Show specific error message from order placement
        throw new Error(result.error || 'Failed to place order');
      }
  
    } catch (error: any) {
      console.error('Order placement failed:', error);
      
      // User-friendly error messages
      let errorTitle = 'Order Failed';
      let errorDescription = error.message || 'There was a problem placing your order. Please try again.';
  
      // Network related errors
      if (error.message.includes('Network') || error.message.includes('internet')) {
        errorTitle = 'Connection Error';
        errorDescription = 'Please check your internet connection and try again.';
      }
      
      // Authentication errors
      if (error.message.includes('Authentication') || error.message.includes('log in')) {
        errorTitle = 'Session Expired';
        errorDescription = 'Please log in again to continue.';
        router.push('/login?redirect=/checkout');
      }
  
      toast({ 
        variant: 'destructive', 
        title: errorTitle, 
        description: errorDescription 
      });
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
                  {/* Delivery Slots */}
                  <div className="space-y-3">
                      <Label className="font-semibold text-base">Choose Delivery Slot</Label>
                      <RadioGroup value={deliverySlot} onValueChange={setDeliverySlot} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {deliverySlots.map(slot => (
                              <Label key={slot.id} htmlFor={slot.id} className={cn("flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all duration-300", deliverySlot === slot.id ? 'border-primary bg-primary/10 shadow-lg scale-105' : 'border-border hover:bg-muted/50')}>
                                  <RadioGroupItem value={slot.id} id={slot.id} className="sr-only"/>
                                  <slot.icon className="h-6 w-6 mb-2 text-primary" />
                                  <p className="font-semibold text-sm">{slot.label}</p>
                                  <p className="text-xs text-muted-foreground">{slot.time}</p>
                              </Label>
                          ))}
                      </RadioGroup>
                  </div>
                  {/* Substitution Options */}
                  <div className="space-y-3">
                      <Label className="font-semibold text-base">If an item is out of stock...</Label>
                      <RadioGroup value={substitution} onValueChange={setSubstitution} className="space-y-2">
                      {substitutionOptions.map(option => (
                          <Label key={option.id} htmlFor={option.id} className={cn("flex items-center rounded-lg border p-3 cursor-pointer transition-colors", substitution === option.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50')}>
                              <RadioGroupItem value={option.id} id={option.id} className="mr-3"/>
                              <option.icon className="h-5 w-5 mr-3 text-primary"/>
                              <span className="text-sm font-medium">{option.label}</span>
                          </Label>
                      ))}
                      </RadioGroup>
                  </div>
                  {/* Delivery Instructions */}
                  <div className="space-y-3">
                    <Label className="font-semibold text-base" htmlFor="instructions">Delivery Instructions</Label>
                    <Textarea id="instructions" placeholder="e.g. Ring the bell twice, leave at the door..." className="min-h-[80px]" />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="button" 
                      onClick={() => setOpenAccordion("step2")} 
                      className="flex-1 neon-button"
                    >
                      Continue
                    </Button>
                  </div>
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
                <div className="space-y-6">
                  {/* Saved Addresses Section */}
                  {appUser?.addresses && appUser.addresses.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          Choose from Saved Addresses
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddressManager(!showAddressManager)}
                        >
                          {showAddressManager ? 'Hide Manager' : 'Manage Addresses'}
                        </Button>
                      </div>

                      {showAddressManager ? (
                        <AddressManager
                          onAddressSelect={(address) => {
                            setSelectedAddress(address);
                            // Auto-fill form with selected address
                            form.reset({
                              name: address.name,
                              phone: address.phone,
                              address: address.address,
                              city: address.city,
                              district: address.district,
                              state: address.state,
                              pincode: address.pincode,
                            });
                            setShowAddressManager(false);
                          }}
                          selectedAddress={selectedAddress || undefined}
                        />
                      ) : (
                        <RadioGroup 
                          value={selectedAddress?.id} 
                          onValueChange={(value) => {
                            const address = appUser.addresses?.find(addr => addr.id === value);
                            if (address) {
                              setSelectedAddress(address);
                              // Auto-fill form with selected address
                              form.reset({
                                name: address.name,
                                phone: address.phone,
                                address: address.address,
                                city: address.city,
                                district: address.district,
                                state: address.state,
                                pincode: address.pincode,
                              });
                            }
                          }}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {appUser.addresses.slice(0, 2).map((address) => (
                              <Label
                                key={address.id}
                                htmlFor={address.id}
                                className={cn(
                                  "flex flex-col rounded-lg border-2 p-4 cursor-pointer transition-all",
                                  selectedAddress?.id === address.id
                                    ? "border-primary bg-primary/10 shadow-lg"
                                    : "border-border hover:bg-accent/50"
                                )}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <RadioGroupItem value={address.id!} id={address.id} className="mt-1" />
                                  {address.isDefault && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <div className="space-y-1">
                                  <p className="font-semibold">{address.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {address.address}, {address.city}<br />
                                    {address.district}, {address.state} - {address.pincode}<br />
                                    📞 {address.phone}
                                  </p>
                                </div>
                              </Label>
                            ))}
                          </div>
                          
                          {appUser.addresses.length > 2 && (
                            <Button
                              variant="outline"
                              onClick={() => setShowAddressManager(true)}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              View All {appUser.addresses.length} Addresses
                            </Button>
                          )}
                        </RadioGroup>
                      )}
                    </div>
                  )}

                  {/* Address Form */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        {appUser?.addresses && appUser.addresses.length > 0 
                          ? 'Or Enter New Address' 
                          : 'Enter Delivery Address'
                        }
                      </h3>
                      {appUser?.addresses && appUser.addresses.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddressManager(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Address
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField 
                        control={form.control} 
                        name="name" 
                        render={({ field }) => ( 
                          <FormItem className="sm:col-span-2">
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Type your full name" {...field} />
                            </FormControl>
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
                            <FormControl>
                              <Input placeholder="+91 1234567890" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem> 
                        )} 
                      />
                      <FormField 
                        control={form.control} 
                        name="address" 
                        render={({ field }) => ( 
                          <FormItem className="sm:col-span-2">
                            <FormLabel>Street Address, House No.</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Station Road, Ghat Road..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem> 
                        )} 
                      />
                      <FormField 
                        control={form.control} 
                        name="city" 
                        render={({ field }) => ( 
                          <FormItem>
                            <FormLabel>City / Town</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Sultanganj" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem> 
                        )} 
                      />
                      <FormField 
                        control={form.control} 
                        name="district" 
                        render={({ field }) => ( 
                          <FormItem>
                            <FormLabel>District</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Bhagalpur" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem> 
                        )} 
                      />
                      <FormField 
                        control={form.control} 
                        name="state" 
                        render={({ field }) => ( 
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input {...field} disabled />
                            </FormControl>
                            <FormMessage />
                          </FormItem> 
                        )} 
                      />
                      <FormField 
                        control={form.control} 
                        name="pincode" 
                        render={({ field }) => ( 
                          <FormItem>
                            <FormLabel>Pincode</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 813213" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem> 
                        )} 
                      />
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setOpenAccordion("step1")}
                      className="flex-1"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button 
                      onClick={() => setOpenAccordion("step3")} 
                      className="flex-1 neon-button" 
                      disabled={!form.formState.isValid}
                    >
                      Confirm Address & Continue
                    </Button>
                  </div>
                </div>
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
                <div className="flex gap-3 mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setOpenAccordion("step2")}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 neon-button" 
                    disabled={isLoading || !formState.isValid}
                  >
                    {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    Place Order
                  </Button>
                </div>
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
                              <Image 
                                src={item.image} 
                                alt={item.name} 
                                fill 
                                sizes="56px"
                                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300" 
                              />
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
