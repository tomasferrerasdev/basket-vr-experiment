import { RigidBodyType } from "@dimforge/rapier3d-compat";
import { Gltf } from "@react-three/drei";
import { Handle, OrbitHandles } from "@react-three/handle";
import { Physics, RapierRigidBody, RigidBody } from "@react-three/rapier";
import {
  createXRStore,
  PointerEvents,
  useXRControllerLocomotion,
  XR,
  XROrigin,
} from "@react-three/xr";
import { Stage } from "./stage";
import {
  ReactNode,
  RefObject,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { Group, Object3D } from "three";
import { CustomHand } from "./custom-hands";
import { Handedness } from "@/interfaces/enum";
import { GestureEvent } from "@/utils/gesture-detection";
import { GestureEffects } from "./gesture-effects";

// Type for hand component props in XR store
interface HandComponentProps {
  onGestureDetected?: (event: GestureEvent) => void;
}

// Callback handlers for gesture detection
const useGestureHandlers = () => {
  const [leftHandGestures, setLeftHandGestures] = useState<{
    [key: string]: boolean;
  }>({});
  const [rightHandGestures, setRightHandGestures] = useState<{
    [key: string]: boolean;
  }>({});

  const handleLeftHandGesture = useCallback((event: GestureEvent) => {
    setLeftHandGestures((prev) => ({
      ...prev,
      [event.gesture]: event.active,
    }));
  }, []);

  const handleRightHandGesture = useCallback((event: GestureEvent) => {
    setRightHandGestures((prev) => ({
      ...prev,
      [event.gesture]: event.active,
    }));
  }, []);

  return {
    leftHandGestures,
    rightHandGestures,
    handleLeftHandGesture,
    handleRightHandGesture,
  };
};

const store = createXRStore({
  foveation: 0,
  hand: {
    left: (props: HandComponentProps) => (
      <CustomHand
        handedness={Handedness.Left}
        useTeleport
        onGestureDetected={props.onGestureDetected}
      />
    ),
    right: (props: HandComponentProps) => (
      <CustomHand
        handedness={Handedness.Right}
        onGestureDetected={props.onGestureDetected}
      />
    ),
  },
});

export const XRWrapper = () => {
  const { handleLeftHandGesture, handleRightHandGesture } =
    useGestureHandlers();

  return (
    <>
      <PointerEvents />
      <OrbitHandles />
      <XR store={store}>
        <Locomotion />
        <Physics debug gravity={[0, -9.82, 0]}>
          <PhysicsHandle>
            <Gltf scale={1} src="/models/ball.glb" />
          </PhysicsHandle>
          <Stage />

          {/* Gesture Effects */}
          <group position={[0, 1.5, -0.5]}>
            <GestureEffects
              handedness="LEFT"
              onGestureDetected={handleLeftHandGesture}
            />
            <GestureEffects
              handedness="RIGHT"
              onGestureDetected={handleRightHandGesture}
            />
          </group>
        </Physics>

        {/* Pass gesture handlers to hands */}
        <HandGestureProvider
          onLeftHandGesture={handleLeftHandGesture}
          onRightHandGesture={handleRightHandGesture}
        />
      </XR>
    </>
  );
};

// Component to provide gesture handlers to hands
const HandGestureProvider = ({
  onLeftHandGesture,
  onRightHandGesture,
}: {
  onLeftHandGesture: (event: GestureEvent) => void;
  onRightHandGesture: (event: GestureEvent) => void;
}) => {
  store.setState({
    hand: {
      left: (props: HandComponentProps) => (
        <CustomHand
          handedness={Handedness.Left}
          useTeleport
          onGestureDetected={onLeftHandGesture}
        />
      ),
      right: (props: HandComponentProps) => (
        <CustomHand
          handedness={Handedness.Right}
          onGestureDetected={onRightHandGesture}
        />
      ),
    },
  });

  return null;
};

function PhysicsHandle({ children }: { children?: ReactNode }) {
  const ref = useRef<RapierRigidBody>(null);
  const groupRef = useRef<Group>(null);
  const targetRef = useMemo(
    () =>
      new Proxy<RefObject<Object3D | null>>(
        { current: null },
        { get: () => groupRef.current?.parent }
      ),
    []
  );

  return (
    <RigidBody
      ref={ref}
      colliders="ball"
      type="dynamic"
      position={[0, 1, 0]}
      restitution={1.2}
      friction={0.7}
      linearDamping={0.15}
      angularDamping={0.1}
      mass={0.6}
    >
      <group ref={groupRef}>
        <Handle
          multitouch={false}
          handleRef={groupRef}
          scale={false}
          targetRef={targetRef}
          apply={(state) => {
            const rigidBody = ref.current;
            if (rigidBody == null) {
              return;
            }
            if (state.last) {
              rigidBody.setBodyType(RigidBodyType.Dynamic, true);
              if (state.delta != null) {
                const deltaTime = state.delta.time;
                const deltaPosition = state.delta.position
                  .clone()
                  .divideScalar(deltaTime);
                rigidBody.setLinvel(deltaPosition, true);
                const deltaRotation = state.delta.rotation.clone();
                deltaRotation.x /= deltaTime;
                deltaRotation.y /= deltaTime;
                deltaRotation.z /= deltaTime;
                rigidBody.setAngvel(deltaRotation, true);
              }
            } else {
              rigidBody.setBodyType(RigidBodyType.KinematicPositionBased, true);
              rigidBody.setRotation(state.current.quaternion, true);
              rigidBody.setTranslation(state.current.position, true);
            }
          }}
        >
          {children}
        </Handle>
      </group>
    </RigidBody>
  );
}

function Locomotion() {
  const ref = useRef<Group>(null);
  useXRControllerLocomotion(ref);

  return <XROrigin ref={ref} />;
}
