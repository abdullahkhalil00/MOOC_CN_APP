import { useEffect, useRef, useMemo } from 'react';
import { CameraControls, Line, Html, Stars } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimStore } from '../../store/simulationStore';
import { CAMERA_PRESETS } from '../../lib/stepConfig';

// ─── Layer identity colors ───────────────────────────────────────────────────
const LAYER = {
  app: '#818cf8',   // indigo/violet  — Application
  transport: '#34d399',   // emerald         — Transport
  network: '#fb923c',   // orange          — Network / IP
  datalink: '#fbbf24',   // amber           — Data Link
  physical: '#f87171',   // red             — Physical
  cable: '#38bdf8',   // sky blue        — cables / neutral
};

// ─── Device labels ────────────────────────────────────────────────────────────
function DeviceLabel({ children, color = 'rgba(148,163,184,0.9)' }: {
  children: React.ReactNode; color?: string;
}) {
  return (
    <Html center position={[0, -0.28, 0]}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '9px',
        color,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        textShadow: `0 0 10px ${color}`,
        padding: '3px 8px',
        background: 'rgba(4,10,30,0.75)',
        borderRadius: '6px',
        border: `1px solid ${color}40`,
      }}>{children}</div>
    </Html>
  );
}

// ─── Status Light ─────────────────────────────────────────────────────────────
function StatusLight({ color, on, offset }: { color: string; on: boolean; offset: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = on
      ? Math.sin(state.clock.elapsedTime * 4 + offset[0] * 3) * 0.4 + 0.8
      : 0.1;
  });
  return (
    <mesh ref={meshRef} position={offset}>
      <cylinderGeometry args={[0.022, 0.022, 0.035, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
    </mesh>
  );
}

// ─── Holo Ring around device base ────────────────────────────────────────────
function HoloRing({ color, active }: { color: string; active: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    const t = Math.sin(state.clock.elapsedTime * 2) * 0.4 + 0.6;
    mat.emissiveIntensity = active ? t * 1.4 : 0.15;
    mat.opacity = active ? 0.7 : 0.15;
    if (meshRef.current) meshRef.current.rotation.z += 0.008;
  });
  return (
    <mesh ref={meshRef} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.7, 0.025, 6, 64]} />
      <meshStandardMaterial
        color={color} emissive={color} emissiveIntensity={0.3}
        transparent opacity={0.15} depthWrite={false}
      />
    </mesh>
  );
}

// ─── Laptop ───────────────────────────────────────────────────────────────────
function Laptop({ position, label, active, complete }: {
  position: [number, number, number]; label: string; active: boolean; complete?: boolean;
}) {
  const screenColor = complete ? LAYER.transport : active ? LAYER.app : '#000a1a';
  const screenEmissive = complete ? LAYER.transport : active ? LAYER.app : '#000820';
  const screenIntensity = complete ? 0.9 : active ? 0.45 : 0.04;

  return (
    <group position={position}>
      <HoloRing color={complete ? LAYER.transport : LAYER.app} active={active || !!complete} />

      {/* Base — dark brushed aluminum */}
      <mesh position={[0, 0.045, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.07, 0.75]} />
        <meshStandardMaterial color="#1a2540" metalness={0.85} roughness={0.2}
          envMapIntensity={1.2} />
      </mesh>

      {/* Keyboard area glow strip */}
      <mesh position={[0, 0.083, -0.08]}>
        <planeGeometry args={[0.9, 0.55]} />
        <meshStandardMaterial
          color={active ? LAYER.app : '#0a0f20'}
          emissive={active ? LAYER.app : '#000'}
          emissiveIntensity={active ? 0.08 : 0}
          transparent opacity={0.25} depthWrite={false}
        />
      </mesh>

      {/* Hinge */}
      <mesh position={[0, 0.075, -0.365]}>
        <boxGeometry args={[1.06, 0.022, 0.033]} />
        <meshStandardMaterial color="#0d1324" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Screen lid */}
      <group position={[0, 0.075, -0.355]} rotation={[-Math.PI * 0.09, 0, 0]}>
        <mesh position={[0, 0.385, 0]} castShadow>
          <boxGeometry args={[1.05, 0.72, 0.058]} />
          <meshStandardMaterial color="#1a2540" metalness={0.85} roughness={0.2} />
        </mesh>
        {/* Screen surface */}
        <mesh position={[0, 0.385, 0.031]}>
          <planeGeometry args={[0.96, 0.63]} />
          <meshStandardMaterial
            color={screenColor}
            emissive={screenEmissive}
            emissiveIntensity={screenIntensity}
          />
        </mesh>
        {/* Screen glow outer */}
        {active && (
          <mesh position={[0, 0.385, 0.03]}>
            <planeGeometry args={[1.1, 0.73]} />
            <meshStandardMaterial
              color={LAYER.app} emissive={LAYER.app} emissiveIntensity={0.15}
              transparent opacity={0.06} depthWrite={false}
            />
          </mesh>
        )}
        {/* Apple-style logo */}
        <mesh position={[0, 0.385, -0.031]}>
          <circleGeometry args={[0.07, 12]} />
          <meshStandardMaterial
            color={active ? LAYER.app : '#1e293b'}
            emissive={active ? LAYER.app : '#000'}
            emissiveIntensity={active ? 0.5 : 0}
          />
        </mesh>
      </group>

      {active && <pointLight intensity={1.2} distance={2.5} color={LAYER.app} position={[0, 1.2, 0.4]} />}
      {complete && <pointLight intensity={2} distance={3} color={LAYER.transport} position={[0, 1.2, 0.4]} />}

      <DeviceLabel color={active ? LAYER.app : 'rgba(148,163,184,0.8)'}>{label}</DeviceLabel>
    </group>
  );
}

// ─── Router Box ───────────────────────────────────────────────────────────────
function RouterBox({ position, label, active }: {
  position: [number, number, number]; label: string; active: boolean;
}) {
  return (
    <group position={position}>
      <HoloRing color={LAYER.network} active={active} />

      {/* Body */}
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.84, 0.29, 0.54]} />
        <meshStandardMaterial color="#0d1a2e" metalness={0.78} roughness={0.28} />
      </mesh>

      {/* Front panel */}
      <mesh position={[0, 0.16, 0.274]}>
        <boxGeometry args={[0.82, 0.27, 0.01]} />
        <meshStandardMaterial color="#0a1525" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Vent slots */}
      {[-0.14, 0, 0.14].map((x) => (
        <mesh key={x} position={[x, 0.16, 0.275]}>
          <boxGeometry args={[0.055, 0.13, 0.005]} />
          <meshStandardMaterial color="#040d1a" />
        </mesh>
      ))}

      {/* Status lights */}
      <StatusLight color={LAYER.transport} on={active} offset={[-0.24, 0.275, 0.275]} />
      <StatusLight color={LAYER.transport} on={active} offset={[-0.12, 0.275, 0.275]} />
      <StatusLight color={LAYER.app} on={active} offset={[0.06, 0.275, 0.275]} />
      <StatusLight color={LAYER.network} on={active} offset={[0.19, 0.275, 0.275]} />

      {/* Top edge glow strip */}
      <mesh position={[0, 0.308, 0.15]}>
        <boxGeometry args={[0.78, 0.006, 0.22]} />
        <meshStandardMaterial
          color={LAYER.network} emissive={LAYER.network}
          emissiveIntensity={active ? 1.8 : 0.3}
          transparent opacity={0.9} depthWrite={false}
        />
      </mesh>

      {active && <pointLight intensity={1.4} distance={2.5} color={LAYER.network} position={[0, 0.5, 0]} />}

      <DeviceLabel color={active ? LAYER.network : 'rgba(148,163,184,0.8)'}>{label}</DeviceLabel>
    </group>
  );
}

// ─── Network Switch ───────────────────────────────────────────────────────────
function NetworkSwitch({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <HoloRing color={LAYER.datalink} active={false} />

      <mesh position={[0, 0.078, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.55, 0.145, 0.44]} />
        <meshStandardMaterial color="#0d1a2e" metalness={0.78} roughness={0.28} />
      </mesh>

      {/* Port holes row */}
      {[-0.52, -0.31, -0.10, 0.10, 0.31, 0.52].map((x, i) => (
        <group key={x}>
          <mesh position={[x, 0.078, 0.226]}>
            <boxGeometry args={[0.105, 0.066, 0.012]} />
            <meshStandardMaterial color="#040d1a" />
          </mesh>
          {/* port LED */}
          <mesh position={[x, 0.115, 0.226]}>
            <boxGeometry args={[0.04, 0.012, 0.005]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? LAYER.transport : LAYER.datalink}
              emissive={i % 2 === 0 ? LAYER.transport : LAYER.datalink}
              emissiveIntensity={0.9}
            />
          </mesh>
        </group>
      ))}

      {/* Top glow strip */}
      <mesh position={[0, 0.158, 0]}>
        <boxGeometry args={[1.5, 0.006, 0.4]} />
        <meshStandardMaterial
          color={LAYER.datalink} emissive={LAYER.datalink}
          emissiveIntensity={0.5} transparent opacity={0.7} depthWrite={false}
        />
      </mesh>

      <DeviceLabel color={LAYER.datalink}>L2 Switch</DeviceLabel>
    </group>
  );
}

// ─── Server Rack ──────────────────────────────────────────────────────────────
function ServerRack({ position }: { position: [number, number, number] }) {
  const lightRef = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.intensity = 0.8 + Math.sin(state.clock.elapsedTime * 1.3) * 0.3;
    }
  });
  return (
    <group position={position}>
      <HoloRing color={LAYER.transport} active={true} />

      <mesh position={[0, 1.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.72, 2.1, 0.68]} />
        <meshStandardMaterial color="#090f1f" metalness={0.92} roughness={0.12} />
      </mesh>

      {/* Server units */}
      {[0.12, 0.42, 0.72, 1.02, 1.32, 1.62, 1.92].map((y, i) => (
        <group key={y}>
          {/* Divider */}
          <mesh position={[0, y, 0.346]}>
            <boxGeometry args={[0.67, 0.006, 0.006]} />
            <meshStandardMaterial color="#1e3a5f" />
          </mesh>
          {/* Status bar */}
          <mesh position={[0.20, y + 0.13, 0.346]}>
            <boxGeometry args={[0.2, 0.044, 0.006]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? LAYER.transport : i % 3 === 1 ? LAYER.app : LAYER.network}
              emissive={i % 3 === 0 ? LAYER.transport : i % 3 === 1 ? LAYER.app : LAYER.network}
              emissiveIntensity={0.95}
            />
          </mesh>
          {/* HDD activity light */}
          <mesh position={[-0.22, y + 0.13, 0.346]}>
            <boxGeometry args={[0.032, 0.032, 0.005]} />
            <meshStandardMaterial
              color={LAYER.physical} emissive={LAYER.physical}
              emissiveIntensity={i % 2 === 0 ? 1.5 : 0.2}
            />
          </mesh>
        </group>
      ))}
      <pointLight ref={lightRef} intensity={0.8} distance={3} color={LAYER.transport} position={[0, 1, 0.5]} />
      <DeviceLabel color={LAYER.transport}>Server Rack</DeviceLabel>
    </group>
  );
}

// ─── ISP Cloud ────────────────────────────────────────────────────────────────
function IspCloud({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.55) * 0.22;
    ringsRef.current.forEach((m, i) => {
      if (m) m.rotation.y = state.clock.elapsedTime * (0.12 + i * 0.05);
    });
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Volumetric cloud spheres */}
      {[
        { s: 1.35, p: [0, 0, 0] as [number, number, number], op: 0.18 },
        { s: 0.88, p: [0.85, 0.22, 0.2] as [number, number, number], op: 0.14 },
        { s: 0.78, p: [-0.62, -0.1, 0.32] as [number, number, number], op: 0.16 },
        { s: 0.68, p: [0.30, 0.52, -0.3] as [number, number, number], op: 0.12 },
      ].map(({ s, p, op }, i) => (
        <mesh key={i} position={p} scale={s}>
          <sphereGeometry args={[1, 14, 14]} />
          <meshStandardMaterial
            color="#6366f1" emissive="#818cf8" emissiveIntensity={0.5}
            transparent opacity={op} roughness={1} depthWrite={false}
          />
        </mesh>
      ))}

      {/* Orbital rings */}
      {[1.8, 2.4, 3.0].map((r, i) => (
        <mesh
          key={r}
          ref={(el) => { if (el) ringsRef.current[i] = el; }}
          rotation={[Math.PI / 2 + i * 0.4, 0, i * 0.6]}
        >
          <torusGeometry args={[r, 0.018, 6, 80]} />
          <meshStandardMaterial
            color={LAYER.app} emissive={LAYER.app}
            emissiveIntensity={0.6} transparent opacity={0.4} depthWrite={false}
          />
        </mesh>
      ))}

      <pointLight intensity={2.5} distance={6} color="#818cf8" />

      <Html center position={[0, -2.2, 0]}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: '9px',
          color: '#a78bfa', letterSpacing: '0.15em', textTransform: 'uppercase',
          whiteSpace: 'nowrap', pointerEvents: 'none',
          textShadow: '0 0 12px #818cf8',
          padding: '3px 10px', background: 'rgba(4,10,30,0.75)',
          borderRadius: '6px', border: '1px solid rgba(129,140,248,0.3)',
        }}>ISP Cloud / BGP</div>
      </Html>
    </group>
  );
}

// ─── Animated Cable (with traveling pulse segment) ────────────────────────────
function AnimatedCable({ points, color = LAYER.cable, traveling = false }: {
  points: [number, number, number][];
  color?: string;
  traveling?: boolean;
}) {
  if (points.length < 2) return null;
  return (
    <>
      {/* Base cable */}
      <Line points={points} color={color} lineWidth={1.2} transparent opacity={0.35} />
      {/* Bright highlight center */}
      <Line points={points} color={color} lineWidth={0.5} transparent opacity={traveling ? 0.9 : 0.5} />
    </>
  );
}

// ─── Floating star particles ──────────────────────────────────────────────────
function FloatingParticles() {
  const count = 120;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 30;
      arr[i * 3 + 1] = Math.random() * 12 + 0.5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 22;
    }
    return arr;
  }, []);

  const geoRef = useRef<THREE.BufferGeometry>(null);
  useFrame((state) => {
    if (!geoRef.current) return;
    const pos = geoRef.current.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += Math.sin(state.clock.elapsedTime * 0.4 + i) * 0.002;
    }
    geoRef.current.attributes.position.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={geoRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#818cf8" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

// ─── Network node orb ─────────────────────────────────────────────────────────
function NetworkNode({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.2 + position[0]) * 0.08;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.6 + Math.sin(state.clock.elapsedTime * 2 + position[2]) * 0.4;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.065, 14, 14]} />
      <meshStandardMaterial
        color={color} emissive={color} emissiveIntensity={0.6}
        roughness={0.1} metalness={0.3}
      />
      <pointLight intensity={0.5} distance={1.5} color={color} />
    </mesh>
  );
}

// ─── Nebula background sphere ─────────────────────────────────────────────────
function NebulaSky() {
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[45, 32, 32]} />
      <meshStandardMaterial
        color="#020818"
        emissive="#0a0520"
        emissiveIntensity={1}
        side={THREE.BackSide}
        roughness={1}
      />
    </mesh>
  );
}

// ─── Glowing floor grid ───────────────────────────────────────────────────────
function CyberFloor() {
  const meshRef = useRef<THREE.Mesh>(null);
  const lineCount = 24;

  const gridLines = useMemo(() => {
    const lines: { points: [number, number, number][]; color: string }[] = [];
    const half = 15;
    for (let i = -lineCount / 2; i <= lineCount / 2; i++) {
      const t = (i + lineCount / 2) / lineCount;
      const color = i % 5 === 0 ? '#1e40af' : '#0f1f3d';
      lines.push({ points: [[-half, 0, i], [half, 0, i]], color });
      lines.push({ points: [[i, 0, -half], [i, 0, half]], color });
      void t;
    }
    return lines;
  }, []);

  return (
    <>
      {/* Base plane */}
      <mesh position={[0, -0.015, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#03070f" roughness={0.95} />
      </mesh>

      {/* Grid lines */}
      {gridLines.map((l, i) => (
        <Line key={i} points={l.points} color={l.color} lineWidth={l.color === '#1e40af' ? 0.8 : 0.4}
          transparent opacity={0.8} />
      ))}

      {/* Hex origin glow */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.5, 6]} />
        <meshStandardMaterial
          color="#0f172a" emissive="#3b82f6" emissiveIntensity={0.12}
          transparent opacity={0.4} depthWrite={false}
        />
      </mesh>

      {/* Central spotlight */}
      <pointLight position={[0, 0.1, 0]} intensity={0.5} distance={6} color="#1d4ed8" />
    </>
  );
}

// ─── Layer Legend Pillars ─────────────────────────────────────────────────────
function LayerPillar({ position, color, label, height = 0.4 }: {
  position: [number, number, number]; color: string; label: string; height?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.4 + Math.sin(state.clock.elapsedTime * 1.5 + position[0]) * 0.3;
  });
  return (
    <group position={position}>
      <mesh ref={meshRef} position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.042, 0.055, height, 8]} />
        <meshStandardMaterial
          color={color} emissive={color} emissiveIntensity={0.4}
          transparent opacity={0.85}
        />
      </mesh>
      <mesh position={[0, height, 0]}>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.0} />
      </mesh>
      <pointLight intensity={0.4} distance={1.2} color={color} position={[0, height, 0]} />
    </group>
  );
}

// ─── Main World ───────────────────────────────────────────────────────────────
export function World() {
  const ccRef = useRef<CameraControls>(null);
  const step = useSimStore((s) => s.step);
  const cameraPreset = useSimStore((s) => s.cameraPreset);
  const isRunning = useSimStore((s) => s.isRunning);

  useEffect(() => {
    if (!ccRef.current) return;
    const { eye, target } = CAMERA_PRESETS[cameraPreset];
    ccRef.current.setLookAt(...eye, ...target, true);
  }, [cameraPreset]);

  useEffect(() => {
    if (!ccRef.current) return;
    (ccRef.current as unknown as { autoRotate: boolean; autoRotateSpeed: number }).autoRotate = step === 'IDLE';
    (ccRef.current as unknown as { autoRotate: boolean; autoRotateSpeed: number }).autoRotateSpeed = 0.2;
  }, [step]);

  const r1Active = ['ROUTER1_ENTRY', 'ROUTER1_PROCESS', 'ROUTER1_EXIT', 'TRAVEL_TO_R1', 'TRANSMISSION_ERROR'].includes(step);
  const r2Active = ['TRAVEL_TO_R2', 'ROUTER2_DECISION', 'TRAVEL_ISP', 'TRAVEL_DEST'].includes(step);
  const destComplete = step === 'COMPLETE';
  const destActive = ['TRAVEL_DEST', 'DECAP_NETWORK', 'DECAP_INTERNET', 'DECAP_TRANSPORT', 'DECAP_APP', 'COMPLETE'].includes(step);

  return (
    <>
      <CameraControls
        ref={ccRef}
        makeDefault
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.05}
        minDistance={4}
        maxDistance={22}
      />

      {/* ── Lighting ── */}
      <ambientLight intensity={0.12} color="#1a1060" />
      <directionalLight position={[6, 14, 8]} intensity={0.7} color="#c7d2fe" castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-far={30} />
      <directionalLight position={[-10, 8, -6]} intensity={0.25} color="#818cf8" />

      {/* Colored fill lights per zone */}
      <pointLight position={[-5.5, 3.5, 0.5]} intensity={1.2} distance={7} color={LAYER.app} />
      <pointLight position={[5.5, 3.5, 0.5]} intensity={1.2} distance={7} color={LAYER.transport} />
      <pointLight position={[0, 4, -3]} intensity={0.9} distance={8} color={LAYER.network} />
      <pointLight position={[0, 6, -6.5]} intensity={1.4} distance={9} color={LAYER.app} />

      {/* ── Environment ── */}
      <fog attach="fog" args={['#030718', 14, 32]} />
      <color attach="background" args={['#030718']} />
      <NebulaSky />
      <Stars radius={60} depth={25} count={2200} factor={3} saturation={0} fade speed={0.6} />
      <FloatingParticles />
      <CyberFloor />

      {/* ── Floating network orbs ── */}
      <NetworkNode position={[-7, 2.5, -3]} color={LAYER.app} />
      <NetworkNode position={[7, 2.2, -2.5]} color={LAYER.transport} />
      <NetworkNode position={[-4, 3.5, -6]} color={LAYER.app} />
      <NetworkNode position={[3.5, 3, -7]} color={LAYER.network} />
      <NetworkNode position={[0, 1.8, -8]} color={LAYER.datalink} />
      <NetworkNode position={[-8.5, 1.5, 2]} color={LAYER.physical} />
      <NetworkNode position={[8, 1.8, 1.5]} color={LAYER.datalink} />

      {/* Background connection lines between floating nodes */}
      <AnimatedCable points={[[-7, 2.5, -3], [0, 1.8, -8]]} color={LAYER.app} />
      <AnimatedCable points={[[7, 2.2, -2.5], [3.5, 3, -7]]} color={LAYER.transport} />
      <AnimatedCable points={[[-4, 3.5, -6], [0, 3.2, -5.5]]} color={LAYER.app} />

      {/* ── Layer Identity Pillars ── */}
      <LayerPillar position={[-6.5, 0, 1]} color={LAYER.app} label="Application" />
      <LayerPillar position={[-5.5, 0, -1.5]} color={LAYER.transport} label="Transport" />
      <LayerPillar position={[0, 0, -3.5]} color={LAYER.network} label="Network" />
      <LayerPillar position={[0.9, 0, -2.5]} color={LAYER.datalink} label="Data Link" />
      <LayerPillar position={[5.8, 0, -1.5]} color={LAYER.physical} label="Physical" />

      {/* ── Devices ── */}
      <Laptop position={[-5, 0, 0]} label="Source Laptop" active={isRunning} />
      <RouterBox position={[-2, 0, -1]} label="Router 1" active={r1Active} />
      <NetworkSwitch position={[0, 0, -1.5]} />
      <RouterBox position={[2, 0, -1]} label="Router 2" active={r2Active} />
      <Laptop position={[5, 0, 0]} label="Destination" active={destActive} complete={destComplete} />
      <ServerRack position={[4, 0, -2.7]} />
      <IspCloud position={[0, 2.5, -5.5]} />

      {/* ── Network Cables ── */}
      {/* Floor-level trunk cables */}
      <AnimatedCable
        points={[[-5, 0.1, 0], [-3.6, 0.1, -0.5], [-2, 0.1, -1]]}
        color={LAYER.cable}
        traveling={isRunning}
      />
      <AnimatedCable
        points={[[-2, 0.1, -1], [-1, 0.1, -1.28], [0, 0.1, -1.5]]}
        color={LAYER.datalink}
        traveling={isRunning}
      />
      <AnimatedCable
        points={[[0, 0.1, -1.5], [1, 0.1, -1.28], [2, 0.1, -1]]}
        color={LAYER.datalink}
        traveling={isRunning}
      />
      <AnimatedCable
        points={[[2, 0.1, -1], [3.6, 0.1, -0.5], [5, 0.1, 0]]}
        color={LAYER.cable}
        traveling={isRunning}
      />
      <AnimatedCable
        points={[[2, 0.1, -1], [3, 0.1, -1.7], [4, 0.1, -2.7]]}
        color={LAYER.transport}
        traveling={isRunning}
      />

      {/* ISP arching cables */}
      <AnimatedCable
        points={[[2, 0.35, -1], [1, 1.6, -3.2], [0, 2.5, -5.5]]}
        color={LAYER.app}
      />
      <AnimatedCable
        points={[[0, 2.5, -5.5], [2.6, 1.5, -3], [5, 0.35, 0]]}
        color={LAYER.app}
      />
    </>
  );
}
