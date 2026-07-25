"use client";

import { SceneCanvas } from "@/components/three/SceneCanvas";
import { KnowledgeOrb } from "@/components/three/KnowledgeOrb";

export function BeliefOrbScene() {
  return (
    <SceneCanvas
      camera={{ position: [0, 0.2, 4.2], fov: 40 }}
      className="h-full min-h-[280px]"
    >
      <KnowledgeOrb />
    </SceneCanvas>
  );
}
