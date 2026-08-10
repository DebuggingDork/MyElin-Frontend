"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { easeOut } from "@/lib/media";
import { useRun } from "@/components/run/RunProvider";

const STAGES = [
  "Running simulation engine…",
  "Applying cross-department effects…",
  "Calculating delayed effects…",
  "Updating company state…",
  "Aggregating decision evidence…",
  "Scoring cognitive traits…",
  "Generating your report…",
];

/** Screen 9 — calls POST …/lock while naming each pipeline stage. */
export function ProcessingScreen({ quarterId }: { quarterId: string }) {
  const router = useRouter();
  const { companyId, lockQuarter, can, report } = useRun();
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    // Already locked — skip straight to report.
    if (report && !can("lock_quarter")) {
      router.replace(`/run/${companyId}/quarter/${quarterId}/report`);
      return;
    }

    const timer = window.setInterval(() => {
      setStage((s) => (s + 1 < STAGES.length ? s + 1 : s));
    }, 480);

    void (async () => {
      try {
        await lockQuarter();
        window.clearInterval(timer);
        setStage(STAGES.length - 1);
        window.setTimeout(() => {
          router.replace(`/run/${companyId}/quarter/${quarterId}/report`);
        }, 500);
      } catch (err) {
        window.clearInterval(timer);
        setError(err instanceof Error ? err.message : "Lock failed");
      }
    })();

    return () => window.clearInterval(timer);
  }, [companyId, quarterId, lockQuarter, can, report, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-line bg-raise/60 p-7">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-teal-bright" />
          <p className="text-[15px] font-medium text-ink">
            Locking quarter…
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
                      >
                        <Check className="h-3.5 w-3.5 text-emerald" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="dot"
                        className="h-1.5 w-1.5 rounded-full"
                        animate={{
                          background: active
                            ? "var(--violet-2)"
                            : "var(--line-2)",
                        }}
                      />
                    )}
                  </AnimatePresence>
                </span>
                <span
                  className={`num text-[12.5px] ${
                    done ? "text-dim" : active ? "text-ink" : "text-faint"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-6 h-[4px] overflow-hidden rounded-full bg-[var(--panel-2)]">
          <motion.span
            className="block h-full rounded-full"
            style={{ background: "var(--grad-primary)" }}
            animate={{
              width: `${((stage + 1) / STAGES.length) * 100}%`,
            }}
            transition={{ duration: 0.4, ease: easeOut }}
          />
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-rose/30 bg-rose/[0.07] px-4 py-3 text-[13px] text-rose">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
