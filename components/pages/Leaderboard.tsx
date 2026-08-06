"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Trophy } from "lucide-react";
import { easeOut } from "@/lib/media";
import { useAuth } from "@/components/auth/AuthProvider";
import { api, getActiveCompanyId } from "@/lib/api/client";
import type { LeaderboardEntry } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";
import {
  Action,
  Container,
  Eyebrow,
  Panel,
} from "@/components/ui/Kit";

/**
 * GET /companies/{company_id}/leaderboard — per-run quarter score rollup.
 * Requires an active company from a started simulation.
 */
export function Leaderboard() {
  const { user, ready } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [companyId] = useState<string | null>(() =>
    typeof window === "undefined" ? null : getActiveCompanyId(),
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    if (!user || !companyId) {
      queueMicrotask(() => setLoading(false));
      return;
    }
    let cancelled = false;
    void api
      .getLeaderboard(companyId)
      .then((res) => {
        if (!cancelled) setEntries(res.entries);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Failed to load");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ready, user, companyId]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-void pb-14 pt-[68px]">
        <div className="aurora" />
        <div className="grid-lines absolute inset-0" />
        <Container wide className="relative z-10 pt-16 sm:pt-24">
          <Eyebrow accent="amber">Global Leaderboard</Eyebrow>
          <h1 className="display mt-5 max-w-3xl text-[clamp(2rem,5vw,3.4rem)] leading-[1.05] text-ink">
            Top operators.
          </h1>
          <p className="mt-4 max-w-xl text-[15px] text-dim">
            Scores come from{" "}
            <code className="text-faint">
              GET /companies/&#123;id&#125;/leaderboard
            </code>{" "}
            for your active run.
          </p>
        </Container>
      </section>

      <section className="border-b border-line bg-base py-16">
        <Container wide>
          {!user && (
            <Panel className="p-8 text-center">
              <p className="text-[15px] text-dim">
                Log in and start a simulation to see your quarter scores.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Action href="/login?next=/leaderboard">Log in</Action>
                <Action href="/simulations" variant="outline">
                  Simulations
                </Action>
              </div>
            </Panel>
          )}

          {user && !companyId && (
            <Panel className="p-8 text-center">
              <p className="text-[15px] text-dim">
                No active company yet. Start Startup Survival to generate
                leaderboard entries.
              </p>
              <div className="mt-5 flex justify-center">
                <Action href="/play/startup-survival">
                  Start a run <ArrowRight className="h-4 w-4" />
                </Action>
              </div>
            </Panel>
          )}

          {user && companyId && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeOut }}
            >
              {loading && (
                <p className="text-[14px] text-dim">Loading leaderboard…</p>
              )}
              {error && (
                <p className="rounded-xl border border-rose/30 bg-rose/[0.07] px-4 py-3 text-[13px] text-rose">
                  {error}
                </p>
              )}
              {!loading && !error && entries.length === 0 && (
                <Panel className="p-8 text-center">
                  <p className="text-[15px] text-dim">
                    No locked quarters yet for this run. Lock Q1 to appear here.
                  </p>
                  <div className="mt-5 flex justify-center">
                    <Action href={`/run/${companyId}`}>
                      Open run <ArrowRight className="h-4 w-4" />
                    </Action>
                  </div>
                </Panel>
              )}
              {entries.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-line">
                  <div className="grid grid-cols-[64px_1fr_1fr_100px] gap-3 border-b border-line bg-raise/60 px-5 py-3 text-[11px] uppercase tracking-wider text-faint">
                    <span>Q</span>
                    <span>Company</span>
                    <span>Quarter</span>
                    <span className="text-right">Score</span>
                  </div>
                  {entries.map((row, i) => (
                    <div
                      key={`${row.quarter_id}-${i}`}
                      className="grid grid-cols-[64px_1fr_1fr_100px] gap-3 border-b border-white/[0.04] px-5 py-4 last:border-0"
                    >
                      <span className="flex items-center gap-2 num text-[13px] text-ink">
                        {i === 0 && (
                          <Trophy className="h-3.5 w-3.5 text-amber" />
                        )}
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="truncate text-[13px] text-dim">
                        {row.company_id.slice(0, 8)}…
                      </span>
                      <span className="text-[13px] text-dim">
                        Q{row.quarter_number}
                      </span>
                      <span className="num text-right text-[14px] font-semibold text-ink">
                        {row.overall_score != null
                          ? row.overall_score.toFixed(1)
                          : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {companyId && (
                <p className="mt-4 text-center text-[12px] text-faint">
                  Active company{" "}
                  <Link href={`/run/${companyId}`} className="text-dim underline">
                    {companyId}
                  </Link>
                </p>
              )}
            </motion.div>
          )}
        </Container>
      </section>
    </>
  );
}
