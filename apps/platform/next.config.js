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
        hostname: 'assets.nyuchi.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'aqjhuyqhgmmdutwzqvyv.supabase.co',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  // React Native Web configuration
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-native$': 'react-native-web',
      // Mock vector icons for web
      'react-native-vector-icons/MaterialCommunityIcons': 'react-native-vector-icons/dist/MaterialCommunityIcons',
      '@expo/vector-icons/MaterialCommunityIcons': 'react-native-vector-icons/dist/MaterialCommunityIcons',
      '@react-native-vector-icons/material-design-icons': 'react-native-vector-icons/dist/MaterialCommunityIcons',
    };
    config.resolve.extensions = [
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      ...config.resolve.extensions,
    ];
    return config;
  },
  transpilePackages: [
    'react-native',
    'react-native-web',
    'react-native-paper',
    'react-native-safe-area-context',
    'react-native-vector-icons',
    '@expo/vector-icons',
  ],
}

module.exports = nextConfig
