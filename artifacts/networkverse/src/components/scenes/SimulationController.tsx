import { useEffect, useRef } from 'react';
import { useSimStore, InteractionType, SimStep } from '../../store/simulationStore';
import { STEP_CONFIGS, NEXT_STEP } from '../../lib/stepConfig';

/** Steps that trigger an interaction panel on entry (protocol-agnostic). */
const STEP_INTERACTIONS: Partial<Record<SimStep, InteractionType>> = {
  ENCAP_APP:        'LEARN_APP',
  ENCAP_TRANSPORT:  'CHOOSE_PROTOCOL',
  ENCAP_INTERNET:   'INSPECT_IP',
  ENCAP_NETWORK:    'INSPECT_ETH',
  ROUTER1_ENTRY:    'QUIZ_ROUTER',
  ROUTER1_PROCESS:  'LEARN_TTL',
  // TRANSMISSION_ERROR is protocol-dependent — handled inline below
  DECAP_NETWORK:    'LEARN_DECAP',
  DECAP_INTERNET:   'LEARN_DECAP',
  DECAP_TRANSPORT:  'LEARN_DECAP',
  DECAP_APP:        'LEARN_DECAP',
};

export function SimulationController() {
  const step        = useSimStore((s) => s.step);
  const isRunning   = useSimStore((s) => s.isRunning);
  const isPaused    = useSimStore((s) => s.isPaused);
  const speed       = useSimStore((s) => s.speed);
  const protocol    = useSimStore((s) => s.protocol);
  const interactionBlocking = useSimStore((s) => s.interactionBlocking);

  const setStep              = useSimStore((s) => s.setStep);
  const setCameraPreset      = useSimStore((s) => s.setCameraPreset);
  const decrementTtl         = useSimStore((s) => s.decrementTtl);
  const setCurrentRouter     = useSimStore((s) => s.setCurrentRouter);
  const setEthernetDecapped  = useSimStore((s) => s.setEthernetDecapped);
  const setErrorActive       = useSimStore((s) => s.setErrorActive);
  const triggerInteraction   = useSimStore((s) => s.triggerInteraction);
  const incrementRoutersCrossed = useSimStore((s) => s.incrementRoutersCrossed);

  // Fire per-step onEnter side-effects once per step change
  useEffect(() => {
    const cfg = STEP_CONFIGS[step];
    if (!cfg?.onEnter) return;
    cfg.onEnter({ decrementTtl, setCurrentRouter, setEthernetDecapped, setErrorActive });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Update camera preset when step changes
  useEffect(() => {
    const cfg = STEP_CONFIGS[step];
    if (cfg) setCameraPreset(cfg.camera);
  }, [step, setCameraPreset]);

  // Trigger interactions at step entry
  useEffect(() => {
    if (!isRunning) return;

    if (step === 'TRANSMISSION_ERROR') {
      triggerInteraction(protocol === 'TCP' ? 'QUIZ_TCP_ERROR' : 'LEARN_UDP_DROP');
      return;
    }

    const interaction = STEP_INTERACTIONS[step];
    if (interaction) triggerInteraction(interaction);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, isRunning]);

  // Track routers crossed for final stats
  useEffect(() => {
    if (step === 'ROUTER1_ENTRY') incrementRoutersCrossed();
    if (step === 'TRAVEL_TO_R2') incrementRoutersCrossed();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Error injection partway through TRAVEL_TO_R1
  const errorInjectedRef = useRef(false);
  useEffect(() => {
    if (step !== 'TRAVEL_TO_R1' || !isRunning || isPaused) return;
    errorInjectedRef.current = false;
    const cfg = STEP_CONFIGS['TRAVEL_TO_R1'];
    if (!cfg) return;
    const errorDelay = (cfg.duration * 0.55 * 1000) / speed;
    const timer = setTimeout(() => {
      setErrorActive(true);
      errorInjectedRef.current = true;
    }, errorDelay);
    return () => clearTimeout(timer);
  }, [step, isRunning, isPaused, speed, setErrorActive]);

  // Clear error flag when leaving TRANSMISSION_ERROR
  useEffect(() => {
    if (step !== 'TRANSMISSION_ERROR') setErrorActive(false);
  }, [step, setErrorActive]);

  // Auto-advance — blocked by pause, user pause, or open interaction
  useEffect(() => {
    if (!isRunning || isPaused || interactionBlocking) return;

    const cfg = STEP_CONFIGS[step];
    if (!cfg || cfg.duration === 0) return;   // manual step

    const next = NEXT_STEP[step];
    if (!next) return;

    const duration = (cfg.duration * 1000) / speed;
    const timer = setTimeout(() => setStep(next), duration);
    return () => clearTimeout(timer);
  }, [step, isRunning, isPaused, interactionBlocking, speed, setStep]);

  return null;
}
