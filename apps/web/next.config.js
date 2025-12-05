/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'community-assets.nyuchi.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.nyuchi.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'aqjhuyqhgmmdutwzqvyv.supabase.co',
        pathname: '/storage/**',
      },
    ],
  },
}

module.exports = nextConfig
