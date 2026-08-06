"use client";

import { useState } from "react";
import { EntryGate } from "@/components/play/EntryGate";
import { Dashboard } from "@/components/play/Dashboard";
import type { Scenario } from "@/lib/play/types";

export function PlayExperience({ scenario }: { scenario: Scenario }) {
  const [entered, setEntered] = useState(false);

  if (!entered) {
    return <EntryGate scenario={scenario} onEnter={() => setEntered(true)} />;
  }

  return <Dashboard scenario={scenario} />;
}
