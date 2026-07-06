import { create } from 'zustand';

// The experience has exactly two top-level states: the landing overlay, and
// the single persistent 3D world. Everything after "start" happens inside
// that one world — progress is tracked via `journeyStep`, not by mounting
// or unmounting different "scenes".
export enum SceneState {
  LANDING,
  RUNNING,
}

// A continuous timeline describing where the packet is in its journey.
// New layers (Internet, Network Interface, ...) extend this enum — they
// never require swapping out the world or the camera rig.
export enum JourneyStep {
  INTRO,
  LAPTOP_READY,
  SENDING,
  APP_HEADER,
  TRANSPORT_SELECT,
  TRANSPORT_HANDSHAKE,
  TRANSPORT_HEADER,
  TRANSPORT_QUIZ,
  TRANSPORT_COMPARISON,
  TRANSPORT_CHALLENGE,
  COMPLETE,
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
  sceneState: SceneState;
  journeyStep: JourneyStep;
  narrationText: string | null;
  packetHeaders: HeaderData[];
  transportProtocol: TransportProtocol | null;

  start: () => void;
  setJourneyStep: (step: JourneyStep) => void;
  setNarrationText: (text: string | null) => void;
  addPacketHeader: (header: HeaderData) => void;
  setTransportProtocol: (protocol: TransportProtocol | null) => void;
  resetSimulation: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  sceneState: SceneState.LANDING,
  journeyStep: JourneyStep.INTRO,
  narrationText: null,
  packetHeaders: [],
  transportProtocol: null,

  start: () => set({ sceneState: SceneState.RUNNING, journeyStep: JourneyStep.INTRO }),
  setJourneyStep: (step) => set({ journeyStep: step }),
  setNarrationText: (text) => set({ narrationText: text }),
  addPacketHeader: (header) => set((state) => ({
    packetHeaders: [...state.packetHeaders, header],
  })),
  setTransportProtocol: (protocol) => set({ transportProtocol: protocol }),
  resetSimulation: () => set({
    sceneState: SceneState.LANDING,
    journeyStep: JourneyStep.INTRO,
    narrationText: null,
    packetHeaders: [],
    transportProtocol: null,
  }),
}));
