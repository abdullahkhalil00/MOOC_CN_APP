import { create } from 'zustand';

export type SimStep =
  | 'IDLE'
  | 'ENCAP_APP'
  | 'ENCAP_TRANSPORT'
  | 'ENCAP_INTERNET'
  | 'ENCAP_NETWORK'
  | 'TRAVEL_TO_R1'
  | 'TRANSMISSION_ERROR'
  | 'ROUTER1_ENTRY'
  | 'ROUTER1_PROCESS'
  | 'ROUTER1_EXIT'
  | 'TRAVEL_TO_R2'
  | 'ROUTER2_DECISION'
  | 'TRAVEL_ISP'
  | 'TRAVEL_DEST'
  | 'DECAP_NETWORK'
  | 'DECAP_INTERNET'
  | 'DECAP_TRANSPORT'
  | 'DECAP_APP'
  | 'COMPLETE';

export type Protocol = 'TCP' | 'UDP';
export type RoutingChoice = 'IGP' | 'EGP';
export type CameraPreset = 'OVERVIEW' | 'SOURCE' | 'ROUTER1' | 'ROUTER2' | 'ISP' | 'DEST';

interface SimState {
  step: SimStep;
  isRunning: boolean;
  isPaused: boolean;
  speed: number;
  protocol: Protocol;
  routingChoice: RoutingChoice | null;
  ttl: number;
  currentRouter: string;
  errorActive: boolean;
  ethernetDecapped: boolean;
  cameraPreset: CameraPreset;

  start: () => void;
  pause: () => void;
  reset: () => void;
  setSpeed: (s: number) => void;
  setProtocol: (p: Protocol) => void;
  setStep: (s: SimStep) => void;
  setRoutingChoice: (c: RoutingChoice) => void;
  decrementTtl: () => void;
  setCurrentRouter: (r: string) => void;
  setErrorActive: (v: boolean) => void;
  setEthernetDecapped: (v: boolean) => void;
  setCameraPreset: (p: CameraPreset) => void;
}

export const useSimStore = create<SimState>((set) => ({
  step: 'IDLE',
  isRunning: false,
  isPaused: false,
  speed: 1,
  protocol: 'TCP',
  routingChoice: null,
  ttl: 64,
  currentRouter: '—',
  errorActive: false,
  ethernetDecapped: false,
  cameraPreset: 'OVERVIEW',

  start: () => set({ isRunning: true, isPaused: false, step: 'ENCAP_APP', cameraPreset: 'SOURCE' }),
  pause: () => set((s) => ({ isPaused: !s.isPaused })),
  reset: () => set({
    step: 'IDLE',
    isRunning: false,
    isPaused: false,
    routingChoice: null,
    ttl: 64,
    currentRouter: '—',
    errorActive: false,
    ethernetDecapped: false,
    cameraPreset: 'OVERVIEW',
  }),
  setSpeed: (speed) => set({ speed }),
  setProtocol: (protocol) => set({ protocol }),
  setStep: (step) => set({ step }),
  setRoutingChoice: (routingChoice) => set({ routingChoice }),
  decrementTtl: () => set((s) => ({ ttl: s.ttl - 1 })),
  setCurrentRouter: (currentRouter) => set({ currentRouter }),
  setErrorActive: (errorActive) => set({ errorActive }),
  setEthernetDecapped: (ethernetDecapped) => set({ ethernetDecapped }),
  setCameraPreset: (cameraPreset) => set({ cameraPreset }),
}));
