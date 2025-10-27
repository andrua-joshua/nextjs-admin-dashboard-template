import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '192.168.1.5',
        port: '8087',
        pathname: '/data/**',
      },
      // Add other environments as needed
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8087',
        pathname: '/data/**',
      },
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;