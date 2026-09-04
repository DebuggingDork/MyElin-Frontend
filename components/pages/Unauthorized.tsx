import Link from "next/link";
import { Shield, Home, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Action, Eyebrow } from "@/components/ui/Kit";

/**
 * Unauthorized access page - shown when a user tries to access a resource
 * they don't have permission for (e.g., instructor-only features).
 */
export function Unauthorized() {
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
          <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full border-2 border-amber/30 bg-amber/5">
            <Shield className="h-16 w-16 text-amber" strokeWidth={1.5} />
          </div>

          <Eyebrow accent="amber" className="justify-center">
            Access restricted
          </Eyebrow>

          <h1 className="display mt-5 text-[clamp(2rem,4vw,3rem)] leading-[1.05] text-ink">
            This area is{" "}
            <span className="text-grad-fire">off-limits.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-dim">
            You don&apos;t have permission to access this page. It might be
            reserved for instructors, admins, or require a different account level.
            If you think this is a mistake, contact your administrator.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Action href="/simulations" size="lg" className="w-full sm:w-auto">
              <Home className="h-4 w-4" />
              View simulations
            </Action>
            <button
              onClick={() => window.history.back()}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-line bg-void/40 px-6 py-3.5 text-[14px] font-medium text-ink transition-colors hover:border-teal/40 hover:bg-void/60 sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              Go back
            </button>
          </div>

          <div className="mt-12 rounded-2xl border border-line bg-void/40 p-6">
            <p className="text-[13px] font-medium text-ink">
              Need access to instructor features?
            </p>
            <p className="mt-2 text-[13px] text-dim">
              If you&apos;re an instructor and need elevated permissions, please
              contact your system administrator or support team to upgrade your
              account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
