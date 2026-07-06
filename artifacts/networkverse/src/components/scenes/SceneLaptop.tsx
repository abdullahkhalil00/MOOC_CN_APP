import { Html } from '@react-three/drei';
import { useSimulationStore, SceneState, JourneyStep } from '../../store/simulationStore';

export function SceneLaptop() {
  const sceneState = useSimulationStore((state) => state.sceneState);
  const journeyStep = useSimulationStore((state) => state.journeyStep);
  const setJourneyStep = useSimulationStore((state) => state.setJourneyStep);

  if (sceneState !== SceneState.RUNNING || journeyStep < JourneyStep.LAPTOP_READY) return null;

  const isSending = journeyStep >= JourneyStep.SENDING;
  const hasProgressed = journeyStep >= JourneyStep.APP_HEADER;

  return (
    <group position={[0, 0.78, 0]}>
      {/* Screen Overlay */}
      <group position={[0, 0.01, -0.2]} rotation={[-Math.PI / 6, 0, 0]}>
        <Html transform position={[0, 0.2, 0.012]} distanceFactor={0.5} zIndexRange={[0, 0]}>
          <div className="w-[550px] h-[350px] flex flex-col items-center justify-center bg-slate-900 rounded border border-slate-700 font-mono text-cyan-400 p-8 shadow-inner">
            <h2 className="text-3xl mb-8">Hello Server</h2>
            {!isSending && (
              <button
                onClick={() => setJourneyStep(JourneyStep.SENDING)}
                className="px-6 py-3 bg-cyan-600/30 border border-cyan-400 text-cyan-100 rounded hover:bg-cyan-500/50 transition-colors"
              >
                Send Request
              </button>
            )}
            {isSending && !hasProgressed && (
              <div className="text-xl animate-pulse text-cyan-200">
                Sending data...
              </div>
            )}
            {hasProgressed && (
              <div className="text-sm text-emerald-300 text-center">
                Request in progress — watch the packet above the keyboard.
              </div>
            )}
          </div>
        </Html>
      </group>
    </group>
  );
}
