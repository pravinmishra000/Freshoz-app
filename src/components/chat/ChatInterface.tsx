'use client';

import { useState, useRef, useEffect } from 'react';
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
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: '👋 **Namaste! Welcome to Freshoz Support**\n\nI\'m your AI assistant here to help you with:\n\n✨ **Order Tracking & Status**  \n🚚 **Delivery Updates**  \n🛒 **Product Information**  \n💰 **Pricing & Offers**  \n⏰ **Delivery Timing**\n\n*How may I assist you today?* 🌟',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
  }, []);

  const handleMicClick = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSend = async () => {
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
      const chatHistory = [...messages, userMessage];
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
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <Card className="flex h-full flex-col border-0 shadow-2xl overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30 backdrop-blur-sm">
      {/* Premium Chat Header */}
      <CardHeader className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white p-6 border-b-0 shadow-lg relative overflow-hidden">
        {/* Animated Background Elements */}
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

      {/* Messages Area with Glass Effect */}
      <CardContent className="flex-1 overflow-hidden p-0 bg-gradient-to-b from-slate-50/80 to-blue-50/50 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.05)_1px,transparent_0)] bg-[length:20px_20px] opacity-30"></div>
        
        <ScrollArea className="h-full p-6 relative z-10" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-4 group',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {/* AI Avatar with Glow */}
                {message.role === 'model' && (
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-30 animate-pulse"></div>
                      <Avatar className="h-12 w-12 border-2 border-white shadow-2xl relative">
                        <AvatarImage src="/logo-icon.svg" />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-400 text-white">
                          <Bot className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                )}

                {/* Message Bubble with 3D Effect */}
                <div
                  className={cn(
                    'max-w-md rounded-3xl px-6 py-4 text-sm shadow-2xl transition-all duration-300 transform hover:scale-[1.02]',
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-br-md shadow-blue-500/25' 
                      : 'bg-white/90 backdrop-blur-sm border border-white/20 rounded-bl-md shadow-xl'
                  )}
                >
                  <ReactMarkdown className="prose prose-sm max-w-none break-words leading-relaxed">
                    {message.content}
                  </ReactMarkdown>
                  
                  {/* Timestamp */}
                  {message.timestamp && (
                    <div className={cn(
                      "text-xs mt-3 font-medium flex items-center gap-1",
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    )}>
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        message.role === 'user' ? 'bg-blue-200' : 'bg-gray-400'
                      )}></div>
                      {formatTime(message.timestamp)}
                    </div>
                  )}
                </div>

                {/* User Avatar with Glow */}
                {message.role === 'user' && authUser && (
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                      <div className="absolute inset-0 bg-green-500 rounded-full blur-md opacity-30"></div>
                      <Avatar className="h-12 w-12 border-2 border-white shadow-2xl relative">
                        <AvatarImage
                          src={authUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.uid}&backgroundColor=65c9ff,b6e3f4,c0aede,d1d4f9,ffd5dc`}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-400 text-white">
                          <User className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator with Animation */}
            {isLoading && (
              <div className="flex items-start gap-4 justify-start animate-fade-in">
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-30 animate-pulse"></div>
                    <Avatar className="h-12 w-12 border-2 border-white shadow-2xl relative">
                      <AvatarImage src="/logo-icon.svg" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-400 text-white">
                        <Bot className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-3xl rounded-bl-md px-6 py-4 text-sm flex items-center gap-3 shadow-xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-gray-600 font-medium">Crafting your response...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Premium Input Area */}
      <div className="border-t border-white/20 bg-gradient-to-r from-white/90 to-blue-50/80 backdrop-blur-lg p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={
                authUser 
                  ? '💭 Ask about your orders, delivery, or products...' 
                  : '🔐 Sign in to start chatting with support'
              }
              className="h-14 rounded-2xl border-2 border-white/50 bg-white/80 backdrop-blur-sm pl-6 pr-32 text-lg shadow-lg focus:border-blue-400 focus:ring-4 focus:ring-blue-200 transition-all duration-300 placeholder:text-gray-500"
              disabled={isLoading || !authUser}
            />
            
            {/* Action Buttons */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {/* Voice Button */}
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={handleMicClick}
                className={cn(
                  'h-10 w-10 rounded-xl transition-all duration-300 shadow-lg border backdrop-blur-sm',
                  listening 
                    ? 'bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-red-500/25 animate-pulse border-red-400' 
                    : 'bg-white/80 border-white/60 hover:bg-white hover:shadow-xl text-gray-600'
                )}
                disabled={!authUser}
              >
                <Mic className="h-5 w-5" />
              </Button>

              {/* Send Button */}
              <Button
                type="submit"
                size="icon"
                onClick={handleSend}
                disabled={isLoading || !input.trim() || !authUser}
                className={cn(
                  "h-10 w-10 rounded-xl transition-all duration-300 shadow-lg border backdrop-blur-sm",
                  isLoading || !input.trim() || !authUser
                    ? "bg-gray-300 border-gray-200 text-gray-500"
                    : "bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-blue-500/25 hover:shadow-xl border-blue-400 hover:scale-105"
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {!authUser && (
          <p className="text-sm text-center text-gray-600 mt-4 px-2 bg-white/50 rounded-xl py-2 border border-white/30">
            🔒 <span className="font-semibold">Authentication Required</span> - Please login for personalized order support
          </p>
        )}

        {/* Quick Suggestions with Glass Effect */}
        {authUser && messages.length <= 2 && (
          <div className="flex flex-wrap gap-3 mt-4">
            {[
              "🚚 Where's my order?",
              "⏰ Delivery time?",
              "🛒 Product availability",
              "💰 Current offers"
            ].map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="rounded-2xl text-sm h-9 px-4 border-white/50 bg-white/60 backdrop-blur-sm hover:bg-white hover:shadow-lg hover:border-blue-300 transition-all duration-300 text-gray-700 hover:text-blue-600"
                onClick={() => setInput(suggestion.replace(/^[^\s]+\s/, ''))}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}