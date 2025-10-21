
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import SupportTabs from './SupportTabs';

export const metadata = {
  title: "Help & Support | Freshoz",
  description: "Get answers to FAQs, chat with support, or contact Freshoz team."
};

export default function SupportHubPage() {
  return (
    <AppShell>
        <div className="container mx-auto py-8">
            <Card className="mb-8 border-0 bg-transparent shadow-none">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <HelpCircle className="h-12 w-12 text-primary" />
                        <div>
                            <CardTitle className="font-headline text-4xl font-bold text-primary">Help & Support</CardTitle>
                            <CardDescription>
                                We're here to help you with any questions or issues.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <SupportTabs />
        </div>
    </AppShell>
  );
}
