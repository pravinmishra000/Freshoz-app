import { AdminOrderList } from '@/components/admin/AdminOrderList';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { auth } from '@/lib/firebase/server';
import { getUser } from '@/services/firestoreService';
import { redirect } from 'next/navigation';
import { BackButton } from '@/components/freshoz/BackButton';

export default async function AdminOrdersPage() {
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
           <div className="flex items-center gap-4 mb-2">
             <div className="hidden md:block">
                <BackButton />
             </div>
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
