"use client";

import { useRouter } from "next/navigation";
import { EntryGate } from "@/components/play/EntryGate";
import type { Scenario } from "@/lib/play/types";

/** Entry gate → quarter flow. The quarter routes own everything after. */
export function PlayExperience({ scenario }: { scenario: Scenario }) {
  const router = useRouter();
  return (
    <EntryGate
      scenario={scenario}
      onEnter={() => router.push("/quarter/1/briefing")}
    />
  );
}
