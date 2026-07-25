"use client";

import { Building2, Briefcase, GraduationCap, Users } from "lucide-react";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { RevealCard } from "@/components/ui/DataViews";
import { MaskReveal } from "@/components/ui/ScrollEffects";
import { InkWash, SectionLabel } from "@/components/ui/SectionLabel";
import { WordReveal } from "@/components/ui/TextReveal";

const items = [
  {
    icon: GraduationCap,
    title: "Students",
    eyebrow: "Learner",
    body: "They graduate having already rehearsed the decisions their careers will demand.",
  },
  {
    icon: Users,
    title: "Faculty",
    eyebrow: "Facilitator",
    body: "Classrooms shift from lecturing to facilitating genuine inquiry and debate.",
  },
  {
    icon: Building2,
    title: "University",
    eyebrow: "Institution",
    body: "Students return to a world that reacts — attention and retention rise.",
  },
  {
    icon: Briefcase,
    title: "Recruiters",
    eyebrow: "Employer",
    body: "A verifiable portfolio of how a candidate actually thinks under uncertainty.",
  },
];

export function Beneficiaries() {
  const [open, setOpen] = useState(0);

  return (
    <section className="relative overflow-hidden bg-bg py-24 sm:py-32">
      <InkWash />
      <Container className="relative z-10">
        <MaskReveal>
          <SectionLabel>Stakeholders</SectionLabel>
          <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-brand-ink sm:text-5xl">
            <WordReveal text="One environment. Four beneficiaries." as="span" />
          </h2>
        </MaskReveal>
        <p className="mt-5 max-w-2xl text-lg text-muted">
          Open a card to see who gains — every role shares the same decision
          environment.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <RevealCard
                key={item.title}
                eyebrow={item.eyebrow}
                title={item.title}
                body={item.body}
                open={open === i}
                onToggle={() => setOpen(i)}
                icon={<Icon className="h-5 w-5" strokeWidth={1.5} />}
              />
            );
          })}
        </div>
      </Container>
    </section>
  );
}
