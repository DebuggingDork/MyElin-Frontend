import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { Pricing } from "@/components/pages/Pricing";

export const metadata: Metadata = {
  title: "Myelin — Pricing",
  description: "Pay for judgment. Not seat-time. Plans for students, faculty, and employers.",
};

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
