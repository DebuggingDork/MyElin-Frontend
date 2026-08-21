import type { Metadata } from "next";
import { Faq } from "@/components/pages/Faq";

export const metadata: Metadata = {
  title: "Myelin — FAQ",
  description: "Questions you might have about Myelin, DI scoring, and plans.",
};

export default function FaqPage() {
  return <Faq />;
}
