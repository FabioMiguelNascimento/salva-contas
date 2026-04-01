"use client";

import type { ApiClientError } from "@/lib/api-client";
import { useEffect } from "react";
import { toast } from "sonner";

function isExpectedNetworkError(value: unknown): value is ApiClientError {
  return (
    value instanceof Error &&
    "isExpectedNetworkError" in value &&
    Boolean((value as ApiClientError).isExpectedNetworkError)
  );
}

function extractExpectedNetworkError(args: unknown[]): ApiClientError | null {
  for (const arg of args) {
    if (isExpectedNetworkError(arg)) {
      return arg;
    }

    if (typeof arg === "object" && arg !== null) {
      for (const nested of Object.values(arg)) {
        if (isExpectedNetworkError(nested)) {
          return nested;
        }
      }
    }
  }

  return null;
}

export function GlobalClientErrorHandler() {
  useEffect(() => {
    const originalConsoleError = console.error;

    console.error = (...args: unknown[]) => {
      const expectedNetworkError = extractExpectedNetworkError(args);
      if (expectedNetworkError) {
        return;
      }

      originalConsoleError(...(args as Parameters<typeof console.error>));
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (!isExpectedNetworkError(event.reason)) {
        return;
      }

      event.preventDefault();
      toast.error(event.reason.message);
    };

    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      console.error = originalConsoleError;
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
