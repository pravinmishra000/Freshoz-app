
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bot, Loader2, SendHorizonal, Sparkles, X, Phone, MessageSquare, Mic, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { getCheaperAlternatives, trackOrderStatus, checkProductAvailability, manageCart } from '@/ai/flows/freshoz-buddy';
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

type AIFlow = 'alternatives' | 'track' | 'availability' | 'cart';

export default function FreshozBuddy() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentFlow, setCurrentFlow] = useState<AIFlow | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showInitial, setShowInitial] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const { cartItems, getCartItems, addToCart } = useCart();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const supportPhoneNumber = '9097882555';

  const flowConfig = {
    alternatives: {
      prompt: 'आप किस उत्पाद के सस्ते विकल्प ढूंढ रहे हैं?',
      placeholder: 'e.g., "आशीर्वाद आटा"',
      action: getCheaperAlternatives,
      inputKey: 'productName',
    },
    track: {
      prompt: 'अपनी 주문 की स्थिति जानने के लिए कृपया अपना ऑर्डर आईडी दर्ज करें।',
      placeholder: 'e.g., "ORDER12345"',
      action: (input: any) => trackOrderStatus({ orderId: input.productName, userId: 'user123' }),
      inputKey: 'productName',
    },
    availability: {
      prompt: 'आप किस उत्पाद की उपलब्धता जांचना चाहेंगे?',
      placeholder: 'e.g., "अमूल गोल्ड दूध"',
      action: checkProductAvailability,
      inputKey: 'productName',
    },
    cart: {
      prompt: 'आप अपने कार्ट में आइटम जोड़, हटा या जांच सकते हैं। उदाहरण: "2 किलो टमाटर डालें"',
      placeholder: 'e.g., "2 किलो टमाटर डालें"',
      action: (input: {query: string, cartItems: CartItem[]}) => manageCart({ query: input.query, cartItems: input.cartItems }),
      inputKey: 'query',
    },
  };

  const speak = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    // Prioritize Hindi voice
    const indianVoice = voices.find(voice => voice.lang === 'hi-IN');
    if (indianVoice) {
      utterance.voice = indianVoice;
    } else {
        // Fallback to any available Indian English voice
        const fallbackVoice = voices.find(voice => voice.lang === 'en-IN');
        if(fallbackVoice) utterance.voice = fallbackVoice;
    }
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };
  
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.getVoices();
        };
    }
  }, []);

  useEffect(() => {
    if (isOpen && cartItems.length > 0 && messages.length === 0) {
      const proactiveMessage = "नमस्ते! मैंने देखा कि आपके कार्ट में कुछ सामान हैं। क्या मैं आपकी कोई मदद कर सकता हूँ?";
      setMessages([{
        id: 'proactive',
        role: 'assistant', 
        content: proactiveMessage
      }]);
       if (typeof proactiveMessage === 'string') speak(proactiveMessage);
    }
  }, [isOpen, cartItems, messages.length]);
  
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
    setCurrentFlow(null);
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
    if (!currentFlow) {
        setCurrentFlow('cart');
    }
    
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'hi-IN'; // Prioritize Hindi recognition
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;
  
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      // Immediately submit the recognized speech
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
          title: 'आइटम जोड़ा गया!',
          description: `${quantity} x ${product.name_en} आपके कार्ट में जोड़ दिया गया है।`,
      });
  }


  const handleSubmit = async (e?: React.FormEvent, voiceTranscript?: string) => {
    e?.preventDefault();
    const query = voiceTranscript || inputValue;
    if (!query.trim() || isLoading) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: query };
    const currentCartItems = getCartItems();
    let actionInput: any;

    if (!currentFlow) {
        setCurrentFlow('cart'); // Default to cart management
    }
    
    const flowToExecute = currentFlow || 'cart';
    const inputKey = flowConfig[flowToExecute].inputKey;
    actionInput = { [inputKey]: query, cartItems: currentCartItems };

    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>सोच रहा हूँ...</span>
        </div>
      ),
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setIsLoading(true);
    setInputValue('');

    try {
      const flowDetails = flowConfig[flowToExecute];
      const flowAction = flowDetails.action as Function;
      
      const result = await flowAction(actionInput as any);
      
      let responseContent: React.ReactNode;
      let responseTextToSpeak: string = "";
      let productSuggestion: Product | undefined;

      if (typeof result === 'object' && result !== null) {
        // Handle cart actions first
        if (result.actions && result.actions.length > 0) {
            const action = result.actions[0];
            if (action.action === 'add' && action.itemName) {
                productSuggestion = allProducts.find(p => p.name_en.toLowerCase() === action.itemName.toLowerCase());
            }
        }

        if (productSuggestion) {
            responseTextToSpeak = result.message || `मुझे ${productSuggestion.name_en} मिला। क्या मैं इसे आपके कार्ट में डाल दूँ?`;
            responseContent = (
                <div>
                    <p>{responseTextToSpeak}</p>
                </div>
            );
        } else if ('alternatives' in result) {
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
        productSuggestion: productSuggestion
      };

      setMessages((prev) => [...prev.slice(0, -1), assistantMessage]);
      if (responseTextToSpeak) speak(responseTextToSpeak);

    } catch (error) {
      console.error('AI Flow Error:', error);
      const errorText = "माफ़ कीजिए, कुछ गड़बड़ हो गई। कृपया फिर से प्रयास करें।";
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: (
          <div className="text-red-600 bg-red-50 p-3 rounded-lg">
            <p className="font-semibold">माफ़ कीजिए, कुछ गड़बड़ हो गई</p>
            <p className="text-sm mt-1">कृपया फिर से प्रयास करें।</p>
          </div>
        ),
      };
      setMessages((prev) => [...prev.slice(0, -1), errorMessage]);
      speak(errorText);
    } finally {
      setIsLoading(false);
    }
  };
  
  const startFlow = (flow: AIFlow) => {
    setCurrentFlow(flow);
    setShowInitial(false);
    const initialMessage = {
      id: 'initial',
      role: 'assistant' as const,
      content: flowConfig[flow].prompt
    };
    setMessages([initialMessage]);
    speak(flowConfig[flow].prompt);
  };
  
  const getBottomPosition = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) { // On mobile
        if (cartItems.length > 0) {
            return "bottom-28";
        }
        return "bottom-24"; 
    }
    return "bottom-6";
  };
  

  const quickActions = [
    { label: "कार्ट प्रबंधित करें", flow: 'cart' as const, icon: Bot },
    { label: "ऑर्डर ट्रैक करें", flow: 'track' as const, icon: Bot },
    { label: "विकल्प खोजें", flow: 'alternatives' as const, icon: Bot },
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
                  <h2 className="text-xl font-bold uppercase text-primary">FRESHOZ AI सहायक</h2>
                  <p className="text-sm text-muted-foreground">आपकी अपनी शॉपिंग trợ lý</p>
                </div>
              </div>
            </SheetTitle>
          </SheetHeader>
          
          {currentFlow || !showInitial ? (
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
                      placeholder={currentFlow ? flowConfig[currentFlow].placeholder : 'बोलें या टाइप करें...'}
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
                
                {currentFlow && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="mt-3 w-full" 
                    onClick={handleReset}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    फिर से शुरू करें
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
                      <div className="mb-3">
                         <Button
                          type="button"
                          size="icon"
                          className={cn("h-12 w-12 bg-green-500 hover:bg-green-600 rounded-full transition-all duration-300", isListening && "scale-110 ring-4 ring-red-300 bg-red-500")}
                          onClick={startVoiceInput}
                          disabled={isLoading}
                        >
                          <Mic className="h-6 w-6 text-white" />
                        </Button>
                      </div>
                      <h3 className="font-semibold text-lg">मैं आपकी कैसे मदद कर सकता हूँ?</h3>

                      <p className="text-muted-foreground text-sm">
                        आपकी खरीदारी को बेहतर बनाने के लिए मैं यहाँ हूँ!
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
                    <h4 className="font-semibold text-center mb-4">क्या आपको मानवीय सहायता चाहिए?</h4>
                    <div className="space-y-3">
                      <a href={`tel:${supportPhoneNumber}`} className="block w-full">
                        <Button variant="outline" className="w-full justify-start gap-3 bg-white border-blue-200">
                          <Phone className="h-5 w-5 text-blue-600" />
                          सहायता के लिए कॉल करें
                          <span className="ml-auto text-blue-600">{supportPhoneNumber}</span>
                        </Button>
                      </a>
                      <a href={`https://wa.me/${supportPhoneNumber}`} target="_blank" rel="noopener noreferrer" className="block w-full">
                        <Button variant="outline" className="w-full justify-start gap-3 bg-white border-green-200">
                          <MessageSquare className="h-5 w-5 text-green-600" />
                          WhatsApp पर चैट करें
                          <span className="ml-auto text-green-600">तुरंत मदद</span>
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
