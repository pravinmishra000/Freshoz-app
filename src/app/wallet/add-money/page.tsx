
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, CreditCard, Smartphone, Eye, EyeOff, Shield, Zap, Wallet } from 'lucide-react';

const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

export default function AddMoneyPage() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });
  const [upiId, setUpiId] = useState('');
  const [showCvv, setShowCvv] = useState(false);

  const handleAddMoney = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (paymentMethod === 'card') {
      if (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv) {
        alert("Please enter complete card details");
        return;
      }

      if (cardDetails.number.replace(/\s+/g, '').length !== 16) {
        alert("Please enter a valid 16-digit card number");
        return;
      }
    }

    if (paymentMethod === 'upi' && !upiId) {
      alert("Please enter UPI ID");
      return;
    }

    setIsProcessing(true);

    try {
      const amountValue = parseFloat(amount);

      console.log(`Processing ₹${'${amountValue}'} via ${'${paymentMethod}'}`);
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert(`₹${'${amountValue}'} added successfully to your wallet!`);
      router.push('/wallet');

    } catch (error: any) {
      console.error('Payment error:', error);
      const errorMessage = error.message.includes('network')
        ? 'Network error. Please check your internet connection and try again.'
        : 'Payment failed. Please try again or use a different payment method.';

      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardInputChange = (field: string, value: string) => {
    setCardDetails(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '').substring(0, 4);
    if (v.length >= 3) {
      return `${'${v.substring(0, 2)}'}/${'${v.substring(2)}'}`;
    }
    return v;
  };

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Pay using your card securely',
      color: 'text-blue-600'
    },
    {
      id: 'upi',
      name: 'UPI',
      icon: Smartphone,
      description: 'Pay using any UPI app',
      color: 'text-green-600'
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: Wallet,
      description: 'Transfer from your bank',
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-yellow-500 text-white pb-6 pt-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              className="text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-bold">Add Money</h1>
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* Amount Selection */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <Label htmlFor="amount" className="text-lg font-semibold mb-4 block text-gray-800">
                Enter Amount
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="₹0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-3xl text-center py-6 border-2 border-green-200 focus:border-green-500 font-bold"
                min="1"
              />
              
              <div className="grid grid-cols-3 gap-2 mt-4">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    variant={amount === quickAmount.toString() ? "default" : "outline"}
                    onClick={() => setAmount(quickAmount.toString())}
                    className={`rounded-lg h-12 ${
                      amount === quickAmount.toString() 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'border-green-200 text-green-700 hover:bg-green-50'
                    }`}
                  >
                    ₹{quickAmount}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Payment Method</h2>
              
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                {paymentMethods.map((method) => (
                  <div key={method.id}>
                    <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                    <Label
                      htmlFor={method.id}
                      className={`flex items-center space-x-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === method.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <method.icon className={`h-6 w-6 ${'${method.color}'}`} />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{method.name}</div>
                        <div className="text-sm text-gray-600">{method.description}</div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === method.id 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-300'
                      }`}>
                        {paymentMethod === method.id && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {paymentMethod === 'card' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                  <div>
                    <Label htmlFor="cardNumber" className="text-sm font-medium text-gray-700">
                      Card Number
                    </Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={formatCardNumber(cardDetails.number)}
                      onChange={(e) => handleCardInputChange('number', e.target.value.replace(/\s+/g, ''))}
                      maxLength={19}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cardName" className="text-sm font-medium text-gray-700">
                      Cardholder Name
                    </Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      value={cardDetails.name}
                      onChange={(e) => handleCardInputChange('name', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cardExpiry" className="text-sm font-medium text-gray-700">
                        Expiry Date
                      </Label>
                      <Input
                        id="cardExpiry"
                        placeholder="MM/YY"
                        value={formatExpiry(cardDetails.expiry)}
                        onChange={(e) => handleCardInputChange('expiry', e.target.value)}
                        maxLength={5}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cardCvv" className="text-sm font-medium text-gray-700">
                        CVV
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="cardCvv"
                          type={showCvv ? "text" : "password"}
                          placeholder="123"
                          value={cardDetails.cvv}
                          onChange={(e) => handleCardInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                          maxLength={4}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-500"
                          onClick={() => setShowCvv(!showCvv)}
                        >
                          {showCvv ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Label htmlFor="upiId" className="text-sm font-medium text-gray-700">
                    UPI ID
                  </Label>
                  <Input
                    id="upiId"
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    Enter your UPI ID or we'll redirect you to your UPI app
                  </p>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                  <Wallet className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-700">
                    You'll be redirected to your bank's secure portal for payment
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Features */}
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span>256-bit SSL Secure</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-green-600" />
              <span>Instant Transfer</span>
            </div>
          </div>

          {/* Add Money Button */}
          <Button 
            onClick={handleAddMoney}
            className="w-full h-14 bg-gradient-to-r from-green-600 to-yellow-500 hover:from-green-700 hover:to-yellow-600 text-white text-lg rounded-xl shadow-lg font-semibold transition-all duration-200"
            disabled={!amount || parseFloat(amount) <= 0 || isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing Payment...</span>
              </div>
            ) : (
              `Add ₹${'${amount || '0'}'} to Wallet`
            )}
          </Button>

          {/* Benefits Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-sm text-blue-800">
                <strong className="text-green-700">Benefits:</strong> 
                <span className="text-gray-700"> Instant transfer • Zero fees • 24/7 support • Bank-level security</span>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Your payment details are encrypted and secure. We never store your card information.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
