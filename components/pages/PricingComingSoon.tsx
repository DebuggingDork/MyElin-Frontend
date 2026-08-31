"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  FileText,
  Gauge,
  LifeBuoy,
  MessagesSquare,
  MessageSquare,
  User,
} from "lucide-react";
import { easeOut } from "@/lib/media";
import { Masthead } from "@/components/layout/PageChrome";
import { Action, Container } from "@/components/ui/Kit";
import { cn } from "@/lib/utils";
import { useSimulationHref } from "@/components/play/entry";

const pilotFeatures = [
  { icon: User, title: "Student access", copy: "Access to the selected simulation for your cohort." },
  { icon: FileText, title: "Individual results", copy: "Individual performance reports for every student." },
  { icon: Gauge, title: "Decision insights", copy: "Decision-making insights generated from the simulation." },
  { icon: MessageSquare, title: "Faculty debrief", copy: "Debrief material to facilitate classroom discussions." },
  { icon: LifeBuoy, title: "Pilot support", copy: "Onboarding and support throughout the pilot." },
  { icon: MessagesSquare, title: "Post-pilot discussion", copy: "A discussion on outcomes and next steps for your programme." },
];

const pilotSteps = [
  { num: "01", title: "Tell us about your cohort", copy: "Share your institution, programme, approximate student count, and intended use." },
  { num: "02", title: "We configure the pilot", copy: "We recommend the appropriate simulation(s), cohort size, and delivery format." },
  { num: "03", title: "Students run the simulation", copy: "Students make decisions, experience consequences, and receive their individual results." },
  { num: "04", title: "Faculty receives the outcome", copy: "Faculty receive the relevant performance and debrief information to discuss decision-making with the cohort." },
];

/**
 * Pricing tier card. Mirrors the shared `Panel` visual (panel surface, rounded corners,
 * optional glow) but owns its own flex column so the CTA can be pinned to the card bottom.
 * The shared Panel wraps children in a non-flex `relative z-10` div, which would swallow the
 * `flex-1`/`mt-auto` that keeps every CTA button on the same baseline across the row.
 */
function TierCard({
  children,
  className,
  glow = false,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay, ease: easeOut }}
      className={cn(
        "panel relative overflow-hidden rounded-2xl flex h-full flex-col",
        className,
      )}
    >
      {glow && (
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-40 blur-xl"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 0%, var(--teal), transparent 70%)",
          }}
        />
      )}
      <div className="relative z-10 flex h-full flex-col p-8 lg:p-10">
        {children}
      </div>
    </motion.div>
  );
}

export function PricingComingSoon() {
  const simulationHref = useSimulationHref();

  return (
    <section className="relative flex flex-col pt-[68px]">
      <div className="grid-lines absolute inset-0" />
      <Masthead section="Pricing" />

      {/* ── HEADER ─────────────────────────────────────────── */}
      <Container wide className="relative z-10 pt-[clamp(3rem,8vh,5rem)] pb-16">
        <h1 className="ledger-display rise max-w-3xl text-[clamp(2.4rem,5.4vw,4.2rem)] text-ink mb-6">
          Choose how you <br className="hidden sm:block" />
          want to use <span className="italic text-teal">Myelin.</span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: easeOut }}
          className="max-w-xl text-[16.5px] leading-[1.72] text-dim"
        >
          Different ways to experience decision-making simulations — from an individual run to an institutional cohort.
        </motion.p>
      </Container>

      {/* ── TIERS ─────────────────────────────────────────── */}
      <Container wide className="relative z-10 pb-20">
        <div className="grid gap-8 lg:grid-cols-3">

          {/* Individual */}
          <TierCard glow>
            <div className="tick-label text-teal mb-4 uppercase">Individual</div>
            <h2 className="ledger-display text-[2rem] text-ink mb-3">Explore Myelin</h2>
            <p className="text-dim mb-8">For students and individual learners.</p>

            <ul className="space-y-4 mb-10 flex-1">
              <li className="flex items-start gap-3"><Check className="h-4 w-4 text-teal mt-0.5 shrink-0" /> Access available simulations</li>
              <li className="flex items-start gap-3"><Check className="h-4 w-4 text-teal mt-0.5 shrink-0" /> Run simulations independently</li>
              <li className="flex items-start gap-3"><Check className="h-4 w-4 text-teal mt-0.5 shrink-0" /> Receive your individual performance report</li>
              <li className="flex items-start gap-3"><Check className="h-4 w-4 text-teal mt-0.5 shrink-0" /> Build your decision-making record</li>
            </ul>

            <div className="flex flex-col pt-6 border-t border-line mt-auto">
              <Action href={simulationHref} size="lg" className="w-full justify-center mb-4">
                Start a Simulation <ArrowRight className="h-4 w-4 ml-2" />
              </Action>
              <div className="h-[64px] flex items-center justify-center">
                <p className="text-center text-[12px] text-faint">Individual access currently available.</p>
              </div>
            </div>
          </TierCard>

          {/* Institutions */}
          <TierCard className="border-teal/30 shadow-[0_0_40px_rgba(20,184,166,0.06)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal/5 blur-3xl -z-10 rounded-full mix-blend-screen" />
            <div className="tick-label text-teal mb-4 uppercase">Institutions</div>
            <h2 className="ledger-display text-[2rem] text-ink mb-3">Bring Myelin to your classroom</h2>
            <p className="text-dim mb-8">For MBA programmes, business schools, universities and faculty.</p>

            <ul className="space-y-4 mb-10 flex-1">
              <li className="flex items-start gap-3"><Check className="h-4 w-4 text-teal mt-0.5 shrink-0" /> Cohort-based simulation access</li>
              <li className="flex items-start gap-3"><Check className="h-4 w-4 text-teal mt-0.5 shrink-0" /> Student performance reports</li>
              <li className="flex items-start gap-3"><Check className="h-4 w-4 text-teal mt-0.5 shrink-0" /> Faculty debrief material</li>
              <li className="flex items-start gap-3"><Check className="h-4 w-4 text-teal mt-0.5 shrink-0" /> Pilot onboarding & support</li>
              <li className="flex items-start gap-3"><Check className="h-4 w-4 text-teal mt-0.5 shrink-0" /> Custom cohort arrangements</li>
            </ul>

            <div className="flex flex-col pt-6 border-t border-line border-teal/20 mt-auto">
              <Action href="/#contact" size="lg" className="w-full justify-center mb-4 bg-teal text-black hover:bg-teal-light">
                Request a Pilot <ArrowRight className="h-4 w-4 ml-2" />
              </Action>
              <div className="h-[64px] flex flex-col items-center justify-center">
                <p className="text-center text-[14px] text-ink mb-2">Institutional pricing — Contact us</p>
                <p className="text-center text-[12px] text-dim leading-relaxed">Cohort pricing depends on programme size, simulations selected, and implementation format.</p>
              </div>
            </div>
          </TierCard>

          {/* Faculty */}
          <TierCard>
            <div className="tick-label text-teal mb-4 uppercase">Faculty / Academic</div>
            <h2 className="ledger-display text-[2rem] text-ink mb-3">Teach with Myelin</h2>
            <p className="text-dim mb-8">For professors and academic partners.</p>

            <ul className="space-y-4 mb-10 flex-1">
              <li className="flex items-start gap-3"><Check className="h-4 w-4 text-teal mt-0.5 shrink-0" /> Use simulations in teaching</li>
              <li className="flex items-start gap-3"><Check className="h-4 w-4 text-teal mt-0.5 shrink-0" /> Review student decision outcomes</li>
              <li className="flex items-start gap-3"><Check className="h-4 w-4 text-teal mt-0.5 shrink-0" /> Participate in academic feedback</li>
              <li className="flex items-start gap-3"><Check className="h-4 w-4 text-teal mt-0.5 shrink-0" /> Explore faculty contributor opportunities</li>
            </ul>

            <div className="flex flex-col pt-6 border-t border-line mt-auto">
              <Action href="/#contact" variant="outline" size="lg" className="w-full justify-center mb-4">
                Talk to Us <ArrowRight className="h-4 w-4 ml-2" />
              </Action>
              <div className="h-[64px] flex items-center justify-center">
                <p className="text-center text-[12px] text-dim">Let’s explore how we can work together.</p>
              </div>
            </div>
          </TierCard>

        </div>
      </Container>

      {/* ── PILOT WORKFLOW ─────────────────────────────────────── */}
      <section className="bg-[var(--panel)] border-y border-line py-20 relative">
        <Container wide>
          <div className="mb-14">
            <h3 className="ledger-display text-[2.2rem] text-ink mb-2">How a Pilot Works</h3>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-20">
            {pilotSteps.map((step) => (
              <div
                key={step.num}
                className="panel-flat rounded-2xl p-6 flex flex-col"
              >
                <div className="text-teal font-mono text-sm mb-4">{step.num}</div>
                <h4 className="font-serif text-lg text-ink mb-3">{step.title}</h4>
                <p className="text-sm text-dim leading-relaxed">{step.copy}</p>
              </div>
            ))}
          </div>

          {/* Your Pilot Includes */}
          <div className="border border-line bg-background p-8 lg:p-12">
            <div className="mb-10">
              <h4 className="ledger-display text-xl text-ink">Your Pilot Includes</h4>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {pilotFeatures.map((f) => (
                <div
                  key={f.title}
                  className="panel-flat rounded-xl p-6 flex flex-col gap-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-[var(--panel-2)] text-teal">
                    <f.icon className="h-4 w-4" />
                  </div>
                  <h5 className="font-serif text-[15px] text-ink">{f.title}</h5>
                  <p className="text-[13px] text-dim leading-relaxed">{f.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── FOOTER CTA ────────────────────────────────────────── */}
      <Container wide className="pt-6 pb-20 lg:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="panel-flat relative overflow-hidden rounded-2xl px-6 py-14 sm:px-12 lg:px-20 lg:py-20 text-center flex flex-col items-center"
        >
          {/* Decorative structure: hairline grid tapers toward the bloom, a soft teal rule
              crosses just below the heading. Neither is loud — they give the close the same
              editorial weight as the tier cards rather than a blank wall. */}
          <div className="dot-grid absolute inset-0 opacity-60" />
          <div className="pointer-events-none absolute left-1/2 top-0 h-px w-24 -translate-x-1/2 bg-gradient-to-r from-transparent via-teal/50 to-transparent" />

          <div className="relative z-10 flex flex-col items-center">
            <p className="tick-label mb-5 flex items-center gap-2.5 text-teal uppercase">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-teal/60" />
              Let&apos;s talk
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-teal/60" />
            </p>

            <h3 className="ledger-display text-balance text-[clamp(1.9rem,4vw,3rem)] text-ink mb-4">
              Not sure which option <span className="italic text-teal">fits?</span>
            </h3>

            <p className="text-dim text-[16px] leading-[1.7] max-w-md mx-auto mb-9">
              Tell us what you&apos;re trying to do. We&apos;ll help you find the right way to use Myelin.
            </p>

            <Action
              href="/#contact"
              size="lg"
              className="group mb-10 shadow-[0_12px_40px_-12px_color-mix(in_srgb,var(--teal)_50%,transparent)] hover:shadow-[0_18px_50px_-12px_color-mix(in_srgb,var(--teal)_70%,transparent)] hover:-translate-y-0.5 active:translate-y-0"
            >
              Contact Myelin
              <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
            </Action>

            <p className="tick-label mb-4 text-faint/80 uppercase">For</p>
            <ul className="flex flex-wrap items-center justify-center gap-2">
              {["MBA programmes", "Business schools", "Universities", "L&D teams"].map(
                (audience, i) => (
                  <li key={audience} className="flex items-center gap-2">
                    {i > 0 && (
                      <span className="mx-1 h-1 w-1 rounded-full bg-line-2" aria-hidden />
                    )}
                    <span className="rounded-full border border-line bg-[var(--panel-2)] px-3 py-[6px] text-[10.5px] font-mono uppercase tracking-[0.18em] text-dim/80 transition-colors hover:border-line-2 hover:text-ink">
                      {audience}
                    </span>
                  </li>
                ),
              )}
            </ul>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
