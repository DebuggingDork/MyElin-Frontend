import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";

/**
 * The public site: every page the nav bar and the account menu can reach.
 *
 * The chrome and the palette live here rather than on each page for one reason -- they were
 * drifting. The homepage wrapped itself in `ledger` (see the LEDGER block in globals.css) and
 * the other eight did not, so following a link out of the home page swapped the surface, the
 * nav's geometry and the accent set underneath a bar that had not moved. Same shell, same
 * tokens, every route: the only thing a nav click changes is the content.
 *
 * `min-h-screen` with `flex-1` on the main column keeps the footer on the fold for the short
 * pages (pricing, account) without pushing the long ones around.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ledger flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
