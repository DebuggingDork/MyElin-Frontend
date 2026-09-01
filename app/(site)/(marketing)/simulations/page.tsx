import type { Metadata } from "next";
import { Suspense } from "react";
import { Simulations } from "@/components/pages/Simulations";

export const metadata: Metadata = {
  title: "Myelin — Simulations",
  description:
    "Scenarios published by Myelin Labs and partner institutions. New cases every month.",
};

export default function SimulationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-void" />}>
      <Simulations />
    </Suspense>
  );
}
