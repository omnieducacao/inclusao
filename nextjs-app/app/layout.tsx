import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { WebVitalsReporter } from "@/components/WebVitalsReporter";

export const metadata: Metadata = {
  title: "Omnisfera — Inclusão Educacional",
  description: "Plataforma de inclusão educacional para escolas",
};

// Script to prevent flash of wrong theme on page load
const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('omnisfera-theme');
      if (!theme) {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', theme);
      var hc = localStorage.getItem('omnisfera-high-contrast');
      if (hc === 'true' || (!hc && window.matchMedia('(prefers-contrast: more)').matches)) {
        document.documentElement.classList.add('high-contrast');
      }
      var dys = localStorage.getItem('omnisfera-dyslexia');
      if (dys === 'true') {
        document.documentElement.classList.add('dyslexia-font');
      }
      var cb = localStorage.getItem('omnisfera-colorblind');
      if (cb === 'protanopia' || cb === 'deuteranopia' || cb === 'tritanopia') {
        document.documentElement.classList.add('cb-' + cb);
      }
    } catch(e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/omni_icone.png" />
        <link rel="apple-touch-icon" href="/omni_icone.png" />
        <link rel="manifest" href="/manifest.json" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Lexend:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <ToastProvider>
            {children}
            <Analytics />
            <SpeedInsights />
            <WebVitalsReporter />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

