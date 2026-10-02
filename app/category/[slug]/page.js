import CategoryView from './CategoryView';

// Pre-render known categories at APK build time so category pages open
// instantly (incl. cold start). Unknown/new slugs still work via
// client-side navigation from inside the app.
export async function generateStaticParams() {
  try {
    const base =
      process.env.NEXT_PUBLIC_API_URL ||
      'https://anmoolbackend-production-4640.up.railway.app/api';
    const res = await fetch(`${base}/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? data : [];
    return list
      .filter((c) => c.slug)
      .map((c) => ({ slug: String(c.slug) }));
  } catch {
    return [];
  }
}

export default function Page() {
  return <CategoryView />;
}
