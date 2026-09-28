import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qzunwwnjjihyuklmguaz.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/admin-:slug',
        destination: '/admin',
      },
      {
        source: '/admin-:slug/:path*',
        destination: '/admin/:path*',
      },
    ];
  },
};

export default nextConfig;
