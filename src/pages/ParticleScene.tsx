import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ParticleSceneProps {
  currentGender: 'male' | 'female' | null;
}

const ParticleScene = ({ currentGender }: ParticleSceneProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  
  // Particle data definitions
  const manPositions = useRef<Float32Array>(new Float32Array());
  const womanPositions = useRef<Float32Array>(new Float32Array());
  const currentPositions = useRef<Float32Array>(new Float32Array());
  const targetPositions = useRef<Float32Array>(new Float32Array());

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    camera.position.z = 20;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Particle system
    const particleCount = 20000;
    const geometry = new THREE.BufferGeometry();
    
    // Create initial positions arrays
    currentPositions.current = new Float32Array(particleCount * 3);
    targetPositions.current = new Float32Array(particleCount * 3);
    manPositions.current = new Float32Array(particleCount * 3);
    womanPositions.current = new Float32Array(particleCount * 3);

    // Generate shapes for male and female
    generateMaleShape(manPositions.current);
    generateFemaleShape(womanPositions.current);
    
    // Set initial positions
    for (let i = 0; i < particleCount * 3; i++) {
      currentPositions.current[i] = manPositions.current[i];
      targetPositions.current[i] = manPositions.current[i];
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(currentPositions.current, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });
    
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Animation logic
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      // Smooth transition between positions
      for (let i = 0; i < particleCount * 3; i++) {
        currentPositions.current[i] += (targetPositions.current[i] - currentPositions.current[i]) * 0.03;
      }

      geometry.attributes.position.needsUpdate = true;
      
      // Gentle rotation
      particles.rotation.y += 0.002;
      particles.rotation.x = Math.sin(Date.now() * 0.0005) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // Handle gender change
    const handleGenderChange = () => {
      if (!currentGender) return;
      
      if (currentGender === 'male') {
        // Transition to male shape
        for (let i = 0; i < particleCount * 3; i++) {
          targetPositions.current[i] = manPositions.current[i];
        }
        // Change color to blue
        (material as THREE.PointsMaterial).color.set(0x3b82f6);
      } else {
        // Transition to female shape
        for (let i = 0; i < particleCount * 3; i++) {
          targetPositions.current[i] = womanPositions.current[i];
        }
        // Change color to pink
        (material as THREE.PointsMaterial).color.set(0xec4899);
      }
    };

    handleGenderChange();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  // Update animation when gender changes
  useEffect(() => {
    if (!currentGender) return;

    // This effect handles the gender change transition
    const transitionToGender = () => {
      if (currentGender === 'male') {
        for (let i = 0; i < targetPositions.current.length; i++) {
          targetPositions.current[i] = manPositions.current[i];
        }
      } else {
        for (let i = 0; i < targetPositions.current.length; i++) {
          targetPositions.current[i] = womanPositions.current[i];
        }
      }
    };

    transitionToGender();
  }, [currentGender]);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full absolute inset-0"
      style={{ background: 'linear-gradient(135deg, var(--background) 0%, transparent 100%)' }}
    />
  );
};

// Helper functions to generate shapes
const generateMaleShape = (positions: Float32Array) => {
  const particleCount = positions.length / 3;
  
  for (let i = 0; i < particleCount; i++) {
    const index = i * 3;
    
    // Create a more defined male silhouette (broader shoulders)
    const radius = 4 + Math.random() * 0.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    // Modify shape for broader shoulders
    let shoulderFactor = 1;
    if (phi < Math.PI / 3) {
      shoulderFactor = 1.5; // Broader shoulders
    } else if (phi > (2 * Math.PI) / 3) {
      shoulderFactor = 1.2; // Slightly narrower waist
    }
    
    positions[index] = Math.sin(phi) * Math.cos(theta) * radius * shoulderFactor;
    positions[index + 1] = Math.cos(phi) * radius * 1.1; // Taller
    positions[index + 2] = Math.sin(phi) * Math.sin(theta) * radius;
  }
};

const generateFemaleShape = (positions: Float32Array) => {
  const particleCount = positions.length / 3;
  
  for (let i = 0; i < particleCount; i++) {
    const index = i * 3;
    
    // Create a more defined female silhouette (hourglass shape)
    const radius = 3.5 + Math.random() * 0.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    // Create hourglass shape
    let shapeFactor = 1;
    const normalizedY = Math.cos(phi); // -1 to 1
    
    if (normalizedY > 0.3) {
      // Upper body - slightly narrower
      shapeFactor = 0.8;
    } else if (normalizedY > -0.3) {
      // Waist - narrower
      shapeFactor = 0.6;
    } else {
      // Lower body - slightly wider
      shapeFactor = 0.9;
    }
    
    positions[index] = Math.sin(phi) * Math.cos(theta) * radius * shapeFactor;
    positions[index + 1] = Math.cos(phi) * radius;
    positions[index + 2] = Math.sin(phi) * Math.sin(theta) * radius * shapeFactor;
  }
};

export default ParticleScene;
