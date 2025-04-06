"use client";

import { Canvas } from "@react-three/fiber";
import { noEvents } from "@react-three/xr";

import { XRWrapper } from "@/components/xr-wrapper";

export default function Home() {
  return (
    <main className="w-full h-screen">
      <Canvas
        camera={{ position: [1, 1, 1] }}
        events={noEvents}
        style={{ width: "100%", flexGrow: 1 }}
      >
        <XRWrapper />
      </Canvas>
    </main>
  );
}
