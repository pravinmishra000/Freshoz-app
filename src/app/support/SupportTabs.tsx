"use client"

import { AppShell } from "@/components/layout/AppShell"

export function SupportTabs() {
  return (
    <div>
      {/* Your Tabs UI */}
    </div>
  )
}

export default function SupportHubPage() {
  return (
    <AppShell>
      <div className="container mx-auto py-8">
        <SupportTabs />
      </div>
    </AppShell>
  )
}
