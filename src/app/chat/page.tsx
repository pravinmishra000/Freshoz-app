
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AppShell } from '@/components/layout/AppShell';

export default function ChatPage() {
  return (
    <AppShell>
      <div className="flex h-[calc(100vh-10rem)] flex-col">
        <Card className="mb-4 border-0 bg-transparent shadow-none">
          <CardHeader>
              <div className="flex items-center gap-4 mb-2">
                  <div>
                    <CardTitle className="font-headline text-4xl font-bold text-primary">Support Chat</CardTitle>
                    <CardDescription>
                      Have a question or need help with an order? Our AI assistant is here for you.
                    </CardDescription>
                  </div>
              </div>
          </CardHeader>
        </Card>
        <div className="flex-1 rounded-2xl overflow-hidden">
          <ChatInterface />
        </div>
      </div>
    </AppShell>
  );
}
