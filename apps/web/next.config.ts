import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // Legacy path: marketplace is a landing-page section, not a route.
      // Kept non-permanent so a real /marketplace route can be added later.
      { source: '/marketplace', destination: '/#marketplace', permanent: false },
    ];
  },
};

export default nextConfig;
