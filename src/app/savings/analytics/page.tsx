import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BackButton } from '@/components/freshoz/BackButton';
import { Button } from '@/components/ui/button';
import { Settings, TrendingUp, BarChart3, PieChart, Download } from 'lucide-react';

export default function SavingsAnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton />
              <div>
                <CardTitle className="font-headline text-4xl font-bold text-blue-800">
                  Detailed Analytics
                </CardTitle>
                <CardDescription className="text-lg text-blue-600">
                  Deep dive into your savings patterns and spending insights
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="text-gray-700">
                <Download className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-700">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="glass-card bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Monthly Trends</CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold text-blue-700">+15%</div>
            <p className="text-xs text-blue-600">savings growth</p>
          </CardContent>
        </Card>

        <Card className="glass-card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Category Analysis</CardTitle>
            <PieChart className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold text-green-700">8</div>
            <p className="text-xs text-green-600">categories tracked</p>
          </CardContent>
        </Card>

        <Card className="glass-card bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Market Comparison</CardTitle>
            <BarChart3 className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold text-purple-700">12%</div>
            <p className="text-xs text-purple-600">avg. savings</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Content */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl text-blue-800">Advanced Savings Analytics</CardTitle>
          <CardDescription>
            Comprehensive analysis of your shopping patterns and savings opportunities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-800">Top Saving Categories</h3>
              <div className="space-y-3">
                {['Staples', 'Dairy', 'Vegetables', 'Fruits'].map((category, index) => (
                  <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{category}</span>
                    <span className="text-green-600 font-bold">Save 15%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-800">Shopping Patterns</h3>
              <div className="space-y-3">
                {['Weekend Shopping', 'Bulk Purchases', 'Morning Delivery', 'Seasonal Buys'].map((pattern, index) => (
                  <div key={pattern} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{pattern}</span>
                    <span className="text-blue-600 font-bold">+₹{150 + index * 50}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Export Report
            </Button>
            <Button variant="outline">
              Set Savings Goal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}