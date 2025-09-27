'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bot, Loader2, SendHorizonal, Sparkles, X, Phone, MessageSquare, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { getCheaperAlternatives } from '@/ai/flows/freshoz-buddy';
import { trackOrderStatus } from '@/ai/flows/freshoz-buddy';
import { checkProductAvailability } from '@/ai/flows/freshoz-buddy';
import { manageCart } from '@/ai/flows/freshoz-buddy';
import { useCart } from '@/lib/cart/cart-context';
import { cn } from '@/lib/utils';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: React.ReactNode;
};

type AIFlow = 'alternatives' | 'track' | 'availability' | 'cart';

interface FreshozBuddyProps {
  isDeliveryBannerVisible?: boolean;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  isButtonVisible?: boolean;
}

export default function FreshozBuddy({ 
  isDeliveryBannerVisible, 
  isOpen: controlledIsOpen, 
  onOpenChange: setControlledIsOpen,
  isButtonVisible = true
}: FreshozBuddyProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentFlow, setCurrentFlow] = useState<AIFlow | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showInitial, setShowInitial] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const { cartItems } = useCart();

  const isOpen = controlledIsOpen ?? internalIsOpen;
  const setIsOpen = setControlledIsOpen ?? setInternalIsOpen;

  const supportPhoneNumber = '9097882555';

  const flowConfig = {
    alternatives: {
      prompt: 'What product are you looking for cheaper alternatives for?',
      placeholder: 'e.g., "Aashirvaad Atta"',
      action: getCheaperAlternatives,
      inputKey: 'productName',
    },
    track: {
      prompt: 'Please enter your Order ID to track its status.',
      placeholder: 'e.g., "ORDER12345"',
      action: (input: any) => trackOrderStatus({ orderId: input.productName, userId: 'user123' }),
      inputKey: 'productName',
    },
    availability: {
      prompt: 'What product would you like to check the availability of?',
      placeholder: 'e.g., "Amul Gold Milk"',
      action: checkProductAvailability,
      inputKey: 'productName',
    },
    cart: {
      prompt: 'You can add, remove, or check items in your cart. For example: "Add 2kg tomatoes"',
      placeholder: 'e.g., "Add 2kg tomatoes"',
      action: (input: {query: string}) => manageCart({ query: input.query }),
      inputKey: 'query',
    },
  };

  // Proactive assistance based on cart contents
  useEffect(() => {
    if (isOpen && cartItems.length > 2 && messages.length === 0) {
      setMessages([{
        id: 'proactive',
        role: 'assistant', 
        content: "I see you have items in your cart! Need help with anything? I can help you manage cart, track orders, or find better deals!"
      }]);
    }
  }, [isOpen, cartItems.length, messages.length]);

  const startFlow = (flow: AIFlow) => {
    setCurrentFlow(flow);
    setMessages([{ id: 'start', role: 'assistant', content: flowConfig[flow].prompt }]);
    setShowInitial(false);
  };
  
  const handleReset = () => {
    setMessages([]);
    setCurrentFlow(null);
    setInputValue('');
    setIsLoading(false);
    setShowInitial(true);
  }

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      setMessages(prev => [...prev, {
        id: 'voice-error',
        role: 'assistant',
        content: "Voice input is not supported in your browser. Please type your message."
      }]);
      return;
    }

    setIsListening(true);
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    let userMessage: ChatMessage;
    let actionInput: any;

    if (currentFlow) {
        userMessage = { id: Date.now().toString(), role: 'user', content: inputValue };
        const inputKey = flowConfig[currentFlow].inputKey;
        actionInput = { [inputKey]: inputValue };
    } else {
        userMessage = { id: Date.now().toString(), role: 'user', content: inputValue };
        actionInput = { query: inputValue }; 
        setCurrentFlow('cart'); 
    }
    
    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Thinking...</span>
        </div>
      ),
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setIsLoading(true);
    setInputValue('');

    try {
      const flowDetails = flowConfig[currentFlow || 'cart'];
      const flowAction = flowDetails.action;
      
      const result = await flowAction(actionInput as any);
      
      let responseContent: React.ReactNode;

      if (typeof result === 'object' && result !== null) {
        if ('alternatives' in result) {
          responseContent = (
            <div className="space-y-2">
              <p>{result.reasoning}</p>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-semibold text-blue-800">Cheaper Alternatives:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {(result.alternatives as string[]).map((alt, i) => (
                    <li key={i} className="text-blue-700">{alt}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        } else if ('orderStatus' in result) {
          responseContent = (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="font-semibold text-green-800">Order Status:</p>
              <p className="text-green-700">{result.orderStatus}</p>
              {result.deliveryETA && (
                <p className="text-green-600 mt-1">Estimated Delivery: {result.deliveryETA}</p>
              )}
            </div>
          );
        } else if ('isAvailable' in result) {
          responseContent = (
            <div className={`p-3 rounded-lg ${result.isAvailable ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
              {result.availabilityMessage}
            </div>
          );
        } else if ('message' in result) {
          responseContent = result.message;
        } else {
          responseContent = "I've processed your request. How else can I help you?";
        }
      } else {
        responseContent = "Thank you! Your request has been processed.";
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: responseContent,
      };
      setMessages((prev) => [...prev.slice(0, -1), assistantMessage]);

    } catch (error) {
      console.error('AI Flow Error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: (
          <div className="text-red-600 bg-red-50 p-3 rounded-lg">
            <p className="font-semibold">Sorry, something went wrong</p>
            <p className="text-sm mt-1">Please try again or contact support directly</p>
          </div>
        ),
      };
      setMessages((prev) => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getBottomPosition = () => {
    const basePosition = cartItems.length > 0 ? 'bottom-28' : 'bottom-6';
    return isDeliveryBannerVisible ? `${basePosition} md:bottom-32` : basePosition;
  };

  const quickActions = [
    { label: "Manage Cart", flow: 'cart' as const, icon: Bot },
    { label: "Track Order", flow: 'track' as const, icon: Bot },
    { label: "Find Alternatives", flow: 'alternatives' as const, icon: Bot },
  ];

  return (
    <>
      {isButtonVisible && (
        <Button
          variant="outline"
          onClick={() => setIsOpen(true)}
          className={cn(
            "fixed right-4 z-50 h-14 w-14 rounded-full border-2 border-primary bg-primary/10 p-0 text-primary shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out hover:bg-primary/20 hover:scale-110 md:right-6",
            getBottomPosition()
          )}
          aria-label="Open AI Assistant"
        >
          <Sparkles className="h-7 w-7" />
        </Button>
      )}
      
      <Sheet open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setTimeout(handleReset, 300);
          }
      }}>
        <SheetContent className="flex w-full flex-col sm:max-w-md p-0">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-full">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Freshoz Buddy</h2>
                  <p className="text-sm text-muted-foreground">Your AI shopping assistant</p>
                </div>
              </div>
            </SheetTitle>
          </SheetHeader>
          
          {currentFlow || !showInitial ? (
            <>
              <ScrollArea className="flex-1 px-6 py-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                      {message.role === 'assistant' && (
                        <Avatar className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600">
                          <AvatarFallback className="bg-transparent">
                            <Bot size={16} className="text-white" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                        message.role === 'user' 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      )}>
                        {message.content}
                      </div>
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
                      placeholder={currentFlow ? flowConfig[currentFlow].placeholder : 'Type your message...'}
                      disabled={isLoading}
                      className="pr-12"
                      autoFocus
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-7 w-7"
                      onClick={startVoiceInput}
                      disabled={isLoading}
                    >
                      <Mic className={`h-4 w-4 ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
                    </Button>
                  </div>
                  <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
                    <SendHorizonal className="h-4 w-4" />
                  </Button>
                </form>
                
                {currentFlow && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="mt-3 w-full" 
                    onClick={handleReset}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Start Over
                  </Button>
                )}
              </SheetFooter>
            </>
          ) : (
            <div className="flex-1 px-6 py-6">
              <div className="space-y-4">
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <div className="bg-white p-3 rounded-full inline-block mb-3">
                        <Sparkles className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">How can I help you today?</h3>
                      <p className="text-muted-foreground text-sm">
                        I'm here to make your shopping experience better!
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      {quickActions.map((action) => (
                        <Button
                          key={action.label}
                          variant="outline"
                          className="w-full justify-start gap-3 bg-white hover:bg-gray-50 border-gray-200"
                          onClick={() => startFlow(action.flow)}
                        >
                          <action.icon className="h-5 w-5 text-blue-600" />
                          <span>{action.label}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-0">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-center mb-4">Need human help?</h4>
                    <div className="space-y-3">
                      <a href={`tel:${supportPhoneNumber}`} className="block w-full">
                        <Button variant="outline" className="w-full justify-start gap-3 bg-white border-green-200">
                          <Phone className="h-5 w-5 text-green-600" />
                          Call Support
                          <span className="ml-auto text-green-600">{supportPhoneNumber}</span>
                        </Button>
                      </a>
                      <a href={`https://wa.me/${supportPhoneNumber}`} target="_blank" rel="noopener noreferrer" className="block w-full">
                        <Button variant="outline" className="w-full justify-start gap-3 bg-white border-blue-200">
                          <MessageSquare className="h-5 w-5 text-blue-600" />
                          WhatsApp Chat
                          <span className="ml-auto text-blue-600">Instant help</span>
                        </Button>
                      </a>
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
