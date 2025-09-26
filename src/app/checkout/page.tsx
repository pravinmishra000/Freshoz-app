import { CheckoutFlow } from '@/components/checkout/CheckoutFlow';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/firebase/server';

export default async function CheckoutPage() {
  const user = await auth.currentUser;

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card className="mb-8 border-0 bg-transparent shadow-none">
        <CardHeader>
          <CardTitle className="font-headline text-4xl font-bold text-primary">Checkout</CardTitle>
          <CardDescription>
            Almost there! Please confirm your details to complete the order.
          </CardDescription>
        </CardHeader>
      </Card>
      <CheckoutFlow />
    </div>
  );
}
