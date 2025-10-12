import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DailyDishManager } from '@/components/admin/DailyDishManager';
import { auth } from '@/lib/firebase/server';
import { getUser } from '@/services/firestoreService';
import { redirect } from 'next/navigation';

export default async function AdminDailyDishesPage() {
  const user = await auth.currentUser;
  if (!user) {
    redirect('/login');
  }

  const appUser = await getUser(user.uid);
  if (appUser?.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline text-4xl font-bold text-primary">
                Manage Daily Dishes
              </CardTitle>
              <CardDescription>
                Set and manage tomorrow's special dish for the banner.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <DailyDishManager />
    </div>
  );
}