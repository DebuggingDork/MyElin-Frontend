"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TIMER_KEY = (companyId: string) => `simulation.timer.${companyId}`;

const TOTAL_SECONDS = 50 * 60; // 50 minutes

type StoredTimer = {
  remaining: number;
  running: boolean;
  startTs: number;
  quarter: number;
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

function clearTimer(companyId: string) {
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
  const startTsRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pauseRemainingRef = useRef(TOTAL_SECONDS);

  // Initialize or restore timer
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = loadTimer(companyId);
    if (stored && stored.quarter === quarter) {
      if (stored.running) {
        // Timer was running — calculate how much time has passed since last active
        const elapsed = Math.floor((Date.now() - stored.startTs) / 1000);
        const newRemaining = Math.max(0, stored.remaining - elapsed);
        setRemaining(newRemaining);
        setPaused(false);
        setExpired(newRemaining <= 0);
        startTsRef.current = Date.now() - (elapsed * 1000); // preserve original start
        if (newRemaining <= 0) {
          setExpired(true);
          clearTimer(companyId);
        }
      } else {
        // Timer was paused — restore remaining directly
        setRemaining(stored.remaining);
        setPaused(true);
        setExpired(stored.remaining <= 0);
        pauseRemainingRef.current = stored.remaining;
      }
    } else if (stored && stored.quarter !== quarter) {
      // Different quarter — start fresh
      setRemaining(TOTAL_SECONDS);
      setPaused(false);
      setExpired(false);
      startTsRef.current = Date.now();
      saveTimer(companyId, { remaining: TOTAL_SECONDS, running: true, startTs: Date.now(), quarter });
    } else {
      // No stored timer — initialize
      setRemaining(TOTAL_SECONDS);
      setPaused(false);
      setExpired(false);
      startTsRef.current = Date.now();
      saveTimer(companyId, { remaining: TOTAL_SECONDS, running: true, startTs: Date.now(), quarter });
    }

    // Cleanup stored timer for completed run
    return () => {
      // Timer state persists for reload, no cleanup needed here
    };
  }, [companyId, quarter]);

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
      setRemaining((prev) => {
        if (prev <= 1) {
          setExpired(true);
          clearTimer(companyId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [paused, expired, companyId]);

  const startTimer = useCallback(() => {
    startTsRef.current = Date.now();
    setRemaining(TOTAL_SECONDS);
    setPaused(false);
    setExpired(false);
    saveTimer(companyId, { remaining: TOTAL_SECONDS, running: true, startTs: Date.now(), quarter });
  }, [companyId, quarter]);

  const pause = useCallback(() => {
    pauseRemainingRef.current = remaining;
    setPaused(true);
    saveTimer(companyId, { remaining, running: false, startTs: 0, quarter });
  }, [companyId, remaining, quarter]);

  const unpause = useCallback(() => {
    startTsRef.current = Date.now();
    setPaused(false);
    saveTimer(companyId, { remaining: pauseRemainingRef.current, running: true, startTs: Date.now(), quarter });
  }, [companyId, quarter]);

  const reset = useCallback(() => {
    clearTimer(companyId);
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
