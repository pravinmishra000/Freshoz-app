
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bot, Loader2, SendHorizonal, Sparkles, X, Phone, MessageSquare, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { getCheaperAlternatives, trackOrderStatus, checkProductAvailability, manageCart } from '@/ai/flows/freshoz-buddy';
import { useCart } from '@/lib/cart/cart-context';
import { cn } from '@/lib/utils';
import type { CartItem } from '@/lib/types';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: React.ReactNode;
};

type AIFlow = 'alternatives' | 'track' | 'availability' | 'cart';

export default function FreshozBuddy() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentFlow, setCurrentFlow] = useState<AIFlow | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showInitial, setShowInitial] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const { cartItems, getCartItems } = useCart();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

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
      action: (input: {query: string, cartItems: CartItem[]}) => manageCart({ query: input.query, cartItems: input.cartItems }),
      inputKey: 'query',
    },
  };

  const speak = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    // Find an Indian voice
    const voices = window.speechSynthesis.getVoices();
    const indianVoice = voices.find(voice => voice.lang === 'en-IN' || voice.lang === 'hi-IN');
    if (indianVoice) {
      utterance.voice = indianVoice;
    }
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };
  
  useEffect(() => {
    // Pre-load voices
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.getVoices();
    }
  }, []);

  useEffect(() => {
    if (isOpen && cartItems.length > 2 && messages.length === 0) {
      const proactiveMessage = "I see you have items in your cart! Need help with anything? I can help you manage cart, track orders, or find better deals!";
      setMessages([{
        id: 'proactive',
        role: 'assistant', 
        content: proactiveMessage
      }]);
      speak(proactiveMessage);
    }
  }, [isOpen, cartItems.length, messages.length]);
  
  useEffect(() => {
    if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('div');
        if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }
  }, [messages]);

  const startFlow = (flow: AIFlow) => {
    setCurrentFlow(flow);
    const promptText = flowConfig[flow].prompt;
    setMessages([{ id: 'start', role: 'assistant', content: promptText }]);
    speak(promptText);
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
      const errorMsg = "Voice input is not supported in your browser. Please type your message.";
      setMessages(prev => [...prev, { id: 'voice-error', role: 'assistant', content: errorMsg }]);
      speak(errorMsg);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    setIsListening(true);
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'en-IN'; // Prioritize Indian English
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      // Automatically submit after voice input
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

  const handleSubmit = async (e?: React.FormEvent, voiceTranscript?: string) => {
    e?.preventDefault();
    const query = voiceTranscript || inputValue;
    if (!query.trim() || isLoading) return;

    let userMessage: ChatMessage;
    let actionInput: any;

    const currentCartItems = getCartItems();

    if (currentFlow) {
        userMessage = { id: Date.now().toString(), role: 'user', content: query };
        const inputKey = flowConfig[currentFlow].inputKey;
        actionInput = { [inputKey]: query, cartItems: currentCartItems };
    } else {
        userMessage = { id: Date.now().toString(), role: 'user', content: query };
        actionInput = { query: query, cartItems: currentCartItems }; 
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
      const flowAction = flowDetails.action as Function;
      
      const result = await flowAction(actionInput as any);
      
      let responseContent: React.ReactNode;
      let responseTextToSpeak: string;

      if (typeof result === 'object' && result !== null) {
        if ('alternatives' in result) {
          responseTextToSpeak = `${result.reasoning} Here are some cheaper alternatives: ${result.alternatives.join(', ')}.`;
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
           responseTextToSpeak = `${result.orderStatus}${result.deliveryETA ? ` Estimated Delivery is ${result.deliveryETA}.` : ''}`;
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
          responseTextToSpeak = result.availabilityMessage;
          responseContent = (
            <div className={`p-3 rounded-lg ${result.isAvailable ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
              {result.availabilityMessage}
            </div>
          );
        } else if ('message' in result) {
          responseTextToSpeak = result.message;
          responseContent = result.message;
        } else {
          responseTextToSpeak = "I've processed your request. How else can I help you?";
          responseContent = responseTextToSpeak;
        }
      } else {
        responseTextToSpeak = "Thank you! Your request has been processed.";
        responseContent = responseTextToSpeak;
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: responseContent,
      };
      setMessages((prev) => [...prev.slice(0, -1), assistantMessage]);
      speak(responseTextToSpeak);

    } catch (error) {
      console.error('AI Flow Error:', error);
      const errorText = "Sorry, something went wrong. Please try again or contact support directly";
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
      speak(errorText);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getBottomPosition = () => {
    if (cartItems.length > 0) {
        return "bottom-[8.5rem] md:bottom-24"
    }
    return "bottom-24 md:bottom-6";
  };
  

  const quickActions = [
    { label: "Manage Cart", flow: 'cart' as const, icon: Bot },
    { label: "Track Order", flow: 'track' as const, icon: Bot },
    { label: "Find Alternatives", flow: 'alternatives' as const, icon: Bot },
  ];

  return (
    <>
        <Button
          variant="outline"
          onClick={() => setIsOpen(true)}
          className={cn(
            "fixed right-4 z-40 h-14 w-14 rounded-full border-2 border-primary/20 bg-primary/10 p-0 text-positive shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out hover:bg-primary/20 hover:scale-110 md:right-6",
            getBottomPosition()
          )}
          aria-label="Open AI Assistant"
        >
          <Sparkles className="h-7 w-7 text-[#22c55e]" />
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
                  <h2 className="text-xl font-bold uppercase text-primary">Freshoz AI</h2>
                  <p className="text-sm text-muted-foreground">Your shopping assistant</p>
                </div>
              </div>
            </SheetTitle>
          </SheetHeader>
          
          {currentFlow || !showInitial ? (
            <>
              <ScrollArea className="flex-1 px-6 py-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
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
                  ))}
                </div>
              </ScrollArea>
              
              <SheetFooter className="px-6 py-4 border-t">
                <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={currentFlow ? flowConfig[currentFlow].placeholder : 'Type or talk...'}
                      disabled={isLoading}
                      className="pr-12"
                      autoFocus
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={startVoiceInput}
                      disabled={isLoading}
                    >
                      <Mic className={`h-5 w-5 ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-500'}`} />
                    </Button>
                  </div>
                  <Button type="submit" size="icon" className="bg-gradient-to-r from-green-500 to-emerald-600" disabled={isLoading || !inputValue.trim()}>
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
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-0">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <div className="bg-white p-3 rounded-full inline-block mb-3">
                        <Sparkles className="h-8 w-8 text-green-600" />
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
                          <action.icon className="h-5 w-5 text-green-600" />
                          <span>{action.label}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-0">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-center mb-4">Need human help?</h4>
                    <div className="space-y-3">
                      <a href={`tel:${supportPhoneNumber}`} className="block w-full">
                        <Button variant="outline" className="w-full justify-start gap-3 bg-white border-blue-200">
                          <Phone className="h-5 w-5 text-blue-600" />
                          Call Support
                          <span className="ml-auto text-blue-600">{supportPhoneNumber}</span>
                        </Button>
                      </a>
                      <a href={`https://wa.me/${supportPhoneNumber}`} target="_blank" rel="noopener noreferrer" className="block w-full">
                        <Button variant="outline" className="w-full justify-start gap-3 bg-white border-green-200">
                          <MessageSquare className="h-5 w-5 text-green-600" />
                          WhatsApp Chat
                          <span className="ml-auto text-green-600">Instant help</span>
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
