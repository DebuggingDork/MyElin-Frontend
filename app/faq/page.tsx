import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { Faq } from "@/components/pages/Faq";

export const metadata: Metadata = {
  title: "Myelin — FAQ",
  description: "Questions you might have about Myelin, DI scoring, and plans.",
};

export default function FaqPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Faq />
      </main>
      <Footer />
    </>
  );
}
