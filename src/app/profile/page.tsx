
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, MapPin, LogOut, PlusCircle, Pencil, Camera, Home, Building, Save, X } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileClient } from './ProfileClient';

export default function ProfilePage() {
  // This is now a Server Component. It can securely access environment variables.
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!googleMapsApiKey) {
     return (
        <AppShell>
            <div className="container mx-auto max-w-4xl py-8">
                 <Card className="glass-card text-center">
                    <CardHeader>
                        <CardTitle className="text-destructive">Configuration Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>The Google Maps API key is missing from the server environment.</p>
                        <p className="text-sm text-muted-foreground mt-2">Please set the NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env file.</p>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
  }

  // We pass the API key as a prop to the client component.
  return <ProfileClient googleMapsApiKey={googleMapsApiKey} />;
}
