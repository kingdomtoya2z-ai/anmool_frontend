/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Capacitor APK build (out/ -> android assets).
  // Revert to server build (remove output/images.unoptimized) for normal web deploy.
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ['res.cloudinary.com'],
    remotePatterns: [{ protocol: 'https', hostname: '**' }, { protocol: 'http', hostname: '**' }],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  },
};

module.exports = nextConfig;
