
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AppShell } from '@/components/layout/AppShell';

// This is a placeholder page for user management.

export default function AdminUsersPage() {
  return (
    <AppShell>
      <div className="container mx-auto py-8">
        <Card className="mb-8 border-0 bg-transparent shadow-none">
          <CardHeader>
            <CardTitle className="font-headline text-4xl font-bold text-primary">Manage Users</CardTitle>
            <CardDescription>
              View customer details and manage their status.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-10 text-center">
            <h3 className="text-lg font-semibold text-muted-foreground">Customer List</h3>
            <p className="text-sm text-muted-foreground">
              A list of all registered customers will appear here, with tools to view their order history and manage their accounts.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
