import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  /** `lockup` = glyph + wordmark side by side, `glyph` = the M only. */
  variant?: "lockup" | "glyph";
  className?: string;
  priority?: boolean;
};

/**
 * Renders the alpha-cut assets produced by `scripts/make-dark-logo.mjs`, so the
 * mark sits on the dark surface without the white plate the source PNG ships.
 */
export function Logo({
  variant = "lockup",
  className = "",
  priority = false,
}: LogoProps) {
  if (variant === "glyph") {
    return (
      <Image
        src="/brand/myelin-glyph.png"
        alt="Myelin"
        width={685}
        height={340}
        priority={priority}
        className={cn("h-7 w-auto object-contain", className)}
      />
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/brand/myelin-glyph.png"
        alt=""
        width={685}
        height={340}
        priority={priority}
        aria-hidden
        className="h-[28px] w-auto shrink-0 object-contain"
      />
      <Image
        src="/brand/myelin-word.png"
        alt=""
        width={685}
        height={136}
        priority={priority}
        aria-hidden
        className="h-[15px] w-auto shrink-0 object-contain"
      />
      <span className="sr-only">Myelin</span>
    </span>
  );
}
