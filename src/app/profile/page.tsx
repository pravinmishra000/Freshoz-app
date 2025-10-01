
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, MapPin, LogOut } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import React, { useState } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';
import { useRouter } from 'next/navigation';
import AddressAutocomplete from '@/components/location/AddressAutocomplete';

export default function ProfilePage() {
  const { appUser, logout } = useAuth();
  const router = useRouter();
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleAddressSaved = () => {
    setIsAddingAddress(false);
    // You might want to re-fetch the user data here to show the new address
    // For now, we just close the modal.
  };

  if (isAddingAddress) {
      return <AddressAutocomplete onAddressSelect={handleAddressSaved} />;
  }

  const user = {
    name: appUser?.displayName ?? 'Demo User',
    phone: appUser?.phoneNumber ?? '+91 98765 43210',
    email: appUser?.email ?? 'demo@freshoz.in',
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <User className="h-6 w-6 text-positive" />
                <CardTitle className="text-xl">Personal Information</CardTitle>
              </div>
              <Button variant="outline" size="sm">Edit</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                <p className="font-semibold">{user.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                <p className="font-semibold">{user.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                <p className="font-semibold">{user.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Address Book */}
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <MapPin className="h-6 w-6 text-positive" />
                <CardTitle className="text-xl">Address Book</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsAddingAddress(true)}>Add New</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {addresses.length > 0 ? (
                addresses.map((addr, index) => (
                  <React.Fragment key={addr.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{addr.type}</p>
                          {addr.isDefault && <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">Default</span>}
                        </div>
                        <p className="text-muted-foreground">{addr.address}, {addr.city} - {addr.pincode}</p>
                      </div>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                    {index < addresses.length - 1 && <Separator />}
                  </React.Fragment>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">You haven't added any addresses yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Logout */}
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
