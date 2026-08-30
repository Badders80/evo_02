import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/horses/:slug',
        destination: '/marketplace/:slug',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
