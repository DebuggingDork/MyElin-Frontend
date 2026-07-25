"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/** Particle stream that reacts to a progress 0-1 */
export function ParticleStream({ intensity = 0.5 }: { intensity?: number }) {
  const points = useRef<THREE.Points>(null);
  const count = 220;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 3.5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    if (!points.current) return;
    const pos = points.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      let y = pos.getY(i) + delta * (0.15 + intensity * 0.55);
      if (y > 2) y = -2;
      pos.setY(i, y);
      pos.setX(i, pos.getX(i) + Math.sin(state.clock.elapsedTime + i) * 0.0015);
    }
    pos.needsUpdate = true;
    points.current.rotation.y = state.clock.elapsedTime * 0.04;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#2aa99c"
        size={0.035}
        transparent
        opacity={0.55}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}
