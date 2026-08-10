import { Courier_Prime } from "next/font/google";

/** The newsprint screens' typewriter accent (datelines, kickers, running heads). The serif they
 *  set for body copy is the app-wide display face now -- `--font-newsreader`, loaded once in
 *  RootLayout -- so it is deliberately not re-declared here; loading the same family twice would
 *  ship a second copy of the font for no reason. */
export const typewriter = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-typewriter",
});
