"use client";

import { Compass, Scale, Shield } from "lucide-react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { type MouseEvent } from "react";
import { Container } from "@/components/ui/Container";
import { DataPanel } from "@/components/ui/DataPanel";
import { Reveal } from "@/components/ui/Reveal";

const items = [
  {
    icon: Scale,
    reject: "Not better memory.",
    build: "Better judgment.",
    signal: "Judgment index",
    value: "↑",
  },
  {
    icon: Compass,
    reject: "Not more information.",
    build: "Better decisions.",
    signal: "Decision quality",
    value: "↑",
  },
  {
    icon: Shield,
    reject: "Not higher scores.",
    build: "Greater confidence when there isn't a clear answer.",
    signal: "Ambiguity readiness",
    value: "↑",
  },
];

function GlowCard({
  item,
  index,
}: {
  item: (typeof items)[number];
  index: number;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const background = useMotionTemplate`radial-gradient(240px circle at ${x}px ${y}px, rgba(42,169,156,0.14), transparent 55%)`;

  function onMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  }

  return (
    <DataPanel delay={0.08 + index * 0.08} className="group relative h-full">
      <motion.div
        onMouseMove={onMove}
        className="relative h-full p-6 sm:p-7"
        style={{ background }}
      >
        <item.icon className="h-5 w-5 text-brand" strokeWidth={1.5} aria-hidden />
        <p className="mt-5 text-sm text-muted">{item.reject}</p>
        <p className="mt-2 text-lg font-medium leading-snug text-charcoal">
          {item.build}
        </p>
        <div className="mt-8 flex items-center justify-between border-t border-border/80 pt-4">
          <span className="text-[11px] uppercase tracking-[0.14em] text-muted">
            {item.signal}
          </span>
          <span className="text-lg font-semibold text-brand">{item.value}</span>
        </div>
      </motion.div>
    </DataPanel>
  );
}

export function WhatYoullBuild() {
  return (
    <section
      className="section-pad noise relative bg-bg-soft"
      aria-labelledby="build"
    >
      <Container className="relative z-10">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand">
            What you&apos;ll build
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2
            id="build"
            className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl"
          >
            Not more of the same.
          </h2>
        </Reveal>

        <ul className="mt-12 grid gap-5 sm:grid-cols-3">
          {items.map((item, i) => (
            <li key={item.build}>
              <GlowCard item={item} index={i} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
