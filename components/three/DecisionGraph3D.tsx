"use client";

import { Html, Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export type DecisionNode = {
  id: string;
  label: string;
  position: [number, number, number];
  active?: boolean;
};

type DecisionGraph3DProps = {
  activeIndex: number;
  nodes: DecisionNode[];
  edges: [number, number][];
};

export function DecisionGraph3D({
  activeIndex,
  nodes,
  edges,
}: DecisionGraph3DProps) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.12;
    }
  });

  const edgePoints = useMemo(
    () =>
      edges.map(([a, b]) => [
        new THREE.Vector3(...nodes[a].position),
        new THREE.Vector3(...nodes[b].position),
      ]),
    [edges, nodes],
  );

  return (
    <group ref={group} position={[0, 0.1, 0]}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 5, 3]} intensity={0.9} color="#ffffff" />
      <pointLight position={[0, 1, 2]} intensity={0.55} color="#2aa99c" />

      {edgePoints.map((pts, i) => {
        const lit = activeIndex >= Math.max(edges[i][0], edges[i][1]);
        return (
          <Line
            key={i}
            points={pts}
            color={lit ? "#2aa99c" : "#c5d4d2"}
            lineWidth={lit ? 2 : 1}
            transparent
            opacity={lit ? 0.85 : 0.35}
          />
        );
      })}

      {nodes.map((node, i) => {
        const active = i <= activeIndex;
        const current = i === activeIndex;
        return (
          <group key={node.id} position={node.position}>
            <mesh>
              <sphereGeometry args={[current ? 0.16 : 0.11, 24, 24]} />
              <meshStandardMaterial
                color={active ? "#2aa99c" : "#d7e3e1"}
                emissive={current ? "#2aa99c" : "#000000"}
                emissiveIntensity={current ? 0.55 : 0}
                roughness={0.4}
                metalness={0.15}
              />
            </mesh>
            {current && (
              <mesh scale={1.55}>
                <sphereGeometry args={[0.16, 24, 24]} />
                <meshBasicMaterial
                  color="#2aa99c"
                  transparent
                  opacity={0.12}
                  depthWrite={false}
                />
              </mesh>
            )}
            <Html
              center
              distanceFactor={7}
              style={{ pointerEvents: "none", whiteSpace: "nowrap" }}
            >
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide ${
                  active
                    ? "bg-white/90 text-[#1b3d3a] shadow-sm"
                    : "bg-white/50 text-[#5c6b69]"
                }`}
              >
                {node.label}
              </span>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
