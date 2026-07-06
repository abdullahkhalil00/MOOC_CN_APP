import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import { HeaderData } from '../../store/simulationStore';
import { PacketHeader } from './PacketHeader';

interface DataPacketProps {
  headers: HeaderData[];
  baseColor?: string;
}

export function DataPacket({ headers, baseColor = '#06b6d4' }: DataPacketProps) {
  const groupRef = useRef<THREE.Group>(null);
  const payloadRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (payloadRef.current) {
      payloadRef.current.rotation.y += delta * 0.5;
      payloadRef.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group ref={groupRef}>
        {/* Core Payload */}
        <mesh
          ref={payloadRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial 
            color={baseColor} 
            emissive={baseColor}
            emissiveIntensity={0.8}
            transparent
            opacity={0.9}
            roughness={0.1}
          />
        </mesh>

        {hovered && (
          <Html position={[0, 0.3, 0]} center zIndexRange={[100, 0]} distanceFactor={3}>
            <div className="glass-panel px-3 py-1 rounded text-cyan-200 text-sm whitespace-nowrap border-cyan-500/30">
              Raw Data Payload
            </div>
          </Html>
        )}

        {/* Dynamic Headers */}
        {headers.map((header, index) => (
          <PacketHeader 
            key={header.id} 
            header={header} 
            index={index} 
            totalHeaders={headers.length} 
          />
        ))}
      </group>
    </Float>
  );
}
