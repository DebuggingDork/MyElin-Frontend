"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export function KnowledgeOrb() {
  const core = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const nodes = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => {
      const t = (i / 18) * Math.PI * 2;
      const y = Math.sin(i * 1.7) * 0.55;
      return new THREE.Vector3(Math.cos(t) * 1.35, y, Math.sin(t) * 1.35);
    });
  }, []);

  const linePos = useMemo(() => {
    const arr = new Float32Array(nodes.length * 6);
    nodes.forEach((n, i) => {
      arr.set([0, 0, 0, n.x, n.y, n.z], i * 6);
    });
    return arr;
  }, [nodes]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (core.current) core.current.rotation.y = t * 0.35;
    if (ring.current) {
      ring.current.rotation.x = Math.PI / 2.4;
      ring.current.rotation.z = t * 0.2;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.65} />
      <pointLight position={[2, 2, 3]} intensity={0.7} color="#2aa99c" />

      <mesh ref={core}>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshStandardMaterial
          color="#2aa99c"
          wireframe
          transparent
          opacity={0.55}
        />
      </mesh>

      <mesh ref={ring} scale={1.15}>
        <torusGeometry args={[1.05, 0.012, 12, 80]} />
        <meshBasicMaterial color="#2aa99c" transparent opacity={0.35} />
      </mesh>

      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePos, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#2aa99c" transparent opacity={0.25} />
      </lineSegments>

      {nodes.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial
            color="#1b3d3a"
            emissive="#2aa99c"
            emissiveIntensity={0.25}
          />
        </mesh>
      ))}
    </group>
  );
}
