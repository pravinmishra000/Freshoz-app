
'use client';

import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Truck, Gem, ArrowRight, Lightbulb, TrendingUp, BadgePercent } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock Data
const totalSaved = 1250.75;
const deliveryFeesAvoided = 240;
const loyaltyPoints = 850;

const monthlySavingsData = {
  current: 450,
  goal: 700,
};

const categorySpendingData = [
  { name: 'Vegetables', value: 4000, color: '#16a34a' },
  { name: 'Fruits', value: 2500, color: '#f59e0b' },
  { name: 'Dairy', value: 3000, color: '#3b82f6' },
  { name: 'Staples', value: 5500, color: '#9333ea' },
];

const priceComparisonData = [
  { name: 'Freshoz Price', value: 850, fill: 'hsl(var(--positive))' },
  { name: 'Local Market', value: 1020, fill: 'hsl(var(--destructive))' },
];

const insights = [
    { text: "You saved ₹450 this month by choosing us over local markets!", icon: TrendingUp },
    { text: "Switch to morning delivery to save an average of ₹15 per order.", icon: Lightbulb },
    { text: "Buy staples in bulk to save up to 15% weekly.", icon: BadgePercent },
];


function StatCard({ title, value, icon: Icon, colorClass }: { title: string, value: string | number, icon: React.ElementType, colorClass: string }) {
    return (
        <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={`h-5 w-5 ${colorClass}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{typeof value === 'number' ? `₹${value.toFixed(2)}` : value}</div>
            </CardContent>
        </Card>
    );
}

export function SavingsDashboard() {
  const savingsPercentage = (monthlySavingsData.current / monthlySavingsData.goal) * 100;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Saved vs Market" value={totalSaved} icon={DollarSign} colorClass="text-positive" />
        <StatCard title="Delivery Fees Avoided" value={deliveryFeesAvoided} icon={Truck} colorClass="text-blue-500" />
        <StatCard title="Loyalty Points Earned" value={`${loyaltyPoints} pts`} icon={Gem} colorClass="text-purple-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Monthly Savings Progress */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Savings Goal</CardTitle>
            <CardDescription>You are on track to save big this month!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between font-medium">
                <span>Saved: ₹{monthlySavingsData.current}</span>
                <span className="text-muted-foreground">Goal: ₹{monthlySavingsData.goal}</span>
              </div>
              <Progress value={savingsPercentage} className="h-3 [&>div]:bg-positive" />
              <p className="text-sm text-center text-positive font-semibold">{savingsPercentage.toFixed(0)}% of your goal achieved!</p>
            </div>
          </CardContent>
        </Card>

        {/* Category-wise Spending */}
        <Card className="glass-card lg:col-span-3">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>See where you spend the most on groceries.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categorySpendingData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {categorySpendingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

       {/* Actionable Insights */}
        <Card className="glass-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="text-positive h-6 w-6"/>
                    Smart Savings Tips
                </CardTitle>
                <CardDescription>Discover more ways to save on your next order.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-4 p-3 rounded-lg bg-primary/5 hover:bg-primary/10">
                        <div className="bg-positive/10 p-2 rounded-full">
                           <insight.icon className="h-5 w-5 text-positive"/>
                        </div>
                        <p className="flex-1 text-sm text-foreground">{insight.text}</p>
                         <Button variant="ghost" size="sm" className="text-positive hover:text-positive">
                           Explore <ArrowRight className="h-4 w-4 ml-1"/>
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>


      {/* Price Comparison */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Freshoz vs. Local Market</CardTitle>
          <CardDescription>A comparison of your average weekly basket.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priceComparisonData} layout="vertical" margin={{ left: 30 }}>
              <Tooltip cursor={{fill: 'hsl(var(--accent))'}} formatter={(value: number) => `₹${value}`} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={40}>
                 {priceComparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
              </Bar>
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
