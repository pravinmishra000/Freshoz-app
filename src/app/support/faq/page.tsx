"use client"

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HelpCircle, Search, MessageSquare, Phone } from "lucide-react"
import Link from 'next/link'
import { useState, useEffect } from "react"

export default function FaqPage() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);


  const faqData = [
    {
      category: "Orders & Delivery",
      questions: [
        { question: "How do I track my order?", answer: "Go to ‘My Orders’ → select your order → tap ‘Track’. Real-time updates shown." },
        { question: "Can I change delivery address?", answer: "Once order is placed, address can't be changed. Cancel & reorder within 2 mins." },
        { question: "How long does delivery take?", answer: "Most Freshoz orders arrive within 90 minutes of placing, depending on your location." },
      ]
    },
    {
      category: "Returns & Refunds",
      questions: [
        { question: "How do I raise a return request?", answer: "Go to the order details, tap “Request Return/Refund”, upload photo proof if needed, and submit." },
        { question: "Which items are not returnable?", answer: "Perishable products like milk, bread, fruits, and vegetables are generally not returnable unless they are damaged or spoiled upon arrival." },
      ]
    },
    {
      category: "Payments & Wallet",
      questions: [
        { question: "Payment failed but money deducted?", answer: "Amount usually auto-refunded by your bank within 3–5 business days. Contact support if not received." },
      ]
    },
    {
      category: "Account & App",
      questions: [
        { question: "What if my OTP or login fails?", answer: "Tap “Help” on the login screen to retry verification or contact AI Support." },
      ]
    },
  ]

  const filteredData = faqData
    .map(cat => ({
      ...cat,
      questions: cat.questions.filter(q =>
        q.question.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        q.answer.toLowerCase().includes(debouncedSearch.toLowerCase())
      ),
    }))
    .filter(c => c.questions.length > 0)

  return (
    <div>
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto mb-4 inline-block rounded-full bg-primary/10 p-4">
            <HelpCircle className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">
            Frequently Asked Questions
          </CardTitle>
          <p className="text-muted-foreground">
            Find answers to your questions or connect with support.
          </p>
        </CardHeader>
      </Card>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search FAQs (e.g., refund, delivery, login...)"
          className="w-full rounded-full border-2 py-3 pl-12 pr-4 text-base bg-background/80"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredData.length === 0 ? (
        <Card className="glass-card text-center py-10">
          <p className="text-muted-foreground">No results found for "{debouncedSearch}".</p>
        </Card>
      ) : filteredData.map((category, i) => (
        <Card key={i} className="mb-6 glass-card">
          <CardHeader>
            <CardTitle className="text-xl text-primary">{category.category}</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {category.questions.map((q, idx) => (
                <AccordionItem key={idx} value={`item-${i}-${idx}`}>
                  <AccordionTrigger className="text-left font-medium">{q.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{q.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      ))}

      <Card className="mt-8 glass-card">
        <CardHeader className="text-center">
            <CardTitle>Still need help?</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="w-full sm:w-auto" variant="outline">
                <Link href="/support/chat">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat with Support
                </Link>
            </Button>
            <Button asChild className="w-full sm:w-auto" variant="outline">
                <Link href="/support/contact">
                    <Phone className="mr-2 h-4 w-4" />
                    Call / Email
                </Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  )
}
