import { useEffect } from 'react';
import { useSimulationStore, SceneState } from '../../store/simulationStore';
import { DataPacket } from '../3d/DataPacket';

export function SceneApplicationLayer() {
  const currentScene = useSimulationStore((state) => state.currentScene);
  const setNarrationText = useSimulationStore((state) => state.setNarrationText);
  const addPacketHeader = useSimulationStore((state) => state.addPacketHeader);
  const packetHeaders = useSimulationStore((state) => state.packetHeaders);

  useEffect(() => {
    if (currentScene === SceneState.APP_LAYER) {
      setNarrationText("The Application Layer formats your data and adds an application header.");
      
      const timer = setTimeout(() => {
        if (packetHeaders.length === 0) {
          addPacketHeader({
            id: 'app-header',
            name: 'Application Header',
            color: '#a855f7', // purple
            fields: [
              { label: 'Protocol', value: 'HTTP/1.1' },
              { label: 'Method', value: 'GET' },
              { label: 'Host', value: 'api.server.com' },
              { label: 'Accept', value: 'application/json' }
            ]
          });
        }
      }, 3000);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [currentScene, setNarrationText, addPacketHeader, packetHeaders.length]);

  if (currentScene < SceneState.LAPTOP) return null;

  return (
    <group position={[0, 1.5, 0.5]}>
      <DataPacket headers={packetHeaders} />
    </group>
  );
}
