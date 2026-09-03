"use client";

import { X, AlertCircle } from "lucide-react";
import { inr } from "@/lib/simulation/format";

export function BudgetExhaustedModal({ open, onClose, budgetRemaining }: { open: boolean; onClose: () => void; budgetRemaining?: number }) {
  if (!open) return null;

  const hasNoFunds = budgetRemaining !== undefined && budgetRemaining <= 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-panel border border-line text-ink w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line bg-raise">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-danger" />
            <h2 className="font-serif text-xl text-ink">
              {hasNoFunds ? "Budget Fully Allocated" : "Insufficient Budget"}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-raise-2 transition-colors rounded"
          >
            <X className="h-4 w-4 text-ink" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          {budgetRemaining !== undefined && (
            <div className="bg-danger/10 border border-danger/30 px-4 py-3 text-center">
              <p className="text-xs uppercase tracking-widest text-dim mb-1">Remaining Budget</p>
              <p className="text-2xl font-mono font-bold text-danger">{inr(Math.max(0, budgetRemaining))}</p>
            </div>
          )}

          <p className="text-sm text-ink leading-relaxed">
            {hasNoFunds
              ? "You have fully committed your available cash for this quarter."
              : "You don't have enough budget remaining to make this allocation."}
          </p>

          <div className="bg-amber/10 border border-amber/30 px-4 py-3.5 text-sm">
            <p className="text-ink leading-relaxed">
              To free up budget, you can:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-ink/90">
              <li>Reduce spending in any department you've already allocated</li>
              <li>Draw down more from your credit facility (Finance tab)</li>
              {hasNoFunds && <li>Or close the quarter if you're satisfied with your plan</li>}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-end px-5 py-4 border-t border-line bg-raise">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium transition-colors bg-chrome text-white hover:bg-chrome/90"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
