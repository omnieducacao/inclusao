/"use server";

/**
 * Sentry utility functions for error tracking
 */

import * as Sentry from "@sentry/nextjs";

/**
 * Capture an error with additional context
 */
export function captureError(error: Error, context?: Record<string, unknown>): void {
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

/**
 * Capture a message (for important events that are not errors)
 */
export function captureMessage(message: string, level: "info" | "warning" | "error" = "info"): void {
  Sentry.captureMessage(message, level);
}

/**
 * Set user context for all subsequent events
 */
export function setUser(user: { id: string; email?: string; username?: string } | null): void {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Add breadcrumb for debugging flow
 */
export function addBreadcrumb(
  message: string,
  category?: string,
  level?: "debug" | "info" | "warning" | "error"
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
  });
}

/**
 * Wrap a function with error tracking
 */
export async function withErrorTracking<T>(
  fn: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof Error) {
      captureError(error, context);
    }
    throw error;
  }
}
