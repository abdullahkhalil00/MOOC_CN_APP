import { useState } from 'react';
import { Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizOptionDef } from '../../lib/protocolData';

interface QuizPanelProps {
  position?: [number, number, number];
  question: string;
  options: QuizOptionDef[];
  onCorrect: () => void;
}

export function QuizPanel({ position = [0, 0, 0], question, options, onCorrect }: QuizPanelProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [wrongFeedback, setWrongFeedback] = useState<string | null>(null);

  const handleSelect = (index: number) => {
    setSelected(index);
    const option = options[index];
    if (option.correct) {
      setWrongFeedback(null);
      setTimeout(onCorrect, 900);
    } else {
      setWrongFeedback(option.feedback || 'Not quite — try again.');
    }
  };

  return (
    <group position={position}>
      <Html transform distanceFactor={2.2} center zIndexRange={[90, 0]}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel rounded-2xl p-6 w-[320px] border-t border-white/20"
        >
          <h3 className="text-base font-semibold text-slate-100 mb-4">{question}</h3>
          <div className="space-y-2">
            {options.map((opt, i) => {
              const isSelectedWrong = selected === i && !opt.correct;
              const isSelectedRight = selected === i && opt.correct;
              return (
                <button
                  key={opt.label}
                  onClick={() => handleSelect(i)}
                  className={`w-full text-left px-3 py-2 rounded-lg border transition-colors text-xs font-medium ${
                    isSelectedRight
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                      : isSelectedWrong
                      ? 'border-rose-400 bg-rose-500/20 text-rose-200'
                      : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <AnimatePresence>
            {wrongFeedback && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 text-[11px] text-rose-300"
              >
                {wrongFeedback}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </Html>
    </group>
  );
}
