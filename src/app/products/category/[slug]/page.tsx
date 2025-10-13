import { CategoryPageContent } from './CategoryPageContent';

export default function CategoryProductsPage({ params }: { params: { slug: string } }) {
  return <CategoryPageContent slug={params.slug} />;
}
