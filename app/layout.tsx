import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Myelin — Learn by Experiencing Decisions",
  description:
    "Universities teach students what to think. Myelin builds environments where they discover how professionals think — through judgment, consequence, and reflection.",
  metadataBase: new URL("https://myelin.app"),
  openGraph: {
    title: "Myelin — Learn by Experiencing Decisions",
    description:
      "A new discipline of learning. Decision environments that hide cognitive traps and reveal judgment.",
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
    title: "Myelin — Learn by Experiencing Decisions",
    description:
      "Learn by Experiencing Decisions. Judgment built through consequence—not lectures.",
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
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
