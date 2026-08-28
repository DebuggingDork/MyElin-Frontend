"use client";

import { useEffect, useRef } from "react";
import { soundEnabled } from "@/lib/sound";

/**
 * Rewind sound effect hook.
 *
 * Loads the MP3 from the public simulation-assets Supabase Storage bucket —
 * no auth token needed in the browser. The element is allocated lazily (first
 * start() call) so the hook is free to be mounted with zero side-effects.
 *
 * loop: true  — the clip is ~2 s; looping covers the full 3-second countdown
 *               without gaps or silence at the end. stop() cuts it exactly when
 *               the preloader finishes, regardless of where the loop is mid-cycle.
 *
 * Cleanup: a useEffect return always calls stop() so navigating away mid-countdown
 * never leaves audio playing in the background.
 *
 * Audio failures (autoplay block, no output device, network error) are swallowed —
 * the rewind must never depend on sound succeeding.
 */

const REWIND_SFX_URL =
  `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://cziojqsnnojdkgllrrcp.supabase.co"}` +
  `/storage/v1/object/public/simulation-assets/audio/rewind-effect.mp3`;

const VOLUME = 0.5;

export function useRewindSFX() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /** Lazily create the Audio element — only on the client, only when first needed. */
  function getAudio(): HTMLAudioElement | null {
    if (typeof window === "undefined") return null;
    if (!audioRef.current) {
      const el = new Audio(REWIND_SFX_URL);
      el.loop = true;
      el.volume = VOLUME;
      el.preload = "auto";
      audioRef.current = el;
    }
    return audioRef.current;
  }

  /**
   * Start the rewind SFX.
   *
   * Called the moment the user confirms the rewind. The audio is already
   * inside the browser's autoplay-allowed window because it originates from
   * the "Confirm Rewind" button click (a direct user gesture).
   */
  function start() {
    if (!soundEnabled()) return;
    const audio = getAudio();
    if (!audio) return;
    try {
      audio.currentTime = 0;
      void audio.play().catch(() => {
        /* Autoplay refused or no output device — countdown continues normally. */
      });
    } catch {
      /* Never break the rewind. */
    }
  }

  /**
   * Stop the rewind SFX.
   *
   * Called when the 3-second preloader ends, when the component unmounts,
   * or when an error aborts the countdown early.
   */
  function stop() {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch {
      /* Element may already be GC'd during a fast unmount — ignore. */
    }
  }

  /* Guarantee cleanup if the consuming component unmounts while audio is active. */
  useEffect(() => {
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { start, stop };
}
