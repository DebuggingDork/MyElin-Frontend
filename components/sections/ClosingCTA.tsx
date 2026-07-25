"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { MaskReveal } from "@/components/ui/ScrollEffects";
import { InkWash, SectionLabel } from "@/components/ui/SectionLabel";
import { WordReveal } from "@/components/ui/TextReveal";
import { WaitlistForm } from "@/components/ui/WaitlistForm";
import { easeOut } from "@/lib/media";

export function ClosingCTA() {
  return (
    <section
      id="request-access"
      className="relative overflow-hidden scroll-mt-24 bg-bg py-28 sm:py-36"
    >
      <InkWash />

      <Container className="relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <MaskReveal>
            <SectionLabel className="text-center">Partnerships</SectionLabel>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-brand-ink sm:text-5xl sm:leading-[1.1]">
              <WordReveal
                text="We don't teach students what to think."
                as="span"
                className="justify-center"
              />
              <span className="mt-2 block">
                <WordReveal
                  text="We teach them how professionals think."
                  as="span"
                  delay={0.4}
                  className="justify-center"
                />
              </span>
            </h2>
          </MaskReveal>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: easeOut }}
            className="mt-6 text-xl font-medium text-brand-deep"
          >
            Learn by Experiencing Decisions.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: easeOut }}
            className="mx-auto mt-10 max-w-md rounded-[1.75rem] bg-brand-ink p-6 text-left sm:p-8"
          >
            <p className="mb-3 text-center text-sm text-white/70">
              Bring Myelin to your faculty.
            </p>
            <WaitlistForm id="request-access-form" compact />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
