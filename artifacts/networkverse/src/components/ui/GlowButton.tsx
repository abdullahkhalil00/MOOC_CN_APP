import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface GlowButtonProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  text: string;
  onClick: () => void;
  color?: string;
}

export function GlowButton({ position = [0, 0, 0], rotation = [0, 0, 0], text, onClick, color = '#38bdf8' }: GlowButtonProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const targetScale = useRef(1);

  useFrame((state, delta) => {
    if (meshRef.current) {
      targetScale.current = hovered ? 1.05 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale.current, targetScale.current, targetScale.current), 10 * delta);
      
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, hovered ? 1 : 0.5, 10 * delta);
    }
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <planeGeometry args={[1, 0.4]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
          roughness={0.2}
          metalness={0.1}
        />
        <Html transform center distanceFactor={2} zIndexRange={[100, 0]} pointerEvents="none">
          <div className={`px-4 py-2 font-mono font-bold tracking-widest pointer-events-none transition-colors duration-200 ${hovered ? 'text-white' : 'text-slate-900'}`} style={{ textShadow: hovered ? `0 0 10px ${color}` : 'none' }}>
            {text}
          </div>
        </Html>
      </mesh>
    </group>
  );
}
