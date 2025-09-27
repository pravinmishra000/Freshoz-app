
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { ProductCard } from '@/components/products/ProductCard';
import { SmartSearchBar } from '@/components/products/SmartSearchBar';
import { products, promotions } from '@/lib/data';

export default function ProductsPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-4 text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl">
          Freshness Delivered
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Your one-stop shop for the freshest groceries, delivered right to your doorstep.
        </p>
        <div className="mx-auto max-w-xl px-4">
          <SmartSearchBar />
        </div>
      </header>

      <section>
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {promotions.map((promo) => (
              <CarouselItem key={promo.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="glass-card overflow-hidden">
                    <CardContent className="relative flex aspect-video items-center justify-center p-0">
                      <Image
                        src={promo.imageUrl}
                        alt={promo.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint={promo.imageHint}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-0 w-full p-4 text-white">
                        <h3 className="font-headline text-2xl font-bold text-accent">{promo.title}</h3>
                        <p className="text-sm">{promo.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="ml-12 hidden sm:flex" />
          <CarouselNext className="mr-12 hidden sm:flex" />
        </Carousel>
      </section>

      <section>
        <h2 className="font-headline text-3xl font-semibold tracking-tight">Our Products</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
