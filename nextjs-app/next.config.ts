import type { NextConfig } from "next";
import withBundleAnalyzer from '@next/bundle-analyzer';
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  // Fallback configurado para ir para /offline quando não tem rede e cache limpo
  fallbacks: {
    document: "/offline",
  },
  // Otimização para Supabase requests
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/aaywrrpxciqbogjgifzy\.supabase\.co/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'supabase-cache',
          expiration: { maxEntries: 50, maxAgeSeconds: 300 }
        }
      }
    ]
  }
});

const nextConfig: NextConfig = {
  /* config options here */
  // Configura o diretório raiz do Turbopack para evitar conflitos com lockfiles
  turbopack: {
    root: process.cwd(),
  },
  // Força o uso de localhost para evitar problemas de rede
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    optimizePackageImports: ['lucide-react', 'recharts', '@omni/ds'],
  },
  // Desabilitar cache em desenvolvimento para garantir atualizações
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Headers de segurança HTTP
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co",
              "media-src 'self' https://lottie.host",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// Encadeia os wrappers (Analyzer + PWA)
export default withAnalyzer(withPWA(nextConfig));
