
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BackButton } from '@/components/freshoz/BackButton';
import { Wallet, Plus, History, RefreshCw, IndianRupee, Sparkles } from 'lucide-react';

export default function WalletPage() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setBalance(1250.75);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute top-10 left-10 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>

      {/* Sparkles Effect */}
      <div className="absolute top-20 right-20 animate-bounce">
        <Sparkles className="w-6 h-6 text-yellow-300" />
      </div>
      <div className="absolute bottom-20 left-20 animate-bounce delay-300">
        <Sparkles className="w-4 h-4 text-white" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <BackButton />
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="glass-card rounded-2xl border-2 border-white/40 text-white p-3 hover:bg-white/20 transition-all duration-300"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-md mx-auto">
          {/* Wallet Header Card */}
          <Card className="glass-card rounded-3xl border-2 border-white/30 backdrop-blur-lg mb-6">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-gradient-to-r from-green-400 to-yellow-300 rounded-2xl">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-white uppercase">
                Freshoz Wallet
              </CardTitle>
              <CardDescription className="text-white/80 text-base">
                Your Digital Balance
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Balance Card */}
          <Card className="glass-card rounded-3xl border-2 border-white/30 backdrop-blur-lg mb-6">
            <CardContent className="text-center p-6">
              <div className="flex items-center justify-center mb-2">
                <IndianRupee className="w-6 h-6 text-white/80 mr-1" />
                <span className="text-white/80 text-lg">Current Balance</span>
              </div>
              <div className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
                ₹{balance.toLocaleString()}
              </div>
              <div className="text-green-200 text-sm font-medium">
                💫 Ready to use instantly
              </div>
            </CardContent>
          </Card>

          {/* Actions Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Add Money Button */}
            <Button 
              onClick={() => router.push('/wallet/add-money')}
              className="bg-green-100/80 hover:bg-green-200/80 text-green-800 glass-card rounded-2xl border-2 border-white/40 h-24 hover:scale-105 transition-all duration-300 group"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-green-500/20 rounded-full group-hover:bg-green-500/30 transition-colors">
                  <Plus className="w-6 h-6 text-green-700" />
                </div>
                <span className="font-semibold text-sm">Add Money</span>
              </div>
            </Button>

            {/* Transactions Button */}
            <Button 
              onClick={() => router.push('/wallet/transactions')}
              className="bg-green-100/80 hover:bg-green-200/80 text-green-800 glass-card rounded-2xl border-2 border-white/40 h-24 hover:scale-105 transition-all duration-300 group"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-yellow-500/20 rounded-full group-hover:bg-yellow-500/30 transition-colors">
                  <History className="w-6 h-6 text-yellow-700" />
                </div>
                <span className="font-semibold text-sm">Transactions</span>
              </div>
            </Button>
          </div>

          {/* Quick Stats */}
          <Card className="glass-card rounded-2xl border-2 border-white/20 backdrop-blur-lg mt-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-white font-bold text-lg">5</div>
                  <div className="text-white/60 text-xs">Transactions</div>
                </div>
                <div>
                  <div className="text-white font-bold text-lg">₹500</div>
                  <div className="text-white/60 text-xs">Avg. Spend</div>
                </div>
                <div>
                  <div className="text-white font-bold text-lg">30d</div>
                  <div className="text-white/60 text-xs">Active</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
