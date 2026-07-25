"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { MediaImage } from "@/components/ui/MediaImage";
import { Container } from "@/components/ui/Container";
import { KenBurns, MaskReveal, ParallaxX } from "@/components/ui/ScrollEffects";
import { InkWash, SectionLabel } from "@/components/ui/SectionLabel";
import { WordReveal } from "@/components/ui/TextReveal";
import { easeOut, photos } from "@/lib/media";

const know = ["Frameworks", "Theories", "Models", "Case summaries", "Formulas"];
const struggle = [
  "Decision Making",
  "Uncertainty",
  "Problem Framing",
  "Judgment",
  "Ambiguity",
  "Critical Thinking",
];

export function EducationGap() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], [24, -24]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-bg py-28 sm:py-36"
    >
      <InkWash />

      <Container className="relative z-10">
        <div className="grid items-end gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <MaskReveal>
              <SectionLabel>The quiet failure of modern education</SectionLabel>
              <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight text-brand-deep sm:text-5xl sm:leading-[1.08]">
                <WordReveal text="Education has changed." as="span" />
                <span className="mt-2 block text-muted">
                  <WordReveal text="Learning has not." as="span" delay={0.35} />
                </span>
              </h2>
            </MaskReveal>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Curricula reformed. Lectures digitised. Assessment gamified.
              Graduates still arrive fluent in theory — and unready for
              decisions without a rubric.
            </p>
          </div>

          <motion.div style={{ y: imgY }} className="relative">
            <KenBurns className="aspect-[4/5] rounded-[2rem]">
              <MediaImage
                src={photos.thoughtfulWoman}
                alt="Professional pausing before a difficult decision"
                className="absolute inset-0 rounded-[2rem]"
                overlay="teal"
                sizes="(max-width: 1024px) 100vw, 35vw"
              />
            </KenBurns>
          </motion.div>
        </div>

        <div className="mt-20 grid gap-6 lg:grid-cols-2">
          <ParallaxX from={16} to={-10}>
            <div className="rounded-[2rem] border border-border bg-white p-8 sm:p-10">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
                What graduates know
              </p>
              <ul className="mt-6 space-y-4">
                {know.map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.5, ease: easeOut }}
                    className="border-b border-border/70 pb-3 text-xl font-medium tracking-tight text-charcoal last:border-0"
                  >
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          </ParallaxX>

          <ParallaxX from={-10} to={14}>
            <div className="rounded-[2rem] bg-brand-deep p-8 sm:p-10">
              <p className="text-[11px] uppercase tracking-[0.2em] text-brand-bright">
                What they struggle with
              </p>
              <ul className="mt-6 space-y-3">
                {struggle.map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: 0.08 + i * 0.05,
                      duration: 0.5,
                      ease: easeOut,
                    }}
                    className="text-xl font-medium tracking-tight text-white"
                  >
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          </ParallaxX>
        </div>
      </Container>
    </section>
  );
}
