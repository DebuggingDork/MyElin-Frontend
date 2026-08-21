/**
 * The one sound this product makes.
 *
 * A quarter takes real thought to close and the result lands a beat later, so the report gets
 * an audible arrival: a short struck-bar chime, two notes, about a second. It is the only
 * sound in the app on purpose -- a UI that chimes at everything trains you to ignore it.
 *
 * `/sounds/quarter-closed.wav` is a static asset, not a fetch from storage: it is 52KB, it
 * never changes per user, and a sound cue that has to wait on a signed URL is a sound cue that
 * arrives after the moment it was meant to mark.
 *
 * Autoplay: browsers only allow this after a user gesture, and closing a quarter is one -- the
 * chime is fired from that click's own task. A rejected play is swallowed rather than
 * surfaced; a silent cue is not an error worth showing a CEO mid-run.
 */

const SOUND_KEY = "myelin.sound";
const CHIME = "/sounds/quarter-closed.wav";

/** One element, reused. Constructing an Audio per play leaks decoders on a long run. */
let chime: HTMLAudioElement | null = null;

export function soundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    // Default on: the cue is the point. Only an explicit "off" silences it.
    return window.localStorage.getItem(SOUND_KEY) !== "off";
  } catch {
    return true;
  }
}

/** Subscribers, so a header toggle can render from `localStorage` through
 *  `useSyncExternalStore` instead of mirroring it into component state. */
const listeners = new Set<() => void>();

export function subscribeSound(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** What the server renders. It cannot read `localStorage`, and the default is on, so this is
 *  the value that hydrates without a mismatch for everyone who has never touched the toggle. */
export function soundEnabledOnServer(): boolean {
  return true;
}

export function setSoundEnabled(on: boolean): void {
  try {
    window.localStorage.setItem(SOUND_KEY, on ? "on" : "off");
  } catch {
    /* A blocked localStorage must never break the run. */
  }
  listeners.forEach((fn) => fn());
}

/** Play the quarter-closed chime, unless the CEO has turned sound off. */
export function playQuarterClosed(): void {
  if (typeof window === "undefined" || !soundEnabled()) return;
  try {
    if (!chime) {
      chime = new Audio(CHIME);
      chime.preload = "auto";
      // Well under a notification's volume: this marks a moment, it does not announce one.
      chime.volume = 0.35;
    }
    chime.currentTime = 0;
    void chime.play().catch(() => {
      /* Autoplay refused, or no output device. Silence is an acceptable outcome. */
    });
  } catch {
    /* Same: never let the cue break the screen it is decorating. */
  }
}
