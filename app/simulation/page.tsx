import type { Metadata } from "next";
import { SimulationExperience } from "@/components/simulation/SimulationExperience";

export const metadata: Metadata = {
  title: "Myelin — Simulation",
  description:
    "Run a company for four quarters. Commit budget, read hidden variables, and get scored on judgment — not recall.",
};

export default function SimulationPage() {
  return <SimulationExperience />;
}
