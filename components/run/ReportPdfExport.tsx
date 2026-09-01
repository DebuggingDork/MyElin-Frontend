"use client";

import { useEffect, useState } from "react";
import { Check, Download, ExternalLink, Loader2 } from "lucide-react";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/types";
import type { QuarterReportResponse } from "@/lib/api/types";
// TODO: Migrate to backend PDF generation - see backend/docs/pdf-migration.md
// import { buildReportPdf } from "@/lib/pdf/report-pdf";
import { Action } from "@/components/ui/Kit";
import { useRun } from "@/components/run/RunProvider";

type Status = "idle" | "working" | "done" | "error";

/** Renders the PDF client-side (buildReportPdf), triggers a normal browser download, and uploads
 *  the same bytes to the backend for storage in Supabase Storage -- one click does both, since a
 *  report a CEO bothers to download is exactly the one worth keeping a durable copy of. */
export function ReportPdfExport({ report }: { report: QuarterReportResponse }) {
  const { companyId, company } = useRun();
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
    
    // TODO: Migrate to backend PDF generation
    // See backend/docs/pdf-migration.md for implementation guide
    // New endpoint: POST /reports/decision-intelligence/pdf
    setError("PDF generation temporarily disabled during migration to backend");
    setStatus("error");
    
    /* OLD CODE - TO BE REPLACED:
    try {
      const blob = buildReportPdf(report, company?.name ?? "Myelin");

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `myelin-q${report.quarter_number}-report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      const stored = await api.storeReportPdf(companyId, report.quarter_id, blob);
      setStoredUrl(stored.signed_url);
      setStatus("done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save a copy to storage");
      setStatus("error");
    }
    */
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
