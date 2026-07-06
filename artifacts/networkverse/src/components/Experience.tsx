import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, SoftShadows } from '@react-three/drei';
import { VRButton, XR, createXRStore } from '@react-three/xr';
import { useSimulationStore, SceneState } from '../store/simulationStore';
import { LandingScreen } from './scenes/LandingScreen';
import { SceneIntro } from './scenes/SceneIntro';
import { SceneLaptop } from './scenes/SceneLaptop';
import { PacketJourney } from './scenes/PacketJourney';
import { NarrationCaption } from './ui/NarrationCaption';

const xrStore = createXRStore();

export function Experience() {
  const sceneState = useSimulationStore((state) => state.sceneState);
  const narrationText = useSimulationStore((state) => state.narrationText);

  return (
    <div className="w-full h-screen bg-slate-950 overflow-hidden relative">
      <VRButton store={xrStore} className="absolute bottom-4 right-4 z-50 px-4 py-2 bg-primary text-white rounded-md font-medium glass-panel" />

      {sceneState === SceneState.LANDING && <LandingScreen />}

      {narrationText && <NarrationCaption text={narrationText} />}

      <Canvas
        shadows
        camera={{ position: [0, 1.5, 5], fov: 50 }}
        className="w-full h-full"
      >
        <XR store={xrStore}>
          <color attach="background" args={['#020617']} />
          <fog attach="fog" args={['#020617', 5, 15]} />

          <ambientLight intensity={0.2} />
          <directionalLight
            castShadow
            position={[5, 5, 5]}
            intensity={1.5}
            shadow-mapSize={[1024, 1024]}
          >
            <orthographicCamera attach="shadow-camera" args={[-5, 5, 5, -5]} />
          </directionalLight>

          <Environment preset="city" environmentIntensity={0.2} />
          <SoftShadows size={20} samples={10} focus={0.5} />

          {/* The entire persistent world — room, laptop, and packet journey —
              mounts and stays mounted as a single unit once the simulation
              starts. Nothing here is swapped out or navigated away from. */}
          <Suspense fallback={null}>
            {sceneState === SceneState.RUNNING && <SceneIntro />}
            {sceneState === SceneState.RUNNING && <SceneLaptop />}
            {sceneState === SceneState.RUNNING && <PacketJourney />}
          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
}
