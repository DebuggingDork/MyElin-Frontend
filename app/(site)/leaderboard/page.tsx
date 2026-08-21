import type { Metadata } from "next";
import { Leaderboard } from "@/components/pages/Leaderboard";

export const metadata: Metadata = {
  title: "Myelin — Leaderboard",
  description: "Top operators ranked by Decision Intelligence Score.",
};

export default function LeaderboardPage() {
  return <Leaderboard />;
}
