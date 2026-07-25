"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const TEAL = new THREE.Color("#2aa99c");
const TEAL_DEEP = new THREE.Color("#1b3d3a");

function createGraph(count: number, radius: number) {
  const positions: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(-1 + (2 * i) / count);
    const theta = Math.sqrt(count * Math.PI) * phi;
    positions.push(
      new THREE.Vector3(
        radius * Math.cos(theta) * Math.sin(phi),
        radius * Math.sin(theta) * Math.sin(phi) * 0.85,
        radius * Math.cos(phi) * 0.7,
      ),
    );
  }

  const links: [number, number][] = [];
  for (let i = 0; i < count; i++) {
    let nearest = -1;
    let second = -1;
    let nDist = Infinity;
    let sDist = Infinity;
    for (let j = 0; j < count; j++) {
      if (i === j) continue;
      const d = positions[i].distanceToSquared(positions[j]);
      if (d < nDist) {
        sDist = nDist;
        second = nearest;
        nDist = d;
        nearest = j;
      } else if (d < sDist) {
        sDist = d;
        second = j;
      }
    }
    if (nearest >= 0) links.push([i, nearest]);
    if (second >= 0 && i % 2 === 0) links.push([i, second]);
  }

  return { positions, links };
}

export function NeuralField({ density = 48 }: { density?: number }) {
  const group = useRef<THREE.Group>(null);
  const pulse = useRef(0);
  const { positions, links, linePositions, nodePositions } = useMemo(() => {
    const graph = createGraph(density, 2.6);
    const linePositions = new Float32Array(graph.links.length * 6);
    graph.links.forEach(([a, b], i) => {
      linePositions.set(
        [graph.positions[a].x, graph.positions[a].y, graph.positions[a].z],
        i * 6,
      );
      linePositions.set(
        [graph.positions[b].x, graph.positions[b].y, graph.positions[b].z],
        i * 6 + 3,
      );
    });
    const nodePositions = new Float32Array(graph.positions.length * 3);
    graph.positions.forEach((p, i) => {
      nodePositions.set([p.x, p.y, p.z], i * 3);
    });
    return { ...graph, linePositions, nodePositions };
  }, [density]);

  useFrame((state, delta) => {
    pulse.current += delta;
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.06;
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.08;
    }
  });

  return (
    <group ref={group}>
      <ambientLight intensity={0.6} />
      <pointLight position={[3, 2, 4]} intensity={0.8} color="#2aa99c" />
      <pointLight position={[-3, -1, 2]} intensity={0.35} color="#ffffff" />

      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={TEAL}
          transparent
          opacity={0.28}
          depthWrite={false}
        />
      </lineSegments>

      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[nodePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color={TEAL_DEEP}
          size={0.055}
          sizeAttenuation
          transparent
          opacity={0.85}
          depthWrite={false}
        />
      </points>

      {positions.slice(0, 8).map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial
            color={TEAL}
            emissive={TEAL}
            emissiveIntensity={0.45}
            roughness={0.35}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}
