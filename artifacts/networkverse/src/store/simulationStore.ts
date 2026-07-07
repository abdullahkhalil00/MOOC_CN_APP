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

export type InteractionType =
  | 'LEARN_APP'
  | 'CHOOSE_PROTOCOL'
  | 'INSPECT_IP'
  | 'INSPECT_ETH'
  | 'QUIZ_ROUTER'
  | 'LEARN_TTL'
  | 'QUIZ_TCP_ERROR'
  | 'LEARN_UDP_DROP'
  | 'LEARN_DECAP'
  | 'SHOW_STATS';

interface SimState {
  // Core sim state
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

  // Interaction system
  interactionType: InteractionType | null;
  interactionBlocking: boolean;
  viewedFields: string[];       // field names opened during IP/Eth inspection
  quizWrongAnswer: string | null;

  // Stats
  startTime: number | null;
  routersCrossed: number;

  // Core actions
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

  // Interaction actions
  triggerInteraction: (t: InteractionType) => void;
  completeInteraction: () => void;
  viewField: (f: string) => void;
  setQuizWrongAnswer: (a: string | null) => void;
  incrementRoutersCrossed: () => void;
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

  interactionType: null,
  interactionBlocking: false,
  viewedFields: [],
  quizWrongAnswer: null,

  startTime: null,
  routersCrossed: 0,

  start: () => set({
    isRunning: true, isPaused: false, step: 'ENCAP_APP',
    cameraPreset: 'SOURCE', startTime: Date.now(),
    routersCrossed: 0, interactionType: null, interactionBlocking: false,
  }),
  pause: () => set((s) => ({ isPaused: !s.isPaused })),
  reset: () => set({
    step: 'IDLE', isRunning: false, isPaused: false,
    routingChoice: null, ttl: 64, currentRouter: '—',
    errorActive: false, ethernetDecapped: false, cameraPreset: 'OVERVIEW',
    interactionType: null, interactionBlocking: false,
    viewedFields: [], quizWrongAnswer: null,
    startTime: null, routersCrossed: 0,
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

  triggerInteraction: (interactionType) => set({
    interactionType, interactionBlocking: true,
    viewedFields: [], quizWrongAnswer: null,
  }),
  completeInteraction: () => set({ interactionType: null, interactionBlocking: false }),
  viewField: (f) => set((s) => ({
    viewedFields: s.viewedFields.includes(f) ? s.viewedFields : [...s.viewedFields, f],
  })),
  setQuizWrongAnswer: (quizWrongAnswer) => set({ quizWrongAnswer }),
  incrementRoutersCrossed: () => set((s) => ({ routersCrossed: s.routersCrossed + 1 })),
}));
