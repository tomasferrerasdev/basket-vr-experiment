import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useState, useRef, useEffect } from "react";
import { GestureEvent } from "@/utils/gesture-detection";
import { Group, MeshStandardMaterial } from "three";

interface GestureEffectsProps {
  handedness: "RIGHT" | "LEFT";
  onGestureDetected?: (event: GestureEvent) => void;
}

export const GestureEffects: React.FC<GestureEffectsProps> = ({
  handedness,
  onGestureDetected,
}) => {
  const [showRockEffect, setShowRockEffect] = useState(false);
  const groupRef = useRef<Group>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);

  // Handle gesture events
  const handleGesture = (event: GestureEvent) => {
    if (event.gesture === "rock-horns") {
      setShowRockEffect(event.active);

      // Optional callback
      if (onGestureDetected) {
        onGestureDetected(event);
      }
    }
  };

  // Register for gesture events
  useEffect(() => {
    // This would be where we'd register for events from a global event system
    // For now, the events are passed directly in the XR wrapper
    return () => {
      // Cleanup when component unmounts
    };
  }, []);

  // Animate effects
  useFrame((state, delta) => {
    if (groupRef.current && showRockEffect) {
      // Rotate the effect for visual feedback
      groupRef.current.rotation.y += delta * 2;

      // Pulse the emissive intensity
      if (materialRef.current) {
        const pulseFactor = Math.sin(state.clock.elapsedTime * 5) * 0.5 + 0.5;
        materialRef.current.emissiveIntensity = 0.5 + pulseFactor;
      }
    }
  });

  return (
    <>
      {showRockEffect && (
        <group
          ref={groupRef}
          position={[handedness === "RIGHT" ? 0.2 : -0.2, 0.1, -0.3]}
        >
          {/* Visual feedback when rock gesture is detected */}
          <mesh>
            <octahedronGeometry args={[0.05, 0]} />
            <meshStandardMaterial
              ref={materialRef}
              color="#9F8DF8"
              emissive="#6950F5"
              emissiveIntensity={1}
              toneMapped={false}
            />
          </mesh>

          <Text
            position={[0, 0.1, 0]}
            fontSize={0.03}
            color="#FFFFFF"
            anchorX="center"
            anchorY="middle"
          >
            🤘 ROCK ON! 🤘
          </Text>
        </group>
      )}
    </>
  );
};
