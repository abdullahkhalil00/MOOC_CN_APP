import { create } from 'zustand';

export enum SceneState {
  LANDING,
  INTRO,
  LAPTOP,
  APP_LAYER,
}

export interface HeaderData {
  id: string;
  name: string;
  fields: { label: string; value: string }[];
  color: string;
}

interface SimulationState {
  currentScene: SceneState;
  narrationText: string | null;
  packetHeaders: HeaderData[];
  packetSpawned: boolean;
  
  setScene: (scene: SceneState) => void;
  setNarrationText: (text: string | null) => void;
  addPacketHeader: (header: HeaderData) => void;
  setPacketSpawned: (spawned: boolean) => void;
  resetSimulation: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  currentScene: SceneState.LANDING,
  narrationText: null,
  packetHeaders: [],
  packetSpawned: false,
  
  setScene: (scene) => set({ currentScene: scene }),
  setNarrationText: (text) => set({ narrationText: text }),
  addPacketHeader: (header) => set((state) => ({ 
    packetHeaders: [...state.packetHeaders, header] 
  })),
  setPacketSpawned: (spawned) => set({ packetSpawned: spawned }),
  resetSimulation: () => set({ 
    currentScene: SceneState.LANDING, 
    narrationText: null, 
    packetHeaders: [], 
    packetSpawned: false 
  }),
}));
