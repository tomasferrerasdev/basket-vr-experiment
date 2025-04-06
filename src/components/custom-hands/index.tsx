import { Suspense, useCallback } from "react";
import {
  CombinedPointer,
  DefaultXRHandGrabPointer,
  DefaultXRHandTouchPointer,
  DefaultXRInputSourceRayPointer,
  DefaultXRInputSourceTeleportPointer,
} from "@react-three/xr";
import { Handedness } from "@/interfaces/enum";
import { ShadedHand } from "./shaded-hands";
import { GestureEvent } from "@/utils/gesture-detection";

interface CustomHandProps {
  handedness?: Handedness;
  showGrab?: boolean;
  showTouch?: boolean;
  useRay?: boolean;
  useTeleport?: boolean;
  onGestureDetected?: (event: GestureEvent) => void;
}

export const CustomHand: React.FC<CustomHandProps> = ({
  handedness = Handedness.Right,
  showGrab = true,
  showTouch = true,
  useTeleport = false,
  useRay = true,
  onGestureDetected,
}) => {
  const handleGesture = useCallback(
    (event: GestureEvent) => {
      // Forward the gesture event to the parent component
      if (onGestureDetected) {
        onGestureDetected(event);
      }

      // Log for debugging purposes
      console.log(
        `${handedness} hand ${event.gesture} gesture: ${
          event.active ? "DETECTED" : "ENDED"
        }`
      );
    },
    [handedness, onGestureDetected]
  );

  return (
    <>
      <Suspense fallback={null}>
        <ShadedHand handedness={handedness} onGestureDetected={handleGesture} />
      </Suspense>
      <CombinedPointer>
        {useRay && (
          <DefaultXRInputSourceRayPointer makeDefault minDistance={0.2} />
        )}
        <DefaultXRHandGrabPointer cursorModel={showGrab} radius={0.07} />
        {useTeleport && <DefaultXRInputSourceTeleportPointer />}
        <DefaultXRHandTouchPointer
          cursorModel={showTouch}
          hoverRadius={0.1}
          downRadius={0.03}
        />
      </CombinedPointer>
    </>
  );
};
