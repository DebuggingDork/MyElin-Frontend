"use client";

import { useEffect } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

/**
 * Global error boundary for layout-level errors.
 * This is a fallback when even the root layout crashes.
 * Must define its own <html> and <body> tags.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error boundary caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            color: "#e2e8f0",
            fontFamily: "system-ui, -apple-system, sans-serif",
            padding: "1rem",
          }}
        >
          <div
            style={{
              maxWidth: "600px",
              textAlign: "center",
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid rgba(148, 163, 184, 0.1)",
              borderRadius: "1.5rem",
              padding: "3rem 2rem",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "5rem",
                height: "5rem",
                marginBottom: "2rem",
                borderRadius: "50%",
                border: "2px solid rgba(244, 63, 94, 0.3)",
                background: "rgba(244, 63, 94, 0.05)",
              }}
            >
              <AlertTriangle
                size={48}
                color="#f43f5e"
                style={{ strokeWidth: 1.5 }}
              />
            </div>

            <h1
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                marginBottom: "1rem",
                lineHeight: 1.2,
              }}
            >
              Critical Error
            </h1>

            <p
              style={{
                fontSize: "1rem",
                color: "#94a3b8",
                marginBottom: "1.5rem",
                lineHeight: 1.6,
              }}
            >
              Something went seriously wrong. This is rare and we&apos;ve been
              notified. Try refreshing the page or returning home.
            </p>

            {error.digest && (
              <div
                style={{
                  marginBottom: "2rem",
                  padding: "0.75rem 1rem",
                  background: "rgba(15, 23, 42, 0.4)",
                  border: "1px solid rgba(148, 163, 184, 0.1)",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  color: "#94a3b8",
                }}
              >
                Error ID: <code style={{ color: "#cbd5e1" }}>{error.digest}</code>
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={reset}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.875rem 1.5rem",
                  background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "9999px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <RefreshCw size={16} />
                Try again
              </button>

              <a
                href="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.875rem 1.5rem",
                  background: "rgba(15, 23, 42, 0.4)",
                  color: "#e2e8f0",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  borderRadius: "9999px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(20, 184, 166, 0.4)";
                  e.currentTarget.style.background = "rgba(15, 23, 42, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.2)";
                  e.currentTarget.style.background = "rgba(15, 23, 42, 0.4)";
                }}
              >
                <Home size={16} />
                Back to home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
