import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  turbopack: {},
  serverExternalPackages: ['pino-pretty', 'lokijs', 'encoding'],
};

export default nextConfig;
