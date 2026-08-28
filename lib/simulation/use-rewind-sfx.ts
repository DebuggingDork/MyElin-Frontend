"use client";

import { useEffect, useRef } from "react";
import { soundEnabled } from "@/lib/sound";

/**
 * Rewind sound effect hook.
 *
 * The Audio element is created eagerly at hook mount so it is fully allocated
 * and ready before start() is ever called — no lazy-creation delay at the
 * moment the user confirms the rewind.
 *
 * start() and stop() are exposed as stable refs so they can be called from
 * anywhere — including directly from a click handler in SimulationApp —
 * without needing to be listed in useCallback dependency arrays.
 *
 * loop: true  — the clip is ~2 s; looping covers the full 3-second countdown
 *               without gaps or silence at the end.
 *
 * Cleanup: a useEffect return always calls stop() on unmount.
 * All playback failures are swallowed — the rewind must never depend on audio.
 */

const REWIND_SFX_URL =
  `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://cziojqsnnojdkgllrrcp.supabase.co"}` +
  `/storage/v1/object/public/simulation-assets/audio/rewind-effect.mp3`;

const VOLUME = 0.5;

export function useRewindSFX() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stable function refs so callers (including SimulationApp's handleRewind)
  // can call start/stop without stale-closure issues.
  const startRef = useRef<() => void>(() => {});
  const stopRef  = useRef<() => void>(() => {});

  useEffect(() => {
    // Eagerly allocate the element at mount — zero allocation cost when start() fires.
    if (typeof window === "undefined") return;
    const el = new Audio(REWIND_SFX_URL);
    el.loop = true;
    el.volume = VOLUME;
    el.preload = "auto";
    audioRef.current = el;

    startRef.current = () => {
      if (!soundEnabled()) return;
      try {
        el.currentTime = 0;
        void el.play().catch(() => {});
      } catch { /* never break the rewind */ }
    };

    stopRef.current = () => {
      try {
        el.pause();
        el.currentTime = 0;
      } catch { /* element may be GC'd on fast unmount */ }
    };

    return () => {
      stopRef.current();
      audioRef.current = null;
    };
  }, []);

  // start / stop are thin wrappers that always delegate to the current ref —
  // safe to call at any time, including synchronously from a click handler.
  const start = () => startRef.current();
  const stop  = () => stopRef.current();

  return { start, stop };
}
