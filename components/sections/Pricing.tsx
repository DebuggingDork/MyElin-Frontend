"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { MaskReveal } from "@/components/ui/ScrollEffects";
import {
  DarkStatement,
  InkWash,
  SectionLabel,
} from "@/components/ui/SectionLabel";
import { WordReveal } from "@/components/ui/TextReveal";
import { easeOut } from "@/lib/media";

const included = [
  "Living decision environments",
  "Cognitive-trap simulations",
  "Judgment portfolio for every learner",
  "Faculty facilitation mode",
  "Disciplinary ecosystems",
  "Partnership onboarding support",
];

export function Pricing() {
  return (
    <section
      id="pricing"
      className="relative scroll-mt-24 overflow-hidden bg-bg py-28 sm:py-36"
    >
      <InkWash />

      <Container className="relative z-10">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <MaskReveal>
              <SectionLabel>Pricing</SectionLabel>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-brand-deep sm:text-5xl">
                <WordReveal
                  text="Judgment shouldn't have a paywall."
                  as="span"
                />
              </h2>
            </MaskReveal>
            <p className="mt-5 max-w-md text-lg text-muted">
              Early partnerships are free. We build decision environments with
              you first — commercial pricing comes later.
            </p>
            <DarkStatement eyebrow="Philosophy" className="mt-8">
              The tuition of uncertainty is waived while we learn with early
              partners.
            </DarkStatement>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-12%" }}
            transition={{ duration: 0.8, ease: easeOut }}
            className="overflow-hidden rounded-[2rem] border border-brand/25 bg-white"
          >
            <div className="border-b border-border bg-brand-deep px-6 py-5 text-white sm:px-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-brand-bright/80">
                    Current access
                  </p>
                  <p className="mt-2 text-sm text-white/75">
                    Early partner program
                  </p>
                </div>
                <motion.p
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.6, ease: easeOut }}
                  className="text-5xl font-semibold tracking-tight text-white sm:text-6xl"
                >
                  $0
                </motion.p>
              </div>
              <div className="mt-5">
                <div className="mb-2 flex justify-between text-[11px] uppercase tracking-[0.14em] text-white/55">
                  <span>Tuition of uncertainty</span>
                  <span className="text-brand-bright">Waived</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/15">
                  <motion.div
                    className="h-full rounded-full bg-brand"
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.4, ease: easeOut, delay: 0.15 }}
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-7 sm:px-8 sm:py-9">
              <p className="text-sm font-medium text-brand-deep">
                Everything included while we learn with you
              </p>
              <ul className="mt-5 space-y-3">
                {included.map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: 0.05 * i,
                      duration: 0.45,
                      ease: easeOut,
                    }}
                    className="flex items-start gap-3 text-sm text-muted"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10">
                      <Check className="h-3 w-3 text-brand-deep" strokeWidth={2} />
                    </span>
                    {item}
                  </motion.li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="#request-access"
                  className="inline-flex flex-1 items-center justify-center rounded-full bg-brand-deep px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-charcoal"
                >
                  Claim free access
                </Link>
                <Link
                  href="#faq"
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-medium text-graphite transition-colors hover:border-brand/35"
                >
                  Read FAQ
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
