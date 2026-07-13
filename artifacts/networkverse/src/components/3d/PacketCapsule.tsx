import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimStore } from '../../store/simulationStore';
import { atOrPast, before, getPacketTarget } from '../../lib/stepConfig';
import { LAYER_COLORS } from '../../lib/protocolData';

// ─── Layer identity colors (aligned with World.tsx) ─────────────────────────
const LAYER_GLOW = {
  app: '#818cf8',   // Application
  transport: '#34d399',   // Transport (TCP)
  udp: '#f59e0b',   // Transport (UDP)
  ip: '#fb923c',   // Network / IP
  ethernet: '#fbbf24',   // Data Link
  crc: '#f87171',   // Physical / CRC
};

// ─── Trail particle system ────────────────────────────────────────────────────
function PacketTrail({ parentPos }: { parentPos: React.RefObject<THREE.Vector3> }) {
  const count = 28;
  const geoRef = useRef<THREE.BufferGeometry>(null);
  const positions = useMemo(() => new Float32Array(count * 3), []);
  const ages = useMemo(() => new Float32Array(count), []);
  const speeds = useMemo(() => new Float32Array(count).map(() => 0.03 + Math.random() * 0.06), []);
  let head = 0;

  useFrame((_, delta) => {
    if (!geoRef.current || !parentPos.current) return;
    const pp = parentPos.current;

    // spawn new trail point at packet position
    positions[head * 3 + 0] = pp.x + (Math.random() - 0.5) * 0.06;
    positions[head * 3 + 1] = pp.y + (Math.random() - 0.5) * 0.06;
    positions[head * 3 + 2] = pp.z + (Math.random() - 0.5) * 0.06;
    ages[head] = 1.0;
    head = (head + 1) % count;

    // age + drift up
    for (let i = 0; i < count; i++) {
      ages[i] = Math.max(0, ages[i] - delta * speeds[i] * 4);
      positions[i * 3 + 1] += delta * 0.04;
    }

    geoRef.current.attributes.position.needsUpdate = true;
    geoRef.current.setDrawRange(0, count);
  });

  return (
    <points>
      <bufferGeometry ref={geoRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05} color="#818cf8" transparent opacity={0.65}
        sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false}
      />
    </points>
  );
}

// ─── Animated shell layer ─────────────────────────────────────────────────────
function Shell({ radius, height, color, show, layerIdx }: {
  radius: number; height: number; color: string; show: boolean;
  layerIdx: number; depthTest?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetOpacity = show ? 0.38 : 0;
  const targetScale = show ? 1 : 0.15;

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, delta * 6);

    const s = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, delta * 6);
    meshRef.current.scale.set(s, s, s);

    // Unique pulse per layer
    if (show) {
      mat.emissiveIntensity = 0.45 + Math.sin(state.clock.elapsedTime * 2.2 + layerIdx * 1.2) * 0.25;
    }
  });

  return (
    <mesh ref={meshRef}>
      <capsuleGeometry args={[radius, height, 6, 24]} />
      <meshStandardMaterial
        color={color} emissive={color} emissiveIntensity={0.45}
        transparent opacity={0}
        roughness={0.05} metalness={0.15}
        side={THREE.FrontSide} depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// ─── CRC ring ─────────────────────────────────────────────────────────────────
function CrcRing({ show }: { show: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, show ? 0.85 : 0, delta * 5);
    if (show) meshRef.current.rotation.y += delta * 1.8;
  });
  return (
    <mesh ref={meshRef} position={[0, -0.55, 0]}>
      <torusGeometry args={[0.4, 0.028, 8, 48]} />
      <meshStandardMaterial
        color={LAYER_GLOW.crc} emissive={LAYER_GLOW.crc}
        emissiveIntensity={1.4} transparent opacity={0}
        depthWrite={false} blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// ─── Outer energy sphere aura ─────────────────────────────────────────────────
function PacketAura({ active, errorActive, color }: {
  active: boolean; errorActive: boolean; color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.3 + 0.7;
    mat.emissiveIntensity = errorActive ? 3 + Math.sin(state.clock.elapsedTime * 14) * 2 : pulse * 0.8;
    mat.emissive.setStyle(errorActive ? '#ef4444' : color);
    const s = 1 + (errorActive ? 0.3 : 0.1) * Math.sin(state.clock.elapsedTime * 3);
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, active ? s : 0, delta * 5));
  });
  return (
    <mesh ref={meshRef} scale={0}>
      <sphereGeometry args={[0.55, 18, 18]} />
      <meshStandardMaterial
        color={color} emissive={color} emissiveIntensity={0.8}
        transparent opacity={0.06} depthWrite={false}
        blending={THREE.AdditiveBlending} side={THREE.FrontSide}
      />
    </mesh>
  );
}

// ─── Orbital rings ────────────────────────────────────────────────────────────
function OrbitalRing({ radius, color, speed, tilt }: {
  radius: number; color: string; speed: number; tilt: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.z += delta * speed;
  });
  return (
    <mesh ref={meshRef} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.012, 4, 60]} />
      <meshStandardMaterial
        color={color} emissive={color} emissiveIntensity={1.2}
        transparent opacity={0.55} depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// ─── Main PacketCapsule ───────────────────────────────────────────────────────
export function PacketCapsule() {
  const step = useSimStore((s) => s.step);
  const ethernetDecapped = useSimStore((s) => s.ethernetDecapped);
  const errorActive = useSimStore((s) => s.errorActive);
  const protocol = useSimStore((s) => s.protocol);

  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const light2Ref = useRef<THREE.PointLight>(null);
  const targetPos = useRef(new THREE.Vector3(-5, 1.5, 0));
  const currentPos = useRef(new THREE.Vector3(-5, 1.5, 0));

  const showApp = atOrPast(step, 'ENCAP_APP') && before(step, 'DECAP_APP');
  const showTransport = atOrPast(step, 'ENCAP_TRANSPORT') && before(step, 'DECAP_TRANSPORT');
  const showInternet = atOrPast(step, 'ENCAP_INTERNET') && before(step, 'DECAP_INTERNET');
  const showEthernet = atOrPast(step, 'ENCAP_NETWORK') && before(step, 'DECAP_NETWORK') && !ethernetDecapped;
  const showCrc = showEthernet;

  const totalLayers = [showApp, showTransport, showInternet, showEthernet].filter(Boolean).length;
  const isMoving = ['TRAVEL_TO_R1', 'TRAVEL_TO_R2', 'TRAVEL_ISP', 'TRAVEL_DEST'].includes(step);

  // Main color aura based on outermost layer
  const auraColor = showEthernet
    ? LAYER_GLOW.ethernet
    : showInternet
      ? LAYER_GLOW.ip
      : showTransport
        ? (protocol === 'TCP' ? LAYER_GLOW.transport : LAYER_GLOW.udp)
        : LAYER_GLOW.app;

  useFrame((state, delta) => {
    if (!groupRef.current || step === 'IDLE') return;

    const newTarget = getPacketTarget(step);
    targetPos.current.lerp(newTarget, delta * 1.6);
    currentPos.current.copy(targetPos.current);
    groupRef.current.position.copy(targetPos.current);

    // Gentle float on Y
    groupRef.current.position.y = targetPos.current.y + Math.sin(state.clock.elapsedTime * 2.2) * 0.06;

    // Rotation — faster when traveling
    const rotSpeed = isMoving ? 0.65 : 0.25;
    groupRef.current.rotation.y += delta * rotSpeed;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.7) * 0.08;

    // Pulsing point light
    if (lightRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2.8) * 0.5 + 1.2;
      lightRef.current.intensity = errorActive ? 8 : pulse * (3 + totalLayers * 0.5);
      lightRef.current.color.setStyle(errorActive ? '#ef4444' : auraColor);
    }
    if (light2Ref.current) {
      light2Ref.current.intensity = errorActive ? 4 : 1.2;
      light2Ref.current.color.setStyle(errorActive ? '#ff0000' : auraColor);
    }

    // Core sphere
    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      if (errorActive) {
        const t = Math.sin(state.clock.elapsedTime * 14) * 0.5 + 0.5;
        mat.emissive.setStyle(t > 0.5 ? '#ef4444' : '#ffffff');
        mat.emissiveIntensity = 5 + t * 6;
      } else {
        mat.emissive.setStyle(auraColor);
        mat.emissiveIntensity = 4 + Math.sin(state.clock.elapsedTime * 3) * 1;
      }
    }
  });

  if (step === 'IDLE') return null;

  const transportColor = protocol === 'TCP' ? LAYER_GLOW.transport : LAYER_GLOW.udp;

  return (
    <group ref={groupRef}>
      {/* Dynamic point lights */}
      <pointLight ref={lightRef} intensity={3} distance={4} color={auraColor} />
      <pointLight ref={light2Ref} intensity={1.2} distance={2} color={auraColor} position={[0, 0.4, 0]} />

      {/* Trail particles */}
      <PacketTrail parentPos={currentPos} />

      {/* Outer energy aura sphere */}
      <PacketAura active={!errorActive} errorActive={errorActive} color={auraColor} />

      {/* Orbital rings (when at least 2 shells) */}
      {showTransport && (
        <OrbitalRing radius={0.44} color={transportColor} speed={1.0} tilt={0.5} />
      )}
      {showInternet && (
        <OrbitalRing radius={0.56} color={LAYER_GLOW.ip} speed={-0.65} tilt={1.0} />
      )}
      {showEthernet && (
        <OrbitalRing radius={0.68} color={LAYER_GLOW.ethernet} speed={0.5} tilt={1.5} />
      )}

      {/* Core payload — bright hot sphere */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.08, 18, 18]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={auraColor}
          emissiveIntensity={4}
          roughness={0.0}
          metalness={0.0}
        />
      </mesh>

      {/* ── Protocol shells (outermost = furthest in stack) ── */}

      {/* Application shell — indigo/violet */}
      <Shell
        radius={0.15} height={0.10}
        color={LAYER_GLOW.app}
        show={showApp} layerIdx={0}
      />

      {/* Transport shell — green (TCP) / amber (UDP) */}
      <Shell
        radius={0.22} height={0.18}
        color={transportColor}
        show={showTransport} layerIdx={1}
      />

      {/* Internet / IP shell — orange */}
      <Shell
        radius={0.30} height={0.27}
        color={LAYER_GLOW.ip}
        show={showInternet} layerIdx={2}
      />

      {/* Ethernet shell — amber/yellow */}
      <Shell
        radius={0.38} height={0.36}
        color={LAYER_GLOW.ethernet}
        show={showEthernet} layerIdx={3}
      />

      {/* CRC ring — red */}
      <CrcRing show={showCrc} />

      {/* Error lightning sparks */}
      {errorActive && [0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[
          Math.sin(i * 1.26) * 0.5,
          Math.cos(i * 0.9) * 0.4,
          Math.sin(i * 2.1) * 0.4,
        ]}>
          <sphereGeometry args={[0.018, 6, 6]} />
          <meshStandardMaterial
            color="#ef4444" emissive="#ef4444" emissiveIntensity={5}
            transparent opacity={0.85}
          />
        </mesh>
      ))}
    </group>
  );
}
