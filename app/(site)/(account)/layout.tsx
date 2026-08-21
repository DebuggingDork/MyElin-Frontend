/**
 * Profile, my simulations, standings, account and security.
 *
 * Same shell and palette as the rest of the site, deliberately without the footer: someone
 * reading their own runs came here to do something, and three columns of marketing links under
 * a settings form is a page ending in furniture rather than in the thing they came for.
 */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <main className="flex-1">{children}</main>;
}
