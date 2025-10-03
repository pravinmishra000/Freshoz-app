'use client';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, MapPin, LogOut, PlusCircle, Pencil, Camera, Home, Building, Save, X, Upload, Video } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';
import { useRouter } from 'next/navigation';
import AddressAutocomplete from '@/components/location/AddressAutocomplete';
import type { Address } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateUserAddress } from '@/app/actions/userActions';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase/client';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import CameraCaptureModal from '@/components/freshoz/CameraCaptureModal';

function AddressCard({ address, onEdit, onDelete }: { address: Address; onEdit: (address: Address) => void; onDelete: (id: string) => void; }) {
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
                 <Button variant="ghost" size="sm" onClick={() => onEdit(address)}>Edit</Button>
                 <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => onDelete(address.id!)}>Delete</Button>
            </div>
        </div>
    )
}

function EditableInfoRow({ label, value, onSave }: { label: string; value: string | null; onSave: (newValue: string) => Promise<void> }) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      await onSave(inputValue);
      toast({ title: `${label} updated successfully!` });
      setIsEditing(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Update failed', description: error.message || `Could not update ${label}.` });
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/50">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <Input 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)} 
            className="text-base font-semibold text-primary h-8 mt-1"
          />
        </div>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleSave}>
                <Save className="h-4 w-4 text-positive" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4 text-destructive" />
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-muted/50">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-base font-semibold text-primary">{value || 'Not set'}</p>
      </div>
      <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
          <Pencil className="mr-2 h-4 w-4" /> Edit
      </Button>
    </div>
  );
}


function ProfileClient({ googleMapsApiKey }: { googleMapsApiKey: string }) {
  const { appUser, authUser, loading, logout, setAppUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleAddressSaved = (newAddress: Address) => {
     if (appUser) {
        let updatedAddresses;
        if (addressToEdit) { // We were editing an existing address
            updatedAddresses = appUser.addresses?.map(addr => addr.id === addressToEdit.id ? { ...addr, ...newAddress } : addr) ?? [];
        } else { // We were adding a new one
            updatedAddresses = [...(appUser.addresses || []), newAddress];
        }
        setAppUser({ ...appUser, addresses: updatedAddresses });
    }
    setIsAddressFormOpen(false);
    setAddressToEdit(null);
  };
  
  const handleEditAddress = (address: Address) => {
    setAddressToEdit(address);
    setIsAddressFormOpen(true);
  };

  const handleAddNewAddress = () => {
    setAddressToEdit(null);
    setIsAddressFormOpen(true);
  };

  const handleDeleteAddress = (id: string) => {
    if (!appUser || !authUser) return;
    const updatedAddresses = appUser.addresses?.filter(addr => addr.id !== id) ?? [];
    const userRef = doc(db, "users", authUser.uid);
    updateDoc(userRef, { addresses: updatedAddresses }).then(() => {
        setAppUser({ ...appUser, addresses: updatedAddresses });
    });
  };
  
  const handleSaveName = async (newName: string) => {
    if (!authUser || !appUser) throw new Error("Not authenticated");
    await updateProfile(authUser, { displayName: newName });
    const userRef = doc(db, "users", authUser.uid);
    await updateDoc(userRef, { displayName: newName });
    setAppUser(prevUser => prevUser ? { ...prevUser, displayName: newName } : null);
  };
  
  const handleSavePhone = async (newPhone: string) => {
    if (!authUser || !appUser) throw new Error("Not authenticated");
    const userRef = doc(db, "users", authUser.uid);
    await updateDoc(userRef, { phoneNumber: newPhone });
    setAppUser(prevUser => prevUser ? { ...prevUser, phoneNumber: newPhone } : null);
  };

  const handlePhotoUpload = async (dataUrl: string) => {
    if (!authUser) {
        toast({ variant: 'destructive', title: 'Authentication Required', description: 'Please log in to upload a photo.' });
        return;
    }

    toast({ title: 'Uploading...', description: 'Your new profile picture is being uploaded.' });
    const storageRef = ref(storage, `profile-pictures/${authUser.uid}`);
    
    // Extract content type from data URL
    const match = dataUrl.match(/^data:(.+);base64,/);
    const contentType = match ? match[1] : 'image/png';
    const metadata = { contentType };

    try {
      // Pass metadata during upload
      const snapshot = await uploadString(storageRef, dataUrl, 'data_url', metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Update Firebase Auth profile
      await updateProfile(authUser, { photoURL: downloadURL });
      // Update Firestore user document
      const userRef = doc(db, "users", authUser.uid);
      await updateDoc(userRef, { photoURL: downloadURL });

      // Update global appUser state, which will trigger re-renders everywhere
      setAppUser(prevUser => prevUser ? { ...prevUser, photoURL: downloadURL } : null);

      toast({ title: 'Success!', description: 'Profile picture updated.' });
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not update your profile picture.' });
    }
  };

  const onFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!authUser) {
      toast({ variant: 'destructive', title: 'Authentication Required', description: 'Please log in to upload a photo.' });
      return;
    }
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handlePhotoUpload(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset file input to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
  
  if (isCameraModalOpen) {
    return (
        <CameraCaptureModal
            onClose={() => setIsCameraModalOpen(false)}
            onCapture={authUser ? handlePhotoUpload : undefined}
        />
    )
  }


  if (isAddressFormOpen) {
      return (
        <AppShell>
          <AddressAutocomplete 
            apiKey={googleMapsApiKey}
            onAddressSelect={handleAddressSaved} 
            onCancel={() => setIsAddressFormOpen(false)}
            initialAddress={addressToEdit}
          />
        </AppShell>
      );
  }

  const user = {
    name: appUser?.displayName ?? 'Freshoz User',
    phone: appUser?.phoneNumber ?? 'Not provided',
    email: appUser?.email ?? 'Not provided',
    photoURL: appUser?.photoURL, // Use appUser's photoURL for consistency
  };
  
  const addresses = appUser?.addresses ?? [];

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1 && names[names.length - 1]) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <AppShell>
      <div className="container mx-auto max-w-4xl py-8">
        <div className="space-y-8">
            <input
                type="file"
                ref={fileInputRef}
                onChange={onFileSelect}
                accept="image/*"
                className="hidden"
            />
          {/* User Header */}
          <Card className="glass-card overflow-hidden">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="relative group mb-4">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                      <AvatarImage key={user.photoURL} src={user.photoURL || ''} alt={user.name} />
                      <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                          {getInitials(user.name)}
                      </AvatarFallback>
                  </Avatar>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <Button variant="outline" size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background group-hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="h-4 w-4" />
                          <span className="sr-only">Change profile picture</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => {
                            if (!authUser) {
                                toast({ variant: 'destructive', title: 'Authentication Required' });
                                return;
                            }
                            fileInputRef.current?.click()
                        }}>
                           <Upload className="mr-2 h-4 w-4" />
                           <span>Upload from device</span>
                        </DropdownMenuItem>
                         <DropdownMenuItem onSelect={() => {
                             if (!authUser) {
                                toast({ variant: 'destructive', title: 'Authentication Required' });
                                return;
                             }
                             setIsCameraModalOpen(true)
                         }}>
                           <Video className="mr-2 h-4 w-4" />
                           <span>Take a photo</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                <EditableInfoRow label="Full Name" value={user.name} onSave={handleSaveName} />
                <EditableInfoRow label="Phone Number" value={user.phone} onSave={handleSavePhone} />
                <div className="flex items-center justify-between py-3 px-4">
                    <div>
                        <p className="text-xs text-muted-foreground">Email Address</p>
                        <p className="text-base font-semibold text-primary">{user.email || 'Not set'}</p>
                    </div>
                </div>
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
                 <Button variant="outline" className="w-full border-dashed border-primary text-primary hover:bg-primary/5 hover:text-primary" onClick={handleAddNewAddress}>
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


export default function ProfilePage() {
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

  return <ProfileClient googleMapsApiKey={googleMapsApiKey} />;
}
