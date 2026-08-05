import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { Leaderboard } from "@/components/pages/Leaderboard";

export const metadata: Metadata = {
  title: "Myelin — Leaderboard",
  description: "Top operators ranked by Decision Intelligence Score.",
};

export default function LeaderboardPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Leaderboard />
      </main>
      <Footer />
    </>
  );
}
