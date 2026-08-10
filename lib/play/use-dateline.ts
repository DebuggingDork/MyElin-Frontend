import { useEffect, useState } from "react";

/** Client-only formatted "today" string for the newsprint masthead. `Date` runs fine on the
 *  server too, but the server and a visitor's browser can disagree on today's date near
 *  midnight, so this is rendered client-only (and deferred a tick, not set synchronously in the
 *  effect body) to avoid a hydration mismatch. */
export function useDateline(): string {
  const [label, setLabel] = useState("");
  useEffect(() => {
    queueMicrotask(() => {
      setLabel(
        new Date().toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      );
    });
  }, []);
  return label;
}
