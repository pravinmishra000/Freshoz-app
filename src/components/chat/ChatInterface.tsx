'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';
import { supportChat } from '@/ai/flows/customer-support-chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';


type Message = {
  role: 'user' | 'model';
  content: string;
};

export function ChatInterface() {
  const { authUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim() || !authUser) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = [...messages, userMessage];
      const result = await supportChat({ userId: authUser.uid, history: chatHistory });
      const modelMessage: Message = { role: 'model', content: result.message };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'model',
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('div');
        if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }
  }, [messages]);


  return (
    <Card className="flex h-full flex-col glass-card">
        <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                {messages.map((message, index) => (
                    <div
                    key={index}
                    className={cn(
                        'flex items-start gap-3',
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                    >
                    {message.role === 'model' && (
                        <Avatar className="h-8 w-8 border-2 border-primary">
                            <AvatarImage src="/logo-icon.svg" data-ai-hint="logo icon" />
                            <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                    )}
                    <div
                        className={cn(
                        'max-w-xs rounded-lg px-4 py-2 text-sm md:max-w-md lg:max-w-lg',
                        message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                    >
                        <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
                            {message.content}
                        </ReactMarkdown>
                    </div>
                    {message.role === 'user' && authUser && (
                         <Avatar className="h-8 w-8">
                            <AvatarImage src={authUser.photoURL || `https://picsum.photos/seed/user-chat/40/40`} data-ai-hint="person face" />
                            <AvatarFallback>{authUser.email?.[0].toUpperCase() ?? 'U'}</AvatarFallback>
                        </Avatar>
                    )}
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex items-start gap-3 justify-start">
                         <Avatar className="h-8 w-8 border-2 border-primary">
                            <AvatarImage src="/logo-icon.svg" />
                            <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                        <div className="bg-muted rounded-lg px-4 py-2 text-sm flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                    </div>
                )}
                </div>
            </ScrollArea>
        </CardContent>
        <div className="border-t p-4">
            <div className="relative">
            <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                placeholder="Ask about your order..."
                className="pr-12"
                disabled={isLoading || !authUser}
            />
            <Button
                type="submit"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-10 neon-button"
                onClick={handleSend}
                disabled={isLoading || !input.trim() || !authUser}
            >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Send</span>
            </Button>
            </div>
             {!authUser && <p className="text-xs text-center text-muted-foreground mt-2">Please log in to chat with support.</p>}
        </div>
    </Card>
  );
}
