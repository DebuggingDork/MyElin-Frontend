"use client";

import { SceneCanvas } from "@/components/three/SceneCanvas";
import { OrbitNodes } from "@/components/three/OrbitNodes";

type Item = { id: string; label: string; detail: string };

export function OrbitScene({
  items,
  activeId,
  onSelect,
}: {
  items: Item[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <SceneCanvas
      interactive
      camera={{ position: [0, 0.8, 4.6], fov: 40 }}
      className="h-full min-h-[280px]"
    >
      <OrbitNodes items={items} activeId={activeId} onSelect={onSelect} />
    </SceneCanvas>
  );
}
