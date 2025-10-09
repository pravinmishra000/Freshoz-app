import { SavingsDashboard } from '@/components/savings/SavingsDashboard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Coins, PiggyBank, TrendingUp, ArrowLeft } from 'lucide-react';
import { BackButton } from '@/components/freshoz/BackButton';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

export default function SavingsPage() {
  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton />
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full opacity-10 blur-sm"></div>
                <Coins className="h-12 w-12 text-green-600 relative z-10" />
              </div>
              <div>
                <CardTitle className="font-headline text-4xl font-bold text-green-800">
                  Smart Savings Hub
                </CardTitle>
                <CardDescription className="text-lg text-green-600">
                  Track your savings and make smarter grocery choices with Freshoz!
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-gray-700 hover:bg-green-100">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Total Saved</CardTitle>
            <PiggyBank className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold text-green-700">₹1,250</div>
            <p className="text-xs text-green-600">vs local markets</p>
          </CardContent>
        </Card>

        <Card className="glass-card bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Delivery Fees Saved</CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold text-blue-700">₹360</div>
            <p className="text-xs text-blue-600">free delivery benefits</p>
          </CardContent>
        </Card>

        <Card className="glass-card bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">Loyalty Points</CardTitle>
            <Coins className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold text-amber-700">450 pts</div>
            <p className="text-xs text-amber-600">available for redemption</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Savings Dashboard */}
      <SavingsDashboard />
    </div>
  );
}