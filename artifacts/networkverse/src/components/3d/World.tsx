import { useEffect, useRef } from 'react';
import { CameraControls, Grid, Line, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimStore } from '../../store/simulationStore';
import { CAMERA_PRESETS } from '../../lib/stepConfig';

// ─── Device building blocks ─────────────────────────────────────────────────

function DeviceLabel({ children }: { children: React.ReactNode }) {
  return (
    <Html center position={[0, -0.22, 0]}>
      <div style={{
        fontFamily: 'monospace', fontSize: '9px', color: 'rgba(148,163,184,0.8)',
        letterSpacing: '0.15em', textTransform: 'uppercase', whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }}>{children}</div>
    </Html>
  );
}

function StatusLight({ color, on, offset }: { color: string; on: boolean; offset: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    const blink = on ? (Math.sin(state.clock.elapsedTime * 4 + offset[0] * 3) * 0.3 + 0.7) : 0.15;
    mat.emissiveIntensity = blink;
  });
  return (
    <mesh ref={meshRef} position={offset}>
      <cylinderGeometry args={[0.02, 0.02, 0.03, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
    </mesh>
  );
}

function Laptop({ position, label, active, complete }: {
  position: [number, number, number]; label: string; active: boolean; complete?: boolean;
}) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[1.1, 0.07, 0.75]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.25} />
      </mesh>
      {/* Hinge area */}
      <mesh position={[0, 0.075, -0.36]}>
        <boxGeometry args={[1.05, 0.02, 0.03]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Screen lid */}
      <group position={[0, 0.075, -0.35]} rotation={[-Math.PI * 0.08, 0, 0]}>
        <mesh position={[0, 0.38, 0]}>
          <boxGeometry args={[1.05, 0.72, 0.055]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.25} />
        </mesh>
        {/* Screen surface */}
        <mesh position={[0, 0.38, 0.029]}>
          <planeGeometry args={[0.95, 0.62]} />
          <meshStandardMaterial
            color={active ? '#020f1a' : '#020617'}
            emissive={complete ? '#22c55e' : active ? '#06b6d4' : '#000820'}
            emissiveIntensity={complete ? 0.6 : active ? 0.25 : 0.04}
          />
        </mesh>
      </group>
      <DeviceLabel>{label}</DeviceLabel>
    </group>
  );
}

function RouterBox({ position, label, active }: {
  position: [number, number, number]; label: string; active: boolean;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.82, 0.28, 0.52]} />
        <meshStandardMaterial color="#0f172a" metalness={0.75} roughness={0.3} />
      </mesh>
      {/* Vent slots */}
      {[-0.12, 0, 0.12].map((x) => (
        <mesh key={x} position={[x, 0.15, 0.262]}>
          <boxGeometry args={[0.05, 0.12, 0.005]} />
          <meshStandardMaterial color="#020617" />
        </mesh>
      ))}
      {/* Status lights */}
      <StatusLight color="#22c55e" on={active} offset={[-0.22, 0.265, 0.262]} />
      <StatusLight color="#22c55e" on={active} offset={[-0.1, 0.265, 0.262]} />
      <StatusLight color="#3b82f6" on={active} offset={[0.06, 0.265, 0.262]} />
      <StatusLight color="#f97316" on={active} offset={[0.18, 0.265, 0.262]} />
      <DeviceLabel>{label}</DeviceLabel>
    </group>
  );
}

function NetworkSwitch({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.075, 0]}>
        <boxGeometry args={[1.5, 0.14, 0.42]} />
        <meshStandardMaterial color="#0f172a" metalness={0.75} roughness={0.3} />
      </mesh>
      {/* Port holes */}
      {[-0.5, -0.3, -0.1, 0.1, 0.3, 0.5].map((x) => (
        <mesh key={x} position={[x, 0.075, 0.215]}>
          <boxGeometry args={[0.1, 0.06, 0.01]} />
          <meshStandardMaterial color="#020617" />
        </mesh>
      ))}
      <DeviceLabel>Switch</DeviceLabel>
    </group>
  );
}

function ServerRack({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.7, 2, 0.65]} />
        <meshStandardMaterial color="#0a1628" metalness={0.9} roughness={0.15} />
      </mesh>
      {/* Unit dividers and lights */}
      {[0.1, 0.4, 0.7, 1.0, 1.3, 1.6, 1.9].map((y, i) => (
        <group key={y}>
          <mesh position={[0, y, 0.328]}>
            <boxGeometry args={[0.65, 0.005, 0.005]} />
            <meshStandardMaterial color="#1e3a5f" />
          </mesh>
          <mesh position={[0.22, y + 0.12, 0.328]}>
            <boxGeometry args={[0.18, 0.04, 0.005]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#22c55e' : '#3b82f6'}
              emissive={i % 2 === 0 ? '#22c55e' : '#3b82f6'}
              emissiveIntensity={0.8}
            />
          </mesh>
        </group>
      ))}
      <DeviceLabel>Server Rack</DeviceLabel>
    </group>
  );
}

function IspCloud({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.7) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {[
        { s: 1.3, p: [0, 0, 0] as [number, number, number] },
        { s: 0.85, p: [0.8, 0.2, 0.2] as [number, number, number] },
        { s: 0.75, p: [-0.6, -0.1, 0.3] as [number, number, number] },
        { s: 0.65, p: [0.3, 0.5, -0.3] as [number, number, number] },
      ].map(({ s, p }, i) => (
        <mesh key={i} position={p} scale={s}>
          <sphereGeometry args={[1, 14, 14]} />
          <meshStandardMaterial
            color="#4f46e5"
            emissive="#6366f1"
            emissiveIntensity={0.4}
            transparent opacity={0.18}
            roughness={1}
            depthWrite={false}
          />
        </mesh>
      ))}
      <pointLight intensity={1.5} distance={4} color="#818cf8" />
      <Html center position={[0, -1.8, 0]}>
        <div style={{
          fontFamily: 'monospace', fontSize: '9px', color: 'rgba(129,140,248,0.9)',
          letterSpacing: '0.15em', textTransform: 'uppercase', whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}>ISP Cloud</div>
      </Html>
    </group>
  );
}

// ─── Network cables ──────────────────────────────────────────────────────────

const CABLE_COLOR = '#1e4a6e';

function Cable({ points }: { points: [number, number, number][] }) {
  return (
    <Line
      points={points}
      color={CABLE_COLOR}
      lineWidth={1.5}
      transparent
      opacity={0.6}
    />
  );
}

// ─── Main World Component ────────────────────────────────────────────────────

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
    (ccRef.current as unknown as { autoRotate: boolean; autoRotateSpeed: number }).autoRotateSpeed = 0.25;
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
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={4}
        maxDistance={20}
      />

      {/* Lighting */}
      <ambientLight intensity={0.15} />
      <directionalLight position={[8, 12, 8]} intensity={0.8} color="#e0f2fe" castShadow />
      <directionalLight position={[-8, 8, -8]} intensity={0.3} color="#7dd3fc" />
      <pointLight position={[-5, 3, 0]} intensity={0.6} distance={8} color="#38bdf8" />
      <pointLight position={[5, 3, 0]} intensity={0.6} distance={8} color="#818cf8" />

      {/* Background fog */}
      <fog attach="fog" args={['#020617', 12, 28]} />
      <color attach="background" args={['#020617']} />

      {/* Floor */}
      <Grid
        args={[40, 40]}
        position={[0, -0.01, 0]}
        cellColor="#0f2744"
        sectionColor="#1e3a5f"
        cellSize={1}
        sectionSize={5}
        fadeDistance={25}
        fadeStrength={1.5}
      />
      <mesh position={[0, -0.02, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#02060f" roughness={1} />
      </mesh>

      {/* Devices */}
      <Laptop position={[-5, 0, 0]} label="Source Laptop" active={isRunning} />
      <RouterBox position={[-2, 0, -1]} label="Router 1" active={r1Active} />
      <NetworkSwitch position={[0, 0, -1.5]} />
      <RouterBox position={[2, 0, -1]} label="Router 2" active={r2Active} />
      <Laptop position={[5, 0, 0]} label="Destination" active={destActive} complete={destComplete} />
      <ServerRack position={[4, 0, -2.6]} />
      <IspCloud position={[0, 2.5, -5.5]} />

      {/* Network cables — floor level */}
      <Cable points={[[-5, 0.08, 0], [-3.5, 0.08, -0.5], [-2, 0.08, -1]]} />
      <Cable points={[[-2, 0.08, -1], [-1, 0.08, -1.25], [0, 0.08, -1.5]]} />
      <Cable points={[[0, 0.08, -1.5], [1, 0.08, -1.25], [2, 0.08, -1]]} />
      <Cable points={[[2, 0.08, -1], [3.5, 0.08, -0.5], [5, 0.08, 0]]} />
      <Cable points={[[2, 0.08, -1], [3, 0.08, -1.7], [4, 0.08, -2.6]]} />

      {/* ISP cloud cables — arching through air */}
      <Cable points={[[2, 0.3, -1], [1, 1.5, -3], [0, 2.5, -5.5]]} />
      <Cable points={[[0, 2.5, -5.5], [2.5, 1.5, -3], [5, 0.3, 0]]} />
    </>
  );
}
