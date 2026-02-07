import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Força o uso de localhost para evitar problemas de rede
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
