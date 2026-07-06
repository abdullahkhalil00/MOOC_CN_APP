import { create } from 'zustand';

export enum SceneState {
  LANDING,
  INTRO,
  LAPTOP,
  APP_LAYER,
  TRANSPORT,
}

export interface HeaderField {
  label: string;
  value: string;
  explanation?: string;
}

export interface HeaderData {
  id: string;
  name: string;
  fields: HeaderField[];
  color: string;
}

export type TransportProtocol = 'TCP' | 'UDP';

interface SimulationState {
  currentScene: SceneState;
  narrationText: string | null;
  packetHeaders: HeaderData[];
  packetSpawned: boolean;
  transportProtocol: TransportProtocol | null;

  setScene: (scene: SceneState) => void;
  setNarrationText: (text: string | null) => void;
  addPacketHeader: (header: HeaderData) => void;
  setPacketSpawned: (spawned: boolean) => void;
  setTransportProtocol: (protocol: TransportProtocol | null) => void;
  resetSimulation: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  currentScene: SceneState.LANDING,
  narrationText: null,
  packetHeaders: [],
  packetSpawned: false,
  transportProtocol: null,

  setScene: (scene) => set({ currentScene: scene }),
  setNarrationText: (text) => set({ narrationText: text }),
  addPacketHeader: (header) => set((state) => ({
    packetHeaders: [...state.packetHeaders, header]
  })),
  setPacketSpawned: (spawned) => set({ packetSpawned: spawned }),
  setTransportProtocol: (protocol) => set({ transportProtocol: protocol }),
  resetSimulation: () => set({
    currentScene: SceneState.LANDING,
    narrationText: null,
    packetHeaders: [],
    packetSpawned: false,
    transportProtocol: null,
  }),
}));
