import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface ProtocolCardProps {
  position?: [number, number, number];
  title: string;
  subtitle: string;
  features: string[];
  color: string;
  selected?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

export function ProtocolCard({
  position = [0, 0, 0],
  title,
  subtitle,
  features,
  color,
  selected = false,
  disabled = false,
  onSelect,
}: ProtocolCardProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const baseY = position[1];

  useFrame((state, delta) => {
    if (!groupRef.current || !meshRef.current) return;

    const targetScale = selected ? 1.15 : hovered ? 1.08 : 1;
    const scale = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, delta * 6);
    groupRef.current.scale.set(scale, scale, scale);

    const hoverLift = hovered || selected ? 0.05 : 0;
    const floatOffset = Math.sin(state.clock.elapsedTime * 1.5 + position[0]) * 0.02;
    groupRef.current.position.y = baseY + hoverLift + floatOffset;

    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    const targetEmissive = selected ? 1.1 : hovered ? 0.8 : 0.35;
    material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, targetEmissive, delta * 6);
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) onSelect();
        }}
        onPointerOver={() => !disabled && setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <planeGeometry args={[1.1, 1.4]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.35}
          transparent
          opacity={selected ? 0.35 : 0.18}
          roughness={0.2}
          metalness={0.1}
          side={THREE.DoubleSide}
        />

        <Html transform position={[0, 0, 0.01]} distanceFactor={2} zIndexRange={[60, 0]} center pointerEvents="none">
          <div
            className="glass-panel rounded-2xl p-5 w-[260px] pointer-events-none transition-all duration-200"
            style={{
              borderColor: color,
              boxShadow: selected ? `0 0 30px ${color}80` : hovered ? `0 0 18px ${color}50` : 'none',
            }}
          >
            <div className="text-xl font-bold tracking-wide mb-1" style={{ color }}>{title}</div>
            <div className="text-xs text-slate-300 mb-4">{subtitle}</div>
            <ul className="space-y-1.5">
              {features.map((f) => (
                <li key={f} className="text-xs text-slate-200 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  {f}
                </li>
              ))}
            </ul>
            {selected && (
              <div className="mt-3 text-[10px] uppercase tracking-widest font-bold" style={{ color }}>
                Selected
              </div>
            )}
          </div>
        </Html>
      </mesh>
    </group>
  );
}
