"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";

type SceneCanvasProps = {
  children: ReactNode;
  className?: string;
  camera?: { position?: [number, number, number]; fov?: number };
  interactive?: boolean;
};

/** Lightweight R3F host — mounts only while visible to keep scroll smooth */
export function SceneCanvas({
  children,
  className = "",
  camera = { position: [0, 0, 6], fov: 42 },
  interactive = false,
}: SceneCanvasProps) {
  const host = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: "80px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={host} className={`relative h-full w-full ${className}`}>
      {active ? (
        <Canvas
          dpr={1}
          camera={camera}
          frameloop="always"
          gl={{
            antialias: false,
            alpha: true,
            powerPreference: "high-performance",
            stencil: false,
            depth: true,
          }}
          style={{ touchAction: interactive ? "none" : "pan-y" }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
        >
          <Suspense fallback={null}>{children}</Suspense>
        </Canvas>
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-bg-soft to-white" />
      )}
    </div>
  );
}
