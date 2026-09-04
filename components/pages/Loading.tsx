import { Logo } from "@/components/brand/Logo";
import { Loader2 } from "lucide-react";

/**
 * Full-page loading state - shown during initial page loads,
 * authentication checks, or data fetching.
 */
export function Loading({ message }: { message?: string }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-void">
      <div className="aurora" />
      <div className="grid-lines absolute inset-0" />

      <div className="relative z-20 px-5 pt-7 sm:px-8">
        <div className="inline-flex">
          <Logo priority />
        </div>
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center">
            <Loader2
              className="h-12 w-12 animate-spin text-cyan"
              strokeWidth={2}
            />
          </div>
          {message && (
            <p className="text-[14px] text-dim">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Inline loading spinner for use within pages/components
 */
export function InlineLoading({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-cyan" strokeWidth={2} />
      {message && (
        <p className="mt-4 text-[13px] text-dim">{message}</p>
      )}
    </div>
  );
}
