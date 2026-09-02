"use client";

import { useEffect, useState } from "react";
import { Check, Download, ExternalLink, Loader2, AlertCircle } from "lucide-react";
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
    // Prevent duplicate requests
    if (status === "working") return;
    
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
      
      // Reset to idle after 3 seconds
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      console.error("PDF generation failed:", err);
      
      // Extract user-friendly error message
      let errorMessage = "Unable to generate the PDF. Please try again.";
      
      if (err instanceof ApiError) {
        if (err.status === 422) {
          errorMessage = "Invalid report data. Please ensure the quarter is complete.";
          // Log validation details for debugging
          console.error("422 Validation Error Details:", err.body);
        } else if (err.status === 500) {
          errorMessage = "Server error while generating PDF. Please try again.";
        } else if (err.status === 401 || err.status === 403) {
          errorMessage = "Authentication error. Please refresh and try again.";
        } else if (err.status === 404) {
          errorMessage = "PDF generation endpoint not found.";
        } else {
          errorMessage = err.message || errorMessage;
        }
      } else if (err instanceof TypeError && err.message.includes("fetch")) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      setError(errorMessage);
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Action 
        variant="outline" 
        onClick={handleDownload} 
        disabled={status === "working"}
        aria-busy={status === "working"}
        aria-live="polite"
      >
        {status === "working" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : status === "done" ? (
          <Check className="h-4 w-4" />
        ) : status === "error" ? (
          <AlertCircle className="h-4 w-4" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {status === "working" ? "Generating PDF…" : "Download PDF"}
      </Action>
      {storedUrl && status !== "error" && (
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
      {error && (
        <div className="flex items-start gap-2 text-[12px] text-rose max-w-md">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
