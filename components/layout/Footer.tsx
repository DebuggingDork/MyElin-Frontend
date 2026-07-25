import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-soft">
      <Container className="flex flex-col gap-8 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3">
          <Link href="/" aria-label="Myelin home" className="w-fit">
            <Logo className="h-12 w-auto max-w-[6rem] object-contain object-left opacity-90" />
          </Link>
          <p className="max-w-xs text-sm text-muted">
            Learn by Experiencing Decisions.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm text-muted sm:items-end">
          <a href="#home" className="transition-colors hover:text-brand-deep">
            Home
          </a>
          <a
            href="#simulations"
            className="transition-colors hover:text-brand-deep"
          >
            Simulation
          </a>
          <a
            href="#pricing"
            className="transition-colors hover:text-brand-deep"
          >
            Pricing
          </a>
          <a href="#faq" className="transition-colors hover:text-brand-deep">
            FAQ
          </a>
          <a
            href="#request-access"
            className="text-brand transition-colors hover:text-brand-hover"
          >
            Request access
          </a>
          <p className="pt-2 text-xs text-muted/80">
            © {new Date().getFullYear()} Myelin. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
