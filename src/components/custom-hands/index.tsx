import { Suspense } from "react";
import {
  CombinedPointer,
  DefaultXRHandGrabPointer,
  DefaultXRHandTouchPointer,
  DefaultXRInputSourceRayPointer,
  DefaultXRInputSourceTeleportPointer,
} from "@react-three/xr";
import { Handedness } from "@/interfaces/enum";
import { ShadedHand } from "./shaded-hands";

interface CustomHandProps {
  handedness?: Handedness;
  showGrab?: boolean;
  showTouch?: boolean;
  useRay?: boolean;
  useTeleport?: boolean;
}

export const CustomHand: React.FC<CustomHandProps> = ({
  handedness = Handedness.Right,
  showGrab = true,
  showTouch = true,
  useTeleport = false,
  useRay = true,
}) => {
  return (
    <>
      <Suspense fallback={null}>
        <ShadedHand handedness={handedness} />
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
