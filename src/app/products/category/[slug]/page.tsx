
import { CATEGORIES } from '@/lib/data';
import { CategoryPageContent } from './CategoryPageContent';

// This function tells Next.js which slugs to pre-render at build time.
export async function generateStaticParams() {
  return CATEGORIES.map((category) => ({
    slug: category.slug,
  }));
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  // Pass the slug and other necessary data to the client component.
  return <CategoryPageContent slug={slug} />;
}
