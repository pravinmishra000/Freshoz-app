
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, MapPin, LogOut, ChevronRight, Home, Building, PlusCircle, Pencil, Camera } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import React, { useState } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';
import { useRouter } from 'next/navigation';
import AddressAutocomplete from '@/components/location/AddressAutocomplete';
import type { Address } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

function AddressCard({ address, onEdit, onDelete }: { address: Address; onEdit: (id: string) => void; onDelete: (id: string) => void; }) {
    const Icon = address.type === 'home' ? Home : address.type === 'work' ? Building : MapPin;
    return (
        <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-background/50 hover:bg-background transition-colors">
            <div className="flex items-start gap-4">
                 <Icon className="h-6 w-6 text-positive mt-1 flex-shrink-0" />
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-primary">{address.type ? address.type.charAt(0).toUpperCase() + address.type.slice(1) : 'Address'}</p>
                        {address.isDefault && <span className="text-xs font-medium text-positive bg-positive/10 px-2 py-0.5 rounded-full">Default</span>}
                    </div>
                    <p className="text-sm text-muted-foreground">{address.address}, {address.city} - {address.pincode}</p>
                    <p className="text-sm text-muted-foreground">{address.name}, {address.phone}</p>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                 <Button variant="ghost" size="sm" onClick={() => onEdit(address.id!)}>Edit</Button>
                 <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => onDelete(address.id!)}>Delete</Button>
            </div>
        </div>
    )
}

function InfoRow({ label, value, onEdit }: { label: string; value: string | null; onEdit?: () => void }) {
  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-muted/50">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-base font-semibold text-primary">{value || 'Not set'}</p>
      </div>
      {onEdit && (
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" /> Edit
        </Button>
      )}
    </div>
  );
}


export default function ProfilePage() {
  const { appUser, authUser, loading, logout, setAppUser } = useAuth();
  const router = useRouter();
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleAddressSaved = (newAddress: Address) => {
    if (appUser) {
        const updatedAddresses = [...(appUser.addresses || []), newAddress];
        setAppUser({ ...appUser, addresses: updatedAddresses });
    }
    setIsAddingAddress(false);
  };
  
  const handleEditAddress = (id: string) => {
    console.log("Editing address:", id);
    setIsAddingAddress(true);
  };

  const handleDeleteAddress = (id: string) => {
    console.log("Deleting address:", id);
  };

  if (loading) {
    return (
        <AppShell>
            <div className="container mx-auto max-w-4xl py-8 space-y-8">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        </AppShell>
    )
  }

  if (isAddingAddress) {
      return <AddressAutocomplete onAddressSelect={handleAddressSaved} />;
  }

  const user = {
    name: appUser?.displayName ?? 'Freshoz User',
    phone: appUser?.phoneNumber ?? 'Not provided',
    email: appUser?.email ?? 'Not provided',
    photoURL: authUser?.photoURL,
  };
  
  const addresses = appUser?.addresses ?? [];

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
  };

  return (
    <AppShell>
      <div className="container mx-auto max-w-4xl py-8">
        <div className="space-y-8">

          {/* User Header */}
          <Card className="glass-card overflow-hidden">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="relative group mb-4">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                      <AvatarImage src={user.photoURL || ''} alt={user.name} />
                      <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                          {getInitials(user.name)}
                      </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background group-hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="h-4 w-4" />
                      <span className="sr-only">Change profile picture</span>
                  </Button>
              </div>
              <h2 className="text-2xl font-bold text-primary">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <User className="h-6 w-6 text-positive" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
                <InfoRow label="Full Name" value={user.name} onEdit={() => console.log('Edit name')} />
                <InfoRow label="Phone Number" value={user.phone} onEdit={() => console.log('Edit phone')} />
                <InfoRow label="Email Address" value={user.email} />
            </CardContent>
          </Card>

          {/* Address Book */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                 <MapPin className="h-6 w-6 text-positive" />
                 Address Book
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {addresses.length > 0 ? (
                addresses.map((addr) => (
                  <AddressCard 
                    key={addr.id} 
                    address={addr} 
                    onEdit={handleEditAddress}
                    onDelete={handleDeleteAddress}
                    />
                ))
              ) : (
                <div className="text-center py-8 border-2 border-dashed rounded-xl">
                    <p className="text-muted-foreground">You haven't added any addresses yet.</p>
                </div>
              )}
            </CardContent>
             <CardFooter>
                 <Button variant="outline" className="w-full border-dashed border-primary text-primary hover:bg-primary/5 hover:text-primary" onClick={() => setIsAddingAddress(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Address
                </Button>
            </CardFooter>
          </Card>

          {/* Account Actions */}
          <Card className="glass-card">
            <CardHeader>
                <CardTitle className="text-xl">Account Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="w-full sm:w-auto" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
