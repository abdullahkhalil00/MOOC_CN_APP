import { useEffect, useRef } from 'react';
import { useSimStore } from '../../store/simulationStore';
import { STEP_CONFIGS, NEXT_STEP } from '../../lib/stepConfig';

/**
 * Pure-logic component (no render output) that sits outside the Canvas.
 * Drives the simulation timeline: auto-advances steps, injects the
 * transmission error at the right moment, and triggers per-step side-effects.
 */
export function SimulationController() {
  const step        = useSimStore((s) => s.step);
  const isRunning   = useSimStore((s) => s.isRunning);
  const isPaused    = useSimStore((s) => s.isPaused);
  const speed       = useSimStore((s) => s.speed);
  const protocol    = useSimStore((s) => s.protocol);

  const setStep           = useSimStore((s) => s.setStep);
  const setCameraPreset   = useSimStore((s) => s.setCameraPreset);
  const decrementTtl      = useSimStore((s) => s.decrementTtl);
  const setCurrentRouter  = useSimStore((s) => s.setCurrentRouter);
  const setEthernetDecapped = useSimStore((s) => s.setEthernetDecapped);
  const setErrorActive    = useSimStore((s) => s.setErrorActive);

  // Fire per-step onEnter side-effects exactly once each time step changes
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

  // Error injection: flash error state partway through TRAVEL_TO_R1
  const errorInjectedRef = useRef(false);
  useEffect(() => {
    if (step !== 'TRAVEL_TO_R1' || !isRunning || isPaused) return;
    errorInjectedRef.current = false;
    const cfg = STEP_CONFIGS['TRAVEL_TO_R1'];
    if (!cfg) return;
    // Inject at 55% through the travel step
    const errorDelay = (cfg.duration * 0.55 * 1000) / speed;
    const timer = setTimeout(() => {
      setErrorActive(true);
      errorInjectedRef.current = true;
    }, errorDelay);
    return () => clearTimeout(timer);
  }, [step, isRunning, isPaused, speed, setErrorActive]);

  // Clear error state when leaving TRANSMISSION_ERROR
  useEffect(() => {
    if (step !== 'TRANSMISSION_ERROR') {
      setErrorActive(false);
    }
  }, [step, setErrorActive]);

  // Auto-advance logic
  useEffect(() => {
    if (!isRunning || isPaused) return;

    const cfg = STEP_CONFIGS[step];
    // duration 0 = manual step (IDLE, ROUTER2_DECISION, COMPLETE)
    if (!cfg || cfg.duration === 0) return;

    const next = NEXT_STEP[step];
    if (!next) return;

    const duration = (cfg.duration * 1000) / speed;
    const timer = setTimeout(() => setStep(next), duration);
    return () => clearTimeout(timer);
  }, [step, isRunning, isPaused, speed, setStep]);

  return null;
}
