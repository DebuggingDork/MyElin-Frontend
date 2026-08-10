import { Courier_Prime, Newsreader } from "next/font/google";

/** Shared across every newsprint-styled screen (story + KPI pages) so both load the same two
 *  font instances instead of each declaring its own. */
export const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
});

export const typewriter = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-typewriter",
});
