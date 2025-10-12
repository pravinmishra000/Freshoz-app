'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, Upload, Calendar, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { dailyDishService, DailyDish } from '@/services/dailyDishService';

export function DailyDishManager() {
  const [dish, setDish] = useState<Omit<DailyDish, 'id' | 'createdAt' | 'updatedAt'>>({
    dishName: '',
    description: '',
    imageUrl: '',
    price: 0,
    cuisineType: 'Special',
    isActive: false,
    scheduledDate: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    loadCurrentDailyDish();
  }, []);

  const loadCurrentDailyDish = async () => {
    try {
      const currentDish = await dailyDishService.getCurrentDailyDish();
      if (currentDish) {
        setDish({
          dishName: currentDish.dishName,
          description: currentDish.description,
          imageUrl: currentDish.imageUrl,
          price: currentDish.price,
          cuisineType: currentDish.cuisineType,
          isActive: currentDish.isActive,
          scheduledDate: currentDish.scheduledDate
        });
        setImagePreview(currentDish.imageUrl);
      }
    } catch (error) {
      console.error('Error loading daily dish:', error);
      toast({
        title: 'Error',
        description: 'Failed to load current daily dish.',
        variant: 'destructive',
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 2MB.',
          variant: 'destructive',
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file.',
          variant: 'destructive',
        });
        return;
      }

      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dish.dishName.trim() || !dish.description.trim() || dish.price <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required fields correctly.',
        variant: 'destructive',
      });
      return;
    }

    if (!imageFile && !dish.imageUrl) {
      toast({
        title: 'Image Required',
        description: 'Please upload an image for the dish.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      let imageUrl = dish.imageUrl;
      
      if (imageFile) {
        imageUrl = await dailyDishService.uploadImage(imageFile);
      }

      const dishData = {
        ...dish,
        imageUrl,
        isActive: true
      };

      await dailyDishService.saveDailyDish(dishData);

      toast({
        title: 'Success!',
        description: 'Daily dish has been updated successfully.',
        variant: 'default',
      });

      await loadCurrentDailyDish();
      setImageFile(null);

    } catch (error) {
      console.error('Error saving daily dish:', error);
      toast({
        title: 'Error',
        description: 'Failed to save daily dish. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDish({
      dishName: '',
      description: '',
      imageUrl: '',
      price: 0,
      cuisineType: 'Special',
      isActive: false,
      scheduledDate: ''
    });
    setImagePreview('');
    setImageFile(null);
  };

  const cuisineTypes = ['Special', 'North Indian', 'South Indian', 'Chinese', 'Italian', 'Mexican', 'Dessert'];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowReadable = tomorrow.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Set Tomorrow's Special
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">
              Setting dish for: <span className="font-bold">{tomorrowReadable}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dishName">Dish Name *</Label>
              <Input
                id="dishName"
                value={dish.dishName}
                onChange={(e) => setDish(prev => ({ ...prev, dishName: e.target.value }))}
                placeholder="e.g., Special Biryani"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={dish.description}
                onChange={(e) => setDish(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the dish in 2-3 lines..."
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={dish.price || ''}
                  onChange={(e) => setDish(prev => ({ ...prev, price: Number(e.target.value) }))}
                  placeholder="299"
                  min="1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cuisineType">Cuisine Type</Label>
                <select
                  id="cuisineType"
                  value={dish.cuisineType}
                  onChange={(e) => setDish(prev => ({ ...prev, cuisineType: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  {cuisineTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Dish Image *</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('image')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Recommended: 400x267px WebP/JPEG format, max 2MB
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Daily Dish
                  </>
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="outline"
                onClick={resetForm}
                disabled={loading}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {imagePreview ? (
                <div className="space-y-2">
                  <div className="relative h-40 w-full rounded-lg overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Dish preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Image Preview</p>
                </div>
              ) : (
                <div className="py-8">
                  <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No image selected</p>
                  <p className="text-xs text-gray-400">Upload an image to see preview</p>
                </div>
              )}
            </div>

            <div className="space-y-3 p-3 border rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    {dish.dishName || 'Dish Name'}
                  </h3>
                  <Badge variant="outline" className="mt-1 bg-green-50 text-green-700 border-green-200">
                    {dish.cuisineType}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-green-600">
                    ₹{dish.price || '0'}
                  </p>
                  <p className="text-sm text-gray-500 line-through">₹399</p>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                {dish.description || 'Dish description will appear here...'}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="bg-red-500 text-white px-2 py-1 rounded-full font-bold">
                  🎉 25% OFF TOMORROW ONLY
                </span>
                <span>Delivery after 11:45 AM</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold text-sm mb-2">Current Status</h4>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Active Dish:</span>
                <Badge variant={dish.isActive ? "default" : "secondary"}>
                  {dish.isActive ? 'Active' : 'Not Set'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600">Scheduled For:</span>
                <span className="text-gray-500 font-medium">{tomorrowReadable}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
