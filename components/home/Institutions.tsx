"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { duration, easeOut } from "@/lib/media";
import { cn } from "@/lib/utils";
import { Action, Container } from "@/components/ui/Kit";
import { LedgerHead } from "@/components/home/LedgerHead";

const roles = ["Student", "Faculty", "Recruiter"] as const;

const included = [
  { label: "Cohort dashboards", detail: "Every run in your cohort, ranked and filterable" },
  { label: "Skill gap reports", detail: "Which dimensions a class is weakest on, by term" },
  { label: "Proctored mode", detail: "Locked sessions with a verified identity per seat" },
];

export function Institutions() {
  const [role, setRole] = useState<(typeof roles)[number]>("Student");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <section id="institutions" className="relative border-b border-line">
      <Container wide className="ledger-section relative z-10">
        <LedgerHead
          title={
            <>
              Bring Myelin to <span className="text-teal">your campus.</span>
            </>
          }
          deck={
            <p>
              Universities, accelerators and employers use Myelin to assess
              judgment on evidence rather than on interview performance. Pilots
              start with a single cohort.
            </p>
          }
        />

        <div className="mt-16 grid gap-x-16 gap-y-12 lg:grid-cols-[1fr_1fr]">
          {/* What is included, as a ruled schedule with the detail spelled out. The old
              version was three pill chips carrying a two-word label each, which asked
              the reader to already know what "proctored mode" meant. */}
          <div>
            <p className="tick-label border-b border-line pb-3">Included</p>
            {included.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: duration.reveal,
                  delay: i * 0.07,
                  ease: easeOut,
                }}
                className="border-b border-line py-4"
              >
                <p className="text-[15.5px] text-ink">{item.label}</p>
                <p className="mt-1.5 text-[13.5px] text-dim">{item.detail}</p>
              </motion.div>
            ))}
          </div>

          <div className="slab p-7 sm:p-9">
            <p className="ledger-display text-[24px] text-ink">
              Request early access
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email.includes("@")) setSent(true);
              }}
              className="mt-8"
            >
              <fieldset>
                <legend className="tick-label">I am a</legend>
                <div className="mt-3 grid grid-cols-3 border border-line">
                  {roles.map((option, i) => {
                    const isActive = option === role;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setRole(option)}
                        aria-pressed={isActive}
                        className={cn(
                          "px-2 py-3 text-[13px] transition-colors duration-200 ease-out",
                          i > 0 && "border-l border-line",
                          isActive
                            ? "bg-teal text-void"
                            : "text-dim hover:bg-[var(--panel)] hover:text-ink",
                        )}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <label
                className="tick-label mt-7 block"
                htmlFor="early-access-email"
              >
                Email
              </label>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input
                  id="early-access-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  className="flex-1 border border-line bg-[var(--panel)] px-4 py-3.5 text-[14.5px] text-ink outline-none transition-colors placeholder:text-faint focus:border-teal"
                />
                {/* type="submit", not an onClick duplicating the handler: the click path
                    skipped the input's own required/type=email validation, so a blank
                    address still flipped the form into its "Received" state. */}
                <Action type="submit">
                  {sent ? (
                    <>
                      <Check className="h-4 w-4" />
                      Received
                    </>
                  ) : (
                    <>
                      Request access
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Action>
              </div>
              <p className="mt-5 border-t border-line pt-4 text-[13px] text-faint">
                {sent
                  ? `Thanks. We will reach out about ${role.toLowerCase()} access to the S-25 cohort.`
                  : "Pilots start with universities and accelerators. No card, no contract."}
              </p>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}
