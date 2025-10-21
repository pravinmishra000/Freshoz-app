"use client"

import { AppShell } from "@/components/layout/AppShell"
import SupportTabs from "@/components/support/SupportTabs"

export default function SupportHubPage() {
  return (
    <AppShell>
      <div className="container mx-auto py-8">
        <SupportTabs />
      </div>
    </AppShell>
  )
}
