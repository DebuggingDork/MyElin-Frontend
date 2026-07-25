"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const memories = [
  "the decision that failed",
  "the opportunity you missed",
  "the strategy that unexpectedly worked",
  "the moment you realized what you should have done differently",
];

export function OurPhilosophy() {
  return (
    <section className="section-pad bg-bg" aria-labelledby="philosophy">
      <Container>
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand">
            Our philosophy
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2
            id="philosophy"
            className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl"
          >
            You don&apos;t remember the chapter you read.
          </h2>
        </Reveal>

        <ul className="mt-10 max-w-2xl space-y-3">
          {memories.map((m, i) => (
            <motion.li
              key={m}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: 0.08 + i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-start gap-4 text-lg text-muted"
            >
              <span className="mt-2.5 h-px w-6 shrink-0 bg-brand/60" />
              <span>
                You remember <span className="text-charcoal">{m}</span>.
              </span>
            </motion.li>
          ))}
        </ul>

        <Reveal delay={0.24} className="mt-14 max-w-2xl">
          <blockquote className="border-l border-brand/50 pl-6">
            <p className="text-2xl font-medium leading-snug tracking-tight text-charcoal sm:text-3xl">
              Some lessons are too important to be explained.
              <span className="mt-2 block text-brand">
                They have to be experienced.
              </span>
            </p>
          </blockquote>
        </Reveal>
      </Container>
    </section>
  );
}
