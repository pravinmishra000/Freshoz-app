
'use client';

import { useEffect, useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, Users } from 'lucide-react';
import { getAnalyticsSummary } from '@/app/actions/adminActions';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  revenueByDay: { date: string; revenue: number }[];
  ordersByDay: { date: string; orders: number }[];
}

function StatCard({ title, value, icon: Icon, loading }: { title: string; value: string | number; icon: React.ElementType; loading: boolean }) {
  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
           <Skeleton className="h-8 w-3/4" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, data, dataKey, xKey, loading }: { title: string; data: any[]; dataKey: string; xKey: string; loading: boolean }) {
    return (
        <Card className="glass-card col-span-1 lg:col-span-2">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-[300px] w-full" />
                ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey={xKey} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => (dataKey === 'revenue' ? `₹${value}` : value)} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: 'var(--radius)',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend wrapperStyle={{fontSize: "14px"}}/>
                    <Bar dataKey={dataKey} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    )
}

export function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const data = await getAnalyticsSummary();
      setAnalytics(data);
    });
  }, []);

  const isLoading = isPending || !analytics;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Revenue" value={`₹${analytics?.totalRevenue.toFixed(2) ?? '0.00'}`} icon={DollarSign} loading={isLoading} />
        <StatCard title="Total Orders" value={analytics?.totalOrders ?? 0} icon={Package} loading={isLoading} />
        <StatCard title="Total Customers" value={analytics?.totalUsers ?? 0} icon={Users} loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
         <ChartCard title="Revenue Last 7 Days" data={analytics?.revenueByDay ?? []} dataKey="revenue" xKey="date" loading={isLoading} />
         <ChartCard title="Orders Last 7 Days" data={analytics?.ordersByDay ?? []} dataKey="orders" xKey="date" loading={isLoading} />
      </div>
    </div>
  );
}
