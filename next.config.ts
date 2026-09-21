import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
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
