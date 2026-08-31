"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TIMER_KEY = (companyId: string) => `simulation.timer.${companyId}`;

const TOTAL_SECONDS = 50 * 60; // 50 minutes for the entire simulation

type StoredTimer = {
  startTimestamp: number; // When the simulation started (first quarter)
  pausedAt: number | null; // Timestamp when paused, null if running
  totalPausedDuration: number; // Total time spent paused (in ms)
  simulationStarted: boolean;
  exitPaused?: boolean; // True when paused because the user exited/navigated away
};

function loadTimer(companyId: string): StoredTimer | null {
  try {
    const raw = window.localStorage.getItem(TIMER_KEY(companyId));
    return raw ? (JSON.parse(raw) as StoredTimer) : null;
  } catch {
    return null;
  }
}

function saveTimer(companyId: string, data: StoredTimer) {
  try {
    window.localStorage.setItem(TIMER_KEY(companyId), JSON.stringify(data));
  } catch {
    /* storage full or private browsing */
  }
}

export function clearTimer(companyId: string) {
  try {
    window.localStorage.removeItem(TIMER_KEY(companyId));
  } catch {
    /* ignore */
  }
}

/**
 * Whether this browser's persisted timer for the run has already run out — computed from the
 * stored start/pause state, never from transient component state, so a cached/refreshed page
 * reads the same answer as the live simulation. Used by list views (e.g. the run picker) to
 * stop offering "Resume" once the shared 50-minute timer is at 00:00.
 *
 * Base a proper countdown on `useSimulationTimer`; this is a cheap, read-only snapshot for
 * screens that only need the expired/non-expired distinction.
 */
export function isTimerExpired(companyId: string): boolean {
  if (typeof window === "undefined") return false;
  const stored = loadTimer(companyId);
  if (!stored || !stored.simulationStarted) return false;
  const now = Date.now();
  let elapsed: number;
  if (stored.pausedAt !== null) {
    elapsed = (stored.pausedAt - stored.startTimestamp - stored.totalPausedDuration) / 1000;
  } else {
    elapsed = (now - stored.startTimestamp - stored.totalPausedDuration) / 1000;
  }
  return elapsed >= TOTAL_SECONDS;
}

export type SimulationTimerResult = {
  remaining: number;
  paused: boolean;
  expired: boolean;
  elapsed: number;
  isExitPause: boolean;
  startTimer: () => void;
  pause: () => void;
  unpause: () => void;
  pauseForExit: () => void;
  reset: () => void;
  formatTime: () => string;
};

export function useSimulationTimer(companyId: string, quarter: number): SimulationTimerResult {
  const [remaining, setRemaining] = useState(TOTAL_SECONDS);
  const [paused, setPaused] = useState(false);
  const [expired, setExpired] = useState(false);
  const [isExitPause, setIsExitPause] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerDataRef = useRef<StoredTimer | null>(null);
  const initializedRef = useRef(false);

  // Calculate elapsed time based on stored data
  const calculateElapsed = useCallback((data: StoredTimer): number => {
    if (!data.simulationStarted) return 0;
    
    const now = Date.now();
    let elapsed: number;
    
    if (data.pausedAt !== null) {
      // Timer is paused: use pausedAt time
      elapsed = (data.pausedAt - data.startTimestamp - data.totalPausedDuration) / 1000;
    } else {
      // Timer is running: use current time
      elapsed = (now - data.startTimestamp - data.totalPausedDuration) / 1000;
    }
    
    return Math.max(0, Math.floor(elapsed));
  }, []);

  // Initialize or restore timer - only once per companyId
  useEffect(() => {
    if (typeof window === "undefined" || initializedRef.current) return;
    initializedRef.current = true;

    const stored = loadTimer(companyId);
    
    if (stored && stored.simulationStarted) {
      // Restore existing timer. If the run was left in an "exit pause" (the user exited,
      // navigated away, refreshed or closed the tab), resume it immediately: fold the
      // spent-away wall-clock time into totalPausedDuration so nothing outside the
      // simulation is counted, and clear the exit flag. The countdown then continues from
      // exactly the remaining time the user left.
      if (stored.pausedAt !== null && stored.exitPaused) {
        const pauseDuration = Date.now() - stored.pausedAt;
        stored.pausedAt = null;
        stored.totalPausedDuration += pauseDuration;
        stored.exitPaused = false;
        saveTimer(companyId, stored);
      }
      const elapsed = calculateElapsed(stored);
      const newRemaining = Math.max(0, TOTAL_SECONDS - elapsed);
      
      timerDataRef.current = stored;
      setRemaining(newRemaining);
      setPaused(stored.pausedAt !== null);
      setExpired(newRemaining <= 0);
      setIsExitPause(Boolean(stored.exitPaused) && stored.pausedAt !== null);
    } else {
      // Initialize new timer (starts when first quarter begins)
      const now = Date.now();
      const newData: StoredTimer = {
        startTimestamp: now,
        pausedAt: null,
        totalPausedDuration: 0,
        simulationStarted: true,
      };
      
      timerDataRef.current = newData;
      saveTimer(companyId, newData);
      setRemaining(TOTAL_SECONDS);
      setPaused(false);
      setExpired(false);
    }
    
    return () => {
      initializedRef.current = false;
    };
  }, [companyId, calculateElapsed]);

  // Countdown interval — a single, controlled lifecycle. The effect is keyed on `paused` and
  // `expired`, so whenever the timer is running exactly one interval exists: pausing tears it
  // down in the effect's cleanup, and resuming (via `unpause`) re-creates a fresh one. No
  // duplicate intervals can accumulate from repeated pause/resume cycles.
  useEffect(() => {
    if (paused || expired) {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      return;
    }

    tickRef.current = setInterval(() => {
      if (!timerDataRef.current) return;
      
      const elapsed = calculateElapsed(timerDataRef.current);
      const newRemaining = Math.max(0, TOTAL_SECONDS - elapsed);
      
      setRemaining(newRemaining);
      
      if (newRemaining <= 0) {
        setExpired(true);
        if (tickRef.current) {
          clearInterval(tickRef.current);
          tickRef.current = null;
        }
      }
    }, 1000);

    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [paused, expired, calculateElapsed]);

  const startTimer = useCallback(() => {
    const now = Date.now();
    const newData: StoredTimer = {
      startTimestamp: now,
      pausedAt: null,
      totalPausedDuration: 0,
      simulationStarted: true,
    };
    
    timerDataRef.current = newData;
    saveTimer(companyId, newData);
    setRemaining(TOTAL_SECONDS);
    setPaused(false);
    setExpired(false);
  }, [companyId]);

  const pause = useCallback(() => {
    if (!timerDataRef.current || paused) return;
    
    const now = Date.now();
    const updatedData: StoredTimer = {
      ...timerDataRef.current,
      pausedAt: now,
    };
    
    timerDataRef.current = updatedData;
    saveTimer(companyId, updatedData);
    setPaused(true);
    setIsExitPause(false);
  }, [companyId, paused]);

  /**
   * Resume from a paused state — the action behind the "Resume" button (manual pause or
   * automatic tab pause alike).
   *
   * Restores the exact persisted remaining time (the pause span is folded into
   * `totalPausedDuration` so no time spent paused is charged) and clears the paused flag,
   * which re-creates the single countdown interval on the next render. Does nothing when the
   * run has genuinely expired — an expired run stays read-only and cannot resume.
   */
  const unpause = useCallback(() => {
    if (!timerDataRef.current || !paused) return;
    if (expired) return;

    const now = Date.now();
    const pauseDuration = timerDataRef.current.pausedAt ? now - timerDataRef.current.pausedAt : 0;

    const updatedData: StoredTimer = {
      ...timerDataRef.current,
      pausedAt: null,
      totalPausedDuration: timerDataRef.current.totalPausedDuration + pauseDuration,
      exitPaused: false,
    };

    timerDataRef.current = updatedData;
    saveTimer(companyId, updatedData);
    setPaused(false);
    setIsExitPause(false);
  }, [companyId, paused, expired]);

  /**
   * Pause because the user left/exited the simulation. Marks the pause as an "exit pause"
   * so the simulation can distinguish it from a manual pause and auto-resume on return.
   *
   * If the simulation is already intentionally paused (manual Pause), that manual state is
   * preserved — leaving it as a manual pause means it stays paused when the user returns,
   * exactly as a manual pause should. Only an actually-running timer becomes an exit pause.
   */
  const pauseForExit = useCallback(() => {
    if (!timerDataRef.current || !timerDataRef.current.simulationStarted) return;
    if (timerDataRef.current.pausedAt !== null) return;
    const updatedData: StoredTimer = {
      ...timerDataRef.current,
      pausedAt: Date.now(),
      exitPaused: true,
    };
    timerDataRef.current = updatedData;
    saveTimer(companyId, updatedData);
    setPaused(true);
    setIsExitPause(true);
  }, [companyId]);

  // Handle leaving the simulation deterministically.
  //
  // Three triggers pause the timer so the countdown freezes the moment the user is away:
  //   - `pagehide` (browser close / tab close / navigating to another site)
  //   - `visibilitychange` -> hidden (tab switch / minimise / backgrounding)
  //   - this effect's own cleanup (the simulation route unmounting, e.g. Exit run or the
  //     back button within the app)
  //
  // All three write an "exit pause" to localStorage so the exact remaining time survives a
  // full reload / re-open, and the interval is torn down because `paused` flips true.
  //
  // The simulation stays paused until the CEO explicitly clicks Resume (`unpause`). Returning
  // to the tab alone does NOT restart the timer — no auto-resume on visibility. Only a fresh
  // mount / reopen of the run resumes automatically from the persisted remaining time.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const runPauseForExit = () => pauseForExit();
    const onVisibility = () => {
      if (document.visibilityState === "hidden") runPauseForExit();
    };
    window.addEventListener("pagehide", runPauseForExit);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", runPauseForExit);
      document.removeEventListener("visibilitychange", onVisibility);
      // Component is leaving (route close / exit). Pause deterministically so no interval
      // keeps running and the exact remaining time is persisted.
      runPauseForExit();
    };
  }, [pauseForExit]);

  const reset = useCallback(() => {
    clearTimer(companyId);
    timerDataRef.current = null;
    setRemaining(TOTAL_SECONDS);
    setPaused(false);
    setExpired(false);
    setIsExitPause(false);
  }, [companyId]);

  const formatTime = useCallback(() => {
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, [remaining]);

  const elapsed = TOTAL_SECONDS - remaining;

  return { remaining, paused, expired, elapsed, isExitPause, startTimer, pause, unpause, pauseForExit, reset, formatTime };
}
