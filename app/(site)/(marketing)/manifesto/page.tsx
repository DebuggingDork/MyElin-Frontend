import type { Metadata } from "next";
import { Manifesto } from "@/components/pages/Manifesto";

export const metadata: Metadata = {
  title: "Myelin — Manifesto",
  description:
    "The world rewards judgment. Schools test recall. Myelin exists to close that gap.",
};

export default function ManifestoPage() {
  return <Manifesto />;
}
