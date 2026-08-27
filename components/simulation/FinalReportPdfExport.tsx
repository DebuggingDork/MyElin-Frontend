"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, Download, ExternalLink, Loader2 } from "lucide-react";
import { api } from "@/lib/api/client";
import { buildSimulationReportPdf } from "@/lib/pdf/report-pdf-sim";
import { useRun } from "@/components/run/RunProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  displayName,
  identitySnapshot,
  identityServerSnapshot,
  subscribeIdentity,
} from "@/lib/identity";
import type { QuarterScore } from "@/lib/simulation/remote";
import type {
  CompanyState,
  PriorityId,
  QuarterResultShape,
  TermSheet,
} from "@/lib/simulation/types";

type Status = "idle" | "working" | "done" | "error";

export function FinalReportPdfExport({
  scores,
  history,
  priorities,
  s,
  ts,
  eg,
}: {
  scores: QuarterScore[];
  history: QuarterResultShape[];
  priorities: (PriorityId | null)[];
  s: CompanyState;
  ts: TermSheet | null;
  eg: Record<string, unknown> | null;
}) {
  const { companyId, company } = useRun();
  const { user } = useAuth();
  const profile = useSyncExternalStore(
    subscribeIdentity,
    identitySnapshot,
    identityServerSnapshot,
  );

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [storedUrl, setStoredUrl] = useState<string | null>(null);

  async function handleDownload() {
    setStatus("working");
    setError(null);
    try {
      const ceoName = user
        ? displayName(profile, user.email)
        : "CEO";

      const blob = buildSimulationReportPdf(
        scores,
        history,
        priorities,
        s,
        ts,
        eg,
        company?.name ?? "Myelin",
        ceoName,
      );

      // Download always works (local only)
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "myelin-ceo-report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      // Upload is best-effort
      try {
        const stored = await api.storeSimulationReportPdf(companyId, blob);
        setStoredUrl(stored.signed_url);
      } catch {
        // upload failed but download succeeded -- don't alarm the user
      }

      setStatus("done");
    } catch {
      setError("Could not generate the PDF");
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={handleDownload}
        disabled={status === "working"}
        className="flex items-center gap-2 border border-line-2 px-4 py-2 text-sm hover:bg-raise disabled:opacity-50"
      >
        {status === "working" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : status === "done" ? (
          <Check className="h-4 w-4" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {status === "working"
          ? "Preparing PDF\u2026"
          : status === "done"
            ? "Downloaded"
            : "Download CEO Report PDF"}
      </button>
      {storedUrl && (
        <a
          href={storedUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-[12px] text-faint hover:text-ink"
        >
          <ExternalLink className="h-3 w-3" />
          Stored copy
        </a>
      )}
      {error && <span className="text-[12px] text-rose">{error}</span>}
    </div>
  );
}
