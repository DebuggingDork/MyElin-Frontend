import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { Dimensions } from "@/components/home/Dimensions";
import { Hero } from "@/components/home/Hero";
import { How } from "@/components/home/How";
import { Institutions } from "@/components/home/Institutions";
import { Why } from "@/components/home/Why";

/**
 * The `ledger` class carries the homepage's own palette and component geometry
 * (see the LEDGER block in globals.css). It wraps the nav and footer as well as
 * the sections, so the shared chrome adopts the page's surface while it is on
 * screen and reverts everywhere else in the app.
 */
export default function Home() {
  return (
    <div className="ledger flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1">
        <Hero />
        <Why />
        <Dimensions />
        <How />
        <Institutions />
      </main>
      <Footer />
    </div>
  );
}
