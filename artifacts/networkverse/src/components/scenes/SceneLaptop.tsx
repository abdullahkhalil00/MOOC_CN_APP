import { useEffect, useState } from 'react';
import { Html } from '@react-three/drei';
import { useSimulationStore, SceneState } from '../../store/simulationStore';
import { GlowButton } from '../ui/GlowButton';

export function SceneLaptop() {
  const currentScene = useSimulationStore((state) => state.currentScene);
  const setScene = useSimulationStore((state) => state.setScene);
  const packetSpawned = useSimulationStore((state) => state.packetSpawned);
  const setPacketSpawned = useSimulationStore((state) => state.setPacketSpawned);
  
  if (currentScene < SceneState.LAPTOP) return null;

  return (
    <group position={[0, 0.78, 0]}>
      {/* Screen Overlay */}
      <group position={[0, 0.01, -0.2]} rotation={[-Math.PI / 6, 0, 0]}>
        <Html transform position={[0, 0.2, 0.012]} distanceFactor={0.5} zIndexRange={[0, 0]}>
          <div className="w-[550px] h-[350px] flex flex-col items-center justify-center bg-slate-900 rounded border border-slate-700 font-mono text-cyan-400 p-8 shadow-inner">
            <h2 className="text-3xl mb-8">Hello Server</h2>
            {!packetSpawned && (
              <button 
                onClick={() => {
                  setPacketSpawned(true);
                  setTimeout(() => setScene(SceneState.APP_LAYER), 2000);
                }}
                className="px-6 py-3 bg-cyan-600/30 border border-cyan-400 text-cyan-100 rounded hover:bg-cyan-500/50 transition-colors"
              >
                Send Request
              </button>
            )}
            {packetSpawned && (
              <div className="text-xl animate-pulse text-cyan-200">
                Sending data...
              </div>
            )}
          </div>
        </Html>
      </group>
    </group>
  );
}
