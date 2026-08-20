"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRun } from "@/components/run/RunProvider";

/**
 * Thin chrome for every run screen: just the auth/loading guard. The
 * simulation page (`SimulationApp`) owns all visible navigation and header
 * chrome now -- the old numbered run-hub nav has been retired.
 */
export function RunShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready } = useAuth();
  const { loading, error } = useRun();

  useEffect(() => {
    if (ready && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [ready, user, router, pathname]);

  if (!ready || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-void text-dim">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading run state…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-void text-dim">
        Redirecting to login…
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-void text-ink">
      {error && (
        <p className="shrink-0 border-b border-rose/30 bg-rose/[0.07] px-4 py-3 text-[13px] text-rose">
          {error}
        </p>
      )}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
