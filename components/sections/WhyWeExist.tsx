"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const consume = ["Videos", "Podcasts", "Articles", "Instant answers"];

export function WhyWeExist() {
  return (
    <section className="section-pad bg-bg" aria-labelledby="why-exist">
      <Container>
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand">
            Why we exist
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2
            id="why-exist"
            className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl"
          >
            We&apos;ve become experts at consuming information.
          </h2>
        </Reveal>

        <div className="mt-10 flex flex-wrap gap-2.5">
          {consume.map((item, i) => (
            <motion.span
              key={item}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
              className="rounded-full border border-border bg-bg-soft px-4 py-2 text-sm text-muted"
            >
              {item}
            </motion.span>
          ))}
        </div>

        <div className="prose-wide mt-10 space-y-5 text-lg leading-relaxed text-muted">
          <Reveal as="p" delay={0.12}>
            Yet we struggle when there isn&apos;t an obvious answer.
          </Reveal>
          <Reveal as="p" delay={0.16}>
            Because knowing isn&apos;t the same as deciding.
          </Reveal>
          <Reveal as="p" delay={0.2}>
            Real learning begins when you&apos;re faced with uncertainty, limited
            information, and the responsibility to make a choice.
          </Reveal>
          <Reveal as="p" delay={0.28} className="font-medium text-graphite">
            That&apos;s where judgment is built.
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
