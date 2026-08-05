import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getScenario } from "@/lib/play/data";
import { PlayExperience } from "@/components/play/PlayExperience";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const scenario = getScenario(slug);
  return {
    title: scenario
      ? `Myelin — ${scenario.name}`
      : "Myelin — Simulation",
    description: scenario
      ? `Run ${scenario.name}: ${scenario.minutes} minutes of consequential decisions across ${scenario.departments.length} workspaces.`
      : "Run a Myelin simulation.",
  };
}

export default async function PlayPage({ params }: Props) {
  const { slug } = await params;
  const scenario = getScenario(slug);
  if (!scenario) notFound();
  return <PlayExperience scenario={scenario} />;
}
