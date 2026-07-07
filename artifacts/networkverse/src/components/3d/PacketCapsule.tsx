import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimStore } from '../../store/simulationStore';
import { atOrPast, before, getPacketTarget, STEP_ORDER } from '../../lib/stepConfig';
import { LAYER_COLORS } from '../../lib/protocolData';

// Individual colored shell that animates in/out
function Shell({ radius, height, color, show, depthTest = true }: {
  radius: number; height: number; color: string; show: boolean; depthTest?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetOpacity = show ? 0.32 : 0;
  const targetScale = show ? 1 : 0.2;

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, delta * 5);
    const s = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, delta * 5);
    meshRef.current.scale.set(s, s, s);
    mat.depthTest = depthTest;
  });

  return (
    <mesh ref={meshRef}>
      <capsuleGeometry args={[radius, height, 5, 20]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.55}
        transparent
        opacity={0}
        roughness={0.05}
        metalness={0.1}
        side={THREE.FrontSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// Glowing ring for CRC trailer
function CrcRing({ show }: { show: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, show ? 0.7 : 0, delta * 5);
  });

  return (
    <mesh ref={meshRef} position={[0, -0.52, 0]}>
      <torusGeometry args={[0.38, 0.025, 8, 40]} />
      <meshStandardMaterial
        color={LAYER_COLORS.crc}
        emissive={LAYER_COLORS.crc}
        emissiveIntensity={1.2}
        transparent
        opacity={0}
        depthWrite={false}
      />
    </mesh>
  );
}

export function PacketCapsule() {
  const step = useSimStore((s) => s.step);
  const ethernetDecapped = useSimStore((s) => s.ethernetDecapped);
  const errorActive = useSimStore((s) => s.errorActive);
  const protocol = useSimStore((s) => s.protocol);

  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const targetPos = useRef(new THREE.Vector3(-5, 1.5, 0));

  const showApp = atOrPast(step, 'ENCAP_APP') && before(step, 'DECAP_APP');
  const showTransport = atOrPast(step, 'ENCAP_TRANSPORT') && before(step, 'DECAP_TRANSPORT');
  const showInternet = atOrPast(step, 'ENCAP_INTERNET') && before(step, 'DECAP_INTERNET');
  const showEthernet = atOrPast(step, 'ENCAP_NETWORK') && before(step, 'DECAP_NETWORK') && !ethernetDecapped;
  const showCrc = showEthernet;

  useFrame((state, delta) => {
    if (!groupRef.current || step === 'IDLE') return;

    // Update target position from step
    const newTarget = getPacketTarget(step);
    targetPos.current.lerp(newTarget, delta * 1.8);
    groupRef.current.position.copy(targetPos.current);

    // Slow rotation
    groupRef.current.rotation.y += delta * 0.35;

    // Pulsing glow
    if (lightRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2.5) * 0.4 + 1.2;
      lightRef.current.intensity = errorActive ? 6 : pulse * 1.8;
      lightRef.current.color.setStyle(errorActive ? '#ef4444' : '#38bdf8');
    }

    // Core flash on error
    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      if (errorActive) {
        const t = Math.sin(state.clock.elapsedTime * 12) * 0.5 + 0.5;
        mat.emissive.setStyle(t > 0.5 ? '#ef4444' : '#38bdf8');
        mat.emissiveIntensity = 4 + t * 4;
      } else {
        mat.emissive.setStyle('#38bdf8');
        mat.emissiveIntensity = 3;
      }
    }
  });

  if (step === 'IDLE') return null;

  const transportColor = protocol === 'TCP' ? LAYER_COLORS.tcp : LAYER_COLORS.udp;

  return (
    <group ref={groupRef}>
      <pointLight ref={lightRef} intensity={1.8} distance={3} color="#38bdf8" />

      {/* Core payload — glowing cyan sphere */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#38bdf8"
          emissiveIntensity={3}
          roughness={0.1}
        />
      </mesh>

      {/* Application shell — Blue */}
      <Shell radius={0.14} height={0.1} color={LAYER_COLORS.app} show={showApp} />

      {/* Transport shell — Green (TCP) / Amber (UDP) */}
      <Shell radius={0.21} height={0.18} color={transportColor} show={showTransport} />

      {/* Internet / IP shell — Orange */}
      <Shell radius={0.28} height={0.26} color={LAYER_COLORS.internet} show={showInternet} />

      {/* Ethernet shell — Purple */}
      <Shell radius={0.35} height={0.34} color={LAYER_COLORS.ethernet} show={showEthernet} />

      {/* CRC ring — Red */}
      <CrcRing show={showCrc} />
    </group>
  );
}
