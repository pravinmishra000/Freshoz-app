
import { SavingsDashboard } from '@/components/savings/SavingsDashboard';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Coins } from 'lucide-react';

export default function SavingsPage() {
  return (
    <div className="space-y-6">
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader>
           <div className="flex items-center gap-4 mb-2">
            <Coins className="h-10 w-10 text-positive"/>
            <div>
                <CardTitle className="font-headline text-4xl font-bold text-primary">Your Savings Hub</CardTitle>
                <CardDescription>
                  Track how much you've saved with Freshoz!
                </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
      <SavingsDashboard />
    </div>
  );
}
