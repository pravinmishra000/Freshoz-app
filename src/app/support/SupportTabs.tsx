"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import FaqPage from "./faq/page";
import ChatPage from "./chat/page";
import ContactPage from "./contact/page";

export default function SupportTabs() {
  return (
    <Tabs defaultValue="faq" className="w-full">
      <TabsList className="sticky top-16 bg-background z-10 grid w-full grid-cols-3">
        <TabsTrigger value="faq">FAQ</TabsTrigger>
        <TabsTrigger value="chat">AI Chat Support</TabsTrigger>
        <TabsTrigger value="contact">Contact Us</TabsTrigger>
      </TabsList>
      <TabsContent value="faq">
        <FaqPage />
      </TabsContent>
      <TabsContent value="chat">
        <ChatPage />
      </TabsContent>
      <TabsContent value="contact">
        <ContactPage />
      </TabsContent>
    </Tabs>
  )
}
