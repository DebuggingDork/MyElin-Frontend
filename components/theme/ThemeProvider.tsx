"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "myelin_theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const SERVER_SNAPSHOT: Theme = "dark";
let snapshot: Theme = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();

function emit(next: Theme) {
  snapshot = next;
  listeners.forEach((l) => l());
}

/** Mirrors whatever the no-flash inline script (in RootLayout) already put on
 *  `<html data-theme>` before hydration -- this never re-decides the theme itself. */
function readDomTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

if (typeof window !== "undefined") {
  snapshot = readDomTheme();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot(): Theme {
  return SERVER_SNAPSHOT;
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* private browsing / storage disabled -- theme just won't persist */
  }
  emit(theme);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((next: Theme) => apply(next), []);
  const toggleTheme = useCallback(
    () => apply(readDomTheme() === "light" ? "dark" : "light"),
    [],
  );

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
