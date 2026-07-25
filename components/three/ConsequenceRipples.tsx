"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const TEAL = "#08a8a0";

/** Ripple rings — logo teal only */
export function ConsequenceRipples({ pulse = 0 }: { pulse?: number }) {
  const group = useRef<THREE.Group>(null);
  const rings = useMemo(() => [0.5, 1.0, 1.5, 2.0], []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!group.current) return;
    group.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      const phase = (t * 0.6 + i * 0.35 + pulse * 0.2) % 1;
      const scale = 0.4 + phase * 1.4;
      mesh.scale.setScalar(scale);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = (1 - phase) * 0.35;
    });
    group.current.rotation.x = Math.PI / 2.6;
  });

  return (
    <group>
      <ambientLight intensity={0.5} />
      <mesh>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color={TEAL}
          emissive={TEAL}
          emissiveIntensity={0.45}
        />
      </mesh>
      <group ref={group}>
        {rings.map((r) => (
          <mesh key={r}>
            <ringGeometry args={[r, r + 0.02, 64]} />
            <meshBasicMaterial
              color={TEAL}
              transparent
              opacity={0.25}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
