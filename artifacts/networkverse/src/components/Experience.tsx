import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { VRButton, XR, createXRStore } from '@react-three/xr';
import { World } from './3d/World';
import { PacketCapsule } from './3d/PacketCapsule';
import { SimulationController } from './scenes/SimulationController';
import { Overlay } from './ui/Overlay';

const xrStore = createXRStore();

export function Experience() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', background: '#020617' }}>
      {/* 3D Canvas — fills the entire background */}
      <Canvas
        shadows
        camera={{ position: [0, 7, 13], fov: 48 }}
        style={{ position: 'absolute', inset: 0 }}
        gl={{ antialias: true, toneMapping: 4 /* ACESFilmic */, toneMappingExposure: 1.1 }}
      >
        <XR store={xrStore}>
          <Suspense fallback={null}>
            <World />
            <PacketCapsule />
          </Suspense>
        </XR>
      </Canvas>

      {/* HTML overlay panels */}
      <Overlay />

      {/* Logic driver — must be outside Canvas so it can use regular React lifecycle */}
      <SimulationController />

      {/* VR entry button */}
      <VRButton
        store={xrStore}
        style={{
          position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%) translateY(70px)',
          zIndex: 50,
        }}
      />
    </div>
  );
}
