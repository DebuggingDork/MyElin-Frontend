"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { DataPanel } from "@/components/ui/DataPanel";
import { Reveal } from "@/components/ui/Reveal";

const lines = [
  {
    explain: "We could explain confirmation bias.",
    live: "Or we could let you hire the wrong person because you trusted your first impression.",
  },
  {
    explain: "We could lecture you about cash flow.",
    live: "Or we could let your company run out of money despite growing revenue.",
  },
  {
    explain: "We could teach you about leadership.",
    live: "Or we could let your team stop following you because of the decisions you made.",
  },
];

export function ContrastStanza() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((v) => (v + 1) % lines.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  const row = lines[index];

  return (
    <section className="section-pad bg-bg" aria-label="Why experience matters">
      <Container>
        <DataPanel className="mx-auto max-w-3xl overflow-hidden p-8 sm:p-12">
          <div className="mb-8 flex gap-2">
            {lines.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show contrast ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i === index ? "bg-brand" : "bg-border"
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={row.explain}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="min-h-[10rem] space-y-4"
            >
              <p className="text-lg text-muted sm:text-xl">{row.explain}</p>
              <p className="text-xl font-medium leading-snug text-charcoal sm:text-2xl">
                {row.live}
              </p>
            </motion.div>
          </AnimatePresence>

          <Reveal delay={0.15} className="mt-10 border-t border-border pt-8">
            <p className="text-xl leading-relaxed text-graphite sm:text-2xl">
              Some lessons are too important to be explained.
              <span className="mt-2 block font-semibold text-brand">
                They have to be experienced.
              </span>
            </p>
            <p className="mt-6 text-sm font-medium uppercase tracking-[0.18em] text-muted">
              That&apos;s Myelin.
            </p>
          </Reveal>
        </DataPanel>
      </Container>
    </section>
  );
}
