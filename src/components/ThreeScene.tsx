// components/ThreeScene.tsx
import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap';

interface ThreeSceneProps {
  isDarkMode: boolean;
  sceneType?: 'hero' | 'products' | 'categories' | 'features';
  intensity?: number;
}

const ThreeScene = ({ isDarkMode, sceneType = 'hero', intensity = 1 }: ThreeSceneProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationId = useRef<number>();
  const particlesRef = useRef<THREE.Points | null>(null);
  const torusRef = useRef<THREE.Mesh | null>(null);
  const lightsRef = useRef<THREE.PointLight[]>([]);

  const sceneConfigs = useMemo(() => ({
    hero: {
      particles: 5000,
      colors: isDarkMode 
        ? [0x4f46e5, 0x7c3aed, 0x06b6d4]
        : [0x3b82f6, 0x8b5cf6, 0x10b981],
      speed: 0.002,
      geometry: 'sphere'
    },
    products: {
      particles: 3000,
      colors: isDarkMode 
        ? [0xf97316, 0xf59e0b, 0x84cc16]
        : [0xec4899, 0x8b5cf6, 0x3b82f6],
      speed: 0.003,
      geometry: 'torus'
    },
    categories: {
      particles: 4000,
      colors: isDarkMode 
        ? [0x10b981, 0x06b6d4, 0x8b5cf6]
        : [0xef4444, 0xf97316, 0xeab308],
      speed: 0.0015,
      geometry: 'box'
    },
    features: {
      particles: 2000,
      colors: isDarkMode 
        ? [0x8b5cf6, 0xec4899, 0xf43f5e]
        : [0x06b6d4, 0x3b82f6, 0x8b5cf6],
      speed: 0.0025,
      geometry: 'cylinder'
    }
  }), [isDarkMode]);

  const config = sceneConfigs[sceneType];

  const createParticles = (scene: THREE.Scene) => {
    const particlesGeometry = new THREE.BufferGeometry();
    const count = config.particles;

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      // Random position in a sphere
      const radius = 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = radius * Math.cos(phi);

      // Random color from config
      const colorIndex = Math.floor(Math.random() * config.colors.length);
      const color = new THREE.Color(config.colors[colorIndex]);
      
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05 * intensity,
      vertexColors: true,
      transparent: true,
      opacity: 0.8 * intensity,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    particlesRef.current = particles;
  };

  const createGeometry = (scene: THREE.Scene) => {
    let geometry;
    switch (config.geometry) {
      case 'torus':
        geometry = new THREE.TorusGeometry(3, 1, 16, 100);
        break;
      case 'box':
        geometry = new THREE.BoxGeometry(4, 4, 4);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(2, 2, 4, 32);
        break;
      case 'sphere':
      default:
        geometry = new THREE.SphereGeometry(3, 32, 32);
    }

    const material = new THREE.MeshStandardMaterial({
      color: config.colors[0],
      wireframe: true,
      transparent: true,
      opacity: 0.2 * intensity,
      emissive: config.colors[1],
      emissiveIntensity: 0.1 * intensity
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    torusRef.current = mesh;
  };

  const createLights = (scene: THREE.Scene) => {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(
      isDarkMode ? 0x222222 : 0xffffff,
      0.5 * intensity
    );
    scene.add(ambientLight);

    // Point lights
    const lightColors = [0xffffff, config.colors[0], config.colors[1]];
    lightColors.forEach((color, index) => {
      const light = new THREE.PointLight(color, 0.8 * intensity, 100);
      const angle = (index / lightColors.length) * Math.PI * 2;
      light.position.set(
        Math.cos(angle) * 8,
        5,
        Math.sin(angle) * 8
      );
      scene.add(light);
      lightsRef.current.push(light);

      // Light helper
      if (process.env.NODE_ENV === 'development') {
        const lightHelper = new THREE.PointLightHelper(light, 1);
        scene.add(lightHelper);
      }
    });
  };

  const animateScene = () => {
    if (particlesRef.current) {
      particlesRef.current.rotation.x += 0.0005 * config.speed * 10 * intensity;
      particlesRef.current.rotation.y += 0.001 * config.speed * 10 * intensity;
    }

    if (torusRef.current) {
      torusRef.current.rotation.x += 0.01 * config.speed * intensity;
      torusRef.current.rotation.y += 0.005 * config.speed * intensity;
    }

    lightsRef.current.forEach((light, index) => {
      const time = Date.now() * 0.001;
      const radius = 8;
      const speed = 0.5 + index * 0.2;
      light.position.x = Math.cos(time * speed) * radius;
      light.position.z = Math.sin(time * speed) * radius;
    });

    animationId.current = requestAnimationFrame(animateScene);
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  const handleResize = () => {
    if (cameraRef.current && rendererRef.current && mountRef.current) {
      cameraRef.current.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    }
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 15;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5 * intensity;
    controlsRef.current = controls;

    // Create scene elements
    createParticles(scene);
    createGeometry(scene);
    createLights(scene);

    // Start animation
    animateScene();

    // Handle resize
    window.addEventListener('resize', handleResize);

    // GSAP entrance animation
    gsap.from(camera.position, {
      z: 25,
      duration: 2,
      ease: "power3.out",
    });

    gsap.from(renderer.domElement, {
      opacity: 0,
      duration: 1.5,
      ease: "power2.inOut"
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
      if (mountRef.current && rendererRef.current?.domElement) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      controlsRef.current?.dispose();
      rendererRef.current?.dispose();
      
      // Dispose geometries and materials
      if (particlesRef.current) {
        particlesRef.current.geometry.dispose();
        if (Array.isArray(particlesRef.current.material)) {
          particlesRef.current.material.forEach(m => m.dispose());
        } else {
          particlesRef.current.material.dispose();
        }
      }
      if (torusRef.current) {
        torusRef.current.geometry.dispose();
        if (Array.isArray(torusRef.current.material)) {
          torusRef.current.material.forEach(m => m.dispose());
        } else {
          torusRef.current.material.dispose();
        }
      }
    };
  }, [isDarkMode, sceneType, intensity]);

  return (
    <div 
      ref={mountRef} 
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
};

export default ThreeScene;