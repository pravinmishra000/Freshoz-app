
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AppShell } from "@/components/layout/AppShell"
import Link from "next/link"
import { MessageSquare, HelpCircle, Search } from "lucide-react"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Freshoz - Frequently Asked Questions',
  description: 'Find quick answers about orders, returns, payments, and Freshoz services.',
}

const faqData = [
  {
    category: "Orders & Delivery",
    questions: [
      {
        question: "How can I track my order?",
        answer: "You can track your order in real-time by going to the 'My Orders' section in your account. Tap on the order you wish to track, and you will see a live map with the rider's location and estimated time of arrival.",
      },
      {
        question: "What if my order is late?",
        answer: "We strive to deliver every order within the promised 90-minute window. If your order is running late, you can contact our AI Support Chat for immediate assistance or call our customer service helpline.",
      },
      {
        question: "Can I change my delivery address after placing an order?",
        answer: "Once an order is placed, the delivery address cannot be changed from the app. Please contact our support team immediately, and we will do our best to assist you if the order has not yet been dispatched.",
      },
      {
        question: "What are your delivery hours?",
        answer: "Our delivery services are available from 7:00 AM to 10:00 PM, seven days a week.",
      },
    ],
  },
  {
    category: "Payments & Refunds",
    questions: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept Cash on Delivery (COD), UPI, Credit Cards, Debit Cards, and Net Banking. All online payments are processed through a secure payment gateway.",
      },
      {
        question: "How do I request a refund?",
        answer: "To request a refund for a delivered item, go to the order details page, tap on 'Request Return/Refund', select the reason, upload photo proof if required, and submit your request. Our team will review it within 24 hours.",
      },
      {
        question: "How long does it take to process a refund?",
        answer: "Once a refund is approved, the amount will be credited to your original payment method within 5-7 business days. For COD orders, the refund will be processed to your bank account or as store credit.",
      },
      {
        question: "What if my payment fails but money is deducted?",
        answer: "In such cases, the amount is usually refunded back to your account automatically by the bank within 5-7 working days. If you do not receive the refund, please contact our support with the transaction details.",
      },
    ],
  },
  {
    category: "Returns & Replacements",
    questions: [
      {
        question: "What is your return policy?",
        answer: "We have a 7-day return policy for most non-perishable items. Perishable items like vegetables, fruits, and dairy products must be reported within 24 hours of delivery. Please refer to our detailed 'Return Terms & Conditions' for more information.",
      },
      {
        question: "How do I upload images for a return request?",
        answer: "When you fill out the return request form, you will see an 'Upload Photos' button. Tap on it to select images from your gallery or take a new photo. Clear photos showing the issue help us process your request faster.",
      },
      {
        question: "What products are non-returnable?",
        answer: "Perishable goods (fruits, vegetables, dairy), opened hygiene items (like personal care products), and items marked as 'non-returnable' on the product page are not eligible for returns.",
      },
    ],
  },
  {
    category: "Account & App",
    questions: [
      {
        question: "What if my OTP or login fails?",
        answer: "If you're having trouble logging in with an OTP, please ensure your mobile number is correct and you have good network coverage. You can tap 'Resend OTP'. If the issue persists, use the 'Help' option on the login screen or contact our AI Support.",
      },
      {
        question: "How do I update my profile information?",
        answer: "You can update your name, email, and saved addresses by going to the 'Profile' section from the main menu.",
      },
      {
        question: "Is the Freshoz app available on both Android and iOS?",
        answer: "Yes, the Freshoz app is available for download on both the Google Play Store and the Apple App Store.",
      },
    ],
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqData.flatMap(category => 
    category.questions.map(q => ({
      "@type": "Question",
      "name": q.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": q.answer
      }
    }))
  )
};


export default function FAQPage() {
  return (
    <AppShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="container mx-auto max-w-4xl py-8">
        <Card className="mb-8 border-0 bg-transparent shadow-none">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 inline-block rounded-full bg-primary/10 p-4">
              <HelpCircle className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="font-headline text-4xl font-bold text-primary">
              Frequently Asked Questions
            </CardTitle>
            <CardDescription className="text-lg">
              Find quick answers to your questions about Freshoz.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Search Bar - Future Enhancement */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search FAQs (e.g., 'track order')"
            className="w-full rounded-full border-2 bg-background/80 py-3 pl-12 pr-4 text-base"
            disabled // Disabled for now
          />
        </div>

        <div className="space-y-6">
          {faqData.map((category) => (
            <Card key={category.category} className="glass-card">
              <CardHeader>
                <CardTitle className="text-xl text-primary">{category.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((item, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger className="text-left font-semibold hover:no-underline">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
                        <p>{item.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-12 glass-card bg-primary/10 text-center">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-primary">Still need help?</h3>
            <p className="mt-2 text-muted-foreground">
              Our AI assistant is available 24/7 to help you with your queries.
            </p>
            <Button asChild className="mt-6 text-lg neon-button">
              <Link href="/chat">
                <MessageSquare className="mr-2 h-5 w-5" />
                Chat with Freshoz AI Support
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
