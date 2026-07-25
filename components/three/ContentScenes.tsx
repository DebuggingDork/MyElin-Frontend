"use client";

import { SceneCanvas } from "@/components/three/SceneCanvas";
import { DecisionPaths } from "@/components/three/DecisionPaths";
import { ConsequenceRipples } from "@/components/three/ConsequenceRipples";

/** Branching paths — used once (How it works) */
export function DecisionSceneVisual({ active = 0 }: { active?: number }) {
  return (
    <SceneCanvas
      camera={{ position: [0, 0.3, 4.8], fov: 40 }}
      className="h-full min-h-[240px]"
    >
      <DecisionPaths active={active} />
    </SceneCanvas>
  );
}

/** Ripple consequences — used once (Consequences) */
export function RippleScene({ pulse = 0 }: { pulse?: number }) {
  return (
    <SceneCanvas
      camera={{ position: [0, 0.4, 4.2], fov: 42 }}
      className="h-full min-h-[240px]"
    >
      <ConsequenceRipples pulse={pulse} />
    </SceneCanvas>
  );
}
