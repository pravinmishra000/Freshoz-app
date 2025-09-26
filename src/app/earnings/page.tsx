import { EarningsSummary } from '@/components/rider/EarningsSummary';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function RiderEarningsPage() {
  return (
    <div className="space-y-6">
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader>
          <CardTitle className="font-headline text-4xl font-bold text-primary">Earnings Dashboard</CardTitle>
          <CardDescription>
            Track your earnings, view shift logs, and manage your payments.
          </CardDescription>
        </CardHeader>
      </Card>
      <EarningsSummary />
    </div>
  );
}
