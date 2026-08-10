"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
      className={cn(
        "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-dim transition-colors duration-200 ease-out hover:border-line-2 hover:text-ink active:scale-[0.94]",
        className,
      )}
    >
      <Sun
        className={cn(
          "absolute h-4 w-4 transition-all duration-200 ease-out",
          isLight ? "scale-100 opacity-100" : "scale-50 opacity-0",
        )}
      />
      <Moon
        className={cn(
          "absolute h-4 w-4 transition-all duration-200 ease-out",
          isLight ? "scale-50 opacity-0" : "scale-100 opacity-100",
        )}
      />
    </button>
  );
}
