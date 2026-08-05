"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { easeOut } from "@/lib/media";
import {
  Action,
  Container,
  Eyebrow,
  Panel,
  Pill,
  accentVar,
  type Accent,
} from "@/components/ui/Kit";

type Tier = {
  id: string;
  name: string;
  price: string;
  cadence?: string;
  tagline?: string;
  audience: string;
  features: string[];
  cta: string;
  href: string;
  accent: Accent;
  featured?: boolean;
};

const tiers: Tier[] = [
  {
    id: "practice",
    name: "PRACTICE",
    price: "$0",
    tagline: "Free forever",
    audience: "For curious students.",
    features: [
      "1 simulation/month",
      "Basic DI Report",
      "Public leaderboard",
      "Community access",
    ],
    cta: "Start free →",
    href: "/signup",
    accent: "cyan",
  },
  {
    id: "pro",
    name: "PRO",
    price: "$19",
    cadence: "/ month",
    audience: "For serious career builders.",
    features: [
      "Unlimited simulations",
      "Full DI Report + benchmarks",
      "Resume-ready certificate",
      "Private rooms",
      "Re-run with new variables",
    ],
    cta: "Start 14-day trial →",
    href: "/signup",
    accent: "violet",
    featured: true,
  },
  {
    id: "university",
    name: "UNIVERSITY",
    price: "$8",
    cadence: "/ seat / month",
    audience: "For deans and faculty.",
    features: [
      "Cohort analytics",
      "Skill gap reports",
      "Assignment mode",
      "Proctored exams",
      "LTI / Canvas / Moodle",
      "Custom scenarios",
    ],
    cta: "Request demo →",
    href: "/#institutions",
    accent: "emerald",
  },
  {
    id: "enterprise",
    name: "ENTERPRISE",
    price: "Custom",
    tagline: "Talk to us",
    audience: "For employers and accelerators.",
    features: [
      "Recruiter dashboard",
      "Candidate decision profiles",
      "Bring-your-own-scenario",
      "SSO + audit logs",
      "SLAs",
    ],
    cta: "Contact sales →",
    href: "/#institutions",
    accent: "amber",
  },
];

const compare = [
  { label: "Simulations / month", values: ["1", "Unlimited", "Unlimited", "Unlimited"] },
  { label: "DI Report depth", values: ["Basic", "Full + bench", "Full + cohort", "Full + ATS"] },
  { label: "Private rooms", values: ["—", "Yes", "Yes", "Yes"] },
  { label: "Custom scenarios", values: ["—", "—", "Yes", "Yes"] },
  { label: "SSO / audit", values: ["—", "—", "—", "Yes"] },
];

export function Pricing() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-void pb-14 pt-[68px]">
        <div className="aurora" />
        <div className="grid-lines absolute inset-0" />

        <Container wide className="relative z-10 pt-16 sm:pt-24">
          <Eyebrow accent="pink">MYELIN — PRICING</Eyebrow>
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easeOut }}
            className="display mt-7 max-w-3xl text-[clamp(2.5rem,6.4vw,4.6rem)] leading-[0.98] text-ink"
          >
            Pay for <span className="text-grad">judgment.</span>
            <br />
            <span className="text-dim">Not seat-time.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: easeOut }}
            className="mt-7 max-w-xl text-[17px] leading-[1.7] text-dim"
          >
            Every plan scores the same seven cognitive dimensions. You pay for
            depth of practice — not for watching videos.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18, ease: easeOut }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Pill accent="violet">
              <Sparkles className="h-3 w-3" />
              14-day Pro trial
            </Pill>
            <Pill accent="emerald">No card for Practice</Pill>
            <Pill accent="cyan">Cancel anytime</Pill>
          </motion.div>
        </Container>
      </section>

      <section className="relative overflow-hidden border-b border-line bg-base">
        <div className="dot-grid absolute inset-0" />
        <Container wide className="relative z-10 section-pad">
          <div className="grid gap-5 lg:grid-cols-4">
            {tiers.map((tier, i) => (
              <TierCard key={tier.id} tier={tier} delay={i * 0.07} />
            ))}
          </div>

          <Panel className="mt-12 overflow-hidden p-0">
            <div className="border-b border-line px-6 py-5 sm:px-8">
              <Eyebrow accent="indigo">Compare at a glance</Eyebrow>
              <p className="display mt-3 text-[22px] text-ink">
                What changes across tiers
              </p>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[720px]">
                <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr] gap-0 border-b border-line bg-white/[0.03] px-6 py-4 sm:px-8">
                  <span className="eyebrow text-faint">Capability</span>
                  {tiers.map((t) => (
                    <span
                      key={t.id}
                      className="eyebrow text-center"
                      style={{ color: accentVar[t.accent] }}
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
                {compare.map((row, i) => (
                  <motion.div
                    key={row.label}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05, ease: easeOut }}
                    className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr] gap-0 border-b border-line px-6 py-4 last:border-b-0 sm:px-8"
                  >
                    <span className="text-[14px] text-dim">{row.label}</span>
                    {row.values.map((v, vi) => (
                      <span
                        key={`${row.label}-${vi}`}
                        className="num text-center text-[13.5px]"
                        style={{
                          color:
                            v === "—"
                              ? "var(--faint)"
                              : accentVar[tiers[vi].accent],
                        }}
                      >
                        {v}
                      </span>
                    ))}
                  </motion.div>
                ))}
              </div>
            </div>
          </Panel>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-void">
        <div className="aurora opacity-60" />
        <Container wide className="relative z-10 section-pad">
          <Panel gradientRing glow accent="emerald" className="overflow-hidden p-0">
            <div
              className="flex flex-col items-start justify-between gap-8 p-8 sm:p-11 lg:flex-row lg:items-center"
              style={{
                background:
                  "linear-gradient(120deg, rgba(52,211,153,0.14), rgba(124,92,255,0.1))",
              }}
            >
              <div>
                <Eyebrow accent="emerald">Campus & cohorts</Eyebrow>
                <p className="display mt-5 max-w-xl text-[clamp(1.5rem,2.8vw,2.2rem)] leading-[1.1] text-ink">
                  Need seats for a class of 40?{" "}
                  <span className="text-grad">We&apos;ll set it up.</span>
                </p>
                <p className="mt-4 max-w-lg text-[15px] leading-[1.7] text-dim">
                  University and Enterprise plans include onboarding, LTI hooks,
                  and a dedicated success contact.
                </p>
              </div>
              <Action href="/#institutions" size="lg">
                Request a demo
                <ArrowRight className="h-4 w-4" />
              </Action>
            </div>
          </Panel>
        </Container>
      </section>
    </>
  );
}

function TierCard({ tier, delay }: { tier: Tier; delay: number }) {
  const color = accentVar[tier.accent];

  return (
    <Panel
      accent={tier.accent}
      glow={tier.featured}
      gradientRing={tier.featured}
      delay={delay}
      className={`hover-lift relative flex flex-col p-0 ${
        tier.featured ? "lg:-translate-y-2" : ""
      }`}
    >
      {tier.featured && (
        <div className="absolute inset-x-0 top-0 flex justify-center">
          <span className="-mt-3">
            <Pill accent={tier.accent} solid>
              Most popular
            </Pill>
          </span>
        </div>
      )}

      <div
        className="border-b border-line px-6 pb-6 pt-8"
        style={{
          background: `linear-gradient(165deg, color-mix(in srgb, ${color} 14%, transparent), transparent 70%)`,
        }}
      >
        <p className="eyebrow" style={{ color }}>
          {tier.name}
        </p>
        <div className="mt-5 flex items-baseline gap-1.5">
          <span className="display text-[40px] leading-none text-ink">
            {tier.price}
          </span>
          {tier.cadence && (
            <span className="text-[13px] text-faint">{tier.cadence}</span>
          )}
        </div>
        {tier.tagline && (
          <p className="mt-3 text-[13.5px] text-dim">{tier.tagline}</p>
        )}
        <p
          className={`text-[14.5px] font-medium text-ink ${
            tier.tagline ? "mt-1" : "mt-3"
          }`}
        >
          {tier.audience}
        </p>
      </div>

      <ul className="flex flex-1 flex-col gap-3.5 px-6 py-6">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <span
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
              style={{
                background: `color-mix(in srgb, ${color} 16%, transparent)`,
              }}
            >
              <Check className="h-3 w-3" style={{ color }} strokeWidth={3} />
            </span>
            <span className="text-[14px] leading-snug text-dim">{f}</span>
          </li>
        ))}
      </ul>

      <div className="px-6 pb-6">
        <Action
          href={tier.href}
          variant={tier.featured ? "primary" : "outline"}
          className="w-full"
        >
          {tier.cta}
        </Action>
      </div>
    </Panel>
  );
}
