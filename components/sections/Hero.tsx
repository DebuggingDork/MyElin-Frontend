"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { MediaImage } from "@/components/ui/MediaImage";
import { KenBurns } from "@/components/ui/ScrollEffects";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Container } from "@/components/ui/Container";
import { easeOut, photos } from "@/lib/media";

const signals = [
  { k: "Decide", v: "Commit under uncertainty" },
  { k: "Consequence", v: "A living world reacts" },
  { k: "Reflect", v: "Name the thinking pattern" },
  { k: "Transfer", v: "Judgment that travels" },
];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.15]);
  const photoOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.4]);
  const mx = useMotionValue(70);
  const my = useMotionValue(40);
  const glow = useMotionTemplate`radial-gradient(50% 45% at ${mx}% ${my}%, rgba(8,168,160,0.16), transparent 68%)`;

  return (
    <section
      ref={ref}
      id="home"
      className="relative min-h-[100svh] overflow-hidden scroll-mt-24 bg-bg pt-16"
      onMouseMove={(e) => {
        mx.set((e.clientX / window.innerWidth) * 100);
        my.set((e.clientY / window.innerHeight) * 100);
      }}
    >
      <motion.div style={{ opacity: photoOpacity }} className="absolute inset-0">
        <KenBurns className="h-full w-full">
          <MediaImage
            src={photos.heroCampus}
            alt="University campus at dawn"
            priority
            overlay="soft"
            className="absolute inset-0"
            sizes="100vw"
          />
        </KenBurns>
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/80 to-bg/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/40" />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{ background: glow }}
        aria-hidden
      />

      <Container className="relative z-10 flex min-h-[calc(100svh-4rem)] flex-col justify-center pb-16 pt-10">
        <motion.div style={{ y: titleY, opacity: titleOpacity }}>
          <SectionLabel>A new discipline of learning</SectionLabel>

          <h1 className="mt-6 text-[clamp(3.8rem,14vw,8.5rem)] font-semibold leading-[0.86] tracking-tight text-brand-ink">
            MYELIN
          </h1>

          <p className="mt-6 max-w-xl text-2xl font-medium tracking-tight text-brand-deep sm:text-[2.15rem]">
            Learn by Experiencing Decisions.
          </p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: easeOut }}
            className="mt-6 max-w-lg text-base leading-relaxed text-muted sm:text-lg"
          >
            Universities teach students what to think. We built an environment
            where they discover how professionals actually think — through
            judgment, consequence, and reflection.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8, ease: easeOut }}
            className="mt-10 flex flex-wrap gap-3"
          >
            <Link
              href="#request-access"
              className="rounded-full bg-brand-ink px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-brand-deep hover:shadow-lg"
            >
              Request access
            </Link>
            <Link
              href="#simulations"
              className="rounded-full border border-border bg-white/80 px-6 py-3 text-sm font-medium text-brand-deep backdrop-blur-sm transition-all duration-300 hover:border-brand/35"
            >
              Meet the traps
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: easeOut }}
          className="mt-14 grid gap-3 border-t border-border/80 pt-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {signals.map((s) => (
            <div key={s.k} className="rounded-2xl bg-white/75 px-4 py-4 backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-ink">
                {s.k}
              </p>
              <p className="mt-1.5 text-sm text-muted">{s.v}</p>
            </div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
