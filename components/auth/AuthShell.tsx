"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

/** The shared chrome behind every auth screen — aurora, grid, home logo, centred slot. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-void">
      <div className="aurora" />
      <div className="grid-lines absolute inset-0" />

      <div className="relative z-20 px-5 pt-7 sm:px-8">
        <Link href="/" aria-label="Myelin home" className="inline-flex">
          <Logo priority />
        </Link>
      </div>

      <div className="relative z-10 flex flex-1 items-center px-4 py-10 sm:px-8">
        {children}
      </div>
    </div>
  );
}
