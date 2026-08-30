import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Kit";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Simulations", href: "/simulations" },
      { label: "Pricing", href: "/pricing" },
      { label: "Play now", href: "/pricing" },
    ],
  },
  {
    // These all pointed at the pricing tables, which are now a "coming soon" page — the
    // student path goes to signup and the institutional ones to the contact block.
    title: "For",
    links: [
      { label: "Students", href: "/signup" },
      { label: "Faculty", href: "/#institutions" },
      { label: "Recruiters", href: "/#institutions" },
      { label: "Admins", href: "/#institutions" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Manifesto", href: "/manifesto" },
      { label: "FAQ", href: "/faq" },
      { label: "Blueprint", href: "/manifesto" },
      { label: "Contact", href: "/#institutions" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-base">
      <div className="aurora opacity-40" />
      <Container wide className="relative z-10 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <Logo />
            <p className="display mt-6 max-w-sm text-[22px] leading-[1.25] text-ink">
              The world&apos;s first Decision Intelligence Platform.
            </p>
            <p className="mt-3 text-[15px] text-dim">
              Judgment is a skill.{" "}
              <span className="text-grad font-medium">Train it.</span>
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <p className="eyebrow text-faint">{column.title}</p>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="text-[14.5px] text-dim transition-colors hover:text-ink"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-7">
          <p className="num text-[12px] text-faint flex items-center gap-3">
            <span>© 2025 Myelin Labs · Built for judgment</span>
            <span className="hidden sm:inline text-line-2">|</span>
            <Link href="/privacy" className="hover:text-dim transition-colors">Privacy & Data</Link>
            <span className="hidden sm:inline text-line-2">|</span>
            <Link href="/privacy" className="hover:text-dim transition-colors">Terms</Link>
            <span className="hidden sm:inline text-line-2">|</span>
            <Link href="/privacy" className="hover:text-dim transition-colors">Security</Link>
          </p>
          <div className="flex items-center gap-2">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald" />
            <span className="eyebrow text-faint">S-25 cohort open</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
