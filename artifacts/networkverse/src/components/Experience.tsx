import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { VRButton, XR, createXRStore } from '@react-three/xr';
import { World } from './3d/World';
import { PacketCapsule } from './3d/PacketCapsule';
import { SimulationController } from './scenes/SimulationController';
import { Overlay } from './ui/Overlay';

const xrStore = createXRStore();

// Loading fallback rendered inside the canvas
function CanvasLoader() {
  return null; // Three.js canvas handles its own "blank frame" naturally
}

export function Experience() {
  return (
    <div style={{
      width: '100vw', height: '100vh', overflow: 'hidden',
      position: 'relative',
      background: 'radial-gradient(ellipse at 50% 0%, #0a0530 0%, #030718 55%, #020212 100%)',
    }}>
      {/* Scanline overlay for futuristic feel */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,30,0.07) 3px, rgba(0,0,30,0.07) 4px)',
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(2,3,18,0.65) 100%)',
      }} />

      {/* 3D Canvas — fills the entire background */}
      <Canvas
        shadows
        camera={{ position: [0, 7, 13], fov: 50 }}
        style={{ position: 'absolute', inset: 0, zIndex: 0 }}
        gl={{
          antialias: true,
          toneMapping: 4 /* ACESFilmic */,
          toneMappingExposure: 1.05,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <XR store={xrStore}>
          <Suspense fallback={<CanvasLoader />}>
            <World />
            <PacketCapsule />
          </Suspense>
        </XR>
      </Canvas>

      {/* HTML overlay panels */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
        <Overlay />
      </div>

      {/* Logic driver — must be outside Canvas */}
      <SimulationController />

      {/* VR entry button */}
      <VRButton
        store={xrStore}
        style={{
          position: 'absolute', bottom: '20px', left: '50%',
          transform: 'translateX(-50%) translateY(70px)',
          zIndex: 50,
        }}
      />
    </div>
  );
}
