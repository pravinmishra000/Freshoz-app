import { 
    collection, 
    doc, 
    setDoc, 
    updateDoc, 
    serverTimestamp,
    query,
    where,
    getDocs,
    orderBy,
    limit 
  } from 'firebase/firestore';
  import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
  import { db, storage } from '@/lib/firebase/client';
  
  const DAILY_DISHES_COLLECTION = 'dailyDishes';
  
  export interface DailyDish {
    id: string;
    dishName: string;
    description: string;
    imageUrl: string;
    price: number;
    cuisineType: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    scheduledDate: string;
  }
  
  export const dailyDishService = {
    async getCurrentDailyDish(): Promise<DailyDish | null> {
      try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowString = tomorrow.toISOString().split('T')[0];
        
        const q = query(
          collection(db, DAILY_DISHES_COLLECTION),
          where('scheduledDate', '==', tomorrowString),
          where('isActive', '==', true),
          limit(1)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const data = doc.data();
          return {
            id: doc.id,
            dishName: data.dishName,
            description: data.description,
            imageUrl: data.imageUrl,
            price: data.price,
            cuisineType: data.cuisineType,
            isActive: data.isActive,
            scheduledDate: data.scheduledDate,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          } as DailyDish;
        }
        
        return null;
      } catch (error) {
        console.error('Error getting current daily dish:', error);
        throw error;
      }
    },
  
    async uploadImage(file: File): Promise<string> {
      try {
        const storageRef = ref(storage, `daily-dishes/${Date.now()}-${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
      } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
      }
    },
  
    async saveDailyDish(dishData: Omit<DailyDish, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
      try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowString = tomorrow.toISOString().split('T')[0];
        
        // Deactivate any existing dish for tomorrow
        const existingDishesQuery = query(
          collection(db, DAILY_DISHES_COLLECTION),
          where('scheduledDate', '==', tomorrowString),
          where('isActive', '==', true)
        );
        
        const existingDishes = await getDocs(existingDishesQuery);
        const updatePromises = existingDishes.docs.map(doc =>
          updateDoc(doc.ref, { 
            isActive: false,
            updatedAt: serverTimestamp()
          })
        );
        await Promise.all(updatePromises);
        
        // Create new dish
        const dishRef = doc(collection(db, DAILY_DISHES_COLLECTION));
        const dishWithTimestamps = {
          ...dishData,
          scheduledDate: tomorrowString,
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await setDoc(dishRef, dishWithTimestamps);
        return dishRef.id;
      } catch (error) {
        console.error('Error saving daily dish:', error);
        throw error;
      }
    },
  
    async getDailyDishHistory(limitCount: number = 10): Promise<DailyDish[]> {
      try {
        const q = query(
          collection(db, DAILY_DISHES_COLLECTION),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            dishName: data.dishName,
            description: data.description,
            imageUrl: data.imageUrl,
            price: data.price,
            cuisineType: data.cuisineType,
            isActive: data.isActive,
            scheduledDate: data.scheduledDate,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          } as DailyDish;
        });
      } catch (error) {
        console.error('Error getting daily dish history:', error);
        throw error;
      }
    }
  };