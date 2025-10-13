
'use client';

import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { auth } from '@/lib/firebase/client';
import { getUser } from '@/services/firestoreService';
import { redirect } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';

export default function AdminDashboardPage() {
  
  useEffect(() => {
    const checkAuth = async () => {
      const user = await new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe();
          resolve(user);
        });
      });

      if (!user) {
        redirect('/login');
      } else {
        const appUser = await getUser((user as any).uid);
        if (appUser?.role !== 'admin') {
          redirect('/');
        }
      }
    };
    checkAuth();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader>
          <div className="flex items-center gap-4 mb-2">
            <div>
              <CardTitle className="font-headline text-4xl font-bold text-primary">Admin Dashboard</CardTitle>
              <CardDescription>
                An overview of your store's performance and key metrics.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
      <AdminDashboard />
    </div>
  );
}
