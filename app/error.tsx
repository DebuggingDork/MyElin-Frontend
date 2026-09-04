"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Action, Eyebrow } from "@/components/ui/Kit";

export default function Error({
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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-void">
      <div className="aurora" />
      <div className="grid-lines absolute inset-0" />

      <div className="relative z-20 px-5 pt-7 sm:px-8">
        <Link href="/" aria-label="Myelin home" className="inline-flex">
          <Logo priority />
        </Link>
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-2xl text-center">
          <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full border-2 border-rose/30 bg-rose/5">
            <AlertTriangle className="h-16 w-16 text-rose" strokeWidth={1.5} />
          </div>

          <Eyebrow accent="rose" className="justify-center">
            Something went wrong
          </Eyebrow>

          <h1 className="display mt-5 text-[clamp(2rem,4vw,3rem)] leading-[1.05] text-ink">
            We hit an unexpected{" "}
            <span className="text-grad-fire">roadblock.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-dim">
            Don&apos;t worry — this happens even to the best-run companies. Our team
            has been notified and we&apos;re working on it. In the meantime, try
            refreshing the page or heading back home.
          </p>

          {error.digest && (
            <div className="mx-auto mt-6 rounded-lg border border-line bg-void/40 px-4 py-3">
              <p className="text-[12px] text-faint">
                Error ID: <code className="text-dim">{error.digest}</code>
              </p>
            </div>
          )}

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Action onClick={reset} size="lg" className="w-full sm:w-auto">
              <RefreshCw className="h-4 w-4" />
              Try again
            </Action>
            <Link
              href="/"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-line bg-void/40 px-6 py-3.5 text-[14px] font-medium text-ink transition-colors hover:border-teal/40 hover:bg-void/60 sm:w-auto"
            >
              <Home className="h-4 w-4" />
              Back to home
            </Link>
          </div>

          <div className="mt-12 rounded-2xl border border-line bg-void/40 p-6">
            <p className="text-[13px] font-medium text-ink">
              Still having trouble?
            </p>
            <p className="mt-2 text-[13px] text-dim">
              If this error persists, try clearing your browser cache, or reach out
              to support with the error ID above. We&apos;re here to help get you
              back on track.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[13px]">
              <Link
                href="/simulations"
                className="text-dim underline decoration-line-2 underline-offset-4 transition-colors hover:text-ink hover:decoration-teal"
              >
                View simulations
              </Link>
              <span className="text-line">•</span>
              <Link
                href="/login"
                className="text-dim underline decoration-line-2 underline-offset-4 transition-colors hover:text-ink hover:decoration-teal"
              >
                Log in again
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
