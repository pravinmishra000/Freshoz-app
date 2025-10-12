import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DailyDishManager } from '@/components/admin/DailyDishManager';

export default function AdminDailyDishesPage() {
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