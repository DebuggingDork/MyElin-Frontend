"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { easeOut } from "@/lib/media";
import { useQuarter } from "@/components/quarter/QuarterProvider";

/* Screen 9 — quarter processing. Names each backend pipeline stage
   while run_quarter() executes; reinforces the mental model and
   covers real latency once the API is wired. */

const STAGES = [
  "Running simulation engine…",
  "Applying cross-department effects…",
  "Calculating delayed effects…",
  "Updating company state…",
  "Aggregating decision evidence…",
  "Scoring cognitive traits…",
  "Generating your report…",
];

const STAGE_MS = 620;

export default function ProcessingPage() {
  const router = useRouter();
  const { quarter, run } = useQuarter();
  const [stage, setStage] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    // Guard against strict-mode double-invoke and back-navigation:
    // run() itself is idempotent, so at worst we replay the animation.
    if (started.current) return;
    started.current = true;

    const timer = window.setInterval(() => {
      setStage((s) => {
        if (s + 1 < STAGES.length) return s + 1;
        window.clearInterval(timer);
        return s;
      });
    }, STAGE_MS);

    const finish = window.setTimeout(() => {
      run();
      router.replace(`/quarter/${quarter}/report`);
    }, STAGE_MS * STAGES.length + 500);

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(finish);
    };
  }, [quarter, run, router]);

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="rounded-2xl border border-line bg-raise/60 p-7"
        >
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-violet-2" />
            <p className="text-[15px] font-medium text-ink">
              Running Q{quarter}
            </p>
          </div>

          <div className="mt-6 space-y-2.5">
            {STAGES.map((label, i) => {
              const done = i < stage;
              const active = i === stage;
              return (
                <div key={label} className="flex items-center gap-3">
                  <span className="flex h-4 w-4 items-center justify-center">
                    <AnimatePresence mode="wait" initial={false}>
                      {done ? (
                        <motion.span
                          key="done"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Check className="h-3.5 w-3.5 text-emerald" />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="dot"
                          className="h-1.5 w-1.5 rounded-full"
                          animate={{
                            background: active ? "var(--violet-2)" : "rgba(255,255,255,0.15)",
                            scale: active ? [1, 1.5, 1] : 1,
                          }}
                          transition={
                            active
                              ? { repeat: Infinity, duration: 1 }
                              : { duration: 0.2 }
                          }
                        />
                      )}
                    </AnimatePresence>
                  </span>
                  <span
                    className={`num text-[12.5px] transition-colors duration-300 ${
                      done ? "text-dim" : active ? "text-ink" : "text-faint"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 h-[4px] overflow-hidden rounded-full bg-white/[0.06]">
            <motion.span
              className="block h-full rounded-full"
              style={{ background: "var(--grad-primary)" }}
              initial={{ width: "0%" }}
              animate={{ width: `${((stage + 1) / STAGES.length) * 100}%` }}
              transition={{ duration: 0.5, ease: easeOut }}
            />
          </div>
        </motion.div>

        <p className="mt-4 text-center text-[12px] text-faint">
          One deterministic pipeline — the same decisions always produce the
          same quarter.
        </p>
      </div>
    </div>
  );
}
