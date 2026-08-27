"use client";

import { useState } from "react";
import { X, RotateCcw, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type RewindModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (targetQuarter: number) => void;
  completedQuarters: number[];
  rewindsRemaining: number;
  busy: boolean;
};

export function RewindModal({
  open,
  onClose,
  onConfirm,
  completedQuarters,
  rewindsRemaining,
  busy,
}: RewindModalProps) {
  const [confirmed, setConfirmed] = useState(false);

  if (!open) return null;

  // Always rewind to the previous quarter (last completed quarter)
  const targetQuarter = completedQuarters[completedQuarters.length - 1];

  function handleConfirm() {
    if (!confirmed || !targetQuarter) return;
    onConfirm(targetQuarter);
  }

  function handleClose() {
    setConfirmed(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-panel border border-line text-ink w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line bg-raise">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-ink" />
            <h2 className="font-serif text-lg text-ink">Rewind Simulation</h2>
          </div>
          <button 
            onClick={handleClose} 
            className="p-1 hover:bg-raise-2 transition-colors rounded"
            disabled={busy}
          >
            <X className="h-4 w-4 text-ink" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          <p className="text-sm text-ink/80 leading-relaxed">
            This will rewind to <strong className="text-ink">Quarter {targetQuarter}</strong>. 
            The current quarter and all progress after Quarter {targetQuarter} will be deleted 
            and you will need to redo them.
          </p>

          <div className="text-xs font-mono text-ink/70 bg-raise px-3 py-2 border border-line">
            Rewinds remaining:{" "}
            <span className={cn(
              "font-bold",
              rewindsRemaining === 1 ? "text-amber" : "text-ink"
            )}>
              {rewindsRemaining}
            </span>
          </div>

          {/* Confirmation */}
          <div className="bg-amber/10 border border-amber/30 px-4 py-3.5 text-sm rounded">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-amber mt-0.5 shrink-0" />
              <div>
                <p className="text-ink leading-relaxed">
                  Rewinding will use 1 rewind. You will have {rewindsRemaining - 1} rewind
                  {rewindsRemaining - 1 === 1 ? "" : "s"} left after this action. This cannot be undone.
                </p>
                <label className="flex items-center gap-2 mt-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    disabled={busy}
                    className="accent-amber w-4 h-4"
                  />
                  <span className="text-xs text-ink/80 group-hover:text-ink transition-colors">
                    I understand and want to continue
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-line bg-raise">
          <button
            onClick={handleClose}
            disabled={busy}
            className="px-4 py-2 text-sm border border-line hover:bg-raise-2 transition-colors text-ink disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!confirmed || busy}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              confirmed && !busy
                ? "bg-amber text-white hover:bg-amber/90"
                : "bg-line text-dim cursor-not-allowed",
            )}
          >
            {busy ? "Rewinding…" : "Rewind"}
          </button>
        </div>
      </div>
    </div>
  );
}
