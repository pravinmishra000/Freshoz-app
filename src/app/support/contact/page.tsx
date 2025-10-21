"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Phone, MessageSquare, Whatsapp } from "lucide-react"

export default function ContactPage() {
  return (
    <Card className="glass-card mt-6">
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
        <CardDescription>Reach out via phone, WhatsApp, or email.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Phone className="h-6 w-6 text-primary" />
          <div>
            <h4 className="font-semibold">Call Support</h4>
            <a href="tel:+919097882555" className="text-primary hover:underline">+91 9097882555</a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Whatsapp className="h-6 w-6 text-green-600" />
          <div>
            <h4 className="font-semibold">WhatsApp</h4>
            <a href="https://wa.me/919097882555" target="_blank" className="text-primary hover:underline">Chat on WhatsApp</a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <MessageSquare className="h-6 w-6 text-primary" />
          <div>
            <h4 className="font-semibold">Email</h4>
            <a href="mailto:support@freshoz.in" className="text-primary hover:underline">support@freshoz.in</a>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
