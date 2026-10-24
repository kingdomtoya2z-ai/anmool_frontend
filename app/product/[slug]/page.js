import ProductView from './ProductView';

// Render product pages dynamically on demand (avoids build-time failures
// if the backend is unreachable or slugs change between builds).
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Page() {
  return <ProductView />;
}
