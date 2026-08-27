"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TIMER_KEY = (companyId: string) => `simulation.timer.${companyId}`;

const TOTAL_SECONDS = 50 * 60; // 50 minutes for the entire simulation

type StoredTimer = {
  startTimestamp: number; // When the simulation started (first quarter)
  pausedAt: number | null; // Timestamp when paused, null if running
  totalPausedDuration: number; // Total time spent paused (in ms)
  simulationStarted: boolean;
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

export type SimulationTimerResult = {
  remaining: number;
  paused: boolean;
  expired: boolean;
  elapsed: number;
  startTimer: () => void;
  pause: () => void;
  unpause: () => void;
  reset: () => void;
  formatTime: () => string;
};

export function useSimulationTimer(companyId: string, quarter: number): SimulationTimerResult {
  const [remaining, setRemaining] = useState(TOTAL_SECONDS);
  const [paused, setPaused] = useState(false);
  const [expired, setExpired] = useState(false);
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
      // Restore existing timer
      const elapsed = calculateElapsed(stored);
      const newRemaining = Math.max(0, TOTAL_SECONDS - elapsed);
      
      timerDataRef.current = stored;
      setRemaining(newRemaining);
      setPaused(stored.pausedAt !== null);
      setExpired(newRemaining <= 0);
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

  // Countdown interval
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
  }, [companyId, paused]);

  const unpause = useCallback(() => {
    if (!timerDataRef.current || !paused) return;
    
    const now = Date.now();
    const pauseDuration = timerDataRef.current.pausedAt ? now - timerDataRef.current.pausedAt : 0;
    
    const updatedData: StoredTimer = {
      ...timerDataRef.current,
      pausedAt: null,
      totalPausedDuration: timerDataRef.current.totalPausedDuration + pauseDuration,
    };
    
    timerDataRef.current = updatedData;
    saveTimer(companyId, updatedData);
    setPaused(false);
  }, [companyId, paused]);

  const reset = useCallback(() => {
    clearTimer(companyId);
    timerDataRef.current = null;
    setRemaining(TOTAL_SECONDS);
    setPaused(false);
    setExpired(false);
  }, [companyId]);

  const formatTime = useCallback(() => {
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, [remaining]);

  const elapsed = TOTAL_SECONDS - remaining;

  return { remaining, paused, expired, elapsed, startTimer, pause, unpause, reset, formatTime };
}
