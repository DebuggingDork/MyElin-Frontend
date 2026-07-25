"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

const links = [
  { href: "#home", label: "Home" },
  { href: "#simulations", label: "Simulation" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || open
          ? "border-b border-border/80 bg-bg/92 backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <Container className="flex h-16 items-center justify-between sm:h-[4.25rem]">
        <Link
          href="#home"
          className="flex items-center gap-2.5"
          aria-label="Myelin home"
        >
          <Logo
            priority
            className="h-9 w-auto max-w-[7rem] object-contain object-left sm:h-10 sm:max-w-[8rem]"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-sm text-muted transition-colors hover:text-charcoal"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="#request-access"
            className="rounded-full bg-brand-ink px-4 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-white transition-colors hover:bg-brand-deep sm:px-5"
          >
            Request Access
          </Link>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <span className="flex w-4 flex-col gap-1">
              <span
                className={cn(
                  "h-px w-full bg-charcoal transition-transform",
                  open && "translate-y-[2.5px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "h-px w-full bg-charcoal transition-opacity",
                  open && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "h-px w-full bg-charcoal transition-transform",
                  open && "-translate-y-[2.5px] -rotate-45",
                )}
              />
            </span>
          </button>
        </div>
      </Container>

      {open && (
        <div className="border-t border-border bg-bg/95 px-6 py-4 backdrop-blur-md md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm text-graphite hover:bg-bg-soft"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
