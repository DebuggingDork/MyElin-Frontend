import type { Metadata } from "next";
import { Geist, Geist_Mono, Sora } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

/** Runs before paint so the first frame already has the right theme -- without this, the page
 *  would flash the default (dark) theme for a moment on every load for a light-mode visitor.
 *  Kept as a literal inline script (not lib/theme.ts) because it has to execute standalone,
 *  before any bundled JS runs. `ThemeProvider` reads whatever attribute this leaves behind; it
 *  never decides the theme itself. */
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('myelin_theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Myelin — Decision Intelligence Platform",
  description:
    "Myelin compresses 24 months of running a startup into 30 minutes of consequential choices. No videos. No quizzes. Just judgment — measured across seven cognitive dimensions.",
  metadataBase: new URL("https://myelin.app"),
  openGraph: {
    title: "Myelin — Decision Intelligence Platform",
    description:
      "Make decisions. Not notes. Judgment measured across seven cognitive dimensions.",
    type: "website",
    images: [
      {
        url: "/brand/myelin-logo.png",
        width: 512,
        height: 512,
        alt: "Myelin",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Myelin — Decision Intelligence Platform",
    description: "Make decisions. Not notes.",
    images: ["/brand/myelin-logo.png"],
  },
  icons: {
    icon: "/brand/myelin-logo.png",
    apple: "/brand/myelin-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col bg-void font-sans text-ink">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
