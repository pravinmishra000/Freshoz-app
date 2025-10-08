
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AppShell } from '@/components/layout/AppShell';
import { promotions } from '@/lib/data';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Tag } from 'lucide-react';

export default function OffersPage() {
  return (
    <AppShell>
      <div className="container mx-auto max-w-5xl py-8">
        <Card className="mb-8 border-0 bg-transparent shadow-none">
          <CardHeader>
            <CardTitle className="font-headline text-4xl font-bold text-primary">Offers & Discounts</CardTitle>
            <CardDescription>
              Check out the latest deals and save on your favorite groceries.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <Card key={promo.id} className="glass-card overflow-hidden group">
              <div className="relative aspect-video w-full">
                <Image
                  src={promo.imageUrl}
                  alt={promo.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={promo.imageHint}
                />
                 <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Tag className="h-3 w-3"/>
                    <span>DEAL</span>
                 </div>
              </div>
              <CardContent className="p-4">
                <h3 className="text-lg font-bold text-primary">{promo.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">{promo.description}</p>
                <Button className="w-full neon-button">View Products</Button>
              </CardContent>
            </Card>
          ))}
            {/* Add a generic coupon card */}
            <Card className="glass-card overflow-hidden group border-dashed border-primary border-2">
               <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                <div className="bg-primary/10 rounded-full p-4 mb-4">
                    <Tag className="h-8 w-8 text-primary"/>
                </div>
                <h3 className="text-lg font-bold text-primary">Use Code: FRESH50</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">Get 50% off on your first order above ₹199.</p>
                <Button variant="outline" className="w-full">Copy Code</Button>
              </CardContent>
            </Card>
        </div>
      </div>
    </AppShell>
  );
}
