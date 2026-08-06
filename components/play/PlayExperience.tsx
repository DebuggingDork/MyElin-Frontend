"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { EntryGate } from "@/components/play/EntryGate";
import { useAuth } from "@/components/auth/AuthProvider";
import { api, getActiveCompanyId, setActiveCompanyId } from "@/lib/api/client";
import { ApiError } from "@/lib/api/types";
import type { Scenario } from "@/lib/play/types";
import { Action } from "@/components/ui/Kit";

/**
 * Entry: consent gate → auth check → create company → /run/{companyId}.
 * Aligns with backend flow: POST /companies then GET .../run.
 */
export function PlayExperience({ scenario }: { scenario: Scenario }) {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [entered, setEntered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!entered || !ready) return;
    if (!user) {
      router.replace(
        `/login?next=${encodeURIComponent(`/play/${scenario.id}`)}`,
      );
    }
  }, [entered, ready, user, router, scenario.id]);

  async function startRun() {
    setStarting(true);
    setError(null);
    try {
      // Resume an active company if we already own one in this browser.
      const existing = getActiveCompanyId();
      if (existing) {
        try {
          await api.getRun(existing);
          router.replace(`/run/${existing}`);
          return;
        } catch {
          setActiveCompanyId(null);
        }
      }

      const company = await api.createCompany({
        name: `${scenario.company.name} · ${user?.email?.split("@")[0] ?? "run"}`,
      });
      setActiveCompanyId(company.id);
      router.replace(`/run/${company.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not start a company run. Is the backend up?",
      );
      setStarting(false);
    }
  }

  if (!entered) {
    return (
      <EntryGate
        scenario={scenario}
        onEnter={() => setEntered(true)}
      />
    );
  }

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-void text-dim">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Checking session…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-void px-5 text-center">
      <p className="eyebrow text-cyan">POST /companies</p>
      <h1 className="display max-w-lg text-[clamp(1.6rem,3vw,2.2rem)] text-ink">
        Start {scenario.name}
      </h1>
      <p className="max-w-md text-[14px] text-dim">
        Creates a company run you own. The UI then follows{" "}
        <code className="text-faint">GET /companies/&#123;id&#125;/run</code>{" "}
        and its <code className="text-faint">legal_moves</code>.
      </p>
      {error && (
        <p className="max-w-md rounded-xl border border-rose/30 bg-rose/[0.07] px-4 py-3 text-[13px] text-rose">
          {error}
        </p>
      )}
      <Action onClick={startRun} disabled={starting} size="lg">
        {starting ? "Creating company…" : "Create company & enter run"}
      </Action>
    </div>
  );
}
