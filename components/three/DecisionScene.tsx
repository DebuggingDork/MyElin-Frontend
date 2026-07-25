"use client";

import { SceneCanvas } from "@/components/three/SceneCanvas";
import {
  DecisionGraph3D,
  type DecisionNode,
} from "@/components/three/DecisionGraph3D";

const nodes: DecisionNode[] = [
  { id: "s", label: "Situation", position: [-2.2, 0.2, 0] },
  { id: "d", label: "Decide", position: [-0.9, 0.55, 0.2] },
  { id: "c", label: "Branch", position: [0.2, 0.95, 0] },
  { id: "o", label: "Outcome", position: [0.35, -0.35, 0.15] },
  { id: "f", label: "Feedback", position: [1.35, 0.55, -0.1] },
  { id: "e", label: "Experience", position: [1.5, -0.45, 0.05] },
  { id: "j", label: "Judgment", position: [2.45, 0.15, 0] },
];

const edges: [number, number][] = [
  [0, 1],
  [1, 2],
  [1, 3],
  [2, 4],
  [3, 5],
  [4, 6],
  [5, 6],
];

export function DecisionScene({ activeIndex }: { activeIndex: number }) {
  return (
    <SceneCanvas
      interactive
      camera={{ position: [0, 0.4, 5.4], fov: 38 }}
      className="h-full min-h-[340px] sm:min-h-[400px]"
    >
      <DecisionGraph3D
        activeIndex={activeIndex}
        nodes={nodes}
        edges={edges}
      />
    </SceneCanvas>
  );
}
