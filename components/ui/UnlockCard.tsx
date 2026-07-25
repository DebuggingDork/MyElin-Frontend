"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Click / hover to unveil blurred data */
export function UnlockCard({
  label,
  children,
  className,
  dark = false,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  dark?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      onMouseEnter={() => setOpen(true)}
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl border text-left transition-all",
        dark
          ? "border-white/10 bg-charcoal text-white"
          : "border-border bg-white text-charcoal",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <span
          className={cn(
            "text-[10px] font-medium uppercase tracking-[0.16em]",
            dark ? "text-brand-bright" : "text-brand",
          )}
        >
          {label}
        </span>
        {open ? (
          <Eye className="h-3.5 w-3.5 text-brand" strokeWidth={1.5} />
        ) : (
          <EyeOff
            className={cn("h-3.5 w-3.5", dark ? "text-white/40" : "text-muted")}
            strokeWidth={1.5}
          />
        )}
      </div>
      <div className="relative px-4 pb-4">
        <motion.div
          animate={{
            filter: open ? "blur(0px)" : "blur(7px)",
            opacity: open ? 1 : 0.55,
          }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
        <AnimatePresence>
          {!open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-x-4 bottom-4 top-0 flex items-center justify-center"
            >
              <span
                className={cn(
                  "rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.14em]",
                  dark
                    ? "border-white/20 bg-black/40 text-white/80"
                    : "border-border bg-white/80 text-muted",
                )}
              >
                Hold / click to reveal
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </button>
  );
}
