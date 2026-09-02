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
      <Container wide className="relative z-10 py-16 lg:py-20">
        <div className="grid gap-14 lg:grid-cols-[1.25fr_1.9fr] lg:gap-20">
          <div>
            <Logo />
            <p className="mt-7 text-[15px] leading-[1.7] text-dim max-w-sm">
              <span className="display text-[22px] leading-[1.25] text-ink">
                The world&apos;s first Decision Intelligence Platform.
              </span>
              <br className="hidden sm:block" />
              <span className="mt-3 inline-block text-[15px] text-dim">
                Judgment is a skill.{" "}
                <span className="text-grad font-medium">Train it.</span>
              </span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <p className="tick-label text-faint">{column.title}</p>
                <ul className="mt-5 space-y-3.5">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center gap-1.5 text-[14.5px] text-dim transition-colors duration-200 hover:text-ink"
                      >
                        <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                          {link.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-7">
          <p className="num text-[12px] text-faint flex flex-wrap items-center gap-3">
            <span>© 2026 Myelin Labs · Built for judgment</span>
            <span className="hidden sm:inline text-line-2">|</span>
            <Link href="/privacy" className="transition-colors hover:text-dim">Privacy & Data</Link>
            <span className="hidden sm:inline text-line-2">|</span>
            <Link href="/privacy" className="transition-colors hover:text-dim">Terms</Link>
            <span className="hidden sm:inline text-line-2">|</span>
            <Link href="/privacy" className="transition-colors hover:text-dim">Security</Link>
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
