/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'export', // ✅ required for Capacitor
    images: { unoptimized: true }, // disable Next.js image optimization
    typescript: { ignoreBuildErrors: true },
    eslint: { ignoreDuringBuilds: true },
  };
  
  module.exports = nextConfig;
  