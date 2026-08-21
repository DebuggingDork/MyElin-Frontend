import type { Metadata } from "next";
import { Simulations } from "@/components/pages/Simulations";

export const metadata: Metadata = {
  title: "Myelin — Simulations",
  description:
    "Scenarios published by Myelin Labs and partner institutions. New cases every month.",
};

export default function SimulationsPage() {
  return <Simulations />;
}
