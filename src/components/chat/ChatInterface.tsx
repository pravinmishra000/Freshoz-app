'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';
import { supportChat } from '@/ai/flows/customer-support-chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Mic, Bot, User, Sparkles, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type Message = {
  role: 'user' | 'model';
  content: string;
  timestamp?: Date;
};

export function ChatInterface() {
  const { authUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      setMessages([
        {
          role: 'model',
          content: '👋 **Namaste! Welcome to Freshoz Support**\n\nI\'m your AI assistant here to help you with:\n\n✨ **Order Tracking & Status**  \n🚚 **Delivery Updates**  \n🛒 **Product Information**  \n💰 **Pricing & Offers**  \n⏰ **Delivery Timing**\n\n*How may I assist you today?* 🌟',
          timestamp: new Date()
        }
      ]);
    }
  }, [isClient]);

  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) return;

      const recog = new SpeechRecognition();
      recog.lang = 'hi-IN';
      recog.continuous = false;
      recog.interimResults = false;

      recog.onstart = () => setListening(true);
      recog.onend = () => setListening(false);
      recog.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setInput(text);
      };

      recognitionRef.current = recog;
    }
  }, [isClient]);

  const handleMicClick = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSend = useCallback(async () => {
    if (!input.trim() || !authUser) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = messages.map(m => ({ role: m.role, content: m.content as string }));
      chatHistory.push({ role: userMessage.role, content: userMessage.content as string });

      const result = await supportChat({ userId: authUser.uid, history: chatHistory });
      
      const modelMessage: Message = { 
        role: 'model', 
        content: result.message,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'model',
        content: "❌ **We're experiencing technical difficulties**\n\nPlease try again in a moment or contact us directly at **📞 9097882555**",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, authUser, messages]);

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
            setTimeout(() => {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }, 100);
        }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (!isClient) {
    return (
      <Card className="flex h-full flex-col border-0 shadow-2xl overflow-hidden glass-card">
        <CardHeader className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white p-6 border-b-0 shadow-lg">
          <CardTitle className="flex items-center gap-4 text-white">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <MessageCircle className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold">Freshoz Assistant</div>
              <p className="text-white/80 text-sm">Loading...</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Initializing chat...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col border-0 shadow-2xl overflow-hidden glass-card bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <CardHeader className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white p-6 border-b-0 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_50%)]"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-300/20 rounded-full -translate-x-12 translate-y-12"></div>
        
        <CardTitle className="flex items-center gap-4 text-white relative z-10">
          <div className="relative">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/30">
              <MessageCircle className="h-7 w-7 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="h-3 w-3 text-white animate-pulse" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
                Freshoz Assistant
              </span>
              <div className="flex items-center gap-1 px-2 py-1 bg-green-400/20 rounded-full border border-green-400/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-200 text-xs font-medium">Online</span>
              </div>
            </div>
            <p className="text-white/80 text-sm font-normal mt-1">
              {authUser ? `Welcome back, ${authUser.displayName || 'Valued Customer'}! 👋` : 'Your AI Support Companion'}
            </p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
         <ScrollArea className="h-full p-4 md:p-6" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3 group',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'model' && (
                  <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                    <AvatarImage src="/logo-icon.svg" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-400 text-white">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-md transition-all duration-300',
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-br-lg' 
                      : 'bg-white/80 backdrop-blur-sm border border-white/30 rounded-bl-lg'
                  )}
                >
                  <ReactMarkdown className="prose prose-sm max-w-none break-words leading-relaxed text-sm">
                    {message.content as string}
                  </ReactMarkdown>
                  <div className={cn("text-xs mt-2 opacity-70", message.role === 'user' ? 'text-blue-100' : 'text-gray-500')}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>

                {message.role === 'user' && authUser && (
                  <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                    <AvatarImage
                      src={authUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.uid}&backgroundColor=65c9ff,b6e3f4,c0aede,d1d4f9,ffd5dc`}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-400 text-white">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-3 animate-fade-in">
                 <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                    <AvatarImage src="/logo-icon.svg" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-400 text-white">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                <div className="bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl rounded-bl-lg px-6 py-4 text-sm flex items-center gap-3 shadow-md">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <div className="border-t border-white/20 bg-gradient-to-r from-white/90 to-blue-50/80 backdrop-blur-lg p-4">
          {authUser && messages.length <= 2 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {[ "🚚 Where's my order?", "⏰ Delivery time?", "💰 Current offers" ].map((suggestion) => (
                <Button key={suggestion} variant="outline" size="sm" className="rounded-full h-8" onClick={() => setInput(suggestion.replace(/^[^\s]+\s/, ''))}>
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
          <div className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={ authUser ? 'Ask about your orders...' : 'Please log in to chat' }
              className="h-12 rounded-full border-2 border-gray-200 bg-white/80 pl-5 pr-24 text-base"
              disabled={isLoading || !authUser}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button type="button" size="icon" variant="ghost" onClick={handleMicClick} className={cn('rounded-full h-9 w-9', listening ? 'bg-red-100 text-red-600' : 'text-gray-500')} disabled={!authUser}>
                <Mic className="h-5 w-5" />
              </Button>
              <Button type="submit" size="icon" onClick={handleSend} disabled={isLoading || !input.trim() || !authUser} className="rounded-full h-9 w-9 bg-primary text-primary-foreground">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
    </Card>
  );
}
