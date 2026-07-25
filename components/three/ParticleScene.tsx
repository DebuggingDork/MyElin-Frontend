"use client";

import { SceneCanvas } from "@/components/three/SceneCanvas";
import { ParticleStream } from "@/components/three/ParticleStream";

export function ParticleScene({ intensity = 0.6 }: { intensity?: number }) {
  return (
    <SceneCanvas camera={{ position: [0, 0, 4.2], fov: 42 }} className="h-full">
      <ambientLight intensity={0.5} />
      <ParticleStream intensity={intensity} />
    </SceneCanvas>
  );
}
