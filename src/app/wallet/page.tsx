
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BackButton } from '@/components/freshoz/BackButton';
import { History, Plus, RefreshCw, IndianRupee, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';


const WalletIcon = () => (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="rotate(-10 50 50) scale(1.1)">
            {/* Shadow Layer */}
            <path d="M10 37C10 31.4772 14.4772 27 20 27H80C85.5228 27 90 31.4772 90 37V77C90 82.5228 85.5228 87 80 87H20C14.4772 87 10 82.5228 10 77V37Z" fill="rgba(0,0,0,0.15)" />
            {/* Main Body */}
            <path d="M10 35C10 29.4772 14.4772 25 20 25H80C85.5228 25 90 29.4772 90 35V75C90 80.5228 85.5228 85 80 85H20C14.4772 85 10 80.5228 10 75V35Z" fill="#16A34A"/>
            {/* Top Flap */}
            <path d="M10 42.5C10 36.9772 14.4772 32.5 20 32.5H90V35C90 29.4772 85.5228 25 80 25H20C14.4772 25 10 29.4772 10 35V42.5Z" fill="#FBBF24"/>
            {/* Rupee Symbol */}
            <path d="M18 57H43M30.5 57V72M18 64H38" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
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

            <h1 className="text-4xl font-extrabold text-green-700 tracking-tighter uppercase">Freshoz MONEY</h1>
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
