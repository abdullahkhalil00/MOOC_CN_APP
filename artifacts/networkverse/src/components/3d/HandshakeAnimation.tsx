import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export interface HandshakeStep {
  label: string;
  from: [number, number, number];
  to: [number, number, number];
  color: string;
}

interface HandshakeAnimationProps {
  steps: HandshakeStep[];
  stepDuration?: number;
  onStepChange?: (index: number) => void;
  onComplete?: () => void;
}

export function HandshakeAnimation({ steps, stepDuration = 1.4, onStepChange, onComplete }: HandshakeAnimationProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const progressRef = useRef(0);
  const packetRef = useRef<THREE.Mesh>(null);
  const completedRef = useRef(false);

  const currentStep = steps[stepIndex];

  useEffect(() => {
    onStepChange?.(stepIndex);
    progressRef.current = 0;
  }, [stepIndex, onStepChange]);

  useFrame((_, delta) => {
    if (!currentStep || completedRef.current || !packetRef.current) return;

    progressRef.current = Math.min(1, progressRef.current + delta / stepDuration);
    const eased = 1 - Math.pow(1 - progressRef.current, 3);

    const from = new THREE.Vector3(...currentStep.from);
    const to = new THREE.Vector3(...currentStep.to);
    packetRef.current.position.lerpVectors(from, to, eased);
    packetRef.current.position.y += Math.sin(eased * Math.PI) * 0.15;

    if (progressRef.current >= 1) {
      if (stepIndex < steps.length - 1) {
        setStepIndex((i) => i + 1);
      } else if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
    }
  });

  if (!currentStep) return null;

  return (
    <group>
      <mesh ref={packetRef} position={currentStep.from}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color={currentStep.color} emissive={currentStep.color} emissiveIntensity={1.2} />
        <Html position={[0, 0.18, 0]} center distanceFactor={3} zIndexRange={[90, 0]}>
          <div
            className="glass-panel px-3 py-1 rounded-full text-xs font-mono font-bold whitespace-nowrap"
            style={{ color: currentStep.color, borderColor: currentStep.color }}
          >
            {currentStep.label}
          </div>
        </Html>
      </mesh>
    </group>
  );
}
