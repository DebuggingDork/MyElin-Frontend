import type { Metadata } from "next";
import { PricingComingSoon } from "@/components/pages/PricingComingSoon";

export const metadata: Metadata = {
  title: "Myelin — Pricing",
  description: "Plans for students, institutions, and employers are coming soon.",
};

export default function PricingPage() {
  return <PricingComingSoon />;
}
