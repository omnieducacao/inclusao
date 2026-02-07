import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Força o uso de localhost para evitar problemas de rede
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Desabilitar cache em desenvolvimento para garantir atualizações
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
