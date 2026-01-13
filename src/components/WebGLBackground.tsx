import { useEffect, useRef } from 'react';
import { WebGLParticleSystem } from '@/lib/webgl/particles';

interface WebGLBackgroundProps {
  particleCount?: number;
  interactive?: boolean;
  performance?: 'low' | 'medium' | 'high';
}

const WebGLBackground = ({ 
  particleCount = 1000, 
  interactive = true,
  performance = 'medium' 
}: WebGLBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleSystemRef = useRef<WebGLParticleSystem | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const initParticles = async () => {
      const { WebGLParticleSystem } = await import('@/lib/webgl/particles');
      
      particleSystemRef.current = new WebGLParticleSystem({
        canvas: canvasRef.current!,
        particleCount,
        interactive,
        performance,
        colors: ['#ffffff', '#60a5fa', '#a78bfa'],
        opacity: 0.15
      });

      particleSystemRef.current.start();
    };

    initParticles();

    return () => {
      if (particleSystemRef.current) {
        particleSystemRef.current.destroy();
      }
    };
  }, [particleCount, interactive, performance]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
      }}
    />
  );
};

export default WebGLBackground;
