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
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  if (!open) return null;

  function handleConfirm() {
    if (selected === null || !confirmed) return;
    onConfirm(selected);
  }

  function handleClose() {
    setSelected(null);
    setConfirmed(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white text-ink w-full max-w-md mx-4 border border-line shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            <h2 className="font-serif text-lg">Rewind Simulation</h2>
          </div>
          <button onClick={handleClose} className="p-1 hover:bg-raise">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          <p className="text-sm text-dim">
            Select a completed quarter to rewind to. All quarters after the selected one will be
            deleted and you will need to redo them.
          </p>

          <div className="text-xs font-mono text-dim">
            Rewinds remaining:{" "}
            <span className={rewindsRemaining === 1 ? "text-amber font-bold" : "text-ink"}>
              {rewindsRemaining}
            </span>
          </div>

          {/* Quarter selector */}
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-widest text-dim">Rewind to:</div>
            {completedQuarters.map((q) => (
              <button
                key={q}
                onClick={() => { setSelected(q); setConfirmed(false); }}
                disabled={busy}
                className={cn(
                  "w-full text-left px-4 py-3 border text-sm transition-colors",
                  selected === q
                    ? "border-ink bg-ink text-white"
                    : "border-line-2 hover:border-ink",
                )}
              >
                Quarter {q}
              </button>
            ))}
          </div>

          {/* Confirmation */}
          {selected !== null && (
            <div className="bg-amber/10 border border-amber/30 px-4 py-3 text-sm">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber mt-0.5 shrink-0" />
                <div>
                  <p className="text-ink">
                    Rewinding will use 1 of your {rewindsRemaining + 1} available rewind
                    {rewindsRemaining + 1 === 1 ? "" : "s"}. Quarter {selected} and all quarters
                    after it will be deleted.
                  </p>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                      disabled={busy}
                      className="accent-amber"
                    />
                    <span className="text-xs text-dim">I understand and want to continue</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-line">
          <button
            onClick={handleClose}
            disabled={busy}
            className="px-4 py-2 text-sm border border-line-2 hover:bg-raise"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selected === null || !confirmed || busy}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              selected !== null && confirmed && !busy
                ? "bg-amber text-white hover:bg-amber/90"
                : "bg-line-2 text-dim cursor-not-allowed",
            )}
          >
            {busy ? "Rewinding\u2026" : "Rewind"}
          </button>
        </div>
      </div>
    </div>
  );
}
