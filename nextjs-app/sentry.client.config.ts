/**
 * Sentry configuration for the client-side
 * Captures errors in the browser
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    
    // Capture 100% of errors in development, 10% in production
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    
    // Capture 100% of errors
    sampleRate: 1.0,
    
    // Replay sample rates
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Enable performance monitoring
    enableTracing: true,
    
    // Debug mode in development
    debug: process.env.NODE_ENV === "development",
    
    // Filter out non-critical errors
    beforeSend(event) {
      // Ignore specific non-critical errors
      const errorMessage = event.exception?.values?.[0]?.value;
      if (errorMessage) {
        // Ignore browser extension errors
        if (errorMessage.includes("chrome-extension") || 
            errorMessage.includes("moz-extension")) {
          return null;
        }
        // Ignore network errors that are not our fault
        if (errorMessage.includes("Failed to fetch") &&
            errorMessage.includes("NetworkError")) {
          return null;
        }
      }
      return event;
    },
  });
}
