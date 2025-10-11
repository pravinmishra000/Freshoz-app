// src/components/chat/ChatWidget.tsx
'use client';

import { useState } from 'react';
import { ChatInterface } from './ChatInterface';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 h-96 sm:w-96 sm:h-[500px] bg-white rounded-lg shadow-2xl border overflow-hidden">
          <ChatInterface />
        </div>
      )}

      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-14 w-14 rounded-full shadow-2xl transition-all duration-300",
          isOpen 
            ? "bg-red-500 hover:bg-red-600 rotate-90" 
            : "bg-blue-600 hover:bg-blue-700"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}