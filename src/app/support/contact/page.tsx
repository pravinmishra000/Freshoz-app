"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Phone, MessageSquare } from "lucide-react"

// WhatsApp Icon as an inline SVG component
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M16.75,13.96C17,14.26 17.22,14.63 17.39,15.04C17.55,15.44 17.58,15.87 17.58,16.31C17.58,16.74 17.54,17.11 17.47,17.43C17.4,17.75 17.29,18.06 17.14,18.34C16.99,18.62 16.78,18.88 16.51,19.1C16.24,19.32 15.9,19.5 15.5,19.61C15.1,19.72 14.65,19.77 14.14,19.77C13.44,19.77 12.78,19.61 12.14,19.29C11.5,18.97 10.91,18.55 10.36,18.04L10.34,18.02C9.56,17.26 8.91,16.41 8.39,15.48C7.87,14.55 7.61,13.58 7.61,12.58C7.61,11.58 7.86,10.61 8.36,9.67C8.86,8.73 9.51,7.9 10.3,7.17L10.32,7.15C10.87,6.64 11.46,6.22 12.1,5.9C12.74,5.58 13.4,5.42 14.1,5.42H14.15C14.65,5.42 15.11,5.48 15.52,5.59C15.93,5.7 16.28,5.88 16.55,6.1C16.82,6.32 17.03,6.58 17.18,6.86C17.33,7.14 17.44,7.45 17.51,7.77C17.58,8.09 17.62,8.46 17.62,8.89C17.62,9.33 17.56,9.73 17.44,10.1C17.32,10.47 17.15,10.81 16.92,11.12C16.69,11.43 16.47,11.63 16.25,11.73C16.03,11.83 15.83,11.88 15.64,11.88C15.4,11.88 15.18,11.83 14.97,11.73C14.76,11.63 14.57,11.5 14.39,11.34C14.21,11.18 14.05,11.02 13.9,10.85C13.75,10.68 13.58,10.47 13.38,10.22C13.18,9.97 12.96,9.73 12.7,9.5C12.44,9.27 12.16,9.1 11.84,9C11.52,8.9 11.23,8.85 10.96,8.85C10.69,8.85 10.45,8.9 10.24,9C9.98,9.12 9.76,9.29 9.57,9.51C9.38,9.73 9.24,9.99 9.14,10.28C9.04,10.57 8.99,10.87 8.99,11.19C8.99,11.51 9.04,11.82 9.13,12.1C9.22,12.38 9.36,12.65 9.54,12.9C9.72,13.15 9.94,13.38 10.2,13.6C10.46,13.82 10.74,14 11.04,14.15C11.34,14.3 11.63,14.38 11.92,14.38C12.31,14.38 12.67,14.29 13,14.11C13.33,13.93 13.64,13.72 13.91,13.46C14.18,13.2 14.4,13 14.56,12.85C14.72,12.7 14.85,12.61 14.95,12.57C15.05,12.53 15.18,12.51 15.34,12.51C15.5,12.51 15.64,12.54 15.75,12.61C15.86,12.68 15.96,12.77 16.03,12.88C16.1,12.99 16.15,13.09 16.17,13.18C16.19,13.27 16.22,13.33 16.25,13.37C16.44,13.61 16.59,13.79 16.75,13.96Z"></path>
    </svg>
);


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
          <WhatsAppIcon className="h-6 w-6 text-green-600" />
          <div>
            <h4 className="font-semibold">WhatsApp</h4>
            <a href="https://wa.me/919097882555" target="_blank" className="text-primary hover:underline" rel="noopener noreferrer">Chat on WhatsApp</a>
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
