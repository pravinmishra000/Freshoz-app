
"use client"

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HelpCircle, Search, MessageSquare } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export default function FaqPage() {
  const [search, setSearch] = useState("")

  const faqData = [
    {
      category: "Orders & Delivery",
      questions: [
        {
          question: "How do I track my order?",
          answer: "Go to ‘My Orders’ → select your order → tap ‘Track’. You’ll see real-time location updates of your delivery partner."
        },
        {
          question: "What if my order is delayed?",
          answer: "We aim to deliver within 60–90 minutes. If delayed, you’ll get an automatic ₹ cashback or chat with our support via the Help Center."
        },
        {
          question: "Can I change delivery address after placing order?",
          answer: "No, the address can’t be changed once the order is placed. You can cancel within 2 minutes and reorder with the correct address."
        },
      ],
    },
    {
      category: "Returns & Refunds",
      questions: [
        {
          question: "What items are returnable?",
          answer: "Non-perishable products (like packaged foods, grocery items) can be returned within 7 days. Perishables like vegetables or dairy are not returnable."
        },
        {
          question: "How do I raise a return request?",
          answer: "Go to your Order → ‘Return Item’. Upload an image (if required) and submit. Refund is processed within 24–48 hours."
        },
        {
          question: "When will I get my refund?",
          answer: "Refunds for online payments are credited to your source account within 5–7 business days. COD refunds are given via UPI or wallet."
        },
      ],
    },
    {
      category: "Payments & Wallet",
      questions: [
        {
          question: "What payment modes do you support?",
          answer: "You can pay via UPI, COD, Credit/Debit Cards, and Net Banking. All transactions are secured by our payment partner."
        },
        {
          question: "Payment failed but money deducted?",
          answer: "In most cases, the amount auto-refunds within 3–5 days. If not, share your transaction ID in chat support."
        },
      ],
    },
    {
      category: "Account & App",
      questions: [
        {
          question: "Login OTP not working?",
          answer: "Please check network and SIM. You can request ‘Resend OTP’. Still facing issue? Contact our support through chat."
        },
        {
          question: "How do I delete my Freshoz account?",
          answer: "Go to Profile → Settings → Delete Account. Your data will be removed from our servers within 7 business days as per our privacy policy."
        },
      ],
    },
  ]

  const filteredData = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      q.question.toLowerCase().includes(search.toLowerCase()) ||
      q.answer.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(c => c.questions.length > 0)

  return (
    <div>
        <Card className="border-0 bg-transparent shadow-none">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto mb-4 inline-block rounded-full bg-primary/10 p-4">
              <HelpCircle className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-headline font-bold text-primary">
              Help & Support Center
            </CardTitle>
            <p className="text-muted-foreground">
              Get instant answers to common questions or connect with our support team.
            </p>
          </CardHeader>
        </Card>

        {/* 🔍 Search bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search ‘refund’, ‘delivery’, ‘login’..."
            className="w-full rounded-full border-2 py-3 pl-12 pr-4 text-base bg-background/80"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* 🧾 FAQ List */}
        {filteredData.length === 0 ? (
          <p className="text-center text-muted-foreground">No results found.</p>
        ) : (
          filteredData.map((category, i) => (
            <Card key={i} className="mb-6 glass-card">
              <CardHeader>
                <CardTitle className="text-xl text-primary">{category.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((q, idx) => (
                    <AccordionItem key={idx} value={`item-${i}-${idx}`}>
                      <AccordionTrigger className="text-left font-medium">
                        {q.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {q.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))
        )}

        {/* 🤖 Escalation Section */}
        <Card className="mt-12 glass-card bg-primary/10 text-center">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-primary">Still need help?</h3>
            <p className="mt-2 text-muted-foreground">
              Our support team is here 7 AM – 10 PM to assist you.
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <Button asChild className="neon-button">
                <Link href="/support/chat">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Chat with Support
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/support/contact">Call / Email</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
    </div>
  )
}
