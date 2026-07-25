"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { DataPanel } from "@/components/ui/DataPanel";
import { Reveal } from "@/components/ui/Reveal";

const beats = [
  "The first decision feels uncertain.",
  "The first strategy fails.",
  "The first mistake is frustrating.",
];

export function Growth() {
  return (
    <section
      className="section-pad noise relative bg-bg-soft"
      aria-labelledby="growth"
    >
      <Container className="relative z-10">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand">
            Growth isn&apos;t comfortable
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2
            id="growth"
            className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl"
          >
            Growth begins when assumptions break.
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {beats.map((beat, i) => (
            <DataPanel key={beat} delay={0.08 + i * 0.08} className="p-5">
              <motion.span
                className="text-[11px] font-medium tabular-nums text-brand"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                0{i + 1}
              </motion.span>
              <p className="mt-3 text-base leading-snug text-graphite">{beat}</p>
            </DataPanel>
          ))}
        </div>

        <div className="prose-wide mt-10 space-y-5 text-lg leading-relaxed text-muted">
          <Reveal as="p" delay={0.12} className="font-medium text-graphite">
            Good.
          </Reveal>
          <Reveal as="p" delay={0.16}>
            Growth doesn&apos;t begin when everything works. It begins when your
            assumptions are challenged. When you rethink. Adapt. Try again.
          </Reveal>
          <Reveal as="p" delay={0.2}>
            Because confidence isn&apos;t something you&apos;re given.
          </Reveal>
          <Reveal as="p" delay={0.24} className="font-medium text-charcoal">
            It&apos;s something you earn. One decision at a time.
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
