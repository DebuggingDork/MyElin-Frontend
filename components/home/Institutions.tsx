"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Check, ShieldCheck, Users } from "lucide-react";
import { easeOut } from "@/lib/media";
import { cn } from "@/lib/utils";
import { Action, Container, Panel, SectionHead } from "@/components/ui/Kit";

const roles = ["Student", "Faculty", "Recruiter"] as const;

const included = [
  { label: "Cohort dashboards", icon: BarChart3, accent: "violet" },
  { label: "Skill gap reports", icon: Users, accent: "cyan" },
  { label: "Proctored mode", icon: ShieldCheck, accent: "emerald" },
];

export function Institutions() {
  const [role, setRole] = useState<(typeof roles)[number]>("Student");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <section
      id="institutions"
      className="relative overflow-hidden border-b border-line bg-void"
    >
      <div className="aurora" />
      <Container wide className="relative z-10 section-pad">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <SectionHead
              index="004"
              kicker="For institutions"
              accent="emerald"
              title={
                <>
                  Bring Myelin to{" "}
                  <span className="text-grad">your campus.</span>
                </>
              }
              copy={
                <p>
                  Universities, accelerators, and employers use Myelin to assess
                  judgment objectively. Cohort dashboards, skill gap reports, and
                  proctored mode included.
                </p>
              }
            />

            <div className="mt-9 flex flex-wrap gap-2.5">
              {included.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.span
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: i * 0.08, ease: easeOut }}
                    className="inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px]"
                    style={{
                      borderColor: `color-mix(in srgb, var(--${item.accent}) 32%, transparent)`,
                      background: `color-mix(in srgb, var(--${item.accent}) 9%, transparent)`,
                      color: "var(--dim)",
                    }}
                  >
                    <Icon
                      className="h-3.5 w-3.5"
                      style={{ color: `var(--${item.accent})` }}
                    />
                    {item.label}
                  </motion.span>
                );
              })}
            </div>
          </div>

          <Panel gradientRing className="p-7 sm:p-9">
            <p className="display text-[21px] text-ink">Request Early Access</p>

            <div className="mt-6">
              <p className="eyebrow text-faint">I am a</p>
              <div className="mt-3 grid grid-cols-3 gap-1 rounded-full border border-line bg-white/[0.03] p-1">
                {roles.map((option) => {
                  const active = option === role;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setRole(option)}
                      className={cn(
                        "relative rounded-full py-2.5 text-[13px] transition-colors",
                        active ? "text-white" : "text-dim hover:text-ink",
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="role-pill"
                          className="absolute inset-0 rounded-full"
                          style={{ background: "var(--grad-primary)" }}
                          transition={{ duration: 0.32, ease: easeOut }}
                        />
                      )}
                      <span className="relative">{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email.includes("@")) setSent(true);
              }}
              className="mt-6"
            >
              <label className="eyebrow text-faint" htmlFor="early-access-email">
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
                  className="flex-1 rounded-full border border-line bg-white/[0.04] px-5 py-3.5 text-[14.5px] text-ink outline-none transition-colors placeholder:text-faint focus:border-violet/60"
                />
                <Action onClick={() => email.includes("@") && setSent(true)}>
                  {sent ? (
                    <>
                      <Check className="h-4 w-4" />
                      Received
                    </>
                  ) : (
                    <>
                      Request early access
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Action>
              </div>
              <p className="mt-4 text-[13px] text-faint">
                {sent
                  ? `Thanks — we will reach out about ${role.toLowerCase()} access to the S-25 cohort.`
                  : "Pilots start with universities and accelerators. No card, no contract."}
              </p>
            </form>
          </Panel>
        </div>
      </Container>
    </section>
  );
}
