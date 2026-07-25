"use client";

import Link from "next/link";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
  href?: string;
  className?: string;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-white hover:bg-brand-hover shadow-[0_1px_0_rgba(255,255,255,0.12)_inset]",
  secondary:
    "bg-transparent text-graphite border border-border hover:border-brand/40 hover:text-brand-deep",
  ghost: "bg-transparent text-muted hover:text-brand-deep",
};

export function Button({
  children,
  variant = "primary",
  href,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium tracking-wide transition-colors duration-300 ease-out disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
