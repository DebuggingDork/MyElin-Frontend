"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { easeOut } from "@/lib/media";
import { Action, Container, Eyebrow, Pill } from "@/components/ui/Kit";

const stats = [
  { value: "0", label: "videos to watch" },
  { value: "120+", label: "decisions per simulation" },
  { value: "7", label: "cognitive dimensions scored" },
  { value: "24mo", label: "compressed into 30 minutes" },
];

/** Rolling stakeholder chatter — keeps the hero alive instead of static. */
const feed = [
  { who: "Investor", line: "Why did burn climb before revenue did?" },
  { who: "Engineer", line: "If we ship this, on-call breaks by month three." },
  { who: "Customer", line: "Renewal is on hold until support improves." },
  { who: "Co-founder", line: "We cannot chase every segment at once." },
  { who: "Board", line: "Give me one thesis, not four experiments." },
];

const metrics = [
  { label: "Cash", value: "₹5 Cr", delta: "-8%", down: true },
  { label: "Revenue", value: "₹18 L", delta: "+12%", down: false },
  { label: "Morale", value: "78", delta: "+4", down: false },
  { label: "Runway", value: "19 mo", delta: "-1.2", down: true },
];

export function Hero() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 2600);
    return () => window.clearInterval(id);
  }, []);

  const active = tick % feed.length;

  return (
    <section
      id="home"
      className="relative overflow-hidden border-b border-line bg-void pb-16 pt-[68px]"
    >
      <div className="aurora" />
      <div className="grid-lines absolute inset-0" />

      <Container wide className="relative z-10 pt-16 sm:pt-24">
        <div className="grid gap-14 lg:grid-cols-[1.06fr_0.94fr] lg:items-center">
          <div>
            <Eyebrow accent="cyan">
              The Decision Intelligence Platform — S-25 Cohort
            </Eyebrow>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: easeOut }}
              className="display mt-7 text-[clamp(2.9rem,7.6vw,5.6rem)] leading-[0.95] text-ink"
            >
              Make decisions.
              <br />
              <span className="text-grad">Not notes.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12, ease: easeOut }}
              className="mt-7 max-w-xl text-[17px] leading-[1.7] text-dim"
            >
              Myelin compresses 24 months of running a startup into 30 minutes of
              consequential choices. No videos. No quizzes. Just judgment —
              measured across seven cognitive dimensions.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: easeOut }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Action href="/play/startup-survival" size="lg">
                <Play className="h-4 w-4" />
                Run Startup Survival
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Action>
              <Action href="/manifesto" variant="outline" size="lg">
                Read the Blueprint
                <ArrowRight className="h-4 w-4" />
              </Action>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.18, ease: easeOut }}
            className="relative"
          >
            <ConsoleCard active={active} />
          </motion.div>
        </div>
      </Container>

      <Container wide className="relative z-10 mt-20">
        <div className="grid divide-line overflow-hidden rounded-2xl border border-line bg-white/[0.02] sm:grid-cols-2 sm:divide-x lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.32 + i * 0.08, ease: easeOut }}
              className={`relative px-6 py-7 ${i < 2 ? "border-b border-line lg:border-b-0" : ""}`}
            >
              <p className="display text-[34px] leading-none text-ink">
                {stat.value}
              </p>
              <p className="eyebrow mt-3 text-faint">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function ConsoleCard({ active }: { active: number }) {
  return (
    <div className="ring-grad panel relative overflow-hidden rounded-[1.75rem] p-1.5">
      <div className="rounded-[1.4rem] bg-void/70 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="live-dot h-2 w-2 rounded-full bg-emerald" />
            <span className="eyebrow text-dim">Simulation · month 14 of 24</span>
          </div>
          <Pill accent="amber">Live</Pill>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl border border-line bg-white/[0.03] px-4 py-3.5"
            >
              <p className="eyebrow text-faint">{metric.label}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="num text-[20px] font-semibold text-ink">
                  {metric.value}
                </span>
                <span
                  className="num text-[11.5px]"
                  style={{ color: metric.down ? "var(--rose)" : "var(--emerald)" }}
                >
                  {metric.delta}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-line bg-white/[0.02] p-4">
          <p className="eyebrow text-faint">Stakeholders reacting</p>
          <div className="mt-4 space-y-3">
            {feed.map((item, i) => {
              const isActive = i === active;
              return (
                <div
                  key={item.who}
                  className="flex items-start gap-3 transition-all duration-500"
                  style={{ opacity: isActive ? 1 : 0.32 }}
                >
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{
                      background: isActive ? "var(--cyan)" : "var(--line-2)",
                    }}
                  />
                  <p className="text-[13.5px] leading-snug text-dim">
                    <span
                      className="eyebrow mr-2"
                      style={{ color: isActive ? "var(--cyan)" : "var(--faint)" }}
                    >
                      {item.who}
                    </span>
                    {item.line}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between rounded-xl border border-line bg-white/[0.03] px-4 py-3">
          <span className="eyebrow text-faint">Decision 87 of 120</span>
          <div className="flex flex-1 px-4">
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full"
                style={{ width: "72%", background: "var(--grad-primary)" }}
              />
            </div>
          </div>
          <span className="num text-[12px] text-ink">72%</span>
        </div>
      </div>
    </div>
  );
}
