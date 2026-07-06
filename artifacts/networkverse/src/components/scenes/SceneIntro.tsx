import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CameraControls, Box, Plane } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore, SceneState } from '../../store/simulationStore';

export function SceneIntro() {
  const setScene = useSimulationStore((state) => state.setScene);
  const setNarrationText = useSimulationStore((state) => state.setNarrationText);
  const currentScene = useSimulationStore((state) => state.currentScene);
  
  const cameraControlsRef = useRef<CameraControls>(null);
  const laptopRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    if (currentScene === SceneState.INTRO) {
      setNarrationText("Today we will learn how a data packet travels across the Internet.");
      
      const timer = setTimeout(() => {
        setNarrationText(null);
        setScene(SceneState.LAPTOP);
      }, 5000);
      
      return () => clearTimeout(timer);
    }

    return undefined;
  }, [currentScene, setNarrationText, setScene]);

  useEffect(() => {
    if (cameraControlsRef.current && currentScene === SceneState.INTRO) {
      cameraControlsRef.current.setLookAt(2, 2, 4, 0, 0.5, 0, true);
    } else if (cameraControlsRef.current && currentScene === SceneState.LAPTOP) {
      cameraControlsRef.current.setLookAt(0, 1.2, 2, 0, 0.5, 0, true);
    }
  }, [currentScene]);

  return (
    <>
      <CameraControls ref={cameraControlsRef} makeDefault />
      
      {/* Room */}
      <group position={[0, 0, 0]}>
        <Plane args={[10, 10]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </Plane>
        
        {/* Desk */}
        <Box args={[3, 0.05, 1.5]} position={[0, 0.75, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </Box>
        <Box args={[0.1, 0.75, 1.3]} position={[-1.4, 0.375, 0]} castShadow>
          <meshStandardMaterial color="#334155" />
        </Box>
        <Box args={[0.1, 0.75, 1.3]} position={[1.4, 0.375, 0]} castShadow>
          <meshStandardMaterial color="#334155" />
        </Box>

        {/* Laptop Base */}
        <group ref={laptopRef} position={[0, 0.78, 0]}>
          <Box args={[0.6, 0.02, 0.4]} castShadow>
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
          </Box>
          {/* Screen */}
          <group position={[0, 0.01, -0.2]} rotation={[-Math.PI / 6, 0, 0]}>
            <Box args={[0.6, 0.4, 0.02]} position={[0, 0.2, 0]} castShadow>
              <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
            </Box>
            <Plane args={[0.55, 0.35]} position={[0, 0.2, 0.011]}>
              <meshBasicMaterial color="#020617" />
            </Plane>
          </group>
        </group>
        
        {/* Router / Switch on desk */}
        <Box args={[0.4, 0.05, 0.3]} position={[0.8, 0.78, -0.3]} castShadow>
          <meshStandardMaterial color="#0f172a" />
        </Box>
        
        {/* Server Rack (background) */}
        <Box args={[0.8, 2, 0.8]} position={[-2, 1, -2]} castShadow receiveShadow>
          <meshStandardMaterial color="#020617" metalness={0.9} roughness={0.1} />
        </Box>
      </group>
    </>
  );
}
