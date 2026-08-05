"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { easeOut } from "@/lib/media";
import { cn } from "@/lib/utils";
import {
  Action,
  Eyebrow,
  Panel,
  accentVar,
  type Accent,
} from "@/components/ui/Kit";

const roles = ["Student", "Faculty", "Recruiter"] as const;

const proofs: { value: string; label: string; accent: Accent }[] = [
  { value: "7", label: "cognitive dimensions scored", accent: "violet" },
  { value: "24", label: "months in 30 minutes", accent: "cyan" },
  { value: "0", label: "videos", accent: "rose" },
];

export function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<(typeof roles)[number]>("Student");

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-void">
      <div className="aurora" />
      <div className="grid-lines absolute inset-0" />

      <div className="relative z-10 px-5 pt-7 sm:px-8">
        <Link href="/" aria-label="Myelin home" className="inline-flex">
          <Logo priority />
        </Link>
      </div>

      <div className="relative z-10 flex flex-1 items-center px-5 py-12 sm:px-8">
        <div className="mx-auto grid w-full max-w-5xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: easeOut }}
          >
            <Panel gradientRing className="p-7 sm:p-9">
              <Eyebrow accent="violet">Join the S-25 cohort</Eyebrow>
              <h1 className="display mt-5 text-[clamp(1.8rem,3.5vw,2.4rem)] leading-[1.05] text-ink">
                Create your{" "}
                <span className="text-grad">Myelin</span> account
              </h1>
              <p className="mt-3 text-[14.5px] text-dim">
                Free Practice tier. Upgrade when you&apos;re ready.
              </p>

              <form
                onSubmit={(e) => e.preventDefault()}
                className="mt-8 space-y-5"
              >
                <div>
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
                              layoutId="signup-role-pill"
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

                <div>
                  <label className="eyebrow text-faint" htmlFor="signup-name">
                    Full name
                  </label>
                  <div className="relative mt-3">
                    <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
                    <input
                      id="signup-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ada Lovelace"
                      className="w-full rounded-full border border-line bg-white/[0.04] py-3.5 pl-11 pr-5 text-[14.5px] text-ink outline-none transition-colors placeholder:text-faint focus:border-violet/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="eyebrow text-faint" htmlFor="signup-email">
                    Email
                  </label>
                  <div className="relative mt-3">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
                    <input
                      id="signup-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@university.edu"
                      className="w-full rounded-full border border-line bg-white/[0.04] py-3.5 pl-11 pr-5 text-[14.5px] text-ink outline-none transition-colors placeholder:text-faint focus:border-violet/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="eyebrow text-faint" htmlFor="signup-password">
                    Password
                  </label>
                  <div className="relative mt-3">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
                    <input
                      id="signup-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full rounded-full border border-line bg-white/[0.04] py-3.5 pl-11 pr-5 text-[14.5px] text-ink outline-none transition-colors placeholder:text-faint focus:border-violet/60"
                    />
                  </div>
                </div>

                <Action className="w-full" size="lg">
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </Action>
              </form>

              <div className="my-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-line" />
                <span className="eyebrow text-faint">or</span>
                <span className="h-px flex-1 bg-line" />
              </div>

              <Action variant="outline" className="w-full">
                <GoogleMark />
                Continue with Google
              </Action>

              <p className="mt-7 text-center text-[14px] text-dim">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-ink underline decoration-line-2 underline-offset-4 transition-colors hover:decoration-violet"
                >
                  Log in
                </Link>
              </p>
            </Panel>
          </motion.div>

          <ProofPanel role={role} />
        </div>
      </div>
    </div>
  );
}

function ProofPanel({ role }: { role: (typeof roles)[number] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.12, ease: easeOut }}
      className="hidden lg:block"
    >
      <div className="ring-grad panel relative overflow-hidden rounded-[1.6rem] p-1.5">
        <div className="rounded-[1.25rem] bg-void/70 p-7">
          <Eyebrow accent="emerald">Built for {role.toLowerCase()}s</Eyebrow>
          <p className="display mt-5 text-[26px] leading-[1.15] text-ink">
            Practice that{" "}
            <span className="text-grad">travels.</span>
          </p>
          <p className="mt-4 text-[14.5px] leading-[1.7] text-dim">
            Your DI Report is designed for recruiters, deans, and your future
            self — not for a LMS gradebook.
          </p>

          <div className="mt-8 space-y-3">
            {proofs.map((p) => (
              <div
                key={p.label}
                className="flex items-center justify-between rounded-xl border border-line bg-white/[0.03] px-5 py-4"
              >
                <span className="text-[14px] text-dim">{p.label}</span>
                <span
                  className="display text-[28px] leading-none"
                  style={{ color: accentVar[p.accent] }}
                >
                  {p.value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-2 border-t border-line pt-5">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald" />
            <span className="eyebrow text-faint">No card required</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function GoogleMark() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.9 2.3 2.8 6.4 2.8 11.5S6.9 20.7 12 20.7c6.9 0 9.1-4.8 9.1-7.3 0-.5 0-.9-.1-1.2H12z"
      />
    </svg>
  );
}
