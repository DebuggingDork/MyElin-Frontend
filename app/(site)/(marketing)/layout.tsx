import { Footer } from "@/components/layout/Footer";

/**
 * Home, simulations, manifesto, FAQ, pricing -- the pages a visitor lands on.
 *
 * These are the only pages the footer belongs to: it exists to give someone who has just read
 * an argument somewhere else to go. On an account page it is furniture, so `(account)` renders
 * without one.
 *
 * `flex-1` on main, footer after it: the page column is a flex column, so a short page still
 * puts the footer at the bottom of the viewport rather than halfway up it.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
