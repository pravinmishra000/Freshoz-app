'use client';

import { Check, Package, Bike, Home, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const steps = [
  { name: 'Order Placed', status: 'completed', icon: Check },
  { name: 'Preparing', status: 'completed', icon: Package },
  { name: 'Out for Delivery', status: 'current', icon: Bike },
  { name: 'Delivered', status: 'upcoming', icon: Home },
];

export function OrderTracker() {
  return (
    <Card className="glass-card w-full">
      <CardHeader>
        <CardTitle className="font-headline">Order #FZ-12345</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Order Status</h3>
            <div className="relative">
              <div
                className="absolute left-4 top-4 -bottom-4 w-0.5 bg-border"
                aria-hidden="true"
              />
              {steps.map((step, stepIdx) => (
                <div key={step.name} className="relative flex items-start">
                  <span className="flex h-9 items-center">
                    <span
                      className={cn(
                        'relative z-10 flex h-8 w-8 items-center justify-center rounded-full',
                        step.status === 'completed' && 'bg-primary',
                        step.status === 'current' && 'border-2 border-primary bg-background',
                        step.status === 'upcoming' && 'border-2 border-border bg-background'
                      )}
                    >
                      <step.icon
                        className={cn(
                          'h-5 w-5',
                          step.status === 'completed' && 'text-primary-foreground',
                          step.status === 'current' && 'text-primary',
                          step.status === 'upcoming' && 'text-muted-foreground'
                        )}
                        aria-hidden="true"
                      />
                    </span>
                  </span>
                  <span className="ml-4 flex min-w-0 flex-col py-2">
                    <span
                      className={cn(
                        'text-sm font-medium',
                        step.status !== 'upcoming' ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {step.name}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <Separator />
          <div>
            <h3 className="mb-4 text-lg font-semibold">Rider Information</h3>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarImage src="https://picsum.photos/seed/rider/100/100" data-ai-hint="person face" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold">John Doe</p>
                <p className="text-sm text-muted-foreground">2 min away</p>
                <div className="flex items-center gap-1 text-sm text-accent">
                  <Star className="h-4 w-4 fill-current" />
                  <span>4.9 (500+ ratings)</span>
                </div>
              </div>
              <Button className="ml-auto" variant="outline">
                Contact
              </Button>
            </div>
          </div>
        </div>
        <div className="relative aspect-square rounded-lg border bg-background/50 p-2">
          <Image
            src="https://picsum.photos/seed/map/800/800"
            alt="Map of delivery area"
            fill
            className="rounded-md object-cover opacity-20"
            data-ai-hint="city map"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="rounded-md bg-background p-2 text-sm text-muted-foreground">
              Map visualization would be here.
            </p>
          </div>
          <Bike className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-primary" />
          <Home className="absolute bottom-4 right-4 h-8 w-8 text-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}
