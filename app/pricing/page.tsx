import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { PricingComingSoon } from "@/components/pages/PricingComingSoon";

export const metadata: Metadata = {
  title: "Myelin — Pricing",
  description: "Plans for students, institutions, and employers are coming soon.",
};

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <PricingComingSoon />
      </main>
      <Footer />
    </>
  );
}
