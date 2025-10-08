
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { auth } from '@/lib/firebase/server';
import { getUser } from '@/services/firestoreService';
import { redirect } from 'next/navigation';

export default async function AdminDashboardPage() {
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
