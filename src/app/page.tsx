"use client";

import { Canvas } from "@react-three/fiber";
import {
  createXRStore,
  noEvents,
  PointerEvents,
  useXRControllerLocomotion,
  XR,
  XROrigin,
} from "@react-three/xr";
import { Environment, Gltf, Sky } from "@react-three/drei";
import { Handle, OrbitHandles } from "@react-three/handle";
import { ReactNode, RefObject, useMemo, useRef } from "react";
import { Group, Object3D } from "three";
import { Physics, RapierRigidBody, RigidBody } from "@react-three/rapier";
import { RigidBodyType } from "@dimforge/rapier3d-compat";

const store = createXRStore();

export default function Home() {
  return (
    <main className="w-full h-screen">
      <Canvas
        camera={{ position: [1, 1, 1] }}
        events={noEvents}
        style={{ width: "100%", flexGrow: 1 }}
      >
        <PointerEvents />
        <OrbitHandles />
        <Staging />
        <XR store={store}>
          <Locomotion />
          <Physics debug gravity={[0, -9.82, 0]}>
            <PhysicsHandle>
              <Gltf scale={0.2} src="/ball.glb" />
            </PhysicsHandle>
            <Walls />
          </Physics>
        </XR>
      </Canvas>
    </main>
  );
}

const Staging = () => {
  return (
    <>
      <Sky />
      <Environment preset="city" />
    </>
  );
};

const Walls = () => {
  return (
    <>
      {/* floor */}
      <RigidBody includeInvisible colliders="cuboid" type="fixed">
        <mesh visible={true} scale={[200, 1, 200]} position={[0, -0.5, 0]}>
          <boxGeometry />
        </mesh>
      </RigidBody>
      <RigidBody colliders="cuboid" type="fixed">
        <mesh visible={true} scale={[2, 1, 0.1]} position={[0, 0, -1]}>
          <boxGeometry />
          <meshStandardMaterial color="red" transparent opacity={0.5} />
        </mesh>
      </RigidBody>
      <RigidBody colliders="cuboid" type="fixed">
        <mesh visible={true} scale={[2, 1, 0.1]} position={[0, 0, 1]}>
          <boxGeometry />
          <meshStandardMaterial color="red" transparent opacity={0.5} />
        </mesh>
      </RigidBody>
      <RigidBody colliders="cuboid" type="fixed">
        <mesh visible={true} scale={[0.1, 1, 2]} position={[1, 0, 0]}>
          <boxGeometry />
          <meshStandardMaterial color="red" transparent opacity={0.5} />
        </mesh>
      </RigidBody>
      <RigidBody colliders="cuboid" type="fixed">
        <mesh visible={true} scale={[0.1, 1, 2]} position={[-1, 0, 0]}>
          <boxGeometry />
          <meshStandardMaterial color="red" transparent opacity={0.5} />
        </mesh>
      </RigidBody>
    </>
  );
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
