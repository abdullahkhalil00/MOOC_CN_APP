import { Html } from '@react-three/drei';
import { motion } from 'framer-motion';

interface ContinuePromptProps {
  text: string;
  buttonLabel?: string;
  onContinue: () => void;
}

export function ContinuePrompt({ text, buttonLabel = 'Continue', onContinue }: ContinuePromptProps) {
  return (
    <Html fullscreen zIndexRange={[80, 0]} pointerEvents="none">
      <div className="w-full h-full flex items-end justify-center pb-32 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl px-6 py-4 pointer-events-auto flex flex-col items-center gap-3 border-t border-white/20"
        >
          <p className="text-sm text-slate-200 text-center max-w-xs">{text}</p>
          <button
            onClick={onContinue}
            className="px-6 py-2 rounded-lg bg-cyan-600/30 border border-cyan-400 text-cyan-100 text-sm font-medium hover:bg-cyan-500/50 transition-colors"
          >
            {buttonLabel}
          </button>
        </motion.div>
      </div>
    </Html>
  );
}
