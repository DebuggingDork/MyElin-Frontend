"use client";

import { useEffect, useState } from "react";
import { Check, Download, ExternalLink, Loader2 } from "lucide-react";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/types";
import type { QuarterReportResponse } from "@/lib/api/types";
import { mapQuarterlyReport } from "@/lib/api/report-mapper";
import { Action } from "@/components/ui/Kit";
import { useRun } from "@/components/run/RunProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  displayName,
  identitySnapshot,
  identityServerSnapshot,
  subscribeIdentity,
} from "@/lib/identity";
import { useSyncExternalStore } from "react";

type Status = "idle" | "working" | "done" | "error";

/** Generates PDF via backend API, triggers a browser download, and uploads the same bytes to
 *  Supabase Storage for durable storage -- one click does both. */
export function ReportPdfExport({ report }: { report: QuarterReportResponse }) {
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

  useEffect(() => {
    let cancelled = false;
    void api
      .getReportPdf(companyId, report.quarter_id)
      .then((res) => {
        if (!cancelled) setStoredUrl(res.signed_url);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [companyId, report.quarter_id]);

  async function handleDownload() {
    setStatus("working");
    setError(null);

    try {
      const ceoName = user ? displayName(profile, user.email) : "CEO";

      // Clean company name - remove any email/username suffix after separator
      const rawCompanyName = company?.name ?? "Myelin";
      const cleanCompanyName =
        rawCompanyName.split(" · ")[0]?.trim() || rawCompanyName;

      // Map quarterly report data to backend report schema
      const reportData = mapQuarterlyReport(
        report,
        cleanCompanyName,
        ceoName
      );

      // Generate PDF via backend API
      const blob = await api.generateDecisionIntelligencePdf(reportData);

      // Download the PDF
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `myelin-q${report.quarter_number}-report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      // Upload to storage for durable copy
      const stored = await api.storeReportPdf(companyId, report.quarter_id, blob);
      setStoredUrl(stored.signed_url);
      setStatus("done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save a copy to storage");
      setStatus("error");
      console.error("PDF generation failed:", err);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Action variant="outline" onClick={handleDownload} disabled={status === "working"}>
        {status === "working" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : status === "done" ? (
          <Check className="h-4 w-4" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {status === "working" ? "Preparing PDF…" : "Download PDF"}
      </Action>
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
