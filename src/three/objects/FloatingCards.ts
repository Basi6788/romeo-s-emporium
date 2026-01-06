import { MeshTransmissionMaterial, RoundedBox } from '@react-three/drei';

export default function FloatingCards() {
  return (
    <group>
      <RoundedBox args={[2.8, 4.5, 0.1]} radius={0.15}>
        <MeshTransmissionMaterial
          thickness={0.3}
          roughness={0.2}
          transmission={0.9}
          ior={1.3}
        />
      </RoundedBox>
    </group>
  );
}
