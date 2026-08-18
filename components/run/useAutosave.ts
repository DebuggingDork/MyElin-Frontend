"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Debounced write-behind for a form that has no Save button.
 *
 * The contract the allocation screens need is narrower than a generic "sync some state" hook, and
 * every rule here exists because of a way an autosaving spend form can lose a figure:
 *
 * - **What goes out is always the latest state, never the state that scheduled the save.** The
 *   payload is read from a ref at the moment the request is made, so a dial dragged through forty
 *   intermediate values POSTs the figure it landed on, once.
 * - **One request in flight at a time.** A change arriving mid-request does not race it: it is
 *   picked up as a single follow-up when the first settles, so two responses cannot land out of
 *   order and leave the older figure persisted.
 * - **A failure never touches the user's input.** The caller owns the state; this hook only
 *   reports `status`/`error`, so a failed save leaves the typed figures on screen and retryable.
 * - **Leaving the screen flushes.** Navigating to the next department, or hiding the tab, inside
 *   the debounce window would otherwise silently drop the last edit.
 *
 * `value` is compared structurally (JSON), so callers may rebuild the payload object each render.
 * The value present on the first render is the baseline: opening a form never saves it back.
 */
export function useAutosave<T>({
  value,
  save,
  enabled = true,
  delay = 600,
}: {
  value: T;
  save: (value: T) => Promise<void>;
  /** While false, changes are tracked but nothing is sent (e.g. the move isn't legal yet). */
  enabled?: boolean;
  delay?: number;
}) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const key = JSON.stringify(value);

  const valueRef = useRef(value);
  const saveRef = useRef(save);
  const enabledRef = useRef(enabled);
  /** Serialised form of the last value the server acknowledged -- seeded with what the form
   *  opened with, which is by definition already persisted. */
  const savedKeyRef = useRef(key);
  const inFlightRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  // Kept current in an effect rather than during render: the only readers are the debounce timer
  // and the request itself, both of which run after commit, so they always see the newest values.
  useEffect(() => {
    valueRef.current = value;
    saveRef.current = save;
    enabledRef.current = enabled;
  });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const flush = useCallback(async (): Promise<void> => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!enabledRef.current) return;
    if (JSON.stringify(valueRef.current) === savedKeyRef.current) return;
    // Coalesce: the loop below re-reads `valueRef` after each request, so a second concurrent
    // caller would only duplicate work and risk the two responses landing out of order.
    if (inFlightRef.current) return;

    inFlightRef.current = true;
    try {
      // Loops rather than sending one snapshot: whatever the user changed *while* a request was
      // open is sent as a follow-up, and the loop ends the moment the form stops moving. Each
      // pass reads the value fresh, so no request ever carries a stale render's figures.
      for (;;) {
        const payload = valueRef.current;
        const payloadKey = JSON.stringify(payload);
        if (payloadKey === savedKeyRef.current) break;
        if (mountedRef.current) setStatus("saving");
        await saveRef.current(payload);
        savedKeyRef.current = payloadKey;
      }
      if (mountedRef.current) {
        setError(null);
        setStatus("saved");
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : "Could not save");
        setStatus("error");
      }
      // No auto-retry loop on purpose: a further edit reschedules through the effect below, and
      // `retry()` covers the case where the figures on screen are already the ones wanted.
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (key === savedKeyRef.current) return;
    // Every keystroke, nudge and drag frame lands here and restarts the clock, so a burst of
    // changes costs one request rather than one per change.
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus("saving");
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      void flush();
    }, delay);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [key, enabled, delay, flush]);

  // Closing or backgrounding the tab mid-debounce loses the same edit as navigating away does.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") void flush();
    };
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [flush]);

  // Declared last so it runs after the debounce cleanup above: that clears the pending timer,
  // this sends what the timer was waiting to send.
  useEffect(() => {
    return () => {
      void flush();
    };
  }, [flush]);

  const retry = useCallback(() => {
    void flush();
  }, [flush]);

  return { status, error, retry, flush };
}
