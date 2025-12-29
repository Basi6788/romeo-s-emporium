import React, { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Stars, OrbitControls, Sparkles } from "@react-three/drei";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// --- 3D SCENE COMPONENT (Inside the Hexagon) ---
const SciFiScene = () => {
  return (
    <>
      {/* Background Stars inside the portal */}
      <color attach="background" args={["#050214"]} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={100} scale={5} size={2} speed={0.4} opacity={0.5} color="#A855F7" />
      
      {/* Lights */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#8B5CF6" />
      <pointLight position={[-10, -10, -10]} intensity={2} color="#3B82F6" />

      {/* Floating Object (Represents the Astronaut/Core) */}
      <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
        <mesh scale={1.8}>
          <sphereGeometry args={[1, 64, 64]} />
          {/* Futuristic Liquid Material */}
          <MeshDistortMaterial
            color="#4c1d95"
            attach="material"
            distort={0.4} // Strength of distortion
            speed={2} // Speed of distortion
            roughness={0.2}
            metalness={0.8}
            emissive="#2e1065"
          />
        </mesh>
        
        {/* Orbital Ring 1 */}
        <mesh rotation-x={Math.PI / 2}>
           <torusGeometry args={[1.6, 0.05, 16, 100]} />
           <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2} toneMapped={false} />
        </mesh>
      </Float>

      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
    </>
  );
};

// --- MAIN PAGE COMPONENT ---
const NotFound = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const text404Ref = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance Animation
      const tl = gsap.timeline();

      // 1. Text sliding in
      tl.from(".number-4", {
        y: 100,
        opacity: 0,
        duration: 1.5,
        stagger: 0.2,
        ease: "power4.out",
      })
      // 2. Hexagon growing
      .from(".hex-portal", {
        scale: 0,
        rotation: 180,
        opacity: 0,
        duration: 1.5,
        ease: "elastic.out(1, 0.5)",
      }, "-=1.2")
      // 3. Bottom text fade up
      .from(contentRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
      }, "-=0.5");
      
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen w-full bg-[#030014] overflow-hidden flex flex-col items-center justify-center font-sans selection:bg-purple-500/30"
    >
      {/* Background Gradient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main 404 Layout */}
      <div ref={text404Ref} className="relative z-10 flex items-center justify-center gap-4 md:gap-12">
        
        {/* Left '4' */}
        <h1 className="number-4 text-[150px] md:text-[250px] font-bold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-purple-400 to-purple-900 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
          4
        </h1>

        {/* Center Hexagon Portal (The '0') */}
        <div className="hex-portal relative w-[180px] h-[180px] md:w-[280px] md:h-[280px] group">
            {/* Hexagon Shape Container */}
            <div 
                className="absolute inset-0 w-full h-full overflow-hidden"
                style={{
                    clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                    background: "black"
                }}
            >
                {/* 3D Canvas */}
                <Canvas camera={{ position: [0, 0, 5] }}>
                    <SciFiScene />
                </Canvas>
            </div>

            {/* Glowing Borders (SVG Overlay to match shape) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polygon 
                    points="50,1 99,25 99,75 50,99 1,75 1,25" 
                    fill="none" 
                    stroke="url(#gradient)" 
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#A855F7" />
                        <stop offset="50%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#A855F7" />
                    </linearGradient>
                </defs>
            </svg>
            
            {/* Tech UI Decorators around Hexagon */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-purple-500 rounded-full shadow-[0_0_10px_#A855F7]" />
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-500 rounded-full shadow-[0_0_10px_#3B82F6]" />
            <div className="absolute top-1/2 -left-6 -translate-y-1/2 w-2 h-12 bg-purple-900/50 rounded-full" />
            <div className="absolute top-1/2 -right-6 -translate-y-1/2 w-2 h-12 bg-purple-900/50 rounded-full" />
        </div>

        {/* Right '4' */}
        <h1 className="number-4 text-[150px] md:text-[250px] font-bold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-purple-400 to-purple-900 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
          4
        </h1>
      </div>

      {/* Bottom Text Content */}
      <div ref={contentRef} className="relative z-10 mt-8 text-center px-4">
        <h2 className="text-2xl md:text-3xl font-medium text-white mb-2 tracking-wide">
          Mission Failed: <span className="text-purple-400">Page Not Found</span>
        </h2>
        <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto mb-8">
          The coordinates you entered point to a void in hyperspace. 
          Please adjust your trajectory.
        </p>

        <button 
          onClick={() => navigate("/")}
          className="group relative inline-flex items-center gap-2 px-8 py-3 bg-transparent overflow-hidden rounded-full transition-all hover:scale-105 active:scale-95"
        >
          {/* Gradient Border */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 p-[2px]">
            <div className="absolute inset-0 rounded-full bg-black" />
          </div>
          
          {/* Button Content */}
          <span className="relative z-10 flex items-center gap-2 text-white font-medium group-hover:text-purple-300 transition-colors">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Return to Home
          </span>
          
          {/* Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-purple-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

    </div>
  );
};

export default NotFound;
