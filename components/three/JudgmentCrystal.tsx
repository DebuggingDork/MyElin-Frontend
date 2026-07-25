"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/** Floating judgment facets — represents portfolio / quality of thinking */
export function JudgmentCrystal({ intensity = 1 }: { intensity?: number }) {
  const core = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Group>(null);
  const shards = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const a = (i / 7) * Math.PI * 2;
      return {
        position: [
          Math.cos(a) * 1.15,
          Math.sin(a * 1.4) * 0.35,
          Math.sin(a) * 1.15,
        ] as [number, number, number],
        scale: 0.12 + (i % 3) * 0.04,
      };
    });
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (core.current) {
      core.current.rotation.y = t * 0.35 * intensity;
      core.current.rotation.x = Math.sin(t * 0.4) * 0.2;
    }
    if (ring.current) {
      ring.current.rotation.y = -t * 0.2;
      ring.current.rotation.z = t * 0.08;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.65} />
      <pointLight position={[2, 2, 3]} intensity={0.85} color="#2aa99c" />
      <mesh ref={core}>
        <octahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial
          color="#2aa99c"
          wireframe
          transparent
          opacity={0.55}
        />
      </mesh>
      <mesh>
        <octahedronGeometry args={[0.38, 0]} />
        <meshStandardMaterial
          color="#1b3d3a"
          transparent
          opacity={0.25}
          roughness={0.3}
        />
      </mesh>
      <group ref={ring}>
        {shards.map((s, i) => (
          <mesh key={i} position={s.position} scale={s.scale}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              color="#2aa99c"
              transparent
              opacity={0.55}
              emissive="#2aa99c"
              emissiveIntensity={0.15}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
