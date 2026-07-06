import { useEffect, useState } from 'react';
import { Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { TransportProtocol } from '../../store/simulationStore';

interface TransmissionChallengeProps {
  position?: [number, number, number];
  protocol: TransportProtocol;
  onComplete: () => void;
}

const STEP_DELAY = 1600;

export function TransmissionChallenge({ position = [0, 0, 0], protocol, onComplete }: TransmissionChallengeProps) {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = protocol === 'TCP'
    ? [
        { label: 'Packet Lost', color: '#f87171' },
        { label: 'Automatic Retransmission', color: '#facc15' },
        { label: 'Packet Delivered', color: '#4ade80' },
      ]
    : [
        { label: 'Packet Lost', color: '#f87171' },
        { label: 'Packet Dropped', color: '#f87171' },
        { label: 'No Retransmission', color: '#94a3b8' },
      ];

  const explanation = protocol === 'TCP'
    ? 'TCP guarantees delivery. When a packet is lost, TCP detects the missing acknowledgement and automatically retransmits it until the server confirms receipt.'
    : 'UDP has no delivery guarantee. When a packet is lost, there is no acknowledgement system, so it is simply dropped and never resent — the receiving application never even knows it was sent.';

  useEffect(() => {
    if (stepIndex < steps.length - 1) {
      const t = setTimeout(() => setStepIndex((i) => i + 1), STEP_DELAY);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [stepIndex, steps.length]);

  return (
    <group position={position}>
      <Html transform distanceFactor={2.2} center zIndexRange={[90, 0]}>
        <div className="glass-panel rounded-2xl p-6 border-t border-white/20 w-[320px] text-center">
          <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-3">
            Simulated {protocol} Transmission
          </div>
          <div className="flex flex-col items-center gap-2 mb-4">
            {steps.slice(0, stepIndex + 1).map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-xs font-medium" style={{ color: s.color }}>{s.label}</span>
                {i < stepIndex && <span className="text-slate-500 mx-1">↓</span>}
              </motion.div>
            ))}
          </div>
          <AnimatePresence>
            {stepIndex === steps.length - 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                <p className="text-[11px] text-slate-300 leading-relaxed mb-4">{explanation}</p>
                <button
                  onClick={onComplete}
                  className="px-5 py-2 rounded-lg bg-cyan-600/30 border border-cyan-400 text-cyan-100 text-xs font-medium hover:bg-cyan-500/50 transition-colors"
                >
                  Finish Transport Layer
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Html>
    </group>
  );
}
