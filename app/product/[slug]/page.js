import ProductView from './ProductView';

// Pre-render known products at APK build time so product pages open
// instantly (incl. cold start). Unknown/new slugs still work via
// client-side navigation from inside the app.
export async function generateStaticParams() {
  try {
    const base =
      process.env.NEXT_PUBLIC_API_URL ||
      'https://anmoolbackend-production.up.railway.app/api';
    const res = await fetch(`${base}/products?limit=200`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    const list = data.products || data || [];
    return list
      .filter((p) => p.slug)
      .map((p) => ({ slug: String(p.slug) }))
      .slice(0, 200);
  } catch {
    return [];
  }
}

export default function Page() {
  return <ProductView />;
}
