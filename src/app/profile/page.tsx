'use client';

import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, MapPin, LogOut, PlusCircle, Pencil, Camera, Home, Building, Save, X, Upload, Video, Loader2 } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/lib/firebase/auth-context';
import { useRouter } from 'next/navigation';
import AddressAutocomplete from '@/components/location/AddressAutocomplete';
import type { Address } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase/client';
import { ref as storageRefFn, uploadBytes, getDownloadURL } from 'firebase/storage';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import CameraCaptureModal from '@/components/freshoz/CameraCaptureModal';

// Helper: convert dataURL to Blob
function dataURLToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const meta = parts[0]; // data:image/jpeg;base64
  const base64 = parts[1];
  const m = meta.match(/data:(.*);base64/);
  const contentType = m ? m[1] : 'image/jpeg';
  const binary = atob(base64);
  const len = binary.length;
  const u8arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    u8arr[i] = binary.charCodeAt(i);
  }
  return new Blob([u8arr], { type: contentType });
}

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
  );
}

function EditableInfoRow({ label, value, onSave, isLoading }: { label: string; value: string | null; onSave: (newValue: string) => Promise<void>, isLoading: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(inputValue);
      toast({ title: `${label} updated successfully!` });
      setIsEditing(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Update failed', description: error.message || `Could not update ${label}.` });
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/50">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="text-base font-semibold text-primary h-8 mt-1" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 text-positive" />}
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
      <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Pencil className="mr-2 h-4 w-4" />} Edit
      </Button>
    </div>
  );
}

export default function ProfilePageWrapper() {
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
              <p>The <strong>Google Maps API key</strong> is missing. Address/Map features will not work.</p>
              <p className="text-sm text-muted-foreground mt-2">Please set <strong>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</strong> in your .env and enable Maps/Places APIs.</p>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  return <ProfileClient googleMapsApiKey={googleMapsApiKey} />;
}

function ProfileClient({ googleMapsApiKey }: { googleMapsApiKey: string }) {
  const { appUser, authUser, loading, logout, setAppUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddressSaving, setIsAddressSaving] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Save new or edited address to Firestore and update local appUser state
  const saveAddressToFirestore = async (addressPayload: Omit<Address, 'id'> & Partial<Pick<Address, 'id'>>) => {
    if (!authUser) throw new Error('Not authenticated');

    const userRef = doc(db, 'users', authUser.uid);

    // Ensure we have an id
    const id = (addressPayload as any).id || crypto.randomUUID();
    const addressToSave: Address = { id, ...addressPayload } as Address;

    // Merge into existing addresses
    const existing = appUser?.addresses ?? [];
    // If editing (id existed), replace; else push
    const updated = existing.some(a => a.id === id) ? existing.map(a => a.id === id ? addressToSave : a) : [...existing, addressToSave];

    // Use setDoc with merge to be safe if doc missing
    await setDoc(userRef, { addresses: updated }, { merge: true });

    // Update local state
    setAppUser(prev => prev ? { ...prev, addresses: updated } : { id: authUser.uid, displayName: authUser.displayName || '', addresses: updated, role: 'customer' } as any);

    return addressToSave;
  };

  const handleAddressSaved = async (newAddress: Partial<Address>) => {
    try {
      setIsAddressSaving(true);
      const saved = await saveAddressToFirestore(newAddress);
      toast({ title: 'Address saved', description: 'Your address has been added/updated.' });
      setIsAddressFormOpen(false);
      setAddressToEdit(null);
    } catch (err) {
      console.error('Save address error:', err);
      toast({ variant: 'destructive', title: 'Save failed', description: 'Could not save address.' });
    } finally {
      setIsAddressSaving(false);
    }
  };

  const handleEditAddress = (address: Address) => {
    setAddressToEdit(address);
    setIsAddressFormOpen(true);
  };

  const handleAddNewAddress = () => {
    setAddressToEdit(null);
    setIsAddressFormOpen(true);
  };

  const handleDeleteAddress = async (id: string) => {
    if (!authUser) return;
    try {
      const updated = (appUser?.addresses ?? []).filter(a => a.id !== id);
      const userRef = doc(db, 'users', authUser.uid);
      await updateDoc(userRef, { addresses: updated });
      setAppUser(prev => prev ? { ...prev, addresses: updated } : prev);
      toast({ title: 'Deleted', description: 'Address removed.' });
    } catch (err) {
      console.error('Delete address error:', err);
      toast({ variant: 'destructive', title: 'Delete failed' });
    }
  };

  const handleSaveName = async (newName: string) => {
    if (!authUser) throw new Error('Not authenticated');
    await updateProfile(authUser, { displayName: newName });
    const userRef = doc(db, 'users', authUser.uid);
    await setDoc(userRef, { displayName: newName }, { merge: true });
    setAppUser(prev => prev ? { ...prev, displayName: newName } : prev);
  };

  const handleSavePhone = async (newPhone: string) => {
    if (!authUser) throw new Error('Not authenticated');
    const userRef = doc(db, 'users', authUser.uid);
    await setDoc(userRef, { phoneNumber: newPhone }, { merge: true });
    setAppUser(prev => prev ? { ...prev, phoneNumber: newPhone } : prev);
  };

  // Profile photo upload: convert dataURL -> Blob -> uploadBytes -> getDownloadURL -> updateProfile + firestore + app state
  const handlePhotoUpload = async (dataUrl: string) => {
    if (!authUser) {
      toast({ variant: 'destructive', title: 'Authentication Required', description: 'Please log in to upload a photo.' });
      return;
    }

    try {
      setIsUploading(true);
      toast({ title: 'Uploading...', description: 'Uploading your profile picture.' });

      const blob = dataURLToBlob(dataUrl);
      const mime = blob.type || 'image/jpeg';
      const ext = mime.split('/')[1] || 'jpg';

      // storage ref: uses default bucket from client.ts (from env) — keeps consistent with your config
      const storageRef = storageRefFn(storage, `profile-pictures/${authUser.uid}/profile.${ext}`);

      // Upload via uploadBytes to avoid data_url pitfalls
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      // Update firebase auth profile
      await updateProfile(authUser, { photoURL: downloadURL });

      // Update firestore user doc (merge)
      const userRef = doc(db, 'users', authUser.uid);
      await setDoc(userRef, { photoURL: downloadURL }, { merge: true });

      // Update local app state
      setAppUser(prev => prev ? { ...prev, photoURL: downloadURL } : prev);

      toast({ title: 'Success', description: 'Profile picture updated.' });
    } catch (err: any) {
      console.error('Error uploading photo:', err);
      toast({ variant: 'destructive', title: 'Upload Failed', description: err?.message || 'Could not upload photo.' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!authUser) {
      toast({ variant: 'destructive', title: 'Authentication Required', description: 'Please log in to upload a photo.' });
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;

    const MAX_MB = 10;
    if (file.size > MAX_MB * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'File Too Large', description: `Max ${MAX_MB}MB allowed.` });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // read as dataURL and pass to handlePhotoUpload
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) handlePhotoUpload(dataUrl);
    };
    reader.readAsDataURL(file);
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
    );
  }

  const userView = {
    name: appUser?.displayName ?? authUser?.displayName ?? 'Freshoz User',
    phone: appUser?.phoneNumber ?? authUser?.phoneNumber ?? 'Not provided',
    email: appUser?.email ?? authUser?.email ?? 'Not provided',
    photoURL: appUser?.photoURL ?? authUser?.photoURL ?? undefined,
  };

  const addresses = appUser?.addresses ?? [];

  const getInitials = (name: string) => {
    const names = (name || '').split(' ').filter(Boolean);
    if (names.length >= 2) return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    return (name || 'FU').substring(0, 2).toUpperCase();
  };

  return (
    <AppShell>
      <div className="container mx-auto max-w-4xl py-8">
        <input type="file" ref={fileInputRef} onChange={onFileSelect} accept="image/*" className="hidden" />

        {/* User Header */}
        <Card className="glass-card overflow-hidden mb-6">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="relative group mb-4">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                {userView.photoURL ? (
                  <AvatarImage src={userView.photoURL} alt={userView.name} />
                ) : (
                  <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                    {getInitials(userView.name)}
                  </AvatarFallback>
                )}
              </Avatar>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background group-hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity">
                    <>
                      <Camera className="h-4 w-4" />
                      <span className="sr-only">Change profile picture</span>
                    </>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => {
                    if (!authUser) { toast({ variant: 'destructive', title: 'Authentication Required' }); return; }
                    fileInputRef.current?.click();
                  }}>
                    <Upload className="mr-2 h-4 w-4" /> Upload from device
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => {
                    if (!authUser) { toast({ variant: 'destructive', title: 'Authentication Required' }); return; }
                    setIsCameraModalOpen(true);
                  }}>
                    <Video className="mr-2 h-4 w-4" /> Take a photo
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <h2 className="text-2xl font-bold text-primary">{userView.name}</h2>
            <p className="text-muted-foreground">{userView.email}</p>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <User className="h-6 w-6 text-positive" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {appUser && (
              <>
                <EditableInfoRow label="Full Name" value={userView.name} onSave={handleSaveName} isLoading={loading} />
                <EditableInfoRow label="Phone Number" value={userView.phone} onSave={handleSavePhone} isLoading={loading} />
              </>
            )}
            <div className="flex items-center justify-between py-3 px-4">
              <div>
                <p className="text-xs text-muted-foreground">Email Address</p>
                <p className="text-base font-semibold text-primary">{userView.email || 'Not set'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Book */}
        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <MapPin className="h-6 w-6 text-positive" />
              Address Book
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {addresses.length > 0 ? (
              addresses.map((addr) => (
                <AddressCard key={addr.id} address={addr} onEdit={handleEditAddress} onDelete={handleDeleteAddress} />
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

      {/* Camera Modal */}
      {isCameraModalOpen && (
        <CameraCaptureModal
          onClose={() => setIsCameraModalOpen(false)}
          onCapture={(dataUrl) => {
            // camera returns dataUrl
            handlePhotoUpload(dataUrl);
            setIsCameraModalOpen(false);
          }}
        />
      )}

      {/* Address Modal / Screen */}
      {isAddressFormOpen && (
        <AddressAutocomplete
          apiKey={googleMapsApiKey}
          initialAddress={addressToEdit || null}
          onAddressSelect={(addr) => {
            handleAddressSaved(addr);
          }}
          onCancel={() => {
            setIsAddressFormOpen(false);
            setAddressToEdit(null);
          }}
        />
      )}
    </AppShell>
  );
}
