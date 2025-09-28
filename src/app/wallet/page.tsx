
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BackButton } from '@/components/freshoz/BackButton';
import { History, Plus, RefreshCw, IndianRupee, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';


const WalletIcon = () => (
    <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="rotate(-15 50 50)">
            <path d="M10 40C10 34.4772 14.4772 30 20 30H80C85.5228 30 90 34.4772 90 40V70C90 75.5228 85.5228 80 80 80H20C14.4772 80 10 75.5228 10 70V40Z" fill="url(#wallet_gold_gradient)"/>
            <path d="M10 45C10 39.4772 14.4772 35 20 35H90V70C90 75.5228 85.5228 80 80 80H20C14.4772 80 10 75.5228 10 70V45Z" fill="url(#wallet_green_gradient)"/>
            <text x="50" y="62" textAnchor="middle" fontSize="30" fill="white" fontWeight="bold">₹</text>
        </g>
        <defs>
            <linearGradient id="wallet_gold_gradient" x1="50" y1="30" x2="50" y2="80" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FDE047"/>
                <stop offset="1" stopColor="#FBBF24"/>
            </linearGradient>
            <linearGradient id="wallet_green_gradient" x1="50" y1="35" x2="50" y2="80" gradientUnits="userSpaceOnUse">
                <stop stopColor="#16A34A"/>
                <stop offset="1" stopColor="#15803D"/>
            </linearGradient>
        </defs>
    </svg>
);


export default function WalletPage() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Mock balance
    setBalance(1250.75);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate a network request
    await new Promise(resolve => setTimeout(resolve, 800));
    // You might fetch the new balance here
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-300 via-yellow-200 to-yellow-50">
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
        <div className="max-w-md mx-auto text-center">

            <div className="flex justify-center mb-4">
                <WalletIcon />
            </div>

            <h1 className="text-4xl font-extrabold text-gray-800 tracking-tighter uppercase">Freshoz MONEY</h1>
            <p className="text-gray-600 mt-1">Your Digital Balance</p>

            <div className="mt-8 mb-10">
                 <p className="text-gray-600 text-lg">Current Balance</p>
                 <p className="text-6xl font-bold text-gray-800 mt-1">
                    <span className="font-sans">₹</span>{balance.toLocaleString('en-IN')}
                 </p>
            </div>
            
            <div className="space-y-4">
                <Card 
                    className="bg-white/70 backdrop-blur-sm border-gray-200/50 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push('/wallet/add-money')}
                >
                    <CardContent className="p-5 flex items-center gap-5">
                        <div className="bg-green-100 p-3 rounded-xl">
                            <Plus className="w-6 h-6 text-green-700"/>
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-lg text-gray-800">Add Money</h3>
                            <p className="text-gray-600 text-sm">Instantly top up your wallet balance.</p>
                        </div>
                    </CardContent>
                </Card>

                 <Card 
                    className="bg-white/70 backdrop-blur-sm border-gray-200/50 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push('/wallet/transactions')}
                >
                    <CardContent className="p-5 flex items-center gap-5">
                        <div className="bg-blue-100 p-3 rounded-xl">
                            <History className="w-6 h-6 text-blue-700"/>
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-lg text-gray-800">Transaction History</h3>
                            <p className="text-gray-600 text-sm">View all your past transactions.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>


             <Button
                variant="ghost"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="mt-8 text-gray-600"
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && 'animate-spin')} />
                Refresh Balance
            </Button>
        </div>
      </div>
    </div>
  );
}

