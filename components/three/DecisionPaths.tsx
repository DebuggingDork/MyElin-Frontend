"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const TEAL = "#08a8a0";
const DEEP = "#0b716e";
const SOFT = "#b7e0dc";

/** Branching decision paths — logo teal only */
export function DecisionPaths({ active = 0 }: { active?: number }) {
  const group = useRef<THREE.Group>(null);

  const curves = useMemo(() => {
    const mk = (y: number, side: number) =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2.2, 0, 0),
        new THREE.Vector3(-0.6, y * 0.35, 0.2),
        new THREE.Vector3(0.5, y, side * 0.15),
        new THREE.Vector3(2.3, y * 1.15, 0),
      ]);
    return [mk(0.85, 1), mk(-0.15, 0), mk(-0.95, -1)];
  }, []);

  const tubes = useMemo(
    () => curves.map((c) => new THREE.TubeGeometry(c, 48, 0.018, 8, false)),
    [curves],
  );

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.12;
      group.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.2) * 0.05;
    }
  });

  return (
    <group ref={group}>
      <ambientLight intensity={0.7} />
      <pointLight position={[2, 2, 3]} intensity={0.7} color={TEAL} />
      {tubes.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshStandardMaterial
            color={i === active % 3 ? TEAL : SOFT}
            transparent
            opacity={i === active % 3 ? 0.95 : 0.35}
            roughness={0.4}
          />
        </mesh>
      ))}
      {[0, 1, 2].map((i) => {
        const p = curves[i].getPoint(1);
        return (
          <mesh key={`n-${i}`} position={p}>
            <sphereGeometry args={[i === active % 3 ? 0.08 : 0.05, 16, 16]} />
            <meshStandardMaterial
              color={i === active % 3 ? TEAL : DEEP}
              emissive={i === active % 3 ? TEAL : "#000000"}
              emissiveIntensity={i === active % 3 ? 0.35 : 0}
            />
          </mesh>
        );
      })}
      <mesh position={[-2.2, 0, 0]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial color={DEEP} />
      </mesh>
    </group>
  );
}
