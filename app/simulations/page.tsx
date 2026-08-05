import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { Simulations } from "@/components/pages/Simulations";

export const metadata: Metadata = {
  title: "Myelin — Simulations",
  description:
    "Scenarios published by Myelin Labs and partner institutions. New cases every month.",
};

export default function SimulationsPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Simulations />
      </main>
      <Footer />
    </>
  );
}
