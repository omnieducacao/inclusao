/**
 * Sentry configuration for the server-side
 * Captures errors in API routes and server components
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    
    // Capture 100% of errors in development, 10% in production
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    
    // Capture 100% of errors
    sampleRate: 1.0,
    
    // Debug mode in development
    debug: process.env.NODE_ENV === "development",
    
    // Filter out non-critical errors
    beforeSend(event) {
      // Ignore specific errors
      const errorMessage = event.exception?.values?.[0]?.value;
      if (errorMessage) {
        // Ignore network errors that are not our fault
        if (errorMessage.includes("ECONNRESET") ||
            errorMessage.includes("ETIMEDOUT") ||
            errorMessage.includes("ENOTFOUND")) {
          // Still log these but with lower priority
          event.level = "warning";
        }
      }
      return event;
    },
  });
}
