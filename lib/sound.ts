/**
 * The one sound this product makes.
 *
 * A quarter takes real thought to close and the result lands a beat later, so the report gets
 * an audible arrival: a short struck-bar chime, two notes, about a second. It is the only
 * sound in the app on purpose -- a UI that chimes at everything trains you to ignore it.
 *
/**
 * `/sounds/quarter-closed.wav` and `/sounds/processing.wav` are now fetched from the Supabase
 * Storage bucket to keep all assets centralized.
 *
 * Autoplay: browsers only allow this after a user gesture, and closing a quarter is one -- the
 * chime is fired from that click's own task. A rejected play is swallowed rather than
 * surfaced; a silent cue is not an error worth showing a CEO mid-run.
 */

const SOUND_KEY = "myelin.sound";
const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CHIME = BASE_URL ? `${BASE_URL}/storage/v1/object/public/sounds/quarter-closed.wav` : `/sounds/quarter-closed.wav`;
const PROCESSING = BASE_URL ? `${BASE_URL}/storage/v1/object/public/sounds/processing.wav` : `/sounds/processing.wav`;

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

/**
 * The soft loop that plays while a quarter is being scored.
 *
 * Unlike the chime, this one is meant to start the very moment the CEO hits "Close the
 * quarter", so it is fired synchronously inside that click's task (before any `await`).
 * That is what makes it legal under browser autoplay rules: a `.play()` called after an
 * `await` has already left the user-gesture task and gets blocked silently. Starting here
 * also unlocks the page's audio so the quarter-closed chime can fire a few seconds later.
 *
 * The element is reused and preloaded so a play never has to wait on a first fetch.
 */
let processingSound: HTMLAudioElement | null = null;

/** Start the (looping) processing sound, unless sound is off. Safe to call any time. */
export function playProcessing(): void {
  if (typeof window === "undefined" || !soundEnabled()) return;
  try {
    if (!processingSound) {
      processingSound = new Audio(PROCESSING);
      processingSound.preload = "auto";
      processingSound.loop = true;
      processingSound.volume = 0.2; // Soft background, never foreground.
    }
    processingSound.currentTime = 0;
    void processingSound.play().catch(() => {
      /* Autoplay refused or no output device. Silence is acceptable. */
    });
  } catch {
    /* Never let the cue break the screen it is decorating. */
  }
}

/** Stop the processing sound if it is playing. Safe to call any time. */
export function stopProcessing(): void {
  if (typeof window === "undefined" || !processingSound) return;
  try {
    processingSound.pause();
    processingSound.currentTime = 0;
  } catch {
    /* Element may be gone; nothing to recover. */
  }
}
