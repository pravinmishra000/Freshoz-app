"use client"

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HelpCircle, Search } from "lucide-react"
import { useState, useEffect } from "react"

export default function FaqPage() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(handler)
  }, [search])

  const faqData = [
    {
      category: "Orders & Delivery",
      questions: [
        { question: "How do I track my order?", answer: "Go to ‘My Orders’ → select your order → tap ‘Track’. Real-time updates shown." },
        { question: "Can I change delivery address?", answer: "Once order is placed, address can't be changed. Cancel & reorder within 2 mins." },
      ]
    },
    {
      category: "Returns & Refunds",
      questions: [
        { question: "How do I raise a return request?", answer: "Go to Order → ‘Return Item’. Upload image if required. Refund processed in 24–48 hrs." },
        { question: "Which items are returnable?", answer: "Non-perishable products returnable in 7 days. Perishables not returnable." },
      ]
    },
    {
      category: "Payments & Wallet",
      questions: [
        { question: "Payment failed but money deducted?", answer: "Amount usually auto-refunded within 3–5 days. Contact support if not received." },
      ]
    },
    {
      category: "Account & App",
      questions: [
        { question: "Login OTP not working?", answer: "Check network/SIM. Request ‘Resend OTP’ or contact support." },
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
            Help & Support Center
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
          placeholder="Search FAQs (refund, delivery, login...)"
          className="w-full rounded-full border-2 py-3 pl-12 pr-4 text-base bg-background/80"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredData.length === 0 ? (
        <p className="text-center text-muted-foreground">No results found.</p>
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
    </div>
  )
}
