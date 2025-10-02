
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, MapPin, LogOut, ChevronRight, Home, Building, PlusCircle } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import React, { useState } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';
import { useRouter } from 'next/navigation';
import AddressAutocomplete from '@/components/location/AddressAutocomplete';
import type { Address } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function ProfileInfoCard({ title, value, onEdit }: { title: string; value: string | null; onEdit: () => void }) {
    return (
        <div className="flex items-center justify-between p-4 rounded-lg bg-background/50">
            <div>
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="font-semibold text-primary">{value || 'Not set'}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onEdit}>
                Edit <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
        </div>
    );
}

function AddressCard({ address, onEdit, onDelete }: { address: Address; onEdit: (id: string) => void; onDelete: (id: string) => void; }) {
    const Icon = address.type === 'home' ? Home : address.type === 'work' ? Building : MapPin;
    return (
        <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-background/50">
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

export default function ProfilePage() {
  const { appUser, loading, logout, setAppUser } = useAuth();
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
    // Navigate to an edit page or open a modal
    console.log("Editing address:", id);
    // For now, let's just re-use the add address flow
    setIsAddingAddress(true);
  };

  const handleDeleteAddress = (id: string) => {
    // Implement delete logic here
    console.log("Deleting address:", id);
  };


  if (isAddingAddress) {
      return <AddressAutocomplete onAddressSelect={handleAddressSaved} />;
  }

  const user = {
    name: appUser?.displayName ?? 'Freshoz User',
    phone: appUser?.phoneNumber ?? 'Not provided',
    email: appUser?.email ?? 'Not provided',
  };

  const addresses = appUser?.addresses ?? [];

  return (
    <AppShell>
      <div className="container mx-auto max-w-4xl py-8">
        <Card className="mb-8 border-0 bg-transparent shadow-none">
          <CardHeader>
            <CardTitle className="font-headline text-4xl font-bold text-primary">Your Profile</CardTitle>
            <CardDescription>
              Manage your personal information, addresses, and account settings.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="space-y-8">
          {/* Personal Information */}
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center gap-4">
              <User className="h-6 w-6 text-positive" />
              <CardTitle className="text-xl">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading ? (
                <>
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </>
              ) : (
                <>
                    <ProfileInfoCard title="Full Name" value={user.name} onEdit={() => console.log('Edit name')} />
                    <ProfileInfoCard title="Phone Number" value={user.phone} onEdit={() => console.log('Edit phone')} />
                    <ProfileInfoCard title="Email Address" value={user.email} onEdit={() => console.log('Edit email')} />
                </>
              )}
            </CardContent>
          </Card>

          {/* Address Book */}
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center gap-4">
              <MapPin className="h-6 w-6 text-positive" />
              <CardTitle className="text-xl">Address Book</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <Skeleton className="h-24 w-full" />
              ) : addresses.length > 0 ? (
                addresses.map((addr) => (
                  <AddressCard 
                    key={addr.id} 
                    address={addr} 
                    onEdit={handleEditAddress}
                    onDelete={handleDeleteAddress}
                    />
                ))
              ) : (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">You haven't added any addresses yet.</p>
                </div>
              )}
            </CardContent>
             <CardFooter>
                 <Button variant="outline" className="w-full border-dashed" onClick={() => setIsAddingAddress(true)}>
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
