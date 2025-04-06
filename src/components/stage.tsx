import { Gltf } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";

export const Stage = () => {
  return (
    <>
      <Walls />
      <Gltf src="/models/skybox.glb" scale={1} />
    </>
  );
};

const Walls = () => {
  const innerRoomSize = 10;
  const halfSize = innerRoomSize / 2;
  const wallHeight = 3;
  const wallThickness = 0.1;

  return (
    <>
      {/* floor */}
      <RigidBody includeInvisible colliders="cuboid" type="fixed">
        <mesh visible={true} scale={[10, 1, 10]} position={[0, -0.5, 0]}>
          <boxGeometry />
        </mesh>
      </RigidBody>

      {/* walls */}
      <RigidBody colliders="cuboid" type="fixed">
        <mesh
          visible={true}
          scale={[innerRoomSize, wallHeight, wallThickness]}
          position={[0, wallHeight / 2, -halfSize]}
        >
          <boxGeometry />
          <meshStandardMaterial color="black" transparent opacity={0.2} />
        </mesh>
      </RigidBody>
      <RigidBody colliders="cuboid" type="fixed">
        <mesh
          visible={true}
          scale={[innerRoomSize, wallHeight, wallThickness]}
          position={[0, wallHeight / 2, halfSize]}
        >
          <boxGeometry />
          <meshStandardMaterial color="black" transparent opacity={0.2} />
        </mesh>
      </RigidBody>
      <RigidBody colliders="cuboid" type="fixed">
        <mesh
          visible={true}
          scale={[wallThickness, wallHeight, innerRoomSize]}
          position={[halfSize, wallHeight / 2, 0]}
        >
          <boxGeometry />
          <meshStandardMaterial color="black" transparent opacity={0.2} />
        </mesh>
      </RigidBody>
      <RigidBody colliders="cuboid" type="fixed">
        <mesh
          visible={true}
          scale={[wallThickness, wallHeight, innerRoomSize]}
          position={[-halfSize, wallHeight / 2, 0]}
        >
          <boxGeometry />
          <meshStandardMaterial color="black" transparent opacity={0.2} />
        </mesh>
      </RigidBody>
    </>
  );
};
