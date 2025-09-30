
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bot, Loader2, SendHorizonal, Sparkles, X, Phone, MessageSquare, Mic, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { manageCart } from '@/ai/flows/freshoz-buddy';
import { useCart } from '@/lib/cart/cart-context';
import { cn } from '@/lib/utils';
import type { CartItem, Product } from '@/lib/types';
import { products as allProducts } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

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
  const [isListening, setIsListening] = useState(false);
  const { cartItems, getCartItems, addToCart } = useCart();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const supportPhoneNumber = '9097882555';

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    const setVoice = () => {
      window.speechSynthesis.cancel();
      const voices = window.speechSynthesis.getVoices();
      let desiredVoice = voices.find(voice => voice.lang === 'hi-IN' && voice.name.toLowerCase().includes('male'));
      
      if (!desiredVoice) {
        desiredVoice = voices.find(voice => voice.lang === 'hi-IN');
      }

      utterance.voice = desiredVoice || null;
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = setVoice;
    } else {
      setVoice();
    }
  }, []);
  
  useEffect(() => {
    if (isOpen && cartItems.length > 0 && messages.length === 0 && showInitial) {
      const proactiveMessage = "Namaste! Maine dekha ki aapke cart mein kuch saaman hai. Kya main aapki koi madad kar sakta hoon?";
      setMessages([{
        id: 'proactive',
        role: 'assistant', 
        content: proactiveMessage
      }]);
       if (typeof proactiveMessage === 'string') speak(proactiveMessage);
    }
  }, [isOpen, cartItems, messages.length, showInitial, speak]);
  
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
  }

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      const errorMsg = "Voice input is not supported in your browser. Please type your message.";
      const assistantMessage = { id: 'voice-error', role: 'assistant' as const, content: errorMsg };
      setMessages(prev => [...prev, assistantMessage]);
      speak(errorMsg);
      return;
    }
  
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
  
    setIsListening(true);
    setShowInitial(false); 
    
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;
  
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleSubmit(undefined, transcript);
    };
  
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };
  
    recognition.onend = () => {
      setIsListening(false);
    };
  
    recognition.start();
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
  }


  const handleSubmit = async (e?: React.FormEvent, voiceTranscript?: string) => {
    e?.preventDefault();
    const query = voiceTranscript || inputValue;
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
          <span>Soch raha hoon...</span>
        </div>
      ),
    };

    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const currentCartItems = getCartItems();
      
      const result = await manageCart({ query, cartItems: currentCartItems });
      
      let responseContent: React.ReactNode;
      let responseTextToSpeak: string = "";
      let productSuggestion: Product | undefined;

      if (typeof result === 'object' && result !== null) {
        responseTextToSpeak = result.message || "Main aapki kaise madad kar sakta hoon?";
        
        if (result.actions && result.actions.length > 0) {
            const action = result.actions[0];
            const product = allProducts.find(p => p.name_en.toLowerCase() === action.itemName.toLowerCase());

            if (product && (action.action === 'add' || action.action === 'update')) {
                 productSuggestion = product;
                 responseContent = (
                    <div>
                        <p>{responseTextToSpeak}</p>
                    </div>
                );
            } else if (product && action.action === 'remove') {
                responseContent = <p>{responseTextToSpeak}</p>;
            } else {
                 responseContent = <p>{responseTextToSpeak}</p>;
            }
        } else {
            responseContent = <p>{responseTextToSpeak}</p>;
        }

      } else {
        responseTextToSpeak = "Dhanyavaad! Aapka anurodh process kar liya gaya hai.";
        responseContent = responseTextToSpeak;
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: responseContent,
        productSuggestion: productSuggestion
      };

      setMessages((prev) => [...prev.slice(0, -1), assistantMessage]);
      if (responseTextToSpeak) speak(responseTextToSpeak);

    } catch (error) {
      console.error('AI Flow Error:', error);
      const errorText = "Maaf kijiye, kuch gadbad ho gayi. Kripya fir se koshish karein.";
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: (
          <div className="text-red-600 bg-red-50 p-3 rounded-lg">
            <p className="font-semibold">Maaf kijiye, kuch gadbad ho gayi</p>
            <p className="text-sm mt-1">Kripya fir se koshish karein.</p>
          </div>
        ),
      };
      setMessages((prev) => [...prev.slice(0, -1), errorMessage]);
      speak(errorText);
    } finally {
      setIsLoading(false);
    }
  };
    
  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="glass-icon-button fixed bottom-24 right-4 z-40 h-14 w-14 md:bottom-6 md:right-6"
        aria-label="Open AI Assistant"
      >
        <Sparkles className="h-7 w-7 text-primary" />
      </Button>
      
      <Sheet open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setTimeout(handleReset, 300);
          }
      }}>
        <SheetContent className="flex w-full flex-col sm:max-w-md p-0 glass-card">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-full">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold uppercase text-primary">FRESHOZ AI सहायक</h2>
                  <p className="text-sm text-muted-foreground">Aapki apni shopping assistant</p>
                </div>
              </div>
            </SheetTitle>
          </SheetHeader>
          
          {!showInitial ? (
            <>
              <ScrollArea className="flex-1 px-6 py-4" ref={scrollAreaRef}>
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
              </ScrollArea>
              
              <SheetFooter className="px-6 py-4 border-t">
                <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={'Bolein ya type karein...'}
                      disabled={isLoading}
                      className="pr-12"
                      autoFocus
                    />
                     <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn("absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-green-500 hover:bg-green-600 rounded-full", isListening && "bg-red-500 animate-pulse")}
                        onClick={startVoiceInput}
                        disabled={isLoading}
                      >
                        <Mic className="h-5 w-5 text-white" />
                      </Button>
                  </div>
                  <Button type="submit" size="icon" className="bg-gradient-to-r from-green-500 to-emerald-600" disabled={isLoading || !inputValue.trim()}>
                    <SendHorizonal className="h-4 w-4" />
                  </Button>
                </form>
                
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
              </SheetFooter>
            </>
          ) : (
            <div className="flex-1 px-6 py-6">
              <div className="space-y-4">
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-0">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                       <div className="mb-3">
                         <Button
                          type="button"
                          className={cn("h-12 w-12 bg-green-500 hover:bg-green-600 rounded-full transition-all duration-300", isListening && "scale-110 ring-4 ring-red-300 bg-red-500")}
                          onClick={startVoiceInput}
                          disabled={isLoading}
                        >
                          <Mic className="h-6 w-6 text-white" />
                        </Button>
                      </div>
                      <h3 className="font-semibold text-lg">Main aapki kaise madad kar sakta hoon?</h3>

                      <p className="text-muted-foreground text-sm">
                        Aapki shopping behtar banane ke liye main yahaan hoon!
                      </p>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
