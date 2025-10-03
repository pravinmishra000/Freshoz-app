'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Camera, Check, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface CameraCaptureModalProps {
  onClose: () => void;
  onCapture?: (dataUrl: string) => void;
}

export default function CameraCaptureModal({ onClose, onCapture }: CameraCaptureModalProps) {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!onCapture) {
          setHasCameraPermission(false);
          return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };

    getCameraPermission();

    // Cleanup function
    return () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    };
  }, [toast, onCapture]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirm = () => {
    if (capturedImage && onCapture) {
      onCapture(capturedImage);
      onClose();
    }
  };
  
  const renderContent = () => {
    if (hasCameraPermission === null) {
      return <div className="flex items-center justify-center h-64"><Camera className="h-10 w-10 animate-pulse text-muted-foreground" /></div>;
    }

    if (hasCameraPermission === false) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Camera Access Required</AlertTitle>
          <AlertDescription>
            Camera access was denied or you are not logged in. Please enable it in your browser's site settings to take a photo.
          </AlertDescription>
        </Alert>
      );
    }
    
    if (capturedImage) {
      return (
        <div className="relative">
          <img src={capturedImage} alt="Captured" className="w-full h-auto rounded-md" />
        </div>
      );
    }

    return (
        <div className="relative overflow-hidden rounded-md bg-black">
            <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted playsInline />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
        </div>
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glass-card">
        <DialogHeader>
          <DialogTitle>Take a Photo</DialogTitle>
        </DialogHeader>
        
        {renderContent()}
        <canvas ref={canvasRef} className="hidden" />

        <DialogFooter>
          {capturedImage ? (
            <>
              <Button variant="outline" onClick={handleRetake}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retake
              </Button>
              <Button onClick={handleConfirm} disabled={!onCapture}>
                <Check className="mr-2 h-4 w-4" />
                Confirm & Upload
              </Button>
            </>
          ) : (
            <>
               <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
              <Button onClick={handleCapture} disabled={!hasCameraPermission || !onCapture}>
                <Camera className="mr-2 h-4 w-4" />
                Capture
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
