
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProductList } from '@/components/admin/ProductList';

export default function AdminProductsPage() {
  return (
      <div className="space-y-6">
        <Card className="border-0 bg-transparent shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-headline text-4xl font-bold text-primary">Manage Products</CardTitle>
                <CardDescription>
                    Add, edit, or remove products from your inventory.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
        
        <ProductList />
      </div>
  );
}
