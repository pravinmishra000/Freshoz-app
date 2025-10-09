'use client';

import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Truck, Gem, ArrowRight, Lightbulb, TrendingUp, BadgePercent, Calendar, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

// Mock Data
const savingsData = {
  totalSaved: 1250.75,
  deliveryFeesAvoided: 240,
  loyaltyPoints: 850,
  monthlySavings: {
    current: 450,
    goal: 700,
  },
  categorySpending: [
    { name: 'Vegetables', value: 4000, color: '#16a34a' },
    { name: 'Fruits', value: 2500, color: '#f59e0b' },
    { name: 'Dairy', value: 3000, color: '#3b82f6' },
    { name: 'Staples', value: 5500, color: '#9333ea' },
  ],
  priceComparison: [
    { name: 'Freshoz Price', value: 850, fill: 'hsl(var(--positive))' },
    { name: 'Local Market', value: 1020, fill: 'hsl(var(--destructive))' },
  ],
  insights: [
    { 
      text: "You saved ₹450 this month by choosing us over local markets!", 
      icon: TrendingUp,
      action: "View Details"
    },
    { 
      text: "Switch to morning delivery to save an average of ₹15 per order.", 
      icon: Lightbulb,
      action: "Change Slot"
    },
    { 
      text: "Buy staples in bulk to save up to 15% weekly.", 
      icon: BadgePercent,
      action: "Shop Bulk"
    },
  ],
};

const insights = [
  { 
    text: "You saved ₹450 this month by choosing us over local markets!", 
    icon: TrendingUp,
    action: "View Details" // ✅ Yeh line add karein
  },
  { 
    text: "Switch to morning delivery to save an average of ₹15 per order.", 
    icon: Lightbulb,
    action: "Change Slot" // ✅ Yeh line add karein
  },
  { 
    text: "Buy staples in bulk to save up to 15% weekly.", 
    icon: BadgePercent,
    action: "Shop Bulk" // ✅ Yeh line add karein
  },
];

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  colorClass,
  description 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  colorClass: string;
  description?: string;
}) {
  return (
    <Card className="glass-card group hover:shadow-lg transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-full ${colorClass} bg-opacity-10 group-hover:scale-110 transition-transform`}>
          <Icon className={`h-5 w-5 ${colorClass}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {typeof value === 'number' ? `₹${value.toFixed(2)}` : value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function SavingsDashboard() {
  const router = useRouter(); // ✅ Router initialize kiya
  const { 
    totalSaved, 
    deliveryFeesAvoided, 
    loyaltyPoints, 
    monthlySavings, 
    categorySpending, 
    priceComparison, 
    insights 
  } = savingsData;

  const savingsPercentage = (monthlySavings.current / monthlySavings.goal) * 100;
  const totalMarketPrice = priceComparison[1].value;
  const totalOurPrice = priceComparison[0].value;
  const totalSavings = totalMarketPrice - totalOurPrice;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="font-headline text-3xl font-bold text-green-800">
          Smart Savings Dashboard
        </h1>
        <p className="text-green-600 text-lg">
          Track your savings and make smarter grocery choices
        </p>
        <Badge variant="secondary" className="bg-green-100 text-green-800 text-sm">
          You've saved ₹{totalSaved} total!
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard 
          title="Total Saved vs Market" 
          value={totalSaved} 
          icon={DollarSign} 
          colorClass="text-green-600"
          description="Compared to local markets"
        />
        <StatCard 
          title="Delivery Fees Avoided" 
          value={deliveryFeesAvoided} 
          icon={Truck} 
          colorClass="text-blue-600"
          description="Free delivery benefits"
        />
        <StatCard 
          title="Loyalty Points" 
          value={`${loyaltyPoints} pts`} 
          icon={Gem} 
          colorClass="text-purple-600"
          description="Available for redemption"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Monthly Savings Progress */}
        <Card 
          className="glass-card lg:col-span-2 hover:shadow-lg transition-all duration-300 cursor-pointer"
          onClick={() => router.push('/savings/analytics')} // ✅ Router use kiya
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Monthly Savings Goal
            </CardTitle>
            <CardDescription>You are on track to save big this month!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between font-medium">
              <span className="text-green-600">Saved: ₹{monthlySavings.current}</span>
              <span className="text-muted-foreground">Goal: ₹{monthlySavings.goal}</span>
            </div>
            <Progress value={savingsPercentage} className="h-3 [&>div]:bg-green-500" />
            <div className="flex justify-between text-sm">
              <span className="text-green-600 font-semibold">
                {savingsPercentage.toFixed(0)}% achieved
              </span>
              <span className="text-muted-foreground">
                ₹{monthlySavings.goal - monthlySavings.current} to go
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Category-wise Spending */}
        <Card className="glass-card lg:col-span-3 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-green-600" />
              Spending by Category
            </CardTitle>
            <CardDescription>See where you spend the most on groceries</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie 
                  data={categorySpending} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={80} 
                  label={({ name, percent }) => 
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {categorySpending.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
                />
                <Legend 
                  iconType="circle" 
                  formatter={(value) => <span className="text-sm">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Price Comparison */}
      <Card className="glass-card hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Price Comparison: Freshoz vs Local Market
          </CardTitle>
          <CardDescription>
            Your average weekly basket - You save ₹{totalSavings} with Freshoz!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart 
                data={priceComparison} 
                layout="vertical" 
                margin={{ left: 100, right: 20, top: 20, bottom: 20 }}
              >
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 14, fontWeight: 500 }}
                  width={80}
                />
                <Tooltip 
                  formatter={(value: number) => [`₹${value}`, 'Price']}
                  cursor={{ fill: 'hsl(var(--accent))' }} 
                />
                <Bar 
                  dataKey="value" 
                  radius={[0, 8, 8, 0]} 
                  barSize={40}
                >
                  {priceComparison.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            
            {/* Savings Summary */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Market Price</p>
                <p className="text-lg font-bold text-red-600">₹{totalMarketPrice}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Freshoz Price</p>
                <p className="text-lg font-bold text-green-600">₹{totalOurPrice}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">You Save</p>
                <p className="text-lg font-bold text-green-700">₹{totalSavings}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actionable Insights */}
      <Card className="glass-card hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="text-green-600 h-6 w-6"/>
            Smart Savings Tips
          </CardTitle>
          <CardDescription>Discover more ways to save on your next order</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.map((insight, index) => (
            <div 
              key={index} 
              className="flex items-center gap-4 p-4 rounded-lg bg-green-50 border border-green-200 hover:bg-green-100 transition-colors group"
            >
              <div className="bg-green-100 p-3 rounded-full group-hover:scale-110 transition-transform">
                <insight.icon className="h-5 w-5 text-green-600"/>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">{insight.text}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-green-700 border-green-300 hover:bg-green-600 hover:text-white transition-colors"
                onClick={() => {
                  // Different action based on insight type
                  if (insight.action === "View Details") {
                    router.push('/savings/analytics'); // ✅ Router use kiya
                  } else if (insight.action === "Change Slot") {
                    router.push('/delivery-settings'); // ✅ Router use kiya
                  } else if (insight.action === "Shop Bulk") {
                    router.push('/products?category=staples'); // ✅ Router use kiya
                  }
                }}
              >
                {insight.action} 
                <ArrowRight className="h-4 w-4 ml-1"/>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}