/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone', // ✅ keeps server rendering & API routes active
    typescript: { ignoreBuildErrors: true },
    eslint: { ignoreDuringBuilds: true },
    images: {
      remotePatterns: [
        { protocol: 'https', hostname: '**' },
      ],
    },
  };
  
  module.exports = nextConfig;
  