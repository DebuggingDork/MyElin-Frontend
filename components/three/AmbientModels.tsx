"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const TEAL = "#08a8a0";
const DEEP = "#0b716e";
const INK = "#07605e";

/** Constant ambient geometry — logo teal only, slow & quiet */
export function AmbientModels() {
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y = t * 0.08;
      group.current.rotation.x = Math.sin(t * 0.12) * 0.06;
    }
    if (ring.current) {
      ring.current.rotation.x = t * 0.15;
      ring.current.rotation.z = t * 0.1;
    }
    if (core.current) {
      core.current.rotation.y = -t * 0.2;
    }
  });

  return (
    <group ref={group}>
      <ambientLight intensity={0.75} />
      <pointLight position={[3, 2, 4]} intensity={0.55} color={TEAL} />
      <pointLight position={[-2, -1, 2]} intensity={0.25} color={DEEP} />

      {/* Soft myelin ring */}
      <mesh ref={ring} position={[0.15, 0.1, 0]}>
        <torusGeometry args={[1.15, 0.035, 12, 64]} />
        <meshStandardMaterial
          color={TEAL}
          transparent
          opacity={0.45}
          roughness={0.45}
          metalness={0.05}
        />
      </mesh>

      {/* Inner constant core */}
      <mesh ref={core}>
        <icosahedronGeometry args={[0.42, 0]} />
        <meshStandardMaterial
          color={DEEP}
          transparent
          opacity={0.35}
          roughness={0.5}
          wireframe
        />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial
          color={INK}
          transparent
          opacity={0.22}
          roughness={0.4}
        />
      </mesh>

      {/* Satellite nodes — constant positions */}
      {[
        [1.6, 0.55, 0.2],
        [-1.45, -0.35, 0.35],
        [0.2, -1.15, -0.25],
        [-0.55, 1.05, 0.4],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.045 + (i % 2) * 0.015, 12, 12]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? TEAL : DEEP}
            transparent
            opacity={0.55}
            roughness={0.35}
          />
        </mesh>
      ))}
    </group>
  );
}
