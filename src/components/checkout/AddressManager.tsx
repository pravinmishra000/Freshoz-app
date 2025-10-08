'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Check } from 'lucide-react';
import { Address } from '@/lib/types';
import { useAuth } from '@/lib/firebase/auth-context';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';

interface AddressManagerProps {
  onAddressSelect: (address: Address) => void;
  selectedAddress?: Address;
}

export function AddressManager({ onAddressSelect, selectedAddress }: AddressManagerProps) {
  const { appUser, setAppUser } = useAuth();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const addresses = appUser?.addresses || [];

  const handleAddAddress = async (newAddress: Omit<Address, 'id'>) => {
    if (!appUser) return;

    try {
      const addressWithId: Address = {
        ...newAddress,
        id: Date.now().toString(),
        isDefault: addresses.length === 0 // First address becomes default
      };

      const userRef = doc(db, 'users', appUser.id);
      await updateDoc(userRef, {
        addresses: arrayUnion(addressWithId)
      });

      // Update local state
      setAppUser(prev => prev ? {
        ...prev,
        addresses: [...addresses, addressWithId]
      } : prev);

      setIsAdding(false);
      toast({
        title: 'Success',
        description: 'Address added successfully!',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add address. Please try again.',
      });
    }
  };

  const handleEditAddress = async (updatedAddress: Address) => {
    if (!appUser) return;

    try {
      const userRef = doc(db, 'users', appUser.id);
      
      // Remove old address and add updated one
      await updateDoc(userRef, {
        addresses: arrayRemove(editingAddress)
      });
      await updateDoc(userRef, {
        addresses: arrayUnion(updatedAddress)
      });

      // Update local state
      setAppUser(prev => prev ? {
        ...prev,
        addresses: addresses.map(addr => 
          addr.id === editingAddress?.id ? updatedAddress : addr
        )
      } : prev);

      setEditingAddress(null);
      toast({
        title: 'Success',
        description: 'Address updated successfully!',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update address. Please try again.',
      });
    }
  };

  const handleDeleteAddress = async (addressToDelete: Address) => {
    if (!appUser) return;

    try {
      const userRef = doc(db, 'users', appUser.id);
      await updateDoc(userRef, {
        addresses: arrayRemove(addressToDelete)
      });

      // Update local state
      setAppUser(prev => prev ? {
        ...prev,
        addresses: addresses.filter(addr => addr.id !== addressToDelete.id)
      } : prev);

      toast({
        title: 'Success',
        description: 'Address deleted successfully!',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete address. Please try again.',
      });
    }
  };

  const handleSetDefault = async (address: Address) => {
    if (!appUser) return;

    try {
      const updatedAddresses = addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === address.id
      }));

      const userRef = doc(db, 'users', appUser.id);
      await updateDoc(userRef, {
        addresses: updatedAddresses
      });

      setAppUser(prev => prev ? {
        ...prev,
        addresses: updatedAddresses
      } : prev);

      toast({
        title: 'Success',
        description: 'Default address updated!',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to set default address. Please try again.',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Saved Addresses</h3>
        <Button 
          onClick={() => setIsAdding(true)} 
          variant="outline" 
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Address
        </Button>
      </div>

      <RadioGroup value={selectedAddress?.id} onValueChange={(value) => {
        const address = addresses.find(addr => addr.id === value);
        if (address) onAddressSelect(address);
      }}>
        <div className="space-y-3">
          {addresses.map((address) => (
            <div key={address.id} className="flex items-start gap-3">
              <RadioGroupItem value={address.id!} id={address.id} className="mt-1" />
              <Label
                htmlFor={address.id}
                className="flex-1 cursor-pointer rounded-lg border p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{address.name}</span>
                      {address.isDefault && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                          <Check className="h-3 w-3" />
                          Default
                        </span>
                      )}
                      {address.type && (
                        <span className="rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground capitalize">
                          {address.type}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {address.address}, {address.city}, {address.district}<br />
                      {address.state} - {address.pincode}<br />
                      📞 {address.phone}
                    </p>
                  </div>
                </div>
              </Label>
              <div className="flex gap-1 mt-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingAddress(address)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                {!address.isDefault && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteAddress(address)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </RadioGroup>

      {addresses.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No saved addresses yet.</p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Address Form Modal */}
      {(isAdding || editingAddress) && (
        <AddressForm
          address={editingAddress || undefined}
          onSave={editingAddress ? handleEditAddress : handleAddAddress}
          onCancel={() => {
            setIsAdding(false);
            setEditingAddress(null);
          }}
        />
      )}
    </div>
  );
}

// AddressForm component (simplified version)
function AddressForm({ 
  address, 
  onSave, 
  onCancel 
}: { 
  address?: Address;
  onSave: (address: Omit<Address, 'id'>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: address?.name || '',
    phone: address?.phone || '',
    address: address?.address || '',
    city: address?.city || '',
    district: address?.district || '',
    state: address?.state || 'Bihar',
    pincode: address?.pincode || '',
    type: address?.type || 'home' as 'home' | 'work' | 'other'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{address ? 'Edit Address' : 'Add New Address'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="address">Address</Label>
            <textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full p-2 border rounded"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <Label htmlFor="district">District</Label>
              <input
                id="district"
                type="text"
                value={formData.district}
                onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="state">State</Label>
              <input
                id="state"
                type="text"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <Label htmlFor="pincode">Pincode</Label>
              <input
                id="pincode"
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {address ? 'Update' : 'Add'} Address
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}