"use client";

import { Canvas } from "@react-three/fiber";
import { noEvents } from "@react-three/xr";

import { XRWrapper } from "@/components/xr-wrapper";
import { useState } from "react";

export default function Home() {
  const [isVR, setIsVR] = useState(false);

  return (
    <main className="w-full h-screen">
      <button
        className="absolute top-5 left-5 z-50"
        onClick={() => setIsVR(true)}
      >
        enter VR
      </button>
      <Canvas
        camera={{ position: [1, 1, 1] }}
        events={noEvents}
        style={{ width: "100%", flexGrow: 1 }}
      >
        <XRWrapper isVR={isVR} />
      </Canvas>
    </main>
  );
}
