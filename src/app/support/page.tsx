
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HelpCircle, MessageSquare, Phone } from 'lucide-react';
import FaqPage from './faq/page';
import ChatPage from './chat/page';
import { AppShell } from '@/components/layout/AppShell';

function ContactInfo() {
    return (
        <Card className="glass-card mt-6">
            <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                    Reach out to us through phone or email for any support.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    <Phone className="h-6 w-6 text-primary" />
                    <div>
                        <h4 className="font-semibold">Customer Support</h4>
                        <a href="tel:+919097882555" className="text-primary hover:underline">+91 9097882555</a>
                    </div>
                </div>
                 <div className="flex items-center gap-4">
                    <MessageSquare className="h-6 w-6 text-primary" />
                    <div>
                        <h4 className="font-semibold">Email Us</h4>
                        <a href="mailto:support@freshoz.in" className="text-primary hover:underline">support@freshoz.in</a>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default function SupportHubPage() {
  return (
    <AppShell>
        <div className="container mx-auto py-8">
            <Card className="mb-8 border-0 bg-transparent shadow-none">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <HelpCircle className="h-12 w-12 text-primary" />
                        <div>
                            <CardTitle className="font-headline text-4xl font-bold text-primary">Help & Support</CardTitle>
                            <CardDescription>
                                We're here to help you with any questions or issues.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <Tabs defaultValue="faq" className="w-full">
                <TabsList className="sticky top-0 bg-background z-10 grid w-full grid-cols-3">
                    <TabsTrigger value="faq">FAQ</TabsTrigger>
                    <TabsTrigger value="chat">AI Chat Support</TabsTrigger>
                    <TabsTrigger value="contact">Contact Us</TabsTrigger>
                </TabsList>
                <TabsContent value="faq" className="mt-6">
                    <FaqPage />
                </TabsContent>
                <TabsContent value="chat" className="mt-6">
                   <div className="h-[calc(100vh-20rem)]">
                     <ChatPage />
                   </div>
                </TabsContent>
                <TabsContent value="contact" className="mt-6">
                    <ContactInfo />
                </TabsContent>
            </Tabs>
        </div>
    </AppShell>
  );
}
