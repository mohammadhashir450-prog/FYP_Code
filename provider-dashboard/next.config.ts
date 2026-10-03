import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    // car-showcase is built into public/showcase (see scripts/build-showcase.mjs)
    return [{ source: '/showcase', destination: '/showcase/index.html' }];
  },
};

export default nextConfig;
