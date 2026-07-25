"use client";

import { SceneCanvas } from "@/components/three/SceneCanvas";
import { NeuralField } from "@/components/three/NeuralField";

export function HeroNeuralScene() {
  return (
    <SceneCanvas camera={{ position: [0, 0.2, 5.2], fov: 40 }}>
      <NeuralField density={52} />
    </SceneCanvas>
  );
}
