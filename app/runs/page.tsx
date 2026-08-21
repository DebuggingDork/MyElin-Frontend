import { Suspense } from "react";
import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { MyRuns } from "@/components/pages/MyRuns";

export const metadata: Metadata = {
  title: "Myelin — My simulations",
  description: "Every simulation run you own, and where each one stands.",
};

export default function MyRunsPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        {/* `MyRuns` reads `?filter=` with `useSearchParams`, which needs a Suspense boundary. */}
        <Suspense fallback={<div className="px-6 pt-40 text-[14px] text-dim">Loading…</div>}>
          <MyRuns />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
