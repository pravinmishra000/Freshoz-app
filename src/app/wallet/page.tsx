'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BackButton } from '@/components/freshoz/BackButton';
import { History, Plus, RefreshCw, Settings, TrendingUp, PiggyBank, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/firebase/auth-context';
import { listenToWalletBalance } from '@/services/firestoreService';

const WalletIcon = () => (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="rotate(-10 50 50) scale(1.1)">
            {/* Shadow Layer */}
            <path d="M10 37C10 31.4772 14.4772 27 20 27H80C85.5228 27 90 31.4772 90 37V77C90 82.5228 85.5228 87 80 87H20C14.4772 87 10 82.5228 10 77V37Z" fill="rgba(0,0,0,0.15)" />
            {/* Main Body */}
            <path d="M10 35C10 29.4772 14.4772 25 20 25H80C85.5228 25 90 29.4772 90 35V75C90 80.5228 85.5228 85 80 85H20C14.4772 85 10 80.5228 10 75V35Z" fill="#16A34A"/>
            {/* Top Flap - Extended */}
            <path d="M10 35C10 29.4772 14.4772 25 20 25H80C85.5228 25 90 29.4772 90 35V55C90 55 85.5228 50 80 50H20C14.4772 50 10 55 10 55V35Z" fill="#FBBF24"/>
            {/* Rupee Symbol */}
            <text x="50%" y="75%" textAnchor="middle" fill="white" fontSize="32" fontWeight="bold" fontFamily="sans-serif">
              ₹
            </text>
        </g>
    </svg>
);

// Mock savings data - baad mein real data se replace karenge
const mockSavingsData = {
  totalSaved: 1250,
  deliveryFeesAvoided: 360,
  loyaltyPoints: 450,
};

export default function WalletPage() {
  const router = useRouter();
  const { authUser } = useAuth();
  const [balance, setBalance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBalanceManually = useCallback(async () => {
    if (authUser) {
      setIsRefreshing(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsRefreshing(false);
    }
  }, [authUser]);

  useEffect(() => {
    if (authUser) {
      setIsLoading(true);
      const unsubscribe = listenToWalletBalance(authUser.uid, (newBalance) => {
        setBalance(newBalance);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else {
        setIsLoading(false);
    }
  }, [authUser]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <BackButton />
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" className="text-gray-700 hover:bg-black/10 rounded-full">
                <Settings className="w-6 h-6" />
             </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-md mx-auto">
          {/* Wallet Balance Card */}
          <Card className="glass-card mb-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <WalletIcon />
              </div>

              <h1 className="text-3xl font-bold tracking-tight mb-2">Freshoz Money</h1>
              <p className="text-green-100 mb-4">Your Digital Wallet</p>

              <div className="mb-6">
                <p className="text-green-100 text-lg">Current Balance</p>
                {isLoading ? (
                  <div className="h-16 w-48 bg-green-400/30 animate-pulse rounded-md mx-auto mt-2"></div>
                ) : (
                  <p className="text-5xl font-bold mt-2">
                    <span className="font-sans">₹</span>{balance.toLocaleString('en-IN')}
                  </p>
                )}
              </div>

              <Button
                variant="secondary"
                onClick={fetchBalanceManually}
                disabled={isRefreshing}
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && 'animate-spin')} />
                Refresh Balance
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-4 mb-8">
            <Card 
              className="bg-white/80 backdrop-blur-sm border-green-200 shadow-md hover:shadow-lg transition-shadow cursor-pointer hover:scale-[1.02]"
              onClick={() => router.push('/wallet/add-money')}
            >
              <CardContent className="p-5 flex items-center gap-5">
                <div className="bg-green-100 p-3 rounded-xl">
                  <Plus className="w-6 h-6 text-green-600"/>
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-bold text-lg text-gray-800">Add Money</h3>
                  <p className="text-gray-600 text-sm">Instantly top up your wallet</p>
                </div>
                <div className="text-green-600 font-semibold">→</div>
              </CardContent>
            </Card>

            <Card 
              className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-md hover:shadow-lg transition-shadow cursor-pointer hover:scale-[1.02]"
              onClick={() => router.push('/wallet/transactions')}
            >
              <CardContent className="p-5 flex items-center gap-5">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <History className="w-6 h-6 text-blue-600"/>
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-bold text-lg text-gray-800">Transaction History</h3>
                  <p className="text-gray-600 text-sm">View all your transactions</p>
                </div>
                <div className="text-blue-600 font-semibold">→</div>
              </CardContent>
            </Card>

            <Card 
              className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-md hover:shadow-lg transition-shadow cursor-pointer hover:scale-[1.02]"
              onClick={() => router.push('/savings')}
            >
              <CardContent className="p-5 flex items-center gap-5">
                <div className="bg-amber-100 p-3 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-amber-600"/>
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-bold text-lg text-gray-800">Savings Dashboard</h3>
                  <p className="text-gray-600 text-sm">Track your savings & insights</p>
                </div>
                <div className="text-amber-600 font-semibold">→</div>
              </CardContent>
            </Card>
          </div>

          {/* Savings Snapshot */}
          <Card className="glass-card bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <CardContent className="p-5">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <PiggyBank className="w-5 h-5" />
                Savings Snapshot
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-amber-100">Total Saved</span>
                  <span className="font-bold text-lg">₹{mockSavingsData.totalSaved}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-amber-100">Delivery Fees Avoided</span>
                  <span className="font-bold">₹{mockSavingsData.deliveryFeesAvoided}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-amber-100">Loyalty Points</span>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span className="font-bold">{mockSavingsData.loyaltyPoints}</span>
                  </div>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white border-white/30"
                onClick={() => router.push('/savings')}
              >
                View Detailed Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}