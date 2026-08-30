"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Building, GraduationCap, User } from "lucide-react";
import { easeOut } from "@/lib/media";
import { Masthead, Figures } from "@/components/layout/PageChrome";
import { Action, Container, Panel } from "@/components/ui/Kit";
import { useSimulationHref } from "@/components/play/entry";

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
          <Panel className="flex flex-col p-8 lg:p-10" glow>
            <div className="tick-label text-teal mb-4 uppercase">Individual</div>
            <h2 className="ledger-display text-[2rem] text-ink mb-3">Explore Myelin</h2>
            <p className="text-dim mb-8">For students and individual learners.</p>

            <ul className="space-y-4 mb-10 flex-1">
              <li className="flex items-start gap-3"><span className="text-teal mt-0.5">•</span> Access available simulations</li>
              <li className="flex items-start gap-3"><span className="text-teal mt-0.5">•</span> Run simulations independently</li>
              <li className="flex items-start gap-3"><span className="text-teal mt-0.5">•</span> Receive your individual performance report</li>
              <li className="flex items-start gap-3"><span className="text-teal mt-0.5">•</span> Build your decision-making record</li>
            </ul>

            <div className="pt-6 border-t border-line flex flex-col items-center text-center">
              <Action href={simulationHref} size="lg" className="w-full justify-center mb-4">
                Start a Simulation <ArrowRight className="h-4 w-4 ml-2" />
              </Action>
              <p className="text-[12px] text-faint">Individual access currently available.</p>
            </div>
          </Panel>

          {/* Institutions */}
          <Panel className="flex flex-col p-8 lg:p-10 border-teal/30 relative overflow-hidden shadow-[0_0_40px_rgba(20,184,166,0.06)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal/5 blur-3xl -z-10 rounded-full mix-blend-screen" />
            <div className="tick-label text-teal mb-4 uppercase">Institutions</div>
            <h2 className="ledger-display text-[2rem] text-ink mb-3">Bring Myelin to your classroom</h2>
            <p className="text-dim mb-8">For MBA programmes, business schools, universities and faculty.</p>

            <ul className="space-y-4 mb-10 flex-1">
              <li className="flex items-start gap-3"><span className="text-teal mt-0.5">•</span> Cohort-based simulation access</li>
              <li className="flex items-start gap-3"><span className="text-teal mt-0.5">•</span> Student performance reports</li>
              <li className="flex items-start gap-3"><span className="text-teal mt-0.5">•</span> Faculty debrief material</li>
              <li className="flex items-start gap-3"><span className="text-teal mt-0.5">•</span> Pilot onboarding & support</li>
              <li className="flex items-start gap-3"><span className="text-teal mt-0.5">•</span> Custom cohort arrangements</li>
            </ul>

            <div className="pt-6 border-t border-line border-teal/20 flex flex-col items-center text-center">
              <Action href="/#contact" size="lg" className="w-full justify-center mb-5 bg-teal text-black hover:bg-teal-light">
                Request a Pilot <ArrowRight className="h-4 w-4 ml-2" />
              </Action>
              <p className="text-[14px] text-ink mb-2">Institutional pricing — Contact us</p>
              <p className="text-[12px] text-dim leading-relaxed">Cohort pricing depends on programme size, simulations selected, and implementation format.</p>
            </div>
          </Panel>

          {/* Faculty */}
          <Panel className="flex flex-col p-8 lg:p-10">
            <div className="tick-label text-teal mb-4 uppercase">Faculty / Academic</div>
            <h2 className="ledger-display text-[2rem] text-ink mb-3">Teach with Myelin</h2>
            <p className="text-dim mb-8">For professors and academic partners.</p>

            <ul className="space-y-4 mb-10 flex-1">
              <li className="flex items-start gap-3"><span className="text-teal mt-0.5">•</span> Use simulations in teaching</li>
              <li className="flex items-start gap-3"><span className="text-teal mt-0.5">•</span> Review student decision outcomes</li>
              <li className="flex items-start gap-3"><span className="text-teal mt-0.5">•</span> Participate in academic feedback</li>
              <li className="flex items-start gap-3"><span className="text-teal mt-0.5">•</span> Explore faculty contributor opportunities</li>
            </ul>

            <div className="pt-6 border-t border-line flex flex-col items-center text-center">
              <Action href="/#contact" variant="outline" size="lg" className="w-full justify-center mb-4">
                Talk to Us <ArrowRight className="h-4 w-4 ml-2" />
              </Action>
              <p className="text-[12px] text-dim">Let’s explore how we can work together.</p>
            </div>
          </Panel>

        </div>
      </Container>

      {/* ── PILOT WORKFLOW ─────────────────────────────────────── */}
      <section className="bg-[var(--panel)] border-y border-line py-20 relative">
        <Container wide>
          <div className="mb-14">
            <h3 className="ledger-display text-[2.2rem] text-ink mb-2">How a Pilot Works</h3>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 mb-20">
            <div className="relative">
              <div className="text-teal font-mono text-sm mb-4">01</div>
              <h4 className="font-serif text-lg text-ink mb-3">Tell us about your cohort</h4>
              <p className="text-sm text-dim leading-relaxed">Share your institution, programme, approximate student count, and intended use.</p>
            </div>
            <div className="relative">
              <div className="text-teal font-mono text-sm mb-4">02</div>
              <h4 className="font-serif text-lg text-ink mb-3">We configure the pilot</h4>
              <p className="text-sm text-dim leading-relaxed">We recommend the appropriate simulation(s), cohort size, and delivery format.</p>
            </div>
            <div className="relative">
              <div className="text-teal font-mono text-sm mb-4">03</div>
              <h4 className="font-serif text-lg text-ink mb-3">Students run the simulation</h4>
              <p className="text-sm text-dim leading-relaxed">Students make decisions, experience consequences, and receive their individual results.</p>
            </div>
            <div className="relative">
              <div className="text-teal font-mono text-sm mb-4">04</div>
              <h4 className="font-serif text-lg text-ink mb-3">Faculty receives the outcome</h4>
              <p className="text-sm text-dim leading-relaxed">Faculty receive the relevant performance and debrief information to discuss decision-making with the cohort.</p>
            </div>
          </div>

          <div className="border border-line bg-background p-8 lg:p-12">
            <div className="mb-10">
              <h4 className="ledger-display text-xl text-ink">Your Pilot Includes</h4>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <h5 className="font-serif text-[15px] text-ink mb-2">Student access</h5>
                <p className="text-[13px] text-dim">Access to the selected simulation for your cohort.</p>
              </div>
              <div>
                <h5 className="font-serif text-[15px] text-ink mb-2">Individual results</h5>
                <p className="text-[13px] text-dim">Individual performance reports for every student.</p>
              </div>
              <div>
                <h5 className="font-serif text-[15px] text-ink mb-2">Decision insights</h5>
                <p className="text-[13px] text-dim">Decision-making insights generated from the simulation.</p>
              </div>
              <div>
                <h5 className="font-serif text-[15px] text-ink mb-2">Faculty debrief</h5>
                <p className="text-[13px] text-dim">Debrief material to facilitate classroom discussions.</p>
              </div>
              <div>
                <h5 className="font-serif text-[15px] text-ink mb-2">Pilot support</h5>
                <p className="text-[13px] text-dim">Onboarding and support throughout the pilot.</p>
              </div>
              <div>
                <h5 className="font-serif text-[15px] text-ink mb-2">Post-pilot discussion</h5>
                <p className="text-[13px] text-dim">A discussion on outcomes and next steps for your programme.</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── FOOTER CTA ────────────────────────────────────────── */}
      <Container wide className="py-20 lg:py-24 text-center flex flex-col items-center">
        <h3 className="ledger-display text-[2rem] text-ink mb-4">Not sure which option fits?</h3>
        <p className="text-dim text-[16px] max-w-md mx-auto mb-8">
          Tell us what you're trying to do. We'll help you find the right way to use Myelin.
        </p>
        <Action href="/#contact" size="lg" className="mb-8">
          Contact Myelin <ArrowRight className="h-4 w-4 ml-2" />
        </Action>
        <div className="text-xs font-mono uppercase tracking-[0.15em] text-dim/70 flex flex-wrap justify-center items-center gap-3">
          <span>For MBA programmes</span>
          <span className="w-1 h-1 rounded-full bg-line-2 hidden sm:block"></span>
          <span>Business schools</span>
          <span className="w-1 h-1 rounded-full bg-line-2 hidden sm:block"></span>
          <span>Universities</span>
          <span className="w-1 h-1 rounded-full bg-line-2 hidden sm:block"></span>
          <span>L&D teams</span>
        </div>
      </Container>
    </section>
  );
}
