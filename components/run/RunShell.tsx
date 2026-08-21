"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRun } from "@/components/run/RunProvider";
import { PageLoading } from "@/components/ui/Loading";

/**
 * Thin chrome for every run screen: just the auth/loading guard. The
 * simulation page (`SimulationApp`) owns all visible navigation and header
 * chrome now -- the old numbered run-hub nav has been retired.
 */
export function RunShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready } = useAuth();
  const { loading, error, companyId } = useRun();

  useEffect(() => {
    if (ready && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [ready, user, router, pathname]);

  /**
   * Every run screen opens at the top.
   *
   * `<main>` below is the scroll container, not the window, so the router's own scroll
   * restoration never reached it: moving on to the next department kept the scroll offset of
   * the one just finished. Keyed on `pathname` alone, so it only fires on an actual move
   * between screens and never while one is being filled in.
   */
  const mainRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  if (!ready || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-void text-ink">
        <PageLoading
          label={ready ? "Loading run state…" : "Checking your session…"}
          sub={ready ? "Resolving the run and its closed quarters." : undefined}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-void text-ink">
        <PageLoading label="Taking you to sign in…" sub="This run reopens straight after." />
      </div>
    );
  }

  /**
   * The run number in the URL is not one of this account's. Say so and stop -- rendering the
   * screens anyway would fire every request against a company that does not exist and bury the
   * real reason under a stack of 404s.
   */
  if (!companyId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-void px-6 text-center">
        <p className="text-[15px] text-ink">{error ?? "That run could not be found."}</p>
        <Link
          href="/runs"
          className="rounded-full border border-line px-4 py-2 text-[13px] text-dim transition-colors hover:border-line-2 hover:text-ink"
        >
          See your simulations
        </Link>
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
      <main ref={mainRef} className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
