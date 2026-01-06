// components/ThreeScene.tsx
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface ThreeSceneProps {
  onReady: () => void;
  theme: string;
}

const ThreeScene = ({ onReady, theme }: ThreeSceneProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationIdRef = useRef<number>();

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
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Create audio gear 3D objects
    const createHeadphone = () => {
      const group = new THREE.Group();

      // Ear cups
      const earGeometry = new THREE.TorusGeometry(1, 0.3, 16, 100);
      const earMaterial = new THREE.MeshStandardMaterial({ 
        color: theme === 'dark' ? 0x6666ff : 0x3366ff,
        metalness: 0.7,
        roughness: 0.2
      });

      const leftEar = new THREE.Mesh(earGeometry, earMaterial);
      leftEar.position.x = -1.5;
      group.add(leftEar);

      const rightEar = new THREE.Mesh(earGeometry, earMaterial);
      rightEar.position.x = 1.5;
      group.add(rightEar);

      // Headband
      const headbandGeometry = new THREE.TorusGeometry(2, 0.1, 8, 100, Math.PI);
      const headband = new THREE.Mesh(headbandGeometry, earMaterial);
      headband.rotation.x = Math.PI / 2;
      headband.position.y = 1.2;
      group.add(headband);

      return group;
    };

    const createSpeaker = () => {
      const group = new THREE.Group();

      // Speaker body
      const bodyGeometry = new THREE.CylinderGeometry(1, 1.2, 1.5, 32);
      const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: theme === 'dark' ? 0xff6666 : 0xff3366,
        metalness: 0.6,
        roughness: 0.3
      });

      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      group.add(body);

      // Speaker cone
      const coneGeometry = new THREE.ConeGeometry(0.6, 0.4, 32);
      const coneMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333,
        metalness: 0.9,
        roughness: 0.1
      });

      const cone = new THREE.Mesh(coneGeometry, coneMaterial);
      cone.position.y = 0.3;
      group.add(cone);

      return group;
    };

    // Add objects to scene
    const headphone = createHeadphone();
    headphone.position.x = -2.5;
    headphone.position.y = 1;
    scene.add(headphone);

    const speaker = createSpeaker();
    speaker.position.x = 2.5;
    speaker.position.y = -1;
    scene.add(speaker);

    // Add floating particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: theme === 'dark' ? 0x8888ff : 0x4488ff,
      transparent: true,
      opacity: 0.6
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Animation
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      headphone.rotation.y += 0.01;
      headphone.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;

      speaker.rotation.y -= 0.008;
      speaker.position.y = -1 + Math.sin(Date.now() * 0.002) * 0.2;

      particlesMesh.rotation.y += 0.001;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();
    onReady();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;

      cameraRef.current.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && rendererRef.current?.domElement) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, [theme, onReady]);

  return (
    <div 
      ref={mountRef} 
      className="absolute inset-0"
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default ThreeScene;