"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ChatPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Firebase / Backend integration to save ticket
    console.log({ name, email, message })
    setSubmitted(true)
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Contact Support</CardTitle>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <p className="text-center text-green-600">Your request has been submitted. We'll get back to you soon!</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border p-2"
            />
            <input
              type="email"
              placeholder="Your Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border p-2"
            />
            <textarea
              placeholder="Your Message"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-md border p-2 h-32"
            />
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              Submit
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
