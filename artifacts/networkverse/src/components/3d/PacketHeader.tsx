import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { HeaderData } from '../../store/simulationStore';

interface PacketHeaderProps {
  header: HeaderData;
  index: number;
  totalHeaders: number;
}

export function PacketHeader({ header, index, totalHeaders }: PacketHeaderProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [selectedField, setSelectedField] = useState<number | null>(null);
  const spawnProgress = useRef(0);

  // The size grows as we add more outer headers
  const size = 0.3 + (index + 1) * 0.15;
  const targetScale = expanded ? 1.2 : 1;
  const targetX = expanded ? 0.5 + index * 0.4 : 0;

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Grow the header in from nothing when it is first attached to the packet
      spawnProgress.current = Math.min(1, spawnProgress.current + delta * 2.2);
      const spawnEase = 1 - Math.pow(1 - spawnProgress.current, 3);

      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, delta * 4);
      const scale = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, delta * 4) * spawnEase;
      meshRef.current.scale.set(scale, scale, scale);
      
      if (expanded) {
        meshRef.current.rotation.y += delta * 0.2;
      }
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(!expanded);
          if (expanded) setSelectedField(null);
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial 
          color={header.color}
          emissive={header.color}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          transparent
          opacity={0.3}
          wireframe
        />
        
        {/* Outer solid edges to make it look like a shell */}
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(size, size, size)]} />
          <lineBasicMaterial color={header.color} transparent opacity={0.8} />
        </lineSegments>

        {(hovered || expanded) && (
          <Html position={[size/2 + 0.1, size/2, 0]} zIndexRange={[100, 0]} distanceFactor={3}>
            <div className="glass-panel p-3 rounded shadow-lg min-w-[220px]" style={{ borderColor: header.color }}>
              <div className="font-bold mb-2 text-sm" style={{ color: header.color }}>{header.name}</div>
              {expanded && (
                <div className="space-y-1 text-xs text-slate-300 font-mono">
                  {header.fields.map((field, i) => (
                    <div key={i}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedField(selectedField === i ? null : i);
                        }}
                        className={`w-full flex justify-between border-b border-slate-700/50 pb-1 pt-1 text-left transition-colors ${
                          field.explanation ? 'hover:text-white cursor-pointer' : 'cursor-default'
                        } ${selectedField === i ? 'text-white' : ''}`}
                      >
                        <span className="opacity-70">{field.label}:</span>
                        <span>{field.value}</span>
                      </button>
                      {selectedField === i && field.explanation && (
                        <div
                          className="text-[11px] text-slate-400 font-sans italic py-1.5 pl-1 border-l-2"
                          style={{ borderColor: header.color }}
                        >
                          {field.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {!expanded && (
                <div className="text-xs text-slate-400 italic">Click to inspect</div>
              )}
            </div>
          </Html>
        )}
      </mesh>
    </group>
  );
}
