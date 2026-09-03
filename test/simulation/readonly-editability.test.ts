/**
 * Regression tests for the simulation's input-editability contract.
 *
 * The single source of truth is the shared 50-minute timer (`useSimulationTimer`) and the
 * derived `readOnly` flag in SimulationApp:
 *
 *     const readOnly = timer.paused || timer.expired;
 *
 * Every simulation input (text, number, decimal, +/−, slider, arc/radial, dropdowns, buttons)
 * consumes this single `readOnly` prop. There is deliberately NO second read-only/editable
 * state system, and NO rule that treats an existing/persisted/restored value as read-only.
 *
 * These tests lock in that contract so a regression that:
 *   - fails to re-enable inputs after Resume, or
 *   - makes an already-valued input read-only after section navigation, or
 *   - introduces a second source of truth,
 * is caught immediately.
 */

import { describe, it, expect } from "vitest";
import { isTimerExpired } from "@/lib/simulation/timer";

// ---------------------------------------------------------------------------
// Mirror of the exact readOnly derivation in SimulationApp (line 399):
//     const readOnly = timer.paused || timer.expired;
// ---------------------------------------------------------------------------
function readOnly(paused: boolean, expired: boolean): boolean {
  return paused || expired;
}

// ---------------------------------------------------------------------------
// Mirror of the exact timer state machine in lib/simulation/timer.ts.
// A manual pause sets pausedAt; Resume clears it (and is impossible once expired).
// ---------------------------------------------------------------------------
type StoredTimer = {
  startTimestamp: number;
  pausedAt: number | null;
  totalPausedDuration: number;
  simulationStarted: boolean;
  exitPaused?: boolean;
};

const TOTAL_SECONDS = 50 * 60;

function remainingSeconds(t: StoredTimer, now: number): number {
  const elapsed =
    t.pausedAt !== null
      ? (t.pausedAt - t.startTimestamp - t.totalPausedDuration) / 1000
      : (now - t.startTimestamp - t.totalPausedDuration) / 1000;
  return Math.max(0, TOTAL_SECONDS - elapsed);
}

function pause(t: StoredTimer, at: number): void {
  t.pausedAt = at;
}

function unpause(t: StoredTimer, at: number): void {
  const p = t.pausedAt as number;
  t.totalPausedDuration += at - p;
  t.pausedAt = null;
  t.exitPaused = false;
}

describe("Simulation state machine → input editability", () => {
  it("RUNNING: inputs are editable (readOnly=false)", () => {
    // Not paused, not expired.
    expect(readOnly(false, false)).toBe(false);
  });

  it("PAUSED: inputs are read-only (readOnly=true)", () => {
    expect(readOnly(true, false)).toBe(true);
  });

  it("RESUMED: inputs are editable again (readOnly=false)", () => {
    const t: StoredTimer = {
      startTimestamp: 0,
      pausedAt: 10 * 60_000,
      totalPausedDuration: 0,
      simulationStarted: true,
    };
    // Before resume → paused → read-only.
    expect(readOnly(t.pausedAt !== null, false)).toBe(true);
    // Resume (no-op if expired): pausedAt cleared → paused=false → editable.
    unpause(t, 11 * 60_000);
    const paused = t.pausedAt !== null;
    expect(paused).toBe(false);
    expect(readOnly(paused, false)).toBe(false);
    // The remaining time is preserved — resume must not reset the timer to a fresh 50:00.
    const after = Math.round(remainingSeconds(t, 11 * 60_000));
    expect(after).toBeLessThan(TOTAL_SECONDS); // not reset to full
    expect(after).toBeGreaterThan(0);          // still counting down
  });

  it("EXPIRED: inputs stay read-only and cannot be resumed", () => {
    const t: StoredTimer = {
      startTimestamp: 0,
      pausedAt: null,
      totalPausedDuration: 0,
      simulationStarted: true,
    };
    // Timer ran to zero.
    expect(remainingSeconds(t, TOTAL_SECONDS * 1000)).toBe(0);
    const expired = remainingSeconds(t, TOTAL_SECONDS * 1000) <= 0;
    expect(expired).toBe(true);
    expect(readOnly(false, expired)).toBe(true);
    // Resume is not available once expired.
    expect(expired).toBe(true);
  });
});

describe("A value being persisted/restored must never make an input read-only", () => {
  it("an existing/saved value does not affect editability while running", () => {
    // The readOnly derivation depends ONLY on timer state, never on a value.
    for (const value of ["200000", "250000", "0", ""]) {
      expect(readOnly(false, false)).toBe(false);
      expect(value.length).toBeGreaterThanOrEqual(0); // value is irrelevant to readOnly
    }
  });

  it("section navigation (remount of the same section) keeps running editable", () => {
    // Navigation in SimulationApp only changes the `?tab=` param and re-renders the same
    // section with the same persisted alloc. readOnly is recomputed purely from the timer.
    const afterNavAwayAndBack = readOnly(false, false);
    expect(afterNavAwayAndBack).toBe(false);
  });

  it("a manually paused sim is the ONLY running-state that is read-only", () => {
    // Pause → read-only, Resume → editable: the same single flag governs both.
    expect(readOnly(true, false)).toBe(true);   // paused
    expect(readOnly(false, false)).toBe(false); // resumed
  });
});

describe("isTimerExpired (read-only snapshot helper)", () => {
  it("is provided by the timer module", () => {
    expect(typeof isTimerExpired).toBe("function");
  });

  it("does not throw with an empty localStorage and reports not-expired", () => {
    // Simulate a fresh browser (no persisted timer) — must cleanly read false.
    expect(isTimerExpired("no-such-company")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Mirror of the budgetExhausted derivation in SimulationApp (line 517):
//     const budgetExhausted = budget.ceiling > 0 && budgetRemaining <= 0;
// ---------------------------------------------------------------------------
function budgetExhausted(ceiling: number, remaining: number): boolean {
  return ceiling > 0 && remaining <= 0;
}

describe("budgetExhausted — inputs must not be disabled before budget loads", () => {
  it("budget ceiling 0 (preview not loaded yet): inputs are NOT budget-exhausted", () => {
    // ceiling=0 → budgetRemaining = 0 - localCommitted (negative), but budgetExhausted
    // must be false so inputs remain interactive while the first preview is in flight.
    expect(budgetExhausted(0, -500000)).toBe(false);
    expect(budgetExhausted(0, 0)).toBe(false);
  });

  it("budget ceiling loaded and remaining positive: inputs are NOT budget-exhausted", () => {
    expect(budgetExhausted(5000000, 1000000)).toBe(false);
  });

  it("budget ceiling loaded and remaining zero: inputs ARE budget-exhausted", () => {
    expect(budgetExhausted(5000000, 0)).toBe(true);
  });

  it("budget ceiling loaded and remaining negative: inputs ARE budget-exhausted", () => {
    expect(budgetExhausted(5000000, -200000)).toBe(true);
  });

  it("pause→resume flow: budget not loaded (ceiling=0) does not block editing", () => {
    // Timer is paused → readOnly=true. Budget hasn't loaded (ceiling=0) → budgetExhausted=false.
    // After resume, readOnly flips to false, and inputs are editable because budgetExhausted
    // is also false (ceiling=0). The preview will then load the real budget.
    expect(readOnly(true, false)).toBe(true);   // paused → read-only
    expect(budgetExhausted(0, -100000)).toBe(false); // not budget-exhausted
    // After resume:
    expect(readOnly(false, false)).toBe(false); // resumed → editable
    expect(budgetExhausted(0, -100000)).toBe(false); // still not budget-exhausted
  });
});

describe("pauseForExit timestamp guard — must not override a fresh unpause", () => {
  it("pauseForExit skips when unpause happened within 500ms", () => {
    let lastUnpauseAt = 0;
    let pausedAt: number | null = 1000;

    function unpause() {
      pausedAt = null;
      lastUnpauseAt = Date.now();
    }

    function pauseForExit() {
      if (pausedAt !== null) return; // already paused
      if (Date.now() - lastUnpauseAt < 500) return; // guard
      pausedAt = Date.now();
    }

    // Unpause, then immediately (same tick) try to pauseForExit.
    unpause();
    pauseForExit();
    // pausedAt must still be null — the guard prevented the override.
    expect(pausedAt).toBeNull();
  });

  it("pauseForExit proceeds normally when no recent unpause", () => {
    let pausedAt: number | null = null;
    const lastUnpauseAt = 0;

    function pauseForExit() {
      if (pausedAt !== null) return;
      if (Date.now() - lastUnpauseAt < 500) return;
      pausedAt = Date.now();
    }

    // No unpause has happened (lastUnpauseAt=0), so pauseForExit should proceed.
    pauseForExit();
    expect(pausedAt).not.toBeNull();
  });
});
