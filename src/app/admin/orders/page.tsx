
'use client';

import { AdminOrderList } from '@/components/admin/AdminOrderList';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { auth } from '@/lib/firebase/client';
import { getUser } from '@/services/firestoreService';
import { redirect } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';

export default function AdminOrdersPage() {
  
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
              <CardTitle className="font-headline text-4xl font-bold text-primary">Manage Orders</CardTitle>
              <CardDescription>
                View and update the status of all customer orders.
              </CardDescription>
             </div>
          </div>
        </CardHeader>
      </Card>
      <AdminOrderList />
    </div>
  );
}
