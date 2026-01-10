import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Float } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

// --- Settings ---
const COUNT = 2000; // Particles ki taadad (zyada heavy na ho isliye 2000 rakha hai)
const SPEED = 0.05; // Morph hone ki speed

// --- Geometry Functions ---
// Sphere shape (Female Vibe - Soft)
const getSpherePoint = () => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = 2.2;
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);
  return [x, y, z];
};

// Cube shape (Male Vibe - Sharp)
const getCubePoint = () => {
  const s = 1.8; // size
  const x = (Math.random() - 0.5) * 2 * s;
  const y = (Math.random() - 0.5) * 2 * s;
  const z = (Math.random() - 0.5) * 2 * s;
  // Cube ke surface par particles zyada rakhne ke liye thoda logic
  // (Optional: random bhi theek hai par ye better shape deta hai)
  return [x, y, z];
};

// Cloud/Chaos (Default state)
const getCloudPoint = () => {
  return [(Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8];
};

const Particles = ({ gender }) => {
  const mesh = useRef();
  
  // 1. Calculate Positions Once
  const { initialPositions, maleTarget, femaleTarget, cloudTarget } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const male = new Float32Array(COUNT * 3);
    const female = new Float32Array(COUNT * 3);
    const cloud = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      // Current Pos
      const [ix, iy, iz] = getCloudPoint();
      pos[i * 3] = ix; pos[i * 3 + 1] = iy; pos[i * 3 + 2] = iz;

      // Male Target
      const [mx, my, mz] = getCubePoint();
      male[i * 3] = mx; male[i * 3 + 1] = my; male[i * 3 + 2] = mz;

      // Female Target
      const [fx, fy, fz] = getSpherePoint();
      female[i * 3] = fx; female[i * 3 + 1] = fy; female[i * 3 + 2] = fz;

      // Cloud Target
      const [cx, cy, cz] = getCloudPoint();
      cloud[i * 3] = cx; cloud[i * 3 + 1] = cy; cloud[i * 3 + 2] = cz;
    }

    return { initialPositions: pos, maleTarget: male, femaleTarget: female, cloudTarget: cloud };
  }, []);

  // 2. Animation Loop
  useFrame(() => {
    if (!mesh.current) return;
    
    // Decide target based on gender prop
    let target = cloudTarget;
    if (gender === "male") target = maleTarget;
    if (gender === "female") target = femaleTarget;

    const current = mesh.current.geometry.attributes.position.array;

    // Lerp (Move) particles towards target
    for (let i = 0; i < COUNT * 3; i++) {
      current[i] += (target[i] - current[i]) * SPEED;
    }
    
    mesh.current.geometry.attributes.position.needsUpdate = true;
    
    // Slight rotation
    mesh.current.rotation.y += 0.001;
  });

  // Dynamic Color based on gender
  const color = gender === "male" ? "#60a5fa" : (gender === "female" ? "#f472b6" : "#ffffff");

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={COUNT}
          array={initialPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color={color}
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const MorphingScene = ({ gender, theme }) => {
  return (
    <div className="w-full h-full bg-black relative">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 2]}>
        {/* Lights */}
        <ambientLight intensity={0.5} />
        
        {/* Float se model hawa mein thoda float karega */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <Particles gender={gender} />
        </Float>

        {/* Glow Effect */}
        <EffectComposer>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
        </EffectComposer>

        {/* Interaction */}
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
};

export default MorphingScene;

