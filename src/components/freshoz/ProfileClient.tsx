// /home/user/studio/src/components/freshoz/ProfileClient.tsx

'use client';

import { useRef, useState } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Camera, Upload, Video } from 'lucide-react';
import { getStorage, ref as storageRefFn, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { updateProfile } from 'firebase/auth';
import ImageCropModal from './ImageCropModal';
import CameraCaptureModal from './CameraCaptureModal';

export default function ProfileClient() {
  const { appUser, authUser, setAppUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // States for modals
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  // Handle cropped image
  const handleCroppedImage = async (croppedImageUrl: string) => {
    if (!authUser) {
      toast({ variant: 'destructive', title: 'Authentication Required' });
      return;
    }

    try {
      setIsUploading(true);
      
      // Convert data URL to blob
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      
      // Upload to Firebase Storage
      const storage = getStorage();
      const storageRef = storageRefFn(storage, `profile-pictures/${authUser.uid}/profile-${Date.now()}.jpg`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      // Update profile
      await updateProfile(authUser, { photoURL: downloadURL });
      const userRef = doc(db, 'users', authUser.uid);
      await setDoc(userRef, { photoURL: downloadURL }, { merge: true });
      setAppUser(prev => prev ? { ...prev, photoURL: downloadURL } : prev);

      toast({ title: 'Success', description: 'Profile picture updated!' });
      
      // Cleanup
      URL.revokeObjectURL(croppedImageUrl);
    } catch (err: any) {
      console.error('Error uploading cropped photo:', err);
      toast({ 
        variant: 'destructive', 
        title: 'Upload Failed', 
        description: err?.message 
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file select - opens crop modal
  const onFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!authUser) {
      toast({ variant: 'destructive', title: 'Authentication Required' });
      return;
    }
    
    const file = event.target.files?.[0];
    if (!file) return;

    const MAX_MB = 10;
    if (file.size > MAX_MB * 1024 * 1024) {
      toast({ 
        variant: 'destructive', 
        title: 'File Too Large', 
        description: `Max ${MAX_MB}MB allowed.` 
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Read file and open crop modal
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setImageToCrop(dataUrl);
        setIsCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle camera capture - opens crop modal
  const handleCameraCapture = (dataUrl: string) => {
    setImageToCrop(dataUrl);
    setIsCropModalOpen(true);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Profile Picture Section */}
      <div className="flex items-center gap-6 mb-8">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
            {appUser?.photoURL ? (
              <img 
                src={appUser.photoURL} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <span className="text-2xl font-semibold text-gray-600">
                  {appUser?.displayName?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background group-hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="h-4 w-4" />
                <span className="sr-only">Change profile picture</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" /> Upload from device
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setIsCameraModalOpen(true)}>
                <Video className="mr-2 h-4 w-4" /> Take a photo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <h2 className="text-2xl font-bold">{appUser?.displayName}</h2>
          <p className="text-gray-600">{appUser?.email}</p>
          <p className="text-sm text-gray-500 capitalize">{appUser?.role}</p>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Camera Modal */}
      {isCameraModalOpen && (
        <CameraCaptureModal
          onClose={() => setIsCameraModalOpen(false)}
          onCapture={handleCameraCapture}
        />
      )}

      {/* Crop Modal */}
      {isCropModalOpen && (
        <ImageCropModal
          imageSrc={imageToCrop}
          onCropComplete={handleCroppedImage}
          onClose={() => {
            setIsCropModalOpen(false);
            setImageToCrop('');
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
          aspect={1} // Square crop for profile pictures
        />
      )}

      {isUploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <p>Uploading profile picture...</p>
          </div>
        </div>
      )}
    </div>
  );
}