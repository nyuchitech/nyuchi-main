/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_PLATFORM_URL: process.env.NEXT_PUBLIC_PLATFORM_URL || 'https://platform.nyuchi.com',
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
    ],
  },
}

module.exports = nextConfig
