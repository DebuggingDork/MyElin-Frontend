"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { easeOut } from "@/lib/media";
import type { Quarter } from "@/lib/simulation/types";
import { TypedFeed, Typewriter } from "@/components/simulation/Typewriter";
import {
  SimButton,
  SimChip,
  SimEyebrow,
  SimPanel,
} from "@/components/simulation/SimChrome";

const toneIcon = { up: ArrowUpRight, down: ArrowDownRight, flat: Minus };
const toneClass = {
  up: "text-brand",
  down: "text-[var(--sim-risk)]",
  flat: "text-muted",
};

function severityTone(text: string) {
  if (text.startsWith("CRITICAL")) return "risk" as const;
  if (text.startsWith("WARNING") || text.startsWith("ALERT")) return "caution" as const;
  return "muted" as const;
}

export function QuarterBrief({
  quarter,
  onDone,
}: {
  quarter: Quarter;
  onDone: () => void;
}) {
  const [stage, setStage] = useState<"feed" | "situation" | "ready">("feed");

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-24 pt-12 sm:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <SimChip tone="caution">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--sim-caution)] sim-live" />
          Incoming brief
        </SimChip>
        <SimChip tone="muted">{quarter.label} · planning</SimChip>
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOut }}
        className="mt-6 max-w-3xl text-3xl font-semibold leading-[1.08] tracking-tight text-brand-ink sm:text-[2.75rem]"
      >
        {quarter.headline}
      </motion.h1>

      <SimPanel tone="soft" delay={0.1} className="mt-8 px-6 py-5">
        <TypedFeed
          lines={quarter.brief.map((text) => ({ text, tone: severityTone(text) }))}
          speed={9}
          gap={110}
          onDone={() => setStage("situation")}
        />
      </SimPanel>

      {stage !== "feed" && (
        <div className="mt-9 border-l-2 border-brand pl-6">
          <SimEyebrow>Situation</SimEyebrow>
          <p className="mt-3 text-xl leading-[1.65] text-brand-ink sm:text-[1.4rem]">
            <Typewriter
              text={quarter.situation}
              speed={10}
              caret
              onDone={() => setStage("ready")}
            />
          </p>
        </div>
      )}

      {stage === "ready" && (
        <>
          <div className="mt-12">
            <SimEyebrow>Context readings</SimEyebrow>
            <SimPanel delay={0.05} className="mt-4 divide-y divide-border sm:grid sm:grid-cols-2 sm:divide-y-0">
              {quarter.signals.map((signal, i) => {
                const Icon = toneIcon[signal.tone];
                return (
                  <motion.div
                    key={signal.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className={cn(
                      "flex items-center justify-between gap-4 px-6 py-5",
                      i % 2 === 0 && "sm:border-r sm:border-border",
                      i < quarter.signals.length - 2 && "sm:border-b sm:border-border",
                    )}
                  >
                    <span className="sim-eyebrow text-muted">{signal.label}</span>
                    <span
                      className={cn(
                        "sim-num flex items-center gap-2 text-[17px] font-semibold",
                        toneClass[signal.tone],
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {signal.value}
                    </span>
                  </motion.div>
                );
              })}
            </SimPanel>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <SimButton onClick={onDone}>
              Open the decision desk
              <ArrowRight className="h-3.5 w-3.5" />
            </SimButton>
            <p className="text-[13px] text-muted">
              {quarter.blocks.length} decisions this quarter · hidden variables stay
              sealed until resolution
            </p>
          </motion.div>
        </>
      )}
    </div>
  );
}
