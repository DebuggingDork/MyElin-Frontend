"use client";

import dynamic from "next/dynamic";
import { SceneCanvas } from "@/components/three/SceneCanvas";

const SoftDust = dynamic(
  () => import("@/components/three/SoftDust").then((m) => m.SoftDust),
  { ssr: false },
);

export function DustField({
  className = "",
  count = 140,
  drift = 0.1,
}: {
  className?: string;
  count?: number;
  drift?: number;
}) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden>
      <SceneCanvas camera={{ position: [0, 0, 5], fov: 45 }} className="h-full w-full">
        <SoftDust count={count} drift={drift} />
      </SceneCanvas>
    </div>
  );
}
