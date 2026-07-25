"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

type Item = { id: string; label: string; detail: string };

export function OrbitNodes({
  items,
  activeId,
  onSelect,
}: {
  items: Item[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const positions = useMemo(() => {
    return items.map((_, i) => {
      const t = (i / items.length) * Math.PI * 2;
      const r = 1.7;
      return new THREE.Vector3(Math.cos(t) * r, Math.sin(t * 1.3) * 0.45, Math.sin(t) * r);
    });
  }, [items]);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.18;
    }
  });

  return (
    <group ref={group}>
      <ambientLight intensity={0.7} />
      <pointLight position={[2, 2, 3]} intensity={0.8} color="#2aa99c" />
      <mesh>
        <torusGeometry args={[1.7, 0.008, 8, 100]} />
        <meshBasicMaterial color="#2aa99c" transparent opacity={0.25} />
      </mesh>
      {items.map((item, i) => {
        const active = item.id === activeId;
        return (
          <group key={item.id} position={positions[i]}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onSelect(item.id);
              }}
              onPointerOver={() => {
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                document.body.style.cursor = "auto";
              }}
            >
              <sphereGeometry args={[active ? 0.14 : 0.09, 20, 20]} />
              <meshStandardMaterial
                color={active ? "#2aa99c" : "#1b3d3a"}
                emissive={active ? "#2aa99c" : "#000000"}
                emissiveIntensity={active ? 0.5 : 0}
              />
            </mesh>
            <Html distanceFactor={8} style={{ pointerEvents: "none" }}>
              <span
                className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] ${
                  active
                    ? "bg-white text-[#1b3d3a] shadow"
                    : "bg-white/70 text-[#5c6b69]"
                }`}
              >
                {item.label}
              </span>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

export function useOrbitItems(items: Item[]) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  return { activeId, setActiveId };
}
