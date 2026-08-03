/**
 * Host-agnostic client error reporting.
 * Logs to the console and forwards to an optional global hook so any host
 * (Vercel, self-hosted, or a preview environment) can pick errors up.
 */
declare global {
  interface Window {
    __reportRuntimeError?: (payload: {
      message: string;
      stack?: string;
      filename?: string;
      context?: Record<string, unknown>;
    }) => void;
  }
}

export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  // Loaders and server fns commonly throw a raw Response; String(it) is the
  // opaque "[object Response]", so pull out the status and URL instead.
  const message =
    error instanceof Response
      ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`
      : error instanceof Error
        ? error.message
        : String(error);

  console.error("[app error]", message, { route: window.location.pathname, ...context });

  window.__reportRuntimeError?.({
    message,
    stack: error instanceof Error ? error.stack : undefined,
    filename: window.location.pathname,
    context: { route: window.location.pathname, ...context },
  });
}
