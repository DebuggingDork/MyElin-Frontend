"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { RevealCard } from "@/components/ui/DataViews";
import { MaskReveal } from "@/components/ui/ScrollEffects";
import { InkWash, SectionLabel } from "@/components/ui/SectionLabel";
import { WordReveal } from "@/components/ui/TextReveal";

const disciplines = [
  { label: "Business Analytics", detail: "Signals buried in noise. Base rates ignored. Spurious correlations." },
  { label: "Marketing", detail: "Campaigns that look causal. Attribution traps. Halo effects." },
  { label: "Finance", detail: "Anchoring on first prices. Loss aversion under volatility." },
  { label: "Operations", detail: "Bullwhip amplification. Local optima that break the system." },
  { label: "Strategy", detail: "Survivorship stories. Second-order effects nobody modelled." },
  { label: "Entrepreneurship", detail: "Narrative bias. Overconfidence dressed as vision." },
  { label: "Accounting", detail: "Measures that become targets. Goodhart pressure." },
  { label: "Supply Chain", detail: "Ripple delays. Hidden inventory psychology." },
  { label: "Leadership", detail: "First impressions. Authority bias. Silent dissent." },
  { label: "Human Resources", detail: "Confirmation in hiring. Halo in performance." },
  { label: "Taxation", detail: "Rule-following that misses system incentives." },
  { label: "Auditing", detail: "Evidence that confirms. Trails that mislead." },
];

export function Disciplines() {
  const [open, setOpen] = useState(4);

  return (
    <section className="relative overflow-hidden bg-bg-soft py-24 sm:py-32">
      <InkWash />
      <Container className="relative z-10">
        <MaskReveal>
          <SectionLabel>Domains</SectionLabel>
          <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-brand-ink sm:text-5xl">
            <WordReveal text="Built for business education." as="span" />
          </h2>
        </MaskReveal>
        <p className="mt-5 max-w-2xl text-lg text-muted">
          Each discipline is its own ecosystem of decisions, consequences, and
          habits of mind. Reveal a domain to see the traps it hides.
        </p>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {disciplines.map((d, i) => (
            <RevealCard
              key={d.label}
              eyebrow={`0${(i % 9) + 1}`.slice(-2)}
              title={d.label}
              body={d.detail}
              open={open === i}
              onToggle={() => setOpen(i)}
              className="min-h-[9.5rem]"
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
