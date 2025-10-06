
'use client';

import { useState, useEffect, useRef } from 'react';
import { Bot, Loader2, SendHorizonal, Sparkles, X, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { getAiResponse } from '@/ai/flows/freshoz-buddy';
import { useCart } from '@/lib/cart/cart-context';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/types';
import { products as allProducts } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useAuth } from '@/lib/firebase/auth-context';
import Link from 'next/link';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: React.ReactNode;
  productSuggestion?: Product;
};

export default function FreshozBuddy() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showInitial, setShowInitial] = useState(true);
  const { getCartItems, addToCart } = useCart();
  const { appUser } = useAuth();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('div');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleReset = () => {
    setMessages([]);
    setInputValue('');
    setIsLoading(false);
    setShowInitial(true);
  };

  const handleAddProductFromSuggestion = (product: Product, quantity = 1) => {
    addToCart({
      id: product.variants?.[0]?.id ? `${product.id}-${product.variants[0].id}` : product.id,
      productId: product.id,
      variantId: product.variants?.[0]?.id || 'default',
      name: product.name_en,
      price: product.variants?.[0]?.price || product.price,
      image: product.image,
      quantity: quantity,
    });
    toast({
      title: 'Item added!',
      description: `${quantity} x ${product.name_en} aapke cart mein jod diya gaya hai.`,
    });
  };

  const handleSubmit = async (e?: React.FormEvent, queryOverride?: string) => {
    e?.preventDefault();
    const query = queryOverride || inputValue;
    if (!query.trim() || isLoading) return;

    setShowInitial(false);
    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: query };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    setIsLoading(true);

    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Soch rahi hoon...</span>
        </div>
      ),
    };

    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const currentCartItems = getCartItems();
      const result = await getAiResponse({ query, cartItems: currentCartItems });
      
      const responseText = result.response;
      let productSuggestion: Product | undefined;

      if(result.cartAction?.action === 'add' && result.cartAction?.itemName) {
        const product = allProducts.find(p => p.name_en.toLowerCase() === result.cartAction!.itemName!.toLowerCase());
        if (product) {
          productSuggestion = product;
        }
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: responseText,
        productSuggestion: productSuggestion
      };
      
      setMessages((prev) => [...prev.slice(0, -1), assistantMessage]);

    } catch (error) {
      console.error('AI Flow Error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: (
          <div className="text-red-600 bg-red-50 p-3 rounded-lg">
            <p className="font-semibold">Maaf kijiye, kuch takneeki samasya aa gayi hai.</p>
            <p className="text-sm mt-1">Kripya thodi der baad koshish karein.</p>
          </div>
        ),
      };
      setMessages((prev) => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHintClick = (hint: string) => {
    handleSubmit(undefined, hint);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className={cn(
          "glass-icon-button fixed bottom-24 right-4 z-40 h-14 w-14 transition-all duration-300 md:right-6",
           useCart().cartCount > 0 ? 'md:bottom-40' : 'md:bottom-24'
        )}
        aria-label="Open AI Assistant"
      >
        <Sparkles className="h-7 w-7 text-positive" />
      </Button>
      
      <Sheet open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setTimeout(handleReset, 300);
        }
      }}>
        <SheetContent className="flex w-full flex-col sm:max-w-md p-0 glass-card">
          <SheetHeader className="px-6 py-4 border-b">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-full">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                 <div>
                    <h2 className="text-xl font-bold uppercase text-primary">
                        <span className="font-black text-positive">FRESHOZ</span> AI
                    </h2>
                  <p className="text-sm text-muted-foreground">Aapki apni shopping assistant</p>
                </div>
              </div>
          </SheetHeader>
          
          <div className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 px-6 py-4" ref={scrollAreaRef}>
                {showInitial ? (
                    <div className="flex-1 px-6 py-6 flex flex-col justify-center text-center">
                        <div className="space-y-4">
                            <div className="inline-block p-4 bg-green-500/10 rounded-full mb-3">
                                <Sparkles className="h-10 w-10 text-positive"/>
                            </div>
                            <h3 className="font-semibold text-lg text-primary">Hi {appUser?.displayName || 'Guest'}, how can I help you?</h3>
                            <p className="text-muted-foreground text-sm">
                               <span className="font-bold text-positive">Freshoz</span> aapki shopping ko aur behtar banane ke liye yahaan hai!
                            </p>
                            <div className="pt-4 space-y-2">
                                <p className="text-sm text-muted-foreground">Try asking:</p>
                                <Button asChild variant="outline" size="sm" className="w-full justify-start glass-card p-4 rounded-xl text-primary/80 transition-all hover:bg-primary/5">
                                  <Link href="/products/category/fresh-vegetables">"Mujhe kuch sabjiyan dikhao"</Link>
                                </Button>
                                <Button asChild variant="outline" size="sm" className="w-full justify-start glass-card p-4 rounded-xl text-primary/80 transition-all hover:bg-primary/5">
                                  <Link href="/wallet">"Mera wallet balance kitna hai?"</Link>
                                </Button>
                                <Button asChild variant="outline" size="sm" className="w-full justify-start glass-card p-4 rounded-xl text-primary/80 transition-all hover:bg-primary/5">
                                  <Link href="/offers">"What are the best deals today?"</Link>
                                </Button>
                                <Button asChild variant="outline" size="sm" className="w-full justify-start glass-card p-4 rounded-xl text-primary/80 transition-all hover:bg-primary/5">
                                  <Link href="/offers">"Kya mere liye aaj koi offer hai?"</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                    {messages.map((message) => (
                        <div key={message.id} className={`flex flex-col items-start gap-2 ${message.role === 'user' ? 'items-end' : ''}`}>
                        <div className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                            {message.role === 'assistant' && (
                            <Avatar className="h-8 w-8 bg-gradient-to-r from-green-500 to-emerald-600">
                                <AvatarFallback className="bg-transparent">
                                <Bot size={16} className="text-white" />
                                </AvatarFallback>
                            </Avatar>
                            )}
                            <div className={cn(
                            "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                            message.role === 'user' 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                                : 'bg-gray-100 text-gray-800'
                            )}>
                            {message.content}
                            </div>
                        </div>
                        {message.role === 'assistant' && message.productSuggestion && (
                            <Card className="max-w-[80%] ml-11 bg-white border-gray-200 shadow-sm">
                                <CardContent className="p-3 flex items-center gap-3">
                                    <div className="relative h-14 w-14 rounded-md overflow-hidden flex-shrink-0">
                                        <Image src={message.productSuggestion.image} alt={message.productSuggestion.name_en} fill className="object-cover" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-sm">{message.productSuggestion.name_en}</p>
                                        <p className="text-xs text-muted-foreground">{message.productSuggestion.pack_size}</p>
                                        <p className="font-bold text-sm text-primary">₹{message.productSuggestion.price}</p>
                                    </div>
                                    <Button size="sm" className="bg-positive text-white h-8" onClick={() => handleAddProductFromSuggestion(message.productSuggestion!)}>
                                        <ShoppingCart className="h-4 w-4 mr-2" />
                                        Add
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                        </div>
                    ))}
                    </div>
                )}
            </ScrollArea>
              
              <div className="px-6 py-4 border-t">
                <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
                  <Input
                    id="ai-assistant-input"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Aap kya dhoondh rahe hain?"
                    disabled={isLoading}
                    className="flex-1"
                    autoFocus
                  />
                  <Button type="submit" size="icon" className="bg-gradient-to-r from-green-500 to-emerald-600" disabled={isLoading || !inputValue.trim()}>
                    <SendHorizonal className="h-4 w-4" />
                  </Button>
                </form>
                
                {!showInitial && (
                    <Button 
                    type="button" 
                    variant="outline" 
                    className="mt-3 w-full" 
                    onClick={handleReset}
                    disabled={isLoading}
                    >
                    <X className="h-4 w-4 mr-2" />
                    Phir se shuru karein
                    </Button>
                )}
              </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
