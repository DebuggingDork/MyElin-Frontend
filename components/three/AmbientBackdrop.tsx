"use client";

import dynamic from "next/dynamic";
import { SceneCanvas } from "@/components/three/SceneCanvas";
import { cn } from "@/lib/utils";

const AmbientModels = dynamic(
  () => import("@/components/three/AmbientModels").then((m) => m.AmbientModels),
  { ssr: false },
);

/** Quiet constant 3D backdrop — mount at most twice on the page */
export function AmbientBackdrop({
  className,
  opacity = 0.55,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      style={{ opacity }}
      aria-hidden
    >
      <SceneCanvas
        camera={{ position: [0, 0.15, 4.2], fov: 42 }}
        className="h-full w-full"
      >
        <AmbientModels />
      </SceneCanvas>
    </div>
  );
}
